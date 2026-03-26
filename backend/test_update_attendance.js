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

async function testUpdate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const result = await User.findOneAndUpdate(
      { name: /keerthivasan/i },
      { $set: { 'academicInfo.attendancePercentage': 80 } },
      { new: true }
    );

    if (result) {
      console.log('Successfully updated keerthivasan to 80%');
      console.log('New Value:', result.academicInfo.attendancePercentage);
    } else {
      console.log('User not found');
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

testUpdate();
