import React from 'react';
import { ChevronDown, SlidersHorizontal, RotateCcw } from 'lucide-react';

/**
 * FilterBar Component
 * Multi-criteria filtering by watching status, genre, language, and sorting.
 */
export default function FilterBar({
  statusFilter,
  onStatusChange,
  selectedGenre,
  onGenreChange,
  genres = [],
  selectedLanguage,
  onLanguageChange,
  languages = [],
  sortBy,
  onSortChange,
  onResetFilters,
  hasActiveFilters
}) {
  const statusOptions = [
    { value: 'All', label: 'All Movies' },
    { value: 'Want to Watch', label: 'Want to Watch' },
    { value: 'Currently Watching', label: 'Currently Watching' },
    { value: 'Watched', label: 'Watched' }
  ];

  return (
    <div className="filter-row">
      {/* Status Filter Pills */}
      <div className="status-filter-pills">
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`filter-pill ${statusFilter === opt.value ? 'active' : ''}`}
            onClick={() => onStatusChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Dropdown Filters & Sorting */}
      <div className="filter-dropdowns">
        {/* Genre Filter */}
        <div className="filter-select-wrapper">
          <select
            className="filter-select"
            value={selectedGenre}
            onChange={(e) => onGenreChange(e.target.value)}
            aria-label="Filter by genre"
          >
            <option value="All">All Genres</option>
            {genres.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          <ChevronDown className="select-arrow" size={14} />
        </div>

        {/* Language Filter */}
        <div className="filter-select-wrapper">
          <select
            className="filter-select"
            value={selectedLanguage}
            onChange={(e) => onLanguageChange(e.target.value)}
            aria-label="Filter by language"
          >
            <option value="All">All Languages</option>
            {languages.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          <ChevronDown className="select-arrow" size={14} />
        </div>

        {/* Sorting Dropdown */}
        <div className="filter-select-wrapper">
          <select
            className="filter-select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            aria-label="Sort movies"
          >
            <option value="recently_added">Recently Added</option>
            <option value="highest_rating">Highest Rating</option>
            <option value="release_year_desc">Release Year (Newest)</option>
            <option value="release_year_asc">Release Year (Oldest)</option>
            <option value="title_asc">Title (A-Z)</option>
          </select>
          <ChevronDown className="select-arrow" size={14} />
        </div>

        {/* Reset Filter Action */}
        {hasActiveFilters && (
          <button
            type="button"
            className="reset-filters-btn"
            onClick={onResetFilters}
            title="Reset all filters"
          >
            Reset Filters
          </button>
        )}
      </div>
    </div>
  );
}
