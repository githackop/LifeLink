import express from 'express';
import {
  getStats,
  getUsers,
  getUserDetails,
  deleteUser,
  toggleUserBlock,
  getDonors,
  deleteDonor,
  getHospitals,
  toggleHospitalVerify,
  toggleHospitalBlock,
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.get('/users/:id', getUserDetails);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/block', toggleUserBlock);
router.get('/donors', getDonors);
router.delete('/donors/:id', deleteDonor);
router.get('/hospitals', getHospitals);
router.patch('/hospitals/:id/verify', toggleHospitalVerify);
router.patch('/hospitals/:id/block', toggleHospitalBlock);

export default router;
