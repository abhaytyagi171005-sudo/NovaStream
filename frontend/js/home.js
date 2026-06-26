const API = "http://localhost:5000/api";

async function fetchData(endpoint) {
    const res = await fetch(`${API}${endpoint}`);
    return await res.json();
}

function shuffle(arr) {
    return [...arr].sort(() => Math.random() - 0.5);
}

function createCard(movie) {
    return `
        <div class="card" onclick="openMovie('${movie.Title.replace(/'/g, "\\'")}')">
            <img src="${movie.Poster}" alt="${movie.Title}">
            <div class="movie-info">
                <h3>${movie.Title}</h3>
            </div>
        </div>
    `;
}

async function loadRow(endpoint, containerId) {
    const container = document.getElementById(containerId);

    if (!container) return;

    const data = await fetchData(endpoint);

    container.innerHTML =
        shuffle(data)
            .slice(0, 20)
            .map(createCard)
            .join("");
}

function openMovie(title) {
    window.location.href =
        `search.html?movie=${encodeURIComponent(title)}`;
}
async function loadHome() {
    await loadRow("/trending", "trendingMovies");
    await loadRow("/movies", "topRated");
    await loadRow("/movies?category=scifi", "sciFiMovies");
    await loadRow("/movies?category=action", "superheroMovies");
}

loadHome();