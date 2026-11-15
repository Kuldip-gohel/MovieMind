import React, { useRef } from 'react';
import { useMagnetic } from '../hooks/useCinematic';

/** Button that gently pulls towards the cursor. Drop-in replacement for <button>. */
export default function MagneticButton({ children, className = '', strength = 0.28, ...rest }) {
  const ref = useRef(null);
  useMagnetic(ref, strength);
  return (
    <button ref={ref} type="button" className={`magnetic ${className}`} {...rest}>
      <span className="magnetic-inner">{children}</span>
    </button>
  );
}
