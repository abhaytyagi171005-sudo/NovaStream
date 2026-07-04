const API = "https://novastream-o3ri.onrender.com/api";

// ── HERO SYSTEM ──────────────────────────────────────────────
let currentSlide = 0;
let slideInterval = null;
let heroMovies = [];
const HERO_INTERVAL = 7000; // 7 seconds

/* ── Fetch Hero Movies from Backend ── */
async function fetchHeroMovies() {
    try {
        const response = await fetch('https://novastream-o3ri.onrender.com/api/hero');

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (!data || data.length === 0) {
            console.warn('No hero movies found, using fallback');
            useFallbackHero();
            return;
        }

        heroMovies = data;
        buildHero();
    } catch (error) {
        console.error('Error fetching hero movies:', error);
        useFallbackHero();
    }
}

/* ── Fallback Hero Data (in case API fails) ── */
function useFallbackHero() {
    heroMovies = [
        {
            title: "Dune: Part Two",
            year: "2024",
            description: "Paul Atreides joins the Fremen and fights for Arrakis.",
            poster: "https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg",
            backdrop: "https://image.tmdb.org/t/p/original/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg",
            rating: "8.5",
            genre: "Sci-Fi",
            trailer: "https://www.youtube.com/embed/8Bk2Tt-EXeE?autoplay=1&mute=1&loop=1&playlist=8Bk2Tt-EXeE&start=5&end=13&controls=0",
            hasTrailer: true,
            language: "en"
        },
        {
            title: "The Dark Knight",
            year: "2008",
            description: "When the menace known as the Joker wreaks havoc on Gotham, Batman must accept one of the greatest psychological tests.",
            poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
            backdrop: "https://image.tmdb.org/t/p/original/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg",
            rating: "9.0",
            genre: "Action",
            trailer: "https://www.youtube.com/embed/EXeTwQWrcwY?autoplay=1&mute=1&loop=1&playlist=EXeTwQWrcwY&start=5&end=13&controls=0",
            hasTrailer: true,
            language: "en"
        },
        {
            title: "Inception",
            year: "2010",
            description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea.",
            poster: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
            backdrop: "https://image.tmdb.org/t/p/original/s3TBrgb1vv2QPEdn9c7H3uU3cYr.jpg",
            rating: "8.8",
            genre: "Sci-Fi",
            trailer: "https://www.youtube.com/embed/YoHD9XEInc0?autoplay=1&mute=1&loop=1&playlist=YoHD9XEInc0&start=5&end=13&controls=0",
            hasTrailer: true,
            language: "en"
        },
        {
            title: "Interstellar",
            year: "2014",
            description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
            poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
            backdrop: "https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg",
            rating: "8.6",
            genre: "Sci-Fi",
            trailer: "https://www.youtube.com/embed/zSWdZVtXT7E?autoplay=1&mute=1&loop=1&playlist=zSWdZVtXT7E&start=5&end=13&controls=0",
            hasTrailer: true,
            language: "en"
        },
        {
            title: "The Matrix",
            year: "1999",
            description: "A computer hacker learns about the true nature of his reality and his role in the war against its controllers.",
            poster: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
            backdrop: "https://image.tmdb.org/t/p/original/fNG7i7R8MlLwVkzJjW5R3VdJd6T.jpg",
            rating: "8.7",
            genre: "Action",
            trailer: "https://www.youtube.com/embed/vKQi3bBA1y8?autoplay=1&mute=1&loop=1&playlist=vKQi3bBA1y8&start=5&end=13&controls=0",
            hasTrailer: true,
            language: "en"
        }
    ];
    buildHero();
}

