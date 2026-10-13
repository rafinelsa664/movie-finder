import { useEffect } from "react";

function App() {
  useEffect(() => {
    const key = import.meta.env.VITE_TMDB_API_KEY;
    fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${key}`)
      .then((res) => res.json())
      .then((data) => console.log(data));
  }, []);

  return <h1>Movie Finder</h1>;
}

export default App;