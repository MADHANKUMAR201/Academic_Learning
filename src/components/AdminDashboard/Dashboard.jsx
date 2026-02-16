import React from 'react';
import '../../../src/styles/components.css';

export default function AdminDashboard() {
  const adminData = {
    totalUsers: 2450,
    totalStudents: 1800,
    totalFaculty: 180,
    totalCourses: 95,
    averageSustainabilityScore: 79,
    systemHealth: 98,
  };

  const recentActivities = [
    { timestamp: '2024-02-10 16:20', action: 'New user registration: STU-2024-0145', type: 'user-register' },
    { timestamp: '2024-02-10 14:35', action: 'Course created: Advanced ML (CS-205)', type: 'course-create' },
    { timestamp: '2024-02-10 12:15', action: 'Faculty updated grades for 35 students', type: 'grade-update' },
    { timestamp: '2024-02-10 10:00', action: 'System backup completed successfully', type: 'system-backup' },
    { timestamp: '2024-02-09 18:45', action: 'Sustainability report generated for all courses', type: 'report-gen' },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Admin Dashboard</h2>
        <p>System Overview & Management</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Users</h3>
            <p className="stat-value">{adminData.totalUsers}</p>
            <span className="stat-label">Active users in system</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎓</div>
          <div className="stat-content">
            <h3>Total Students</h3>
            <p className="stat-value">{adminData.totalStudents}</p>
            <span className="stat-label">Enrolled</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👨‍🏫</div>
          <div className="stat-content">
            <h3>Total Faculty</h3>
            <p className="stat-value">{adminData.totalFaculty}</p>
            <span className="stat-label">Active instructors</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <h3>Active Courses</h3>
            <p className="stat-value">{adminData.totalCourses}</p>
            <span className="stat-label">This semester</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🌱</div>
          <div className="stat-content">
            <h3>Platform Sustainability</h3>
            <p className="stat-value">{adminData.averageSustainabilityScore}%</p>
            <span className="stat-label">Average across all courses</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⚙️</div>
          <div className="stat-content">
            <h3>System Health</h3>
            <p className="stat-value">{adminData.systemHealth}%</p>
            <span className="stat-label">All systems operational</span>
          </div>
        </div>
      </div>

      <div className="admin-section">
        <h3>Recent System Activities</h3>
        <div className="activities-timeline">
          {recentActivities.map((activity, idx) => (
            <div key={idx} className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <span className="activity-time">{activity.timestamp}</span>
                <p className="activity-desc">{activity.action}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
