import React, { useEffect, useState } from 'react';
import { Menu, Plus, X } from 'lucide-react';
import Logo from './Logo';
import MagneticButton from './MagneticButton';
import { useBodyLock } from '../hooks/useCinematic';

/**
 * Top navigation (replaces the old sidebar).
 * Desktop: floating glass pill with the five sections.
 * Tablet / mobile: hamburger that opens a full-screen cinematic menu.
 */
export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'want_to_watch', label: 'My Watchlist' },
  { id: 'currently_watching', label: 'Currently Watching' },
  { id: 'watched', label: 'Watched Movies' },
  { id: 'discover', label: 'Discover / All Movies' }
];

export default function Navbar({ currentView, onNavigate, counts, onOpenAddModal, mobileOpen, setMobileOpen }) {
  const [scrolled, setScrolled] = useState(false);
  useBodyLock(mobileOpen);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const onKey = (e) => e.key === 'Escape' && setMobileOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileOpen, setMobileOpen]);

  const countFor = (id) => {
    switch (id) {
      case 'want_to_watch': return counts.wantToWatch;
      case 'currently_watching': return counts.currentlyWatching;
      case 'watched': return counts.watched;
      case 'discover': return counts.total;
      default: return null;
    }
  };

  const go = (id) => {
    setMobileOpen(false);
    onNavigate(id);
  };

  return (
    <>
      <header className={`nav ${scrolled ? 'is-scrolled' : ''}`}>
        <button type="button" className="nav-brand" onClick={() => go('dashboard')} aria-label="MovieMind home">
          <Logo size={38} showWord animated={false} />
        </button>

        <nav className="nav-links" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`nav-link ${currentView === item.id ? 'active' : ''}`}
              aria-current={currentView === item.id ? 'page' : undefined}
              onClick={() => go(item.id)}
            >
              {item.label}
              {countFor(item.id) !== null && <span className="nav-count">{countFor(item.id)}</span>}
            </button>
          ))}
        </nav>

        <div className="nav-right">
          <MagneticButton
            className="btn-glow small"
            strength={0.2}
            onClick={() => {
              setMobileOpen(false);
              onOpenAddModal();
            }}
          >
            <Plus size={17} strokeWidth={2.6} />
            <span className="add-label">Add Movie</span>
          </MagneticButton>
          <button
            type="button"
            className="nav-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      <div className={`nav-drawer ${mobileOpen ? 'open' : ''}`} aria-hidden={!mobileOpen}>
        <div className="nav-drawer-bg" onClick={() => setMobileOpen(false)} />
        <div className="nav-drawer-list">
          {NAV_ITEMS.map((item, i) => (
            <button
              key={item.id}
              type="button"
              tabIndex={mobileOpen ? 0 : -1}
              className={`nav-drawer-item ${currentView === item.id ? 'active' : ''}`}
              style={{ '--i': i }}
              onClick={() => go(item.id)}
            >
              <span>{item.label}</span>
              {countFor(item.id) !== null && <span className="nav-drawer-count">{countFor(item.id)}</span>}
            </button>
          ))}
          <p className="nav-drawer-foot">Every story has its own universe.</p>
        </div>
      </div>
    </>
  );
}
