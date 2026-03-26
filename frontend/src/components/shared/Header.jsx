import React from 'react';
import '../../../src/styles/components.css';

export default function Header({ userRole, userName }) {
  return (
    <header className="header">
      <div className="header-container">
        <div className="header-logo">
          <h1>🎓 EduSustain</h1>
          <p className="header-subtitle">Academic Learning Sustainability Platform</p>
        </div>
        <div className="header-user">
          <span className="user-role-badge">{userRole}</span>
          <span className="user-name">Welcome, {userName}</span>
        </div>
      </div>
    </header>
  );
}
