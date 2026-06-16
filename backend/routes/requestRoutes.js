import express from 'express';
import {
  createRequest,
  getReceivedRequests,
  getSentRequests,
  getDonationHistory,
  getRequestStats,
  getEmergencyRequests,
  updateRequestStatus,
  completeRequest,
  getBroadcastRequests,
  volunteerForRequest,
  respondToBroadcastRequest,
} from '../controllers/requestController.js';
import { protect, isVerifiedHospital } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/create', protect, isVerifiedHospital, authorize('user', 'hospital'), createRequest);
router.get('/broadcasts', protect, getBroadcastRequests);
router.post('/:id/volunteer', protect, authorize('donor'), volunteerForRequest);
router.post('/:id/hospital-respond', protect, isVerifiedHospital, authorize('hospital'), respondToBroadcastRequest);
router.get('/history', protect, authorize('donor'), getDonationHistory);
router.get('/stats', protect, isVerifiedHospital, authorize('user', 'donor', 'hospital'), getRequestStats);
router.get('/emergency', protect, isVerifiedHospital, authorize('hospital'), getEmergencyRequests);
router.get('/received', protect, authorize('donor'), getReceivedRequests);
router.get('/sent', protect, isVerifiedHospital, authorize('user', 'hospital'), getSentRequests);
router.patch('/:id/status', protect, authorize('donor'), updateRequestStatus);
// ✅ NEW: Phase 1 completion endpoint
router.patch('/:id/complete', protect, authorize('donor'), completeRequest);
export default router;