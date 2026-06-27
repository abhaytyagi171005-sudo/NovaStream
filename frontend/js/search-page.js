const API = "https://novastream-o3ri.onrender.com/api";
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

function setType(type, btn) {
    searchType = type;
    document.querySelectorAll(".type-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const query = searchInput.value.trim();
    if (query.length >= 2) doSearch(query);
}

async function doSearch(query) {
    try {
        const res = await fetch(`${API}/search?q=${encodeURIComponent(query)}&type=${searchType}&limit=40`);
        const data = await res.json();

        searchStatus.style.display = "none";
        searchResults.innerHTML = "";

        if (!data || data.length === 0) {
            searchStatus.style.display = "block";
            searchStatus.innerHTML = `<h2>No results for "${query}"</h2><p>Try a different search term</p>`;
            return;
        }

        data.forEach(item => {
            if (!item.Poster || item.Poster === "N/A") return;
            const card = document.createElement("div");
            card.className = "search-card";
            card.innerHTML = `
                <img src="${item.Poster}" alt="${item.Title}" onerror="this.parentElement.style.display='none'">
                <div class="search-card-info">
                    <h3>${item.Title}</h3>
                    <span>${item.Year || ""} • ${item.Type === "series" ? "📺 Series" : "🎬 Movie"}</span>
                </div>
            `;
            card.onclick = () => {
                window.location.href = `search.html?movie=${encodeURIComponent(item.Title)}`;
            };
            searchResults.appendChild(card);
        });

    } catch (err) {
        console.error(err);
        searchStatus.style.display = "block";
        searchStatus.innerHTML = `<h2>Error connecting to server</h2>`;
    }
}