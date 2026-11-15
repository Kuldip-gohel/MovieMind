import React, { useEffect, useMemo, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import Logo from './Logo';
import Particles from './Particles';
import MagneticButton from './MagneticButton';
import { MoviePoster } from './PosterArt';
import { SAMPLE_MOVIES } from '../utils/storage';
import { useFinePointer, usePrefersReducedMotion } from '../hooks/useCinematic';

/**
 * Full-screen cinematic hero.
 * - Mouse-responsive 3D poster stack (CSS variables --px / --py, updated in rAF)
 * - Scroll-driven transition: layers drift at different speeds and the hero
 *   dissolves into the dashboard (CSS variable --p, 0 → 1)
 * - Animated lighting: projector beam, aurora glows, orbiting rings, particles
 */
export default function CinematicHero({ movies, onExplore }) {
  const heroRef = useRef(null);
  const reduced = usePrefersReducedMotion();
  const fine = useFinePointer();

  // Floating posters come from the user's own collection (top rated first).
  const posters = useMemo(() => {
    const pool = movies.length >= 3 ? movies : SAMPLE_MOVIES;
    return [...pool].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 5);
  }, [movies]);

  // Scroll progress → --p
  useEffect(() => {
    const el = heroRef.current;
    if (!el || reduced) return undefined;
    let raf = 0;
    const update = () => {
      raf = 0;
      const p = Math.min(1, Math.max(0, window.scrollY / (el.offsetHeight * 0.85)));
      el.style.setProperty('--p', p.toFixed(3));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced]);

  // Pointer position → --px / --py (-1..1)
  useEffect(() => {
    const el = heroRef.current;
    if (!el || reduced || !fine) return undefined;
    let raf = 0;
    let next = { x: 0, y: 0 };
    const apply = () => {
      raf = 0;
      el.style.setProperty('--px', next.x.toFixed(3));
      el.style.setProperty('--py', next.y.toFixed(3));
    };
    const move = (e) => {
      const r = el.getBoundingClientRect();
      next = {
        x: ((e.clientX - r.left) / r.width - 0.5) * 2,
        y: ((e.clientY - r.top) / r.height - 0.5) * 2
      };
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const leave = () => {
      next = { x: 0, y: 0 };
      if (!raf) raf = requestAnimationFrame(apply);
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced, fine]);

  return (
    <section ref={heroRef} className="hero" id="home" aria-label="MovieMind introduction">
      {/* Atmosphere */}
      <div className="hero-bg" aria-hidden="true">
        <div className="hero-aurora hero-aurora-cyan" />
        <div className="hero-aurora hero-aurora-amber" />
        <div className="hero-beam" />
        <div className="hero-grid" />
        <div className="hero-orb">
          <span className="orb-core" />
          <span className="orb-ring orb-ring-1" />
          <span className="orb-ring orb-ring-2" />
          <span className="orb-ring orb-ring-3" />
        </div>
      </div>
      <Particles className="hero-particles" />

      {/* Floating poster stack */}
      <div className="hero-stage" aria-hidden="true">
        {posters.map((movie, i) => (
          <div key={movie.id} className={`hp hp-${i + 1}`}>
            <div className="hp-card">
              <MoviePoster movie={movie} showTitle />
              <span className="hp-sheen" />
            </div>
          </div>
        ))}
      </div>

      {/* Copy */}
      <div className="hero-content">
        <div className="hero-anim hero-logo" style={{ '--d': '0ms' }}>
          <Logo size={54} showWord />
        </div>
        <h1 className="hero-title">
          <span className="hero-line">
            <span className="hero-line-inner hero-anim" style={{ '--d': '120ms' }}>Your universe.</span>
          </span>
          <span className="hero-line hero-line-outline">
            <span className="hero-line-inner hero-anim" style={{ '--d': '260ms' }}>Your stories.</span>
          </span>
        </h1>
        <p className="hero-sub hero-anim" style={{ '--d': '460ms' }}>
          Discover, organize, and experience your personal world of cinema.
        </p>
        <div className="hero-cta hero-anim" style={{ '--d': '600ms' }}>
          <MagneticButton className="btn-glow" onClick={onExplore}>
            Explore collection
          </MagneticButton>
          <span className="hero-tagline">Every story has its own universe.</span>
        </div>
      </div>

      <button type="button" className="hero-scroll" onClick={onExplore} aria-label="Scroll to your collection">
        <span>Scroll</span>
        <ChevronDown size={16} />
      </button>

      <div className="hero-fade" aria-hidden="true" />
    </section>
  );
}
