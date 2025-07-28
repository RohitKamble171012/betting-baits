//resultcontroller.js
import mongoose from 'mongoose';
import Student from '../models/student.js';
import Bet from '../models/bet.js';

export const distributeRewards = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      const students = await Student.find({
        placementStatus: { $in: ['placed', 'rejected'] },
        rewardDistributed: false
      }).session(session);

      if (students.length === 0) {
        return res.status(200).json({ message: 'No students to process' });
      }

      let processedBets = 0;
      
      for (const student of students) {
        const bets = await Bet.find({ 
          student: student._id,
          status: 'pending'
        }).populate('user').session(session);

        for (const bet of bets) {
          if (!bet.user) continue;
          
          const reward = Math.floor(
            bet.amount * (0.5 + (student.roundsCleared / student.totalRounds))
          );
          
          bet.user.bb_locked -= bet.amount;
          bet.user.bb_total += reward;
          await bet.user.save({ session });
          
          bet.status = 'completed';
          bet.finalAmount = reward;
          await bet.save({ session });
          
          processedBets++;
        }
        
        student.rewardDistributed = true;
        await student.save({ session });
      }
      
      res.json({ message: `Processed ${processedBets} bets` });
    });
  } catch (err) {
    // Add detailed error logging
    console.error('Transaction Error:', err.message);
    res.status(500).json({ 
      error: 'Distribution failed',
      details: err.message // Send error details to frontend
    });
  } finally {
    session.endSession();
  }
};