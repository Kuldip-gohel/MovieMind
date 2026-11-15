import React, { useState } from 'react';
import { ArrowUpRight, Check, Clapperboard, LoaderCircle, Plus, Sparkles, Star, WandSparkles } from 'lucide-react';
import './MovieDiscovery.css';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');
const EXAMPLES = [
  'A mind-bending sci-fi film with space, emotion and a powerful ending',
  'A clever psychological thriller with unexpected twists',
  'An inspiring movie about ambition, courage and real-life struggles'
];

function MovieResultCard({ movie, primary = false, onAdd }) {
  const [added, setAdded] = useState(false);
  const year = movie.release_year || (movie.release_date ? movie.release_date.slice(0, 4) : '');
  const genres = (movie.genres || []).slice(0, 2).join(' · ');

  const handleAdd = () => {
    if (added) return;
    const languageNames = { en: 'English', hi: 'Hindi', ja: 'Japanese', ko: 'Korean', fr: 'French', es: 'Spanish', de: 'German', it: 'Italian', zh: 'Mandarin' };
    const success = onAdd({
      title: movie.title,
      genre: genres.split(' · ')[0] || 'Drama',
      releaseYear: Number(year) || new Date().getFullYear(),
      language: languageNames[movie.language] || 'English',
      rating: Number(movie.rating) || 8,
      status: 'Want to Watch',
      description: movie.overview || movie.reason || '',
      posterUrl: movie.poster_url || '',
      tmdbId: movie.movie_id
    });
    if (success !== false) setAdded(true);
  };

  return (
    <article className={`discovery-result ${primary ? 'is-primary' : ''}`}>
      <div className="discovery-poster-wrap">
        {movie.poster_url ? (
          <img className="discovery-poster" src={movie.poster_url} alt={`${movie.title} poster`} loading="lazy" />
        ) : (
          <div className="discovery-poster-fallback"><Clapperboard size={30} /><span>{movie.title}</span></div>
        )}
        {primary && <span className="discovery-pick-label"><Sparkles size={12} /> AI PICK</span>}
      </div>
      <div className="discovery-result-copy">
        <div className="discovery-result-meta">
          {year && <span>{year}</span>}
          {movie.rating ? <span><Star size={12} fill="currentColor" /> {Number(movie.rating).toFixed(1)}</span> : null}
          {movie.similarity_score != null && <span>{Math.round(movie.similarity_score * 100)}% match</span>}
        </div>
        <h3>{movie.title}</h3>
        {genres && <p className="discovery-genres">{genres}</p>}
        <p className="discovery-overview">{primary ? (movie.reason || movie.overview) : (movie.overview || 'A title selected by your content-based recommendation model.')}</p>
        <button type="button" className={`discovery-add ${added ? 'added' : ''}`} onClick={handleAdd} disabled={added}>
          {added ? <><Check size={15} /> Added to watchlist</> : <><Plus size={15} /> Add to watchlist</>}
        </button>
      </div>
    </article>
  );
}

export default function MovieDiscovery({ onAddMovie }) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const submit = async (event) => {
    event.preventDefault();
    if (prompt.trim().length < 5) {
      setError('Tell us a little more about the movie you want to watch.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const response = await fetch(`${API_BASE}/api/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || 'Movie discovery could not be completed. Please try again.');
      setResult(data);
    } catch (err) {
      setError(err.message || 'Unable to connect to MovieMind. Make sure the Python backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="movie-discovery" id="ai-discovery">
      <div className="discovery-orbit discovery-orbit-one" aria-hidden="true" />
      <div className="discovery-orbit discovery-orbit-two" aria-hidden="true" />
      <div className="discovery-heading">
        <span className="eyebrow"><WandSparkles size={13} /> INTELLIGENT MOVIE DISCOVERY</span>
        <h2 className="display-md">What story are you <em>in the mood for?</em></h2>
        <p>Describe your mood, interests, or the kind of movie you want. Let MovieMind find your next favourite story.</p>
      </div>

      <form className="discovery-search" onSubmit={submit}>
        <Sparkles className="discovery-input-icon" size={19} />
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="I want a gripping mystery with clever twists, memorable characters and a surprising ending..."
          rows={2}
          maxLength={1000}
          aria-label="Describe the movie you want"
        />
        <button type="submit" className="discovery-submit" disabled={loading}>
          {loading ? <LoaderCircle className="spin" size={18} /> : <ArrowUpRight size={19} />}
          <span>{loading ? 'Exploring...' : 'Find my movie'}</span>
        </button>
      </form>
      <div className="discovery-examples">
        <span>TRY:</span>
        {EXAMPLES.map((example) => (
          <button type="button" key={example} onClick={() => setPrompt(example)}>{example}</button>
        ))}
      </div>

      {loading && (
        <div className="discovery-loading" role="status">
          <div className="loading-rings"><span /><span /><span /></div>
          <div><strong>Exploring your cinematic universe</strong><p>Understanding your taste and searching for the perfect story...</p></div>
        </div>
      )}
      {error && <div className="discovery-error" role="alert">{error}</div>}

      {result && (
        <div className="discovery-results" aria-live="polite">
          <div className="discovery-results-head">
            <div><span className="eyebrow">YOUR NEXT MOVIE</span><h3>One story to start with.</h3></div>
            <span className="discovery-method">{result.selection_mode === 'local' ? 'Local search' : 'Gemini AI'} <span>×</span> Cosine Similarity</span>
          </div>
          {result.interpretation && <p className="discovery-interpretation">{result.interpretation}</p>}
          {result.primary_movie && <MovieResultCard movie={result.primary_movie} primary onAdd={onAddMovie} />}
          <div className="similar-heading">
            <div><span className="eyebrow">THE SIMILARITY ENGINE</span><h3>Because you might love these too.</h3></div>
            <span>TOP {result.similar_movies?.length || 0} MATCHES</span>
          </div>
          <div className="similar-results-grid">
            {(result.similar_movies || []).map((movie) => <MovieResultCard key={movie.movie_id} movie={movie} onAdd={onAddMovie} />)}
          </div>
          <p className="discovery-footnote">One movie selected by {result.selection_mode === 'local' ? 'the local semantic matcher' : 'Gemini'}. Similar titles ranked by your original CountVectorizer + Cosine Similarity model.</p>
        </div>
      )}
    </section>
  );
}
