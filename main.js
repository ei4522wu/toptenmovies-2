console.log("main.js loaded successfully");

// Demo movie data
const demoMovies = [
  {
    title: "The Shawshank Redemption",
    year: 1994,
    rating: 9.3,
    poster: "posters/shawshank.jpg",
  },
  {
    title: "The Godfather",
    year: 1972,
    rating: 9.2,
    poster: "posters/godfather.jpg",
  },
  {
      id: 1,
      title: "The Shawshank Redemption",
      year: 1994,
      rating: 9.3,
      desc: "Two imprisoned men bond over years, finding solace and eventual redemption.",
      poster: "https://www.themoviedb.org/t/p/w600_and_h900_bestv2/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
      rank: 1
    },
    {
      id: 2,
      title: "The Godfather",
      year: 1972,
      rating: 9.2,
      desc: "The aging patriarch of an organized crime dynasty transfers control to his son.",
      poster: "https://www.themoviedb.org/t/p/w600_and_h900_bestv2/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
      rank: 2
    },
    {
      id: 3,
      title: "The Dark Knight",
      year: 2008,
      rating: 9.0,
      desc: "Batman faces the Joker, a criminal mastermind who plunges Gotham into chaos.",
      poster: "https://www.themoviedb.org/t/p/w600_and_h900_bestv2/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
      rank: 3
    },
    {
      id: 4,
      title: "Inception",
      year: 2010,
      rating: 8.8,
      desc: "A thief who steals corporate secrets through dream-sharing is given a final job.",
      poster: "https://www.themoviedb.org/t/p/w600_and_h900_bestv2/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg",
      rank: 4
    }
]

/**
 * Creates a movie card element
 */
function createMovieCard(movie) {
  const card = document.createElement("article");
  card.className = "movie-card";

  const img = document.createElement("img");
  img.src = movie.poster || "fallback.jpg";
  img.alt = `${movie.title} poster`;
  img.onerror = () => {
    console.warn(`Poster missing for "${movie.title}", using fallback.`);
    img.src = "fallback.jpg";
  };

  const title = document.createElement("h2");
  title.textContent = movie.title;

  const meta = document.createElement("div");
  meta.className = "movie-meta";

  const year = document.createElement("p");
  year.textContent = `Year: ${movie.year}`;

  const rating = document.createElement("p");
  rating.textContent = `Rating: ${movie.rating}`;

  meta.append(year, rating);
  card.append(img, title, meta);

  return card;
}

/**
 * Renders movie cards into the moviesList container
 */
function renderMovies(movies = []) {
  const list = document.getElementById("moviesList");

  if (!list) {
    console.error("moviesList element not found.");
    return;
  }

  list.innerHTML = "";

  if (movies.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "empty";
    emptyMessage.textContent = "No movies available.";
    list.appendChild(emptyMessage);
    return;
  }

  movies.forEach((movie) => list.appendChild(createMovieCard(movie)));
}

/**
 * Adds a new movie to the list
 */
function addMovie(movie) {
  demoMovies.push(movie);
  renderMovies(demoMovies);
}

// Load demo movies after DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  renderMovies(demoMovies);

  // Hook up form submission
  const form = document.getElementById("addMovieForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const title = form.querySelector("[name='title']").value.trim();
      const year = parseInt(form.querySelector("[name='year']").value, 10);
      const rating = parseFloat(form.querySelector("[name='rating']").value);
      const poster = form.querySelector("[name='poster']").value.trim();

      if (!title || isNaN(year) || isNaN(rating)) {
        alert("Please fill in all required fields correctly.");
        return;
      }

      addMovie({ title, year, rating, poster });
      form.reset();
    });
  }
});