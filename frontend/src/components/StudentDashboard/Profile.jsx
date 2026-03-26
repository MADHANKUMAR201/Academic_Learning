import React, { useState, useEffect } from 'react';
import '../../styles/components.css';
import { authAPI } from '../../services/api';

export default function StudentProfile() {
  const [profile, setProfile] = useState({
    personalInfo: {
      fullName: 'John Doe',
      enrollmentId: 'STU-2024-001',
      dateOfBirth: '2002-05-15',
      email: 'john.doe@university.edu',
      phone: '+1 (555) 123-4567',
      address: '123 University St, College Town, CA 12345',
    },
    academicInfo: {
      currentSemester: '6th Semester',
      coursesMajor: 'Computer Science',
      minor: 'Sustainability Studies',
      startDate: '2021-09-01',
      expectedGraduation: '2025-05-20',
      cumulativeGPA: 3.75,
      majorGPA: 3.85,
    },
    achievements: [
      'Dean\'s List (2023)',
      'Sustainability Excellence Award (2024)',
      'Outstanding Project Award in ML (2024)',
      'Peer Tutor Certification (2023)',
    ],
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(profile.personalInfo);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await authAPI.getCurrentUser();
        if (res && res.success && res.data) {
          // Map backend user shape to local profile shape if present
          const user = res.data;
          const personal = user.personalInfo || {
            fullName: user.name || '',
            enrollmentId: user.studentId || '',
            dateOfBirth: user.personalInfo?.dateOfBirth || '',
            email: user.email || '',
            phone: user.personalInfo?.phone || '',
            address: user.personalInfo?.address || '',
          };

          const academic = user.academicInfo || profile.academicInfo;

          // Normalize dateOfBirth for date input (YYYY-MM-DD)
          if (personal.dateOfBirth) {
            try {
              const d = new Date(personal.dateOfBirth);
              const yyyy = d.getFullYear();
              const mm = String(d.getMonth() + 1).padStart(2, '0');
              const dd = String(d.getDate()).padStart(2, '0');
              personal.dateOfBirth = `${yyyy}-${mm}-${dd}`;
            } catch (e) {
              // keep original string if parsing fails
            }
          }

          setProfile(prev => ({ ...prev, personalInfo: personal, academicInfo: academic, achievements: user.achievements || prev.achievements, email: user.email }));
          setFormData(personal);
        } else {
          setLoadError(res.message || 'Failed to load profile');
        }
      } catch (err) {
        setLoadError(err.message || 'Error loading profile');
      }
    };

    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    const save = async () => {
      setSaving(true);
      try {
        // Send both nested personalInfo and top-level email so backend updates both
        const payload = { personalInfo: formData, email: formData.email };
        const res = await authAPI.updateProfile(payload);
        if (res && res.success && res.data) {
          const user = res.data;
          const personal = user.personalInfo || {};
          // Normalize date for display/input
          if (personal.dateOfBirth) {
            try {
              const d = new Date(personal.dateOfBirth);
              const yyyy = d.getFullYear();
              const mm = String(d.getMonth() + 1).padStart(2, '0');
              const dd = String(d.getDate()).padStart(2, '0');
              personal.dateOfBirth = `${yyyy}-${mm}-${dd}`;
            } catch (e) {}
          }

          setProfile(prev => ({ ...prev, personalInfo: personal, email: user.email || formData.email }));
          setFormData(personal);
          // Update stored user so other parts of app reflect changes
          try {
            const storedUser = { id: user._id, name: user.name || personal.fullName, email: formData.email || user.email, role: user.role, personalInfo: user.personalInfo };
            localStorage.setItem('user', JSON.stringify(storedUser));
          } catch (e) {}

          setIsEditing(false);
          alert('Profile updated successfully');
        } else {
          console.error('Failed to save profile:', res && res.message);
          alert(res?.message || 'Failed to save profile');
        }
      } catch (err) {
        console.error('Error saving profile:', err);
        alert(err.message || 'Error saving profile');
      } finally {
        setSaving(false);
      }
    };

    save();
  };

  return (
    <div className="profile-container">
      <div className="section-header">
        <h2>My Profile</h2>
        <button 
          className={`btn-edit ${isEditing ? 'cancel' : ''}`}
          onClick={() => {
            if (isEditing) {
              setIsEditing(false);
            } else {
              setIsEditing(true);
            }
          }}
        >
          {isEditing ? 'Cancel' : '✏️ Edit Profile'}
        </button>
      </div>

      <div className="profile-sections">
        <div className="profile-card">
          <h3>👤 Personal Information</h3>
          {isEditing ? (
            <div className="form-group">
              <div className="form-row">
                <div className="form-field">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    name="fullName" 
                    value={formData.fullName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-field">
                  <label>Enrollment ID</label>
                  <input 
                    type="text" 
                    name="enrollmentId" 
                    value={formData.enrollmentId}
                    disabled
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>Email</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-field">
                  <label>Phone</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>Date of Birth</label>
                  <input 
                    type="date" 
                    name="dateOfBirth" 
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-field">
                  <label>Address</label>
                  <input 
                    type="text" 
                    name="address" 
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <button className="btn-save" onClick={handleSave}>Save Changes</button>
            </div>
          ) : (
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Full Name:</span>
                <span className="info-value">{profile.personalInfo.fullName}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Enrollment ID:</span>
                <span className="info-value">{profile.personalInfo.enrollmentId}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email:</span>
                <span className="info-value">{profile.personalInfo.email || profile.email}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Phone:</span>
                <span className="info-value">{profile.personalInfo.phone}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Date of Birth:</span>
                <span className="info-value">{profile.personalInfo.dateOfBirth}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Address:</span>
                <span className="info-value">{profile.personalInfo.address}</span>
              </div>
            </div>
          )}
        </div>

        <div className="profile-card">
          <h3>🎓 Academic Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Current Semester:</span>
              <span className="info-value">{profile.academicInfo.currentSemester}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Major:</span>
              <span className="info-value">{profile.academicInfo.coursesMajor}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Minor:</span>
              <span className="info-value">{profile.academicInfo.minor}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Expected Graduation:</span>
              <span className="info-value">{profile.academicInfo.expectedGraduation}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Cumulative GPA:</span>
              <span className="info-value">{profile.academicInfo.cumulativeGPA}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Major GPA:</span>
              <span className="info-value">{profile.academicInfo.majorGPA}</span>
            </div>
          </div>
        </div>

        <div className="profile-card">
          <h3>🏆 Achievements & Awards</h3>
          <ul className="achievements-list">
            {profile.achievements.map((achievement, idx) => (
              <li key={idx} className="achievement-item">
                ⭐ {achievement}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
