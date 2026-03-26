import React, { useState, useEffect } from 'react';
import { courseAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import '../../../src/styles/components.css';

export default function StudentCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
