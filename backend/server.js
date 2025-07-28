// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

// Import routes
import studentRoutes from "./routes/studentRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import betRoutes from "./routes/betRoutes.js";
import leaderboardRouter from "./routes/leaderboard.js";
import resultRoutes from "./routes/resultRoutes.js";

// Configure environment variables
dotenv.config();

// Initialize express app
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database connection function
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is not defined");
    }
    
    await mongoose.connect(process.env.MONGODB_URI, {
  dbName: 'bettingbaits'
});

    
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

// Configure CORS middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  exposedHeaders: ['x-auth-token'],
  credentials: true,
  maxAge: 86400
}));

// Register middleware
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Simple test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Register routes
app.use("/api/students", studentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/bet", betRoutes);
app.use("/api/leaderboard", leaderboardRouter);
app.use("/api/results", resultRoutes);

// Handle 404s
app.use((req, res, next) => {
  if (!req.route) {
    console.log(`Route not found: ${req.method} ${req.url}`);
    return res.status(404).json({ message: 'Route not found' });
  }
  next();
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    message: 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});

// Start server
const startServer = async () => {
  await connectDB();
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

// Database connection event listeners
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

// Check database collections on startup
mongoose.connection.once('open', () => {
  mongoose.connection.db.listCollections({ name: 'students' })
    .next((err, collInfo) => {
      if (err) throw err;
      console.log('Students collection exists:', !!collInfo);
      if (collInfo) {
        mongoose.connection.db.collection('students').countDocuments()
          .then(count => console.log(`${count} student records found`));
      }
    });
});

// Start the server
startServer();