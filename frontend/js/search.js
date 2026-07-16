const TMDB_API_KEY = "f08c9127f4fa4a8642bffa57c5b8955e";
const params = new URLSearchParams(window.location.search);
const movieName = params.get("movie");

document.getElementById("topResult").innerHTML = `
    <div class="skeleton-hero">
        <div class="skeleton-poster skeleton-box"></div>
        <div class="skeleton-info">
            <div class="skeleton-box" style="height:36px;width:60%;margin-bottom:16px;border-radius:8px;"></div>
            <div class="skeleton-box" style="height:16px;width:80%;margin-bottom:10px;border-radius:6px;"></div>
            <div class="skeleton-box" style="height:44px;width:200px;margin-top:20px;border-radius:8px;"></div>
        </div>
    </div>
`;

async function loadMovie() {
    try {
        // First, search for the movie to get its IMDB ID
        const searchResponse = await fetch(
            `https://novastream-o3ri.onrender.com/api/search?q=${encodeURIComponent(movieName)}&limit=20`
        );
        const searchData = await searchResponse.json();

        if (!searchData || searchData.length === 0) {
            document.getElementById("topResult").innerHTML = `<h2 style="padding:40px">No results found for "${movieName}"</h2>`;
            return;
        }

        const top = searchData[0];

        // Display movie details
        document.getElementById("topResult").innerHTML = `
            <div class="movie-hero" style="
                background-image: linear-gradient(to right, rgba(0,0,0,.95), rgba(0,0,0,.7), rgba(0,0,0,.95)),
                url('${top.Backdrop && top.Backdrop !== 'N/A' ? top.Backdrop : top.Poster}');
                background-size: cover;
                background-position: center;
            ">
                <div class="top-result-card">
                    <img src="${top.Poster}" alt="${top.Title}">
                    <div class="movie-details">
                        <h1>${top.Title}</h1>
                        <p>${top.Year} • ⭐ ${top.imdbRating !== 'N/A' ? Number(top.imdbRating).toFixed(1) : 'N/A'}</p>
                        <p><strong>${(top.genres || []).join(', ')}</strong></p>
                        <p>${top.Plot || ''}</p>
                        <p><strong>Language:</strong> ${top.Language || 'N/A'}</p>
                        <div class="buttons">
                            <button class="watch-btn">▶ Watch Now</button>
                            <button class="info-btn" onclick="playTrailer('${top.Title.replace(/'/g, "\\'")}')">🎬 Trailer</button>
                            <button class="list-btn" onclick="addToMyList('${top.Title.replace(/'/g, "\\'")}', '${top.Poster}')">♥ My List</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // ===== FETCH SIMILAR MOVIES FROM TMDB =====
        const similarMovies = document.getElementById("similarMovies");
        similarMovies.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;">
                <div class="loading-spinner"></div>
                <p>Loading similar movies...</p>
            </div>
        `;

        // Get movie ID from TMDB using the title
        const tmdbSearch = await fetch(
            `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(top.Title)}&year=${top.Year}`
        );
        const tmdbData = await tmdbSearch.json();

        if (tmdbData.results && tmdbData.results.length > 0) {
            const movieId = tmdbData.results[0].id;

            // Fetch similar movies from TMDB
            const similarResponse = await fetch(
                `https://api.themoviedb.org/3/movie/${movieId}/similar?api_key=${TMDB_API_KEY}&language=en-US&page=1`
            );
            const similarData = await similarResponse.json();

            similarMovies.innerHTML = "";

            if (similarData.results && similarData.results.length > 0) {
                // Display similar movies
                similarData.results.slice(0, 10).forEach(movie => {
                    if (movie.poster_path) {
                        similarMovies.innerHTML += `
                            <div class="card" onclick="window.location.href='search.html?movie=${encodeURIComponent(movie.title)}'">
                                <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" 
                                     alt="${movie.title}" 
                                     onerror="this.parentElement.style.display='none'">
                                <div class="movie-info">
                                    <h3>${movie.title}</h3>
                                    <p>${movie.release_date ? movie.release_date.slice(0, 4) : 'N/A'}</p>
                                </div>
                            </div>
                        `;
                    }
                });
            } else {
                similarMovies.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;">
                        <p>No similar movies found</p>
                    </div>
                `;
            }
        } else {
            similarMovies.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;">
                    <p>Could not find similar movies</p>
                </div>
            `;
        }

    } catch (error) {
        console.error(error);
        document.getElementById("topResult").innerHTML = `<h2 style="padding:40px">Error loading results. Please try again.</h2>`;
        document.getElementById("similarMovies").innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #e50914;">
                <p>Error loading similar movies</p>
            </div>
        `;
    }
}

loadMovie();

function playTrailer(title) {
    window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(title + " official trailer")}`, "_blank");
}

function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    const toastMsg = document.getElementById("toastMsg");
    const toastIcon = document.querySelector(".toast-icon");
    if (!toast) return;
    toastMsg.innerText = message;
    toastIcon.innerText = type === "warn" ? "!" : "♥";
    toast.classList.remove("show");
    void toast.offsetWidth;
    toast.classList.add("show");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove("show"), 3000);
}

function addToMyList(title, poster) {
    let myList = JSON.parse(localStorage.getItem("myList")) || [];
    const exists = myList.some(movie => movie.title === title);
    if (!exists) {
        myList.push({ title, poster });
        localStorage.setItem("myList", JSON.stringify(myList));
        showToast("Added to My List", "success");
    } else {
        showToast("Already in your list", "warn");
    }
}