import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import { useFavorites } from "../context/favoritesContext";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

function Home() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [genres, setGenres] = useState([]);
  const [genre, setGenre] = useState("");
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { favorites } = useFavorites();

  // Debounce kata kunci; hasil pencarian baru selalu mulai dari halaman 1
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  // Ambil daftar genre sekali saat halaman dibuka
  useEffect(() => {
    async function fetchGenres() {
      try {
        const res = await fetch(
          `${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=id-ID`
        );
        if (!res.ok) return;
        const data = await res.json();
        setGenres(data.genres);
      } catch (err) {
        console.error("Gagal memuat genre:", err);
      }
    }
    fetchGenres();
  }, []);

  // Ambil film setiap kali kata kunci, genre, atau halaman berubah
  useEffect(() => {
    let ignore = false;

    async function fetchMovies() {
      setLoading(true);
      setError(null);
      try {
        let url;
        if (debouncedQuery) {
          url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(debouncedQuery)}&page=${page}`;
        } else if (genre) {
          url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genre}&sort_by=popularity.desc&page=${page}`;
        } else {
          url = `${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`;
        }

        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Gagal memuat data (status ${res.status})`);
        }
        const data = await res.json();
        if (ignore) return;

        setTotalPages(Math.min(data.total_pages, 500)); // TMDB maksimal 500 halaman
        setMovies((prev) =>
          page === 1
            ? data.results
            : [
                ...prev,
                ...data.results.filter((m) => !prev.some((p) => p.id === m.id)),
              ]
        );
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
  }, [debouncedQuery, genre, page]);

  function handleGenreChange(e) {
    setGenre(e.target.value);
    setPage(1);
  }

  const isSearching = query.trim() !== "";

  return (
    <div className="app">
      <h1>Movie Finder</h1>
      <nav className="top-nav">
        <Link to="/favorites">❤️ Favorit ({favorites.length})</Link>
      </nav>

      <div className="controls">
        <input
          type="text"
          className="search-input"
          placeholder="Cari film..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="genre-select"
          value={genre}
          onChange={handleGenreChange}
          disabled={isSearching}
          title={isSearching ? "Filter genre tidak tersedia saat mencari" : ""}
        >
          <option value="">Semua genre</option>
          {genres.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      {loading && movies.length === 0 && (
        <p className="status">Memuat film...</p>
      )}
      {error && <p className="status error">{error}</p>}
      {!loading && !error && movies.length === 0 && (
        <p className="status">
          {debouncedQuery
            ? `Film "${debouncedQuery}" tidak ditemukan.`
            : "Tidak ada film ditemukan."}
        </p>
      )}

      {movies.length > 0 && (
        <div className="movie-grid">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}

      {movies.length > 0 && page < totalPages && !error && (
        <button
          className="load-more"
          onClick={() => setPage((p) => p + 1)}
          disabled={loading}
        >
          {loading ? "Memuat..." : "Muat lebih banyak"}
        </button>
      )}
    </div>
  );
}

export default Home;