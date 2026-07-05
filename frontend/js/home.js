const API = "https://novastream-o3ri.onrender.com/api";

// ── HERO SYSTEM ──────────────────────────────────────────────
let currentSlide = 0;
let slideInterval = null;
let heroMovies = [];
const HERO_INTERVAL = 8000;

/* ── Fetch Hero Movies from Local JSON ── */
/* ── Fetch Hero Movies from Local JSON ── */
/* ── Fetch Hero Movies ── */
/* ── Fetch Hero Movies ── */
/* ── Fetch Hero Movies ── */
/* ── Fetch Hero Movies (HD only) ── */
/* ── Fetch Hero Movies (HD only, 2025-2026 trending) ── */
/* ── Fetch Hero Movies (Live from TMDB, 2025-2026 only) ── */
async function fetchHeroMovies() {
    try {
        // Use the live TMDB endpoint
        const response = await fetch(`${API}/hero-live`);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (data && data.length > 0) {
            heroMovies = data;
            buildHero();
            console.log(`✅ Loaded ${heroMovies.length} trending 2025-2026 movies from TMDB`);
            return;
        }

        // Fallback: use hero-hd
        console.log('⚠️ No live movies, falling back to hero-hd...');
        const fallbackResponse = await fetch(`${API}/hero-hd`);
        if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            if (fallbackData && fallbackData.length > 0) {
                heroMovies = fallbackData;
                buildHero();
                console.log(`✅ Loaded ${heroMovies.length} HD movies from catalog`);
                return;
            }
        }

        // Ultimate fallback
        console.log('⚠️ No movies found, using hardcoded fallback');
        useFallbackHero();

    } catch (error) {
        console.error('Hero fetch failed:', error);
        useFallbackHero();
    }
}
/* ── Fallback: Fetch from Trending API ── */
async function fetchHeroFromTrending() {
    try {
        const res = await fetch(`${API}/trending?type=movie&limit=50`);
        const data = await res.json();

        const withPoster = data.filter(m =>
            m.Poster && m.Poster !== 'N/A' && m.Poster !== ''
        );

        if (withPoster.length === 0) {
            useFallbackHero();
            return;
        }

        const shuffled = [...withPoster].sort(() => Math.random() - 0.5);
        heroMovies = shuffled.slice(0, 5).map(m => ({
            title: m.Title,
            year: m.Year,
            description: m.Plot || "No description available",
            poster: m.Poster,
            backdrop: m.Backdrop || m.Poster,
            rating: m.imdbRating || "N/A",
            genres: (m.genres || []).slice(0, 2).join(' • ') || 'Movie',
            language: m.Language || "en",
            preview: null,
            hasPreview: false
        }));

        buildHero();
    } catch (err) {
        console.error('Trending fetch failed:', err);
        useFallbackHero();
    }
}

/* ── Fallback Hero Data ── */
function useFallbackHero() {
    heroMovies = [
        {
            title: "Dune: Part Two",
            year: "2024",
            description: "Paul Atreides unites with the Fremen and fights for the future of Arrakis.",
            backdrop: "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
            poster: "https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg",
            rating: "8.2",
            genres: "Sci-Fi • Adventure",
            language: "en",
            preview: null,
            hasPreview: false
        },
        {
            title: "The Dark Knight",
            year: "2008",
            description: "When the Joker wreaks havoc on Gotham, Batman must confront one of the greatest tests of his abilities.",
            backdrop: "https://image.tmdb.org/t/p/original/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg",
            poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
            rating: "9.0",
            genres: "Action • Crime",
            language: "en",
            preview: null,
            hasPreview: false
        },
        {
            title: "Inception",
            year: "2010",
            description: "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea.",
            backdrop: "https://image.tmdb.org/t/p/original/s3TBrgb1vv2QPEdn9c7H3uU3cYr.jpg",
            poster: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
            rating: "8.8",
            genres: "Sci-Fi • Thriller",
            language: "en",
            preview: null,
            hasPreview: false
        },
        {
            title: "Interstellar",
            year: "2014",
            description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
            backdrop: "https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg",
            poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
            rating: "8.6",
            genres: "Sci-Fi • Drama",
            language: "en",
            preview: null,
            hasPreview: false
        },
        {
            title: "Oppenheimer",
            year: "2023",
            description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
            backdrop: "https://image.tmdb.org/t/p/original/rLb2cwF3Pazuxaj0sRXQ037tGI1.jpg",
            poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
            rating: "8.3",
            genres: "Drama • History",
            language: "en",
            preview: null,
            hasPreview: false
        }
    ];
    buildHero();
}

