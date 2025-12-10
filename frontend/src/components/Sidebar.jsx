import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

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
      { path: '/realtime-voice', icon: 'record_voice_over', label: 'Real-Time Voice' },
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
        {user ? (
          <>
            {/* Credit Balance Display */}
            <div className="credit-display">
              <span className="material-icons">bolt</span>
              <span className="credit-amount">{profile?.ai_credits ?? 200}</span>
              <span className="credit-label">AI Credits</span>
            </div>

            <div className="user-profile">
              <div className="user-avatar">{profile?.username?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}</div>
              <div className="user-info">
                <div className="user-name">{profile?.username || user.email?.split('@')[0]}</div>
                <div className="user-role">
                  {profile?.semester ? `Semester ${profile.semester}` : ''}
                  {profile?.branch ? ` • ${profile.branch.split(' ')[0]}` : ''}
                </div>
              </div>
              <button onClick={handleSignOut} className="logout-btn" title="Sign out">
                <span className="material-icons">logout</span>
              </button>
            </div>
          </>
        ) : (
          <div className="auth-buttons">
            <Link to="/login" className="auth-btn login-btn">Sign In</Link>
            <Link to="/register" className="auth-btn register-btn">Register</Link>
          </div>
        )}
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

        .credit-display {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          border-radius: 12px;
          margin-bottom: 12px;
        }

        .credit-display .material-icons {
          color: #78350f;
          font-size: 20px;
        }

        .credit-amount {
          font-size: 20px;
          font-weight: 700;
          color: #78350f;
        }

        .credit-label {
          font-size: 12px;
          color: #92400e;
          margin-left: auto;
        }

        .logout-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          color: var(--text-secondary);
          transition: all 0.2s;
        }

        .logout-btn:hover {
          background: #fee2e2;
          color: #dc2626;
        }

        .auth-buttons {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 12px;
        }

        .auth-btn {
          padding: 12px 16px;
          border-radius: 8px;
          text-align: center;
          font-weight: 600;
          font-size: 14px;
          text-decoration: none;
          transition: all 0.2s;
        }

        .login-btn {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
        }

        .login-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .register-btn {
          background: transparent;
          border: 2px solid var(--primary);
          color: var(--primary);
        }

        .register-btn:hover {
          background: var(--primary);
          color: white;
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
