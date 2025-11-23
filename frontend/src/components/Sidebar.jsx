import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const navSections = {
    main: [
      { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
      { path: '/subjects', icon: 'library_books', label: 'Study Materials' },
      { path: '/browse', icon: 'view_module', label: 'Browse Materials' },
    ],
    resources: [
      { path: '/all-mock-tests', icon: 'quiz', label: 'Mock Tests' },
      { path: '/all-syllabus', icon: 'menu_book', label: 'Syllabus' },
      { path: '/all-previous-papers', icon: 'description', label: 'Previous Papers' },
      { path: '/all-important-questions', icon: 'star', label: 'Important Questions' },
      { path: '/all-lab-programs', icon: 'code', label: 'Lab Programs' },
      { path: '/all-video-tutorials', icon: 'play_circle', label: 'Video Tutorials' },
    ],
    tools: [
      { path: '/ai-assistant', icon: 'smart_toy', label: 'AI Assistant' },
      { path: '/voice-assistant', icon: 'mic', label: 'Voice Assistant' },
      { path: '/analytics', icon: 'insights', label: 'Analytics' },
    ],
  };

  return (
    <aside className="sidebar">
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">🎓</div>
          <span>GTU Exam Prep</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="nav-menu">
        {/* Main Section */}
        <div className="nav-section">
          <div className="nav-section-title">Main</div>
          {navSections.main.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
            >
              <span className="material-icons">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Resources Section */}
        <div className="nav-section">
          <div className="nav-section-title">Resources</div>
          {navSections.resources.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
            >
              <span className="material-icons">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Tools Section */}
        <div className="nav-section">
          <div className="nav-section-title">Tools</div>
          {navSections.tools.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
            >
              <span className="material-icons">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* User Section */}
      <div className="user-section">
        <div className="user-profile">
          <div className="user-avatar">S</div>
          <div className="user-info">
            <div className="user-name">Sagar</div>
            <div className="user-role">Semester 4 • CSE</div>
          </div>
          <span className="material-icons" style={{ color: 'var(--text-secondary)', fontSize: '20px' }}>
            more_vert
          </span>
        </div>
      </div>

      <style jsx>{`
        .sidebar {
          width: 280px;
          background: var(--surface);
          box-shadow: 2px 0 10px rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
        }

        .sidebar-header {
          padding: 24px;
          border-bottom: 1px solid var(--border);
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 20px;
          font-weight: 700;
          color: var(--primary);
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
        }

        .nav-menu {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
        }

        .nav-section {
          margin-bottom: 24px;
        }

        .nav-section-title {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-secondary);
          padding: 8px 16px;
          letter-spacing: 0.5px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 10px;
          margin-bottom: 4px;
          cursor: pointer;
          transition: all 0.2s;
          color: var(--text-secondary);
          font-weight: 500;
          font-size: 14px;
          text-decoration: none;
        }

        .nav-item:hover {
          background: #f1f5f9;
          color: var(--text);
        }

        .nav-item.active {
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: white;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .nav-item .material-icons {
          font-size: 20px;
        }

        .user-section {
          padding: 16px;
          border-top: 1px solid var(--border);
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .user-profile:hover {
          background: #f1f5f9;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f59e0b, #ef4444);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
        }

        .user-info {
          flex: 1;
        }

        .user-name {
          font-weight: 600;
          font-size: 14px;
          color: var(--text);
        }

        .user-role {
          font-size: 12px;
          color: var(--text-secondary);
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
