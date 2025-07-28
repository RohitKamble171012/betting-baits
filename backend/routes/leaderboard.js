// leaderboardRoutes.js (note the file name is different from what was provided)
import express from 'express';
import User from '../models/user.js';

const router = express.Router();

// Get leaderboard data
router.get('/', async (req, res) => {
  try {
    const leaderboard = await User.aggregate([
      {
        $sort: { bb_total: -1 }
      },
      {
        $limit: 50
      },
      {
        $project: {
          _id: 0,
          username: 1,
          department: 1,
          bb_total: 1
        }
      }
    ]);

    res.json(leaderboard);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
