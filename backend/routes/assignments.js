import express from 'express';
import mongoose from 'mongoose';
import Assignment from '../models/Assignment.js';
import Course from '../models/Course.js';
import Progress from '../models/Progress.js';
import User from '../models/User.js';
import { syncStudentProgress as syncProgress } from '../utils/progressSync.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Local syncProgress is now replaced by syncStudentProgress from utils

// @route   GET /api/assignments/faculty
// @desc    Get assignments created by faculty
// @access  Private/Faculty
router.get('/faculty', protect, authorize('faculty'), async (req, res) => {
  try {
    // First get courses the faculty instructs
    const courses = await Course.find({ 
      instructor: new mongoose.Types.ObjectId(req.user.id) 
    }).select('_id');
    const courseIds = courses.map(course => course._id);

    // Get assignments for those courses
    const assignments = await Assignment.find({ course: { $in: courseIds } })
      .populate('course', 'title code students')
      .populate('submissions.student', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/assignments/student
// @desc    Get assignments for courses the student is enrolled in
// @access  Private/Student
router.get('/student', protect, authorize('student'), async (req, res) => {
  try {
    // First get courses the student is enrolled in
    const Course = mongoose.model('Course');
    const courses = await Course.find({ students: req.user.id }).select('_id');
    const courseIds = courses.map(course => course._id);

    // Get assignments for those courses
    const assignments = await Assignment.find({ course: { $in: courseIds } })
      .populate('course', 'title code')
      .populate('submissions.student', 'name email')
      .sort({ dueDate: 1 });

    // Add submission status for each assignment
    const assignmentsWithStatus = assignments.map(assignment => {
      const submission = assignment.submissions.find(
        sub => (sub.student._id || sub.student).toString() === req.user.id
      );

      return {
        ...assignment.toObject(),
        studentSubmission: submission || null,
        isSubmitted: !!submission,
        isOverdue: new Date() > new Date(assignment.dueDate) && !submission,
        isReminderDismissed: req.user.dismissedReminders?.includes(assignment._id.toString()) || false,
        reminder: !!submission ? '' : assignment.reminder || ''
      };
    });

    res.status(200).json({
      success: true,
      count: assignmentsWithStatus.length,
      data: assignmentsWithStatus,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
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

    // Validate required fields
    if (!title || !course || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Title, course, and due date are required'
      });
    }

    // Check if due date is in the future
    if (new Date(dueDate) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Due date must be in the future'
      });
    }

    // If faculty, check if they are the instructor of the course
    if (req.user.role === 'faculty') {
      const courseDoc = await Course.findById(course);
      if (!courseDoc) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }
      if (courseDoc.instructor.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only create assignments for courses you instruct'
        });
      }
    }

    const assignment = new Assignment({
      title,
      description,
      course,
      dueDate,
      maxScore: maxScore || 100,
      type: type || 'homework',
    });

    await assignment.save();

    // -- SYNC TOTAL ASSIGNMENTS FOR ALL ENROLLED STUDENTS --
    try {
      const courseDoc = await Course.findById(course);
      if (courseDoc && courseDoc.students.length > 0) {
        for (const studentId of courseDoc.students) {
          await syncStudentProgress(studentId, course);
        }
      }
    } catch (syncError) {
      console.error('Error syncing totals on creation:', syncError);
    }

    // Populate the course info in response
    await assignment.populate('course', 'title code');

    res.status(201).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/assignments/:id
// @desc    Update an assignment
// @access  Private/Faculty,Admin
router.put('/:id', protect, authorize('faculty', 'admin'), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id).populate('course');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Check if faculty is the instructor of the course
    if (req.user.role === 'faculty' && assignment.course.instructor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update assignments for courses you instruct'
      });
    }

    const { title, description, dueDate, maxScore, type } = req.body;

    // Validate due date if provided
    if (dueDate && new Date(dueDate) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Due date must be in the future'
      });
    }

    // Update fields
    if (title) assignment.title = title;
    if (description !== undefined) assignment.description = description;
    if (dueDate) assignment.dueDate = dueDate;
    if (maxScore) assignment.maxScore = maxScore;
    if (type) assignment.type = type;

    await assignment.save();
    await assignment.populate('course', 'title code');

    res.status(200).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/assignments/:id/submit
