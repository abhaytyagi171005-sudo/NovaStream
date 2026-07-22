// ===== TMDB CONFIGURATION =====
const TMDB_API_KEY = 'f08c9127f4fa4a8642bffa57c5b8955e';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';           // portrait posters
const IMAGE_BASE_URL_LANDSCAPE = 'https://image.tmdb.org/t/p/w780'; // landscape backdrops

// ===== IMAGE URL HELPERS =====
function getImageUrl(movie, orientation) {
    if (orientation === 'portrait') {
        if (movie.poster_path && movie.poster_path.startsWith('/')) {
            return `${IMAGE_BASE_URL}${movie.poster_path}`;
        }
        return `https://via.placeholder.com/220x330/1a1a1a/e50914?text=${encodeURIComponent(movie.title.substring(0, 12))}`;
    }

    // landscape (default)
    if (movie.backdrop_path && movie.backdrop_path.startsWith('/')) {
        return `${IMAGE_BASE_URL_LANDSCAPE}${movie.backdrop_path}`;
    } else if (movie.poster_path && movie.poster_path.startsWith('/')) {
        return `${IMAGE_BASE_URL_LANDSCAPE}${movie.poster_path}`;
    }
    return `https://via.placeholder.com/300x169/1a1a1a/e50914?text=${encodeURIComponent(movie.title.substring(0, 12))}`;
}

// ===== BADGE HELPER =====
// NOTE: TMDB has no "new episode" / "recently added" field on these endpoints.
// This alternates badge styles by index purely for visual variety, matching
// the reference screenshots. Swap this for real data (e.g. your own watch/
// episode metadata) whenever you have it.
function getBadgeHTML(index) {
    const isNewEpisode = index % 2 === 0;
    if (isNewEpisode) {
        return `
            <div class="badges">
                <span class="badge badge-new">New Episode</span>
                <span class="badge badge-watch">Watch Now</span>
            </div>`;
    }
    return `
        <div class="badges">
            <span class="badge badge-added">Recently Added</span>
        </div>`;
}

// ===== CREATE MOVIE CARD =====
// options:
//   rank        - number | null  -> wraps card with a giant rank number (Top 10 rows)
//   showBadges  - boolean        -> shows always-visible badge pills
//   index       - number         -> used for badge variety
//   orientation - 'landscape' | 'portrait'
function createMovieCard(movie, options = {}) {
    const {
        rank = null,
        showBadges = false,
        index = 0,
        orientation = 'landscape'
    } = options;

    const card = document.createElement('div');
    card.className = 'movie-card' + (orientation === 'portrait' ? ' portrait' : '') + (showBadges ? ' with-badges' : '');

    const imgUrl = getImageUrl(movie, orientation);
    let html = `<img src="${imgUrl}" alt="${movie.title}" loading="lazy">`;

    if (showBadges) {
        html += getBadgeHTML(index);
    }

    card.innerHTML = html;

    card.addEventListener('click', () => {
        console.log(`🎬 Clicked: ${movie.title}`);
    });

    // Top 10 rows: wrap the card with a giant overlapping rank number
    if (rank !== null) {
        const wrapper = document.createElement('div');
        wrapper.className = 'top10-item';

        const rankNumber = document.createElement('span');
        rankNumber.className = 'rank-number';
        rankNumber.textContent = rank;

        wrapper.appendChild(rankNumber);
        wrapper.appendChild(card);
        return wrapper;
    }

    return card;
}

