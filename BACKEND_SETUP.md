# MongoDB Atlas & Backend Setup Guide

## Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account (free tier available at https://www.mongodb.com/cloud/atlas)
- Postman or similar API testing tool (optional but recommended)

---

## Step 1: Set Up MongoDB Atlas

### 1.1 Create a MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Sign Up" and create a free account
3. Verify your email address

### 1.2 Create a New Cluster
1. After signing in, click "Create a Deployment"
2. Choose the **Free tier M0** (always free)
3. Select your preferred cloud provider and region (AWS recommended, closest to you)
4. Give your cluster a name (e.g., "academic-learning")
5. Click "Create Deployment"
6. Wait for the cluster to be created (this takes a few minutes)

### 1.3 Create a Database User
1. Navigate to **Database Access** in the left sidebar
2. Click "Add New Database User"
3. Enter a username (e.g., "admin")
4. Enter a strong password (save this!)
5. Set Database User Privileges to "Built-in Role: Atlas admin"
6. Click "Add User"

### 1.4 Get Your Connection String
1. Go to **Databases** and click "Connect" on your cluster
2. Click "Connect your application"
3. Choose **Node.js** and version **4.1 or later**
4. Copy the connection string

**Important:** Replace `<password>` with your database user password and `myFirstDatabase` with `academic_learning`

Example:
```
mongodb+srv://admin:yourpassword@cluster0.xxxxx.mongodb.net/academic_learning?retryWrites=true&w=majority
```

### 1.5 Whitelist Your IP
1. Click "Database Access" → "Network Access"
2. Click "Add IP Address"
3. For development, you can select "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

---

## Step 2: Configure Backend Environment Variables

### 2.1 Set Up Backend .env File
1. Open `backend/.env` file in the project
2. Update the MONGODB_URI with your connection string:

```env
MONGODB_URI=mongodb+srv://admin:yourpassword@cluster0.xxxxx.mongodb.net/academic_learning?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_key_change_this_in_production
PORT=5000
NODE_ENV=development
```

**Important Security Notes:**
- Change `JWT_SECRET` to a random, strong string
- Never commit `.env` files to version control
- In production, use environment variables from your hosting platform

---

## Step 3: Install Backend Dependencies

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Verify installation
npm list
```

---

## Step 4: Run the Backend Server

### 2.1 Start in Development Mode (with auto-reload)
```bash
npm run dev
```

### 2.2 Start in Production Mode
```bash
npm start
```

**Expected Output:**
```
MongoDB Connected: cluster0.xxxxx.mongodb.net
Server running on port 5000
```

---

## Step 5: Test the Backend APIs

### Using Postman or cURL

#### 5.1 Register a New User
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john.doe@university.edu",
  "password": "securepassword123",
  "role": "student",
  "studentId": "STU001",
  "department": "Computer Science"
}
```

#### 5.2 Login
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john.doe@university.edu",
  "password": "securepassword123",
  "role": "student"
}
```

**Response:** You'll receive a JWT token:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john.doe@university.edu",
    "role": "student"
  }
}
```

#### 5.3 Get Current User (Protected Route)
```bash
GET http://localhost:5000/api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

## Step 6: Configure Frontend to Use Backend

### 6.1 Update Frontend .env
The frontend `.env` file is already configured:
```
VITE_API_URL=http://localhost:5000/api
```

For production, change to:
```
VITE_API_URL=https://your-backend-domain.com/api
```

### 6.2 The Frontend API Service
The API service (`src/services/api.js`) handles all backend communication. It includes:
- Authentication endpoints
- Course management
- Assignments and submissions
- Progress tracking
- Admin analytics

---

## Step 7: Seed Initial Data (Optional)

Create a new file `backend/seed.js` to populate test data:

```javascript
import mongoose from 'mongoose';
import User from './models/User.js';
import Course from './models/Course.js';
import { connectDB } from './config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});

    // Create faculty user
    const faculty = await User.create({
      name: 'Dr. Smith',
      email: 'dr.smith@university.edu',
      password: 'faculty123',
      role: 'faculty',
      department: 'Computer Science',
    });

    // Create course with faculty
    const course = await Course.create({
      title: 'Data Structures',
      code: 'CS101',
      description: 'Introduction to Data Structures',
      credits: 3,
      instructor: faculty._id,
      semester: 'Fall',
      year: 2024,
    });

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
```

Run with:
```bash
node seed.js
```

---

## Database Schema Structure

### Collections Overview:

**Users** - Stores all user accounts
- Student, Faculty, Admin roles
- Password hashing with bcryptjs
- Enrollment tracking

**Courses** - Course information
- Instructor reference
- Enrolled students
- Semester and year info

**Assignments** - Assignment details
- Course reference
- Due dates and max scores
- Student submissions and grades

**Progress** - Student learning progress
- Course-specific metrics
- Grades, attendance, participation
- Sustainability scores

---

## Troubleshooting

### "MongoDB Connection Failed"
- Verify connection string in `.env`
- Check IP address is whitelisted in MongoDB Atlas
- Ensure password is correct (special characters need URL encoding)

### "Port 5000 Already in Use"
```bash
# Find and kill process on port 5000
lsof -i :5000
kill -9 <PID>

# Or change PORT in .env
PORT=5001
```

### "CORS Error in Frontend"
- Backend CORS is configured for `http://localhost:5173` (Vite default)
- Update `backend/server.js` if using different frontend URL

### "JWT Token Not Working"
- Ensure token is sent with `Authorization: Bearer <token>` header
- Check JWT_SECRET matches between requests
- Verify token hasn't expired (default: 7 days)

---

## Production Deployment

### Environment Setup
1. Use strong security keys for `JWT_SECRET`
2. Set `NODE_ENV=production`
3. Update CORS origin to your frontend domain
4. Use environment-specific MongoDB cluster
5. Enable MongoDB IP whitelist for your server

### Recommended Hosting:
- **Backend:** Heroku, Railway, Vercel, AWS EC2
- **Database:** MongoDB Atlas (always recommended)
- **Frontend:** Vercel, Netlify, AWS S3

---

## Next Steps

1. ✅ Start the backend server (`npm run dev`)
2. ✅ Test APIs using Postman
3. ✅ Update AuthContext.jsx to call real API endpoints
4. ✅ Update dashboard components to fetch from backend
5. ✅ Deploy to production

---

## API Documentation

All endpoints are documented in the respective route files:
- `backend/routes/auth.js` - Authentication
- `backend/routes/courses.js` - Course management
- `backend/routes/assignments.js` - Assignment handling
- `backend/routes/progress.js` - Progress tracking
- `backend/routes/admin.js` - Admin analytics

Each route includes comments explaining:
- Request method (GET, POST, PUT, DELETE)
- Route path
- Required parameters
- Access control (roles)
- Request/response format

---

## Support Resources

- MongoDB Atlas Documentation: https://docs.atlas.mongodb.com
- Express.js Guide: https://expressjs.com
- Mongoose Documentation: https://mongoosejs.com
- JWT Authentication: https://jwt.io

---

**You're all set! Your backend is now connected to MongoDB Atlas. 🚀**
