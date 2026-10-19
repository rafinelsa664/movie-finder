import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useFavorites } from "../context/favoritesContext";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w500";
const PROFILE_URL = "https://image.tmdb.org/t/p/w185";

function formatRuntime(minutes) {
  if (!minutes) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h} j ${m} m` : `${m} m`;
}

function MovieDetail() {
  const { id } = useParams();
  const location = useLocation();
  const backTo = location.state?.from ?? "/";
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    let ignore = false;
    window.scrollTo(0, 0);

    async function fetchMovie() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=id-ID&append_to_response=credits,videos&include_video_language=id,en,null`
        );
        if (!res.ok) {
          throw new Error(
            res.status === 404
              ? "Film tidak ditemukan."
              : `Gagal memuat data (status ${res.status})`
          );
        }
        const data = await res.json();
        if (!ignore) setMovie(data);
      } catch (err) {
        if (!ignore) setError(err.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchMovie();
    return () => {
      ignore = true;
    };
  }, [id]);

  if (loading) return <p className="status" role="status">Memuat detail film...</p>;

  if (error) {
    return (
      <div className="app">
        <p className="status error">{error}</p>
        <p className="status">
          <Link to={backTo} className="back-link">← Kembali ke daftar film</Link>
        </p>
      </div>
    );
  }

  const trailer = movie.videos?.results.find(
    (v) => v.site === "YouTube" && v.type === "Trailer"
  );
  const cast = movie.credits?.cast.slice(0, 8) ?? [];
  const year = movie.release_date?.slice(0, 4);
  const runtime = formatRuntime(movie.runtime);

  return (
    <div className="app">
      <Link to={backTo} className="back-link">← Kembali</Link>

      <div className="detail">
        {movie.poster_path ? (
          <img
            className="detail-poster"
            src={`${IMG_URL}${movie.poster_path}`}
            alt={movie.title}
          />
        ) : (
          <div className="no-poster detail-poster">Tidak ada poster</div>
        )}

        <div className="detail-info">
          <h2>
            {movie.title} {year && <span>({year})</span>}
          </h2>
          {movie.tagline && <p className="tagline">{movie.tagline}</p>}

          <div className="meta">
            <span>⭐ {movie.vote_average.toFixed(1)}</span>
            {runtime && <span>{runtime}</span>}
          </div>

          <div className="genre-tags">
            {movie.genres.map((g) => (
              <span key={g.id}>{g.name}</span>
            ))}
          </div>
          <button 
            className="fav-detail-btn"
            onClick={() => toggleFavorite(movie)}
          >
            {isFavorite(movie.id) ? "❤️ Hapus dari favorit" : "🤍 Tambah ke favorit"}
          </button>

          <h3>Sinopsis</h3>
          <p className="overview">
            {movie.overview || "Sinopsis belum tersedia dalam bahasa Indonesia."}
          </p>

          {cast.length > 0 && (
            <>
              <h3>Pemeran</h3>
              <div className="cast-grid">
                {cast.map((person) => (
                  <div className="cast-card" key={person.id}>
                    {person.profile_path ? (
                      <img
                        src={`${PROFILE_URL}${person.profile_path}`}
                        alt={person.name}
                      />
                    ) : (
                      <div className="no-photo" />
                    )}
                    <p>{person.name}</p>
                    <p className="character">{person.character}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {trailer && (
            <>
              <h3>Trailer</h3>
              <div className="trailer">
                <iframe
                  src={`https://www.youtube.com/embed/${trailer.key}`}
                  title={`Trailer ${movie.title}`}
                  allowFullScreen
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default MovieDetail;