// ===== LOAD SECTION =====
// config: { showRank, showBadges, orientation }
function loadSection(sectionId, movies, config = {}) {
    const { showRank = false, showBadges = false, orientation = 'landscape' } = config;

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
        const card = createMovieCard(movie, { rank, showBadges, index, orientation });
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
            upcomingShows,
            upcomingMovies,
            popularTV,
            popularMovies
        ] = await Promise.all([
            fetchFromTMDB('/trending/tv/week', '&page=1'),
            fetchFromTMDB('/tv/on_the_air', '&page=1'),
            fetchFromTMDB('/movie/upcoming', '&page=1'),
            fetchFromTMDB('/movie/top_rated', '&page=1'),
            fetchFromTMDB('/tv/airing_today', '&page=1'),
            fetchFromTMDB('/movie/upcoming', '&page=2'),
            fetchFromTMDB('/tv/popular', '&page=1'),
            fetchFromTMDB('/movie/popular', '&page=1')
        ]);

        // Section 1: Top 10 -> portrait posters + giant rank numbers
        loadSection('top10-shows', topShows.slice(0, 10), { showRank: true, orientation: 'portrait' });

        // Section 2: New on NovaStream -> landscape + always-visible badges
        loadSection('new-on-novastream', newShows.slice(0, 15), { showBadges: true });

        // Sections 3-8: plain landscape cards, no badges
        loadSection('coming-this-week', comingThisWeek.slice(0, 15));
        loadSection('worth-the-wait', worthTheWait.slice(0, 15));
        loadSection('upcoming-shows', upcomingShows.slice(0, 15));
        loadSection('upcoming-movies', upcomingMovies.slice(0, 15));
        loadSection('popular-tvshows', popularTV.slice(0, 15));
        loadSection('popular-movies', popularMovies.slice(0, 15));

    } catch (error) {
        console.error('❌ Error loading sections:', error);
        loadSampleData();
    }
}

// ===== SAMPLE DATA (Fallback) =====
function loadSampleData() {
    console.log('📦 Loading sample data...');

    const sampleMovies = [
        { id: 1, title: 'House of the Dragon', backdrop_path: null, poster_path: null, vote_average: 8.5, release_date: '2024-01-01', genre_ids: [18, 10765] },
        { id: 2, title: 'The Last of Us', backdrop_path: null, poster_path: null, vote_average: 8.9, release_date: '2024-02-01', genre_ids: [18, 10765] },
        { id: 3, title: 'Silo', backdrop_path: null, poster_path: null, vote_average: 8.2, release_date: '2024-03-01', genre_ids: [878, 18] },
        { id: 4, title: 'The Bear', backdrop_path: null, poster_path: null, vote_average: 8.8, release_date: '2024-04-01', genre_ids: [35, 18] },
        { id: 5, title: 'Fallout', backdrop_path: null, poster_path: null, vote_average: 8.4, release_date: '2024-05-01', genre_ids: [18, 10765] },
        { id: 6, title: 'The Penguin', backdrop_path: null, poster_path: null, vote_average: 8.1, release_date: '2024-06-01', genre_ids: [18, 80] },
        { id: 7, title: 'Dune: Prophecy', backdrop_path: null, poster_path: null, vote_average: 7.8, release_date: '2024-07-01', genre_ids: [18, 878] },
        { id: 8, title: 'Shogun', backdrop_path: null, poster_path: null, vote_average: 9.0, release_date: '2024-08-01', genre_ids: [18, 36] },
        { id: 9, title: 'The Gentlemen', backdrop_path: null, poster_path: null, vote_average: 8.0, release_date: '2024-09-01', genre_ids: [35, 80] },
        { id: 10, title: 'The Crown', backdrop_path: null, poster_path: null, vote_average: 8.7, release_date: '2024-10-01', genre_ids: [18, 36] },
    ];

    loadSection('top10-shows', sampleMovies, { showRank: true, orientation: 'portrait' });
    loadSection('new-on-novastream', sampleMovies, { showBadges: true });
    loadSection('coming-this-week', sampleMovies);
    loadSection('worth-the-wait', sampleMovies);
    loadSection('upcoming-shows', sampleMovies);
    loadSection('upcoming-movies', sampleMovies);
    loadSection('popular-tvshows', sampleMovies);
    loadSection('popular-movies', sampleMovies);
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