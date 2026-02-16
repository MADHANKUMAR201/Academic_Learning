import React, { useState } from 'react';
import '../../../src/styles/components.css';

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState([
    {
      id: 1,
      title: 'Data Structures Implementation',
      course: 'CS-101',
      dueDate: '2024-02-15',
      status: 'Submitted',
      grade: 'A',
      submittedDate: '2024-02-14',
      feedback: 'Excellent implementation with clean code structure. Well done!',
    },
    {
      id: 2,
      title: 'HTML/CSS Project',
      course: 'CS-102',
      dueDate: '2024-02-20',
      status: 'In Progress',
      grade: null,
      submittedDate: null,
      feedback: null,
      progress: 65,
    },
    {
      id: 3,
      title: 'Database Design Assignment',
      course: 'CS-103',
      dueDate: '2024-02-18',
      status: 'Submitted',
      grade: 'A-',
      submittedDate: '2024-02-17',
      feedback: 'Great design. Small optimization suggestions included in comments.',
    },
    {
      id: 4,
      title: 'Sustainability Report',
      course: 'CSE-105',
      dueDate: '2024-02-25',
      status: 'Pending',
      grade: null,
      submittedDate: null,
      feedback: null,
      progress: 0,
    },
    {
      id: 5,
      title: 'Final ML Project',
      course: 'CS-104',
      dueDate: '2024-01-20',
      status: 'Submitted',
      grade: 'A',
      submittedDate: '2024-01-19',
      feedback: 'Outstanding project with innovative approach to the problem.',
    },
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Submitted':
        return 'submitted';
      case 'In Progress':
        return 'in-progress';
      case 'Pending':
        return 'pending';
      default:
        return '';
    }
  };

  const getDaysUntilDue = (dueDate) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diff = due - today;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const pendingAssignments = assignments.filter(a => a.status !== 'Submitted');

  return (
    <div className="assignments-container">
      <div className="section-header">
        <h2>Assignments</h2>
        <p>Total: {assignments.length} | Submitted: {assignments.filter(a => a.status === 'Submitted').length} | Pending: {pendingAssignments.length}</p>
      </div>

      <div className="assignments-summary">
        <div className="summary-card">
          <h4>📊 Statistics</h4>
          <p>Submitted: <strong>{assignments.filter(a => a.status === 'Submitted').length}</strong></p>
          <p>In Progress: <strong>{assignments.filter(a => a.status === 'In Progress').length}</strong></p>
          <p>Pending: <strong>{assignments.filter(a => a.status === 'Pending').length}</strong></p>
        </div>
      </div>

      <div className="assignments-list">
        {assignments.map((assignment) => (
          <div key={assignment.id} className="assignment-item">
            <div className="assignment-header">
              <div className="assignment-title-section">
                <h4>{assignment.title}</h4>
                <span className="assignment-course">{assignment.course}</span>
              </div>
              <span className={`assignment-status status-${getStatusColor(assignment.status)}`}>
                {assignment.status}
              </span>
            </div>

            <div className="assignment-details">
              <div className="detail">
                <span className="label">Due Date:</span>
                <span className={`value ${getDaysUntilDue(assignment.dueDate) < 3 ? 'urgent' : ''}`}>
                  {assignment.dueDate} {assignment.status !== 'Submitted' && `(${getDaysUntilDue(assignment.dueDate)} days)`}
                </span>
              </div>
              {assignment.submittedDate && (
                <div className="detail">
                  <span className="label">Submitted:</span>
                  <span className="value">{assignment.submittedDate}</span>
                </div>
              )}
              {assignment.grade && (
                <div className="detail">
                  <span className="label">Grade:</span>
                  <span className="value grade-badge">{assignment.grade}</span>
                </div>
              )}
              {assignment.progress !== undefined && assignment.progress !== null && (
                <div className="detail">
                  <span className="label">Progress:</span>
                  <div className="inline-progress">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${assignment.progress}%` }}></div>
                    </div>
                    <span className="value">{assignment.progress}%</span>
                  </div>
                </div>
              )}
            </div>

            {assignment.feedback && (
              <div className="assignment-feedback">
                <p className="feedback-label">📝 Feedback:</p>
                <p className="feedback-text">{assignment.feedback}</p>
              </div>
            )}

            <div className="assignment-actions">
              {assignment.status === 'In Progress' && <button className="btn-submit">Submit Assignment</button>}
              {assignment.status === 'Submitted' && <button className="btn-view">View Submission</button>}
              {assignment.status === 'Pending' && <button className="btn-start">Start Assignment</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
