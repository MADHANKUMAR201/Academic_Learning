import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Simple mock schemas
const AssignmentSchema = new mongoose.Schema({
  title: String,
  course: mongoose.Schema.Types.ObjectId,
  submissions: [{
    student: mongoose.Schema.Types.ObjectId,
    status: String,
    score: Number
  }]
}, { collection: 'assignments' });

const ProgressSchema = new mongoose.Schema({
  student: mongoose.Schema.Types.ObjectId,
  course: mongoose.Schema.Types.ObjectId,
  completedAssignments: Number,
  totalAssignments: Number
}, { collection: 'progresses' });

const Assignment = mongoose.model('Assignment', AssignmentSchema);
const Progress = mongoose.model('Progress', ProgressSchema);
const User = mongoose.model('User', new mongoose.Schema({ name: String }, { collection: 'users' }));

async function testSyncFlow() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ name: /keerthivasan/i });
    const courseId = new mongoose.Types.ObjectId('69c39eb17e00b6b3afb4b27e'); // OOPS course
    
    console.log(`Initial state for course ${courseId}:`);
    let progress = await Progress.findOne({ student: user._id, course: courseId });
    console.log(`Completed: ${progress?.completedAssignments}, Total: ${progress?.totalAssignments}`);

    // Create a new assignment
    const newAsgn = new Assignment({
      title: 'TEST SYNC',
      course: courseId,
      submissions: []
    });
    await newAsgn.save();
    console.log('Created new assignment');

    // Submit it
    newAsgn.submissions.push({
      student: user._id,
      status: 'submitted',
      submissionDate: new Date()
    });
    await newAsgn.save();
    console.log('Submitted assignment');

    // Run the sync logic (imitating backend)
    const asgnList = await Assignment.find({ course: courseId });
    let count = 0;
    asgnList.forEach(a => {
        const s = a.submissions?.find(sub => sub.student.toString() === user._id.toString());
        if (s && ['submitted', 'graded', 'late'].includes(s.status)) count++;
    });
    
    progress = await Progress.findOne({ student: user._id, course: courseId });
    progress.completedAssignments = count;
    progress.totalAssignments = asgnList.length;
    await progress.save();
    console.log('Synced progress manually');

    console.log(`Final state: Completed: ${progress.completedAssignments}, Total: ${progress.totalAssignments}`);

    // Cleanup
    await Assignment.deleteOne({ _id: newAsgn._id });
    console.log('Cleaned up');

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

testSyncFlow();
