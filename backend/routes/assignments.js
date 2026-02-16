import express from 'express';
import Assignment from '../models/Assignment.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/assignments
// @desc    Get all assignments
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate('course', 'title code')
      .populate('submissions.student', 'name email');

    res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/assignments/course/:courseId
// @desc    Get assignments for a course
// @access  Private
router.get('/course/:courseId', protect, async (req, res) => {
  try {
    const assignments = await Assignment.find({ course: req.params.courseId })
      .populate('course', 'title code')
      .populate('submissions.student', 'name email');

    res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/assignments
// @desc    Create an assignment
// @access  Private/Faculty,Admin
router.post('/', protect, authorize('faculty', 'admin'), async (req, res) => {
  try {
    const { title, description, course, dueDate, maxScore, type } = req.body;

    const assignment = new Assignment({
      title,
      description,
      course,
      dueDate,
      maxScore,
      type,
    });

    await assignment.save();

    res.status(201).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/assignments/:id/submit
// @desc    Submit assignment
// @access  Private/Student
router.post('/:id/submit', protect, authorize('student'), async (req, res) => {
  try {
    const { submissionDate } = req.body;
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const submission = {
      student: req.user.id,
      submissionDate: submissionDate || new Date(),
    };

    assignment.submissions.push(submission);
    await assignment.save();

    res.status(200).json({
      success: true,
      message: 'Assignment submitted successfully',
      data: assignment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/assignments/:id/grade
// @desc    Grade an assignment submission
// @access  Private/Faculty,Admin
router.put('/:id/grade', protect, authorize('faculty', 'admin'), async (req, res) => {
  try {
    const { submissionId, score, feedback } = req.body;
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const submission = assignment.submissions.id(submissionId);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    submission.score = score;
    submission.feedback = feedback;

    await assignment.save();

    res.status(200).json({
      success: true,
      message: 'Submission graded successfully',
      data: assignment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
