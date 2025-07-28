// authRoutes.js
import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import rateLimit from 'express-rate-limit';
import auth from '../middleware/auth.js';

const router = express.Router();

// Admin credentials (move to top)
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'Ad@0000000012';

// Rate limiter configuration
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per windowMs
  message: 'Too many login attempts, please try again later'
});

// Signup Route with password requirements
router.post('/signup', async (req, res) => {
  try {
    // Basic validations
    if (!req.body.username || !req.body.password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Check existing user
    const existingUser = await User.findOne({ username: req.body.username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Create new user (validation handled by schema)
    const user = new User({
      username: req.body.username,
      password: req.body.password, // Plain text (not recommended for production)
      department: req.body.department || 'general',
      bb_total: 150,
      bb_locked: 0
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      user: {
        id: user._id,
        username: user.username,
        department: user.department,
        bb_total: user.bb_total
      },
      token
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login Route
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Direct password comparison (not secure - use bcrypt in production)
    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        bb_total: user.bb_total
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Current User Endpoint
router.get('/me', auth, async (req, res) => { // Add auth middleware here
  try {
    res.json({
      ...req.user.toObject(),
      isAdmin: req.user.username === ADMIN_USERNAME
    });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin Login (for testing only)
router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const token = jwt.sign(
        { userId: 'admin-id', isAdmin: true },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      return res.json({
        token,
        user: {
          username: ADMIN_USERNAME,
          isAdmin: true,
          bb_total: 999999
        }
      });
    }

    res.status(401).json({ message: 'Invalid admin credentials' });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ message: 'Server error during admin login' });
  }
});

export default router;