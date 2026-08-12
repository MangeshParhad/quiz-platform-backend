import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getStudentDashboardStats } from '../controllers/studentDashboardController.js';

const router = express.Router();

router.get('/stats', protect, getStudentDashboardStats);

export default router;