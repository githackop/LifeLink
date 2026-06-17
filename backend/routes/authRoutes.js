import express from 'express';
import {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  sendVerificationOtp,
  verifyEmailOtp,
  resendVerificationOtp,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
} from '../middleware/validateAuth.js';

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', protect, getMe);
router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.put('/reset-password/:resetToken', validateResetPassword, resetPassword);

router.post('/send-verification-otp', sendVerificationOtp);
router.post('/verify-email-otp', verifyEmailOtp);
router.post('/resend-verification-otp', resendVerificationOtp);

export default router;
