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
    await loadRow("/movies?category=drama&limit=20", "topRated", "sectionTopRated");
    await loadRow("/movies?category=scifi&limit=20", "sciFiMovies", "sectionSciFi");
    await loadRow("/movies?category=action&limit=20", "superheroMovies", "sectionSuperhero");
    await loadRow("/movies?category=comedy&limit=20", "comedyMovies", "sectionComedy");
    await loadRow("/movies?category=drama&limit=20", "dramaMovies", "sectionDrama");
    await loadRow("/movies?category=horror&limit=20", "horrorMovies", "sectionHorror");
    await loadRow("/movies?category=thriller&limit=20", "thrillerMovies", "sectionThriller");
    await loadRow("/movies?category=crime&limit=20", "crimeMovies", "sectionCrime");
    await loadRow("/movies?category=animation&limit=20", "animationMovies", "sectionAnimation");
    await loadRow("/movies?category=anime&limit=20", "animeMovies", "sectionAnime");
    await loadRow("/movies?category=family&limit=20", "familyMovies", "sectionFamily");
    await loadRow("/movies?category=documentary&limit=20", "documentaryMovies", "sectionDocumentary");
    await loadRow("/movies?category=romance&limit=20", "romanceMovies", "sectionRomance");
}
loadHome();