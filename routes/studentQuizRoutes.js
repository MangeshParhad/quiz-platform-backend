import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { browseQuizzes, getQuizDetails } from '../controllers/studentQuizController.js';

const router = express.Router();

router.get('/', protect, browseQuizzes);
router.get('/:id', protect, getQuizDetails);

export default router;