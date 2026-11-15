import React, { useState, useEffect, useMemo } from 'react';
import IntroCurtain from './components/IntroCurtain';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import MovieForm from './components/MovieForm';
import MovieDetailsModal from './components/MovieDetailsModal';
import ConfirmationModal from './components/ConfirmationModal';
import Toast from './components/Toast';
import { loadMoviesFromStorage, saveMoviesToStorage } from './utils/storage';

export default function App() {
  // 1. Initialize movies from Local Storage
  const [movies, setMovies] = useState(() => loadMoviesFromStorage());

  // 2. Navigation State
  const [currentView, setCurrentView] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);

  // 3. Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [sortBy, setSortBy] = useState('recently_added');

  // 4. Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [detailsMovie, setDetailsMovie] = useState(null);
  const [deletingMovie, setDeletingMovie] = useState(null);

  // 5. Toast Notifications
  const [toasts, setToasts] = useState([]);

  // Automatically persist to Local Storage whenever movies state changes
  useEffect(() => {
    saveMoviesToStorage(movies);
  }, [movies]);

  // Sync detailsMovie if movies collection gets updated
  useEffect(() => {
    if (detailsMovie) {
      const updated = movies.find((m) => m.id === detailsMovie.id);
      if (updated) {
        setDetailsMovie(updated);
      } else {
        setDetailsMovie(null);
      }
    }
  }, [movies]);

  // Toast Helpers
  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Compute Statistics
  const counts = useMemo(() => {
    let watched = 0;
    let wantToWatch = 0;
    let currentlyWatching = 0;

    movies.forEach((m) => {
      if (m.status === 'Watched') watched++;
      else if (m.status === 'Currently Watching') currentlyWatching++;
      else if (m.status === 'Want to Watch') wantToWatch++;
    });

    return {
      total: movies.length,
      watched,
      wantToWatch,
      currentlyWatching
    };
  }, [movies]);

  // Navigation Handler
  const handleNavigateView = (viewId) => {
    setCurrentView(viewId);
    if (viewId === 'want_to_watch') {
      setStatusFilter('Want to Watch');
    } else if (viewId === 'currently_watching') {
      setStatusFilter('Currently Watching');
    } else if (viewId === 'watched') {
      setStatusFilter('Watched');
    } else if (viewId === 'discover' || viewId === 'dashboard') {
      setStatusFilter('All');
    }
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  // CRUD Operations
  const handleAddMovie = (movieData) => {
    const duplicate = movies.some((movie) => movie.title?.trim().toLowerCase() === movieData.title?.trim().toLowerCase());
    if (duplicate) {
      addToast(`\"${movieData.title}\" is already in your Movie Universe.`, 'info');
      return false;
    }

    const newMovie = {
      ...movieData,
      id: 'movie-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setMovies((prev) => [newMovie, ...prev]);
    addToast(`"${newMovie.title}" added to your Movie Universe!`, 'success');
    return true;
  };

  const handleUpdateMovie = (movieData) => {
    if (!editingMovie) return;

    setMovies((prev) =>
      prev.map((m) =>
        m.id === editingMovie.id
          ? {
              ...m,
              ...movieData,
              updatedAt: new Date().toISOString()
            }
          : m
      )
    );

    addToast(`"${movieData.title}" updated successfully!`, 'info');
    setEditingMovie(null);
  };

  const handleDeleteMovie = () => {
    if (!deletingMovie) return;

    const movieToDelete = deletingMovie;
    setMovies((prev) => prev.filter((m) => m.id !== movieToDelete.id));
    if (detailsMovie?.id === movieToDelete.id) {
      setDetailsMovie(null);
    }
    setDeletingMovie(null);
    addToast(`"${movieToDelete.title}" removed from your universe.`, 'delete');
  };

  const handleStatusChange = (movieId, newStatus) => {
    setMovies((prev) =>
      prev.map((m) => {
        if (m.id === movieId) {
          return {
            ...m,
            status: newStatus,
            updatedAt: new Date().toISOString()
          };
        }
        return m;
      })
    );
    addToast(`Status changed to "${newStatus}"!`, 'info');
  };

  const isFullLibraryView = currentView !== 'dashboard';

  return (
    <div className="app-container">
      <IntroCurtain />

      {/* Toast Notification Stack */}
      <Toast toasts={toasts} onDismiss={removeToast} />

      {/* Top navigation (drawer on tablet / mobile) */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigateView}
        counts={counts}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <main className="page" key={currentView}>
        <Dashboard
          movies={movies}
          counts={counts}
          currentView={currentView}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          selectedGenre={selectedGenre}
          setSelectedGenre={setSelectedGenre}
          selectedLanguage={selectedLanguage}
          setSelectedLanguage={setSelectedLanguage}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onAddMovie={handleAddMovie}
          onViewDetails={(movie) => setDetailsMovie(movie)}
          onEditMovie={(movie) => setEditingMovie(movie)}
          onDeleteMovie={(movie) => setDeletingMovie(movie)}
          onStatusChange={handleStatusChange}
          onNavigateView={handleNavigateView}
          isFullLibraryView={isFullLibraryView}
        />
      </main>

      {/* Add Movie Modal */}
      <MovieForm
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddMovie}
        initialMovie={null}
      />

      {/* Edit Movie Modal */}
      <MovieForm
        isOpen={Boolean(editingMovie)}
        onClose={() => setEditingMovie(null)}
        onSubmit={handleUpdateMovie}
        initialMovie={editingMovie}
      />

      {/* Movie Details Modal */}
      <MovieDetailsModal
        movie={detailsMovie}
        isOpen={Boolean(detailsMovie)}
        onClose={() => setDetailsMovie(null)}
        onEdit={(movie) => setEditingMovie(movie)}
        onDelete={(movie) => setDeletingMovie(movie)}
        onStatusChange={handleStatusChange}
      />

      {/* Delete Movie Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(deletingMovie)}
        title="Delete Movie"
        movieTitle={deletingMovie?.title}
        message={deletingMovie ? `Are you sure you want to remove "${deletingMovie.title}" from your universe? This action cannot be undone.` : ''}
        confirmText="Delete Movie"
        cancelText="Keep Movie"
        onConfirm={handleDeleteMovie}
        onClose={() => setDeletingMovie(null)}
      />
    </div>
  );
}
