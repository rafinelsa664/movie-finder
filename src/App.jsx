import { Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import MovieDetail from "./pages/MovieDetail";
import Favorites from "./pages/Favorites";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movie/:id" element={<MovieDetail />} />
        <Route path="/favorites" element={<Favorites />} />
      </Routes>

      <footer className="site-footer">
        <a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer">
          <img
            src="/tmdb_logo.svg"
            alt="Logo TMDB"
            className="tmdb_logo"
          />
        </a>
        <p>
          This product uses the TMDB API but is not endorsed or certified by TMDB.
        </p>
      </footer>
    </>
  );
}

export default App;