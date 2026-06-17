import express from 'express';
import {
  getHospitalDonors,
  addManualHospitalDonor,
  updateHospitalDonor,
  deleteHospitalDonor,
} from '../controllers/hospitalDonorController.js';

import { protect, isVerifiedHospital } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', protect, isVerifiedHospital, authorize('hospital'), getHospitalDonors);

router.post(
  '/manual',
  protect,
  isVerifiedHospital,
  authorize('hospital'),
  addManualHospitalDonor
);

router.put(
  '/:id',
  protect,
  isVerifiedHospital,
  authorize('hospital'),
  updateHospitalDonor
);

router.delete(
  '/:id',
  protect,
  isVerifiedHospital,
  authorize('hospital'),
  deleteHospitalDonor
);

export default router;