// betController.js
import Bet from '../models/bet.js';
import User from '../models/user.js';
import Student from '../models/student.js';

export const placeBet = async (req, res) => {
  try {
    const { studentId, amount, betType } = req.body;
    const userId = req.user.userId;

    // Fetch user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const available = user.bb_total - user.bb_locked;
    if (available < amount) {
      return res.status(400).json({ error: 'Insufficient available balance' });
    }

    // Validate student department for private bets
    if (betType === 'private') {
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
      if (student.Department !== user.department) {
        return res.status(403).json({ error: 'Not allowed to bet outside your department' });
      }
    }

    // Create and save bet
    const bet = new Bet({
      user: userId,
      student: studentId,
      amount,
      betType,
      status: 'pending'
    });

    // Update user locked balance
    user.bb_locked += amount;
    await user.save();
    await bet.save();

    res.status(201).json({
      message: 'Bet placed successfully',
      bet,
      balance: {
        total: user.bb_total,
        locked: user.bb_locked,
        available: user.bb_total - user.bb_locked
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};