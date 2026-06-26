const heroMovies = {

    interstellar: {
        title: "INTERSTELLAR",
        year: "2014",
        description: "A team travels through a wormhole to save humanity.",
        image: "images/banners/interstellar-banner.jpg",
        video: "images/interstellar-preview.mp4"
    },

    batman: {
        title: "BATMAN",
        year: "2022",
        description: "Batman uncovers corruption in Gotham.",
        image: "images/banners/batman-banner.jpg",
        video: "images/batman-preview.mp4"
    },

    joker: {
        title: "JOKER",
        year: "2019",
        description: "Arthur Fleck descends into madness.",
        image: "images/banners/joker-banner.jpg",
        video: "images/joker-preview.mp4"
    },

    avatar: {
        title: "AVATAR",
        year: "2009",
        description: "A marine explores Pandora.",
        image: "images/banners/avatar-banner.jpg",
        video: "images/avatar-preview.mp4"
    },

    dune: {
        title: "DUNE",
        year: "2024",
        description: "Paul Atreides joins the Fremen.",
        image: "images/banners/dune-banner.jpg",
        video: "images/dune-preview.mp4"
    }

};

const heroList = [
    heroMovies.dune,
    heroMovies.interstellar,
    heroMovies.batman,
    heroMovies.joker,
    heroMovies.avatar
];

let currentHero = 0;
let heroInterval = null;
let videoTimeout = null;

function changeHero(index) {
    const movie = heroList[index];
    const banner = document.getElementById("heroBanner");
    const heroVideo = document.getElementById("hero-video");
    const heroSource = document.getElementById("hero-video-source");

    // Clear any existing timers
    clearTimeout(videoTimeout);

    // Update text content
    document.getElementById("heroTitle").innerText = movie.title;
    document.getElementById("heroYear").innerText = movie.year;
    document.getElementById("heroDescription").innerText = movie.description;

    // Step 1: Show poster first
    banner.style.backgroundImage = `
        linear-gradient(to right, rgba(0,0,0,.9), rgba(0,0,0,.3)),
        url('${movie.image}')
    `;

    // Hide video, show poster
    heroVideo.style.opacity = "0";
    heroVideo.pause();

    // Step 2: After 2 seconds, fade in the video preview
    videoTimeout = setTimeout(() => {
        if (movie.video) {
            heroSource.src = movie.video;
            heroVideo.load();
            heroVideo.play().then(() => {
                heroVideo.style.opacity = "1";
                // Remove background image so video shows cleanly
                banner.style.backgroundImage = "none";
            }).catch(() => {
                // If video fails, just keep the poster
                heroVideo.style.opacity = "0";
            });
        }
    }, 2000);
}

function nextHero() {
    currentHero = (currentHero + 1) % heroList.length;
    changeHero(currentHero);
}

// Start the first movie
changeHero(0);

// Every 9 seconds: 2s poster + 7s video = 9s per movie
heroInterval = setInterval(nextHero, 9000);

// When video ends naturally, go to next
document.getElementById("hero-video").addEventListener("ended", () => {
    clearInterval(heroInterval);
    nextHero();
    heroInterval = setInterval(nextHero, 9000);
});


/* ── SEARCH & SECTIONS ─────────────────────────────────────── */
async function loadSection(movieList, containerId) {

    const container = document.getElementById(containerId);

    if (!container) return;

    container.innerHTML = "";

    for (const movieName of movieList) {

        try {

            const response =
                await fetch(
                    `http://localhost:5000/api/search?movie=${encodeURIComponent(movieName)}`
                );

            const data = await response.json();

            if (!data.Search) continue;

            data.Search.slice(0, 1).forEach(movie => {

                if (movie.Poster === "N/A") return;

                container.innerHTML += `
                    <div class="card"
                         onclick="openMovie('${movie.Title.replace(/'/g, "\\'")}')">

                        <img
                            src="${movie.Poster}"
                            alt="${movie.Title}">

                        <div class="movie-info">
                            <h3>${movie.Title}</h3>
                        </div>

                    </div>
                `;
            });

        } catch (error) {

            console.error(error);

        }
    }
}


const continueWatchingList = ["inception", "interstellar", "oppenheimer", "tenet", "1917", "top gun maverick", "barbie", "the menu", "knives out", "bullet train", "nope", "glass onion", "dunkirk", "whiplash", "prestige"];

const trendingList = ["fast furious", "mission impossible", "john wick", "expendables", "transformers", "jurassic world", "pirates caribbean", "kingsman", "taken", "sicario", "heat", "collateral", "mann", "equalizer", "96 hours"];

const topRatedList = ["godfather", "pulp fiction", "forrest gump", "fight club", "gladiator", "parasite", "wolf of wall street", "shutter island", "memento", "gone girl", "prisoners", "se7en", "silence lambs", "no country old men", "there will be blood"];

