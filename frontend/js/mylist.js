
/* ── Toast notification ── */
function showToast(message = "Added to My List ♥") {
    const toast = document.getElementById("toast");
    const toastMsg = document.getElementById("toastMsg");
    if (!toast) return;
    toastMsg.innerText = message;
    toast.classList.remove("show");
    void toast.offsetWidth; // force reflow
    toast.classList.add("show");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove("show"), 3000);
}

/* ── Dynamic Genre-Pool Map ── */
// Expanded content banks so recommendations always feel fresh and highly distinct
const genrePools = {
    action: [
        { title: "The Dark Knight", year: "2008", poster: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg", color: "color-orange" },
        { title: "Iron Man 3", year: "2013", poster: "https://m.media-amazon.com/images/M/MV5BMjE5MzcyMjk1M15BMl5BanBnXkFtZTcwMjA4MjcxOQ@@._V1_SX300.jpg", color: "color-orange" },
        { title: "Captain America: Civil War", year: "2016", poster: "https://m.media-amazon.com/images/M/MV5BMjQ1NjM3MTg1NV5BMl5BanBnXkFtZTgwOTE4NDc5NzE@._V1_SX300.jpg", color: "color-purple" },
        { title: "Mad Max: Fury Road", year: "2015", poster: "https://m.media-amazon.com/images/M/MV5BN2EwMWRhNTQtNzE4My00NjdlLTjkNDgtOWE1NWJhZDA3MDFlXkEyXkFqcGdeQXVyNDQ2MTMzODA@._V1_SX300.jpg", color: "color-green" }
    ],
    sciFi: [
        { title: "The Martian", year: "2015", poster: "https://m.media-amazon.com/images/M/MV5BMTc2MTQ3MDA1Nl5BMl5BanBnXkFtZTgwODA3OTI4NjE@._V1_SX300.jpg", color: "color-green" },
        { title: "Arrival", year: "2016", poster: "https://m.media-amazon.com/images/M/MV5BMTM0NTc2NDgwNF5BMl5BanBnXkFtZTgwNDM5MTMyOTE@._V1_SX300.jpg", color: "color-purple" },
        { title: "Inception", year: "2010", poster: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg", color: "color-orange" },
        { title: "Blade Runner 2049", year: "2017", poster: "https://m.media-amazon.com/images/M/MV5BNzA1Njg4NzYxOV5BMl5BanBnXkFtZTgwODk5NjU3MzI@._V1_SX300.jpg", color: "color-purple" }
    ],
    drama: [
        { title: "The Shawshank Redemption", year: "1994", poster: "https://m.media-amazon.com/images/M/MV5BMDFkYTc0MGEtZmNhMC00ZDIzLWFmNTEtODM1ZmRlYWMwMWFmXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg", color: "color-green" },
        { title: "Forrest Gump", year: "1994", poster: "https://m.media-amazon.com/images/M/MV5BNWIwODRlZTUtY2U3ZS00Yzg1LWJhNzYtMmZiYmEyNmU1NjMzXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg", color: "color-orange" },
        { title: "Interstellar", year: "2014", poster: "https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg", color: "color-purple" }
    ],
    fallback: [
        { title: "Galactic Odyssey", year: "2025", poster: "https://picsum.photos/300/450?random=1", color: "color-green" },
        { title: "The Last Starfighter", year: "2024", poster: "https://picsum.photos/300/450?random=2", color: "color-purple" },
        { title: "Distant Echoes", year: "2025", poster: "https://picsum.photos/300/450?random=3", color: "color-orange" }
    ]
};

/* ── Load & render saved movies ── */
function loadMyList() {
    const myList = JSON.parse(localStorage.getItem("myList")) || [];
    const container = document.getElementById("myListMovies");
    if (!container) return;
    container.innerHTML = "";

    const count = myList.length;
    const countEl = document.querySelector(".mylist-count");
    if (countEl) {
        countEl.innerText = count === 0 ? "No movies saved yet" : `${count} ${count === 1 ? "movie" : "movies"} saved`;
    }

    if (count === 0) {
        // FIXED STRUCTURE: This keeps the empty message perfectly centered inside the main card area
        container.innerHTML = `
            <div style="grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 40px 20px; width: 100%;">
                <span class="empty-heart" style="font-size: 2rem; color: rgba(255,255,255,0.3); margin-bottom: 10px; display: block;">♥</span>
                <h3 style="margin: 0 0 8px 0; font-size: 1.4rem; color: #fff;">Your list is empty.</h3>
                <p style="margin: 0; color: rgba(255,255,255,0.6); font-size: 0.95rem;">Add movies from the home page!</p>
            </div>
        `;

        // Hide recommendations immediately if list becomes empty
        const recsSection = document.getElementById("recsSection");
        if (recsSection) recsSection.style.display = "none";
        return;
    }
    myList.forEach(movie => {
        container.innerHTML += `
            <div class="mylist-card">
                <span class="remove-btn" onclick="removeMovie('${movie.title.replace(/'/g, "\\ Baltimore")}')">✕</span>
                <img src="${movie.poster}" alt="${movie.title}">
                <div class="overlay"><h3>${movie.title}</h3></div>
            </div>
        `;
    });

    loadRecommendations(myList);
}

/* ── Remove a movie ── */
function removeMovie(title) {
    let myList = JSON.parse(localStorage.getItem("myList")) || [];
    myList = myList.filter(movie => movie.title !== title);
    localStorage.setItem("myList", JSON.stringify(myList));
    loadMyList();
}

/* ── Background collage background generator ── */
const collagePosters = [
    "https://m.media-amazon.com/images/M/MV5BMTczNTI2ODUwOF5BMl5BanBnXkFtZTcwMTU0NTIzMw@@._V1_SX300.jpg",
    "https://m.media-amazon.com/images/M/MV5BNWIwODRlZTUtY2U3ZS00Yzg1LWJhNzYtMmZiYmEyNmU1NjMzXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    "https://m.media-amazon.com/images/M/MV5BMTg1MTY2MjYzNV5BMl5BanBnXkFtZTgwMjY0NTAzMDE@._V1_SX300.jpg",
    "https://m.media-amazon.com/images/M/MV5BMTQ0MjMxNTQ5OF5BMl5BanBnXkFtZTcwNzI3MDkwNA@@._V1_SX300.jpg"
];
function buildCollage() {
    const collage = document.getElementById("bgCollage");
    if (!collage) return;
    collage.innerHTML = "";
    for (let i = 0; i < 18; i++) {
        const img = document.createElement("img");
        img.src = collagePosters[i % collagePosters.length];
        collage.appendChild(img);
    }
}
buildCollage();

/* ── Dynamic Context-Aware Recommendations ── */
let currentDisplayedRecs = [];

function loadRecommendations(myList = []) {
    const recsSection = document.getElementById("recsSection");
    const recsList = document.getElementById("recsList");
    const loadingEl = document.getElementById("recsLoading");

    if (!recsSection || !recsList) return;
    if (myList.length === 0) {
        recsSection.style.display = "none";
        return;
    }

    recsSection.style.display = "block";
    if (loadingEl) loadingEl.style.display = "block";
    recsList.innerHTML = "";

    // 1. Analyze the last saved title to dynamically find its vibe
    const lastMovie = myList[myList.length - 1];
    const titleLower = lastMovie.title.toLowerCase();

    let matchedGenre = "fallback";

    // Dynamic Keyword matching map
    if (titleLower.includes("avengers") || titleLower.includes("batman") || titleLower.includes("knight") || titleLower.includes("man") || titleLower.includes("iron")) {
        matchedGenre = "action";
    } else if (titleLower.includes("wars") || titleLower.includes("interstellar") || titleLower.includes("star") || titleLower.includes("space") || titleLower.includes("insurgence")) {
        matchedGenre = "sciFi";
    } else if (titleLower.includes("love") || titleLower.includes("story") || titleLower.includes("life") || titleLower.includes("redemption")) {
        matchedGenre = "drama";
    } else {
        // Safe fallback rule if it's an unrecognized custom movie from the homepage: 
        // Randomly choose action or scifi to keep content rolling natively!
        matchedGenre = Math.random() > 0.5 ? "action" : "sciFi";
    }

    // 2. Filter out movies that the user has ALREADY saved to ensure recommendations are always fresh!
    let recommendationsSource = genrePools[matchedGenre];
    let uniqueRecs = recommendationsSource.filter(recMovie =>
        !myList.some(savedMovie => savedMovie.title.toLowerCase() === recMovie.title.toLowerCase())
    );

    // If everything inside that pool is already saved, pull from fallback pool
    if (uniqueRecs.length === 0) {
        uniqueRecs = genrePools["fallback"];
    }

    // 3. Keep exactly 3 recommendations
    currentDisplayedRecs = uniqueRecs.slice(0, 3);

    setTimeout(() => {
        if (loadingEl) loadingEl.style.display = "none";

        recsList.innerHTML = currentDisplayedRecs.map((movie, index) => `
            <div class="rec-card">
                <img class="rec-poster" src="${movie.poster}" alt="${movie.title}">
                <div class="rec-info">
                    <h4>${movie.title}</h4>
                    <p>${movie.year}</p>
                </div>
                <button class="rec-save-btn ${movie.color}" onclick="saveFromRecs(${index})">
                    Save
                </button>
            </div>
        `).join("");
    }, 1500);
}

/* ── Save recommended selection live into database array ── */
function saveFromRecs(index) {
    const targetMovie = currentDisplayedRecs[index];
    if (!targetMovie) return;

    let myList = JSON.parse(localStorage.getItem("myList")) || [];
    myList.push({
        title: targetMovie.title,
        poster: targetMovie.poster
    });

    localStorage.setItem("myList", JSON.stringify(myList));
    showToast(`Saved: ${targetMovie.title} ♥`);
    loadMyList();
}

// Fire system initialization
loadMyList();