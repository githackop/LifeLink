import express from 'express';
import { closeBroadcastRequest } from '../controllers/requestController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.patch('/:id/close', protect, closeBroadcastRequest);

export default router;
