import React, { useState, useEffect } from 'react';
import { assignmentAPI, courseAPI, BASE_URL } from '../../services/api';
import '../../../src/styles/components.css';

export default function FacultyAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    course: '',
    dueDate: '',
    description: '',
    maxScore: 100,
    type: 'homework',
  });

  // Submission View States
  const [viewingAssignment, setViewingAssignment] = useState(null);
  const [gradingData, setGradingData] = useState({}); // { [submissionId]: { score, feedback } }
  const [settingReminder, setSettingReminder] = useState(null);
  const [reminderText, setReminderText] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [assignmentsRes, coursesRes] = await Promise.all([
        assignmentAPI.getFacultyAssignments(),
        courseAPI.getAllCourses()
      ]);
      
      if (assignmentsRes.success) {
        setAssignments(assignmentsRes.data || []);
        
        // If we are currently viewing an assignment, update its data
        if (viewingAssignment) {
          const updated = (assignmentsRes.data || []).find(a => a._id === viewingAssignment._id);
          if (updated) setViewingAssignment(updated);
        }
      } else {
        setError(assignmentsRes.message || 'Failed to fetch assignments');
      }

      if (coursesRes.success) {
        setCourses(coursesRes.data || []);
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReminder = (assignment) => {
    setSettingReminder(assignment);
    setReminderText(assignment.reminder || '');
  };

  const handleSetReminder = async () => {
    try {
      const response = await assignmentAPI.setReminder(settingReminder._id, reminderText);
      if (response.success) {
        setAssignments(assignments.map(a => 
          a._id === settingReminder._id ? { ...a, reminder: reminderText } : a
        ));
        setSettingReminder(null);
      } else {
        alert(response.message || 'Failed to set reminder');
      }
    } catch (err) {
      alert('Failed to connect to server');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddAssignment = async () => {
    if (formData.title && formData.course && formData.dueDate) {
      try {
        const response = await assignmentAPI.createAssignment(formData);
        if (response.success) {
          setFormData({
            title: '',
            course: '',
            dueDate: '',
            description: '',
            maxScore: 100,
            type: 'homework',
          });
          setShowForm(false);
          alert('Assignment created successfully!');
          fetchData(); // Refresh list to get populated course details
        } else {
          alert(response.message || 'Failed to create assignment');
        }
      } catch (err) {
        alert('Failed to create assignment');
      }
    } else {
      alert('Please fill all required fields (Title, Course, Due Date)');
    }
  };

  const handleGradeInputChange = (submissionId, field, value) => {
    setGradingData(prev => ({
      ...prev,
      [submissionId]: {
        ...(prev[submissionId] || { score: '', feedback: '' }),
        [field]: value
      }
    }));
  };

  const handleGradeSubmit = async (assignmentId, submissionId) => {
    const data = gradingData[submissionId];
    if (!data || data.score === undefined || data.score === '') {
      alert('Please enter a score');
      return;
    }

    try {
      const response = await assignmentAPI.gradeAssignment(assignmentId, {
        submissionId,
        score: Number(data.score),
        feedback: data.feedback || ''
      });

      if (response.success) {
        alert('Submission graded successfully!');
        // Clear grading info for this submission
        setGradingData(prev => {
          const newState = { ...prev };
          delete newState[submissionId];
          return newState;
        });
        fetchData(); // Refresh all data
      } else {
        alert(response.message || 'Failed to grade submission');
      }
    } catch (err) {
      alert('Failed to grade submission');
    }
  };

  const getSubmissionStatus = (submitted, total) => {
    if (total === 0) return 'poor';
    const percentage = Math.round((submitted / total) * 100);
    if (percentage >= 90) return 'excellent';
    if (percentage >= 70) return 'good';
    if (percentage >= 50) return 'fair';
    return 'poor';
  };

  if (loading && !assignments.length) return <div className="loading">Loading assignments...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="assignments-management-container">
      <div className="section-header">
        <h2>Manage Assignments</h2>
        <button className="btn-add-assignment" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Close' : '+ Create New Assignment'}
        </button>
      </div>

      {showForm && (
        <div className="add-assignment-form">
          <h3>Create New Assignment</h3>
          <div className="form-row">
            <div className="form-field">
              <label>Assignment Title *</label>
              <input 
                type="text" 
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Midterm Project"
                required
              />
            </div>
            <div className="form-field">
              <label>Course *</label>
              <select
                name="course"
                value={formData.course}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a Course</option>
                {courses.map(c => (
                  <option key={c._id} value={c._id}>
                    {c.code} - {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Due Date *</label>
              <input 
                type="datetime-local" 
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-field">
              <label>Assignment Type</label>
              <select name="type" value={formData.type} onChange={handleInputChange}>
                <option value="homework">Homework</option>
                <option value="quiz">Quiz</option>
                <option value="project">Project</option>
                <option value="exam">Exam</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Max Score</label>
              <input 
                type="number" 
                name="maxScore"
                value={formData.maxScore}
                onChange={handleInputChange}
                min="1"
              />
            </div>
          </div>

          <div className="form-row full">
            <div className="form-field">
              <label>Description</label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Assignment description and instructions..."
                rows="4"
              />
            </div>
          </div>

          <button className="btn-save" onClick={handleAddAssignment}>Create Assignment</button>
        </div>
      )}

      <div className="assignments-list">
        {assignments.length > 0 ? assignments.map((assignment) => {
          const totalStudents = assignment.course?.students?.length || 0;
          const submittedCount = assignment.submissions?.length || 0;
          const gradedCount = assignment.submissions?.filter(s => s.status === 'graded').length || 0;
          const percentage = totalStudents > 0 ? Math.round((submittedCount / totalStudents) * 100) : 0;
          
          let sumScore = 0;
          let averageGrade = 'N/A';
          if (gradedCount > 0) {
            assignment.submissions.forEach(s => {
              if (s.status === 'graded' && s.score) sumScore += s.score;
            });
            averageGrade = Math.round(sumScore / gradedCount);
          }

          return (
            <div key={assignment._id} className="assignment-management-card">
              <div className="assignment-header-section">
                <div className="assignment-title-info">
                  <h3>{assignment.title}</h3>
                  <p className="course-info">{assignment.course?.code} - {assignment.course?.title}</p>
                </div>
                <span className="due-date">📅 Due: {new Date(assignment.dueDate).toLocaleString()}</span>
              </div>

              <div className="assignment-stats-grid">
                <div className="stat">
                  <span className="stat-label">Total Students</span>
                  <span className="stat-value">{totalStudents}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Submitted</span>
                  <span className={`stat-value ${getSubmissionStatus(submittedCount, totalStudents)}`}>
                    {submittedCount} ({percentage}%)
                  </span>
                </div>
                <div className="stat">
                  <span className="stat-label">Graded</span>
                  <span className="stat-value">{gradedCount}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Average Score</span>
                  <span className="stat-value grade">{averageGrade} {gradedCount > 0 && `/ ${assignment.maxScore}`}</span>
                </div>
              </div>

              <div className="submission-progress">
                <div className="progress-header">
                  <span>Submission Progress</span>
                  <span>{percentage}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
                </div>
              </div>

              <div className="assignment-actions">
                <button 
                  className="btn-view-submissions" 
                  onClick={() => setViewingAssignment(assignment)}
                >
                  View Submissions
                </button>
                <button className="btn-grade" onClick={() => setViewingAssignment(assignment)}>Grade Assignment</button>
                <button 
                  className="btn-send-reminder" 
                  onClick={() => handleOpenReminder(assignment)}
                >
                  {assignment.reminder ? 'Edit Reminder' : 'Set Reminder'}
                </button>
              </div>
            </div>
          );
        }) : (
          <p>No assignments found. Create one above.</p>
        )}
      </div>

      {/* Submissions Modal */}
      {viewingAssignment && (
        <div className="students-modal-overlay" onClick={() => setViewingAssignment(null)}>
          <div className="students-modal-content" style={{ maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="header-info">
                <h3>Submissions: {viewingAssignment.title}</h3>
                <p className="course-info">{viewingAssignment.course?.code} - Max Score: {viewingAssignment.maxScore}</p>
              </div>
              <button className="btn-close-modal" onClick={() => setViewingAssignment(null)}>✕</button>
            </div>

            <div className="student-list-container">
              {viewingAssignment.submissions?.length > 0 ? (
                <div className="submission-list">
                  {viewingAssignment.submissions.map((sub) => (
                    <div key={sub._id} className="submission-item">
                      <div className="submission-header">
                        <div className="student-info-block">
                          <span className="student-name">{sub.student?.name}</span>
                          <span className="student-email">{sub.student?.email}</span>
                        </div>
                        <div className="submission-meta">
                          <span className={`metric-status status-${sub.status === 'graded' ? 'excellent' : 'good'} status-badge-${sub.status}`}>
                            {sub.status.toUpperCase()}
                          </span>
                          <span className="due-date" style={{ display: 'block', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                            {new Date(sub.submissionDate).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {sub.content && (
                        <div className="submission-content-area">
                          <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{sub.content}</p>
                        </div>
                      )}

                      {sub.fileUrl && (
                        <a 
                          href={`${BASE_URL}${sub.fileUrl}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="download-link"
                        >
                          📂 View Attached File
                        </a>
                      )}

                      <div className="grading-section">
                        {sub.status === 'graded' ? (
                          <div className="graded-info">
                            <p><strong>Score:</strong> {sub.score} / {viewingAssignment.maxScore}</p>
                            {sub.feedback && <p><strong>Feedback:</strong> {sub.feedback}</p>}
                            <button 
                              className="btn-edit" 
                              style={{ fontSize: '0.8rem', background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', padding: 0 }}
                              onClick={() => {
                                handleGradeInputChange(sub._id, 'score', sub.score);
                                handleGradeInputChange(sub._id, 'feedback', sub.feedback);
                                // This is a bit of a hack to force showing the inputs again
                                setGradingData(prev => ({ ...prev, [sub._id]: { ...prev[sub._id], isEditing: true } }));
                              }}
                            >
                              Edit Grade
                            </button>
                          </div>
                        ) : null}

                        {(sub.status !== 'graded' || gradingData[sub._id]?.isEditing) && (
                          <div className="grading-inputs">
                            <div className="grade-input-group">
                              <label>Score</label>
                              <input 
                                type="number" 
                                max={viewingAssignment.maxScore}
                                min="0"
                                value={gradingData[sub._id]?.score ?? ''}
                                onChange={(e) => handleGradeInputChange(sub._id, 'score', e.target.value)}
                                placeholder="0"
                              />
                            </div>
                            <div className="grade-input-group" style={{ flex: 1 }}>
                              <label>Feedback</label>
                              <textarea 
                                value={gradingData[sub._id]?.feedback ?? ''}
                                onChange={(e) => handleGradeInputChange(sub._id, 'feedback', e.target.value)}
                                placeholder="Good work..."
                              />
                            </div>
                            <button 
                              className="btn-submit-grade"
                              onClick={() => handleGradeSubmit(viewingAssignment._id, sub._id)}
                            >
                              {sub.status === 'graded' ? 'Update' : 'Grade'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-students-message">
                  <p>No submissions yet for this assignment.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Reminder Modal */}
      {settingReminder && (
        <div className="students-modal-overlay" onClick={() => setSettingReminder(null)}>
          <div className="students-modal-content" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Set Reminder: {settingReminder.title}</h3>
              <button className="btn-close-modal" onClick={() => setSettingReminder(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ padding: '20px' }}>
              <p style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>
                This reminder will be shown to all enrolled students at the top of their dashboard until they dismiss it.
              </p>
              <textarea
                value={reminderText}
                onChange={(e) => setReminderText(e.target.value)}
                placeholder="Enter reminder text here..."
                rows="4"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  marginBottom: '20px',
                  fontSize: '15px'
                }}
              />
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button 
                  className="btn-grade" 
                  style={{ background: '#eee', color: '#333' }}
                  onClick={() => setSettingReminder(null)}
                >
                  Cancel
                </button>
                <button 
                  className="btn-grade"
                  onClick={handleSetReminder}
                >
                  Save Reminder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
