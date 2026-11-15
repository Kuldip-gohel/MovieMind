import React from 'react';

/**
 * Animated MovieMind mark: a film reel that draws itself in, then turns slowly.
 */
export default function Logo({ size = 40, animated = true, showWord = false, className = '' }) {
  const holes = Array.from({ length: 5 }).map((_, i) => {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    return { x: 32 + Math.cos(a) * 15, y: 32 + Math.sin(a) * 15 };
  });
  return (
    <span className={`logo ${animated ? 'logo-animated' : ''} ${className}`}>
      <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="MovieMind logo">
        <defs>
          <linearGradient id="logo-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#57E6FF" />
            <stop offset="1" stopColor="#FFB45C" />
          </linearGradient>
        </defs>
        <circle className="logo-ring" cx="32" cy="32" r="28" fill="none" stroke="url(#logo-grad)" strokeWidth="2.5" pathLength="100" />
        <g className="logo-reel">
          {holes.map((h, i) => (
            <circle key={i} cx={h.x} cy={h.y} r="5.2" fill="none" stroke="url(#logo-grad)" strokeWidth="2" />
          ))}
          <circle cx="32" cy="32" r="3.4" fill="url(#logo-grad)" />
        </g>
      </svg>
      {showWord && (
        <span className="logo-word">
          Movie<span>Mind</span>
        </span>
      )}
    </span>
  );
}
