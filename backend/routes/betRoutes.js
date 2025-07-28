// betRoutes.js
import express from 'express';
import Bet from '../models/bet.js';
import User from '../models/user.js';
import Student from '../models/student.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.use(auth);

router.post("/place", async (req, res) => {
  try {
    const { studentId, amount } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const availableBalance = user.bb_total - user.bb_locked;
    if (availableBalance < amount) {
      return res.status(400).json({ message: "Insufficient BB balance" });
    }

    const newBet = new Bet({
      user: userId,
      student: studentId,
      amount,
      status: 'pending'
    });

    user.bb_locked += amount;
    user.bets.push(newBet._id);

    await Promise.all([newBet.save(), user.save()]);

    res.status(201).json({
      message: "Bet placed successfully",
      bet: newBet,
      balance: {
        total: user.bb_total,
        locked: user.bb_locked,
        available: user.bb_total - user.bb_locked
      }
    });
  } catch (err) {
    console.error("Bet error:", err);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

//  Total BB in the market (all bets combined)
router.get('/market-total', async (req, res) => {
  try {
    const totalBB = await Bet.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    res.json({
      totalBB: totalBB.length > 0 ? totalBB[0].total : 0
    });
  } catch (err) {
    console.error("Market total error:", err.message);
    res.status(500).json({ message: 'Server error fetching market total' });
  }
});

//  Get user's wallet status
router.get('/wallet', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('bb_total bb_locked');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      total: user.bb_total,
      locked: user.bb_locked,
      available: user.bb_total - user.bb_locked
    });
  } catch (err) {
    console.error("Wallet fetch error:", err.message);
    res.status(500).json({ message: 'Server error fetching wallet' });
  }
});

//  Get user's full bet history
router.get('/my-bets', async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'bets',
        populate: {
          path: 'student',
          model: Student, // Use imported model
          select: ['Student Name']
        }
      });

    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json({ 
      bets: user.bets.map(bet => ({
        _id: bet._id,
        student: bet.student ? {
          _id: bet.student._id,
          name: bet.student['Student Name']
        } : null,
        amount: bet.amount,
        status: bet.status
      }))
    });
  } catch (err) {
    console.error("Bet history error:", err);
    res.status(500).json({ message: 'Server error fetching bet history' });
  }
});

export default router;
