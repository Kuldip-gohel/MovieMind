import React, { useEffect, useLayoutEffect, useState } from 'react';
import Logo from './Logo';
import { usePrefersReducedMotion } from '../hooks/useCinematic';

/**
 * Cinematic page entrance: logo draws in, then the curtain splits open
 * while the hero animates in underneath (CSS hooks on html.intro-playing).
 */
export default function IntroCurtain() {
  const reduced = usePrefersReducedMotion();
  const [phase, setPhase] = useState(reduced ? 'done' : 'in');

  useLayoutEffect(() => {
    if (phase === 'done') return undefined;
    document.documentElement.classList.add('intro-playing');
    return () => document.documentElement.classList.remove('intro-playing');
  }, [phase]);

  useEffect(() => {
    if (reduced) return undefined;
    const t1 = setTimeout(() => setPhase('leaving'), 1250);
    const t2 = setTimeout(() => setPhase('done'), 2050);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [reduced]);

  useEffect(() => {
    // Release the hero animations as the curtain starts to open.
    if (phase === 'leaving') document.documentElement.classList.remove('intro-playing');
  }, [phase]);

  if (phase === 'done') return null;
  return (
    <div className={`intro ${phase === 'leaving' ? 'is-leaving' : ''}`} aria-hidden="true">
      <div className="intro-panel intro-panel-top" />
      <div className="intro-panel intro-panel-bottom" />
      <div className="intro-center">
        <Logo size={92} showWord />
        <span className="intro-bar" />
      </div>
    </div>
  );
}
