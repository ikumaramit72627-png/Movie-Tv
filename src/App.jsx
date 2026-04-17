import { useEffect, useState } from 'react';
import './App.css';

const API_KEY = '9c6adc36';
const OMDB_BASE_URL = 'https://www.omdbapi.com/';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [movieDetails, setMovieDetails] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    setSelectedMovie(null);
    setMovieDetails(null);
    const nextQuery = searchTerm.trim();

    if (!nextQuery) {
      setQuery('');
      setMovies([]);
      setErrorMessage('');
      setIsLoading(false);
      return;
    }

    setErrorMessage('');
    setIsLoading(true);
    setQuery(nextQuery);
  };

  const handleSelectMovie = (movie) => {
    setErrorMessage('');
    setIsLoading(true);
    setSelectedMovie(movie);
  };

  useEffect(() => {
    if (!query) {
      return;
    }

    const controller = new AbortController();

    fetch(`${OMDB_BASE_URL}?s=${encodeURIComponent(query)}&apikey=${API_KEY}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.Response === 'True' && data.Search) {
          setMovies(data.Search);
          return;
        }

        setMovies([]);
        setErrorMessage(data.Error || 'No movies found.');
      })
      .catch((err) => {
        if (err.name === 'AbortError') {
          return;
        }

        console.error('Fetch error:', err);
        setMovies([]);
        setErrorMessage('Unable to load movies right now.');
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [query]);

  useEffect(() => {
    if (!selectedMovie) {
      return;
    }

    const controller = new AbortController();

    fetch(`${OMDB_BASE_URL}?i=${selectedMovie.imdbID}&apikey=${API_KEY}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.Response === 'True') {
          setMovieDetails(data);
          return;
        }

        setMovieDetails(null);
        setErrorMessage(data.Error || 'Unable to load movie details.');
      })
      .catch((err) => {
        if (err.name === 'AbortError') {
          return;
        }

        console.error('Fetch error:', err);
        setMovieDetails(null);
        setErrorMessage('Unable to load movie details right now.');
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [selectedMovie]);

  return (
    <div className="app">
      <header>
        <h1>Movie / TV Show Browser</h1>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for movies or TV shows..."
            className="search-input"
          />
          <button type="submit" className="search-button">Search</button>
        </form>
      </header>
      <main>
        {errorMessage ? <p className="no-results">{errorMessage}</p> : null}
        {isLoading ? <p className="no-results">Loading...</p> : null}
        {movieDetails ? (
          <div className="details">
            <button onClick={() => setSelectedMovie(null)} className="back-button">Back to Search</button>
            <div className="details-content">
              <img src={movieDetails.Poster !== 'N/A' ? movieDetails.Poster : '/placeholder.svg'} alt={movieDetails.Title} />
              <div className="info">
                <h2>{movieDetails.Title}</h2>
                <p><strong>Year:</strong> {movieDetails.Year}</p>
                <p><strong>Genre:</strong> {movieDetails.Genre}</p>
                <p><strong>Director:</strong> {movieDetails.Director}</p>
                <p><strong>Actors:</strong> {movieDetails.Actors}</p>
                <p><strong>Plot:</strong> {movieDetails.Plot}</p>
                <p><strong>IMDB Rating:</strong> {movieDetails.imdbRating}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="movies-grid">
            {movies.length > 0 ? (
              movies.map(movie => (
                <div key={movie.imdbID} className="card" onClick={() => handleSelectMovie(movie)}>
                  <img src={movie.Poster !== 'N/A' ? movie.Poster : '/placeholder.svg'} alt={movie.Title} />
                  <h3>{movie.Title}</h3>
                  <p>{movie.Year}</p>
                </div>
              ))
            ) : query && !isLoading && !errorMessage ? (
              <p className="no-results">No movies found. Try a different search.</p>
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
