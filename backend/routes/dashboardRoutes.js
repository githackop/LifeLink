import express from 'express';
import {
  getUserDashboard,
  getDonorDashboard,
  getHospitalDashboard,
  getAdminDashboard,
} from '../controllers/dashboardController.js';
import { protect, isVerifiedHospital } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/user', protect, authorize('user'), getUserDashboard);
router.get('/donor', protect, authorize('donor'), getDonorDashboard);
router.get('/hospital', protect, isVerifiedHospital, authorize('hospital'), getHospitalDashboard);
router.get('/admin', protect, authorize('admin'), getAdminDashboard);

export default router;
