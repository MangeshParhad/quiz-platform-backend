import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { getDashboardStats, getAllStudents, updateStudentStatus } from '../controllers/adminController.js';

const router = express.Router();

router.get('/dashboard-stats', protect, adminOnly, getDashboardStats);
router.get('/students', protect, adminOnly, getAllStudents);
router.patch('/students/:id/status', protect, adminOnly, updateStudentStatus);

export default router;