import crypto from 'crypto';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { sendTokenResponse } from '../utils/generateToken.js';
import { sendPasswordResetEmail, sendRegistrationOtpEmail } from '../services/emailService.js';
import { emitAdminUpdate } from '../sockets/socketManager.js';

const buildUserPayload = (body) => {
  const {
    name,
    email,
    password,
    role,
    phoneNumber,
    bloodGroup,
    city,
    availability,
    hospitalName,
    licenseNumber,
    address,
  } = body;

  const payload = {
    name,
    email,
    password,
    role,
    phoneNumber,
  };

  if (role === 'donor') {
    payload.bloodGroup = bloodGroup;
    payload.city = city;
    payload.availability = availability !== undefined ? Boolean(availability) : true;
  }

  if (role === 'hospital') {
    payload.hospitalName = hospitalName;
    payload.licenseNumber = licenseNumber;
    payload.address = address;
    payload.city = city;
  }

  if (role === 'user' && city) {
    payload.city = city;
  }

  return payload;
};

export const register = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new AppError('An account with this email already exists', 400);
  }

  // Validate password strength criteria
  const minLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  if (!minLength || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
    throw new AppError('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.', 400);
  }

  const userPayload = buildUserPayload(req.body);
  userPayload.isVerified = false;
  userPayload.isHospitalVerified = false;

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  userPayload.emailVerificationOTP = otp;
  userPayload.emailVerificationOTPExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  const user = await User.create(userPayload);

  // Send verification email
  await sendRegistrationOtpEmail(user.email, otp);

  // Determine administrative notification action
  let action = 'user_registered';
  if (user.role === 'donor') {
    action = 'donor_registered';
  } else if (user.role === 'hospital') {
    action = 'hospital_registered';
  }

  emitAdminUpdate({
    action,
    targetUserId: user._id.toString(),
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      city: user.city,
      bloodGroup: user.bloodGroup,
      hospitalName: user.hospitalName,
      licenseNumber: user.licenseNumber,
    },
    createdAt: user.createdAt || new Date().toISOString(),
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful! Verification OTP code sent to your registered email.',
    email: user.email,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Please enter your email and password.', 400);
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user) {
    throw new AppError('No account found with this email.', 404);
  }

  if (!(await user.matchPassword(password))) {
    throw new AppError('Incorrect password. Please try again.', 401);
  }

  if (user.isBlocked) {
    throw new AppError('Your account has been temporarily blocked. Contact support.', 403);
  }

  if (!user.isVerified) {
    throw new AppError('Please verify your email before logging in.', 403);
  }

  if (user.role === 'hospital' && !user.isHospitalVerified) {
    throw new AppError('Your hospital account is awaiting admin approval.', 403);
  }

  if (user.isDeactivated) {
    user.isDeactivated = false;
    await user.save();
    emitAdminUpdate({
      action: 'user_reactivated',
      targetUserId: user._id.toString(),
      user: user.toPublicJSON(),
      createdAt: new Date().toISOString(),
    });
  }

  sendTokenResponse(user, 200, res);
});

export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user.toPublicJSON(),
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email.toLowerCase() });

  if (!user) {
    return res.status(200).json({
      success: true,
      message: 'If an account exists with that email, a reset link has been sent.',
    });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  try {
    await sendPasswordResetEmail(user.email, resetUrl);
  } catch {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    throw new AppError('Email could not be sent. Please try again later.', 500);
  }

  res.status(200).json({
    success: true,
    message: 'If an account exists with that email, a reset link has been sent.',
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  }).select('+password');

  if (!user) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// POST /api/auth/send-verification-otp
export const sendVerificationOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new AppError('Please provide an email address', 400);
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.isVerified) {
    throw new AppError('This account is already verified', 400);
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.emailVerificationOTP = otp;
  user.emailVerificationOTPExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  await user.save({ validateBeforeSave: false });

  await sendRegistrationOtpEmail(user.email, otp);

  res.status(200).json({
    success: true,
    message: 'Verification OTP sent successfully to your registered email',
  });
});

// POST /api/auth/verify-email-otp
export const verifyEmailOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    throw new AppError('Please provide both email and OTP', 400);
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.isVerified) {
    throw new AppError('This account is already verified', 400);
  }

  if (
    !user.emailVerificationOTP ||
    user.emailVerificationOTP !== otp ||
    new Date() > new Date(user.emailVerificationOTPExpires)
  ) {
    throw new AppError('Invalid or expired OTP', 400);
  }

  // Clear OTP fields upon verification success
  user.isVerified = true;
  user.emailVerificationOTP = undefined;
  user.emailVerificationOTPExpires = undefined;
  await user.save({ validateBeforeSave: false });

  // Generate JWT response to log user in automatically upon validation
  sendTokenResponse(user, 200, res);
});

// POST /api/auth/resend-verification-otp
export const resendVerificationOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new AppError('Please provide an email address', 400);
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.isVerified) {
    throw new AppError('This account is already verified', 400);
  }

  // Enforce 60-second cooldown rate limit
  if (user.emailVerificationOTPExpires) {
    const elapsedMs = 10 * 60 * 1000 - (new Date(user.emailVerificationOTPExpires) - Date.now());
    if (elapsedMs < 60 * 1000) {
      throw new AppError('Please wait 60 seconds before requesting a new OTP', 429);
    }
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.emailVerificationOTP = otp;
  user.emailVerificationOTPExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  await user.save({ validateBeforeSave: false });

  await sendRegistrationOtpEmail(user.email, otp);

  res.status(200).json({
    success: true,
    message: 'Verification OTP code resent successfully to your registered email',
  });
});

