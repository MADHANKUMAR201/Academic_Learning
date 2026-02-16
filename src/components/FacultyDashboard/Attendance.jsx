import React, { useState } from 'react';
import '../../../src/styles/components.css';

export default function Attendance() {
  const [attendanceData, setAttendanceData] = useState([
    { id: 1, name: 'John Doe', enrollmentId: 'STU-001', presentDays: 40, totalDays: 45, percentage: 89 },
    { id: 2, name: 'Jane Smith', enrollmentId: 'STU-002', presentDays: 35, totalDays: 45, percentage: 78 },
    { id: 3, name: 'Bob Johnson', enrollmentId: 'STU-003', presentDays: 44, totalDays: 45, percentage: 98 },
    { id: 4, name: 'Alice Brown', enrollmentId: 'STU-004', presentDays: 32, totalDays: 45, percentage: 71 },
    { id: 5, name: 'Charlie Wilson', enrollmentId: 'STU-005', presentDays: 42, totalDays: 45, percentage: 93 },
  ]);

  const [editingId, setEditingId] = useState(null);
  const [editPresent, setEditPresent] = useState('');

  const handleAttendanceUpdate = (studentId) => {
    const present = parseInt(editPresent);
    const student = attendanceData.find(s => s.id === studentId);
    
    if (present <= student.totalDays) {
      const newPercentage = Math.round((present / student.totalDays) * 100);
      setAttendanceData(attendanceData.map(s =>
        s.id === studentId
          ? { ...s, presentDays: present, percentage: newPercentage }
          : s
      ));
      setEditingId(null);
      setEditPresent('');
      alert('Attendance updated successfully!');
    } else {
      alert('Present days cannot exceed total days!');
    }
  };

  const getAttendanceColor = (percentage) => {
    if (percentage >= 85) return 'excellent';
    if (percentage >= 75) return 'good';
    if (percentage >= 65) return 'fair';
    return 'poor';
  };

  return (
    <div className="attendance-container">
      <div className="section-header">
        <h2>Manage Attendance</h2>
        <p>Update student attendance records for all enrolled courses</p>
      </div>

      <div className="attendance-summary">
        <div className="summary-stat">
          <h4>Class Average</h4>
          <p className="stat-value">{Math.round(attendanceData.reduce((sum, s) => sum + s.percentage, 0) / attendanceData.length)}%</p>
        </div>
        <div className="summary-stat">
          <h4>At-Risk Students</h4>
          <p className="stat-value">{attendanceData.filter(s => s.percentage < 75).length}</p>
        </div>
      </div>

      <div className="attendance-list">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Enrollment ID</th>
              <th>Present Days</th>
              <th>Total Days</th>
              <th>Attendance %</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {attendanceData.map((student) => (
              <tr key={student.id}>
                <td className="student-name">{student.name}</td>
                <td>{student.enrollmentId}</td>
                <td>{editingId === student.id ? 
                  <input 
                    type="number" 
                    value={editPresent}
                    onChange={(e) => setEditPresent(e.target.value)}
                    min="0"
                    max={student.totalDays}
                  /> 
                  : student.presentDays
                }</td>
                <td>{student.totalDays}</td>
                <td className={`percentage ${getAttendanceColor(student.percentage)}`}>
                  {student.percentage}%
                </td>
                <td className="action-cell">
                  {editingId === student.id ? (
                    <div className="action-buttons">
                      <button 
                        className="btn-save-sm"
                        onClick={() => handleAttendanceUpdate(student.id)}
                      >
                        Save
                      </button>
                      <button 
                        className="btn-cancel-sm"
                        onClick={() => {
                          setEditingId(null);
                          setEditPresent('');
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button 
                      className="btn-edit-sm"
                      onClick={() => {
                        setEditingId(student.id);
                        setEditPresent(student.presentDays.toString());
                      }}
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="attendance-warning">
        <h4>⚠️ Students with Low Attendance</h4>
        <ul>
          {attendanceData.filter(s => s.percentage < 75).map(s => (
            <li key={s.id}>{s.name} - {s.percentage}% attendance</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
