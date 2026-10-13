import { useEffect, useState } from "react";
import { FavoritesContext } from "./favoritesContext";

const STORAGE_KEY = "movie-finder-favorites";

function loadFavorites() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(loadFavorites);

  // Simpan ke localStorage setiap kali daftar favorit berubah
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch (err) {
      console.error("Gagal menyimpan favorit:", err);
    }
  }, [favorites]);

  function isFavorite(id) {
    return favorites.some((m) => m.id === id);
  }

  function toggleFavorite(movie) {
    setFavorites((prev) =>
      prev.some((m) => m.id === movie.id)
        ? prev.filter((m) => m.id !== movie.id)
        : [
            ...prev,
            {
              id: movie.id,
              title: movie.title,
              poster_path: movie.poster_path,
              vote_average: movie.vote_average,
            },
          ]
    );
  }

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}