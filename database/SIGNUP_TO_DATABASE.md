# How Sign-Up Data Gets Saved to MongoDB

## Data Flow Diagram
```
User fills Sign-Up Form (Frontend)
         ↓
Login.jsx calls authAPI.register()
         ↓
API sends POST request to /api/auth/register (Backend)
         ↓
Backend validates data and hashes password
         ↓
Data is saved to MongoDB Atlas Database
         ↓
User receives JWT token and success response
```

---

## Step 1: Start the Backend Server

### Option A: Development Mode (with auto-reload)
```bash
cd backend
npm run dev
```

### Option B: Production Mode
```bash
cd backend
npm start
```

**Expected Output:**
```
MongoDB Connected: cluster0.keeclhg.mongodb.net
Server running on port 5000
```

If you see this, the backend is connected to your MongoDB Atlas database! ✅

---

## Step 2: Verify Everything is Connected

### Check 1: Test the Backend API
Open Postman or use curl to test registration:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Student",
    "email": "test.student@university.edu",
    "password": "testpass123",
    "role": "student",
    "studentId": "STU-TEST-001",
    "department": "Computer Science"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Test Student",
    "email": "test.student@university.edu",
    "role": "student"
  }
}
```

### Check 2: Verify Data in MongoDB Atlas
1. Go to https://cloud.mongodb.com
2. Log in with your account
3. Click on "Databases" → "Browse Collections"
4. Select your database (Academic_learning)
5. Click on "users" collection
6. You should see your newly created user! 📊

---

## Step 3: Start Your Frontend

In a new terminal:
```bash
cd . (stay in project root)
npm run dev
```

Frontend will run on `http://localhost:5173`

---

## Step 4: Test Sign-Up with Frontend

1. Open `http://localhost:5173` in your browser
2. You should see the EduSustain login page
3. Click "Sign up here" to open the sign-up form
4. Fill in the form:
   - **Name:** Your Full Name
   - **Email:** your.email@university.edu (new email)
   - **Password:** Your Password (min 6 chars)
   - **Confirm Password:** Repeat password
   - **Role:** Select Student/Faculty/Admin
   - **Student ID:** (for students only)
   - **Department:** Your Department
5. Click "Create Account"
6. You should see: "Account created successfully! Please log in."
7. Log in with your new account

---

## What Happens Behind the Scenes

### Frontend (React)
1. User fills sign-up form in [Login.jsx](../src/pages/Login.jsx)
2. Clicks "Create Account" button
3. Form validation happens (empty fields, password match, length check)
4. Calls `authAPI.register()` from [api.js](../src/services/api.js)
5. API sends POST request with user data

### Backend (Node.js/Express)
1. Receives request at `/api/auth/register`
2. [auth.js route](./routes/auth.js) validates input:
   - Check all required fields
   - Verify email doesn't already exist
3. [User.js model](./models/User.js) processes data:
   - Hashes password with bcryptjs (never stored in plain text)
   - Validates schema
4. Saves to MongoDB with all fields encrypted
5. Creates JWT token (expires in 7 days)
6. Returns token + user info to frontend

### Database (MongoDB Atlas)
- Collections created automatically:
  - **users** - All student, faculty, admin accounts
  - **courses** - Course information
  - **assignments** - Assignment details
  - **progress** - Student progress tracking

---

## Architecture Overview

```
Frontend Application (localhost:5173)
├── Login.jsx (Sign-Up Form)
├── AuthContext.jsx (Auth State)
└── services/api.js (API Calls)
              ↓ (HTTP Requests)
              
Backend API Server (localhost:5000)
├── routes/auth.js (POST /register endpoint)
├── models/User.js (Data Schema)
└── middleware/auth.js (JWT validation)
              ↓ (Mongoose ODM)
              
MongoDB Atlas Cloud Database
└── academic_learning
    ├── users (Your new accounts stored here!)
    ├── courses
    ├── assignments
    └── progress
```

---

## Troubleshooting

### Problem: "Backend not responding" or "Cannot find module"
**Solution:**
```bash
cd backend
npm install
npm run dev
```

### Problem: "MongoDB Connection Failed"
**Solution:**
1. Check `.env` file has correct `MONGODB_URI`
2. Verify database username/password is correct
3. In MongoDB Atlas, check Network Access:
   - Go to "Network Access"
   - Ensure your IP is whitelisted (or Allow from Anywhere for dev)
4. Restart the backend server: `npm run dev`

### Problem: "User already exists when signing up"
**Solution:**
- That email is already in the database
- Use a different email address for testing
- Or delete the user from MongoDB and sign up again

### Problem: "CORS Error in Browser Console"
**Solution:**
- Backend CORS is configured for `http://localhost:5173`
- Make sure frontend is running on that exact URL
- Restart both frontend and backend

### Problem: "Environmental Variable Not Found"
**Solution:**
- Make sure `backend/.env` file exists
- Verify all variables are set:
  - MONGODB_URI
  - JWT_SECRET
  - PORT
  - NODE_ENV

---

## Test Accounts You Can Create

### Student Account
```
Name: John Smith
Email: john.smith@university.edu
Role: Student
Student ID: STU-001
Department: Computer Science
Password: test123456 (min 6 chars)
```

### Faculty Account
```
Name: Dr. Sarah Johnson
Email: sarah.johnson@university.edu
Role: Faculty
Department: Engineering
Password: test123456
```

### Admin Account
```
Name: Admin User
Email: admin.user@university.edu
Role: Admin
Password: test123456
```

After creating these, you can log in and test the dashboards!

---

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (bcrypt hashed),
  role: String (enum: 'student', 'faculty', 'admin'),
  department: String,
  studentId: String (unique for students),
  enrolledCourses: Array of ObjectId (Course references),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Next Steps

1. ✅ Start backend: `npm run dev` (in backend folder)
2. ✅ Start frontend: `npm run dev` (in root folder)
3. ✅ Test sign-up in browser
4. ✅ Check MongoDB Atlas to see saved data
5. ✅ Log in with new account
6. ✅ Update dashboards to fetch real data from backend

---

## Success Checklist

- [ ] Backend server running on `http://localhost:5000`
- [ ] Frontend running on `http://localhost:5173`
- [ ] Can sign up successfully
- [ ] Success message appears
- [ ] Can see user data in MongoDB Atlas
- [ ] Can log in with new account
- [ ] JWT token stored in localStorage
- [ ] User profile displays on dashboard

---

## Important Security Notes

🔒 **Never share your MongoDB URI with anyone!**
🔒 **Never commit .env files to Git!**
🔒 **Change JWT_SECRET to a random string in production!**
🔒 **Passwords are hashed with bcryptjs (not stored in plain text)**

---

**Your sign-up data is now being saved to MongoDB! 🎉**

Questions? Check the backend logs in your terminal for detailed error messages!
