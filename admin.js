const API_BASE = ''; // e.g. 'http://localhost:3000'

// ⚠️ Replace with proper backend authentication
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'Password123';

// Cache DOM elements
const els = {
  loginBtn: document.getElementById('loginBtn'),
  logoutBtn: document.getElementById('logoutBtn'),
  addBtn: document.getElementById('addMovieBtn'),
  darkToggle: document.getElementById('darkToggleAdmin'),
  loginUser: document.getElementById('loginUser'),
  loginPass: document.getElementById('loginPass'),
  loginError: document.getElementById('loginError'),
  loginSection: document.getElementById('loginSection'),
  adminPanel: document.getElementById('adminPanel'),
  adminMovies: document.getElementById('adminMovies'),
  adminMsg: document.getElementById('adminMsg'),
  movieTitle: document.getElementById('movieTitle'),
  movieYear: document.getElementById('movieYear'),
  movieRating: document.getElementById('movieRating'),
  moviePoster: document.getElementById('moviePoster'),
  movieDesc: document.getElementById('movieDesc'),
  movieRank: document.getElementById('movieRank')
};

// Event listeners
els.loginBtn?.addEventListener('click', tryLogin);
els.logoutBtn?.addEventListener('click', doLogout);
els.addBtn?.addEventListener('click', addMovie);
els.darkToggle?.addEventListener('click', toggleDarkMode);

function toggleDarkMode() {
  const now = document.body.classList.toggle('dark') ? 'dark' : 'light';
  localStorage.setItem('top10_dark', now);
}

function tryLogin() {
  const u = els.loginUser.value.trim();
  const p = els.loginPass.value.trim();

  if (u === ADMIN_USER && p === ADMIN_PASS) {
    els.loginError.textContent = '';
    els.loginSection.classList.add('hidden');
    els.adminPanel.classList.remove('hidden');
    localStorage.setItem('admin_logged_in', 'true'); // persist login
    loadAdminMovies();
  } else {
    els.loginError.textContent = 'Invalid credentials';
  }
}

function doLogout() {
  // Hide admin panel, show login form
  els.adminPanel.classList.add('hidden');
  els.loginSection.classList.remove('hidden');

  // Clear login inputs
  els.loginUser.value = '';
  els.loginPass.value = '';

  // Clear messages
  els.adminMsg.textContent = '';
  els.loginError.textContent = '';

  // Reset dark mode if desired
  document.body.classList.remove('dark');

  // Remove session flag
  localStorage.removeItem('admin_logged_in');
}

async function loadAdminMovies() {
  try {
    const res = await fetch(`${API_BASE}/api/movies`);
    if (!res.ok) throw new Error('Backend unavailable');
    const movies = await res.json();
    renderAdminList(movies);
  } catch {
    const local = getLocalMovies();
    renderAdminList(local);
  }
}

function renderAdminList(movies = []) {
  if (!movies.length) {
    els.adminMovies.innerHTML = '<div class="muted">No movies</div>';
    return;
  }

  els.adminMovies.innerHTML = movies.map((m, idx) => `
    <div class="admin-item" data-id="${m.id ?? idx}">
      <img src="${m.poster || 'https://via.placeholder.com/120x180?text=No+Image'}" alt="Poster">
      <div class="meta">
        <div><strong>${m.rank ? `${m.rank}. ` : ''}${escapeHtml(m.title)}</strong></div>
        <div class="movie-meta">${m.year || ''} · Rating: ${m.rating || '—'}</div>
      </div>
      <div>
        <button class="small-btn edit-btn">Edit</button>
        <button class="small-btn delete-btn">Delete</button>
      </div>
    </div>
  `).join('');

  // Attach event delegation for edit/delete
  els.adminMovies.querySelectorAll('.edit-btn').forEach(btn =>
    btn.addEventListener('click', e => editMovie(getId(e)))
  );
  els.adminMovies.querySelectorAll('.delete-btn').forEach(btn =>
    btn.addEventListener('click', e => deleteMovie(getId(e)))
  );
}

function getId(e) {
  return e.target.closest('.admin-item')?.dataset.id;
}

function getLocalMovies() {
  return JSON.parse(localStorage.getItem('movies') || '[]');
}

function setLocalMovies(movies) {
  localStorage.setItem('movies', JSON.stringify(movies));
}

async function editMovie(id) {
  alert(`Edit not implemented. Use delete + add instead. (ID: ${id})`);
}

async function deleteMovie(id) {
  try {
    const res = await fetch(`${API_BASE}/api/movies/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Delete failed');
    els.adminMsg.textContent = 'Deleted (backend)';
  } catch {
    let local = getLocalMovies().filter(m => m.id != id);
    setLocalMovies(local);
    els.adminMsg.textContent = 'Deleted (local)';
  }
  loadAdminMovies();
}

async function addMovie() {
  const title = els.movieTitle.value.trim();
  if (!title) return alert('Title required');

  const year = Number(els.movieYear.value);
  const rating = Number(els.movieRating.value);
  const file = els.moviePoster.files[0];
  const desc = els.movieDesc.value.trim();
  const rank = Number(els.movieRank.value);

  try {
    const form = new FormData();
    form.append('title', title);
    form.append('year', year || '');
    form.append('rating', rating || '');
    form.append('desc', desc);
    form.append('rank', rank || '');
    if (file) form.append('poster', file);

    const res = await fetch(`${API_BASE}/api/movies`, { method: 'POST', body: form });
    if (!res.ok) throw new Error('Server error');
    els.adminMsg.textContent = 'Uploaded to backend';
  } catch {
    const local = getLocalMovies();
    const id = (local.reduce((a, b) => Math.max(a, b.id || 0), 0) || 0) + 1;

    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        local.push({ id, title, year, rating, desc, poster: e.target.result, rank });
        setLocalMovies(local);
        els.adminMsg.textContent = 'Saved locally (with poster)';
        loadAdminMovies();
      };
      reader.readAsDataURL(file);
    } else {
      local.push({ id, title, year, rating, desc, poster: '', rank });
      setLocalMovies(local);
      els.adminMsg.textContent = 'Saved locally (no poster)';
    }
  }

  clearForm();
  loadAdminMovies();
}

function clearForm() {
  els.movieTitle.value = '';
  els.movieYear.value = '';
  els.movieRating.value = '';
  els.moviePoster.value = '';
  els.movieDesc.value = '';
  els.movieRank.value = '';
}

function escapeHtml(s = '') {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

/* ---------------------------
   Seed Movies with Posters
--------------------------- */
function seedMovies() {
  const existing = getLocalMovies();
  if (existing.length) return; // don't overwrite if already present

  const sample = [
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
  ];

  setLocalMovies(sample);
}

// Initial load
seedMovies();
loadAdminMovies();
const demoMovies = [
  { title: "The Shawshank Redemption", year: 1994, rating: 9.3, poster: "images/shawshank.jpg" },
  { title: "The Godfather", year: 1972, rating: 9.2, poster: "images/godfather.jpg" }
];

renderMovies(demoMovies);
