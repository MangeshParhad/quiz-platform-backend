import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getOverallLeaderboard, getCategoryLeaderboard } from '../controllers/leaderboardController.js';

const router = express.Router();

router.get('/', protect, getOverallLeaderboard);
router.get('/category/:categoryId', protect, getCategoryLeaderboard);

export default router;