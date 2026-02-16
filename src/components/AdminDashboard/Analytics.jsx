import React, { useState } from 'react';
import '../../../src/styles/components.css';

export default function Analytics() {
  const [selectedMetric, setSelectedMetric] = useState('courses');

  const analyticsData = {
    courses: {
      title: 'Course Analytics',
      metrics: [
        { name: 'Data Structures (CS-101)', students: 45, avgProgress: 75, avgSustainability: 82 },
        { name: 'Web Development (CS-102)', students: 50, avgProgress: 68, avgSustainability: 78 },
        { name: 'Database Management (CS-103)', students: 50, avgProgress: 82, avgSustainability: 85 },
        { name: 'Machine Learning (CS-104)', students: 42, avgProgress: 88, avgSustainability: 89 },
        { name: 'Sustainability in Tech (CSE-105)', students: 48, avgProgress: 76, avgSustainability: 88 },
      ],
    },
    students: {
      title: 'Student Performance Analytics',
      metrics: [
        { name: 'Average GPA', value: 3.65, target: 3.5, status: 'Excellent' },
        { name: 'Average Progress', value: 76, target: 70, status: 'Good' },
        { name: 'Average Sustainability', value: 79.4, target: 75, status: 'Excellent' },
        { name: 'Average Attendance', value: 87, target: 85, status: 'Good' },
      ],
    },
    sustainability: {
      title: 'Sustainability Score Analysis',
      metrics: [
        { category: 'All Students', score: 79.4, trend: 'up' },
        { category: 'CS-101 Students', score: 82, trend: 'up' },
        { category: 'CS-102 Students', score: 78, trend: 'stable' },
        { category: 'CS-103 Students', score: 85, trend: 'up' },
        { category: 'CS-104 Students', score: 89, trend: 'up' },
        { category: 'CSE-105 Students', score: 88, trend: 'up' },
      ],
    },
  };

  const getTrendIcon = (trend) => {
    switch(trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  const currentData = analyticsData[selectedMetric];

  return (
    <div className="analytics-container">
      <div className="section-header">
        <h2>Analytics & Reports</h2>
        <p>Comprehensive system analytics and performance metrics</p>
      </div>

      <div className="analytics-tabs">
        <button 
          className={`tab-btn ${selectedMetric === 'courses' ? 'active' : ''}`}
          onClick={() => setSelectedMetric('courses')}
        >
          📚 Course Analytics
        </button>
        <button 
          className={`tab-btn ${selectedMetric === 'students' ? 'active' : ''}`}
          onClick={() => setSelectedMetric('students')}
        >
          👥 Student Performance
        </button>
        <button 
          className={`tab-btn ${selectedMetric === 'sustainability' ? 'active' : ''}`}
          onClick={() => setSelectedMetric('sustainability')}
        >
          🌱 Sustainability Scores
        </button>
      </div>

      <div className="analytics-content">
        <h3>{currentData.title}</h3>

        {selectedMetric === 'courses' && (
          <div className="analytics-table">
            <table>
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Enrolled Students</th>
                  <th>Avg Progress</th>
                  <th>Avg Sustainability</th>
                </tr>
              </thead>
              <tbody>
                {currentData.metrics.map((item, idx) => (
                  <tr key={idx}>
                    <td className="course-name">{item.name}</td>
                    <td>{item.students}</td>
                    <td>
                      <div className="inline-metric">
                        <span>{item.avgProgress}%</span>
                        <div className="tiny-bar">
                          <div className="tiny-fill" style={{ width: `${item.avgProgress}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="inline-metric">
                        <span>{item.avgSustainability}%</span>
                        <div className="tiny-bar">
                          <div className="tiny-fill" style={{ width: `${item.avgSustainability}%` }}></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedMetric === 'students' && (
          <div className="analytics-metrics-grid">
            {currentData.metrics.map((metric, idx) => (
              <div key={idx} className="metric-card-large">
                <h4>{metric.name}</h4>
                <div className="metric-display">
                  <span className="metric-large-value">{metric.value}</span>
                  <span className="metric-target">Target: {metric.target}</span>
                </div>
                <span className={`metric-status status-${metric.status.toLowerCase()}`}>
                  {metric.status}
                </span>
              </div>
            ))}
          </div>
        )}

        {selectedMetric === 'sustainability' && (
          <div className="analytics-list">
            {currentData.metrics.map((metric, idx) => (
              <div key={idx} className="analytics-item">
                <div className="item-header">
                  <h5>{metric.category}</h5>
                  <span className="trend-icon">{getTrendIcon(metric.trend)}</span>
                </div>
                <div className="item-score">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${metric.score}%` }}></div>
                  </div>
                  <span className="score-value">{metric.score}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="analytics-export">
        <button className="btn-export">📥 Export Report</button>
        <button className="btn-print">🖨️ Print Analytics</button>
      </div>
    </div>
  );
}
