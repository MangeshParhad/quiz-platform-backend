import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { startQuiz, getQuizQuestionsForAttempt } from '../controllers/attemptController.js';

const router = express.Router();

router.post('/start/:quizId', protect, startQuiz);
router.get('/:attemptId/questions', protect, getQuizQuestionsForAttempt);

export default router;