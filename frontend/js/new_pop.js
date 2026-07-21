// ===== TMDB CONFIGURATION =====
const TMDB_API_KEY = 'f08c9127f4fa4a8642bffa57c5b8955e';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Badge types for New on NovaStream
const BADGES = ['New Episode', 'Watch Now', 'Recently Added'];

// ===== CREATE MOVIE CARD =====
function createMovieCard(movie, type = 'landscape', rank = null) {
    const card = document.createElement('div');
    card.className = 'movie-card';

    // Poster URL
    let posterUrl;
    if (movie.poster_path && movie.poster_path.startsWith('/')) {
        posterUrl = `${IMAGE_BASE_URL}${movie.poster_path}`;
    } else {
        const width = type === 'portrait' ? 180 : 320;
        const height = type === 'portrait' ? 270 : 180;
        posterUrl = `https://via.placeholder.com/${width}x${height}/1a1a1a/e50914?text=${encodeURIComponent(movie.title.substring(0, 12))}`;
    }

    let html = `<img src="${posterUrl}" alt="${movie.title}" loading="lazy">`;

    // PORTRAIT: Big Number Overlay (for Top 10)
    if (type === 'portrait' && rank !== null) {
        html += `<div class="rank-badge">${rank}</div>`;
    }

    // LANDSCAPE: Badge (only for New on NovaStream)
    if (type === 'landscape') {
        // Randomly assign a badge for demo (simulating Netflix-style badges)
        const badgeText = BADGES[Math.floor(Math.random() * BADGES.length)];
        let badgeClass = '';
        if (badgeText === 'New Episode') badgeClass = 'new-episode';
        else if (badgeText === 'Watch Now') badgeClass = 'watch-now';
        else if (badgeText === 'Recently Added') badgeClass = 'recently-added';
        html += `<div class="badge ${badgeClass}">${badgeText}</div>`;
    }

    card.innerHTML = html;

    // Click event
    card.addEventListener('click', () => {
        console.log(`🎬 Clicked: ${movie.title}`);
        alert(`▶️ Now playing: ${movie.title}`);
    });

    return card;
}

// ===== LOAD SECTION =====
function loadSection(sectionId, movies, type = 'landscape', showRank = false) {
    const container = document.getElementById(sectionId);
    if (!container) {
        console.error(`❌ Container not found: ${sectionId}`);
        return;
    }

    container.innerHTML = '';

    if (!movies || movies.length === 0) {
        container.innerHTML = '<div style="color:#666;padding:20px;">No movies available</div>';
        return;
    }

    movies.forEach((movie, index) => {
        const rank = showRank ? index + 1 : null;
        const card = createMovieCard(movie, type, rank);
        container.appendChild(card);
    });

    console.log(`✅ Loaded ${movies.length} movies in ${sectionId}`);
}

