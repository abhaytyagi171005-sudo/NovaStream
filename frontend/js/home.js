const API = "https://novastream-o3ri.onrender.com/api";

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

async function loadRow(endpoint, containerId, sectionId) {
    const container = document.getElementById(containerId);
    const section = sectionId ? document.getElementById(sectionId) : null;

    if (!container) return;

    const data = await fetchData(endpoint);

    if (!data || data.length === 0) {
        if (section) section.style.display = "none";
        return;
    }

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
    await loadRow("/trending", "trendingMovies", "sectionTrending");
    await loadRow("/movies", "topRated", "sectionTopRated");
    await loadRow("/movies?category=scifi", "sciFiMovies", "sectionSciFi");
    await loadRow("/movies?category=action", "superheroMovies", "sectionSuperhero");
    await loadRow("/movies?category=comedy", "comedyMovies", "sectionComedy");
    await loadRow("/movies?category=drama", "dramaMovies", "sectionDrama");
    await loadRow("/movies?category=horror", "horrorMovies", "sectionHorror");
}

loadHome();