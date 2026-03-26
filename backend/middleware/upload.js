import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure Cloudinary only if credentials are provided
const isCloudEnabled = !!process.env.CLOUDINARY_CLOUD_NAME;

if (isCloudEnabled) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Ensure local upload directory exists (only for local dev)
const uploadDir = 'uploads/assignments';
if (!isCloudEnabled && !fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

let storage;

if (isCloudEnabled) {
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: (req, file) => {
        // Use the dynamic path if specified, e.g., 'materials' or 'assignments'
        const folderName = req.uploadPath ? req.uploadPath.split('/').pop() : 'assignments';
        return `academic-learning/${folderName}`;
      },
      format: async (req, file) => 'pdf', // Only allow PDFs as per current requirement
      public_id: (req, file) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        return file.fieldname + '-' + uniqueSuffix;
      },
    },
  });
} else {
  // Fallback to disk storage for local development
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const dest = req.uploadPath || 'uploads/assignments';
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      cb(null, dest);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
  });
}

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});
