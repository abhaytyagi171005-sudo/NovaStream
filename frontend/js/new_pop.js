// TMDB Configuration
const TMDB_API_KEY = 'f08c9127f4fa4a8642bffa57c5b8955e';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Genre mapping
const genreMap = {
    28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
    18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History', 27: 'Horror',
    10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV Movie',
    53: 'Thriller', 10752: 'War', 37: 'Western', 10759: 'Action & Adventure',
    10762: 'Kids', 10763: 'News', 10764: 'Reality', 10765: 'Sci-Fi & Fantasy',
    10766: 'Soap', 10767: 'Talk', 10768: 'War & Politics'
};

function getGenres(genreIds) {
    if (!genreIds) return [];
    return genreIds.slice(0, 2).map(id => genreMap[id] || 'Unknown');
}

function createMovieCard(movie, rank = null) {
    const card = document.createElement('div');
    card.className = 'movie-card';

    // CRITICAL: Force card to be inline and flexible
    card.style.display = 'inline-block';
    card.style.flex = '0 0 200px';
    card.style.minWidth = '200px';
    card.style.maxWidth = '200px';
    card.style.height = '300px';
    card.style.marginRight = '0px';
    card.style.borderRadius = '8px';
    card.style.overflow = 'hidden';
    card.style.position = 'relative';
    card.style.cursor = 'pointer';
    card.style.background = '#2a2a2a';
    card.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';

    const posterUrl = movie.poster_path && movie.poster_path.startsWith('/')
        ? `${IMAGE_BASE_URL}${movie.poster_path}`
        : `https://via.placeholder.com/200x300/2a2a2a/e50914?text=${encodeURIComponent(movie.title.substring(0, 15))}`;

    const year = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
    const genres = getGenres(movie.genre_ids || []);

    let html = `<img src="${posterUrl}" alt="${movie.title}" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block;">`;

    if (rank !== null) {
        html += `<div class="rank-badge" style="position:absolute;top:10px;left:10px;background:rgba(0,0,0,0.8);color:#ffd700;font-size:28px;font-weight:800;padding:4px 12px;border-radius:4px;z-index:5;text-shadow:0 2px 8px rgba(0,0,0,0.5);">#${rank}</div>`;
    }

    html += `
        <div class="card-details" style="position:absolute;bottom:0;left:0;right:0;padding:40px 14px 16px 14px;background:linear-gradient(0deg,rgba(0,0,0,0.95) 0%,rgba(0,0,0,0.5) 50%,transparent 100%);transform:translateY(20%);opacity:0;transition:transform 0.4s ease,opacity 0.4s ease;">
            <h3 style="font-size:15px;font-weight:600;margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#fff;">${movie.title}</h3>
            <div class="meta" style="display:flex;align-items:center;gap:8px;font-size:12px;color:#aaa;margin-bottom:6px;">
                <span class="rating" style="color:#ffd700;font-weight:600;">⭐ ${rating}</span>
                <span class="year" style="color:#aaa;">${year}</span>
            </div>
            <div class="genres" style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px;">
                ${genres.map(g => `<span style="font-size:10px;padding:2px 8px;background:rgba(255,255,255,0.15);border-radius:12px;color:#ccc;">${g}</span>`).join('')}
            </div>
            <button class="play-btn" style="display:inline-flex;align-items:center;gap:6px;padding:4px 14px;background:#fff;color:#000;border:none;border-radius:4px;font-size:12px;font-weight:600;cursor:pointer;transition:background 0.3s;">
                <i class="fas fa-play"></i> Play
            </button>
        </div>
    `;

    card.innerHTML = html;

    // Hover effect for details
    card.addEventListener('mouseenter', () => {
        const details = card.querySelector('.card-details');
        if (details) {
            details.style.transform = 'translateY(0)';
            details.style.opacity = '1';
        }
        card.style.transform = 'scale(1.05)';
        card.style.zIndex = '10';
        card.style.boxShadow = '0 10px 40px rgba(0,0,0,0.8)';
    });

    card.addEventListener('mouseleave', () => {
        const details = card.querySelector('.card-details');
        if (details) {
            details.style.transform = 'translateY(20%)';
            details.style.opacity = '0';
        }
        card.style.transform = 'scale(1)';
        card.style.zIndex = 'auto';
        card.style.boxShadow = 'none';
    });

    card.querySelector('.play-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        console.log(`Playing: ${movie.title}`);
        alert(`Now playing: ${movie.title}`);
    });

    card.addEventListener('click', () => {
        console.log(`Movie clicked: ${movie.title}`);
    });

    return card;
}

function loadSection(sectionId, movies, showRank = false) {
    const container = document.getElementById(sectionId);
    if (!container) {
        console.error(`Container not found: ${sectionId}`);
        return;
    }

    // CRITICAL: Force container to be horizontal flex
    container.style.display = 'flex';
    container.style.flexDirection = 'row';
    container.style.flexWrap = 'nowrap';
    container.style.overflowX = 'auto';
    container.style.overflowY = 'hidden';
    container.style.gap = '12px';
    container.style.padding = '10px 0 20px 0';
    container.style.width = '100%';
    container.style.minHeight = '220px';
    container.style.scrollBehavior = 'smooth';

    container.innerHTML = '';

    if (!movies || movies.length === 0) {
        container.innerHTML = '<div style="color: #666; padding: 20px; white-space: nowrap;">No movies available</div>';
        return;
    }

    const fragment = document.createDocumentFragment();
    movies.forEach((movie, index) => {
        const rank = showRank ? index + 1 : null;
        const card = createMovieCard(movie, rank);
        fragment.appendChild(card);
    });

    container.appendChild(fragment);
    console.log(`✅ Loaded ${movies.length} movies in ${sectionId}`);
}

