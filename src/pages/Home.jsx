import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import { useFavorites } from "../context/favoritesContext";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

function SkeletonGrid() {
  return (
    <div className="movie-grid" aria-hidden="true">
      {Array.from({ length: 12 }, (_, i) => (
        <div className="skeleton-card" key={i}>
          <div className="skeleton-poster" />
          <div className="skeleton-line" />
          <div className="skeleton-line short" />
        </div>
      ))}
    </div>
  );
}

function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";
  const genre = searchParams.get("genre") ?? "";

  const [query, setQuery] = useState(urlQuery);
  const [genres, setGenres] = useState([]);
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { favorites } = useFavorites();

  // Debounce: 500 ms setelah user berhenti mengetik, simpan kata kunci ke URL
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = query.trim();
      if (trimmed === urlQuery) return;
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (trimmed) next.set("q", trimmed);
          else next.delete("q");
          return next;
        },
        { replace: true }
      );
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [query, urlQuery, setSearchParams]);

  // Ambil daftar genre sekali
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
        if (urlQuery) {
          url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(urlQuery)}&page=${page}`;
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

        setTotalPages(Math.min(data.total_pages, 500));
        setMovies((prev) =>
          page === 1
            ? data.results
            : [
                ...prev,
                ...data.results.filter((m) => !prev.some((p) => p.id === m.id)),
              ]
        );
      } catch (err) {
        if (!ignore) {
          setError(err.message);
          if (page === 1) setMovies([]);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchMovies();
    return () => {
      ignore = true;
    };
  }, [urlQuery, genre, page]);

  function handleGenreChange(e) {
    const value = e.target.value;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set("genre", value);
        else next.delete("genre");
        return next;
      },
      { replace: true }
    );
    setPage(1);
  }

  const isSearching = query.trim() !== "";
  const showSkeleton = loading && movies.length === 0;

  return (
    <main className="app">
      <h1>Movie Finder</h1>

      <nav className="top-nav">
        <Link to="/favorites">❤️ Favorit ({favorites.length})</Link>
      </nav>

      <div className="controls" role="search">
        <input
          type="search"
          className="search-input"
          placeholder="Cari film..."
          aria-label="Cari film"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="genre-select"
          aria-label="Filter genre"
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

      {error && (
        <p className="status error" role="alert">
          {error}
        </p>
      )}

      {showSkeleton && <SkeletonGrid />}

      {!loading && !error && movies.length === 0 && (
        <p className="status" role="status">
          {urlQuery
            ? `Film "${urlQuery}" tidak ditemukan.`
            : "Tidak ada film ditemukan."}
        </p>
      )}

      {movies.length > 0 && (
        <div
          className={`movie-grid${loading ? " is-loading" : ""}`}
          aria-busy={loading}
        >
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
    </main>
  );
}

export default Home;