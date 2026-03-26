import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  academicInfo: {
    attendancePercentage: Number
  }
}, { collection: 'users' });

const User = mongoose.model('User', UserSchema);

async function checkUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ name: /keerthivasan/i });
    if (!user) {
      console.log('User not found');
      return;
    }
    console.log(`User: ${user.name}`);
    console.log(`Global Attendance: ${user.academicInfo ? user.academicInfo.attendancePercentage : 'N/A'}%`);
    console.log(`Full academicInfo: ${JSON.stringify(user.academicInfo)}`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkUser();
