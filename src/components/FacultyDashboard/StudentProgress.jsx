import React, { useState } from 'react';
import '../../../src/styles/components.css';

export default function StudentProgress() {
  const [students, setStudents] = useState([
    { id: 1, name: 'John Doe', enrollmentId: 'STU-001', courseId: 'CS-101', progress: 75, status: 'On Track' },
    { id: 2, name: 'Jane Smith', enrollmentId: 'STU-002', courseId: 'CS-101', progress: 65, status: 'Needs Support' },
    { id: 3, name: 'Bob Johnson', enrollmentId: 'STU-003', courseId: 'CS-101', progress: 88, status: 'Excellent' },
    { id: 4, name: 'Alice Brown', enrollmentId: 'STU-004', courseId: 'CS-102', progress: 60, status: 'Needs Support' },
    { id: 5, name: 'Charlie Wilson', enrollmentId: 'STU-005', courseId: 'CS-102', progress: 78, status: 'On Track' },
  ]);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [updatedProgress, setUpdatedProgress] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const handleUpdateProgress = (studentId) => {
    if (updatedProgress && selectedStatus) {
      setStudents(students.map(s => 
        s.id === studentId 
          ? { ...s, progress: parseInt(updatedProgress), status: selectedStatus }
          : s
      ));
      setUpdatedProgress('');
      setSelectedStatus('');
      setSelectedStudent(null);
      alert('Student progress updated successfully!');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Excellent':
        return 'excellent';
      case 'On Track':
        return 'on-track';
      case 'Needs Support':
        return 'needs-support';
      default:
        return '';
    }
  };

  return (
    <div className="student-progress-container">
      <div className="section-header">
        <h2>Update Student Progress</h2>
        <p>Monitor and update individual student progress across courses</p>
      </div>

      <div className="student-progress-list">
        {students.map((student) => (
          <div key={student.id} className="student-progress-card">
            <div className="student-header">
              <div className="student-info">
                <h4>{student.name}</h4>
                <p className="enroll-id">{student.enrollmentId} | {student.courseId}</p>
              </div>
              <span className={`status-badge status-${getStatusColor(student.status)}`}>
                {student.status}
              </span>
            </div>

            <div className="progress-display">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${student.progress}%` }}></div>
              </div>
              <span className="progress-value">{student.progress}%</span>
            </div>

            {selectedStudent === student.id ? (
              <div className="progress-update-form">
                <div className="form-row">
                  <div className="form-field">
                    <label>New Progress %</label>
                    <input 
                      type="number" 
                      min="0" 
                      max="100" 
                      value={updatedProgress}
                      onChange={(e) => setUpdatedProgress(e.target.value)}
                      placeholder="Enter progress percentage"
                    />
                  </div>
                  <div className="form-field">
                    <label>Status</label>
                    <select 
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                      <option value="">Select Status</option>
                      <option value="Excellent">Excellent</option>
                      <option value="On Track">On Track</option>
                      <option value="Needs Support">Needs Support</option>
                    </select>
                  </div>
                </div>
                <div className="button-group">
                  <button 
                    className="btn-save"
                    onClick={() => handleUpdateProgress(student.id)}
                  >
                    Save Changes
                  </button>
                  <button 
                    className="btn-cancel"
                    onClick={() => {
                      setSelectedStudent(null);
                      setUpdatedProgress('');
                      setSelectedStatus('');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button 
                className="btn-edit"
                onClick={() => {
                  setSelectedStudent(student.id);
                  setUpdatedProgress(student.progress.toString());
                  setSelectedStatus(student.status);
                }}
              >
                Update Progress
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
