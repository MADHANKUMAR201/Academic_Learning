import React from 'react';
import { assignmentAPI } from '../../services/api';

export default function ReminderBanner({ reminders, onDismiss }) {
  if (!reminders || reminders.length === 0) return null;

  return (
    <div className="reminders-area">
      {reminders.map(asgn => (
        <div key={asgn._id} className="reminder-banner">
          <div className="reminder-info">
            <span className="reminder-tag">REMINDER</span>
            <span className="reminder-text">
              <strong>{asgn.title}:</strong> {asgn.reminder}
            </span>
          </div>
          <button 
            className="reminder-dismiss" 
            onClick={() => onDismiss(asgn._id)}
            title="Dismiss reminder"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
