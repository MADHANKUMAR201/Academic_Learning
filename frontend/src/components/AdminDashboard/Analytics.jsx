import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import '../../../src/styles/components.css';

export default function Analytics() {
  const [selectedMetric, setSelectedMetric] = useState('courses');
  const [loading, setLoading] = useState(true);
  const [coursesData, setCoursesData] = useState([]);
  const [studentPerf, setStudentPerf] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedMetric]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      if (selectedMetric === 'courses') {
        const response = await adminAPI.getDetailedCourseStats();
        if (response.success) {
          setCoursesData(response.data);
        }
      } else if (selectedMetric === 'students') {
        const response = await adminAPI.getStudentPerformance();
        if (response.success) {
          setStudentPerf(response.data);
        }
      }
      // sustainability scores can be derived or fetched if needed
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend) => {
    switch(trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

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
        <h3>{selectedMetric === 'courses' ? 'Course Analytics' : selectedMetric === 'students' ? 'Student Performance Analytics' : 'Sustainability Score Analysis'}</h3>

        {loading ? (
          <div className="loading">Loading analytics...</div>
        ) : (
          <>
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
                    {coursesData.length > 0 ? (
                      coursesData.map((item, idx) => (
                        <tr key={idx}>
                          <td className="course-name">{item.title} ({item.code})</td>
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
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No course data available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {selectedMetric === 'students' && (
              <div className="analytics-metrics-grid">
                {[
                  { name: 'Average GPA', value: studentPerf ? (studentPerf.avgGrade / 25).toFixed(2) : '0.00', target: 3.5, status: (studentPerf?.avgGrade / 25) >= 3.5 ? 'Excellent' : 'Good' },
                  { name: 'Average Progress', value: studentPerf ? Math.round(studentPerf.avgProgress || 76) : 0, target: 70, status: 'Good' },
                  { name: 'Average Sustainability', value: studentPerf ? Math.round(studentPerf.avgSustainability) : 0, target: 75, status: 'Excellent' },
                  { name: 'Average Attendance', value: studentPerf ? Math.round(studentPerf.avgAttendance) : 0, target: 85, status: 'Good' },
                ].map((metric, idx) => (
                  <div key={idx} className="metric-card-large">
                    <h4>{metric.name}</h4>
                    <div className="metric-display">
                      <span className="metric-large-value">{metric.value}{metric.name !== 'Average GPA' ? '%' : ''}</span>
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
                {coursesData.map((course, idx) => (
                  <div key={idx} className="analytics-item">
                    <div className="item-header">
                      <h5>{course.title} ({course.code})</h5>
                      <span className="trend-icon">{getTrendIcon('up')}</span>
                    </div>
                    <div className="item-score">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${course.avgSustainability}%` }}></div>
                      </div>
                      <span className="score-value">{course.avgSustainability}%</span>
                    </div>
                  </div>
                ))}
                {coursesData.length === 0 && <p style={{ textAlign: 'center', padding: '2rem' }}>No sustainability data available</p>}
              </div>
            )}
          </>
        )}
      </div>

      <div className="analytics-export">
        <button className="btn-export">📥 Export Report</button>
        <button className="btn-print" onClick={() => window.print()}>🖨️ Print Analytics</button>
      </div>
    </div>
  );
}
