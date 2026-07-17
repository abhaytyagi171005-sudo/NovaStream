// TMDB Configuration
const TMDB_API_KEY = 'f08c9127f4fa4a8642bffa57c5b8955e'; // Replace with your actual API key
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Sample data for demonstration (replace with actual API calls)
// This data structure matches what TMDB returns
const sampleData = {
    'top10-shows': [
        { id: 1, title: 'The Crown', poster_path: '/path1.jpg', vote_average: 8.7, release_date: '2023-12-14', genre_ids: [18, 36] },
        { id: 2, title: 'Stranger Things', poster_path: '/path2.jpg', vote_average: 8.9, release_date: '2023-07-01', genre_ids: [18, 10765] },
        // Add more items...
    ],
    'new-on-novastream': [],
    'coming-this-week': [],
    'worth-the-wait': [],
    'upcoming-shows': [],
    'upcoming-movies': [],
    'popular-tvshows': [],
    'popular-movies': []
};

// Genre mapping
const genreMap = {
    28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
    18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History', 27: 'Horror',
    10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV Movie',
    53: 'Thriller', 10752: 'War', 37: 'Western', 10759: 'Action & Adventure',
    10762: 'Kids', 10763: 'News', 10764: 'Reality', 10765: 'Sci-Fi & Fantasy',
    10766: 'Soap', 10767: 'Talk', 10768: 'War & Politics'
};

// Function to get genre names from IDs
function getGenres(genreIds) {
    if (!genreIds) return [];
    return genreIds.slice(0, 2).map(id => genreMap[id] || 'Unknown');
}

// Function to create a movie card element
function createMovieCard(movie, rank = null) {
    const card = document.createElement('div');
    card.className = 'movie-card';

    // Get poster URL
    const posterUrl = movie.poster_path
        ? `${IMAGE_BASE_URL}${movie.poster_path}`
        : 'https://via.placeholder.com/200x300/2a2a2a/666666?text=No+Poster';

    // Get year from release date
    const year = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';

    // Get rating (TMDB rating is out of 10)
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';

    // Get genres
    const genres = getGenres(movie.genre_ids || []);

    // Build card HTML
    let html = `<img src="${posterUrl}" alt="${movie.title}" loading="lazy">`;

    // Add rank badge for Top 10
    if (rank !== null) {
        html += `<div class="rank-badge">#${rank}</div>`;
    }

    // Add details overlay
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

    // Add click event to play button
    card.querySelector('.play-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        console.log(`Playing: ${movie.title}`);
        // Here you can redirect to video player page
        alert(`Now playing: ${movie.title}`);
    });

    // Add click event to card (for more details)
    card.addEventListener('click', () => {
        console.log(`Movie clicked: ${movie.title}`);
        // Here you can navigate to movie details page
    });

    return card;
}

// Function to load movies into a section
function loadSection(sectionId, movies, showRank = false) {
    const container = document.getElementById(sectionId);
    if (!container) return;

    container.innerHTML = '';

    movies.forEach((movie, index) => {
        const rank = showRank ? index + 1 : null;
        const card = createMovieCard(movie, rank);
        container.appendChild(card);
    });
}

