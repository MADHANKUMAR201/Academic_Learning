import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  studentId: String,
  academicInfo: {
    attendancePercentage: Number
  }
}, { collection: 'users' });

const User = mongoose.model('User', UserSchema);

async function checkUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({ role: 'student' });
    console.log(`Found ${users.length} students:`);
    users.forEach(u => {
      console.log(` - ${u.name} (Email: ${u.email}, ID: ${u.studentId || 'N/A'}) -> Global Attend: ${u.academicInfo ? u.academicInfo.attendancePercentage : 0}%`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkUser();
