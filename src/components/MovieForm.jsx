import React, { useState, useEffect } from 'react';
import { X, Film, Sparkles, Star, AlertCircle, ChevronDown } from 'lucide-react';
import Modal from './Modal';
import { MoviePoster } from './PosterArt';
import { useLatest } from '../hooks/useCinematic';

const GENRES = [
  'Action',
  'Adventure',
  'Animation',
  'Comedy',
  'Crime',
  'Documentary',
  'Drama',
  'Fantasy',
  'Horror',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Thriller',
  'Western'
];

const LANGUAGES = [
  'English',
  'Spanish',
  'French',
  'Japanese',
  'Korean',
  'German',
  'Hindi',
  'Italian',
  'Mandarin',
  'Portuguese',
  'Other'
];

/**
 * MovieForm Component
 * Used for both Adding and Editing movies with full validation and instant preview.
 */
export default function MovieForm({
  isOpen,
  onClose,
  onSubmit,
  initialMovie = null
}) {
  // Keep the movie around while the closing animation plays (no flash of an empty form).
  const movieBeingEdited = useLatest(initialMovie);
  const isEditMode = Boolean(movieBeingEdited);

  const [formData, setFormData] = useState({
    title: '',
    genre: 'Sci-Fi',
    releaseYear: new Date().getFullYear(),
    language: 'English',
    rating: 8.0,
    status: 'Want to Watch',
    description: '',
    posterUrl: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (movieBeingEdited) {
      setFormData({
        title: movieBeingEdited.title || '',
        genre: movieBeingEdited.genre || 'Sci-Fi',
        releaseYear: movieBeingEdited.releaseYear || new Date().getFullYear(),
        language: movieBeingEdited.language || 'English',
        rating: movieBeingEdited.rating !== undefined ? movieBeingEdited.rating : 8.0,
        status: movieBeingEdited.status || 'Want to Watch',
        description: movieBeingEdited.description || '',
        posterUrl: movieBeingEdited.posterUrl || ''
      });
    } else {
      setFormData({
        title: '',
        genre: 'Sci-Fi',
        releaseYear: new Date().getFullYear(),
        language: 'English',
        rating: 8.0,
        status: 'Want to Watch',
        description: '',
        posterUrl: ''
      });
    }
    setErrors({});
    setTouched({});
  }, [movieBeingEdited, isOpen]);

  const validate = (data) => {
    const errs = {};
    if (!data.title.trim()) {
      errs.title = 'Movie title is required.';
    }

    const currentYear = new Date().getFullYear() + 5;
    if (!data.releaseYear) {
      errs.releaseYear = 'Release year is required.';
    } else if (Number(data.releaseYear) < 1888 || Number(data.releaseYear) > currentYear) {
      errs.releaseYear = `Year must be between 1888 and ${currentYear}.`;
    }

    if (!data.genre) {
      errs.genre = 'Please select a genre.';
    }

    if (!data.language.trim()) {
      errs.language = 'Language is required.';
    }

    if (data.rating === '' || data.rating === null || isNaN(data.rating)) {
      errs.rating = 'Rating is required.';
    } else if (Number(data.rating) < 0 || Number(data.rating) > 10) {
      errs.rating = 'Rating must be between 0.0 and 10.0';
    }

    if (!data.status) {
      errs.status = 'Please choose a watching status.';
    }

    return errs;
  };

  const handleChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    if (touched[field]) {
      const errs = validate(updated);
      setErrors(errs);
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errs = validate(formData);
    setErrors(errs);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const allTouched = {
      title: true,
      releaseYear: true,
      genre: true,
      language: true,
      rating: true,
      status: true
    };
    setTouched(allTouched);

    const validationErrors = validate(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      onSubmit({
        ...formData,
        title: formData.title.trim(),
        releaseYear: Number(formData.releaseYear),
        rating: Number(Number(formData.rating).toFixed(1)),
        description: formData.description.trim(),
        posterUrl: formData.posterUrl.trim()
      });
      onClose();
    }
  };

  const fieldError = (name) =>
    errors[name] && touched[name] ? (
      <span className="form-error-msg" role="alert">
        <AlertCircle size={14} /> {errors[name]}
      </span>
    ) : null;

  const previewMovie = {
    title: formData.title.trim() || 'Your Title',
    genre: formData.genre,
    releaseYear: formData.releaseYear || '',
    posterUrl: formData.posterUrl.trim()
  };
  const ratingFill = `${(Number(formData.rating) / 10) * 100}%`;
  const radioClass = { 'Want to Watch': 'want', 'Currently Watching': 'watching', Watched: 'watched' };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth={900} labelledBy="movie-form-title">
      <div className="modal-header">
        <div className="modal-header-title">
          <div className="modal-header-icon">{isEditMode ? <Film size={19} /> : <Sparkles size={19} />}</div>
          <h3 id="movie-form-title">{isEditMode ? 'Edit Movie Details' : 'Add to Movie Universe'}</h3>
        </div>
        <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate style={{ display: 'contents' }}>
        <div className="modal-body">
          <div className="form-layout">
            {/* Live poster preview */}
            <div className="form-preview" aria-hidden="true">
              <div className="form-preview-poster">
                <MoviePoster movie={previewMovie} showTitle />
              </div>
              <p>Live poster preview</p>
            </div>

            <div className="form-grid">
              {/* Title */}
              <div className="form-group full-width">
                <label className="form-label" htmlFor="movie-title">
                  Movie Title <span className="req">*</span>
                </label>
                <input
                  id="movie-title"
                  type="text"
                  className={`form-input ${errors.title && touched.title ? 'error' : ''}`}
                  placeholder="e.g. Inception, Dune, Interstellar..."
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  onBlur={() => handleBlur('title')}
                  autoFocus
                />
                {fieldError('title')}
              </div>

              {/* Genre */}
              <div className="form-group">
                <label className="form-label" htmlFor="movie-genre">
                  Genre <span className="req">*</span>
                </label>
                <div className="select-field">
                  <select
                    id="movie-genre"
                    className={`form-select ${errors.genre && touched.genre ? 'error' : ''}`}
                    value={formData.genre}
                    onChange={(e) => handleChange('genre', e.target.value)}
                    onBlur={() => handleBlur('genre')}
                  >
                    {GENRES.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                  <ChevronDown className="select-chevron" size={18} />
                </div>
                {fieldError('genre')}
              </div>

              {/* Release Year */}
              <div className="form-group">
                <label className="form-label" htmlFor="movie-year">
                  Release Year <span className="req">*</span>
                </label>
                <input
                  id="movie-year"
                  type="number"
                  min="1888"
                  max="2100"
                  className={`form-input ${errors.releaseYear && touched.releaseYear ? 'error' : ''}`}
                  placeholder="e.g. 2024"
                  value={formData.releaseYear}
                  onChange={(e) => handleChange('releaseYear', e.target.value)}
                  onBlur={() => handleBlur('releaseYear')}
                />
                {fieldError('releaseYear')}
              </div>

              {/* Language */}
              <div className="form-group">
                <label className="form-label" htmlFor="movie-lang">
                  Language <span className="req">*</span>
                </label>
                <div className="select-field">
                  <select
                    id="movie-lang"
                    className={`form-select ${errors.language && touched.language ? 'error' : ''}`}
                    value={formData.language}
                    onChange={(e) => handleChange('language', e.target.value)}
                    onBlur={() => handleBlur('language')}
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                  <ChevronDown className="select-chevron" size={18} />
                </div>
                {fieldError('language')}
              </div>

              {/* Rating */}
              <div className="form-group">
                <label className="form-label" htmlFor="movie-rating">
                  Rating (0–10) <span className="req">*</span>
                </label>
                <div className="rating-slider-row">
                  <input
                    id="movie-rating"
                    type="range"
                    min="0"
                    max="10"
                    step="0.1"
                    className="rating-slider"
                    style={{ '--fill': ratingFill }}
                    value={formData.rating}
                    onChange={(e) => handleChange('rating', parseFloat(e.target.value))}
                    onBlur={() => handleBlur('rating')}
                  />
                  <div className="rating-display-badge">
                    <Star size={13} fill="currentColor" strokeWidth={0} />
                    <span>{Number(formData.rating).toFixed(1)}</span>
                  </div>
                </div>
                {fieldError('rating')}
              </div>

              {/* Watching Status Radio Buttons */}
              <fieldset className="form-group full-width form-fieldset">
                <legend className="form-label">
                  Watching Status <span className="req">*</span>
                </legend>
                <div className="status-radio-group">
                  {['Want to Watch', 'Currently Watching', 'Watched'].map((statusOption) => (
                    <label
                      key={statusOption}
                      className={`status-radio-card ${radioClass[statusOption]} ${formData.status === statusOption ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="watching-status"
                        value={statusOption}
                        checked={formData.status === statusOption}
                        onChange={() => handleChange('status', statusOption)}
                      />
                      <span className="radio-mark" aria-hidden="true" />
                      <span>{statusOption}</span>
                    </label>
                  ))}
                </div>
                {fieldError('status')}
              </fieldset>

              {/* Poster URL (Optional) */}
              <div className="form-group full-width">
                <label className="form-label" htmlFor="movie-poster">
                  Poster Image URL <span className="optional">(optional)</span>
                </label>
                <input
                  id="movie-poster"
                  type="url"
                  className="form-input"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={formData.posterUrl}
                  onChange={(e) => handleChange('posterUrl', e.target.value)}
                />
                <span className="form-hint">Leave empty or broken and a cinematic poster is generated for you.</span>
              </div>

              {/* Description */}
              <div className="form-group full-width">
                <label className="form-label" htmlFor="movie-desc">
                  Description / Synopsis <span className="optional">(optional)</span>
                </label>
                <textarea
                  id="movie-desc"
                  rows="3"
                  className="form-textarea"
                  placeholder="Enter a brief synopsis or personal thoughts on this movie..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-glow small">
            {isEditMode ? 'Save Changes' : 'Add to My Universe'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
