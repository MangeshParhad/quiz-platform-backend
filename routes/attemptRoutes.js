import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { startQuiz, getQuizQuestionsForAttempt, submitQuiz } from '../controllers/attemptController.js';

const router = express.Router();

router.post('/start/:quizId', protect, startQuiz);
router.get('/:attemptId/questions', protect, getQuizQuestionsForAttempt);
router.post('/:attemptId/submit', protect, submitQuiz);

export default router;