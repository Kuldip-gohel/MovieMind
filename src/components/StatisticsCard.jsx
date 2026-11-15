import React, { useRef } from 'react';
import { useCountUp, useInView, useTilt } from '../hooks/useCinematic';

/**
 * Glass statistic tile: animated counter (re-animates whenever the value changes),
 * 3D tilt and a mouse-following glow.
 */
export default function StatisticsCard({ title, count, type = 'total', icon: Icon, subtext, onClick }) {
  const ref = useRef(null);
  const inView = useInView(ref, { threshold: 0.3 });
  const shown = useCountUp(count, { start: inView, duration: 1100 });
  useTilt(ref, { max: 6 });

  return (
    <button
      ref={ref}
      type="button"
      className={`stat-card ${type}`}
      onClick={onClick}
      title={onClick ? `View ${title}` : undefined}
      aria-label={`${title}: ${count}`}
    >
      <span className="stat-spot" aria-hidden="true" />
      {Icon && (
        <span className="stat-icon">
          <Icon size={22} strokeWidth={1.9} />
        </span>
      )}
      <span className="stat-value" aria-hidden="true">{shown}</span>
      <span className="stat-label">{title}</span>
      {subtext && <span className="stat-subtext">{subtext}</span>}
    </button>
  );
}