/* ── Build Hero Slides ── */
/* ── Build Hero Slides ── */
function buildHero() {
    const slidesContainer = document.getElementById('heroSlides');
    const indicatorsContainer = document.getElementById('heroIndicators');

    if (!slidesContainer || !indicatorsContainer) {
        const heroBanner = document.getElementById('heroBanner');
        if (heroBanner) {
            if (!slidesContainer) {
                const newSlides = document.createElement('div');
                newSlides.className = 'hero-slides';
                newSlides.id = 'heroSlides';
                heroBanner.prepend(newSlides);
            }
            if (!indicatorsContainer) {
                const newIndicators = document.createElement('div');
                newIndicators.className = 'hero-indicators';
                newIndicators.id = 'heroIndicators';
                heroBanner.appendChild(newIndicators);
            }
        }
    }

    const slides = document.getElementById('heroSlides');
    const indicators = document.getElementById('heroIndicators');

    if (!slides || !indicators) return;

    slides.innerHTML = '';
    indicators.innerHTML = '';

    heroMovies.forEach((movie, index) => {
        const slide = document.createElement('div');
        slide.className = `hero-slide${index === 0 ? ' active' : ''}`;
        slide.dataset.index = index;

        // ─── USE TMDB NATIVE PLAYER ───
        const playerContainer = document.createElement('div');
        playerContainer.className = 'hero-player-container';

        if (movie.videoUrl) {
            // TMDB native embed - clean, no YouTube branding
            playerContainer.innerHTML = `
                <iframe 
                    src="${movie.videoUrl}"
                    allow="autoplay; encrypted-media; fullscreen"
                    allowfullscreen
                    frameborder="0"
                    style="width:100%;height:100%;border:none;"
                ></iframe>
            `;
        } else {
            // Fallback: show poster image
            playerContainer.innerHTML = `
                <img src="${movie.backdrop || movie.poster}" 
                     alt="${movie.title}"
                     style="width:100%;height:100%;object-fit:cover;"
                />
            `;
        }

        slide.appendChild(playerContainer);

        // Content overlay
        const content = document.createElement('div');
        content.className = 'hero-content';
        content.innerHTML = `
            <h2 class="hero-title">${movie.title || 'Untitled'}</h2>
            <div class="hero-meta">
                <span class="hero-year">${movie.year || 'N/A'}</span>
                ${movie.rating && movie.rating !== 'N/A' ? `<span class="hero-rating">⭐ ${movie.rating}</span>` : ''}
                <span class="hero-genre">${movie.genre || 'Movie'}</span>
                ${movie.language ? `<span class="hero-language">${movie.language.toUpperCase()}</span>` : ''}
            </div>
            <p class="hero-description">${movie.description || 'No description available'}</p>
            <div class="hero-buttons">
                <button class="hero-btn-play" onclick="playTrailer('${movie.videoUrl || ''}')">
                    ▶ Play
                </button>
                <button class="hero-btn-mylist" onclick="addToMyList('${movie.title}', '${movie.poster}')">
                    + My List
                </button>
            </div>
        `;

        slide.appendChild(content);
        slides.appendChild(slide);

        // Indicator dot
        const dot = document.createElement('button');
        dot.className = `hero-dot${index === 0 ? ' active' : ''}`;
        dot.dataset.index = index;
        dot.addEventListener('click', () => goToSlide(index));
        indicators.appendChild(dot);
    });

    goToSlide(0);
    startAutoplay();
}

/* ── Navigation ── */
function goToSlide(index) {
    if (heroMovies.length === 0) return;

    if (index < 0) index = heroMovies.length - 1;
    if (index >= heroMovies.length) index = 0;

    currentSlide = index;

    // Update slides
    document.querySelectorAll('.hero-slide').forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
    });

    // Update dots
    document.querySelectorAll('.hero-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
}

function nextSlide() {
    goToSlide(currentSlide + 1);
}

function prevSlide() {
    goToSlide(currentSlide - 1);
}

/* ── Autoplay ── */
function startAutoplay() {
    if (slideInterval) clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, HERO_INTERVAL);
}

function resetAutoplay() {
    if (slideInterval) {
        clearInterval(slideInterval);
        startAutoplay();
    }
}

/* ── Event Listeners ── */
document.addEventListener('DOMContentLoaded', fetchHeroMovies);

// Wait for DOM to load before adding event listeners
setTimeout(() => {
    const prevBtn = document.getElementById('heroPrev');
    const nextBtn = document.getElementById('heroNext');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            resetAutoplay();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            resetAutoplay();
        });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            prevSlide();
            resetAutoplay();
        } else if (e.key === 'ArrowRight') {
            nextSlide();
            resetAutoplay();
        }
    });
}, 500);

/* ── Utility Functions ── */
function playTrailer(trailerUrl) {
    if (!trailerUrl) {
        showToast('Trailer not available');
        return;
    }
    // Open trailer in a new tab with controls
    window.open(trailerUrl.replace('autoplay=1', 'autoplay=1&controls=1'), '_blank');
}

function addToMyList(title, poster) {
    let myList = JSON.parse(localStorage.getItem('myList')) || [];
    if (!myList.some(item => item.title === title)) {
        myList.push({ title, poster });
        localStorage.setItem('myList', JSON.stringify(myList));
        showToast(`Added: ${title} ♥`);
    } else {
        showToast(`Already in your list`);
    }
}

function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');
    if (!toast) return;
    toastMsg.innerText = message;
    toast.classList.remove('show');
    void toast.offsetWidth;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 3000);
}

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
}

// ── Initialize ──
loadHome();