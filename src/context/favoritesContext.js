import { createContext, useContext } from "react";

export const FavoritesContext = createContext(null);

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites harus dipakai di dalam FavoritesProvider");
  }
  return context;
}