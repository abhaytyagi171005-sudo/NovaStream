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

// ===== MAIN SEARCH FUNCTION =====
async function doSearch(query) {
    console.log("Searching for:", query);

    // Reset pagination for new search
    currentPage = 1;
    totalPages = 1;
    currentQuery = query;
    allResults = [];
    hasMoreResults = true;
    isLoading = false;

    // Remove old scroll listener if exists
    window.removeEventListener('scroll', handleScroll);

    try {
        searchStatus.style.display = "none";
        searchResults.innerHTML = "";

        // Load first page
        await loadPage(query, 1);

        // Add scroll listener for loading more
        window.addEventListener('scroll', handleScroll);

    } catch (err) {
        console.error("Search error:", err);
        searchStatus.style.display = "block";
        searchStatus.innerHTML = `<h2>Error searching</h2><p>${err.message}</p>`;
    }
}

// ===== LOAD PAGE FUNCTION =====
async function loadPage(query, page) {
    if (isLoading || !hasMoreResults) return;

    isLoading = true;

    try {
        const res = await fetch(
            `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&include_adult=false&page=${page}`
        );

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        const results = data.results || [];

        if (results.length === 0) {
            hasMoreResults = false;
            isLoading = false;
            showEndMessage();
            return;
        }

        totalPages = Math.min(data.total_pages || 1, 10);

        const filtered = results.filter(item => {
            if (item.media_type !== "movie" && item.media_type !== "tv") return false;
            if (searchType === "movie") return item.media_type === "movie";
            if (searchType === "series") return item.media_type === "tv";
            return true;
        });

        const newResults = filtered.filter(item => {
            const exists = allResults.some(existing => existing.id === item.id);
            return !exists && item.poster_path !== null && item.poster_path !== undefined && item.poster_path !== '';
        });

        if (newResults.length === 0 && allResults.length === 0) {
            searchStatus.style.display = "block";
            searchStatus.innerHTML = `<h2>No results with posters for "${query}"</h2><p>Try a different search term</p>`;
            isLoading = false;
            hasMoreResults = false;
            return;
        }

        allResults = allResults.concat(newResults);
        displayResults(newResults);

        if (page >= totalPages) {
            hasMoreResults = false;
            showEndMessage();
        }

        currentPage = page + 1;
        isLoading = false;

    } catch (err) {
        console.error("Load page error:", err);
        isLoading = false;
        hasMoreResults = false;
    }
}

// ===== DISPLAY RESULTS FUNCTION =====
function displayResults(results) {
    results.forEach(item => {
        const title = item.title || item.name;
        const year = (item.release_date || item.first_air_date || '').slice(0, 4);
        const posterUrl = `https://image.tmdb.org/t/p/w500${item.poster_path}`;
        const rating = item.vote_average ? `★ ${item.vote_average.toFixed(1)}` : '';

        const card = document.createElement("div");
        card.className = "search-card";
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
    });
}

// ===== SCROLL HANDLER =====
function handleScroll() {
    if (isLoading || !hasMoreResults) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;

    if (scrollTop + windowHeight >= docHeight * 0.8) {
        loadPage(currentQuery, currentPage);
    }
}

// ===== END MESSAGE =====
function showEndMessage() {
    if (document.querySelector('.search-end')) return;

    const endMessage = document.createElement("div");
    endMessage.className = "search-end";
    endMessage.style.cssText = `
        grid-column: 1 / -1;
        text-align: center;
        padding: 30px;
        color: #666;
        font-size: 14px;
        border-top: 1px solid #222;
        margin-top: 20px;
    `;
    endMessage.textContent = "✨ You've seen all results";
    searchResults.appendChild(endMessage);
}

console.log("✅ Search with pagination loaded!");