// Function to fetch data from TMDB
async function fetchFromTMDB(endpoint, params = '') {
    try {
        const url = `${TMDB_BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}${params}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error(`Error fetching from TMDB: ${error}`);
        return [];
    }
}

// Function to load all sections with real data from TMDB
async function loadAllSections() {
    try {
        // Show loading state
        document.querySelectorAll('.scroll-container').forEach(container => {
            container.innerHTML = `<div style="color: #666; padding: 20px;">Loading...</div>`;
        });

        // 1. Top 10 Shows in India Today (Using trending TV shows)
        const topShows = await fetchFromTMDB('/trending/tv/week', '&page=1');
        loadSection('top10-shows', topShows.slice(0, 10), true);

        // 2. New on NovaStream (Using new TV shows)
        const newShows = await fetchFromTMDB('/tv/on_the_air', '&page=1');
        loadSection('new-on-novastream', newShows.slice(0, 15));

        // 3. Coming This Week (Using upcoming movies)
        const comingThisWeek = await fetchFromTMDB('/movie/upcoming', '&page=1');
        loadSection('coming-this-week', comingThisWeek.slice(0, 15));

        // 4. Worth the Wait (Using top rated movies)
        const worthTheWait = await fetchFromTMDB('/movie/top_rated', '&page=1');
        loadSection('worth-the-wait', worthTheWait.slice(0, 15));

        // 5. Upcoming Shows (Using upcoming TV shows)
        const upcomingShows = await fetchFromTMDB('/tv/airing_today', '&page=1');
        loadSection('upcoming-shows', upcomingShows.slice(0, 15));

        // 6. Upcoming Movies (Using upcoming movies)
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
        // If API fails, load sample data
        loadSampleData();
    }
}

// Fallback function with sample data (for demonstration)
function loadSampleData() {
    // Create some sample movies
    const sampleMovies = [
        { id: 1, title: 'Sample Movie 1', poster_path: null, vote_average: 8.5, release_date: '2024-01-01', genre_ids: [28, 18] },
        { id: 2, title: 'Sample Movie 2', poster_path: null, vote_average: 7.8, release_date: '2024-02-01', genre_ids: [35, 10749] },
        { id: 3, title: 'Sample Movie 3', poster_path: null, vote_average: 9.0, release_date: '2024-03-01', genre_ids: [878, 12] },
        { id: 4, title: 'Sample Movie 4', poster_path: null, vote_average: 8.2, release_date: '2024-04-01', genre_ids: [18, 36] },
        { id: 5, title: 'Sample Movie 5', poster_path: null, vote_average: 7.5, release_date: '2024-05-01', genre_ids: [27, 53] },
        { id: 6, title: 'Sample Movie 6', poster_path: null, vote_average: 8.9, release_date: '2024-06-01', genre_ids: [16, 10751] },
        { id: 7, title: 'Sample Movie 7', poster_path: null, vote_average: 7.2, release_date: '2024-07-01', genre_ids: [80, 18] },
        { id: 8, title: 'Sample Movie 8', poster_path: null, vote_average: 8.1, release_date: '2024-08-01', genre_ids: [35, 14] },
        { id: 9, title: 'Sample Movie 9', poster_path: null, vote_average: 6.9, release_date: '2024-09-01', genre_ids: [53, 28] },
        { id: 10, title: 'Sample Movie 10', poster_path: null, vote_average: 9.2, release_date: '2024-10-01', genre_ids: [18, 10749] },
    ];

    // Load sample data into all sections
    const sectionIds = [
        'top10-shows', 'new-on-novastream', 'coming-this-week',
        'worth-the-wait', 'upcoming-shows', 'upcoming-movies',
        'popular-tvshows', 'popular-movies'
    ];

    sectionIds.forEach((id, index) => {
        const isTop10 = id === 'top10-shows';
        // Add some variation to sample data
        const movies = sampleMovies.map((movie, i) => ({
            ...movie,
            id: movie.id + (index * 100),
            title: `${movie.title} ${index + 1}`,
            release_date: `2024-${String(index + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`
        }));
        loadSection(id, movies.slice(0, 15), isTop10);
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
// Replace 'YOUR_API_KEY_HERE' with your actual TMDB API key
// If you don't have one, the sample data will load automatically

// Check if API key is set
if (TMDB_API_KEY === 'YOUR_API_KEY_HERE') {
    console.warn('⚠️ Please set your TMDB API key in new_pop.js');
    loadSampleData();
} else {
    // Load real data from TMDB
    loadAllSections();
}

// Auto-scroll buttons (optional - adds scroll arrows to each section)
function addScrollButtons() {
    document.querySelectorAll('.scroll-container').forEach(container => {
        // You can add left/right scroll buttons here if needed
        // For now, we'll just enable smooth native scrolling
    });
}

// Initialize scroll buttons
addScrollButtons();

console.log('📺 NovaStream - New & Popular page loaded successfully!');