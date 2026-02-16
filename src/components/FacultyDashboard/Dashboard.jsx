import React, { useState } from 'react';
import '../../../src/styles/components.css';

export default function FacultyDashboard() {
  const facultyData = {
    name: 'Dr. Smith',
    facultyId: 'FAC-2024-001',
    department: 'Computer Science',
    totalStudents: 145,
    totalCourses: 3,
  };

  const courseStats = [
    { code: 'CS-101', name: 'Data Structures', students: 45, avgProgress: 75, avgSustainability: 82 },
    { code: 'CS-102', name: 'Web Development', students: 50, avgProgress: 68, avgSustainability: 78 },
    { code: 'CS-103', name: 'Database Management', students: 50, avgProgress: 82, avgSustainability: 85 },
  ];

  const recentUpdates = [
    { timestamp: '2024-02-10 14:30', event: 'Updated progress for 25 students in CS-101' },
    { timestamp: '2024-02-09 10:15', event: 'Marked attendance for CS-102 class' },
    { timestamp: '2024-02-08 16:45', event: 'Graded 18 assignments in CS-103' },
    { timestamp: '2024-02-07 09:00', event: 'Calculated sustainability scores for all courses' },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Faculty Dashboard</h2>
        <p>Welcome, {facultyData.name}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Students</h3>
            <p className="stat-value">{facultyData.totalStudents}</p>
            <span className="stat-label">Under supervision</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <h3>Active Courses</h3>
            <p className="stat-value">{facultyData.totalCourses}</p>
            <span className="stat-label">This semester</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Avg Class Progress</h3>
            <p className="stat-value">75%</p>
            <span className="stat-label">Across all courses</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🌱</div>
          <div className="stat-content">
            <h3>Avg Sustainability Score</h3>
            <p className="stat-value">81.7%</p>
            <span className="stat-label">All students</span>
          </div>
        </div>
      </div>

      <div className="faculty-courses-section">
        <h3>Course Overview</h3>
        <div className="course-stats-grid">
          {courseStats.map((course, idx) => (
            <div key={idx} className="course-stat-card">
              <h4>{course.code}</h4>
              <p className="course-stat-name">{course.name}</p>
              <div className="course-stat-item">
                <span>Students:</span>
                <strong>{course.students}</strong>
              </div>
              <div className="course-stat-item">
                <span>Avg Progress:</span>
                <strong>{course.avgProgress}%</strong>
              </div>
              <div className="course-stat-item">
                <span>Avg Sustainability:</span>
                <strong>{course.avgSustainability}%</strong>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard-section">
        <h3>Recent Updates</h3>
        <div className="updates-list">
          {recentUpdates.map((update, idx) => (
            <div key={idx} className="update-item">
              <span className="update-timestamp">{update.timestamp}</span>
              <span className="update-event">{update.event}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
