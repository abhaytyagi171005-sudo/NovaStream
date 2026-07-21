// ===== TMDB CONFIGURATION =====
const TMDB_API_KEY = 'f08c9127f4fa4a8642bffa57c5b8955e';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const IMAGE_BASE_URL_LANDSCAPE = 'https://image.tmdb.org/t/p/w780';

// ===== GENRE MAP =====
const genreMap = {
    28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
    18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History', 27: 'Horror',
    10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV Movie',
    53: 'Thriller', 10752: 'War', 37: 'Western', 10759: 'Action & Adventure',
    10762: 'Kids', 10763: 'News', 10764: 'Reality', 10765: 'Sci-Fi & Fantasy',
    10766: 'Soap', 10767: 'Talk', 10768: 'War & Politics'
};

function getGenres(genreIds) {
    if (!genreIds || !Array.isArray(genreIds)) return [];
    return genreIds.slice(0, 2).map(id => genreMap[id] || 'Unknown');
}

// ===== CREATE MOVIE CARD =====
function createMovieCard(movie, rank = null) {
    const card = document.createElement('div');
    card.className = 'movie-card';

    // Landscape thumbnail URL — prefer backdrop_path (wide key art),
    // fall back to poster_path (rare, for very new titles), then a placeholder
    let posterUrl;
    if (movie.backdrop_path && movie.backdrop_path.startsWith('/')) {
        posterUrl = `${IMAGE_BASE_URL_LANDSCAPE}${movie.backdrop_path}`;
    } else if (movie.poster_path && movie.poster_path.startsWith('/')) {
        posterUrl = `${IMAGE_BASE_URL_LANDSCAPE}${movie.poster_path}`;
    } else {
        posterUrl = `https://via.placeholder.com/300x169/1a1a1a/e50914?text=${encodeURIComponent(movie.title.substring(0, 12))}`;
    }

    const year = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
    const genres = getGenres(movie.genre_ids);

    let html = `<img src="${posterUrl}" alt="${movie.title}" loading="lazy">`;

    if (rank !== null) {
        html += `<div class="rank-badge">#${rank}</div>`;
    }

    html += `
        <div class="card-details">
            <h3>${movie.title}</h3>
            <div class="meta">
                <span class="rating">⭐ ${rating}</span>
                <span class="year">${year}</span>
            </div>
            <div class="genres">
                ${genres.map(g => `<span>${g}</span>`).join('')}
            </div>
            <button class="play-btn">
                <i class="fas fa-play"></i> Play
            </button>
        </div>
    `;

    card.innerHTML = html;

    // Play button click
    card.querySelector('.play-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        alert(`▶️ Now playing: ${movie.title}`);
    });

    // Card click
    card.addEventListener('click', () => {
        console.log(`🎬 Clicked: ${movie.title}`);
    });

    return card;
}

// ===== LOAD SECTION =====
function loadSection(sectionId, movies, showRank = false) {
    const container = document.getElementById(sectionId);
    if (!container) {
        console.error(`❌ Container not found: ${sectionId}`);
        return;
    }

    // Clear container
    container.innerHTML = '';

    if (!movies || movies.length === 0) {
        container.innerHTML = '<div style="color:#666;padding:20px;">No movies available</div>';
        return;
    }

    // Add cards
    movies.forEach((movie, index) => {
        const rank = showRank ? index + 1 : null;
        const card = createMovieCard(movie, rank);
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

        loadSection('top10-shows', topShows.slice(0, 10), true);
        loadSection('new-on-novastream', newShows.slice(0, 15));
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