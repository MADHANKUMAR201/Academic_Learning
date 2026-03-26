import React, { useState, useEffect } from 'react';
import { courseAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import '../../../src/styles/components.css';

export default function StudentCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewingMaterials, setViewingMaterials] = useState(null);
  const { user } = useAuth();

  // Fetch courses on component mount
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await courseAPI.getAllCourses();
      if (response.success) {
        setCourses(response.data);
      } else {
        setError(response.message || 'Failed to fetch courses');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      const response = await courseAPI.enrollCourse(courseId);
      if (response.success) {
        // Refresh courses to show updated enrollment
        fetchCourses();
      } else {
        alert(response.message || 'Failed to enroll in course');
      }
    } catch (err) {
      alert('Failed to enroll in course');
    }
  };

  return (
    <div className="courses-container">
      <div className="section-header">
        <h2>Available Courses</h2>
        <p>Total Courses: {courses.length}</p>
      </div>

      {loading && <div className="loading">Loading courses...</div>}
      {error && <div className="error">{error}</div>}

      <div className="courses-grid">
        {courses.map((course) => {
          const isEnrolled = course.students?.some(
            (student) => {
              const studentId = student._id || student;
              const currentUserId = user?._id || user?.id;
              return studentId === currentUserId;
            }
          );

          return (
            <div key={course._id} className="course-card">
              <div className="course-header">
                <h3>{course.code}</h3>
                <span className={`course-status status-${course.isActive ? 'active' : 'inactive'}`}>
                  {course.isActive ? 'Available' : 'Inactive'}
                </span>
              </div>
              
              <p className="course-title">{course.title}</p>
              
              <div className="course-instructor">
                <span>👨‍🏫</span> {course.instructor?.name || 'Not assigned'}
              </div>
              
              <div className="course-details">
                <div className="detail-item">
                  <span className="detail-label">Credits:</span>
                  <span className="detail-value">{course.credits}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Semester:</span>
                  <span className="detail-value">{course.semester} {course.year}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Enrolled:</span>
                  <span className="detail-value">{course.students?.length || 0} students</span>
                </div>
              </div>

              {course.description && (
                <p className="course-description">{course.description}</p>
              )}

               <div className="course-actions">
                <button 
                  className={`course-enroll-btn ${isEnrolled ? 'enrolled' : ''}`}
                  onClick={() => handleEnroll(course._id)}
                  disabled={!course.isActive || isEnrolled}
                >
                  {isEnrolled ? 'Enrolled ✅' : course.isActive ? 'Enroll Now' : 'Not Available'}
                </button>
                {isEnrolled && (
                  <button 
                    className="course-enroll-btn"
                    style={{ marginTop: '0.5rem', backgroundColor: '#4a90e2' }}
                    onClick={() => setViewingMaterials(course)}
                  >
                    View Materials 📄
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Materials Modal Overlay */}
      {viewingMaterials && (
        <div className="students-modal-overlay" onClick={() => setViewingMaterials(null)}>
          <div className="students-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Course Materials: {viewingMaterials.code}</h3>
              <button className="btn-close-modal" onClick={() => setViewingMaterials(null)}>✕</button>
            </div>
            
            <div className="material-list-container" style={{ padding: '1rem', maxHeight: '500px', overflowY: 'auto' }}>
              <p style={{ marginBottom: '1.5rem', color: '#666' }}>Study materials uploaded by your instructor for {viewingMaterials.title}.</p>
              
              {viewingMaterials.materials?.length > 0 ? (
                <ul className="student-list" style={{ listStyle: 'none', padding: 0 }}>
                  {viewingMaterials.materials.map((m) => (
                    <li key={m._id} className="student-list-item" style={{ display: 'flex', alignItems: 'center', padding: '1rem', borderBottom: '1px solid #eee', backgroundColor: '#f9f9f9', borderRadius: '8px', marginBottom: '0.8rem' }}>
                      <div className="student-avatar" style={{ fontSize: '1.8rem', marginRight: '1rem' }}>📕</div>
                      <div className="student-info-block" style={{ flex: 1 }}>
                        <span className="student-name" style={{ fontWeight: '600', display: 'block' }}>{m.title}</span>
                        <span style={{ fontSize: '0.75rem', color: '#999' }}>Uploaded on {new Date(m.uploadedAt).toLocaleDateString()}</span>
                      </div>
                      <a 
                        href={`${courseAPI.BASE_URL}${m.fileUrl}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn-view-students"
                        style={{ textDecoration: 'none', textAlign: 'center', minWidth: '80px' }}
                      >
                        Open PDF
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#888' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📂</div>
                  <p>No study materials have been uploaded for this course yet.</p>
                </div>
              )}
            </div>
            
            <div className="modal-footer" style={{ padding: '1rem', textAlign: 'right', borderTop: '1px solid #eee' }}>
              <button className="btn-save" onClick={() => setViewingMaterials(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
