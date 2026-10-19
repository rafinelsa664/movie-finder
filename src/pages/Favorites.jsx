import { Link } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import { useFavorites } from "../context/favoritesContext";

function Favorites() {
  const { favorites } = useFavorites();

  return (
    <main className="app">
      <Link to="/" className="back-link">← Kembali</Link>
      <h1>Film Favorit</h1>

      {favorites.length === 0 ? (
        <p className="status">
          Belum ada film favorit. Klik ikon 🤍 pada sebuah film untuk
          menyimpannya.
        </p>
      ) : (
        <div className="movie-grid">
          {favorites.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </main>
  );
}

export default Favorites;