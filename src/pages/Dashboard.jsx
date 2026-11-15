import React, { useMemo } from 'react';
import { Film, Bookmark, PlayCircle, CheckCircle2, Plus, Clock, Compass } from 'lucide-react';
import StatisticsCard from '../components/StatisticsCard';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import MovieCard from '../components/MovieCard';
import MovieCarousel from '../components/MovieCarousel';
import CinematicHero from '../components/CinematicHero';
import TrailerReel from '../components/TrailerReel';
import FeaturedWatching from '../components/FeaturedWatching';
import Reveal from '../components/Reveal';
import MovieDiscovery from '../components/MovieDiscovery';

const LIBRARY_COPY = {
  discover: {
    eyebrow: 'Discover',
    title: 'All Movies',
    text: 'Every title in your universe. Search, filter and sort to find exactly what you are in the mood for.'
  },
  want_to_watch: {
    eyebrow: 'Up next',
    title: 'My Watchlist',
    text: 'Stories waiting for the right night. Pick one and press play.'
  },
  currently_watching: {
    eyebrow: 'Now playing',
    title: 'Currently Watching',
    text: 'The films you are in the middle of, right where you left them.'
  },
  watched: {
    eyebrow: 'The archive',
    title: 'Watched Movies',
    text: 'Your personal archive of finished journeys, one poster per memory.'
  }
};

/**
 * Dashboard / library page.
 * Dashboard view: cinematic hero → command centre (stats) → trailer reel →
 * recently added carousel → collection.
 * Other views reuse the same collection with a themed header.
 * All data, filtering and sorting logic is unchanged.
 */