const sciFiList = ["dune", "arrival", "gravity", "martian", "blade runner 2049", "ex machina", "oblivion", "annihilation", "edge of tomorrow", "ready player one", "moon", "contact", "elysium", "district 9", "minority report"];

const superheroList = ["spider man", "batman", "superman", "deadpool", "iron man", "thor", "captain america", "wonder woman", "flash", "aquaman", "black panther", "doctor strange", "venom", "shazam", "antman"];
// Track recently used to avoid repeats
const recentlyUsed = { continueWatching: [], trendingMovies: [], topRated: [], sciFiMovies: [], superheroMovies: [] };

function getUniqueRandom(arr, sectionId) {
    const recent = recentlyUsed[sectionId];
    // Filter out recently used (last 4)
    let available = arr.filter(item => !recent.includes(item));
    // If all used, reset
    if (available.length === 0) {
        recentlyUsed[sectionId] = [];
        available = arr;
    }
    const pick = available[Math.floor(Math.random() * available.length)];
    recentlyUsed[sectionId].push(pick);
    // Keep only last 4 in memory
    if (recentlyUsed[sectionId].length > 4) recentlyUsed[sectionId].shift();
    return pick;
}

const actionList = [
    "john wick",
    "mission impossible",
    "taken",
    "sicario",
    "equalizer",
    "mad max",
    "expendables"
];

const comedyList = [
    "hangover",
    "free guy",
    "ted",
    "central intelligence",
    "we are the millers",
    "grown ups"
];

const horrorList = [
    "conjuring",
    "insidious",
    "annabelle",
    "the nun",
    "it",
    "smile"
];

/* Netflix-style rows */

loadSection(trendingList, "trendingMovies");
loadSection(topRatedList, "topRated");
loadSection(sciFiList, "sciFiMovies");
loadSection(superheroList, "superheroMovies");

loadSection(actionList, "actionMovies");
loadSection(comedyList, "comedyMovies");
loadSection(horrorList, "horrorMovies");



/* ── FEATURE MOVIE (search click) ──────────────────────────── */

function updateHero(movie) {
    // Stop auto-rotation and show selected movie
    clearInterval(heroInterval);
    clearTimeout(videoTimeout);
    const idx = heroList.indexOf(movie);
    if (idx !== -1) currentHero = idx;
    changeHero(currentHero);
    // Resume rotation after 9s
    heroInterval = setInterval(nextHero, 9000);
}

function featureMovie(title) {
    document.getElementById("searchResults").innerHTML = "";
    title = title.toLowerCase();
    if (title.includes("interstellar")) updateHero(heroMovies.interstellar);
    else if (title.includes("batman")) updateHero(heroMovies.batman);
    else if (title.includes("joker")) updateHero(heroMovies.joker);
    else if (title.includes("avatar")) updateHero(heroMovies.avatar);
    else if (title.includes("dune")) updateHero(heroMovies.dune);
}


/* ── SEARCH INPUT ───────────────────────────────────────────── */

const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");

searchInput.addEventListener("keyup", async (e) => {
    if (e.key === "Enter") {
        const query = searchInput.value.trim();
        if (query) window.location.href = `search.html ? movie = ${query} `;
        return;
    }

    const query = searchInput.value.trim();
    if (query.length < 2) { searchResults.innerHTML = ""; return; }

    const response = await fetch(`http://localhost:5000/api/search?movie=${query}`);
    const data = await response.json();
    searchResults.innerHTML = "";
    if (data.Search) {
        data.Search.slice(0, 5).forEach(movie => {
            searchResults.innerHTML += `
                <div class="search-item" onclick="featureMovie('${movie.Title}')">
                    ${movie.Title}
                </div>
            `;
        });
    }
});


/* ── MISC ───────────────────────────────────────────────────── */

function openMovie(title) {
    window.location.href = `search.html?movie=${encodeURIComponent(title)}`;
}

async function loadMyList() {
    const myList = JSON.parse(localStorage.getItem("myList")) || [];
    const container = document.getElementById("myListMovies");
    if (!container) return;
    container.innerHTML = "";
    myList.forEach(movie => {
        container.innerHTML += `
            <div class="card">
                <div class="movie-info"><h3>${movie}</h3></div>
            </div>
        `;
    });
}
loadMyList();

function scrollToMyList() {
    document.getElementById("myListSection").scrollIntoView({ behavior: "smooth" });
}

function showToast(message = "Added to My List ♥") {
    const toast = document.getElementById("toast");
    const toastMsg = document.getElementById("toastMsg");
    if (!toast) return;
    toastMsg.innerText = message;
    toast.classList.remove("show");
    void toast.offsetWidth;
    toast.classList.add("show");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove("show"), 3000);
}


