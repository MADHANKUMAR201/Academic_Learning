# Academic Learning Sustainability Platform - Backend

Node.js/Express backend for the Academic Learning Sustainability Platform with MongoDB Atlas integration.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create a `.env` file or update the existing one:
```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/academic_learning?retryWrites=true&w=majority
JWT_SECRET=your_secret_key_here
PORT=5000
NODE_ENV=development
```

### 3. Run Server
**Development (with auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Server will run on `http://localhost:5000`

## Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection setup
├── middleware/
│   └── auth.js              # JWT authentication & authorization
├── models/
│   ├── User.js              # User schema (student, faculty, admin)
│   ├── Course.js            # Course schema
│   ├── Assignment.js        # Assignment schema
│   └── Progress.js          # Student progress schema
├── routes/
│   ├── auth.js              # Authentication endpoints
│   ├── courses.js           # Course management endpoints
│   ├── assignments.js       # Assignment endpoints
│   ├── progress.js          # Progress tracking endpoints
│   └── admin.js             # Admin analytics and user management
├── .env                     # Environment variables
├── .gitignore              # Git ignore rules
├── package.json            # Project dependencies
└── server.js               # Express server setup
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Courses
- `GET /api/courses` - Get all courses (protected)
- `GET /api/courses/:id` - Get specific course
- `POST /api/courses` - Create course (faculty, admin)
- `PUT /api/courses/:id` - Update course (faculty, admin)
- `DELETE /api/courses/:id` - Delete course (admin)
- `POST /api/courses/:id/enroll` - Enroll student in course

### Assignments
- `GET /api/assignments` - Get all assignments (protected)
- `GET /api/assignments/course/:courseId` - Get course assignments
- `POST /api/assignments` - Create assignment (faculty, admin)
- `POST /api/assignments/:id/submit` - Submit assignment (student)
- `PUT /api/assignments/:id/grade` - Grade assignment (faculty, admin)

### Progress
- `GET /api/progress/my` - Get current student's progress
- `GET /api/progress/course/:courseId` - Get course progress for all students
- `POST /api/progress` - Create/update progress record (faculty, admin)
- `PUT /api/progress/:id` - Update progress (faculty, admin)

### Admin
- `GET /api/admin/users` - Get all users (admin)
- `GET /api/admin/users/role/:role` - Get users by role (admin)
- `PUT /api/admin/users/:id` - Update user (admin)
- `DELETE /api/admin/users/:id` - Delete user (admin)
- `GET /api/admin/analytics/overview` - Platform analytics
- `GET /api/admin/analytics/student-performance` - Student performance data
- `GET /api/admin/analytics/course-enrollment` - Course enrollment stats

## Authentication

All protected routes require JWT token in header:
```
Authorization: Bearer <your_jwt_token>
```

Tokens are obtained via login endpoint and are valid for 7 days by default.

## Database Collections

### Users
- Student, Faculty, Admin accounts
- Email-based authentication with bcrypt password hashing
- Course enrollment tracking

### Courses
- Course details (title, code, credits)
- Instructor reference
- Enrolled students list
- Semester and year information

### Assignments
- Assignment details and deadlines
- Student submissions with scores
- Feedback and grading

### Progress
- Per-course student metrics
- GPA, attendance, participation
- Learning sustainability score

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret for JWT tokens | `any_random_string` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` or `production` |

## Security Features

✅ Password hashing with bcryptjs
✅ JWT-based authentication
✅ Role-based access control (RBAC)
✅ Protected endpoints with middleware
✅ CORS configuration
✅ Environment variable protection

## Development Tips

### Testing Endpoints
Use Postman, Insomnia, or curl:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123","role":"student"}'
```

### Database Inspection
Access MongoDB Atlas directly:
1. Go to https://cloud.mongodb.com
2. Click "Databases" → "Browse Collections"
3. View data in real-time

### Debugging
Enable detailed logs:
```bash
DEBUG=* npm run dev
```

## Common Issues & Solutions

**MongoDB Connection Failed**
- Check connection string in `.env`
- Verify IP whitelist in MongoDB Atlas
- Confirm database credentials

**Port Already in Use**
- Change `PORT` in `.env`
- Kill existing process on port 5000

**CORS Errors**
- Update frontend URL in `server.js` CORS configuration

## Performance Optimization

### Database Indexing
Create indexes for frequently queried fields:
```javascript
userSchema.index({ email: 1 });
courseSchema.index({ instructor: 1 });
progressSchema.index({ student: 1, course: 1 });
```

### API Response Caching
Consider adding Redis caching for analytics endpoints.

### Pagination
Implement pagination for large datasets:
```javascript
.skip((page - 1) * limit)
.limit(limit)
```

## Deployment Checklist

- [ ] Update `JWT_SECRET` with strong random key
- [ ] Set `NODE_ENV=production`
- [ ] Update CORS origin to production domain
- [ ] Enable MongoDB IP whitelist for server
- [ ] Add error logging service (Sentry, Rollbar)
- [ ] Set up monitoring and alerts
- [ ] Configure backups for database
- [ ] Use HTTPS for all communication

## Production Hosting Options

- **Heroku** - Easy deployment with free tier
- **Railway** - Modern alternative to Heroku
- **DigitalOcean** - Affordable VPS
- **AWS EC2** - Scalable with Lambda options
- **Google Cloud Run** - Serverless option

## Support

For detailed MongoDB setup instructions, see [BACKEND_SETUP.md](../BACKEND_SETUP.md)

## License

MIT
