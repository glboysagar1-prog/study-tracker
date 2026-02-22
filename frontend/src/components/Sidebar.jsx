import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cn } from '@/lib/utils.js';

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
    <aside className="sidebar glass-panel border-r-0 border-t-0 border-b-0 w-[280px] h-screen sticky top-0 flex flex-col z-50">
      {/* Sidebar Header */}
      <div className="sidebar-header p-8">
        <div className="logo flex items-center gap-4">
          <div className="logo-icon w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl shadow-lg shadow-indigo-500/20">🎓</div>
          <span className="text-xl font-extrabold tracking-tight text-white">GTU <span className="text-gradient">Prep</span></span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="nav-menu flex-1 px-4 py-2 overflow-y-auto hide-scrollbar space-y-8">
        {/* Sections Mapping */}
        {Object.entries(navSections).map(([sectionName, items]) => (
          <div key={sectionName} className="nav-section">
            <div className="nav-section-title px-4 mb-3 text-[11px] font-bold uppercase tracking-[2px] text-gray-500 opacity-80">{sectionName}</div>
            <div className="space-y-1">
              {items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-300 font-medium text-sm group",
                    isActive(item.path)
                      ? "bg-indigo-500/10 text-white shadow-sm border border-indigo-500/20"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <span className={cn(
                    "material-icons text-[20px] transition-transform group-hover:scale-110",
                    isActive(item.path) ? "text-indigo-400" : "opacity-70"
                  )}>{item.icon}</span>
                  <span>{item.label}</span>
                  {isActive(item.path) && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]" />}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User Section */}
      <div className="user-section p-4 mt-auto border-t border-white/5 bg-black/20 backdrop-blur-md">
        {user ? (
          <div className="space-y-4">
            {/* Credit Balance Display */}
            <div className="credit-display flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-br from-amber-400/10 to-orange-500/10 border border-amber-500/20">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-500">
                <span className="material-icons text-lg">bolt</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-amber-500/80 uppercase tracking-wider">AI Credits</span>
                <span className="text-lg font-extrabold text-white">{profile?.ai_credits ?? 200}</span>
              </div>
            </div>

            <div className="user-profile flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-colors group">
              <div className="user-avatar w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-rose-500 flex items-center justify-center text-white font-bold text-lg shadow-inner ring-2 ring-white/10 group-hover:ring-white/20 transition-all">
                {profile?.username?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="user-info flex-1 min-w-0">
                <div className="user-name text-sm font-bold text-white truncate">{profile?.username || user.email?.split('@')[0]}</div>
                <div className="user-role text-[10px] font-bold text-gray-500 uppercase tracking-widest truncate">
                  {profile?.semester ? `Sem ${profile.semester}` : ''}
                  {profile?.branch ? ` • ${profile.branch.split(' ')[0]}` : ''}
                </div>
              </div>
              <button onClick={handleSignOut} className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all" title="Sign out">
                <span className="material-icons text-xl">logout</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="auth-buttons flex flex-col gap-2">
            <Link to="/login" className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm text-center transition-all shadow-lg shadow-indigo-500/20">Sign In</Link>
            <Link to="/register" className="px-6 py-3 rounded-xl border border-white/10 text-white hover:bg-white/5 font-bold text-sm text-center transition-all">Register</Link>
          </div>
        )}
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
