/**
 * Local Storage Utility for MovieMind
 * Handles all persistent storage operations, schema validation, and fallback sample data.
 */

export const STORAGE_KEY = 'moviemind_movies_v1';

export const SAMPLE_MOVIES = [
  {
    id: 'sample-1',
    title: 'Dune: Part Two',
    genre: 'Sci-Fi',
    releaseYear: 2024,
    language: 'English',
    rating: 8.8,
    status: 'Watched',
    description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family, facing a choice between love and the fate of the universe.',
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
  },
  {
    id: 'sample-2',
    title: 'Interstellar',
    genre: 'Sci-Fi',
    releaseYear: 2014,
    language: 'English',
    rating: 8.7,
    status: 'Want to Watch',
    description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
    posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString()
  },
  {
    id: 'sample-3',
    title: 'Spider-Man: Across the Spider-Verse',
    genre: 'Animation',
    releaseYear: 2023,
    language: 'English',
    rating: 8.7,
    status: 'Currently Watching',
    description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. When the heroes clash, Miles must redefine what it means to be a hero.',
    posterUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
  },
  {
    id: 'sample-4',
    title: 'Oppenheimer',
    genre: 'Drama',
    releaseYear: 2023,
    language: 'English',
    rating: 8.9,
    status: 'Watched',
    description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
    posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString()
  },
  {
    id: 'sample-5',
    title: 'Parasite',
    genre: 'Thriller',
    releaseYear: 2019,
    language: 'Korean',
    rating: 8.5,
    status: 'Watched',
    description: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
    posterUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString()
  },
  {
    id: 'sample-6',
    title: 'The Dark Knight',
    genre: 'Action',
    releaseYear: 2008,
    language: 'English',
    rating: 9.0,
    status: 'Want to Watch',
    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
  },
  {
    id: 'sample-7',
    title: 'Spirited Away',
    genre: 'Animation',
    releaseYear: 2001,
    language: 'Japanese',
    rating: 8.6,
    status: 'Currently Watching',
    description: 'During her family\'s move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts.',
    posterUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString()
  },
  {
    id: 'sample-8',
    title: 'Inception',
    genre: 'Sci-Fi',
    releaseYear: 2010,
    language: 'English',
    rating: 8.8,
    status: 'Watched',
    description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project.',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString()
  }
];

/**
 * Load movies from Local Storage safely.
 * Returns sample movies if no stored data exists or if parsing fails.
 */
export function loadMoviesFromStorage() {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (!rawData) {
      // First visit: seed initial sample movies
      saveMoviesToStorage(SAMPLE_MOVIES);
      return SAMPLE_MOVIES;
    }

    const parsed = JSON.parse(rawData);
    if (Array.isArray(parsed) && parsed.length >= 0) {
      return parsed;
    }
    // If not array, fallback to sample movies
    return SAMPLE_MOVIES;
  } catch (error) {
    console.error('Failed to load movies from localStorage:', error);
    return SAMPLE_MOVIES;
  }
}

/**
 * Save movies to Local Storage.
 */
export function saveMoviesToStorage(movies) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(movies));
    return true;
  } catch (error) {
    console.error('Failed to save movies to localStorage:', error);
    return false;
  }
}

/**
 * Reset local storage back to the initial sample collection.
 */
export function resetToSampleCollection() {
  saveMoviesToStorage(SAMPLE_MOVIES);
  return SAMPLE_MOVIES;
}

/**
 * Clear all movies from local storage.
 */
export function clearAllMoviesFromStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
    return [];
  }
}

/* ==========================================================================
   Search History Local Storage API (From Lab Exercise 3/4)
   ========================================================================== */

export const SEARCH_HISTORY_KEY = 'moviemind_search_history';

/**
 * Load previous search requests from localStorage.
 */
export function loadSearchHistory() {
  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load search history:', e);
    return [];
  }
}

/**
 * Save a new search request into localStorage (keeps top 5 latest unique).
 */
export function saveSearchHistoryRequest(request) {
  if (!request || !request.trim()) return [];
  try {
    let history = loadSearchHistory();
    // Remove duplicate requests case-insensitively
    history = history.filter((item) => item.toLowerCase() !== request.trim().toLowerCase());
    // Prepend new request
    history.unshift(request.trim());
    // Keep only latest 5 searches
    history = history.slice(0, 5);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
    return history;
  } catch (e) {
    console.error('Failed to save search history:', e);
    return [];
  }
}

/**
 * Clear search history.
 */
export function clearSearchHistoryStorage() {
  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
    return [];
  } catch (e) {
    console.error('Failed to clear search history:', e);
    return [];
  }
}
