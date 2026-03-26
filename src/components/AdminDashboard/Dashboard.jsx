import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import '../../../src/styles/components.css';

export default function AdminDashboard() {
  const [adminData, setAdminData] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalFaculty: 0,
    totalCourses: 0,
    averageSustainabilityScore: 0,
    systemHealth: 100, // Still hardcoded as health is not yet implemented in backend
  });
  const [loading, setLoading] = useState(true);

  const [recentActivities, setRecentActivities] = useState([
    { timestamp: new Date().toLocaleDateString(), action: 'System online', type: 'system' },
  ]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getAnalyticsOverview();
      if (response.success) {
        setAdminData({
          ...adminData,
          ...response.data,
          averageSustainabilityScore: Math.round(response.data.averageSustainabilityScore || 0)
        });
      }
      
      // Fetch users for recent activity (simplified version)
      const usersRes = await adminAPI.getAllUsers();
      if (usersRes.success) {
        const sortedUsers = (usersRes.data || [])
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
          .map(u => ({
            timestamp: new Date(u.createdAt).toLocaleString(),
            action: `New user registration: ${u.name} (${u.role})`,
            type: 'user-register'
          }));
        setRecentActivities(sortedUsers);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

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
