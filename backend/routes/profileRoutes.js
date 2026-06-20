import express from 'express';
import {
  updateProfile,
  changePassword,
  deactivateAccount,
  deleteAccount,
} from '../controllers/profileController.js';

const router = express.Router();

router.put('/', updateProfile);
router.patch('/change-password', changePassword);
router.post('/deactivate', deactivateAccount);
router.delete('/', deleteAccount);

export default router;