// @desc    Submit assignment
// @access  Private/Student
router.post('/:id/submit', protect, authorize('student'), async (req, res) => {
  try {
    const { content, fileUrl } = req.body;
    const assignment = await Assignment.findById(req.params.id).populate('course');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Check if due date has passed
    if (new Date() > new Date(assignment.dueDate)) {
      return res.status(400).json({
        success: false,
        message: 'Assignment submission deadline has passed'
      });
    }

    // Check if student is enrolled in the course
    const isEnrolled = assignment.course.students.some(
      studentId => studentId.toString() === req.user.id
    );

    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this course'
      });
    }

    // Check if student has already submitted
    const existingSubmission = assignment.submissions.find(
      sub => sub.student.toString() === req.user.id
    );

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted this assignment'
      });
    }

    // Validate that either content or fileUrl is provided
    if (!content && !fileUrl) {
      return res.status(400).json({
        success: false,
        message: 'Either content or file URL must be provided'
      });
    }

    const submission = {
      student: new mongoose.Types.ObjectId(req.user.id),
      submissionDate: new Date(),
      content,
      fileUrl,
      status: new Date() > new Date(assignment.dueDate) ? 'late' : 'submitted',
    };

    assignment.submissions.push(submission);
    await assignment.save();

    // -- SYNC PROGRESS --
    await syncProgress(req.user.id, assignment.course._id);

    res.status(200).json({
      success: true,
      message: 'Assignment submitted successfully',
      data: {
        assignment: assignment._id,
        submission: submission,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/assignments/:id/grade
// @desc    Grade an assignment submission
// @access  Private/Faculty,Admin
router.put('/:id/grade', protect, authorize('faculty', 'admin'), async (req, res) => {
  try {
    const { submissionId, score, feedback } = req.body;
    const assignment = await Assignment.findById(req.params.id).populate('course');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Check if faculty is the instructor of the course
    if (req.user.role === 'faculty' && assignment.course.instructor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only grade assignments for courses you instruct'
      });
    }

    const submission = assignment.submissions.id(submissionId);
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Validate score
    if (score < 0 || score > assignment.maxScore) {
      return res.status(400).json({
        success: false,
        message: `Score must be between 0 and ${assignment.maxScore}`
      });
    }

    submission.score = score;
    submission.feedback = feedback;
    submission.status = 'graded';

    await assignment.save();

    // -- SYNC PROGRESS --
    await syncProgress(submission.student, assignment.course._id);

    res.status(200).json({
      success: true,
      message: 'Submission graded successfully',
      data: assignment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/assignments/:id/reminder
// @desc    Set assignment reminder
// @access  Private/Faculty,Admin
router.put('/:id/reminder', protect, authorize('faculty', 'admin'), async (req, res) => {
  try {
    const { reminder } = req.body;
    const assignment = await Assignment.findById(req.params.id).populate('course');

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    if (req.user.role === 'faculty' && assignment.course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only update reminders for courses you instruct' });
    }

    assignment.reminder = reminder || '';
    await assignment.save();

    res.status(200).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/assignments/:id/dismiss-reminder
// @desc    Dismiss assignment reminder
// @access  Private/Student
router.post('/:id/dismiss-reminder', protect, authorize('student'), async (req, res) => {
  try {
    const User = mongoose.model('User');
    const user = await User.findById(req.user.id);

    if (!user.dismissedReminders.includes(req.params.id)) {
      user.dismissedReminders.push(req.params.id);
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Reminder dismissed successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/assignments/:id
// @desc    Delete an assignment
// @access  Private/Faculty,Admin
router.delete('/:id', protect, authorize('faculty', 'admin'), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id).populate('course');
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    if (req.user.role === 'faculty' && assignment.course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this assignment' });
    }

    const courseId = assignment.course._id;
    const students = assignment.course.students;

    await Assignment.findByIdAndDelete(req.params.id);

    // -- SYNC TOTAL ASSIGNMENTS FOR ALL ENROLLED STUDENTS --
    try {
      if (students && students.length > 0) {
        for (const studentId of students) {
          await syncProgress(studentId, courseId);
        }
      }
    } catch (syncError) {
      console.error('Error syncing totals on deletion:', syncError);
    }

    res.status(200).json({
      success: true,
      message: 'Assignment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
