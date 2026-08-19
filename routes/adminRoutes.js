import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import {
  getDashboardStats,
  getAllStudents,
  updateStudentStatus,
  getAnalytics,
  updateStudent,
  resetStudentPassword, 
  deleteStudent,
} from '../controllers/adminController.js';

const router = express.Router();

router.get('/dashboard-stats', protect, adminOnly, getDashboardStats);
router.get('/students', protect, adminOnly, getAllStudents);
router.patch('/students/:id/status', protect, adminOnly, updateStudentStatus);
router.get('/analytics', protect, adminOnly, getAnalytics);
router.put('/students/:id', protect, adminOnly, updateStudent);
router.patch('/students/:id/password', protect, adminOnly, resetStudentPassword);
router.delete('/students/:id', protect, adminOnly, deleteStudent);

export default router;