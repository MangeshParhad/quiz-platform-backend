import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import {
  getQuestionsForQuiz,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from '../controllers/questionController.js';

const router = express.Router();

router.get('/quiz/:quizId', protect, getQuestionsForQuiz);
router.post('/quiz/:quizId', protect, adminOnly, createQuestion);
router.put('/:id', protect, adminOnly, updateQuestion);
router.delete('/:id', protect, adminOnly, deleteQuestion);

export default router;