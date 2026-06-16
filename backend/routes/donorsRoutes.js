import express from 'express';
import { searchDonors, getAllDonors } from '../controllers/donorSearchController.js';
import { protect, isVerifiedHospital } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/search', protect, isVerifiedHospital, authorize('user', 'hospital'), searchDonors);
router.get('/all', protect, isVerifiedHospital, authorize('hospital'), getAllDonors);

export default router;
