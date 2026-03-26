import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const AssignmentSchema = new mongoose.Schema({
  title: String,
  submissions: [{
    student: mongoose.Schema.Types.ObjectId,
    status: String
  }]
}, { collection: 'assignments' });

const ProgressSchema = new mongoose.Schema({
  student: mongoose.Schema.Types.ObjectId,
  course: mongoose.Schema.Types.ObjectId,
  completedAssignments: Number,
  totalAssignments: Number
}, { collection: 'progress' });

const Assignment = mongoose.model('Assignment', AssignmentSchema);
const Progress = mongoose.model('Progress', ProgressSchema);
const User = mongoose.model('User', new mongoose.Schema({ name: String }, { collection: 'users' }));

async function checkSync() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ name: /keerthivasan/i });
    if (!user) {
      console.log('User not found');
      return;
    }

    const progressRecords = await Progress.find({ student: user._id });
    console.log(`Progress records for ${user.name}:`);
    for (const p of progressRecords) {
      console.log(` - Progress ID: ${p._id}, Course: ${p.course}, Completed: ${p.completedAssignments}, Total: ${p.totalAssignments}`);
    }

    const assignments = await Assignment.find({ 'submissions.student': user._id });
    console.log(`Assignments with submissions from ${user.name}:`);
    assignments.forEach(a => {
      const sub = a.submissions.find(s => s.student.toString() === user._id.toString());
      console.log(` - Assignment: ${a.title}, Status: ${sub.status}`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkSync();
