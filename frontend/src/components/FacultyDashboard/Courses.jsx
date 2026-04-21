import React, { useState, useEffect } from 'react';
import { courseAPI } from '../../services/api';
import '../../../src/styles/components.css';

export default function FacultyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // UI States
  const [showForm, setShowForm] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [viewingStudents, setViewingStudents] = useState(null);
  const [viewingMaterials, setViewingMaterials] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [materialTitle, setMaterialTitle] = useState('');

  // Form Data
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    credits: 3,
    semester: '',
    year: new Date().getFullYear(),
  });

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

  const handleOpenAddForm = () => {
    setEditingCourseId(null);
    setFormData({
      code: '',
      title: '',
      description: '',
      credits: 3,
      semester: '',
      year: new Date().getFullYear(),
    });
    setShowForm(!showForm);
  };

  const handleEdit = (course) => {
    setEditingCourseId(course._id);
    setFormData({
      code: course.code || '',
      title: course.title || '',
      description: course.description || '',
      credits: course.credits || 3,
      semester: course.semester || '',
      year: course.year || new Date().getFullYear(),
    });
    setShowForm(true);
    // Scroll to top where the form is
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (editingCourseId) {
        response = await courseAPI.updateCourse(editingCourseId, formData);
        if (response.success) {
          // Update the array without fetching again
          setCourses(courses.map(c => c._id === editingCourseId ? response.data : c));
          alert('Course updated successfully');
        }
      } else {
        response = await courseAPI.createCourse(formData);
        if (response.success) {
          setCourses(prev => [...prev, response.data]);
          alert('Course created successfully');
        }
      }

      if (response.success) {
        handleOpenAddForm(); // Resets and closes
        setShowForm(false);
      } else {
        setError(response.message || 'Failed to save course');
      }
    } catch (err) {
      setError('Failed to save course');
    }
  };

  const handleDelete = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        const response = await courseAPI.deleteCourse(courseId);
        if (response.success) {
          setCourses(courses.filter(c => c._id !== courseId));
          alert('Course deleted successfully');
        } else {
          alert(response.message || 'Failed to delete course');
        }
      } catch (err) {
        alert('Failed to delete course');
      }
    }
  };

  const handleUploadMaterial = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!materialTitle.trim()) {
      alert("Please enter a title for the material");
      return;
    }

    try {
      setUploading(true);
      const uploadRes = await courseAPI.uploadMaterial(file);
      if (uploadRes.success) {
        const materialData = {
          title: materialTitle,
          fileUrl: uploadRes.data
        };
        const courseRes = await courseAPI.addCourseMaterial(viewingMaterials._id, materialData);
        if (courseRes.success) {
          setViewingMaterials(courseRes.data);
          setCourses(courses.map(c => c._id === courseRes.data._id ? courseRes.data : c));
          setMaterialTitle('');
          alert('Material uploaded successfully!');
        }
      }
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    if (window.confirm('Delete this material?')) {
      try {
        const response = await courseAPI.deleteCourseMaterial(viewingMaterials._id, materialId);
        if (response.success) {
          setViewingMaterials(response.data);
          setCourses(courses.map(c => c._id === response.data._id ? response.data : c));
        }
      } catch (err) {
        alert('Delete failed');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="courses-management-container">
      <div className="section-header">
        <h2>Manage Courses</h2>
        <button className="btn-add-course" onClick={handleOpenAddForm}>
          {showForm ? '✕ Close Form' : '+ Add New Course'}
        </button>
      </div>

      {showForm && (
        <div className="add-course-form">
          <h3>{editingCourseId ? 'Edit Course Settings' : 'Create New Course'}</h3>
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
                name="title"
                value={formData.title}
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
                placeholder="e.g., Fall, Spring, Summer"
              />
            </div>
            <div className="form-field">
              <label>Year</label>
              <input 
                type="number" 
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                placeholder="e.g., 2024"
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

          <button className="btn-save" onClick={handleSubmit}>
            {editingCourseId ? 'Save Changes' : 'Create Course'}
          </button>
        </div>
      )}

      {loading && <div className="loading">Loading courses...</div>}
      {error && <div className="error">{error}</div>}

      <div className="courses-grid">
        {courses.map((course) => (
          <div key={course._id} className="course-management-card">
            <div className="card-header">
              <h3>{course.code}</h3>
              <div className="header-right">
                <span className="status-badge">{course.isActive ? 'Active' : 'Inactive'}</span>
                <button
                  className="btn-delete-course-small"
                  onClick={() => handleDelete(course._id)}
                  title="Delete Course"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    {/* Lid handle */}
                    <path d="M9 3h6a1 1 0 0 1 1 1H8a1 1 0 0 1 1-1z"/>
                    {/* Lid bar */}
                    <rect x="3" y="5" width="18" height="2" rx="1"/>
                    {/* Bin body */}
                    <path d="M5 8l1.5 13A1 1 0 0 0 7.5 22h9a1 1 0 0 0 1-.87L19 8H5zm4 2h1l.5 9H9.5L9 10zm5 0h1l-.5 9h-1l.5-9z"/>
                  </svg>
                </button>
              </div>
            </div>

            <h4>{course.title}</h4>

            <div className="course-details">
              <div className="detail-item">
                <span className="detail-label">👥 Students:</span>
                <span className="detail-value">{course.students?.length || 0}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">📚 Credits:</span>
                <span className="detail-value">{course.credits}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">📅 Semester:</span>
                <span className="detail-value">{course.semester} {course.year}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">👨‍🏫 Instructor:</span>
                <span className="detail-value">{course.instructor?.name || 'Not assigned'}</span>
              </div>
            </div>

            {course.description && (
              <p className="course-description">{course.description}</p>
            )}

            <div className="card-actions">
              <button className="btn-edit-course" onClick={() => handleEdit(course)}>Edit</button>
              <button className="btn-view-students" onClick={() => setViewingStudents(course)}>
                Students ({course.students?.length || 0})
              </button>
              <button className="btn-manage-materials" onClick={() => setViewingMaterials(course)}>
                Materials ({course.materials?.length || 0})
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Students Modal Overlay */}
      {viewingStudents && (
        <div className="students-modal-overlay" onClick={() => setViewingStudents(null)}>
          <div className="students-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Enrolled Students: {viewingStudents.code}</h3>
              <button className="btn-close-modal" onClick={() => setViewingStudents(null)}>✕</button>
            </div>
            
            {viewingStudents.students?.length > 0 ? (
              <div className="student-list-container">
                <ul className="student-list">
                  {viewingStudents.students.map((student, idx) => (
                    <li key={student._id || idx} className="student-list-item">
                      <div className="student-avatar">🎓</div>
                      <div className="student-info-block">
                        <span className="student-name">{student.name}</span>
                        <span className="student-email">{student.email}</span>
                      </div>
                      <span className="student-badge">Active</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="no-students-message">
                <p>No students have enrolled in this course yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Materials Modal Overlay */}
      {viewingMaterials && (
        <div className="students-modal-overlay" onClick={() => setViewingMaterials(null)}>
          <div className="students-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Manage Materials: {viewingMaterials.code}</h3>
              <button className="btn-close-modal" onClick={() => setViewingMaterials(null)}>✕</button>
            </div>

            <div className="upload-section" style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>
              <h4>Upload New PDF</h4>
              <div className="form-field" style={{ marginBottom: '1rem' }}>
                <input 
                  type="text" 
                  placeholder="Material Title (e.g. Week 1 Lecture)" 
                  value={materialTitle}
                  onChange={(e) => setMaterialTitle(e.target.value)}
                  style={{ marginBottom: '0.5rem', width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input 
                    type="file" 
                    accept=".pdf" 
                    onChange={handleUploadMaterial}
                    disabled={uploading}
                  />
                  {uploading && <span style={{ fontSize: '0.9rem', color: '#666' }}>Uploading...</span>}
                </div>
              </div>
            </div>
            
            <div className="material-list-container" style={{ padding: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
              <h4>Current Materials</h4>
              {viewingMaterials.materials?.length > 0 ? (
                <ul className="student-list" style={{ listStyle: 'none', padding: 0 }}>
                  {viewingMaterials.materials.map((m) => (
                    <li key={m._id} className="student-list-item" style={{ display: 'flex', alignItems: 'center', padding: '12px', borderBottom: '1px solid #f0f0f0', borderRadius: '8px', marginBottom: '8px', backgroundColor: '#fafafa' }}>
                      <div className="student-avatar" style={{ marginRight: '15px', fontSize: '1.5rem' }}>📄</div>
                      <div className="student-info-block" style={{ flex: 1 }}>
                        <span className="student-name" style={{ display: 'block', fontWeight: '600', color: '#333' }}>{m.title}</span>
                        <a 
                          href={`${courseAPI.BASE_URL}${m.fileUrl}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="view-link"
                          style={{ fontSize: '0.85rem', color: 'var(--primary-color)', textDecoration: 'none', fontWeight: '500' }}
                        >
                          View PDF material
                        </a>
                      </div>
                      <button 
                         className="btn-delete-course-small"
                         onClick={() => handleDeleteMaterial(m._id)}
                         title="Delete Material"
                         style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: '#ff4d4f', transition: 'color 0.2s' }}
                      >
                        🗑️
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                  <p>No materials uploaded for this course yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
