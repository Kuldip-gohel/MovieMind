import React from 'react';
import { Search, X } from 'lucide-react';

/**
 * SearchBar Component
 * Instant, dynamic search across movie titles, genres, and languages.
 */
export default function SearchBar({ searchTerm, onSearchChange, onClearSearch }) {
  return (
    <div className="search-bar-wrapper">
      <Search className="search-icon" size={18} />
      <input
        type="text"
        className="search-input"
        placeholder="Search by movie title, genre, or language..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        aria-label="Search movies"
      />
      {searchTerm && (
        <button
          className="search-clear-btn"
          onClick={onClearSearch}
          aria-label="Clear search"
          type="button"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