async function fetchFromTMDB(endpoint, params = '') {
    try {
        const url = `${TMDB_BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}${params}`;
        console.log(`📡 Fetching: ${url}`);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error(`Error fetching from TMDB: ${error}`);
        return [];
    }
}

async function loadAllSections() {
    try {
        // Show loading state
        document.querySelectorAll('.scroll-container').forEach(container => {
            container.innerHTML = `<div style="color: #666; padding: 20px;">Loading...</div>`;
            // Ensure container is flex even during loading
            container.style.display = 'flex';
            container.style.flexDirection = 'row';
            container.style.flexWrap = 'nowrap';
            container.style.overflowX = 'auto';
        });

        console.log('🚀 Fetching data from TMDB...');

        // 1. Top 10 Shows in India Today
        const topShows = await fetchFromTMDB('/trending/tv/week', '&page=1');
        loadSection('top10-shows', topShows.slice(0, 10), true);

        // 2. New on NovaStream
        const newShows = await fetchFromTMDB('/tv/on_the_air', '&page=1');
        loadSection('new-on-novastream', newShows.slice(0, 15));

        // 3. Coming This Week
        const comingThisWeek = await fetchFromTMDB('/movie/upcoming', '&page=1');
        loadSection('coming-this-week', comingThisWeek.slice(0, 15));

        // 4. Worth the Wait
        const worthTheWait = await fetchFromTMDB('/movie/top_rated', '&page=1');
        loadSection('worth-the-wait', worthTheWait.slice(0, 15));

        // 5. Upcoming Shows
        const upcomingShows = await fetchFromTMDB('/tv/airing_today', '&page=1');
        loadSection('upcoming-shows', upcomingShows.slice(0, 15));

        // 6. Upcoming Movies
        const upcomingMovies = await fetchFromTMDB('/movie/upcoming', '&page=2');
        loadSection('upcoming-movies', upcomingMovies.slice(0, 15));

        // 7. Most Popular TV Shows
        const popularTV = await fetchFromTMDB('/tv/popular', '&page=1');
        loadSection('popular-tvshows', popularTV.slice(0, 15));

        // 8. Most Popular Movies
        const popularMovies = await fetchFromTMDB('/movie/popular', '&page=1');
        loadSection('popular-movies', popularMovies.slice(0, 15));

    } catch (error) {
        console.error('Error loading sections:', error);
        loadSampleData();
    }
}

function loadSampleData() {
    const sampleMovies = [
        { id: 1, title: 'House of the Dragon', poster_path: null, vote_average: 8.5, release_date: '2024-01-01', genre_ids: [18, 10765] },
        { id: 2, title: 'The Last of Us', poster_path: null, vote_average: 8.9, release_date: '2024-02-01', genre_ids: [18, 10765] },
        { id: 3, title: 'Silo', poster_path: null, vote_average: 8.2, release_date: '2024-03-01', genre_ids: [878, 18] },
        { id: 4, title: 'The Bear', poster_path: null, vote_average: 8.8, release_date: '2024-04-01', genre_ids: [35, 18] },
        { id: 5, title: 'Fallout', poster_path: null, vote_average: 8.4, release_date: '2024-05-01', genre_ids: [18, 10765] },
        { id: 6, title: 'The Penguin', poster_path: null, vote_average: 8.1, release_date: '2024-06-01', genre_ids: [18, 80] },
        { id: 7, title: 'Dune: Prophecy', poster_path: null, vote_average: 7.8, release_date: '2024-07-01', genre_ids: [18, 878] },
        { id: 8, title: 'The Acolyte', poster_path: null, vote_average: 7.2, release_date: '2024-08-01', genre_ids: [18, 10765] },
        { id: 9, title: 'Shogun', poster_path: null, vote_average: 9.0, release_date: '2024-09-01', genre_ids: [18, 36] },
        { id: 10, title: 'The Gentlemen', poster_path: null, vote_average: 8.0, release_date: '2024-10-01', genre_ids: [35, 80] },
    ];

    const sectionIds = [
        'top10-shows', 'new-on-novastream', 'coming-this-week',
        'worth-the-wait', 'upcoming-shows', 'upcoming-movies',
        'popular-tvshows', 'popular-movies'
    ];

    sectionIds.forEach((id, index) => {
        const isTop10 = id === 'top10-shows';
        const movies = sampleMovies.map((movie, i) => ({
            ...movie,
            id: movie.id + (index * 100),
            title: `${movie.title}`,
        }));
        loadSection(id, movies.slice(0, 10), isTop10);
    });
}

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 10) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// ========== INITIALIZE ==========
console.log('🚀 NovaStream - New & Popular page loading...');

if (TMDB_API_KEY === 'YOUR_API_KEY_HERE') {
    console.warn('⚠️ Using sample data (no API key set)');
    loadSampleData();
} else {
    loadAllSections();
}

console.log('✅ NovaStream - New & Popular page loaded successfully!');