import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/shared/ProtectedRoute';
import Header from './components/shared/Header';
import Sidebar from './components/shared/Sidebar';
import Navigation from './components/shared/Navigation';
import Login from './pages/Login';

// Student Dashboard Components
import StudentDashboard from './components/StudentDashboard/Dashboard';
import StudentCourses from './components/StudentDashboard/Courses';
import StudentProgress from './components/StudentDashboard/Progress';
import StudentAssignments from './components/StudentDashboard/Assignments';
import StudentProfile from './components/StudentDashboard/Profile';

// Faculty Dashboard Components
import FacultyDashboard from './components/FacultyDashboard/Dashboard';
import FacultyStudentProgress from './components/FacultyDashboard/StudentProgress';
import FacultyAttendance from './components/FacultyDashboard/Attendance';
import FacultyCourses from './components/FacultyDashboard/Courses';
import FacultyAssignments from './components/FacultyDashboard/Assignments';

// Admin Dashboard Components
import AdminDashboard from './components/AdminDashboard/Dashboard';
import UserManagement from './components/AdminDashboard/UserManagement';
import Analytics from './components/AdminDashboard/Analytics';

import './styles/main.css';
import './styles/login.css';

function DashboardContent() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const studentMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'courses', label: 'Courses', icon: '📚' },
    { id: 'progress', label: 'Progress', icon: '📈' },
    { id: 'assignments', label: 'Assignments', icon: '📝' },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ];

  const facultyMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'student-progress', label: 'Student Progress', icon: '📚' },
    { id: 'attendance', label: 'Attendance', icon: '✅' },
    { id: 'courses', label: 'Courses', icon: '🎓' },
    { id: 'assignments', label: 'Assignments', icon: '📝' },
  ];

  const adminMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'users', label: 'User Management', icon: '👥' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
  ];

  const getMenuItems = () => {
    switch (user.role) {
      case 'faculty':
        return facultyMenuItems;
      case 'admin':
        return adminMenuItems;
      default:
        return studentMenuItems;
    }
  };

  const getRoleDisplayName = () => {
    return user.role.charAt(0).toUpperCase() + user.role.slice(1);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  const renderContent = () => {
    if (user.role === 'student') {
      switch (activeTab) {
        case 'dashboard':
          return <StudentDashboard />;
        case 'courses':
          return <StudentCourses />;
        case 'progress':
          return <StudentProgress />;
        case 'assignments':
          return <StudentAssignments />;
        case 'profile':
          return <StudentProfile />;
        default:
          return <StudentDashboard />;
      }
    } else if (user.role === 'faculty') {
      switch (activeTab) {
        case 'dashboard':
          return <FacultyDashboard />;
        case 'student-progress':
          return <FacultyStudentProgress />;
        case 'attendance':
          return <FacultyAttendance />;
        case 'courses':
          return <FacultyCourses />;
        case 'assignments':
          return <FacultyAssignments />;
        default:
          return <FacultyDashboard />;
      }
    } else if (user.role === 'admin') {
      switch (activeTab) {
        case 'dashboard':
          return <AdminDashboard />;
        case 'users':
          return <UserManagement />;
        case 'analytics':
          return <Analytics />;
        default:
          return <AdminDashboard />;
      }
    }
  };

  return (
    <div className="app">
      <Header userRole={getRoleDisplayName()} userName={user.name} />
      <Navigation currentRole={user.role} onRoleChange={() => {}} onLogout={handleLogout} />

      <div className="main-container">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} menuItems={getMenuItems()} />

        <main className="main-content">
          <div className="content-wrapper">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
}

function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['student', 'faculty', 'admin']}>
      <DashboardContent />
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
