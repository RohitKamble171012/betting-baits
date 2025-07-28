// models/student.js
import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  "Student Name": {
    type: String,
    required: [true, 'Student Name is required'],
    trim: true,
    minLength: [2, 'Name must be at least 2 characters']
  },
  Department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true,
    minLength: [2, 'Department must be at least 2 characters']
  },
  Marks: {
    type: Number,
    required: [true, 'Marks are required'],
    min: [0, 'Marks cannot be negative'],
    max: [100, 'Marks cannot exceed 100']
  },
  placementStatus: {
    type: String,
    enum: ['not_started', 'in_process', 'placed', 'rejected'],
    default: 'not_started'
  },
  roundsCleared: {
    type: Number,
    default: 0
  },
  totalRounds: {
    type: Number,
    default: 5 // Example: Aptitude, Technical, HR, Final
  },
  rewardDistributed: {
    type: Boolean,
    default: false
  },
  lastCompany: String
});

export default mongoose.model('Student', studentSchema);

