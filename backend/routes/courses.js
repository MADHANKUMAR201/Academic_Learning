import express from 'express';
import mongoose from 'mongoose';
import Course from '../models/Course.js';
import Progress from '../models/Progress.js';
import Assignment from '../models/Assignment.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/courses
// @desc    Get all courses
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'faculty') {
      query.instructor = new mongoose.Types.ObjectId(req.user.id);
    }
    
    const courses = await Course.find(query)
      .populate('instructor', 'name email')
      .populate('students', 'name email studentId');

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/courses/:id
// @desc    Get single course
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email')
      .populate('students', 'name email studentId');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/courses
// @desc    Create a course
// @access  Private/Faculty,Admin
router.post('/', protect, authorize('faculty', 'admin'), async (req, res) => {
  try {
    const { title, code, description, credits, semester, year } = req.body;

    const course = new Course({
      title,
      code,
      description,
      credits,
      semester,
      year,
      instructor: req.user.id,
    });

    await course.save();

    res.status(201).json({
      success: true,
      data: course,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/courses/:id
// @desc    Update a course
// @access  Private/Faculty,Admin
router.put('/:id', protect, authorize('faculty', 'admin'), async (req, res) => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is course instructor or admin
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this course' });
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/courses/:id
// @desc    Delete a course
// @access  Private/Faculty,Admin
router.delete('/:id', protect, authorize('faculty', 'admin'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is course instructor or admin
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this course' });
    }

    await Course.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/courses/:id/enroll
// @desc    Enroll student in course
// @access  Private/Student
router.post('/:id/enroll', protect, authorize('student'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.students.includes(req.user.id)) {
      return res.status(400).json({ message: 'Student already enrolled in this course' });
    }

    course.students.push(req.user.id);
    await course.save();

    // Also update the User model's enrolledCourses array
    await mongoose.model('User').findByIdAndUpdate(req.user.id, {
      $addToSet: { enrolledCourses: course._id }
    });

    // Create a progress record for the student in this course
    try {
      const existingProgress = await Progress.findOne({ student: req.user.id, course: course._id });
      if (!existingProgress) {
        // Get total assignments for the course to initialize the progress record
        const totalAssignments = await Assignment.countDocuments({ course: course._id });
        
        const progress = new Progress({
          student: req.user.id,
          course: course._id,
          totalAssignments: totalAssignments,
          completedAssignments: 0,
          overallGrade: 0,
          sustainabilityScore: 10 // Start with a small baseline
        });
        await progress.save();
      }
    } catch (progressError) {
      console.error('Error creating progress record:', progressError);
    }

    res.status(200).json({
      success: true,
      message: 'Enrolled successfully',
      data: course,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/courses/faculty/stats
// @desc    Get dashboard statistics for faculty
// @access  Private/Faculty
router.get('/faculty/stats', protect, authorize('faculty'), async (req, res) => {
  try {
    const facultyId = req.user.id;
    
    // Find all courses taught by this faculty
    const courses = await Course.find({ instructor: facultyId });
    const courseIds = courses.map(c => c._id);
    
    // Total students (unique)
    const uniqueStudentsSet = new Set();
    courses.forEach(c => {
      c.students.forEach(s => uniqueStudentsSet.add(s.toString()));
    });
    
    // Get all progress records for these courses
    const progressRecords = await Progress.find({ course: { $in: courseIds } });
    
    let totalProgress = 0;
    let totalSustainability = 0;
    let totalGrade = 0;
    
    if (progressRecords.length > 0) {
      progressRecords.forEach(p => {
        const perc = p.totalAssignments > 0 ? (p.completedAssignments / p.totalAssignments) * 100 : 0;
        totalProgress += perc;
        totalSustainability += p.sustainabilityScore || 0;
        totalGrade += p.overallGrade || 0;
      });
    }
    
    const stats = {
      totalStudents: uniqueStudentsSet.size,
      activeCourses: courses.length,
      avgProgress: progressRecords.length > 0 ? Math.round(totalProgress / progressRecords.length) : 0,
      avgSustainability: progressRecords.length > 0 ? Math.round(totalSustainability / progressRecords.length) : 0,
      avgGrade: progressRecords.length > 0 ? Math.round(totalGrade / progressRecords.length) : 0,
      courseStats: await Promise.all(courses.map(async (c) => {
        const cProgress = progressRecords.filter(p => p.course.toString() === c._id.toString());
        let cTotalProg = 0;
        let cTotalSustain = 0;
        if (cProgress.length > 0) {
          cProgress.forEach(p => {
            cTotalProg += p.totalAssignments > 0 ? (p.completedAssignments / p.totalAssignments) * 100 : 0;
            cTotalSustain += p.sustainabilityScore || 0;
          });
        }
        return {
          _id: c._id,
          code: c.code,
          title: c.title,
          students: c.students.length,
          avgProgress: cProgress.length > 0 ? Math.round(cTotalProg / cProgress.length) : 0,
          avgSustainability: cProgress.length > 0 ? Math.round(cTotalSustain / cProgress.length) : 0
        };
      }))
    };
    
    res.status(200).json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
