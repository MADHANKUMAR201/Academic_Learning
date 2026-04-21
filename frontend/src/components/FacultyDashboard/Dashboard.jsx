import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { courseAPI, assignmentAPI } from '../../services/api';
import '../../../src/styles/components.css';

// Helper: format a date to "X minutes/hours/days ago" or full date
function timeAgo(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

// Icon map for update types
const UPDATE_ICONS = {
  submission: '📝',
  graded:     '✅',
  assignment: '📋',
  enrollment: '👥',
  system:     '⚙️',
};

export default function FacultyDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeCourses: 0,
    avgProgress: 0,
    avgSustainability: 0,
    courseStats: []
  });
  const [recentUpdates, setRecentUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [statsRes, assignmentsRes] = await Promise.all([
        courseAPI.getFacultyStats(),
        assignmentAPI.getFacultyAssignments(),
      ]);

      if (statsRes.success) {
        setStats(statsRes.data);
      }

      // Build real recent updates
      const updates = [];

      if (assignmentsRes.success && assignmentsRes.data) {
        const assignments = assignmentsRes.data;

        // New assignments created (sorted by createdAt)
        assignments
          .filter(a => a.createdAt)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 2)
          .forEach(a => {
            updates.push({
              timestamp: a.createdAt,
              type: 'assignment',
              event: `Assignment created: "${a.title}" in ${a.course?.code || 'course'}`,
            });
          });

        // Recent submissions across all assignments
        assignments.forEach(a => {
          (a.submissions || []).forEach(sub => {
            if (sub.submissionDate) {
              if (sub.status === 'graded') {
                updates.push({
                  timestamp: sub.submissionDate,
                  type: 'graded',
                  event: `"${a.title}" graded for ${sub.student?.name || 'a student'} — Score: ${sub.score}/${a.maxScore}`,
                });
              } else {
                updates.push({
                  timestamp: sub.submissionDate,
                  type: 'submission',
                  event: `${sub.student?.name || 'A student'} submitted "${a.title}"`,
                });
              }
            }
          });
        });
      }

      // Add enrollment update from course stats if available
      if (statsRes.success && statsRes.data?.courseStats?.length > 0) {
        statsRes.data.courseStats.forEach(course => {
          if (course.students > 0) {
            updates.push({
              timestamp: new Date(Date.now() - 86400000).toISOString(), // yesterday as baseline
              type: 'enrollment',
              event: `${course.students} student${course.students > 1 ? 's' : ''} enrolled in ${course.code}`,
            });
          }
        });
      }

      // Sort all updates by timestamp desc, take top 6
      const sorted = updates
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 6);

      setRecentUpdates(
        sorted.length > 0
          ? sorted
          : [{ timestamp: new Date().toISOString(), type: 'system', event: 'No recent activity yet.' }]
      );
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
              <span className="update-icon">{UPDATE_ICONS[update.type] || '🔔'}</span>
              <span className="update-timestamp">{timeAgo(update.timestamp)}</span>
              <span className="update-event">{update.event}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
