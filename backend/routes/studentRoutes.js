// studentRoutes.js
import express from 'express';
import Student from '../models/student.js';
import Bet from '../models/bet.js';
import User from '../models/user.js';
import auth from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import adminCheck from '../middleware/adminCheck.js';
import { 
  getAllStudents,
  getDepartmentStudents,
  uploadStudents
} from '../controllers/studentController.js';

const router = express.Router();

router.use(auth);

// Create student route
router.post('/', 
  auth,         // Authentication check
  adminCheck,   // Admin authorization check
  async (req, res) => {
    try {
      const student = new Student(req.body);
      await student.save();
      res.status(201).json(student);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Add progress update route
router.patch('/update-progress/:id', async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    // Update progress fields
    const updates = {};
    if (req.body.currentRound) updates.currentRound = req.body.currentRound;
    if (req.body.placementStatus) {
      updates.placementStatus = req.body.placementStatus;
    }
    if (req.body.totalRounds) updates.totalRounds = req.body.totalRounds;
    if (req.body.lastCompany) updates.lastCompany = req.body.lastCompany;

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    // Automatically resolve bets when placement is finalized
    if (['placed', 'rejected'].includes(req.body.placementStatus)) {
      await resolveBets(req.params.id);
    }

    res.json(updatedStudent);
  } catch (error) {
    console.error('Progress update error:', error);
    res.status(500).json({ 
      error: 'Server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Bet resolution logic
async function resolveBets(studentId) {
  try {
    const student = await Student.findById(studentId);
    const pendingBets = await Bet.find({ 
      student: studentId,
      status: 'pending'
    }).populate('user');

    for (const bet of pendingBets) {
      // Calculate payout
      const baseReturn = bet.amount * 0.5;
      const progressBonus = student.currentRound >= student.totalRounds 
        ? bet.amount * 0.5 
        : (bet.amount) * (student.currentRound / student.totalRounds);
      
      const totalPayout = baseReturn + progressBonus;

      // Update user balance
      const user = await User.findById(bet.user._id);
      user.bb_locked -= bet.amount;
      user.bb_total += student.placementStatus === 'placed' ? totalPayout : baseReturn;
      
      // Update bet status
      bet.status = student.placementStatus === 'placed' ? 'success' : 'failed';
      bet.payout = student.placementStatus === 'placed' ? totalPayout : baseReturn;
      
      await Promise.all([user.save(), bet.save()]);
    }
  } catch (error) {
    console.error('Bet resolution error:', error);
  }
}

// Existing routes below (keep them as-is)
router.get('/all', async (req, res) => {
  try {
    await getAllStudents(req, res);
    console.log(`Fetched all students by admin ${req.user.id}`);
  } catch (error) {
    console.error('Student route error:', error);
    res.status(500).json({ 
      error: 'Server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/my-department', async (req, res) => {
  try {
    await getDepartmentStudents(req, res);
    console.log(`Department students fetched by ${req.user.id}`);
  } catch (error) {
    console.error('Department error:', error);
    res.status(500).json({ 
      error: 'Server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.post('/upload', 
  (req, res, next) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin required' });
    next();
  },
  upload.single('file'),
  (err, req, res, next) => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  },
  async (req, res) => {
    try {
      await uploadStudents(req, res);
      console.log(`Students uploaded by admin ${req.user.id}`);
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'File processing failed' });
    }
  }
);

export default router;