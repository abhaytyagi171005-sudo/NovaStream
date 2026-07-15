const TMDB_API_KEY = "f08c9127f4fa4a8642bffa57c5b8955e";

async function doSearch(query) {
    try {
        // Show searching status
        searchStatus.style.display = "block";
        searchStatus.innerHTML = `<h2>🔍 Searching for "${query}"...</h2><p>Please wait...</p>`;
        searchResults.innerHTML = "";

        let allResults = [];
        let currentPage = 1;
        let totalPages = 1;

        // Fetch ALL pages from TMDB (max 5 pages to avoid rate limiting)
        while (currentPage <= totalPages && currentPage <= 5) {
            const res = await fetch(
                `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&include_adult=false&page=${currentPage}`
            );
            const data = await res.json();
            const results = data.results || [];

            if (results.length === 0) {
                break;
            }

            // Add results to our collection
            allResults = allResults.concat(results);

            // Update total pages (TMDB returns total_pages)
            totalPages = Math.min(data.total_pages || 1, 5);

            // Update progress
            searchStatus.innerHTML = `<h2>🔍 Searching for "${query}"...</h2><p>Found ${allResults.length} results (Page ${currentPage}/${totalPages})</p>`;

            currentPage++;

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        // Hide status
        searchStatus.style.display = "none";

        // Filter results based on type
        const filtered = allResults.filter(item => {
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

        // Display results with total count
        const countDisplay = document.createElement("div");
        countDisplay.className = "search-count";
        countDisplay.style.cssText = "width: 100%; padding: 10px; margin-bottom: 15px; color: #888; text-align: center; font-size: 14px;";
        countDisplay.innerHTML = `<p>Found ${filtered.length} results for "${query}"</p>`;
        searchResults.appendChild(countDisplay);

        filtered.forEach(item => {
            if (!item.poster_path) return;
            const title = item.title || item.name;
            const year = (item.release_date || item.first_air_date || '').slice(0, 4);
            const posterUrl = `https://image.tmdb.org/t/p/w500${item.poster_path}`;
            const rating = item.vote_average ? `⭐ ${item.vote_average.toFixed(1)}` : '';

            const card = document.createElement("div");
            card.className = "search-card";
            card.innerHTML = `
                <img src="${posterUrl}" alt="${title}" onerror="this.parentElement.style.display='none'">
                <div class="search-card-info">
                    <h3>${title}</h3>
                    <span>${year || 'N/A'} • ${item.media_type === "tv" ? "📺 Series" : "🎬 Movie"} ${rating ? '• ' + rating : ''}</span>
                </div>
            `;
            card.onclick = () => {
                // Navigate to detail page with TMDB ID
                window.location.href = `search.html?movie=${encodeURIComponent(title)}`;
            };
            searchResults.appendChild(card);
        });

    } catch (err) {
        console.error(err);
        searchStatus.style.display = "block";
        searchStatus.innerHTML = `<h2>Error connecting to server</h2><p>${err.message}</p>`;
    }
}