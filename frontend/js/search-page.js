const TMDB_API_KEY = "f08c9127f4fa4a8642bffa57c5b8955e";

async function doSearch(query) {
    try {
        const res = await fetch(
            `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&include_adult=false`
        );
        const data = await res.json();
        const results = data.results || [];

        searchStatus.style.display = "none";
        searchResults.innerHTML = "";

        const filtered = results.filter(item => {
            if (item.media_type !== "movie" && item.media_type !== "tv") return false;
            if (searchType === "movie") return item.media_type === "movie";
            if (searchType === "series") return item.media_type === "tv";
            return true; // "all"
        });

        if (filtered.length === 0) {
            searchStatus.style.display = "block";
            searchStatus.innerHTML = `<h2>No results for "${query}"</h2><p>Try a different search term</p>`;
            return;
        }

        filtered.forEach(item => {
            if (!item.poster_path) return;
            const title = item.title || item.name;
            const year = (item.release_date || item.first_air_date || '').slice(0, 4);
            const posterUrl = `https://image.tmdb.org/t/p/w500${item.poster_path}`;

            const card = document.createElement("div");
            card.className = "search-card";
            card.innerHTML = `
                <img src="${posterUrl}" alt="${title}" onerror="this.parentElement.style.display='none'">
                <div class="search-card-info">
                    <h3>${title}</h3>
                    <span>${year} • ${item.media_type === "tv" ? "📺 Series" : "🎬 Movie"}</span>
                </div>
            `;
            card.onclick = () => {
                window.location.href = `search.html?movie=${encodeURIComponent(title)}`;
            };
            searchResults.appendChild(card);
        });

    } catch (err) {
        console.error(err);
        searchStatus.style.display = "block";
        searchStatus.innerHTML = `<h2>Error connecting to server</h2>`;
    }
}