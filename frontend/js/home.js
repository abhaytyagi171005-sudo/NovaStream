const API = "https://novastream-o3ri.onrender.com/api";

// ── HERO SYSTEM ──────────────────────────────────────────────
let currentSlide = 0;
let slideInterval = null;
let heroMovies = [];
const HERO_INTERVAL = 8000;

/* ── Fetch Hero Movies from Backend ── */
async function fetchHeroMovies() {
    try {
        const response = await fetch('https://novastream-o3ri.onrender.com/api/hero');

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (data && data.length > 0) {
            heroMovies = data.map(m => ({
                title: m.title,
                year: m.year,
                description: m.description || m.Plot || "No description available",
                poster: m.poster || m.Poster || "N/A",
                backdrop: m.backdrop || m.Backdrop || m.poster || m.Poster || "N/A",
                rating: m.rating || m.imdbRating || "N/A",
                genres: m.genre || (m.genres || []).join(' • ') || 'Movie',
                trailerKey: m.trailerKey || m.videoKey || null,
                language: m.language || "en"
            }));
            buildHero();
            return;
        }

        console.log('No hero data, fetching from trending...');
        await fetchHeroFromTrending();

    } catch (error) {
        console.error('Hero fetch failed:', error);
        await fetchHeroFromTrending();
    }
}

/* ── Fallback: Fetch from Trending ── */
async function fetchHeroFromTrending() {
    try {
        const res = await fetch(`${API}/trending?type=movie&limit=50`);
        const data = await res.json();

        const withBackdrop = data.filter(m =>
            m.Backdrop && m.Backdrop !== 'N/A' && m.Backdrop !== '' &&
            m.Poster && m.Poster !== 'N/A'
        );

        if (withBackdrop.length === 0) {
            useFallbackHero();
            return;
        }

        const shuffled = [...withBackdrop].sort(() => Math.random() - 0.5);
        heroMovies = shuffled.slice(0, 5).map(m => ({
            title: m.Title,
            year: m.Year,
            description: m.Plot || "No description available",
            poster: m.Poster,
            backdrop: m.Backdrop,
            rating: m.imdbRating || "N/A",
            genres: (m.genres || []).slice(0, 2).join(' • ') || 'Movie',
            trailerKey: m.trailerKey || null,
            language: m.Language || "en"
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
            trailerKey: null,
            language: "en"
        },
        {
            title: "The Dark Knight",
            year: "2008",
            description: "When the Joker wreaks havoc on Gotham, Batman must confront one of the greatest tests of his abilities.",
            backdrop: "https://image.tmdb.org/t/p/original/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg",
            poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
            rating: "9.0",
            genres: "Action • Crime",
            trailerKey: null,
            language: "en"
        },
        {
            title: "Inception",
            year: "2010",
            description: "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea.",
            backdrop: "https://image.tmdb.org/t/p/original/s3TBrgb1vv2QPEdn9c7H3uU3cYr.jpg",
            poster: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
            rating: "8.8",
            genres: "Sci-Fi • Thriller",
            trailerKey: null,
            language: "en"
        },
        {
            title: "Interstellar",
            year: "2014",
            description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
            backdrop: "https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg",
            poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
            rating: "8.6",
            genres: "Sci-Fi • Drama",
            trailerKey: null,
            language: "en"
        },
        {
            title: "Oppenheimer",
            year: "2023",
            description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
            backdrop: "https://image.tmdb.org/t/p/original/rLb2cwF3Pazuxaj0sRXQ037tGI1.jpg",
            poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
            rating: "8.3",
            genres: "Drama • History",
            trailerKey: null,
            language: "en"
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

        // ── BACKGROUND ──
        const bgContainer = document.createElement('div');
        bgContainer.className = 'hero-bg-container';

        const posterUrl = movie.backdrop || movie.poster || '';
        const trailerKey = movie.trailerKey || null;

        if (trailerKey) {
            // YouTube embed
            const iframe = document.createElement('iframe');
            iframe.src = `https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&mute=1&loop=1&playlist=${trailerKey}&start=5&end=13&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&playsinline=1`;
            iframe.allow = 'autoplay; encrypted-media; fullscreen';
            iframe.allowFullscreen = true;
            bgContainer.appendChild(iframe);
        } else if (posterUrl) {
            // Poster image
            const img = document.createElement('img');
            img.src = posterUrl;
            img.alt = movie.title;
            img.loading = 'lazy';
            bgContainer.appendChild(img);
        }

        slide.appendChild(bgContainer);

        // ── GRADIENTS ──
        const gradLeft = document.createElement('div');
        gradLeft.className = 'hero-gradient-left';
        slide.appendChild(gradLeft);

        const gradBottom = document.createElement('div');
        gradBottom.className = 'hero-gradient-bottom';
        slide.appendChild(gradBottom);

        // ── CONTENT ──
        const content = document.createElement('div');
        content.className = 'hero-content';

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
            <h2 class="hero-title">${movie.title}</h2>
            <div class="hero-meta">
                <span class="hero-year">${movie.year || ''}</span>
                ${rating ? `<span class="hero-rating">⭐ ${rating}</span>` : ''}
                ${genresStr ? `<span class="hero-genre">${genresStr}</span>` : ''}
                ${movie.language && movie.language !== 'en' ? `<span class="hero-genre">${movie.language.toUpperCase()}</span>` : ''}
            </div>
            <p class="hero-description">${movie.description || 'No description available'}</p>
            <div class="hero-buttons">
                <button onclick="openMovie('${movie.title.replace(/'/g, "\\'")}')" class="hero-btn-play">
                    ▶ More Info
                </button>
                <button onclick="addToMyList('${movie.title.replace(/'/g, "\\'")}', '${movie.poster}')" class="hero-btn-mylist">
                    + My List
                </button>
            </div>
        `;

        slide.appendChild(content);
        slides.appendChild(slide);

        // ── DOT ──
        const dot = document.createElement('button');
        dot.className = `hero-dot${index === 0 ? ' active' : ''}`;
        dot.addEventListener('click', () => { goToSlide(index); resetAutoplay(); });
        indicators.appendChild(dot);
    });

    // ── PROGRESS BAR ──
    const existingBar = document.getElementById('heroProgress');
    if (existingBar) existingBar.remove();

    const progressBar = document.createElement('div');
    progressBar.id = 'heroProgress';
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
    if (typeof attachPreviews === 'function') {
        attachPreviews();
    }
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
    if (typeof attachPreviews === 'function') {
        attachPreviews();
    }
}

// ── Initialize ──
fetchHeroMovies();
loadHome();