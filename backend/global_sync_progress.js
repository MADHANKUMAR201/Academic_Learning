import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const AssignmentSchema = new mongoose.Schema({
  course: mongoose.Schema.Types.ObjectId,
  maxScore: Number,
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
  totalAssignments: Number,
  overallGrade: Number,
  lastUpdated: Date
}, { collection: 'progresses' });

const Assignment = mongoose.model('Assignment', AssignmentSchema);
const Progress = mongoose.model('Progress', ProgressSchema);
const Course = mongoose.model('Course', new mongoose.Schema({ students: [mongoose.Schema.Types.ObjectId] }, { collection: 'courses' }));

async function globalCleanup() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const progresses = await Progress.find();
    console.log(`Processing ${progresses.length} progress records...`);

    for (const p of progresses) {
      const courseId = p.course;
      const studentId = p.student;

      const courseAssignments = await Assignment.find({ course: courseId });
      
      let completedCount = 0;
      let totalWeightedScore = 0;
      let gradedCount = 0;

      courseAssignments.forEach(asgn => {
        const s = asgn.submissions?.find(subm => 
          subm.student?.toString() === studentId.toString()
        );
        if (s && ['submitted', 'graded', 'late'].includes(s.status)) {
          completedCount++;
        }
        if (s && s.status === 'graded') {
          gradedCount++;
          totalWeightedScore += (s.score / asgn.maxScore) * 100;
        }
      });

      p.totalAssignments = courseAssignments.length;
      p.completedAssignments = completedCount;
      if (gradedCount > 0) {
        p.overallGrade = Math.round(totalWeightedScore / gradedCount);
      } else {
        p.overallGrade = 0;
      }
      p.lastUpdated = new Date();
      
      await p.save();
      console.log(`Updated Progress ${p._id}: ${completedCount}/${courseAssignments.length}`);
    }

    console.log('Global cleanup complete!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

globalCleanup();
