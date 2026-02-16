import React, { useState } from 'react';
import '../../../src/styles/components.css';

export default function StudentProgress() {
  const [progressData, setProgressData] = useState({
    overallProgress: 72,
    courseProgress: [
      { course: 'Data Structures', progress: 75, target: 100 },
      { course: 'Web Development', progress: 60, target: 100 },
      { course: 'Database Management', progress: 85, target: 100 },
      { course: 'Machine Learning', progress: 100, target: 100 },
      { course: 'Sustainability in Tech', progress: 70, target: 100 },
    ],
    academicMetrics: {
      semesterGPA: 3.8,
      cumulativeGPA: 3.75,
      targetGPA: 3.8,
      completedCredits: 95,
      requiredCredits: 120,
    },
  });

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
          <li>Increase focus on Web Development - currently at 60%</li>
          <li>Maintain consistency in Data Structures - excellent progress at 75%</li>
          <li>Complete pending assignments to boost overall progress</li>
          <li>Review sustainability topics to strengthen course understanding</li>
        </ul>
      </div>
    </div>
  );
}
