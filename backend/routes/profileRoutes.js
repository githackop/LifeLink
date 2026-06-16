import express from 'express';
import {
  updateProfile,
  sendPasswordOtp,
  verifyPasswordOtp,
  changePassword,
  deactivateAccount,
  deleteAccount,
} from '../controllers/profileController.js';

const router = express.Router();

router.put('/', updateProfile);
router.post('/send-password-otp', sendPasswordOtp);
router.post('/verify-password-otp', verifyPasswordOtp);
router.patch('/change-password', changePassword);
router.post('/deactivate', deactivateAccount);
router.delete('/', deleteAccount);

export default router;
