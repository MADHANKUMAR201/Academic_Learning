import express from 'express';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// @route   POST /api/upload/assignment
// @desc    Upload assignment PDF
// @access  Private/Student
router.post('/assignment', protect, (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file',
      });
    }

    // Return the relative URL of the uploaded file
    const fileUrl = `/uploads/assignments/${req.file.filename}`;
    
    res.status(200).json({
      success: true,
      data: fileUrl,
    });
  });
});

export default router;
