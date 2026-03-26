import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    maxScore: {
      type: Number,
      default: 100,
    },
    type: {
      type: String,
      enum: ['homework', 'quiz', 'project', 'exam', 'reminder'],
      default: 'homework',
    },
    reminder: {
      type: String,
      default: '',
    },
    submissions: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        submissionDate: Date,
        content: {
          type: String, // For text submissions
          required: false,
        },
        fileUrl: {
          type: String, // For file submissions
          required: false,
        },
        score: Number,
        feedback: String,
        status: {
          type: String,
          enum: ['submitted', 'late', 'graded'],
          default: 'submitted',
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('Assignment', assignmentSchema);
