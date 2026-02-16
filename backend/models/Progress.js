import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    overallGrade: {
      type: Number,
      default: 0,
    },
    completedAssignments: {
      type: Number,
      default: 0,
    },
    totalAssignments: {
      type: Number,
      default: 0,
    },
    attendancePercentage: {
      type: Number,
      default: 0,
    },
    partic: {
      type: Number,
      default: 0,
    },
    sustainabilityScore: {
      type: Number,
      default: 0,
      description: 'Score based on learning sustainability and engagement',
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Progress', progressSchema);
