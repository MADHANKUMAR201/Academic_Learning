import React, { useState, useEffect } from 'react';
import { assignmentAPI } from '../../services/api';
import '../../../src/styles/components.css';

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const response = await assignmentAPI.getStudentAssignments();
      if (response.success) {
        setAssignments(response.data || []);
      } else {
        setError(response.message || 'Failed to fetch assignments');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted':
      case 'graded':
        return 'submitted';
      case 'late':
        return 'in-progress';
      case 'pending':
        return 'pending';
      default:
        return 'pending';
    }
  };

  const getDaysUntilDue = (dueDate) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diff = due - today;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const pendingAssignments = assignments.filter(a => !a.isSubmitted);
  const submittedAssignments = assignments.filter(a => a.isSubmitted);

  const [submittingId, setSubmittingId] = useState(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [submissionFile, setSubmissionFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewingId, setViewingId] = useState(null);

  const handleStartSubmit = (assignmentId) => {
    setSubmittingId(assignmentId);
    setSubmissionContent('');
    setSubmissionFile(null);
  };

  const handleCancelSubmit = () => {
    setSubmittingId(null);
    setSubmissionContent('');
    setSubmissionFile(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSubmissionFile(file);
    } else if (file) {
      alert('Please select a PDF file.');
      e.target.value = '';
    }
  };

  const handleConfirmSubmit = async (assignmentId) => {
    if (!submissionContent.trim() && !submissionFile) {
      alert('Please enter your submission content or upload a PDF file.');
      return;
    }

    setIsSubmitting(true);
    try {
      let fileUrl = '';
      if (submissionFile) {
        const uploadRes = await assignmentAPI.uploadFile(submissionFile);
        if (uploadRes.success) {
          fileUrl = uploadRes.data;
        } else {
          alert(uploadRes.message || 'File upload failed');
          setIsSubmitting(false);
          return;
        }
      }

      const response = await assignmentAPI.submitAssignment(assignmentId, { 
        content: submissionContent,
        fileUrl: fileUrl
      });

      if (response.success) {
        alert('Assignment submitted successfully!');
        setSubmittingId(null);
        setSubmissionContent('');
        setSubmissionFile(null);
        fetchAssignments(); // Refresh the list
      } else {
        alert(response.message || 'Failed to submit assignment');
      }
    } catch (err) {
      console.error('Submission error:', err);
      alert('An error occurred during submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading assignments...</div>;
  if (error) return <div className="error">{error}</div>;

  const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

  return (
    <div className="assignments-container">
      <div className="section-header">
        <h2>Assignments</h2>
        <p>Total: {assignments.length} | Submitted: {submittedAssignments.length} | Pending: {pendingAssignments.length}</p>
      </div>

      <div className="assignments-summary">
        <div className="summary-card">
          <h4>📊 Statistics</h4>
          <p>Submitted: <strong>{submittedAssignments.length}</strong></p>
          <p>Pending: <strong>{pendingAssignments.length}</strong></p>
        </div>
      </div>

      <div className="assignments-list">
        {assignments.length > 0 ? assignments.map((assignment) => {
          const status = assignment.isSubmitted ? assignment.studentSubmission?.status : (assignment.isOverdue ? 'late' : 'pending');
          const isCurrentSubmitting = submittingId === assignment._id;
          const isCurrentViewing = viewingId === assignment._id;
          
          return (
            <div key={assignment._id} className="assignment-item">
              <div className="assignment-header">
                <div className="assignment-title-section">
                  <h4>{assignment.title}</h4>
                  <span className="assignment-course">{assignment.course?.code} - {assignment.course?.title}</span>
                </div>
                <span className={`assignment-status status-${getStatusColor(status)}`}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              </div>

              <div className="assignment-details">
                <div className="detail">
                  <span className="label">Due Date:</span>
                  <span className={`value ${getDaysUntilDue(assignment.dueDate) < 3 && !assignment.isSubmitted ? 'urgent' : ''}`}>
                    {new Date(assignment.dueDate).toLocaleString()} {!assignment.isSubmitted && `(${getDaysUntilDue(assignment.dueDate)} days)`}
                  </span>
                </div>
                {assignment.isSubmitted && (
                  <div className="detail">
                    <span className="label">Submitted:</span>
                    <span className="value">{new Date(assignment.studentSubmission.submissionDate).toLocaleString()}</span>
                  </div>
                )}
                {assignment.studentSubmission?.status === 'graded' && (
                  <div className="detail">
                    <span className="label">Score:</span>
                    <span className="value grade-badge">{assignment.studentSubmission.score} / {assignment.maxScore}</span>
                  </div>
                )}
              </div>

              {/* Submission Form */}
              {isCurrentSubmitting && (
                <div className="submission-form-container">
                  <div className="form-group">
                    <label>Upload PDF Assignment:</label>
                    <input 
                      type="file" 
                      accept=".pdf" 
                      onChange={handleFileChange}
                      className="file-input"
                    />
                  </div>
                  
                  <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label>Additional Notes (Optional):</label>
                    <textarea
                      className="submission-textarea"
                      placeholder="Enter any notes here..."
                      value={submissionContent}
                      onChange={(e) => setSubmissionContent(e.target.value)}
                      rows="3"
                    />
                  </div>

                  <div className="form-actions">
                    <button 
                      className="btn-save" 
                      onClick={() => handleConfirmSubmit(assignment._id)}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : 'Confirm Submission'}
                    </button>
                    <button className="btn-cancel" onClick={handleCancelSubmit} disabled={isSubmitting}>Cancel</button>
                  </div>
                </div>
              )}

              {/* View Submission Content */}
              {isCurrentViewing && assignment.isSubmitted && (
                <div className="view-submission-content">
                  {assignment.studentSubmission.fileUrl && (
                    <div className="submission-file-link">
                      <label>Attached PDF:</label>
                      <a 
                        href={`${API_BASE_URL}${assignment.studentSubmission.fileUrl}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn-download"
                      >
                        📄 View PDF Document
                      </a>
                    </div>
                  )}
                  
                  {assignment.studentSubmission.content && (
                    <div className="submission-text-view" style={{ marginTop: '1rem' }}>
                      <label>Submitted Notes:</label>
                      <div className="submitted-text-box">
                        {assignment.studentSubmission.content}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {assignment.studentSubmission?.feedback && (
                <div className="assignment-feedback">
                  <p className="feedback-label">📝 Feedback:</p>
                  <p className="feedback-text">{assignment.studentSubmission.feedback}</p>
                </div>
              )}

              <div className="assignment-actions">
                {!assignment.isSubmitted && !isCurrentSubmitting && (
                  <button className="btn-start" onClick={() => handleStartSubmit(assignment._id)}>
                    Submit Assignment
                  </button>
                )}
                {assignment.isSubmitted && (
                  <button className="btn-view" onClick={() => setViewingId(isCurrentViewing ? null : assignment._id)}>
                    {isCurrentViewing ? 'Hide Submission' : 'View Submission'}
                  </button>
                )}
              </div>
            </div>
          );
        }) : (
          <p>No assignments found.</p>
        )}
      </div>
    </div>
  );
}