// ===== FETCH FROM TMDB =====
async function fetchFromTMDB(endpoint, params = '') {
    try {
        const url = `${TMDB_BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}${params}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error(`❌ Fetch error: ${error}`);
        return [];
    }
}

// ===== LOAD ALL SECTIONS =====
async function loadAllSections() {
    console.log('🚀 Loading NovaStream - New & Popular...');

    try {
        const [
            topShows,
            newShows,
            comingThisWeek,
            worthTheWait,
            comingNextWeek,
            topMovies,
            popularTV,
            popularMovies
        ] = await Promise.all([
            fetchFromTMDB('/trending/tv/week', '&page=1'),
            fetchFromTMDB('/tv/on_the_air', '&page=1'),
            fetchFromTMDB('/movie/upcoming', '&page=1'),
            fetchFromTMDB('/movie/top_rated', '&page=1'),
            fetchFromTMDB('/movie/upcoming', '&page=2'),
            fetchFromTMDB('/trending/movie/week', '&page=1'),
            fetchFromTMDB('/tv/popular', '&page=1'),
            fetchFromTMDB('/movie/popular', '&page=1')
        ]);

        // 1. Top 10 Shows - PORTRAIT with numbers
        loadSection('top10-shows', topShows.slice(0, 10), 'portrait', true);

        // 2. New on NovaStream - LANDSCAPE with badges
        loadSection('new-on-novastream', newShows.slice(0, 15), 'landscape');

        // 3. Coming This Week - LANDSCAPE clean
        loadSection('coming-this-week', comingThisWeek.slice(0, 15), 'landscape');

        // 4. Worth the Wait - LANDSCAPE clean
        loadSection('worth-the-wait', worthTheWait.slice(0, 15), 'landscape');

        // 5. Coming Next Week - LANDSCAPE clean
        loadSection('coming-next-week', comingNextWeek.slice(0, 15), 'landscape');

        // 6. Top 10 Movies - PORTRAIT with numbers
        loadSection('top10-movies', topMovies.slice(0, 10), 'portrait', true);

        // 7. Most Popular TV Shows - LANDSCAPE clean
        loadSection('popular-tvshows', popularTV.slice(0, 15), 'landscape');

        // 8. Most Popular Movies - LANDSCAPE clean
        loadSection('popular-movies', popularMovies.slice(0, 15), 'landscape');

    } catch (error) {
        console.error('❌ Error loading sections:', error);
        loadSampleData();
    }
}

// ===== SAMPLE DATA (Fallback) =====
function loadSampleData() {
    console.log('📦 Loading sample data...');

    const sampleMovies = [
        { id: 1, title: 'House of the Dragon', poster_path: null, vote_average: 8.5, release_date: '2024-01-01', genre_ids: [18, 10765] },
        { id: 2, title: 'The Last of Us', poster_path: null, vote_average: 8.9, release_date: '2024-02-01', genre_ids: [18, 10765] },
        { id: 3, title: 'Silo', poster_path: null, vote_average: 8.2, release_date: '2024-03-01', genre_ids: [878, 18] },
        { id: 4, title: 'The Bear', poster_path: null, vote_average: 8.8, release_date: '2024-04-01', genre_ids: [35, 18] },
        { id: 5, title: 'Fallout', poster_path: null, vote_average: 8.4, release_date: '2024-05-01', genre_ids: [18, 10765] },
        { id: 6, title: 'The Penguin', poster_path: null, vote_average: 8.1, release_date: '2024-06-01', genre_ids: [18, 80] },
        { id: 7, title: 'Dune: Prophecy', poster_path: null, vote_average: 7.8, release_date: '2024-07-01', genre_ids: [18, 878] },
        { id: 8, title: 'Shogun', poster_path: null, vote_average: 9.0, release_date: '2024-08-01', genre_ids: [18, 36] },
        { id: 9, title: 'The Gentlemen', poster_path: null, vote_average: 8.0, release_date: '2024-09-01', genre_ids: [35, 80] },
        { id: 10, title: 'The Crown', poster_path: null, vote_average: 8.7, release_date: '2024-10-01', genre_ids: [18, 36] },
    ];

    const sections = [
        { id: 'top10-shows', type: 'portrait', showRank: true },
        { id: 'new-on-novastream', type: 'landscape', showRank: false },
        { id: 'coming-this-week', type: 'landscape', showRank: false },
        { id: 'worth-the-wait', type: 'landscape', showRank: false },
        { id: 'coming-next-week', type: 'landscape', showRank: false },
        { id: 'top10-movies', type: 'portrait', showRank: true },
        { id: 'popular-tvshows', type: 'landscape', showRank: false },
        { id: 'popular-movies', type: 'landscape', showRank: false }
    ];

    sections.forEach((section, index) => {
        const movies = sampleMovies.map((movie, i) => ({
            ...movie,
            id: movie.id + (index * 100),
            title: `${movie.title}`,
        }));
        loadSection(section.id, movies.slice(0, 10), section.type, section.showRank);
    });
}

// ===== NAVBAR SCROLL EFFECT =====
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 10) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// ===== INIT =====
console.log('🎬 NovaStream - New & Popular');
loadAllSections();