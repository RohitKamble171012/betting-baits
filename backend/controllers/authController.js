// authController.js
import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  const { email, password, department } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ 
      email, 
      password: hashedPassword,
      department,
      bb_total: 150,
      bb_locked: 0
    });
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ token, user: { id: user._id, bb_total: user.bb_total } });
  } catch (error) {
    res.status(500).json({ message: "Signup error", error: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "45d" });
    res.status(200).json({ 
      token,
      user: {
        id: user._id,
        email: user.email,
        bb_total: user.bb_total,
        department: user.department
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Login error", error: error.message });
  }
};