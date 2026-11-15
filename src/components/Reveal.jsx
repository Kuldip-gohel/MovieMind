import React, { useRef } from 'react';
import { useInView } from '../hooks/useCinematic';

/** Scroll-triggered section reveal (once). Pure CSS transition driven by an IntersectionObserver. */
export default function Reveal({ as: Tag = 'div', className = '', delay = 0, children, ...rest }) {
  const ref = useRef(null);
  const inView = useInView(ref);
  return (
    <Tag
      ref={ref}
      className={`reveal ${inView ? 'is-in' : ''} ${className}`}
      style={{ '--rd': `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
