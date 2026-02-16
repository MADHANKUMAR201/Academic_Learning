import express from 'express';
import Progress from '../models/Progress.js';
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
      progress.overallGrade = overallGrade || progress.overallGrade;
      progress.completedAssignments = completedAssignments || progress.completedAssignments;
      progress.totalAssignments = totalAssignments || progress.totalAssignments;
      progress.attendancePercentage = attendancePercentage || progress.attendancePercentage;
      progress.sustainabilityScore = sustainabilityScore || progress.sustainabilityScore;
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

export default router;
