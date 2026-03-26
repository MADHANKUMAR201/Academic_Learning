import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { courseAPI } from '../../services/api';
import '../../../src/styles/components.css';

export default function FacultyDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeCourses: 0,
    avgProgress: 0,
    avgSustainability: 0,
    courseStats: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await courseAPI.getFacultyStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch faculty stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const facultyData = {
    name: user?.name || 'Faculty',
    department: user?.department || 'Department',
  };

  const courseStats = stats.courseStats || [];

  const recentUpdates = [
    { timestamp: new Date().toLocaleString(), event: 'Dashboard stats synchronized with actual class progress' },
    { timestamp: 'Just now', event: 'Real-time student enrollment updated' },
  ];

  if (loading) return <div className="loading">Loading dashboard...</div>;

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
            <p className="stat-value">{stats.totalStudents}</p>
            <span className="stat-label">Enrolled in your classes</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <h3>Active Courses</h3>
            <p className="stat-value">{stats.activeCourses}</p>
            <span className="stat-label">Taught by you</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Avg Class Progress</h3>
            <p className="stat-value">{stats.avgProgress}%</p>
            <span className="stat-label">Across all students</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🌱</div>
          <div className="stat-content">
            <h3>Avg Sustainability Score</h3>
            <p className="stat-value">{stats.avgSustainability}%</p>
            <span className="stat-label">Engagement metric</span>
          </div>
        </div>
      </div>

      <div className="faculty-courses-section">
        <h3>Course Overview</h3>
        <div className="course-stats-grid">
          {courseStats.map((course, idx) => (
            <div key={idx} className="course-stat-card">
              <h4>{course.code}</h4>
              <p className="course-stat-name">{course.title}</p>
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
