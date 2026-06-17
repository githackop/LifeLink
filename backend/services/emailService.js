import nodemailer from 'nodemailer';

const createTransporter = () => {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

export const sendPasswordResetEmail = async (email, resetUrl) => {
  const transporter = createTransporter();
  const from = process.env.EMAIL_FROM || 'LifeLink <noreply@lifelink.app>';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">LifeLink Password Reset</h2>
      <p>You requested a password reset. Click the button below to set a new password. This link expires in 10 minutes.</p>
      <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">Reset Password</a>
      <p style="color: #6b7280; font-size: 14px;">If you did not request this, you can safely ignore this email.</p>
      <p style="color: #9ca3af; font-size: 12px; word-break: break-all;">${resetUrl}</p>
    </div>
  `;

  if (!transporter) {
    console.log('[LifeLink] Password reset link (configure EMAIL_* to send mail):');
    console.log(resetUrl);
    return;
  }

  await transporter.sendMail({
    from,
    to: email,
    subject: 'LifeLink – Reset your password',
    html,
  });
};

export const sendOtpEmail = async (email, otp) => {
  const transporter = createTransporter();
  const from = process.env.EMAIL_FROM || 'LifeLink <noreply@lifelink.app>';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
      <h2 style="color: #dc2626; margin-bottom: 16px;">LifeLink Security Verification</h2>
      <p style="font-size: 16px; color: #334155;">You are attempting a sensitive action on your LifeLink account: changing your password.</p>
      <p style="font-size: 16px; color: #334155;">Please use the following One-Time Password (OTP) to verify this action. This OTP is valid for <strong>10 minutes</strong> and is for single use only.</p>
      <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 16px; text-align: center; margin: 24px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #dc2626;">${otp}</span>
      </div>
      <p style="color: #64748b; font-size: 14px;">If you did not request this verification, please secure your account immediately.</p>
    </div>
  `;

  if (!transporter) {
    console.log('[LifeLink] OTP (configure EMAIL_* to send mail):');
    console.log(`Email: ${email}, OTP: ${otp}`);
    return;
  }

  await transporter.sendMail({
    from,
    to: email,
    subject: `LifeLink Verification Code: ${otp}`,
    html,
  });
};

export const sendRegistrationOtpEmail = async (email, otp) => {
  const transporter = createTransporter();
  const from = process.env.EMAIL_FROM || 'LifeLink <noreply@lifelink.app>';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
      <h2 style="color: #dc2626; margin-bottom: 16px;">Welcome to LifeLink!</h2>
      <p style="font-size: 16px; color: #334155;">Thank you for registering. Please verify your email address to activate your account.</p>
      <p style="font-size: 16px; color: #334155;">Use the following One-Time Password (OTP) to complete your registration. This code is valid for <strong>10 minutes</strong>.</p>
      <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 16px; text-align: center; margin: 24px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #dc2626;">${otp}</span>
      </div>
      <p style="color: #64748b; font-size: 14px;">If you did not create a LifeLink account, please ignore this email.</p>
    </div>
  `;

  if (!transporter) {
    console.log('[LifeLink] Registration OTP (configure EMAIL_* to send mail):');
    console.log(`Email: ${email}, OTP: ${otp}`);
    return;
  }

  await transporter.sendMail({
    from,
    to: email,
    subject: `Verify your LifeLink account: ${otp}`,
    html,
  });
};


