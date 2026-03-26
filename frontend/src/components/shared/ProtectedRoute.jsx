import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Login from '../../pages/Login';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Login />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="access-denied">
        <div className="access-denied-content">
          <h1>🚫 Access Denied</h1>
          <p>You don't have permission to access this resource.</p>
          <p>Your role: <strong>{user.role}</strong></p>
          <p>Required roles: <strong>{allowedRoles.join(', ')}</strong></p>
        </div>
      </div>
    );
  }

  return children;
}
