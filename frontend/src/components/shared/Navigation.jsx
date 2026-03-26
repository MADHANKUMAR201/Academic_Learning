import React from 'react';
import '../../../src/styles/components.css';

export default function Navigation({ onLogout }) {
  return (
    <nav className="top-navigation">
      <div className="nav-container">
        <div className="nav-left">
          <p className="nav-info">Navigation & Controls</p>
        </div>
        <button className="nav-logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
