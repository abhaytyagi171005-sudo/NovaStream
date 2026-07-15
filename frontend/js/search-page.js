const API = "https://novastream-o3ri.onrender.com/api";
const TMDB_API_KEY = "f08c9127f4fa4a8642bffa57c5b8955e";
let searchType = "all";
let searchTimeout = null;

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

    searchStatus.innerHTML = `<h2>Searching...</h2>`;

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

async function doSearch(query) {
    console.log("Searching for:", query); // Keep this one if you want

    try {
        searchStatus.style.display = "none";
        searchResults.innerHTML = "";

        let allResults = [];
        let currentPage = 1;
        let totalPages = 1;

        while (currentPage <= totalPages && currentPage <= 5) {
            const res = await fetch(
                `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&include_adult=false&page=${currentPage}`
            );

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const data = await res.json();
            const results = data.results || [];

            if (results.length === 0) {
                break;
            }

            allResults = allResults.concat(results);
            totalPages = Math.min(data.total_pages || 1, 5);

            currentPage++;
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        const filtered = allResults.filter(item => {
            if (item.media_type !== "movie" && item.media_type !== "tv") return false;
            if (searchType === "movie") return item.media_type === "movie";
            if (searchType === "series") return item.media_type === "tv";
            return true;
        });

        // BOTH CONSOLE LOG AND COUNT DISPLAY REMOVED

        if (filtered.length === 0) {
            searchStatus.style.display = "block";
            searchStatus.innerHTML = `<h2>No results for "${query}"</h2><p>Try a different search term</p>`;
            return;
        }

        // Display results
        filtered.forEach(item => {
            if (!item.poster_path) {
                const title = item.title || item.name;
                const card = document.createElement("div");
                card.className = "search-card";
                card.innerHTML = `
                    <div style="height:270px;background:#333;display:flex;align-items:center;justify-content:center;color:#666;font-size:14px;">
                        🎬 ${title}
                    </div>
                    <div class="search-card-info">
                        <h3>${title}</h3>
                        <span>${item.media_type === "tv" ? "📺 Series" : "🎬 Movie"}</span>
                    </div>
                `;
                card.onclick = () => {
                    window.location.href = `search.html?movie=${encodeURIComponent(title)}`;
                };
                searchResults.appendChild(card);
                return;
            }

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

    } catch (err) {
        console.error("Search error:", err);
        searchStatus.style.display = "block";
        searchStatus.innerHTML = `<h2>Error searching</h2><p>${err.message}</p>`;
    }
}