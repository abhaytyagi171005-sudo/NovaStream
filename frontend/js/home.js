const API = "https://novastream-o3ri.onrender.com/api";

// ── HERO SYSTEM (Single Preview) ────────────────────────────
let currentHero = null;
let heroData = [];

/* ── Load Hero JSON ── */
async function loadHeroData() {
    try {
        const response = await fetch('data/hero.json');
        if (!response.ok) throw new Error('Hero JSON not found');
        const data = await response.json();
        heroData = data;
        console.log(`✅ Loaded ${heroData.length} hero entries`);
        return data;
    } catch (error) {
        console.warn('⚠️ Hero JSON not found, using fallback');
        return null;
    }
}

/* ── Fetch TMDB Details ── */
async function fetchTMDBDetails(tmdbId) {
    try {
        const response = await fetch(
            `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=f08c9127f4fa4a8642bffa57c5b8955e`
        );
        if (!response.ok) throw new Error(`TMDB API error: ${response.status}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('❌ TMDB fetch failed:', error);
        return null;
    }
}

/* ── Get Random Hero Entry ── */
function getRandomHeroEntry() {
    if (heroData.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * heroData.length);
    return heroData[randomIndex];
}

/* ── Render Hero ── */
async function renderHero() {
    // Show loading state
    const heroContent = document.getElementById('heroContent');
    heroContent.style.opacity = '0';

    // 1. Load hero data
    await loadHeroData();
    if (heroData.length === 0) {
        useFallbackHero();
        return;
    }

    // 2. Pick random entry
    const entry = getRandomHeroEntry();
    if (!entry) {
        useFallbackHero();
        return;
    }

    // 3. Fetch TMDB details
    const details = await fetchTMDBDetails(entry.tmdb);
    if (!details) {
        useFallbackHero();
        return;
    }

    // 4. Update UI
    currentHero = {
        ...entry,
        title: details.title,
        year: details.release_date?.slice(0, 4) || 'N/A',
        description: details.overview || 'No description available',
        rating: details.vote_average ? details.vote_average.toFixed(1) : 'N/A',
        poster: details.poster_path
            ? `https://image.tmdb.org/t/p/original${details.poster_path}`
            : null,
        backdrop: details.backdrop_path
            ? `https://image.tmdb.org/t/p/original${details.backdrop_path}`
            : null,
        genres: (details.genres || []).map(g => g.name).slice(0, 3).join(' • ') || 'Movie',
        tmdbId: entry.tmdb
    };

    updateHeroDOM(currentHero);
}

/* ── Update Hero DOM ── */
function updateHeroDOM(hero) {
    const video = document.getElementById('heroPreview');
    const poster = document.getElementById('heroPoster');
    const heroContent = document.getElementById('heroContent');

    const posterUrl = hero.backdrop || hero.poster || '';

    // ─── REMOVE ALL TRANSITIONS ───
    poster.style.transition = 'none';
    video.style.transition = 'none';

    // ─── SHOW POSTER ───
    if (posterUrl) {
        // Preload poster image
        const img = new Image();
        img.onload = function () {
            poster.src = posterUrl;
            poster.style.display = 'block';
            poster.style.opacity = '1';
            video.style.display = 'none';
            video.style.opacity = '0';

            // ─── AFTER 2 SECONDS, SWITCH TO VIDEO ───
            setTimeout(() => {
                if (hero.preview) {
                    video.src = hero.preview;
                    video.style.display = 'block';
                    video.style.opacity = '1';
                    video.load();

                    // ─── IF VIDEO FAILS, SHOW POSTER AGAIN ───
                    video.onerror = function () {
                        video.style.display = 'none';
                        poster.style.display = 'block';
                        poster.style.opacity = '1';
                        console.warn('⚠️ Video failed, showing poster');
                    };

                    video.play().catch(() => {
                        // If play fails, show poster
                        video.style.display = 'none';
                        poster.style.display = 'block';
                        poster.style.opacity = '1';
                    });
                }
            }, 2000);
        };
        img.onerror = function () {
            // If poster fails to load, try video
            if (hero.preview) {
                video.src = hero.preview;
                video.style.display = 'block';
                video.style.opacity = '1';
                video.load();
                video.play().catch(() => { });
            }
        };
        img.src = posterUrl;
    } else {
        // No poster – show video immediately
        if (hero.preview) {
            video.src = hero.preview;
            video.style.display = 'block';
            video.style.opacity = '1';
            video.load();
            video.play().catch(() => { });
        }
    }

    // ─── UPDATE TEXT CONTENT ───
    const titleEl = document.getElementById('heroTitle');
    if (titleEl) titleEl.textContent = hero.title;

    const yearEl = document.getElementById('heroYear');
    if (yearEl) yearEl.textContent = hero.year;

    const ratingEl = document.getElementById('heroRating');
    if (ratingEl && hero.rating && hero.rating !== 'N/A') {
        ratingEl.textContent = `⭐ ${hero.rating}`;
        ratingEl.style.display = 'inline';
    } else if (ratingEl) {
        ratingEl.style.display = 'none';
    }

    const genresEl = document.getElementById('heroGenres');
    if (genresEl) genresEl.textContent = hero.genres;

    const descEl = document.getElementById('heroDescription');
    if (descEl) descEl.textContent = hero.description;

    const watchBtn = document.getElementById('heroWatchBtn');
    if (watchBtn) watchBtn.onclick = () => openMovie(hero.title);

    const myListBtn = document.getElementById('heroMyListBtn');
    if (myListBtn) myListBtn.onclick = () => addToMyList(hero.title, hero.poster);

    // Fade in content
    if (heroContent) {
        heroContent.style.opacity = '1';
        heroContent.style.transition = 'opacity 0.5s ease';
    }

    console.log(`✅ Hero loaded: ${hero.title} (${hero.year})`);
}

/* ── Utility ── */
function openMovie(title) {
    window.location.href = `search.html?movie=${encodeURIComponent(title)}`;
}

function addToMyList(title, poster) {
    let myList = JSON.parse(localStorage.getItem('myList')) || [];
    if (!myList.some(item => item.title === title)) {
        myList.push({ title, poster });
        localStorage.setItem('myList', JSON.stringify(myList));
        showToast(`Added: ${title} ♥`);
    } else {
        showToast('Already in your list');
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
    return `
        <div class="card"
             onclick="openMovie('${movie.Title.replace(/'/g, "\\'")}')"
             data-title="${movie.Title.replace(/"/g, '&quot;')}"
             data-year="${movie.Year || ''}"
             data-rating="${movie.imdbRating || ''}"
             data-genres="${genres}">
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
document.addEventListener('DOMContentLoaded', () => {
    renderHero();
    loadHome();
});