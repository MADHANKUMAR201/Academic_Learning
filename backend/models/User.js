import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['student', 'faculty', 'admin'],
      required: true,
    },
    department: {
      type: String,
    },
    studentId: {
      type: String,
      unique: true,
      sparse: true,
    },
    personalInfo: {
      fullName: { type: String },
      enrollmentId: { type: String },
      dateOfBirth: { type: Date },
      phone: { type: String },
      address: { type: String },
    },
    academicInfo: {
      currentSemester: { type: String },
      coursesMajor: { type: String },
      minor: { type: String },
      expectedGraduation: { type: String },
      cumulativeGPA: { type: Number },
      majorGPA: { type: Number },
      attendancePercentage: { type: Number, default: 0 },
      overallSustainability: { type: Number, default: 0 },
    },
    achievements: [{ type: String }],
    enrolledCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    dismissedReminders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment',
      },
    ],
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
