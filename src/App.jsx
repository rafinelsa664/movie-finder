import { useEffect, useState } from "react";
import "./App.css";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w500";

function App() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debounce: tunggu 500 ms setelah user berhenti mengetik
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 500);
    return () => clearTimeout(timer);
  }, [query]);

  // Ambil data setiap kali kata kunci (yang sudah di-debounce) berubah
  useEffect(() => {
    let ignore = false;

    async function fetchMovies() {
      setLoading(true);
      setError(null);
      try {
        const url = debouncedQuery
          ? `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(debouncedQuery)}`
          : `${BASE_URL}/movie/popular?api_key=${API_KEY}`;

        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Gagal memuat data (status ${res.status})`);
        }
        const data = await res.json();
        if (!ignore) setMovies(data.results);
      } catch (err) {
        if (!ignore) setError(err.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchMovies();
    return () => {
      ignore = true;
    };
  }, [debouncedQuery]);

  return (
    <div className="app">
      <h1>Movie Finder</h1>

      <input
        type="text"
        className="search-input"
        placeholder="Cari film..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {loading && <p className="status">Memuat film...</p>}
      {error && <p className="status error">{error}</p>}
      {!loading && !error && movies.length === 0 && (
        <p className="status">Film "{debouncedQuery}" tidak ditemukan.</p>
      )}

      {!loading && !error && movies.length > 0 && (
        <div className="movie-grid">
          {movies.map((movie) => (
            <div className="movie-card" key={movie.id}>
              {movie.poster_path ? (
                <img src={`${IMG_URL}${movie.poster_path}`} alt={movie.title} />
              ) : (
                <div className="no-poster">Tidak ada poster</div>
              )}
              <div className="movie-info">
                <h3>{movie.title}</h3>
                <p>⭐ {movie.vote_average.toFixed(1)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;