console.log("main.js connected");

// API URL
const API = "http://localhost:3000/api/movies";
let movies = [];

/**
 * Create movie card
 */
function createMovieCard(movie) {
  const card = document.createElement("article");
  card.className = "movie-card";

  const img = document.createElement("img");
  img.src = movie.poster || "fallback.jpg";
  img.alt = `${movie.title} poster`;
  img.onerror = () => (img.src = "fallback.jpg");

  const title = document.createElement("h2");
  title.textContent = movie.title;

  const meta = document.createElement("div");
  meta.className = "movie-meta";

  meta.innerHTML = `
      <p>Year: ${movie.year}</p>
      <p>Rating: ${movie.rating}</p>
  `;

  card.append(img, title, meta);
  return card;
}

/**
 * Render movies
 */
function renderMovies(list = []) {
  const container = document.getElementById("moviesList");
  container.innerHTML = "";

  if (list.length === 0) {
    container.innerHTML = `<p class="empty">No movies available.</p>`;
    return;
  }

  list.forEach((movie) => container.appendChild(createMovieCard(movie)));
}

/**
 * Load movies from server
 */
async function loadMovies() {
  try {
    const res = await fetch(API);
    movies = await res.json();
    renderMovies(movies);
  } catch (err) {
    console.error("Failed to load movies:", err);
  }
}

/**
 * Add movie to server
 */
async function addMovie(movie) {
  const formData = new FormData();
  formData.append("title", movie.title);
  formData.append("year", movie.year);
  formData.append("rating", movie.rating);
  formData.append("desc", movie.desc || "");
  formData.append("rank", movie.rank || movies.length + 1);

  if (movie.posterFile) {
    formData.append("poster", movie.posterFile);
  }

  try {
    const res = await fetch(API, {
      method: "POST",
      body: formData,
    });

    const savedMovie = await res.json();
    movies.push(savedMovie);
    renderMovies(movies);
  } catch (err) {
    console.error("Error adding movie:", err);
  }
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  loadMovies();

  const form = document.getElementById("addMovieForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const title = form.querySelector("[name='title']").value.trim();
      const year = parseInt(form.querySelector("[name='year']").value, 10);
      const rating = parseFloat(form.querySelector("[name='rating']").value);
      const desc = form.querySelector("[name='desc']")?.value.trim() || "";
      const posterFile = form.querySelector("[name='poster']").files[0];

      if (!title || isNaN(year) || isNaN(rating)) {
        alert("Please fill all required fields");
        return;
      }

      addMovie({ title, year, rating, desc, posterFile });
      form.reset();
    });
  }
});
