import express from 'express';
import path from 'path';
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

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// CORS
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow all localhost origins in development
      if (process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      
      // In production, only allow specific domain
      const allowedOrigins = ['https://yourdomain.com'];
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      return callback(new Error('Not allowed by CORS'));
    },
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

// Basic route
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
