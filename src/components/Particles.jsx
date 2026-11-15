import React, { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '../hooks/useCinematic';

/**
 * Lightweight floating dust/particles canvas for the hero.
 * Pauses when off-screen or when the tab is hidden; static under reduced motion.
 */
export default function Particles({ className = '' }) {
  const canvasRef = useRef(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    let w = 0;
    let h = 0;
    let particles = [];
    let raf = 0;
    let running = false;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const make = () => {
      const count = Math.max(24, Math.min(64, Math.round((w * h) / 26000)));
      particles = Array.from({ length: count }).map(() => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.5 + Math.random() * 1.8,
        vx: (Math.random() - 0.5) * 0.12,
        vy: -0.08 - Math.random() * 0.22,
        a: 0.15 + Math.random() * 0.55,
        tw: Math.random() * Math.PI * 2,
        c: Math.random() > 0.72 ? '255,180,92' : '87,230,255'
      }));
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      make();
      draw(0);
    };

    const draw = (step) => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.x += p.vx * step;
        p.y += p.vy * step;
        p.tw += 0.02 * step;
        if (p.y < -4) { p.y = h + 4; p.x = Math.random() * w; }
        if (p.x < -4) p.x = w + 4;
        if (p.x > w + 4) p.x = -4;
        const alpha = p.a * (0.6 + Math.sin(p.tw) * 0.4);
        ctx.beginPath();
        ctx.fillStyle = `rgba(${p.c},${alpha.toFixed(3)})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    let last = 0;
    const loop = (now) => {
      if (!running) return;
      const step = Math.min(3, (now - last) / 16.67 || 1);
      last = now;
      draw(step);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (running || reduced) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    resize();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    ro?.observe(canvas);
    const io = typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()))
      : null;
    io?.observe(canvas);
    if (!io) start();
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVis);

    return () => {
      stop();
      ro?.disconnect();
      io?.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [reduced]);

  return <canvas ref={canvasRef} className={`particles ${className}`} aria-hidden="true" />;
}
