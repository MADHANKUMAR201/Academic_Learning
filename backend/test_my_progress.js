import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const ProgressSchema = new mongoose.Schema({
  student: mongoose.Schema.Types.ObjectId,
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' }
});

const CourseSchema = new mongoose.Schema({
  title: String,
  code: String
});

// Avoid model overwrite errors
const Progress = mongoose.models.Progress || mongoose.model('Progress', ProgressSchema);
const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);
const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({ name: String }));

async function testGetMyProgress() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ name: /keerthivasan/i });
    if (!user) {
      console.log('User not found');
      return;
    }

    // Simulate the logic in /api/progress/my
    const progress = await Progress.find({ student: user._id })
      .populate('course', 'title code');

    console.log(`Results for student ID ${user._id}:`);
    console.log(JSON.stringify(progress, null, 2));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

testGetMyProgress();
