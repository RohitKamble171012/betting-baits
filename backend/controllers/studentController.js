// studentController.js
import Student from '../models/student.js';
import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const unlinkAsync = promisify(fs.unlink);
const uploadDir = path.join(__dirname, '../uploads');

const isValidRow = (row) => {
  return (
    row['Student Name']?.trim() &&
    row.Department?.trim() &&
    typeof row.Marks === 'number' &&
    row.Marks >= 0 &&
    row.Marks <= 100
  );
};

export const uploadStudents = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const filePath = path.join(uploadDir, req.file.filename);
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    if (!jsonData.every(isValidRow)) {
      await unlinkAsync(filePath);
      return res.status(400).json({
        error: 'Invalid Excel format. Required columns: Student Name, Department, Marks (0-100)'
      });
    }

    const students = jsonData.map(row => ({
      "Student Name": row['Student Name'].trim(),
      Department: row.Department.trim(),
      Marks: row.Marks
    }));

    await Student.deleteMany({});
    await Student.insertMany(students);

    await unlinkAsync(filePath);
    res.status(201).json({ message: `${students.length} students uploaded` });

  } catch (error) {
    console.error('Upload error:', error);
    if (req.file) await unlinkAsync(path.join(uploadDir, req.file.filename));
    res.status(500).json({ error: error.message || 'File processing failed' });
  }
};

export const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().select('-__v');
    const transformed = students.map(s => ({
      id: s._id,
      name: s["Student Name"],
      department: s.Department,
      marks: s.Marks
    }));
    res.json(transformed);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch students' });
  }
};

export const getDepartmentStudents = async (req, res) => {
  try {
    if (!req.user?.department) {
      return res.status(400).json({ error: 'User department missing' });
    }

    const students = await Student.find({ Department: req.user.department })
      .select('-__v');

    const transformed = students.map(s => ({
      id: s._id,
      name: s["Student Name"],
      department: s.Department,
      marks: s.Marks
    }));
    
    res.json(transformed);
  } catch (error) {
    console.error('Department error:', error);
    res.status(500).json({ error: 'Failed to fetch department students' });
  }
};