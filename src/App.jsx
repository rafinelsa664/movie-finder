import { useEffect, useState } from "react";
import "./App.css";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const IMG_URL = "https://image.tmdb.org/t/p/w500";

function App() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchMovies() {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`
        );
        if (!res.ok) {
          throw new Error(`Gagal memuat data (status ${res.status})`);
        }
        const data = await res.json();
        setMovies(data.results);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchMovies();
  }, []);

  if (loading) return <p className="status">Memuat film...</p>;
  if (error) return <p className="status error">{error}</p>;

  return (
    <div className="app">
      <h1>Movie Finder</h1>
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
    </div>
  );
}

export default App;