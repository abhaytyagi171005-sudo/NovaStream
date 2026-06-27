const API = "https://novastream-o3ri.onrender.com/api";

// ── HERO SYSTEM ──────────────────────────────────────────────
const heroMovies = [
    {
        title: "DUNE",
        year: "2024",
        description: "Paul Atreides joins the Fremen and fights for Arrakis.",
        image: "images/banners/dune-banner.jpg",
        video: "images/dune-preview.mp4"
    },
    {
        title: "OPPENHEIMER",
        year: "2023",
        description: "The story of J. Robert Oppenheimer and the atomic bomb.",
        image: "images/banners/oppenheimer-banner.jpg",
        video: "images/oppenheimer-preview.mp4"
    },
    {
        title: "TOP GUN MAVERICK",
        year: "2022",
        description: "Maverick trains the next generation.",
        image: "images/banners/topgun-banner.jpg",
        video: "images/topgun-preview.mp4"
    },
    {
        title: "Kingsman: The Secret Service",
        year: "2014",
        description: "A spy organisation recruits a promising street kid.",
        image: "images/banners/kingsman-banner.jpg",
        video: "images/kingsman-preview.mp4"
    }
];

let currentHero = 0;
let heroInterval = null;
let videoTimeout = null;

function changeHero(index) {
    const movie = heroMovies[index];
    const banner = document.getElementById("heroBanner");
    const heroVideo = document.getElementById("hero-video");
    const heroSource = document.getElementById("hero-video-source");

    clearTimeout(videoTimeout);

    document.getElementById("heroTitle").innerText = movie.title;
    document.getElementById("heroYear").innerText = movie.year;
    document.getElementById("heroDescription").innerText = movie.description;

    banner.style.backgroundImage = `
        linear-gradient(to right, rgba(0,0,0,.9), rgba(0,0,0,.3)),
        url('${movie.image}')
    `;

    heroVideo.style.opacity = "0";
    heroVideo.pause();

    videoTimeout = setTimeout(() => {
        heroSource.src = movie.video;
        heroVideo.load();
        heroVideo.play().then(() => {
            heroVideo.style.opacity = "1";
        }).catch(() => { });
    }, 2000);
}

changeHero(0);
heroInterval = setInterval(() => {
    currentHero = (currentHero + 1) % heroMovies.length;
    changeHero(currentHero);
}, 9000);

document.getElementById("hero-video").addEventListener("ended", () => {
    currentHero = (currentHero + 1) % heroMovies.length;
    changeHero(currentHero);
});

// ── CATALOG ROWS ─────────────────────────────────────────────
async function fetchData(endpoint) {
    const res = await fetch(`${API}${endpoint}`);
    return await res.json();
}

function shuffle(arr) {
    return [...arr].sort(() => Math.random() - 0.5);
}

function createCard(movie) {
    const genres = (movie.genres || []).join(', ');
    const trailerAttr = movie.trailerKey ? `data-trailer="${movie.trailerKey}"` : '';
    return `
        <div class="card" 
             onclick="openMovie('${movie.Title.replace(/'/g, "\\'")}')"
             data-title="${movie.Title.replace(/"/g, '&quot;')}"
             data-year="${movie.Year || ''}"
             data-rating="${movie.imdbRating || ''}"
             data-genres="${genres}"
             ${trailerAttr}>
            <img src="${movie.Poster}" alt="${movie.Title}" onerror="this.parentElement.style.display='none'">
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

    container.innerHTML = shuffle(data).slice(0, 20).map(createCard).join("");
}

function openMovie(title) {
    window.location.href = `search.html?movie=${encodeURIComponent(title)}`;
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
    attachPreviews();
}

loadHome();
loadHome().then(() => attachPreviews());