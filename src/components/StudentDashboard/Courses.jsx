import React, { useState } from 'react';
import '../../../src/styles/components.css';

export default function StudentCourses() {
  const [courses, setCourses] = useState([
    {
      id: 1,
      code: 'CS-101',
      name: 'Data Structures',
      instructor: 'Dr. Smith',
      credits: 3,
      status: 'In Progress',
      progress: 75,
      grade: 'A',
      startDate: '2024-01-15',
    },
    {
      id: 2,
      code: 'CS-102',
      name: 'Web Development',
      instructor: 'Prof. Johnson',
      credits: 3,
      status: 'In Progress',
      progress: 60,
      grade: 'B+',
      startDate: '2024-01-18',
    },
    {
      id: 3,
      code: 'CS-103',
      name: 'Database Management',
      instructor: 'Dr. Williams',
      credits: 4,
      status: 'In Progress',
      progress: 85,
      grade: 'A-',
      startDate: '2024-01-20',
    },
    {
      id: 4,
      code: 'CS-104',
      name: 'Machine Learning',
      instructor: 'Prof. Brown',
      credits: 4,
      status: 'Completed',
      progress: 100,
      grade: 'A',
      startDate: '2023-09-01',
    },
    {
      id: 5,
      code: 'CSE-105',
      name: 'Sustainability in Tech',
      instructor: 'Dr. Green',
      credits: 3,
      status: 'In Progress',
      progress: 70,
      grade: 'A',
      startDate: '2024-02-01',
    },
  ]);

  return (
    <div className="courses-container">
      <div className="section-header">
        <h2>My Courses</h2>
        <p>Total Enrolled: {courses.length} | Credits: {courses.reduce((sum, c) => sum + c.credits, 0)}</p>
      </div>

      <div className="courses-grid">
        {courses.map((course) => (
          <div key={course.id} className="course-card">
            <div className="course-header">
              <h3>{course.code}</h3>
              <span className={`course-status status-${course.status.toLowerCase().replace(' ', '-')}`}>
                {course.status}
              </span>
            </div>
            <p className="course-title">{course.name}</p>
            <p className="course-instructor">👨‍🏫 {course.instructor}</p>
            
            <div className="course-details">
              <div className="detail-item">
                <span className="detail-label">Credits:</span>
                <span className="detail-value">{course.credits}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Grade:</span>
                <span className="detail-value">{course.grade}</span>
              </div>
            </div>

            <div className="course-progress">
              <div className="progress-header">
                <span>Progress</span>
                <span>{course.progress}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${course.progress}%` }}></div>
              </div>
            </div>

            <button className="course-view-btn">View Details</button>
          </div>
        ))}
      </div>
    </div>
  );
}
