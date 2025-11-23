import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5004';

const Dashboard = () => {
  const [subjects, setSubjects] = useState([]);
  const [stats, setStats] = useState({
    topicsCompleted: 42,
    totalXP: 2850,
    testsCompleted: 12,
    streak: 7
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/subjects?semester=4`);
      const data = await response.json();
      if (data.subjects) {
        setSubjects(data.subjects.slice(0, 3)); // Show top 3 subjects
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-top">
          <div>
            <h1 className="page-title">Welcome back, Sagar! 👋</h1>
            <p className="header-subtitle">You've completed 3 topics today. Keep up the great work!</p>
          </div>
          <div className="quick-actions">
            <button className="btn btn-secondary">
              <span className="material-icons" style={{ fontSize: '20px' }}>search</span>
            </button>
            <button className="btn btn-secondary">
              <span className="material-icons" style={{ fontSize: '20px' }}>notifications</span>
            </button>
            <Link to="/mock-tests/1">
              <button className="btn btn-primary">
                <span className="material-icons" style={{ fontSize: '20px' }}>add</span>
                <span>Start Test</span>
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div>
              <div className="stat-value">{stats.topicsCompleted}</div>
              <div className="stat-label">Topics Mastered</div>
            </div>
            <div className="stat-icon primary">
              <span className="material-icons">school</span>
            </div>
          </div>
          <div className="stat-change positive">
            <span className="material-icons" style={{ fontSize: '16px' }}>trending_up</span>
            <span>+12% this week</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div>
              <div className="stat-value">{stats.totalXP.toLocaleString()}</div>
              <div className="stat-label">Total XP Earned</div>
            </div>
            <div className="stat-icon success">
              <span className="material-icons">emoji_events</span>
            </div>
          </div>
          <div className="stat-change positive">
            <span className="material-icons" style={{ fontSize: '16px' }}>trending_up</span>
            <span>+350 XP today</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div>
              <div className="stat-value">{stats.testsCompleted}/15</div>
              <div className="stat-label">Tests Completed</div>
            </div>
            <div className="stat-icon warning">
              <span className="material-icons">assignment_turned_in</span>
            </div>
          </div>
          <div className="stat-change positive">
            <span className="material-icons" style={{ fontSize: '16px' }}>trending_up</span>
            <span>Avg: 85%</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div>
              <div className="stat-value">{stats.streak} Days</div>
              <div className="stat-label">Study Streak</div>
            </div>
            <div className="stat-icon danger">
              <span className="material-icons">local_fire_department</span>
            </div>
          </div>
          <div className="stat-change positive">
            <span className="material-icons" style={{ fontSize: '16px' }}>trending_up</span>
            <span>Personal best!</span>
          </div>
        </div>
      </div>

      {/* Continue Learning Section */}
      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">Continue Learning</h2>
          <Link to="/subjects" className="section-link">
            <span>View All</span>
            <span className="material-icons" style={{ fontSize: '18px' }}>arrow_forward</span>
          </Link>
        </div>

        <div className="cards-grid">
          {subjects.length > 0 ? subjects.map((subject, index) => {
            const gradients = [
              'linear-gradient(135deg, #6366f1, #8b5cf6)',
              'linear-gradient(135deg, #10b981, #059669)',
              'linear-gradient(135deg, #f59e0b, #d97706)'
            ];
            const icons = ['💻', '🗄️', '🌳'];
            const progress = [70, 55, 85];

            return (
              <div key={subject.id} className="feature-card">
                <div className="card-image" style={{ background: gradients[index % 3] }}>
                  <div className="card-badge">Semester {subject.semester}</div>
                  <div className="card-icon">{icons[index % 3]}</div>
                </div>
                <div className="card-content">
                  <h3 className="card-title">{subject.subject_name}</h3>
                  <p className="card-description">{subject.subject_code}</p>
                  <div className="progress-container">
                    <div className="progress-header">
                      <span style={{ color: 'var(--text)' }}>Progress</span>
                      <span style={{ color: 'var(--primary)' }}>{progress[index]}%</span>
                    </div>
                    <div className="progress-bar-container">
                      <div className="progress-bar-fill" style={{ width: `${progress[index]}%` }}></div>
                    </div>
                  </div>
                  <div className="card-meta">
                    <div className="card-meta-item">
                      <span className="material-icons" style={{ fontSize: '16px' }}>description</span>
                      <span>28/40 Topics</span>
                    </div>
                    <div className="card-meta-item">
                      <span className="material-icons" style={{ fontSize: '16px' }}>quiz</span>
                      <span>5 Tests</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          }) : (
            <p style={{ color: 'var(--text-secondary)' }}>Loading subjects...</p>
          )}
        </div>
      </div>

      {/* Quick Tools */}
      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">Quick Tools</h2>
        </div>

        <div className="tools-grid">
          <Link to="/ai-assistant" className="tool-card">
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🃏</div>
            <h3 className="tool-name">Flashcards</h3>
            <p className="tool-desc">Practice with 120+ cards</p>
          </Link>

          <Link to="/subjects" className="tool-card">
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📝</div>
            <h3 className="tool-name">Mock Tests</h3>
            <p className="tool-desc">GTU pattern tests</p>
          </Link>

          <Link to="/subjects" className="tool-card">
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>⭐</div>
            <h3 className="tool-name">Important Qs</h3>
            <p className="tool-desc">200+ curated questions</p>
          </Link>

          <Link to="/subjects" className="tool-card">
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎥</div>
            <h3 className="tool-name">Video Lessons</h3>
            <p className="tool-desc">50+ hours of content</p>
          </Link>
        </div>
      </div>

      {/* AI Assistant FAB */}
      <Link to="/ai-assistant" className="ai-fab">
        <span className="material-icons">smart_toy</span>
      </Link>

      <style jsx>{`
        .dashboard-container {
          padding: 32px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .dashboard-header {
          margin-bottom: 32px;
        }

        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .page-title {
          font-size: 32px;
          font-weight: 800;
          color: var(--text);
          margin-bottom: 8px;
        }

        .header-subtitle {
          color: var(--text-secondary);
          font-size: 15px;
        }

        .quick-actions {
          display: flex;
          gap: 12px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: var(--surface);
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
          border: 1px solid var(--border);
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        }

        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        .stat-icon.primary {
          background: linear-gradient(135deg, #ddd6fe, #e9d5ff);
          color: var(--primary);
        }

        .stat-icon.success {
          background: linear-gradient(135deg, #d1fae5, #a7f3d0);
          color: var(--success);
        }

        .stat-icon.warning {
          background: linear-gradient(135deg, #fed7aa, #fde68a);
          color: var(--warning);
        }

        .stat-icon.danger {
          background: linear-gradient(135deg, #fecaca, #fca5a5);
          color: var(--danger);
        }

        .stat-value {
          font-size: 32px;
          font-weight: 800;
          color: var(--text);
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 14px;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .stat-change {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 6px;
        }

        .stat-change.positive {
          background: #d1fae5;
          color: var(--success);
        }

        .content-section {
          margin-bottom: 32px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .section-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--text);
        }

        .section-link {
          color: var(--primary);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          text-decoration: none;
        }

        .section-link:hover {
          text-decoration: underline;
        }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .feature-card {
          background: var(--surface);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
          border: 1px solid var(--border);
          cursor: pointer;
          text-decoration: none;
          color: inherit;
          display: block;
        }

        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        }

        .card-image {
          height: 140px;
          position: relative;
          overflow: hidden;
        }

        .card-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(255,255,255,0.95);
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          color: var(--primary);
        }

        .card-icon {
          position: absolute;
          bottom: -20px;
          left: 20px;
          width: 56px;
          height: 56px;
          background: white;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .card-content {
          padding: 32px 20px 20px;
        }

        .card-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 8px;
        }

        .card-description {
          font-size: 14px;
          color: var(--text-secondary);
          margin-bottom: 16px;
        }

        .progress-container {
          margin-top: 12px;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          font-size: 13px;
          font-weight: 600;
        }

        .card-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid var(--border);
          margin-top: 16px;
        }

        .card-meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: var(--text-secondary);
        }

        .tools-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 20px;
        }

        .tool-card {
          background: var(--surface);
          border: 2px solid var(--primary);
          border-radius: 16px;
          padding: 24px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          color: inherit;
        }

        .tool-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(99, 102, 241, 0.2);
        }

        .tool-name {
          font-size: 16px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 8px;
        }

        .tool-desc {
          font-size: 13px;
          color: var(--text-secondary);
          margin: 0;
        }

        .ai-fab {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: white;
          border: none;
          box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          transition: all 0.3s ease;
          text-decoration: none;
          z-index: 100;
        }

        .ai-fab:hover {
          transform: scale(1.1);
          box-shadow: 0 12px 32px rgba(99, 102, 241, 0.5);
        }
      `}</style>
    </div>
  );
};

export default Dashboard;