import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import {
  createQuiz,
  getAllQuizzesAdmin,
  updateQuiz,
  deleteQuiz,
  updateQuizStatus,
} from '../controllers/quizController.js';

const router = express.Router();

router.get('/', protect, adminOnly, getAllQuizzesAdmin);
router.post('/', protect, adminOnly, createQuiz);
router.put('/:id', protect, adminOnly, updateQuiz);
router.delete('/:id', protect, adminOnly, deleteQuiz);
router.patch('/:id/status', protect, adminOnly, updateQuizStatus);

export default router;