import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { progressAPI } from '../../services/api';
import '../../../src/styles/components.css';

export default function StudentProgress() {
  const { user, refreshUser } = useAuth();
  const [progressData, setProgressData] = useState({
    overallProgress: 0,
    courseProgress: [],
    academicMetrics: {
      semesterGPA: 0,
      cumulativeGPA: 0,
      targetGPA: 4.0,
      completedCredits: 0,
      requiredCredits: 120,
      sustainabilityScore: 0,
    },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    setLoading(true);
    try {
      const [response, latestUser] = await Promise.all([
        progressAPI.getMyProgress(),
        refreshUser()
      ]);
      
      if (response.success && response.data) {
        const data = response.data;
        const totalCourses = data.length;
        
        // Calculate overall stats
        let totalCompleted = 0;
        let totalAsgns = 0;
        let totalGrade = 0;
        let totalSustain = 0;

        const courseProgress = data.map(p => {
          const progressPerc = p.totalAssignments > 0 
            ? Math.round((p.completedAssignments / p.totalAssignments) * 100) 
            : 0;
          
          totalCompleted += p.completedAssignments;
          totalAsgns += p.totalAssignments;
          totalGrade += p.overallGrade;
          totalSustain += p.sustainabilityScore;

          return {
            course: p.course?.title || 'Unknown Course',
            progress: progressPerc,
            target: 100
          };
        });

        const avgProgress = totalAsgns > 0 ? Math.round((totalCompleted / totalAsgns) * 100) : 0;
        const avgGPA = totalCourses > 0 ? (totalGrade / totalCourses / 25).toFixed(2) : 0;

        setProgressData({
          overallProgress: avgProgress,
          courseProgress: courseProgress,
          academicMetrics: {
            semesterGPA: avgGPA,
            cumulativeGPA: avgGPA, // Simplified
            targetGPA: 3.8,
            completedCredits: totalCourses * 3, // Assuming 3 credits per course
            requiredCredits: 120,
            sustainabilityScore: latestUser?.academicInfo?.overallSustainability || user?.academicInfo?.overallSustainability || 0,
          }
        });
      }
    } catch (err) {
      console.error('Failed to fetch progress:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading progress...</div>;

  return (
    <div className="progress-container">
      <div className="section-header">
        <h2>Academic Progress</h2>
        <p>Track your learning progress throughout the semester</p>
      </div>

      <div className="progress-overview">
        <div className="overview-card">
          <h3>Overall Progress</h3>
          <div className="large-progress">
            <div className="progress-circle">
              <span className="progress-percentage">{progressData.overallProgress}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progressData.overallProgress}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <h4>Semester GPA</h4>
          <p className="metric-value">{progressData.academicMetrics.semesterGPA}</p>
          <p className="metric-target">Target: {progressData.academicMetrics.targetGPA}</p>
        </div>
        <div className="metric-card">
          <h4>Cumulative GPA</h4>
          <p className="metric-value">{progressData.academicMetrics.cumulativeGPA}</p>
          <p className="metric-target">Maintained</p>
        </div>
         <div className="metric-card">
          <h4>Sustainability Score</h4>
          <p className="metric-value">{progressData.academicMetrics.sustainabilityScore}%</p>
          <div className="tiny-bar" style={{ margin: '0.5rem auto', width: '80%' }}>
            <div className="tiny-fill" style={{ width: `${progressData.academicMetrics.sustainabilityScore}%`, background: 'var(--success-color)' }}></div>
          </div>
        </div>
        <div className="metric-card">
          <h4>Credits Completed</h4>
          <p className="metric-value">{progressData.academicMetrics.completedCredits}</p>
          <p className="metric-target">Required: {progressData.academicMetrics.requiredCredits}</p>
        </div>
      </div>

      <div className="course-progress-section">
        <h3>Course-wise Progress</h3>
        <div className="course-progress-list">
          {progressData.courseProgress.map((course, idx) => (
            <div key={idx} className="course-progress-item">
              <div className="course-progress-header">
                <span className="course-name">{course.course}</span>
                <span className="progress-percentage">{course.progress}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${course.progress}%` }}></div>
              </div>
              <div className="progress-label">
                {course.progress === 100 ? '✅ Completed' : `In Progress - ${100 - course.progress}% remaining`}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="recommendations">
        <h3>💡 Recommendations</h3>
        <ul className="recommendations-list">
          {progressData.overallProgress < 70 && <li>Complete pending assignments to boost your overall progress</li>}
          {progressData.academicMetrics.sustainabilityScore < 80 && <li>Review sustainability topics and engagement to improve your score</li>}
          <li>Maintain consistency in your courses to reach your target GPA of {progressData.academicMetrics.targetGPA}</li>
          <li>Your attendance is looking {parseFloat(progressData.academicMetrics.semesterGPA) > 3 ? 'great' : 'good'}, keep it up!</li>
        </ul>
      </div>
    </div>
  );
}
