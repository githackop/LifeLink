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
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/create', protect, authorize('user', 'hospital'), createRequest);
router.get('/broadcasts', protect, getBroadcastRequests);
router.post('/:id/volunteer', protect, authorize('donor'), volunteerForRequest);
router.post('/:id/hospital-respond', protect, authorize('hospital'), respondToBroadcastRequest);
router.get('/history', protect, authorize('donor'), getDonationHistory);
router.get('/stats', protect, authorize('user', 'donor', 'hospital'), getRequestStats);
router.get('/emergency', protect, authorize('hospital'), getEmergencyRequests);
router.get('/received', protect, authorize('donor'), getReceivedRequests);
router.get('/sent', protect, authorize('user', 'hospital'), getSentRequests);
router.patch('/:id/status', protect, authorize('donor'), updateRequestStatus);
// ✅ NEW: Phase 1 completion endpoint
router.patch('/:id/complete', protect, authorize('donor'), completeRequest);
export default router;