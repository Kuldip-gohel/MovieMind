import React, { useRef } from 'react';
import { Star, Eye, Edit3, Trash2 } from 'lucide-react';
import { MoviePoster } from './PosterArt';
import { useInView, useTilt } from '../hooks/useCinematic';

/**
 * Cinematic poster card.
 * - 3D tilt + mouse-following spotlight (CSS variables written by useTilt)
 * - Poster zoom and animated detail overlay on hover / keyboard focus
 * - Whole card opens the details modal; Edit and Delete stay one click away
 */
export default function MovieCard({ movie, index = 0, onViewDetails, onEdit, onDelete }) {
  const ref = useRef(null);
  const inView = useInView(ref, { threshold: 0.08 });
  useTilt(ref, { max: 9 });

  const statusClass =
    movie.status === 'Watched' ? 'watched' : movie.status === 'Currently Watching' ? 'watching' : 'want';

  return (
    <article
      ref={ref}
      className={`movie-card status-${statusClass} ${inView ? 'is-in' : ''}`}
      style={{ '--i': index % 8 }}
    >
      <div className="card-surface">
        <MoviePoster movie={movie} showTitle={false} className="card-poster" />
        <span className="card-shade" aria-hidden="true" />
        <span className="card-spot" aria-hidden="true" />

        <button
          type="button"
          className="card-open"
          onClick={() => onViewDetails(movie)}
          aria-label={`View details for ${movie.title}`}
        />

        <div className="card-top">
          <span className="rating-badge" title={`Rating: ${movie.rating}/10`}>
            <Star size={12} fill="currentColor" strokeWidth={0} />
            {Number(movie.rating).toFixed(1)}
          </span>
          <span className={`status-pill ${statusClass}`}>
            <span className="status-dot" />
            {movie.status}
          </span>
        </div>

        <div className="card-info">
          <h3 className="card-title" title={movie.title}>{movie.title}</h3>
          <div className="card-tags">
            <span className="tag tag-year">{movie.releaseYear}</span>
            <span className="tag">{movie.genre}</span>
            <span className="tag">{movie.language}</span>
          </div>
          <div className="card-reveal">
            <div className="card-reveal-inner">
              <p className="card-desc">{movie.description || 'No description provided.'}</p>
              <div className="card-actions">
                <button type="button" className="card-btn" onClick={() => onViewDetails(movie)}>
                  <Eye size={15} /> Details
                </button>
                <button
                  type="button"
                  className="card-btn icon"
                  onClick={() => onEdit(movie)}
                  aria-label={`Edit ${movie.title}`}
                  title="Edit movie"
                >
                  <Edit3 size={15} />
                </button>
                <button
                  type="button"
                  className="card-btn icon danger"
                  onClick={() => onDelete(movie)}
                  aria-label={`Delete ${movie.title}`}
                  title="Delete movie"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
