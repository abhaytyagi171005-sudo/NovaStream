const API = "https://novastream-o3ri.onrender.com/api";
const TMDB_API_KEY = "f08c9127f4fa4a8642bffa57c5b8955e";
let searchType = "all";
let searchTimeout = null;

// ===== PAGINATION VARIABLES =====
let currentPage = 1;
let totalPages = 1;
let isLoading = false;
let currentQuery = "";
let allResults = [];
let hasMoreResults = true;
let retryCount = 0;
const MAX_RETRIES = 3;
const ITEMS_PER_PAGE = 20;
const MAX_PAGES = 10;
let loadingTimeout = null;

const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");
const searchStatus = document.getElementById("searchStatus");

// Pre-fill search if coming from another page
const params = new URLSearchParams(window.location.search);
const preQuery = params.get("q");
if (preQuery) {
    searchInput.value = preQuery;
    doSearch(preQuery);
}

// Input event (auto-search)
searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim();
    clearTimeout(searchTimeout);

    if (query.length < 2) {
        searchResults.innerHTML = "";
        searchStatus.style.display = "block";
        searchStatus.innerHTML = `<h2>🔍 What are you looking for?</h2><p>Start typing to search 5000+ movies and series</p>`;
        return;
    }

    searchStatus.style.display = "none";
    searchTimeout = setTimeout(() => doSearch(query), 400);
});

// Enter key support
searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        const query = searchInput.value.trim();
        if (query.length >= 2) {
            clearTimeout(searchTimeout);
            doSearch(query);
        }
    }
});

