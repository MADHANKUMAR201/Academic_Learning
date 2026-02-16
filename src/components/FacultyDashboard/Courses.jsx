import React, { useState } from 'react';
import '../../../src/styles/components.css';

export default function FacultyCourses() {
  const [courses, setCourses] = useState([
    {
      id: 1,
      code: 'CS-101',
      name: 'Data Structures',
      semester: '6th',
      students: 45,
      credits: 3,
      schedule: 'MWF 10:00-11:00 AM',
      room: 'Room 101',
      description: 'Comprehensive study of data structures including arrays, linked lists, trees, and graphs.',
      status: 'Active',
    },
    {
      id: 2,
      code: 'CS-102',
      name: 'Web Development',
      semester: '6th',
      students: 50,
      credits: 3,
      schedule: 'TTh 2:00-3:30 PM',
      room: 'Lab 205',
      description: 'Full-stack web development using HTML, CSS, JavaScript, React, and Node.js.',
      status: 'Active',
    },
    {
      id: 3,
      code: 'CS-103',
      name: 'Database Management',
      semester: '6th',
      students: 50,
      credits: 4,
      schedule: 'MWF 1:00-2:00 PM',
      room: 'Room 203',
      description: 'Database design, normalization, SQL, and relational database management systems.',
      status: 'Active',
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    semester: '',
    credits: '',
    schedule: '',
    room: '',
    description: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddCourse = () => {
    if (formData.code && formData.name && formData.credits) {
      setCourses([...courses, {
        id: courses.length + 1,
        ...formData,
        students: 0,
        status: 'Active',
      }]);
      setFormData({
        code: '',
        name: '',
        semester: '',
        credits: '',
        schedule: '',
        room: '',
        description: '',
      });
      setShowForm(false);
      alert('Course added successfully!');
    }
  };

  return (
    <div className="courses-management-container">
      <div className="section-header">
        <h2>Manage Courses</h2>
        <button className="btn-add-course" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Close' : '+ Add New Course'}
        </button>
      </div>

      {showForm && (
        <div className="add-course-form">
          <h3>Add New Course</h3>
          <div className="form-row">
            <div className="form-field">
              <label>Course Code</label>
              <input 
                type="text" 
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                placeholder="e.g., CS-104"
              />
            </div>
            <div className="form-field">
              <label>Course Name</label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Advanced Algorithms"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Semester</label>
              <input 
                type="text" 
                name="semester"
                value={formData.semester}
                onChange={handleInputChange}
                placeholder="e.g., 6th"
              />
            </div>
            <div className="form-field">
              <label>Credits</label>
              <input 
                type="number" 
                name="credits"
                value={formData.credits}
                onChange={handleInputChange}
                placeholder="e.g., 3"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Schedule</label>
              <input 
                type="text" 
                name="schedule"
                value={formData.schedule}
                onChange={handleInputChange}
                placeholder="e.g., MWF 10:00-11:00 AM"
              />
            </div>
            <div className="form-field">
              <label>Room</label>
              <input 
                type="text" 
                name="room"
                value={formData.room}
                onChange={handleInputChange}
                placeholder="e.g., Room 101"
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
                placeholder="Course description..."
                rows="3"
              />
            </div>
          </div>

          <button className="btn-save" onClick={handleAddCourse}>Add Course</button>
        </div>
      )}

      <div className="courses-grid">
        {courses.map((course) => (
          <div key={course.id} className="course-management-card">
            <div className="card-header">
              <h3>{course.code}</h3>
              <span className="status-badge">{course.status}</span>
            </div>

            <h4>{course.name}</h4>

            <div className="course-details">
              <div className="detail">
                <span className="label">👥 Students:</span>
                <span className="value">{course.students}</span>
              </div>
              <div className="detail">
                <span className="label">📚 Credits:</span>
                <span className="value">{course.credits}</span>
              </div>
              <div className="detail">
                <span className="label">📅 Schedule:</span>
                <span className="value">{course.schedule}</span>
              </div>
              <div className="detail">
                <span className="label">📍 Location:</span>
                <span className="value">{course.room}</span>
              </div>
              <div className="detail">
                <span className="label">Semester:</span>
                <span className="value">{course.semester}</span>
              </div>
            </div>

            {course.description && (
              <p className="course-description">{course.description}</p>
            )}

            <div className="card-actions">
              <button className="btn-edit-course">Edit</button>
              <button className="btn-view-students">View Students</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
