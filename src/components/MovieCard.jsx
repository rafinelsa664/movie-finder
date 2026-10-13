import { Link } from "react-router-dom";
import { useFavorites } from "../context/favoritesContext";

const IMG_URL = "https://image.tmdb.org/t/p/w500";

function MovieCard({ movie }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(movie.id);

  return (
    <div className="movie-card-wrapper">
      <Link className="movie-card" to={`/movie/${movie.id}`}>
        {movie.poster_path ? (
          <img src={`${IMG_URL}${movie.poster_path}`} alt={movie.title} />
        ) : (
          <div className="no-poster">Tidak ada poster</div>
        )}
        <div className="movie-info">
          <h3>{movie.title}</h3>
          <p>⭐ {movie.vote_average.toFixed(1)}</p>
        </div>
      </Link>

      <button
        className="fav-btn"
        onClick={() => toggleFavorite(movie)}
        aria-pressed={favorite}
        aria-label={
          favorite
            ? `Hapus ${movie.title} dari favorit`
            : `Tambahkan ${movie.title} ke favorit`
        }
      >
        {favorite ? "❤️" : "🤍"}
      </button>
    </div>
  );
}

export default MovieCard;