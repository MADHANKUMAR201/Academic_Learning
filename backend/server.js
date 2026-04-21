import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { connectDB } from './config/database.js';

// ES Module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.js';
import courseRoutes from './routes/courses.js';
import assignmentRoutes from './routes/assignments.js';
import progressRoutes from './routes/progress.js';
import adminRoutes from './routes/admin.js';
import uploadRoutes from './routes/upload.js';

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the uploads directory (if it exists)
if (fs.existsSync(path.join(__dirname, 'uploads'))) {
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
}

// CORS
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// API Health Check
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Academic Learning API is live and ready!'
  });
});

// Basic root route
app.get('/', (req, res) => {
  res.json({
    message: 'Academic Learning Sustainability Platform API',
    version: '1.0.0',
    status: 'Running',
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

const PORT = process.env.PORT || 5001;

if (process.env.NODE_ENV !== 'production') {
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
  
  server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is in use. Please kill the process on that port or try a different one.`);
      process.exit(1);
    }
  });
}

export default app;