export default function Dashboard({
  movies,
  counts,
  currentView,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  selectedGenre,
  setSelectedGenre,
  selectedLanguage,
  setSelectedLanguage,
  sortBy,
  setSortBy,
  onOpenAddModal,
  onAddMovie,
  onViewDetails,
  onEditMovie,
  onDeleteMovie,
  onStatusChange,
  onNavigateView,
  isFullLibraryView = false
}) {
  // Extract unique genres and languages dynamically from collection
  const availableGenres = useMemo(() => {
    const set = new Set();
    movies.forEach((m) => m.genre && set.add(m.genre));
    return Array.from(set).sort();
  }, [movies]);

  const availableLanguages = useMemo(() => {
    const set = new Set();
    movies.forEach((m) => m.language && set.add(m.language));
    return Array.from(set).sort();
  }, [movies]);

  // Recently added (latest 10)
  const recentlyAdded = useMemo(
    () => [...movies].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 10),
    [movies]
  );

  // Filter and sort
  const filteredAndSortedMovies = useMemo(() => {
    let result = [...movies];

    if (statusFilter !== 'All') result = result.filter((m) => m.status === statusFilter);
    if (selectedGenre !== 'All') result = result.filter((m) => m.genre === selectedGenre);
    if (selectedLanguage !== 'All') result = result.filter((m) => m.language === selectedLanguage);

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.genre.toLowerCase().includes(q) ||
          (m.language && m.language.toLowerCase().includes(q))
      );
    }

    switch (sortBy) {
      case 'highest_rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'release_year_desc':
        result.sort((a, b) => (b.releaseYear || 0) - (a.releaseYear || 0));
        break;
      case 'release_year_asc':
        result.sort((a, b) => (a.releaseYear || 0) - (b.releaseYear || 0));
        break;
      case 'title_asc':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'recently_added':
      default:
        result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
    }
    return result;
  }, [movies, statusFilter, selectedGenre, selectedLanguage, searchTerm, sortBy]);

  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    statusFilter !== 'All' ||
    selectedGenre !== 'All' ||
    selectedLanguage !== 'All' ||
    sortBy !== 'recently_added';

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setSelectedGenre('All');
    setSelectedLanguage('All');
    setSortBy('recently_added');
  };

  const scrollToId = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // "Currently Watching" gets a featured now-playing panel for the first match.
  const isWatchingView = currentView === 'currently_watching' && statusFilter === 'Currently Watching';
  const featured = isWatchingView ? filteredAndSortedMovies[0] : null;
  const gridMovies = featured ? filteredAndSortedMovies.slice(1) : filteredAndSortedMovies;

  const copy = LIBRARY_COPY[currentView];
  const gridClass = `movies-grid ${currentView === 'watched' ? 'archive' : ''}`;

  const collectionTitle = isFullLibraryView
    ? hasActiveFilters ? 'Search & Filter Results' : copy?.title
    : hasActiveFilters ? 'Search & Filter Results' : 'Movie Collection';

  return (
    <div className="content-area">
      {/* ---------- Dashboard: hero ---------- */}
      {!isFullLibraryView && <CinematicHero movies={movies} onExplore={() => scrollToId('ai-discovery')} />}

      {/* ---------- Library header (other sections) ---------- */}
      {isFullLibraryView && copy && (
        <header className={`library-header lib-${currentView}`}>
          <span className="library-glow" aria-hidden="true" />
          <span className="eyebrow">{copy.eyebrow}</span>
          <h1 className="display-lg">{copy.title}</h1>
          <p>{copy.text}</p>
          <div className="library-meta">
            <span><strong>{filteredAndSortedMovies.length}</strong>{filteredAndSortedMovies.length === 1 ? 'movie' : 'movies'} shown</span>
            <span><strong>{counts.total}</strong>in your universe</span>
          </div>
        </header>
      )}

      {/* ---------- AI-powered natural-language movie discovery ---------- */}
      {!isFullLibraryView && <MovieDiscovery onAddMovie={onAddMovie} />}

      {/* ---------- Dashboard: command centre ---------- */}
      {!isFullLibraryView && (
        <section className="command" id="command" aria-label="Universe statistics">
          <Reveal className="command-head">
            <span className="eyebrow">Command centre</span>
            <h2 className="display-md">Welcome to Your Movie Universe</h2>
            <p>Your personal collection of stories, adventures, and unforgettable experiences.</p>
          </Reveal>
          <Reveal className="statistics-grid" delay={120}>
            <StatisticsCard title="Total Movies" count={counts.total} type="total" icon={Film} subtext="In your personal universe" onClick={() => onNavigateView('discover')} />
            <StatisticsCard title="Watched Movies" count={counts.watched} type="watched" icon={CheckCircle2} subtext="Completed journeys" onClick={() => onNavigateView('watched')} />
            <StatisticsCard title="Want to Watch" count={counts.wantToWatch} type="want" icon={Bookmark} subtext="Saved for later" onClick={() => onNavigateView('want_to_watch')} />
            <StatisticsCard title="Currently Watching" count={counts.currentlyWatching} type="watching" icon={PlayCircle} subtext="Playing right now" onClick={() => onNavigateView('currently_watching')} />
          </Reveal>
        </section>
      )}

      {/* ---------- Dashboard: trailer reel (video, fullscreen & geolocation lab features) ---------- */}
      {!isFullLibraryView && (
        <Reveal as="section">
          <TrailerReel />
        </Reveal>
      )}

      {/* ---------- Dashboard: recently added carousel ---------- */}
      {!isFullLibraryView && recentlyAdded.length > 0 && (
        <section aria-label="Recently added">
          <Reveal className="section-header">
            <div>
              <span className="eyebrow">Fresh picks</span>
              <h2 className="display-md">Recently Added</h2>
            </div>
            <span className="section-count-badge"><Clock size={13} />Drag or scroll</span>
          </Reveal>
          <MovieCarousel movies={recentlyAdded} onViewDetails={onViewDetails} onEdit={onEditMovie} onDelete={onDeleteMovie} />
        </section>
      )}

      {/* ---------- Currently watching: featured panel ---------- */}
      {featured && (
        <section aria-label="Now playing">
          <FeaturedWatching
            movie={featured}
            onViewDetails={onViewDetails}
            onEdit={onEditMovie}
            onDelete={onDeleteMovie}
            onStatusChange={onStatusChange}
          />
        </section>
      )}

      {/* ---------- Collection: search, filters, grid ---------- */}
      <section className="collection" id="collection" aria-label="Movie collection">
        {!isFullLibraryView && (
          <Reveal className="section-header">
            <div>
              <span className="eyebrow">Your library</span>
              <h2 className="display-md">{collectionTitle}</h2>
            </div>
            <span className="section-count-badge">
              {filteredAndSortedMovies.length} {filteredAndSortedMovies.length === 1 ? 'Movie' : 'Movies'}
            </span>
          </Reveal>
        )}

        <div className="controls-container">
          <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} onClearSearch={() => setSearchTerm('')} />
          <FilterBar
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            selectedGenre={selectedGenre}
            onGenreChange={setSelectedGenre}
            genres={availableGenres}
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
            languages={availableLanguages}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onResetFilters={handleResetFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </div>

        {filteredAndSortedMovies.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Compass size={30} /></div>
            <h3>Nothing on screen yet</h3>
            <p>
              {hasActiveFilters
                ? 'No titles match your current search or filters. Try another keyword or reset the filters.'
                : 'Your universe is waiting for its first stars. Add a movie to begin your collection.'}
            </p>
            {hasActiveFilters ? (
              <button type="button" className="btn-ghost" onClick={handleResetFilters}>Clear all filters</button>
            ) : (
              <button type="button" className="btn-glow small" onClick={onOpenAddModal}>
                <Plus size={16} /> Add your first movie
              </button>
            )}
          </div>
        ) : (
          gridMovies.length > 0 && (
            <div className={gridClass}>
              {gridMovies.map((movie, i) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  index={i}
                  onViewDetails={onViewDetails}
                  onEdit={onEditMovie}
                  onDelete={onDeleteMovie}
                />
              ))}
            </div>
          )
        )}
      </section>

      <footer className="site-footer">
        <span>MovieMind</span>
        <span>Beyond the Screen &middot; Every story has its own universe.</span>
      </footer>
    </div>
  );
}