function setType(type, btn) {
    searchType = type;
    document.querySelectorAll(".type-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const query = searchInput.value.trim();
    if (query.length >= 2) doSearch(query);
}

// ===== MAIN SEARCH FUNCTION (ADVANCED) =====
async function doSearch(query) {
    console.log("🚀 Searching for:", query);

    // Reset everything
    currentPage = 1;
    totalPages = 1;
    currentQuery = query;
    allResults = [];
    hasMoreResults = true;
    isLoading = false;
    retryCount = 0;

    // Clean up
    hideLoading();
    hideError();
    window.removeEventListener('scroll', handleScroll);

    try {
        searchStatus.style.display = "none";
        searchResults.innerHTML = "";

        // Load first page
        await loadPage(query, 1);

        // Add scroll listener
        window.addEventListener('scroll', handleScroll, { passive: true });

    } catch (err) {
        console.error("Search error:", err);
        searchStatus.style.display = "block";
        searchStatus.innerHTML = `<h2>Error searching</h2><p>${err.message}</p>`;
    }
}

// ===== LOAD PAGE FUNCTION (ADVANCED) =====
async function loadPage(query, page) {
    // Prevent multiple loads
    if (isLoading || !hasMoreResults) return;

    // Check if we've reached max pages
    if (page > MAX_PAGES) {
        hasMoreResults = false;
        return;
    }

    isLoading = true;
    retryCount = 0;

    // Show loading indicator
    if (page > 1) {
        showLoading();
    }

    try {
        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const res = await fetch(
            `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&include_adult=false&page=${page}`,
            { signal: controller.signal }
        );

        clearTimeout(timeoutId);

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        const results = data.results || [];

        if (results.length === 0) {
            hasMoreResults = false;
            isLoading = false;
            hideLoading();
            return;
        }

        totalPages = Math.min(data.total_pages || 1, MAX_PAGES);

        // Filter results
        const filtered = results.filter(item => {
            if (item.media_type !== "movie" && item.media_type !== "tv") return false;
            if (searchType === "movie") return item.media_type === "movie";
            if (searchType === "series") return item.media_type === "tv";
            return true;
        });

        // Remove duplicates and filter posters
        const newResults = filtered.filter(item => {
            const exists = allResults.some(existing => existing.id === item.id);
            return !exists &&
                item.poster_path !== null &&
                item.poster_path !== undefined &&
                item.poster_path !== '';
        });

        // Hide loading
        hideLoading();
        hideError();

        if (newResults.length === 0 && allResults.length === 0) {
            searchStatus.style.display = "block";
            searchStatus.innerHTML = `<h2>No results with posters for "${query}"</h2><p>Try a different search term</p>`;
            isLoading = false;
            hasMoreResults = false;
            return;
        }

        // Add to all results
        allResults = allResults.concat(newResults);

        // Display new results with animation
        displayResultsWithAnimation(newResults);

        // Update current page
        currentPage = page + 1;

        // Check if we have more pages
        if (page >= totalPages || currentPage > MAX_PAGES) {
            hasMoreResults = false;
        }

        isLoading = false;

        // Log progress
        console.log(`📊 Loaded ${allResults.length} results (Page ${page}/${totalPages})`);

    } catch (err) {
        console.error("Load page error:", err);
        hideLoading();

        // Handle abort (timeout)
        if (err.name === 'AbortError') {
            showError('Request timed out. Please try again.');
        } else {
            showError(`Failed to load results: ${err.message}`);
        }

        isLoading = false;
        hasMoreResults = false;
    }
}

// ===== DISPLAY RESULTS WITH ANIMATION =====
function displayResultsWithAnimation(results) {
    results.forEach((item, index) => {
        const title = item.title || item.name;
        const year = (item.release_date || item.first_air_date || '').slice(0, 4);
        const posterUrl = `https://image.tmdb.org/t/p/w500${item.poster_path}`;
        const rating = item.vote_average ? `★ ${item.vote_average.toFixed(1)}` : '';

        const card = document.createElement("div");
        card.className = "search-card";
        card.style.opacity = "0";
        card.style.transform = "translateY(20px)";
        card.style.transition = `opacity 0.3s ease, transform 0.3s ease`;

        card.innerHTML = `
            <img src="${posterUrl}" alt="${title}" onerror="this.style.display='none'">
            <div class="search-card-info">
                <h3>${title}</h3>
                <span>${year || 'N/A'} • ${item.media_type === "tv" ? "📺 Series" : "🎬 Movie"} ${rating ? '• ' + rating : ''}</span>
            </div>
        `;
        card.onclick = () => {
            window.location.href = `search.html?movie=${encodeURIComponent(title)}`;
        };
        searchResults.appendChild(card);

        // Trigger animation with delay
        setTimeout(() => {
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
        }, index * 50);
    });
}

// ===== LOADING INDICATOR FUNCTIONS =====
function showLoading() {
    // Remove existing loading if any
    hideLoading();

    const loadingDiv = document.createElement("div");
    loadingDiv.className = "loading-indicator";
    loadingDiv.id = "loadingIndicator";
    loadingDiv.innerHTML = `
        <div class="loading-spinner"></div>
        <div class="loading-text">Loading more results...</div>
    `;
    searchResults.appendChild(loadingDiv);
}

function hideLoading() {
    const loading = document.getElementById("loadingIndicator");
    if (loading) {
        loading.remove();
    }
}

function showError(message) {
    hideLoading();

    const errorDiv = document.createElement("div");
    errorDiv.className = "loading-indicator";
    errorDiv.id = "errorIndicator";
    errorDiv.innerHTML = `
        <div style="color: #e50914; font-size: 24px; margin-bottom: 10px;">⚠️</div>
        <div class="loading-text" style="color: #e50914;">${message}</div>
        <button class="retry-btn" onclick="retryLoad()">Retry</button>
    `;
    searchResults.appendChild(errorDiv);
}

function hideError() {
    const error = document.getElementById("errorIndicator");
    if (error) {
        error.remove();
    }
}

function retryLoad() {
    hideError();
    if (currentQuery && hasMoreResults) {
        loadPage(currentQuery, currentPage);
    }
}

// ===== SCROLL HANDLER (DEBOUNCED) =====
let scrollTimeout = null;

function handleScroll() {
    // Debounce scroll events
    if (scrollTimeout) {
        clearTimeout(scrollTimeout);
    }

    scrollTimeout = setTimeout(() => {
        if (isLoading || !hasMoreResults) return;

        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const docHeight = document.documentElement.scrollHeight;

        // Load when scrolled to 70% (earlier for smoother experience)
        const threshold = 0.7;
        if (scrollTop + windowHeight >= docHeight * threshold) {
            console.log(`🔄 Loading more at ${Math.round((scrollTop + windowHeight) / docHeight * 100)}%`);
            loadPage(currentQuery, currentPage);
        }
    }, 200); // Wait 200ms after scrolling stops
}



console.log("✅ Search with pagination loaded!");