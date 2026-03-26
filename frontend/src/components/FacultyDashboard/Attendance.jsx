import React, { useState, useEffect } from 'react';
import '../../../src/styles/components.css';
import { adminAPI } from '../../services/api';

export default function Attendance() {
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editingId, setEditingId] = useState(null); // student._id
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await adminAPI.getUsersByRole('student');
        if (response.success) {
          setAllStudents(response.data);
        } else {
          setError(response.message || 'Failed to fetch students');
        }
      } catch (err) {
        setError(err.message || 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const handleAttendanceUpdate = async (studentId) => {
    const percentage = parseInt(editValue);
    
    if (percentage >= 0 && percentage <= 100) {
      try {
        const response = await adminAPI.updateStudentAttendance(studentId, percentage);
        if (response.success) {
          setAllStudents(allStudents.map(s => 
            s._id === studentId 
              ? { ...s, academicInfo: { ...s.academicInfo, attendancePercentage: percentage } } 
              : s
          ));
          setEditingId(null);
          setEditValue('');
          alert('Attendance updated successfully for the student!');
        } else {
          alert(`Failed to update attendance: ${response.message || 'Error'}`);
        }
      } catch (err) {
        alert(`An error occurred: ${err.message}`);
      }
    } else {
      alert('Percentage must be between 0 and 100');
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
        <h2>Manage Student Attendance</h2>
        <p>Update global attendance records for all students in the system</p>
      </div>

      {loading && <div className="loading-spinner" style={{ margin: '2rem auto' }}></div>}
      {error && <div className="error-message" style={{ margin: '1rem', padding: '1rem', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '4px' }}>{error}</div>}
      
      {!loading && !error && (
        allStudents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
            <h4>No students found in the database.</h4>
          </div>
        ) : (
          <div className="attendance-list">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Enrollment ID</th>
                  <th>Email</th>
                  <th>Global Attendance %</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {allStudents.map((student) => {
                  const attendance = student.academicInfo?.attendancePercentage || 0;
                  return (
                    <tr key={student._id}>
                      <td className="student-name">{student.name}</td>
                      <td>{student.studentId || 'N/A'}</td>
                      <td>{student.email}</td>
                      <td className={`percentage ${getAttendanceColor(attendance)}`}>
                        {editingId === student._id ? (
                          <input 
                            type="number" 
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            min="0"
                            max="100"
                            style={{ width: '60px', padding: '4px', borderRadius: '4px', border: '1px solid #ddd' }}
                          />
                        ) : (
                          `${attendance}%`
                        )}
                      </td>
                      <td className="action-cell">
                        {editingId === student._id ? (
                          <div className="action-buttons">
                            <button 
                              className="btn-save-sm"
                              onClick={() => handleAttendanceUpdate(student._id)}
                            >
                              Save
                            </button>
                            <button 
                              className="btn-cancel-sm"
                              onClick={() => {
                                setEditingId(null);
                                setEditValue('');
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button 
                            className="btn-edit-sm"
                            onClick={() => {
                              setEditingId(student._id);
                              setEditValue(attendance.toString());
                            }}
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}