/* ── Build Hero Slides ── */
function buildHero() {
    const slides = document.getElementById('heroSlides');
    const indicators = document.getElementById('heroIndicators');
    if (!slides || !indicators) return;

    slides.innerHTML = '';
    indicators.innerHTML = '';

    heroMovies.forEach((movie, index) => {
        const slide = document.createElement('div');
        slide.className = `hero-slide${index === 0 ? ' active' : ''}`;

        // ─── BACKGROUND CONTAINER ───
        const bgContainer = document.createElement('div');
        bgContainer.className = 'hero-bg-container';
        bgContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
            overflow: hidden;
            background: #0a0a0a;
        `;

        // ─── USE PREVIEW VIDEO IF AVAILABLE ───
        if (movie.hasPreview && movie.preview) {
            const video = document.createElement('video');
            video.src = movie.preview;
            video.muted = true;
            video.loop = true;
            video.playsInline = true;
            video.autoplay = true;
            video.style.cssText = `
                width: 100%;
                height: 100%;
                object-fit: cover;
            `;
            bgContainer.appendChild(video);
        } else {
            // Use poster image
            const posterUrl = movie.backdrop || movie.poster || '';
            if (posterUrl) {
                const img = document.createElement('img');
                img.src = posterUrl;
                img.alt = movie.title;
                img.style.cssText = `
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                `;
                bgContainer.appendChild(img);
            }
        }

        // ─── GRADIENT OVERLAYS ───
        const gradLeft = document.createElement('div');
        gradLeft.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 2;
            background: linear-gradient(
                to right,
                rgba(0,0,0,0.92) 0%,
                rgba(0,0,0,0.6) 40%,
                rgba(0,0,0,0.1) 70%,
                transparent 100%
            );
        `;

        const gradBottom = document.createElement('div');
        gradBottom.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 2;
            background: linear-gradient(
                to top,
                rgba(10,10,10,1) 0%,
                rgba(10,10,10,0.3) 25%,
                transparent 60%
            );
        `;

        // ─── CONTENT ───
        const content = document.createElement('div');
        content.className = 'hero-content';
        content.style.cssText = `
            position: absolute;
            bottom: 18%;
            left: 5%;
            max-width: 550px;
            z-index: 4;
            pointer-events: auto;
        `;

        const rating = movie.rating && movie.rating !== 'N/A' && !isNaN(parseFloat(movie.rating))
            ? parseFloat(movie.rating).toFixed(1)
            : null;

        const genresStr = movie.genres
            ? (Array.isArray(movie.genres) ? movie.genres.join(' • ') : movie.genres)
            : 'Movie';

        content.innerHTML = `
            <div style="color:#e50914;font-size:0.8rem;letter-spacing:4px;font-weight:600;margin-bottom:10px;text-transform:uppercase;">
                ▶ Featured Today
            </div>
            <h1 class="hero-title" style="
                font-size: clamp(2rem, 4vw, 3.5rem);
                font-weight: 800;
                color: white;
                text-shadow: 0 4px 20px rgba(0,0,0,0.9);
                margin-bottom: 12px;
                line-height: 1.1;
            ">${movie.title}</h1>
            <div class="hero-meta" style="
                display: flex;
                gap: 15px;
                align-items: center;
                margin-bottom: 12px;
                flex-wrap: wrap;
            ">
                <span style="color:#d4af37;font-weight:600;">${movie.year || ''}</span>
                ${rating ? `<span style="color:#46d369;font-weight:600;">⭐ ${rating}</span>` : ''}
                ${genresStr ? `<span style="color:#aaa;font-size:0.9rem;">${genresStr}</span>` : ''}
            </div>
            <p class="hero-description" style="
                font-size: 1rem;
                color: #ccc;
                line-height: 1.6;
                margin-bottom: 20px;
                display: -webkit-box;
                -webkit-line-clamp: 3;
                -webkit-box-orient: vertical;
                overflow: hidden;
                text-shadow: 0 2px 10px rgba(0,0,0,0.9);
                max-width: 500px;
            ">${movie.description || 'No description available'}</p>
            <div class="hero-buttons" style="display:flex;gap:12px;flex-wrap:wrap;">
                <button onclick="openMovie('${movie.title.replace(/'/g, "\\'")}')" style="
                    background: white;
                    color: black;
                    border: none;
                    padding: 12px 30px;
                    border-radius: 8px;
                    font-weight: 700;
                    font-size: 1rem;
                    cursor: pointer;
                    font-family: 'Poppins', sans-serif;
                    transition: transform 0.2s;
                " onmouseover="this.style.transform='scale(1.04)'"
                   onmouseout="this.style.transform='scale(1)'">
                    ▶ More Info
                </button>
                <button onclick="addToMyList('${movie.title.replace(/'/g, "\\'")}', '${movie.poster}')" style="
                    background: rgba(255,255,255,0.15);
                    color: white;
                    border: 1px solid rgba(255,255,255,0.3);
                    padding: 12px 30px;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 1rem;
                    cursor: pointer;
                    font-family: 'Poppins', sans-serif;
                    backdrop-filter: blur(4px);
                    transition: transform 0.2s;
                " onmouseover="this.style.transform='scale(1.04)'"
                   onmouseout="this.style.transform='scale(1)'">
                    + My List
                </button>
            </div>
        `;

        slide.appendChild(bgContainer);
        slide.appendChild(gradLeft);
        slide.appendChild(gradBottom);
        slide.appendChild(content);
        slides.appendChild(slide);

        // ─── DOT INDICATOR ───
        const dot = document.createElement('button');
        dot.className = `hero-dot${index === 0 ? ' active' : ''}`;
        dot.addEventListener('click', () => { goToSlide(index); resetAutoplay(); });
        indicators.appendChild(dot);
    });

    // ─── PROGRESS BAR ───
    const existingBar = document.getElementById('heroProgress');
    if (existingBar) existingBar.remove();

    const progressBar = document.createElement('div');
    progressBar.id = 'heroProgress';
    progressBar.style.cssText = `
        position: absolute;
        bottom: 0;
        left: 0;
        height: 3px;
        background: #e50914;
        z-index: 10;
        width: 0%;
        transition: width ${HERO_INTERVAL}ms linear;
    `;
    document.getElementById('heroBanner').appendChild(progressBar);

    goToSlide(0);
    startAutoplay();
}

/* ── Navigation ── */
function goToSlide(index) {
    if (!heroMovies.length) return;
    if (index < 0) index = heroMovies.length - 1;
    if (index >= heroMovies.length) index = 0;
    currentSlide = index;

    document.querySelectorAll('.hero-slide').forEach((s, i) => {
        s.classList.toggle('active', i === index);
    });
    document.querySelectorAll('.hero-dot').forEach((d, i) => {
        d.classList.toggle('active', i === index);
    });

    const bar = document.getElementById('heroProgress');
    if (bar) {
        bar.style.transition = 'none';
        bar.style.width = '0%';
        setTimeout(() => {
            bar.style.transition = `width ${HERO_INTERVAL}ms linear`;
            bar.style.width = '100%';
        }, 50);
    }
}

function nextSlide() { goToSlide(currentSlide + 1); }
function prevSlide() { goToSlide(currentSlide - 1); }

function startAutoplay() {
    if (slideInterval) clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, HERO_INTERVAL);
    setTimeout(() => {
        const bar = document.getElementById('heroProgress');
        if (bar) {
            bar.style.transition = `width ${HERO_INTERVAL}ms linear`;
            bar.style.width = '100%';
        }
    }, 100);
}

function resetAutoplay() {
    clearInterval(slideInterval);
    startAutoplay();
}

/* ── Event Listeners ── */
document.addEventListener('DOMContentLoaded', () => {
    fetchHeroMovies();

    const prevBtn = document.getElementById('heroPrev');
    const nextBtn = document.getElementById('heroNext');
    if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetAutoplay(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetAutoplay(); });

    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft') { prevSlide(); resetAutoplay(); }
        if (e.key === 'ArrowRight') { nextSlide(); resetAutoplay(); }
    });
});

/* ── Utility ── */
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
fetchHeroMovies();
loadHome();