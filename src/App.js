import React, { useState, useEffect } from "react";
import "./App.css";
import { Header, Footer } from "./HeaderFooter";

const ytApiKey = "AIzaSyAvREogRlaGatmcSynwzCrIJs5wd_vigUM";
const ytResult = 1;
const omdbApiKey = "41059430";

// Appen använder sig av Open Movie Database (OMDb) API för att hitta filmer och YouTube API för att hitta trailers. Det finns även en funktion som ger användaren möjlighet att gå tillbaka till startsidan från filmtrailern.
export default function App() {
  const [trailers, setTrailers] = useState([]);
  const [viewMovie, setViewMovie] = useState(false);
  const [title, setTitle] = useState("Movie Search");
  const [newMovies, setNewMovies] = useState([]);

  useEffect(() => {
    if (viewMovie) {
      // Hämtar YouTube-trailrar för den valda filmen.
      fetch(
        `https://www.googleapis.com/youtube/v3/search?q=${title} movie trailer&order=relevance&part=snippet&type=video&maxResults=${ytResult}&key=${ytApiKey}`
      )
        .then((response) => response.json())
        .then((responseJson) => {
          setTrailers(
            responseJson.items.map(
              (obj) => `https://www.youtube.com/embed/${obj.id.videoId}`
            )
          );
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [viewMovie, title]);

  // Den här funktionen används för att söka efter filmer i omdbapi. Funktionen använder sig av en fetch-request för att hämta data från databasen, och returnerar en lista med resultat för sökningen. Om inga filmer hittas visas ett felmeddelande och listan töms.
  function searchClick(event) {
    event.preventDefault();
    let query = event.target.query.value;
    let omdbUrl = `https://www.omdbapi.com/?apikey=${omdbApiKey}&s="${query}"&type=movie`;
    fetch(omdbUrl)
      .then((response) => response.json())
      .then((responseJson) => {
        if (responseJson.Response === "False") {
          // Visa felmeddelande
          setNewMovies([]);
          alert("No movies found for the given search query.");
        } else {
          setNewMovies(responseJson.Search);
        }
      })
      .catch((error) => {
        console.error(error);
      });
    event.target.query.value = "";
  }

  function movieClick(ev) {
    setViewMovie(true);
    var movieYear = ev.currentTarget.value;
    var movieTitle = ev.currentTarget.dataset.name;
    setTitle(`${movieTitle} ${movieYear}`);
  }

  function backClick() {
    setViewMovie(false);
    setTitle("Movie Search");
  }

  //Funktionen renderar en normal vy i appen, som visar en rubrik, en sökruta och knapp, och listar filmer.
  function renderNormal() {
    return (
      <div className="flex-container">
        <h1>{title}</h1>
        <form onSubmit={searchClick}>
          <input className="app_input" name="query" type="text" />
          <button type="submit">Search</button>
        </form>
        {newMovies.length > 0 ? (
          <p>Select a movie to view its trailer</p>
        ) : null}
        <div className="movie-list-container">
          {newMovies.slice(0, Math.min(newMovies.length, 4)).map((movie, i) => (
            <div className="movie-item" key={i}>
              <button
                onClick={movieClick}
                data-name={movie.Title}
                value={movie.Year}
              >
                <img src={movie.Poster} alt={`Poster for ${movie.Title}`} />
                <div className="movie-title">{movie.Title}</div>
                <div className="movie-year">{movie.Year}</div>
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  //Denna funktion returnerar en vy som visar trailer(s) för den valda filmen och en "Tillbaka"-knapp.
  function renderView() {
    return (
      <div className={`flex-container${viewMovie ? " view-mode" : ""}`}>
        <h1>Movie Trailer</h1>
        <div className="youtubeClip">
          {trailers.map((link, i) => (
            <div key={i}>
              <iframe
                title={`Trailer ${i + 1}`}
                alt={`Trailer ${i + 1} for the movie ${title}`}
                width="560"
                height="315"
                src={link}
                frameBorder="0"
                allowFullScreen
              ></iframe>
            </div>
          ))}
          <button onClick={backClick} className="back-button">
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {" "}
      <Header />
      {viewMovie ? renderView() : renderNormal()} <Footer />
    </div>
  );
}
