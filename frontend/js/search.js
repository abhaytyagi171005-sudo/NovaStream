
const params = new URLSearchParams(window.location.search);
const movieName = params.get("movie");

// Show skeleton loader immediately so page doesn't look blank
document.getElementById("topResult").innerHTML = `
    <div class="skeleton-hero">
        <div class="skeleton-poster skeleton-box"></div>
        <div class="skeleton-info">
            <div class="skeleton-box" style="height:36px;width:60%;margin-bottom:16px;border-radius:8px;"></div>
            <div class="skeleton-box" style="height:16px;width:40%;margin-bottom:10px;border-radius:6px;"></div>
            <div class="skeleton-box" style="height:16px;width:80%;margin-bottom:10px;border-radius:6px;"></div>
            <div class="skeleton-box" style="height:16px;width:70%;margin-bottom:10px;border-radius:6px;"></div>
            <div class="skeleton-box" style="height:16px;width:55%;margin-bottom:10px;border-radius:6px;"></div>
            <div class="skeleton-box" style="height:44px;width:200px;margin-top:20px;border-radius:8px;"></div>
        </div>
    </div>
`;

async function loadMovie() {

    try {

        // Step 1: Search for the movie
        const response = await fetch(
            `http://localhost:5000/api/search?movie=${encodeURIComponent(movieName)}`
        );

        const data = await response.json();

        if (!data.Search) {
            document.getElementById("topResult").innerHTML = `<h2>No movies found for "${movieName}"</h2>`;
            return;
        }

        const topMovie = data.Search[0];

        // Step 2: Fetch movie details AND fanart IN PARALLEL (faster!)
        const [detailsResponse, fanartResponse] = await Promise.all([
            fetch(`http://localhost:5000/api/movie?id=${topMovie.imdbID}`),
            fetch(`http://localhost:5000/api/fanart?id=${topMovie.imdbID}`)
        ]);

        const [details, fanart] = await Promise.all([
            detailsResponse.json(),
            fanartResponse.json()
        ]);

        // Pick logo image
        let logoImage = "";
        if (fanart.hdmovielogo && fanart.hdmovielogo.length > 0) {
            logoImage = fanart.hdmovielogo[0].url;
        }

        // Pick background image
        let backgroundImage = details.Poster;
        if (fanart.moviebackground && fanart.moviebackground.length > 0) {
            backgroundImage = fanart.moviebackground[0].url;
        }

        // Render top result
        document.getElementById("topResult").innerHTML = `
            <div class="movie-hero" style="
                background-image:
                    linear-gradient(to right, rgba(0,0,0,.95), rgba(0,0,0,.7), rgba(0,0,0,.95)),
                    url('${backgroundImage}');
                background-size: cover;
                background-position: center;
            ">
                <div class="top-result-card">

                    <img src="${details.Poster}" alt="${details.Title}">

                    <div class="movie-details">

                        ${logoImage
                ? `<img class="movie-logo" src="${logoImage}" alt="${details.Title}">`
                : `<h1>${details.Title}</h1>`
            }

                        <p>${details.Year} • ${details.Runtime} • ⭐ ${details.imdbRating}</p>

                        <p><strong>${details.Genre}</strong></p>

                        <p>${details.Plot}</p>

                        <p><strong>Language:</strong> ${details.Language}</p>

                        <p><strong>Director:</strong> ${details.Director}</p>

                        <p><strong>Actors:</strong> ${details.Actors}</p>

                        <p><strong>Awards:</strong> ${details.Awards}</p>

                        <div class="buttons">

                            <button class="watch-btn">▶ Watch Now</button>

                            <button class="info-btn" onclick="playTrailer('${details.Title}')">
                                🎬 Trailer
                            </button>

                            <button class="list-btn" onclick="addToMyList('${details.Title}', '${details.Poster}')">
                                ♥ My List
                            </button>

                        </div>

                    </div>

                </div>
            </div>
        `;

        // Render similar movies
        const similarMovies = document.getElementById("similarMovies");
        similarMovies.innerHTML = "";

        data.Search.forEach(movie => {
            if (movie.Poster !== "N/A") {
                similarMovies.innerHTML += `
                    <div class="card">
                        <img src="${movie.Poster}" alt="${movie.Title}">
                        <h3>${movie.Title}</h3>
                    </div>
                `;
            }
        });

    } catch (error) {

        console.error(error);

        document.getElementById("topResult").innerHTML = `
            <h2>Error loading movie data. Please try again.</h2>
        `;

    }

}

loadMovie();

function playTrailer(title) {
    const trailerUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(title + " official trailer")}`;
    window.open(trailerUrl, "_blank");
}

/* ── Toast ── */
function showToast(message, type = "success") {

    const toast = document.getElementById("toast");
    const toastMsg = document.getElementById("toastMsg");
    const toastIcon = document.querySelector(".toast-icon");

    if (!toast) return;

    toastMsg.innerText = message;

    if (type === "warn") {
        toastIcon.innerText = "!";
        toastIcon.style.color = "#d4af37";
        toastIcon.style.filter = "drop-shadow(0 0 8px rgba(212,175,55,0.7))";
        toast.style.borderColor = "rgba(212,175,55,0.35)";
    } else {
        toastIcon.innerText = "♥";
        toastIcon.style.color = "#e50914";
        toastIcon.style.filter = "drop-shadow(0 0 8px rgba(229,9,20,0.7))";
        toast.style.borderColor = "rgba(229,9,20,0.35)";
    }

    toast.classList.remove("show");
    void toast.offsetWidth;
    toast.classList.add("show");

    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove("show"), 3000);
}

/* ── Add to My List ── */
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