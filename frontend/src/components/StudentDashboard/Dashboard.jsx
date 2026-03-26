import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { assignmentAPI, progressAPI } from '../../services/api';
import ReminderBanner from './ReminderBanner';
import '../../../src/styles/components.css';

export default function StudentDashboard() {
  const { user, refreshUser } = useAuth();
  const [stats, setStats] = useState({
    overallGPA: 0,
    sustainabilityScore: 0,
    completedAssignments: 0,
    totalAssignments: 0,
    attendancePercentage: 0,
    enrolledCourses: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [activeReminders, setActiveReminders] = useState([]);
  const [enrolledCourseData, setEnrolledCourseData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDismissReminder = async (assignmentId) => {
    try {
      const response = await assignmentAPI.dismissReminder(assignmentId);
      if (response.success) {
        setActiveReminders(prev => prev.filter(r => r._id !== assignmentId));
      }
    } catch (err) {
      console.error('Failed to dismiss reminder:', err);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [progressRes, assignmentsRes, latestUser] = await Promise.all([
        progressAPI.getMyProgress(),
        assignmentAPI.getStudentAssignments(),
        refreshUser()
      ]);

      if (progressRes.success && progressRes.data) {
        const progress = progressRes.data;
        const totalCourses = progress.length;
        setEnrolledCourseData(progress);
        
        let totalGPA = 0;
        let totalSustain = 0;
        let completed = 0;
        let totalAsgn = 0;

        progress.forEach(p => {
          totalGPA += p.overallGrade || 0;
          totalSustain += p.sustainabilityScore || 0;
          completed += p.completedAssignments || 0;
          totalAsgn += p.totalAssignments || 0;
        });

        setStats({
          overallGPA: totalCourses > 0 ? (totalGPA / totalCourses / 25).toFixed(1) : 0, // Assuming 0-100 to 0-4 scale
          sustainabilityScore: latestUser?.academicInfo?.overallSustainability || user?.academicInfo?.overallSustainability || 0,
          attendancePercentage: latestUser?.academicInfo?.attendancePercentage || user?.academicInfo?.attendancePercentage || 0,
          completedAssignments: completed,
          totalAssignments: totalAsgn,
          enrolledCourses: totalCourses
        });
      }

      if (assignmentsRes.success && assignmentsRes.data) {
        // Filter for active reminders
        const reminders = assignmentsRes.data.filter(a => a.reminder && !a.isReminderDismissed);
        setActiveReminders(reminders);

        // Derive recent activity from assignments
        const sorted = assignmentsRes.data
          .filter(a => a.isSubmitted)
          .sort((a, b) => new Date(b.studentSubmission.submissionDate) - new Date(a.studentSubmission.submissionDate))
          .slice(0, 3)
          .map(a => ({
            date: new Date(a.studentSubmission.submissionDate).toLocaleDateString(),
            activity: `Assignment ${a.studentSubmission.status}: ${a.title}`,
            status: a.studentSubmission.status.charAt(0).toUpperCase() + a.studentSubmission.status.slice(1)
          }));
        setRecentActivity(sorted);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  const displayData = {
    name: user?.name || 'Student',
    ...stats
  };

  return (
    <div className="dashboard-container">
      <ReminderBanner 
        reminders={activeReminders} 
        onDismiss={handleDismissReminder} 
      />
      <div className="dashboard-header">
        <h2>Student Dashboard</h2>
        <p>Welcome, {displayData.name}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <h3>Overall GPA</h3>
            <p className="stat-value">{displayData.overallGPA}</p>
            <span className="stat-label">on 4.0 scale</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🌱</div>
          <div className="stat-content">
            <h3>Sustainability Score</h3>
            <p className="stat-value">{displayData.sustainabilityScore}%</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${displayData.sustainabilityScore}%` }}></div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <h3>Assignments</h3>
            <p className="stat-value">{displayData.completedAssignments}/{displayData.totalAssignments}</p>
            <span className="stat-label">Completed</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Attendance</h3>
            <p className="stat-value">{displayData.attendancePercentage}%</p>
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
