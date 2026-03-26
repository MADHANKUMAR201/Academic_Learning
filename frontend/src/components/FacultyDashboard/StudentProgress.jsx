import React, { useState, useEffect } from 'react';
import '../../../src/styles/components.css';
import { progressAPI } from '../../services/api';

export default function StudentProgress() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await progressAPI.getFacultyAllProgress();
        if (response.success && response.data) {
          const mappedStudents = response.data.map(record => ({
            id: record.student?._id || record.student,
            progressId: record._id,
            name: record.student?.name || 'Unknown Student',
            enrollmentId: record.student?.studentId || 'N/A',
            courseTitle: record.course?.title || 'Assigned Courses',
            courseCode: record.course?.code || '',
            courseId: record.course?._id || record.course,
            progress: record.overallGrade || 0,
            sustainabilityScore: record.student?.academicInfo?.overallSustainability || 0,
            status: record.status || getStatusLabel(record.overallGrade || 0)
          })).filter(s => s.id && s.courseId); // Ensure we have valid IDs
          setStudents(mappedStudents);
        } else {
          setError(response.message || 'Failed to fetch students');
        }
      } catch (err) {
        setError(err.message || 'An error occurred while fetching students');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const [selectedKey, setSelectedKey] = useState(null); // compositeKey: id-courseId
  const [updatedProgress, setUpdatedProgress] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const handleUpdateProgress = async (studentId, courseId) => {
    if (updatedProgress && selectedStatus) {
      try {
        const progressData = {
          student: studentId,
          course: courseId,
          overallGrade: parseInt(updatedProgress)
        };
        
        const response = await progressAPI.updateProgress(progressData);
        if (response.success) {
          const updatedRecord = response.data;
          setStudents(students.map(s => 
            (s.id === studentId && s.courseId === courseId)
              ? { 
                  ...s, 
                  progress: updatedRecord.overallGrade, 
                  sustainabilityScore: updatedRecord.sustainabilityScore,
                  status: selectedStatus 
                }
              : s
          ));
          setUpdatedProgress('');
          setSelectedStatus('');
          setSelectedKey(null);
          alert('Student progress updated successfully and synced with student dashboard!');
        } else {
          alert(`Failed to update progress: ${response.message || 'Required fields missing'}`);
        }
      } catch (err) {
        alert(`An error occurred: ${err.message}`);
      }
    }
  };

  const getStatusLabel = (grade) => {
    if (grade >= 80) return 'Excellent';
    if (grade >= 60) return 'On Track';
    return 'Needs Support';
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
        return 'needs-support';
    }
  };

  return (
    <div className="student-progress-container">
      <div className="section-header">
        <h2>Update Student Progress</h2>
        <p>Monitor and update individual student progress across your assigned courses</p>
      </div>

      {loading && <div className="loading-spinner" style={{ margin: '2rem auto' }}></div>}
      {error && <div className="error-message" style={{ margin: '1rem', padding: '1rem', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '4px' }}>{error}</div>}
      
      {!loading && !error && students.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
          <h4>No students registered yet.</h4>
          <p>Once a student registers for your courses, they will appear here.</p>
        </div>
      )}

      {!loading && !error && students.length > 0 && (
        <div className="student-progress-list">
          {students.map((student) => {
            const compositeKey = `${student.id}-${student.courseId}`;
            return (
              <div key={compositeKey} className="student-progress-card">
                <div className="student-header">
                  <div className="student-info">
                    <h4>{student.name}</h4>
                    <p className="enroll-id">{student.enrollmentId} | {student.courseCode || student.courseTitle}</p>
                  </div>
                  <span className={`status-badge status-${getStatusColor(student.status)}`}>
                    {student.status}
                  </span>
                </div>

                  <div className="progress-display">
                    <div className="progress-info-row">
                      <div className="progress-item">
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${student.progress}%` }}></div>
                        </div>
                        <span className="progress-label">Progress: {student.progress}%</span>
                      </div>
                      <div className="progress-item">
                        <div className="progress-bar sustain">
                          <div className="progress-fill" style={{ width: `${student.sustainabilityScore}%` }}></div>
                        </div>
                        <span className="progress-label">Sustainability: {student.sustainabilityScore}%</span>
                      </div>
                    </div>
                  </div>

                {selectedKey === compositeKey ? (
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
                          placeholder="0-100"
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
                        onClick={() => handleUpdateProgress(student.id, student.courseId)}
                      >
                        Save Changes
                      </button>
                      <button 
                        className="btn-cancel"
                        onClick={() => {
                          setSelectedKey(null);
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
                       setSelectedKey(compositeKey);
                       setUpdatedProgress(student.progress.toString());
                       setSelectedStatus(student.status);
                    }}
                  >
                    Update Progress
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
