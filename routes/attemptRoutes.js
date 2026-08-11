import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  startQuiz,
  getQuizQuestionsForAttempt,
  submitQuiz,
  getAttemptResult,
  getAttemptReview,
  getMyAttempts,
} from '../controllers/attemptController.js';

const router = express.Router();

router.post('/start/:quizId', protect, startQuiz);
router.get('/:attemptId/questions', protect, getQuizQuestionsForAttempt);
router.post('/:attemptId/submit', protect, submitQuiz);
router.get('/:attemptId/result', protect, getAttemptResult);
router.get('/:attemptId/review', protect, getAttemptReview);
router.get('/', protect, getMyAttempts);

export default router;