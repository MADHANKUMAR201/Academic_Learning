import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const CourseSchema = new mongoose.Schema({
  title: String,
  code: String,
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { collection: 'courses' });

const UserSchema = new mongoose.Schema({
  name: String,
  role: String
}, { collection: 'users' });

const Course = mongoose.model('Course', CourseSchema);
const User = mongoose.model('User', UserSchema);

async function checkCourses() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const courseIds = ['69abe4f8d698bd332b44a9e1', '69c39eb17e00b6b3afb4b27e'];
    
    for (const id of courseIds) {
      const course = await Course.findById(id).populate('instructor', 'name');
      if (course) {
        console.log(`ID: ${id} -> Title: ${course.title} (${course.code}), Instructor: ${course.instructor ? course.instructor.name : 'Unknown'}`);
      } else {
        console.log(`ID: ${id} -> Course not found`);
      }
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkCourses();
