const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const BASE_URL = API_URL.replace('/api', '');

// Set Authorization header with token
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Helper function to handle API errors
const handleResponse = async (response) => {
  try {
    const data = await response.json();
    return data;
  } catch (error) {
    if (!response.ok) {
      throw new Error(`Network error: ${response.status} ${response.statusText}`);
    }
    throw error;
  }
};

const handleFetchError = (error) => {
  console.error('API Error:', error);
  if (error.message.includes('Failed to fetch')) {
    return {
      success: false,
      message: 'Cannot connect to server. Make sure backend is running on http://localhost:5000',
    };
  }
  return {
    success: false,
    message: error.message || 'An error occurred',
  };
};

// Authentication APIs
export const authAPI = {
  login: async (email, password, role) => {
    try {
      console.log('Login request to:', `${API_URL}/auth/login`);
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });
      return handleResponse(response);
    } catch (error) {
      return handleFetchError(error);
    }
  },

  register: async (userData) => {
    try {
      console.log('Register request to:', `${API_URL}/auth/register`);
      console.log('User data:', userData);
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      return handleResponse(response);
    } catch (error) {
      return handleFetchError(error);
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: getAuthHeader(),
      });
      return handleResponse(response);
    } catch (error) {
      return handleFetchError(error);
    }
  },
  updateProfile: async (profileData) => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(profileData),
      });
      return handleResponse(response);
    } catch (error) {
      return handleFetchError(error);
    }
  },
};

// Course APIs
export const courseAPI = {
  getAllCourses: async () => {
    const response = await fetch(`${API_URL}/courses`, {
      headers: getAuthHeader(),
    });
    return response.json();
  },

  getCourseById: async (id) => {
    const response = await fetch(`${API_URL}/courses/${id}`, {
      headers: getAuthHeader(),
    });
    return response.json();
  },

  createCourse: async (courseData) => {
    const response = await fetch(`${API_URL}/courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(courseData),
    });
    return response.json();
  },

  updateCourse: async (id, courseData) => {
    const response = await fetch(`${API_URL}/courses/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(courseData),
    });
    return response.json();
  },

  deleteCourse: async (id) => {
    const response = await fetch(`${API_URL}/courses/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    return response.json();
  },

  enrollCourse: async (id) => {
    const response = await fetch(`${API_URL}/courses/${id}/enroll`, {
      method: 'POST',
      headers: getAuthHeader(),
    });
    return response.json();
  },
  getFacultyStats: async () => {
    const response = await fetch(`${API_URL}/courses/faculty/stats`, {
      headers: getAuthHeader(),
    });
    return response.json();
  },

  uploadMaterial: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_URL}/upload/material`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: formData,
    });
    return handleResponse(response);
  },

  addCourseMaterial: async (courseId, materialData) => {
    const response = await fetch(`${API_URL}/courses/${courseId}/materials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(materialData),
    });
    return response.json();
  },

  deleteCourseMaterial: async (courseId, materialId) => {
    const response = await fetch(`${API_URL}/courses/${courseId}/materials/${materialId}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    return response.json();
  },

  BASE_URL: BASE_URL,
};

// Assignment APIs
export const assignmentAPI = {
  getFacultyAssignments: async () => {
    const response = await fetch(`${API_URL}/assignments/faculty`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  getStudentAssignments: async () => {
    const response = await fetch(`${API_URL}/assignments/student`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  getAllAssignments: async () => {
    const response = await fetch(`${API_URL}/assignments`, {
      headers: getAuthHeader(),
    });
    return response.json();
  },

  getAssignmentsByCourse: async (courseId) => {
    const response = await fetch(`${API_URL}/assignments/course/${courseId}`, {
      headers: getAuthHeader(),
    });
    return response.json();
  },

  createAssignment: async (assignmentData) => {
    const response = await fetch(`${API_URL}/assignments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(assignmentData),
    });
    return response.json();
  },

  submitAssignment: async (id, submissionData) => {
    const response = await fetch(`${API_URL}/assignments/${id}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(submissionData),
    });
    return response.json();
  },

  gradeAssignment: async (id, gradeData) => {
    const response = await fetch(`${API_URL}/assignments/${id}/grade`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(gradeData),
    });
    return response.json();
  },

  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/upload/assignment`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
      },
      body: formData,
    });
    return handleResponse(response);
  },
  setReminder: async (id, reminder) => {
    const response = await fetch(`${API_URL}/assignments/${id}/reminder`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ reminder }),
    });
    return response.json();
  },
  dismissReminder: async (id) => {
    const response = await fetch(`${API_URL}/assignments/${id}/dismiss-reminder`, {
      method: 'POST',
      headers: getAuthHeader(),
    });
    return response.json();
  },
};

// Progress APIs
export const progressAPI = {
  getMyProgress: async () => {
    const response = await fetch(`${API_URL}/progress/my`, {
      headers: getAuthHeader(),
    });
    return response.json();
  },

  getStudentProgress: async (courseId, studentId) => {
    const response = await fetch(`${API_URL}/progress/course/${courseId}/student/${studentId}`, {
      headers: getAuthHeader(),
    });
    return response.json();
  },

  getCourseProgress: async (courseId) => {
    const response = await fetch(`${API_URL}/progress/course/${courseId}`, {
      headers: getAuthHeader(),
    });
    return response.json();
  },

  updateProgress: async (progressData) => {
    const response = await fetch(`${API_URL}/progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(progressData),
    });
    return response.json();
  },

  getFacultyAllProgress: async () => {
    const response = await fetch(`${API_URL}/progress/faculty/all`, {
      headers: getAuthHeader(),
    });
    return response.json();
  },
};

// Admin APIs
export const adminAPI = {
  getAllUsers: async () => {
    const response = await fetch(`${API_URL}/admin/users`, {
      headers: getAuthHeader(),
    });
    return response.json();
  },

  getUsersByRole: async (role) => {
    const response = await fetch(`${API_URL}/admin/users/role/${role}`, {
      headers: getAuthHeader(),
    });
    return response.json();
  },

  updateUser: async (id, userData) => {
    const response = await fetch(`${API_URL}/admin/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  deleteUser: async (id) => {
    const response = await fetch(`${API_URL}/admin/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    return response.json();
  },

  getAnalyticsOverview: async () => {
    const response = await fetch(`${API_URL}/admin/analytics/overview`, {
      headers: getAuthHeader(),
    });
    return response.json();
  },

  getStudentPerformance: async () => {
    const response = await fetch(`${API_URL}/admin/analytics/student-performance`, {
      headers: getAuthHeader(),
    });
    return response.json();
  },

  getCourseEnrollment: async () => {
    const response = await fetch(`${API_URL}/admin/analytics/course-enrollment`, {
      headers: getAuthHeader(),
    });
    return response.json();
  },

  updateStudentAttendance: async (studentId, attendancePercentage) => {
    const response = await fetch(`${API_URL}/admin/users/${studentId}/attendance`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ attendancePercentage }),
    });
    return response.json();
  },

  syncAllScores: async () => {
    const response = await fetch(`${API_URL}/admin/sync-all-scores`, {
      method: 'POST',
      headers: getAuthHeader(),
    });
    return response.json();
  },
};
