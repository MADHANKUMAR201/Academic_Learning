import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const ProgressSchema = new mongoose.Schema({
  student: mongoose.Schema.Types.ObjectId,
  course: mongoose.Schema.Types.ObjectId,
  attendancePercentage: Number,
}, { collection: 'progresses' }); // Ensure collection name is correct

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String
}, { collection: 'users' });

const Progress = mongoose.model('Progress', ProgressSchema);
const User = mongoose.model('User', UserSchema);

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ name: /keerthivasan/i });
    if (!user) {
      console.log('User not found');
      const allUsers = await User.find({ role: 'student' }).limit(5);
      console.log('Current students:', allUsers.map(u => u.name));
      return;
    }
    console.log(`User found: ${user.name} (${user._id})`);

    const progress = await Progress.find({ student: user._id });
    console.log(`Found ${progress.length} progress records for this user:`);
    progress.forEach(p => {
      console.log(` - Course ID: ${p.course} -> Attendance: ${p.attendancePercentage}%`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkData();
