import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';

/**
 * Smooth horizontal carousel: scroll-snap, drag-to-scroll with a mouse,
 * arrow buttons, and edge fades that show when more cards are off-screen.
 */
export default function MovieCarousel({ movies, onViewDetails, onEdit, onDelete }) {
  const trackRef = useRef(null);
  const drag = useRef({ active: false, moved: false, startX: 0, startScroll: 0 });
  const [edges, setEdges] = useState({ start: true, end: false });
  const [dragging, setDragging] = useState(false);

  const updateEdges = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setEdges({
      start: el.scrollLeft <= 4,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4
    });
  }, []);

  useEffect(() => {
    updateEdges();
    const el = trackRef.current;
    if (!el) return undefined;
    el.addEventListener('scroll', updateEdges, { passive: true });
    window.addEventListener('resize', updateEdges);
    return () => {
      el.removeEventListener('scroll', updateEdges);
      window.removeEventListener('resize', updateEdges);
    };
  }, [updateEdges, movies.length]);

  const scrollByPage = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.82, behavior: 'smooth' });
  };

  const onPointerDown = (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    const el = trackRef.current;
    drag.current = { active: true, moved: false, startX: e.clientX, startScroll: el.scrollLeft };
    const move = (ev) => {
      const dx = ev.clientX - drag.current.startX;
      if (Math.abs(dx) > 6 && !drag.current.moved) {
        drag.current.moved = true;
        setDragging(true);
      }
      if (drag.current.moved) el.scrollLeft = drag.current.startScroll - dx;
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      drag.current.active = false;
      setDragging(false);
      // let the click that follows a drag be swallowed, then reset
      setTimeout(() => { drag.current.moved = false; }, 0);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  return (
    <div className={`carousel ${edges.start ? 'at-start' : ''} ${edges.end ? 'at-end' : ''}`}>
      <button
        type="button"
        className="carousel-btn carousel-prev"
        onClick={() => scrollByPage(-1)}
        disabled={edges.start}
        aria-label="Previous movies"
      >
        <ChevronLeft size={20} />
      </button>
      <div
        ref={trackRef}
        className={`carousel-track ${dragging ? 'is-dragging' : ''}`}
        onPointerDown={onPointerDown}
        onClickCapture={(e) => {
          if (drag.current.moved) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        {movies.map((movie, i) => (
          <div className="carousel-item" key={movie.id}>
            <MovieCard
              movie={movie}
              index={i}
              onViewDetails={onViewDetails}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>
        ))}
      </div>
      <button
        type="button"
        className="carousel-btn carousel-next"
        onClick={() => scrollByPage(1)}
        disabled={edges.end}
        aria-label="Next movies"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
