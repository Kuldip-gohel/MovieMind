import React from 'react';
import { 
  Film, 
  LayoutDashboard, 
  Bookmark, 
  PlayCircle, 
  CheckCircle2, 
  Compass, 
  Settings, 
  Plus, 
  X,
  Sparkles
} from 'lucide-react';

/**
 * Sidebar Navigation Component
 * Provides seamless navigation across views with active glowing indicator and dynamic category counts.
 */
export default function Sidebar({
  currentView,
  setCurrentView,
  counts,
  onOpenAddModal,
  mobileOpen,
  setMobileOpen
}) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      count: counts.total
    },
    {
      id: 'discover',
      label: 'Discover / All Movies',
      icon: Compass,
      count: counts.total
    },
    {
      id: 'want_to_watch',
      label: 'My Watchlist',
      icon: Bookmark,
      count: counts.wantToWatch
    },
    {
      id: 'currently_watching',
      label: 'Currently Watching',
      icon: PlayCircle,
      count: counts.currentlyWatching
    },
    {
      id: 'watched',
      label: 'Watched Movies',
      icon: CheckCircle2,
      count: counts.watched
    },
    {
      id: 'ai_guide',
      label: 'AI Movie Guide',
      icon: Sparkles,
      count: 'Gemini'
    },
    {
      id: 'about',
      label: 'Settings & About',
      icon: Settings,
      count: null
    }
  ];

  const handleNavClick = (viewId) => {
    if (viewId === 'ai_guide') {
      setCurrentView('dashboard');
      setTimeout(() => {
        document.getElementById('find-movie')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      setCurrentView(viewId);
    }
    if (mobileOpen) {
      setMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div 
        className={`sidebar-overlay ${mobileOpen ? 'active' : ''}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Brand Logo */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon-wrapper">
              <Film size={22} strokeWidth={2.2} />
            </div>
            <div className="logo-text">
              <h1>MovieMind</h1>
              <span>Movie Universe</span>
            </div>
          </div>
          {mobileOpen && (
            <button 
              className="modal-close-btn"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav">
          <div className="nav-section-title">Navigation</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                <div className="nav-item-content">
                  <Icon size={19} strokeWidth={isActive ? 2.3 : 1.8} />
                  <span>{item.label}</span>
                </div>
                {item.count !== null && (
                  <span className="nav-badge">{item.count}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Add Button in Sidebar Footer */}
        <div className="sidebar-footer">
          <button 
            className="sidebar-quick-btn" 
            onClick={() => {
              if (mobileOpen) setMobileOpen(false);
              onOpenAddModal();
            }}
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>Add to Universe</span>
          </button>
        </div>
      </aside>
    </>
  );
}
