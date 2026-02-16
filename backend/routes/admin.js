import express from 'express';
import User from '../models/User.js';
import Progress from '../models/Progress.js';
import Course from '../models/Course.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/users/role/:role
// @desc    Get users by role
// @access  Private/Admin
router.get('/users/role/:role', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find({ role: req.params.role }).select('-password');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user
// @access  Private/Admin
router.put('/users/:id', protect, authorize('admin'), async (req, res) => {
  try {
    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select('-password');

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Private/Admin
router.delete('/users/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/analytics/overview
// @desc    Get platform overview analytics
// @access  Private/Admin
router.get('/analytics/overview', protect, authorize('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalFaculty = await User.countDocuments({ role: 'faculty' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalCourses = await Course.countDocuments();

    const averageSustainabilityScore = await Progress.aggregate([
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$sustainabilityScore' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalStudents,
        totalFaculty,
        totalAdmins,
        totalCourses,
        averageSustainabilityScore: averageSustainabilityScore[0]?.avgScore || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/analytics/student-performance
// @desc    Get student performance analytics
// @access  Private/Admin
router.get('/analytics/student-performance', protect, authorize('admin'), async (req, res) => {
  try {
    const performance = await Progress.aggregate([
      {
        $group: {
          _id: null,
          avgGrade: { $avg: '$overallGrade' },
          avgAttendance: { $avg: '$attendancePercentage' },
          avgSustainability: { $avg: '$sustainabilityScore' },
          totalRecords: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: performance[0] || {
        avgGrade: 0,
        avgAttendance: 0,
        avgSustainability: 0,
        totalRecords: 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/analytics/course-enrollment
// @desc    Get course enrollment analytics
// @access  Private/Admin
router.get('/analytics/course-enrollment', protect, authorize('admin'), async (req, res) => {
  try {
    const enrollmentData = await Course.aggregate([
      {
        $project: {
          title: 1,
          code: 1,
          studentCount: { $size: '$students' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      count: enrollmentData.length,
      data: enrollmentData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
