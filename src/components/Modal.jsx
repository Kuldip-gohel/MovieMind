import React, { useEffect, useRef } from 'react';
import { usePresence, useBodyLock } from '../hooks/useCinematic';

/**
 * Shared cinematic modal shell: animated enter/exit, scroll lock,
 * Escape-to-close and focus return. Business logic stays in the callers.
 */
export default function Modal({ isOpen, onClose, children, maxWidth = 640, labelledBy, className = '' }) {
  const { mounted, visible } = usePresence(isOpen, 280);
  const dialogRef = useRef(null);
  const returnFocus = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useBodyLock(mounted);

  useEffect(() => {
    if (!isOpen) return undefined;
    returnFocus.current = document.activeElement;
    const t = setTimeout(() => {
      const d = dialogRef.current;
      if (d && !d.contains(document.activeElement)) d.focus({ preventScroll: true });
    }, 60);
    const onKey = (e) => {
      if (e.key === 'Escape') closeRef.current();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      const el = returnFocus.current;
      if (el && typeof el.focus === 'function' && document.contains(el)) el.focus({ preventScroll: true });
    };
  }, [isOpen]);

  if (!mounted) return null;
  return (
    <div
      className={`modal-backdrop ${visible ? 'is-open' : ''}`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={`modal-dialog ${className}`}
        style={{ maxWidth }}
      >
        {children}
      </div>
    </div>
  );
}
