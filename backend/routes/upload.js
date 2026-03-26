import express from 'express';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// @route   POST /api/upload/assignment
// @desc    Upload assignment PDF
// @access  Private/Student
router.post('/assignment', protect, (req, res) => {
  req.uploadPath = 'uploads/assignments';
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

    // If Cloudinary is enabled, req.file.path will be the full URL
    // Otherwise, construct a local relative URL
    const fileUrl = req.file.path.startsWith('http') 
      ? req.file.path 
      : `/uploads/assignments/${req.file.filename}`;
    
    res.status(200).json({
      success: true,
      data: fileUrl,
    });
  });
});

router.post('/material', protect, (req, res) => {
  req.uploadPath = 'uploads/materials';
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

    const fileUrl = req.file.path.startsWith('http') 
      ? req.file.path 
      : `/uploads/materials/${req.file.filename}`;
    
    res.status(200).json({
      success: true,
      data: fileUrl,
    });
  });
});

export default router;
