import Progress from '../models/Progress.js';
import User from '../models/User.js';
import Assignment from '../models/Assignment.js';

export const syncStudentProgress = async (studentId, courseId) => {
  try {
    const courseAssignments = await Assignment.find({ course: courseId });
    
    let completedCount = 0;
    let totalWeightedScore = 0;
    let gradedCount = 0;

    courseAssignments.forEach(asgn => {
      const s = asgn.submissions.find(subm => 
        (subm.student._id || subm.student).toString() === studentId.toString()
      );
      if (s && ['submitted', 'graded', 'late'].includes(s.status)) {
        completedCount++;
      }
      if (s && s.status === 'graded') {
        gradedCount++;
        totalWeightedScore += (s.score / asgn.maxScore) * 100;
      }
    });

    // -- AUTOMATED SUSTAINABILITY CALCULATION --
    const user = await User.findById(studentId);
    const attendanceScore = user?.academicInfo?.attendancePercentage || 0;
    const assignmentScore = courseAssignments.length > 0 ? (completedCount / courseAssignments.length) * 100 : 0;
    const gradeScore = gradedCount > 0 ? Math.round(totalWeightedScore / gradedCount) : 0;

    // Formula: 30% Attendance + 30% Assignments + 40% Progress (Overall Grade)
    const sustainabilityScore = Math.round(
      (attendanceScore * 0.3) + 
      (assignmentScore * 0.3) + 
      (gradeScore * 0.4)
    );

    let studentProgress = await Progress.findOne({ student: studentId, course: courseId });
    if (!studentProgress) {
      studentProgress = new Progress({
        student: studentId,
        course: courseId,
        totalAssignments: courseAssignments.length,
        completedAssignments: completedCount,
        overallGrade: gradeScore,
        sustainabilityScore: sustainabilityScore
      });
    } else {
      studentProgress.totalAssignments = courseAssignments.length;
      studentProgress.completedAssignments = completedCount;
      // Note: If gradedCount is 0, we might want to keep the manual overallGrade if it exists,
      // but usually the synced grade is the source of truth if assignments exist.
      if (gradedCount > 0) {
        studentProgress.overallGrade = gradeScore;
      }
      studentProgress.sustainabilityScore = sustainabilityScore;
      studentProgress.lastUpdated = new Date();
    }
    
    await studentProgress.save();

    // -- RECALCULATE GLOBAL SUSTAINABILITY FOR THE USER --
    const allProgress = await Progress.find({ student: studentId });
    if (allProgress.length > 0) {
      const totalSustain = allProgress.reduce((sum, p) => sum + (p.sustainabilityScore || 0), 0);
      const avgSustain = Math.round(totalSustain / allProgress.length);
      
      await User.findByIdAndUpdate(studentId, {
        $set: { 'academicInfo.overallSustainability': avgSustain }
      });
    }

    return studentProgress;
  } catch (err) {
    console.error('Sync Error:', err);
    return null;
  }
};
