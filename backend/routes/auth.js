import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const generateToken = (id, email, role) => {
  return jwt.sign({ id, email, role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, department, studentId } = req.body;

    // Validate input
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user object, only include studentId when provided (avoid empty-string duplicates)
    const userData = { name, email, password, role, department };
    if (studentId && String(studentId).trim() !== '') {
      userData.studentId = studentId;
    }

    // Create user
    user = new User(userData);

    try {
      await user.save();
    } catch (dbErr) {
      // Handle duplicate key errors (E11000) with clearer message
      if (dbErr.code === 11000) {
        const dupField = Object.keys(dbErr.keyPattern || dbErr.keyValue || {})[0] || 'field';
        return res.status(400).json({ message: `Duplicate value for '${dupField}'. Please use a different value.` });
      }
      throw dbErr;
    }

    // Generate token
    const token = generateToken(user._id, user.email, user.role);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validate input
    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Please provide email, password, and role' });
    }

    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if role matches
    if (user.role !== role) {
      return res.status(401).json({ message: 'Invalid role for this user' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is active
    if (user.isActive === false) {
      return res.status(403).json({ 
        success: false,
        message: 'You are blocked. Contact your admin.' 
      });
    }

    // Generate token
    const token = generateToken(user._id, user.email, user.role);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/auth/me
// @desc    Update current user's profile
// @access  Private
router.put('/me', protect, async (req, res) => {
  try {
    const updates = req.body;

    console.log('[PUT /api/auth/me] user:', req.user && req.user.id);
    console.log('[PUT /api/auth/me] updates:', JSON.stringify(updates));

    // Prevent updating role, password, or sensitive fields here
    delete updates.role;
    delete updates.password;

    // Use $set to update nested objects cleanly
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    console.log('[PUT /api/auth/me] updated user id:', user?._id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('[PUT /api/auth/me] error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

export default router;
