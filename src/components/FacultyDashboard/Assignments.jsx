import React, { useState } from 'react';
import '../../../src/styles/components.css';

export default function FacultyAssignments() {
  const [assignments, setAssignments] = useState([
    {
      id: 1,
      title: 'Data Structures Implementation',
      courseCode: 'CS-101',
      courseName: 'Data Structures',
      dueDate: '2024-02-15',
      totalStudents: 45,
      submitted: 42,
      graded: 35,
      averageGrade: 'A-',
    },
    {
      id: 2,
      title: 'HTML/CSS Project',
      courseCode: 'CS-102',
      courseName: 'Web Development',
      dueDate: '2024-02-20',
      totalStudents: 50,
      submitted: 38,
      graded: 20,
      averageGrade: 'B+',
    },
    {
      id: 3,
      title: 'Database Design',
      courseCode: 'CS-103',
      courseName: 'Database Management',
      dueDate: '2024-02-18',
      totalStudents: 50,
      submitted: 48,
      graded: 40,
      averageGrade: 'A',
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    courseCode: '',
    courseName: '',
    dueDate: '',
    description: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddAssignment = () => {
    if (formData.title && formData.courseCode && formData.dueDate) {
      setAssignments([...assignments, {
        id: assignments.length + 1,
        ...formData,
        totalStudents: 0,
        submitted: 0,
        graded: 0,
        averageGrade: 'N/A',
      }]);
      setFormData({
        title: '',
        courseCode: '',
        courseName: '',
        dueDate: '',
        description: '',
      });
      setShowForm(false);
      alert('Assignment created successfully!');
    }
  };

  const getSubmissionStatus = (submitted, total) => {
    const percentage = Math.round((submitted / total) * 100);
    if (percentage >= 90) return 'excellent';
    if (percentage >= 70) return 'good';
    if (percentage >= 50) return 'fair';
    return 'poor';
  };

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
              <label>Assignment Title</label>
              <input 
                type="text" 
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Midterm Project"
              />
            </div>
            <div className="form-field">
              <label>Course Code</label>
              <input 
                type="text" 
                name="courseCode"
                value={formData.courseCode}
                onChange={handleInputChange}
                placeholder="e.g., CS-101"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Course Name</label>
              <input 
                type="text" 
                name="courseName"
                value={formData.courseName}
                onChange={handleInputChange}
                placeholder="e.g., Data Structures"
              />
            </div>
            <div className="form-field">
              <label>Due Date</label>
              <input 
                type="date" 
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
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
        {assignments.map((assignment) => (
          <div key={assignment.id} className="assignment-management-card">
            <div className="assignment-header-section">
              <div className="assignment-title-info">
                <h3>{assignment.title}</h3>
                <p className="course-info">{assignment.courseCode} - {assignment.courseName}</p>
              </div>
              <span className="due-date">📅 Due: {assignment.dueDate}</span>
            </div>

            <div className="assignment-stats-grid">
              <div className="stat">
                <span className="stat-label">Total Students</span>
                <span className="stat-value">{assignment.totalStudents}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Submitted</span>
                <span className={`stat-value ${getSubmissionStatus(assignment.submitted, assignment.totalStudents)}`}>
                  {assignment.submitted} ({Math.round((assignment.submitted / assignment.totalStudents) * 100)}%)
                </span>
              </div>
              <div className="stat">
                <span className="stat-label">Graded</span>
                <span className="stat-value">{assignment.graded}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Average Grade</span>
                <span className="stat-value grade">{assignment.averageGrade}</span>
              </div>
            </div>

            <div className="submission-progress">
              <div className="progress-header">
                <span>Submission Progress</span>
                <span>{Math.round((assignment.submitted / assignment.totalStudents) * 100)}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${Math.round((assignment.submitted / assignment.totalStudents) * 100)}%` }}></div>
              </div>
            </div>

            <div className="assignment-actions">
              <button className="btn-view-submissions">View Submissions</button>
              <button className="btn-grade">Grade Assignment</button>
              <button className="btn-send-reminder">Send Reminder</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
