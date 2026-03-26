import express from 'express';
import mongoose from 'mongoose';
import Progress from '../models/Progress.js';
import Course from '../models/Course.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/progress/my
// @desc    Get current user's progress
// @access  Private/Student
router.get('/my', protect, authorize('student'), async (req, res) => {
  try {
    const progress = await Progress.find({ student: req.user.id })
      .populate('course', 'title code');

    res.status(200).json({
      success: true,
      count: progress.length,
      data: progress,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/progress/course/:courseId/student/:studentId
// @desc    Get student progress for a specific course
// @access  Private/Faculty,Admin
router.get('/course/:courseId/student/:studentId', protect, authorize('faculty', 'admin'), async (req, res) => {
  try {
    const progress = await Progress.findOne({
      course: req.params.courseId,
      student: req.params.studentId,
    })
      .populate('student', 'name email studentId')
      .populate('course', 'title code');

    if (!progress) {
      return res.status(404).json({ message: 'Progress record not found' });
    }

    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/progress/course/:courseId
// @desc    Get all students' progress for a course
// @access  Private/Faculty,Admin
router.get('/course/:courseId', protect, authorize('faculty', 'admin'), async (req, res) => {
  try {
    const progress = await Progress.find({ course: req.params.courseId })
      .populate('student', 'name email studentId')
      .populate('course', 'title code');

    res.status(200).json({
      success: true,
      count: progress.length,
      data: progress,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/progress
// @desc    Create or update progress record
// @access  Private/Faculty,Admin
router.post('/', protect, authorize('faculty', 'admin'), async (req, res) => {
  try {
    const { student, course, overallGrade, completedAssignments, totalAssignments, attendancePercentage, sustainabilityScore } = req.body;

    let progress = await Progress.findOne({ student, course });

    if (progress) {
      // Update existing progress
      if (overallGrade !== undefined) progress.overallGrade = overallGrade;
      if (completedAssignments !== undefined) progress.completedAssignments = completedAssignments;
      if (totalAssignments !== undefined) progress.totalAssignments = totalAssignments;
      if (attendancePercentage !== undefined) progress.attendancePercentage = attendancePercentage;
      if (sustainabilityScore !== undefined) progress.sustainabilityScore = sustainabilityScore;
      progress.lastUpdated = new Date();

      await progress.save();
    } else {
      // Create new progress record
      progress = new Progress({
        student,
        course,
        overallGrade,
        completedAssignments,
        totalAssignments,
        attendancePercentage,
        sustainabilityScore,
      });

      await progress.save();
    }

    res.status(201).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/progress/:id
// @desc    Update progress record
// @access  Private/Faculty,Admin
router.put('/:id', protect, authorize('faculty', 'admin'), async (req, res) => {
  try {
    let progress = await Progress.findById(req.params.id);

    if (!progress) {
      return res.status(404).json({ message: 'Progress record not found' });
    }

    progress = await Progress.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/progress/faculty/all
// @desc    Get all progress records for courses taught by the faculty
// @access  Private/Faculty
router.get('/faculty/all', protect, authorize('faculty'), async (req, res) => {
  try {
    const facultyCourses = await Course.find({ instructor: req.user.id });
    const courseIds = facultyCourses.map(c => c._id);

    const progress = await Progress.find({ course: { $in: courseIds } })
      .populate('student', 'name email studentId')
      .populate('course', 'title code');

    res.status(200).json({
      success: true,
      count: progress.length,
      data: progress,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
