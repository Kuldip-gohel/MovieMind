import { useEffect, useRef, useState } from 'react';

/**
 * Small dependency-free animation hooks used by the cinematic UI.
 * All of them respect prefers-reduced-motion and only enable pointer
 * effects on devices with a real hover pointer (mouse / trackpad).
 */

const canMatch = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function';

function useMediaQuery(query, fallback = false) {
  const [matches, setMatches] = useState(() => (canMatch() ? window.matchMedia(query).matches : fallback));
  useEffect(() => {
    if (!canMatch()) return undefined;
    const mq = window.matchMedia(query);
    const handler = () => setMatches(mq.matches);
    handler();
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);
  return matches;
}

export const usePrefersReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');
export const useFinePointer = () => useMediaQuery('(hover: hover) and (pointer: fine)');

/** Keeps an element mounted long enough to play its exit animation. */
export function usePresence(isOpen, ms = 260) {
  const [mounted, setMounted] = useState(isOpen);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      let id2 = 0;
      const id1 = requestAnimationFrame(() => {
        id2 = requestAnimationFrame(() => setVisible(true));
      });
      return () => {
        cancelAnimationFrame(id1);
        cancelAnimationFrame(id2);
      };
    }
    setVisible(false);
    const t = setTimeout(() => setMounted(false), ms);
    return () => clearTimeout(t);
  }, [isOpen, ms]);
  return { mounted, visible };
}

/** Returns the latest non-null value so content survives a closing animation. */
export function useLatest(value) {
  const ref = useRef(value);
  if (value !== null && value !== undefined) ref.current = value;
  return value ?? ref.current;
}

let lockCount = 0;
/** Locks page scroll while a modal is open (reference counted). */
export function useBodyLock(active) {
  useEffect(() => {
    if (!active) return undefined;
    lockCount += 1;
    document.documentElement.classList.add('scroll-locked');
    return () => {
      lockCount -= 1;
      if (lockCount <= 0) {
        lockCount = 0;
        document.documentElement.classList.remove('scroll-locked');
      }
    };
  }, [active]);
}

/** True once the element has entered the viewport. */
export function useInView(ref, { once = true, rootMargin = '0px 0px -8% 0px', threshold = 0.1 } = {}) {
  const [inView, setInView] = useState(() => typeof IntersectionObserver === 'undefined');
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin, threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, once, rootMargin, threshold]);
  return inView;
}

/**
 * 3D tilt + mouse-following spotlight. Writes CSS variables
 * (--rx, --ry, --mx, --my) straight onto the element, so React never re-renders.
 */
export function useTilt(ref, { max = 9 } = {}) {
  const reduced = usePrefersReducedMotion();
  const fine = useFinePointer();
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || !fine) return undefined;
    let raf = 0;
    let rect = null;
    let pos = { x: 0, y: 0 };

    const apply = () => {
      raf = 0;
      if (!rect) return;
      const px = Math.min(1, Math.max(0, pos.x / rect.width));
      const py = Math.min(1, Math.max(0, pos.y / rect.height));
      el.style.setProperty('--rx', `${((0.5 - py) * max * 2).toFixed(2)}deg`);
      el.style.setProperty('--ry', `${((px - 0.5) * max * 2).toFixed(2)}deg`);
      el.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
      el.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
    };
    const enter = () => {
      rect = el.getBoundingClientRect();
      el.classList.add('is-tilting');
    };
    const move = (e) => {
      if (!rect) rect = el.getBoundingClientRect();
      pos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const leave = () => {
      rect = null;
      el.classList.remove('is-tilting');
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
      el.style.setProperty('--mx', '50%');
      el.style.setProperty('--my', '50%');
    };

    el.addEventListener('pointerenter', enter);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointerenter', enter);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref, reduced, fine, max]);
}

/** Magnetic pull towards the cursor for buttons. */
export function useMagnetic(ref, strength = 0.28) {
  const reduced = usePrefersReducedMotion();
  const fine = useFinePointer();
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || !fine) return undefined;
    const move = (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.setProperty('--tx', `${(dx * strength).toFixed(1)}px`);
      el.style.setProperty('--ty', `${(dy * strength).toFixed(1)}px`);
    };
    const leave = () => {
      el.style.setProperty('--tx', '0px');
      el.style.setProperty('--ty', '0px');
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, [ref, reduced, fine, strength]);
}

/** Animated number that eases from its previous value to the target. */
export function useCountUp(target, { duration = 1000, start = true } = {}) {
  const reduced = usePrefersReducedMotion();
  const [value, setValue] = useState(reduced ? target : 0);
  const current = useRef(reduced ? target : 0);
  useEffect(() => {
    if (!start) return undefined;
    if (reduced) {
      current.current = target;
      setValue(target);
      return undefined;
    }
    const from = current.current;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = Math.round(from + (target - from) * eased);
      current.current = v;
      setValue(v);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, start, duration, reduced]);
  return value;
}
