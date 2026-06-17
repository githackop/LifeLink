import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { sendOtpEmail } from '../services/emailService.js';
import { emitAdminUpdate } from '../sockets/socketManager.js';

// PUT /api/profile
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, phoneNumber, city, address, bloodGroup, hospitalName } = req.body;

  if (email && email.toLowerCase() !== req.user.email.toLowerCase()) {
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      throw new AppError('Email already in use', 400);
    }
  }

  if (phoneNumber && phoneNumber !== req.user.phoneNumber) {
    const existingPhone = await User.findOne({ phoneNumber });
    if (existingPhone) {
      throw new AppError('Phone number already in use', 400);
    }
  }

  // Update allowed fields
  if (name !== undefined) req.user.name = name;
  if (email !== undefined) req.user.email = email.toLowerCase();
  if (phoneNumber !== undefined) req.user.phoneNumber = phoneNumber;
  if (city !== undefined) req.user.city = city;
  if (address !== undefined) req.user.address = address;

  if (req.user.role === 'donor') {
    if (bloodGroup !== undefined) req.user.bloodGroup = bloodGroup;
  }

  if (req.user.role === 'hospital') {
    if (hospitalName !== undefined) req.user.hospitalName = hospitalName;
  }

  const updatedUser = await req.user.save();

  // Notify socket clients of update
  emitAdminUpdate({
    action: 'user_updated',
    targetUserId: updatedUser._id.toString(),
    user: updatedUser.toPublicJSON(),
    createdAt: new Date().toISOString(),
  });

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user: updatedUser.toPublicJSON(),
  });
});

// POST /api/profile/send-password-otp
export const sendPasswordOtp = asyncHandler(async (req, res) => {
  const user = req.user;

  // Generate 6-digit numeric OTP code
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Set expiration in 10 minutes
  user.passwordChangeOtp = otp;
  user.passwordChangeOtpExpire = new Date(Date.now() + 10 * 60 * 1000);
  user.passwordChangeOtpVerified = false;

  await user.save({ validateBeforeSave: false });

  // Send verification email
  await sendOtpEmail(user.email, otp);

  res.status(200).json({
    success: true,
    message: 'OTP sent successfully to your registered email',
  });
});

// POST /api/profile/verify-password-otp
export const verifyPasswordOtp = asyncHandler(async (req, res) => {
  const { otp } = req.body;
  const user = req.user;

  if (!otp) {
    throw new AppError('Please provide the verification OTP', 400);
  }

  if (
    !user.passwordChangeOtp ||
    user.passwordChangeOtp !== otp ||
    new Date() > new Date(user.passwordChangeOtpExpire)
  ) {
    throw new AppError('Invalid or expired OTP', 400);
  }

  user.passwordChangeOtpVerified = true;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: 'OTP verified successfully. You can now change your password.',
  });
});

// PATCH /api/profile/change-password
export const changePassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;
  const user = req.user;

  // 1. Check if OTP is verified
  if (!user.passwordChangeOtpVerified) {
    throw new AppError('Verification required. Please verify the OTP first.', 400);
  }

  // 2. Validate fields
  if (!newPassword) {
    throw new AppError('Please provide the new password', 400);
  }

  // 3. Fetch user record with password support
  const userWithPassword = await User.findById(user._id).select('+password');


  // 4. Validate password complexity rules
  const minLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

  if (!minLength || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
    throw new AppError('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.', 400);
  }

  // 5. Update password and clear OTP states
  userWithPassword.password = newPassword;
  userWithPassword.passwordChangeOtp = undefined;
  userWithPassword.passwordChangeOtpExpire = undefined;
  userWithPassword.passwordChangeOtpVerified = false;

  await userWithPassword.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
  });
});

// POST /api/profile/deactivate
export const deactivateAccount = asyncHandler(async (req, res) => {
  const user = req.user;

  // Deactivate account
  user.isDeactivated = true;
  await user.save({ validateBeforeSave: false });

  emitAdminUpdate({
    action: 'user_deactivated',
    targetUserId: user._id.toString(),
    user: user.toPublicJSON(),
    createdAt: new Date().toISOString(),
  });

  res.status(200).json({
    success: true,
    message: 'Your account has been deactivated successfully.',
  });
});

// DELETE /api/profile
export const deleteAccount = asyncHandler(async (req, res) => {
  const user = req.user;
  const snapshot = user.toPublicJSON();

  await User.deleteOne({ _id: user._id });

  emitAdminUpdate({
    action: 'user_deleted',
    targetUserId: user._id.toString(),
    user: snapshot,
    createdAt: new Date().toISOString(),
  });

  res.status(200).json({
    success: true,
    message: 'Your account has been deleted successfully.',
  });
});
