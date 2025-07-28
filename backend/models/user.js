// models/user.js
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true,
    default: 'general'
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }],
  bb_total: {
    type: Number,
    default: 150
  },
  bb_locked: {
    type: Number,
    default: 0
  },
  role: {  // ← Add this field
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  bets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bet'
  }]
}, { timestamps: true });

// Auth token
UserSchema.methods.generateAuthToken = async function () {
  const user = this;
  // In UserSchema.methods.generateAuthToken
  const token = jwt.sign(
    {
      userId: user._id,  // Not "sub"
      role: user.role,   // Key must be "role", not "admin"
      department: user.department
    },
    process.env.JWT_SECRET,
    { expiresIn: '45d' }
  );
  
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

export default mongoose.model('User', UserSchema);