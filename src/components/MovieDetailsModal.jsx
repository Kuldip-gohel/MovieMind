import React from 'react';
import { X, Star, Edit3, Trash2, CheckCircle2, Clock, Bookmark } from 'lucide-react';
import Modal from './Modal';
import { MoviePoster } from './PosterArt';
import { useLatest } from '../hooks/useCinematic';

const STATUSES = [
  { value: 'Want to Watch', icon: Bookmark },
  { value: 'Currently Watching', icon: Clock },
  { value: 'Watched', icon: CheckCircle2 }
];

/**
 * Cinematic movie details: blurred poster atmosphere, large poster, quick status switcher,
 * and the existing Edit / Delete actions.
 */
export default function MovieDetailsModal({ movie: movieProp, isOpen, onClose, onEdit, onDelete, onStatusChange }) {
  const movie = useLatest(movieProp);
  if (!movie) return null;

  const statusClass =
    movie.status === 'Watched' ? 'watched' : movie.status === 'Currently Watching' ? 'watching' : 'want';

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth={940} labelledBy="details-title" className="details-dialog">
      <div className="details-backdrop" aria-hidden="true">
        <MoviePoster movie={movie} />
      </div>
      <button type="button" className="modal-close-btn details-close" onClick={onClose} aria-label="Close">
        <X size={20} />
      </button>

      <div className="details-layout">
        <div className="details-poster">
          <MoviePoster movie={movie} showTitle />
        </div>

        <div className="details-main">
          <h2 className="details-title" id="details-title">{movie.title}</h2>
          <div className="details-chips">
            <span className="rating-badge">
              <Star size={12} fill="currentColor" strokeWidth={0} />
              {Number(movie.rating).toFixed(1)} / 10
            </span>
            <span className={`status-pill ${statusClass}`}>
              <span className="status-dot" />
              {movie.status}
            </span>
            <span className="tag tag-year">{movie.releaseYear}</span>
            <span className="tag">{movie.genre}</span>
            <span className="tag">{movie.language}</span>
          </div>

          <div className="details-quick-status">
            <span className="details-label">Change status</span>
            <div className="details-status-buttons">
              {STATUSES.map(({ value, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  className={`status-switch-btn ${movie.status === value ? 'active' : ''}`}
                  aria-pressed={movie.status === value}
                  onClick={() => onStatusChange(movie.id, value)}
                >
                  <Icon size={14} />
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div className="details-synopsis">
            <span className="details-label">Synopsis</span>
            <p>{movie.description || 'No detailed synopsis available for this title.'}</p>
          </div>
        </div>
      </div>

      <div className="modal-footer details-footer">
        <button
          type="button"
          className="btn-ghost danger-text"
          onClick={() => {
            onClose();
            onDelete(movie);
          }}
        >
          <Trash2 size={15} /> Delete
        </button>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => {
            onClose();
            onEdit(movie);
          }}
        >
          <Edit3 size={15} /> Edit Details
        </button>
        <button type="button" className="btn-glow small" onClick={onClose}>
          Close
        </button>
      </div>
    </Modal>
  );
}
