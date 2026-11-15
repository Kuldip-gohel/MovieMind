import React, { useRef } from 'react';
import { Star, Eye, Edit3, Trash2, CheckCircle2 } from 'lucide-react';
import { MoviePoster } from './PosterArt';
import { useTilt } from '../hooks/useCinematic';

/** Large "now playing" panel for the Currently Watching view. */
export default function FeaturedWatching({ movie, onViewDetails, onEdit, onDelete, onStatusChange }) {
  const ref = useRef(null);
  useTilt(ref, { max: 6 });
  return (
    <section className="now-playing" aria-label={`Now playing: ${movie.title}`}>
      <div className="now-backdrop" aria-hidden="true">
        <MoviePoster movie={movie} />
      </div>
      <div className="now-grid">
        <div ref={ref} className="now-poster-wrap">
          <div className="now-poster">
            <MoviePoster movie={movie} showTitle />
            <span className="card-spot" aria-hidden="true" />
          </div>
        </div>
        <div className="now-copy">
          <span className="live-pill"><span className="status-dot" /> Now playing</span>
          <h2 className="now-title">{movie.title}</h2>
          <div className="card-tags">
            <span className="rating-badge"><Star size={12} fill="currentColor" strokeWidth={0} />{Number(movie.rating).toFixed(1)}</span>
            <span className="tag tag-year">{movie.releaseYear}</span>
            <span className="tag">{movie.genre}</span>
            <span className="tag">{movie.language}</span>
          </div>
          <p className="now-desc">{movie.description || 'No description provided.'}</p>
          <div className="now-progress" aria-hidden="true"><span /></div>
          <div className="now-actions">
            <button type="button" className="btn-glow small" onClick={() => onStatusChange(movie.id, 'Watched')}>
              <CheckCircle2 size={16} /> Mark as watched
            </button>
            <button type="button" className="btn-ghost" onClick={() => onViewDetails(movie)}>
              <Eye size={15} /> Details
            </button>
            <button type="button" className="btn-ghost icon" onClick={() => onEdit(movie)} aria-label={`Edit ${movie.title}`} title="Edit movie">
              <Edit3 size={15} />
            </button>
            <button type="button" className="btn-ghost icon danger" onClick={() => onDelete(movie)} aria-label={`Delete ${movie.title}`} title="Delete movie">
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
