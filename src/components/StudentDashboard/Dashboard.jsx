import React from 'react';
import '../../../src/styles/components.css';

export default function StudentDashboard() {
  const studentData = {
    name: 'John Doe',
    enrollmentId: 'STU-2024-001',
    currentSemester: '6th Semester',
    overallGPA: 3.8,
    sustainabilityScore: 85,
    enrolledCourses: 5,
    completedAssignments: 12,
    totalAssignments: 18,
    attendancePercentage: 92,
  };

  const recentActivity = [
    { date: '2024-02-10', activity: 'Assignment submitted: Data Structures', status: 'Submitted' },
    { date: '2024-02-09', activity: 'Quiz completed: Advanced Algorithms', status: 'Completed' },
    { date: '2024-02-08', activity: 'Attendance marked present', status: 'Present' },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Student Dashboard</h2>
        <p>Welcome, {studentData.name}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <h3>Overall GPA</h3>
            <p className="stat-value">{studentData.overallGPA}</p>
            <span className="stat-label">on 4.0 scale</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🌱</div>
          <div className="stat-content">
            <h3>Sustainability Score</h3>
            <p className="stat-value">{studentData.sustainabilityScore}%</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${studentData.sustainabilityScore}%` }}></div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <h3>Assignments</h3>
            <p className="stat-value">{studentData.completedAssignments}/{studentData.totalAssignments}</p>
            <span className="stat-label">Completed</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Attendance</h3>
            <p className="stat-value">{studentData.attendancePercentage}%</p>
            <span className="stat-label">This semester</span>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          {recentActivity.map((activity, idx) => (
            <div key={idx} className="activity-item">
              <div className="activity-date">{activity.date}</div>
              <div className="activity-details">
                <p className="activity-text">{activity.activity}</p>
                <span className={`activity-status status-${activity.status.toLowerCase().replace(' ', '-')}`}>
                  {activity.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
