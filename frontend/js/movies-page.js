/* ==========================================
   HERO SYSTEM (Random 1 Movie + TMDB Poster)
========================================== */

const TMDB_API_KEY = "f08c9127f4fa4a8642bffa57c5b8955e";

const heroMovies = {
    obsession: {
        title: "OBSESSION",
        year: "2026",
        description: "After breaking the mysterious 'One Wish Willow' to win his crush's heart, a hopeless romantic finds himself getting exactly what he asked for but soon discovers that some desires come at a dark, sinister price.",
        video: "assets/movies/previews/obsession.mp4",
        tmdbId: 1339713
    },
    avengers: {
        title: "AVENGERS: ENDGAME",
        year: "2019",
        description: "After the devastating events of Infinity War, the Avengers assemble once more to undo Thanos's actions and restore order to the universe.",
        video: "assets/movies/previews/avengers-endgame.mp4",
        tmdbId: 299534
    },
    dune: {
        title: "DUNE: PART ONE",
        year: "2021",
        description: "A mythic and emotionally charged hero's journey, Dune tells the story of Paul Atreides, a brilliant and gifted young man born into a great destiny beyond his understanding.",
        video: "assets/movies/previews/dune-part-one.mp4",
        tmdbId: 438631
    },
    godzilla: {
        title: "GODZILLA X KONG: THE NEW EMPIRE",
        year: "2024",
        description: "Two ancient titans, Godzilla and Kong, clash in an epic battle as humans unravel their intertwined origins and connection to Skull Island's mysteries.",
        video: "assets/movies/previews/godzilla-x-kong.mp4",
        tmdbId: 823464
    },
    bhool: {
        title: "BHOOL BHULAIYAA",
        year: "2007",
        description: "A newly married couple moves into a haunted palace, where the groom's brother, a psychiatrist, tries to uncover the truth behind the supernatural occurrences.",
        video: "assets/movies/previews/bhool-bhulaiyaa.mp4",
        tmdbId: 19025
    },
    regretting: {
        title: "REGRETTING YOU",
        year: "2025",
        description: "A mother and daughter navigate the aftermath of a devastating accident that uncovers a shocking betrayal.",
        video: "assets/movies/previews/regretting-you.mp4",
        tmdbId: 1327862
    },
    frankenstein: {
        title: "FRANKENSTEIN",
        year: "2025",
        description: "Dr. Victor Frankenstein brings a creature to life in a monstrous experiment that ultimately leads to the undoing of both the creator and his tragic creation.",
        video: "assets/movies/previews/frankenstein.mp4",
        tmdbId: 1062722
    },
    batman: {
        title: "THE BATMAN",
        year: "2022",
        description: "When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the city's hidden corruption and question his family's involvement.",
        video: "assets/movies/previews/the-batman.mp4",
        tmdbId: 414906
    },
    ballerina: {
        title: "BALLERINA",
        year: "2025",
        description: "A young female assassin seeks revenge against the people who killed her family, using her ballet training to deadly effect.",
        video: "assets/movies/previews/ballerina.mp4",
        tmdbId: 541671
    }
};

// ─── ALL 9 MOVIES ───
const allMovies = [
    heroMovies.obsession,
    heroMovies.avengers,
    heroMovies.dune,
    heroMovies.godzilla,
    heroMovies.bhool,
    heroMovies.regretting,
    heroMovies.frankenstein,
    heroMovies.batman,
    heroMovies.ballerina
];

// ─── PICK ONE RANDOM MOVIE ───
function getRandomMovie() {
    const randomIndex = Math.floor(Math.random() * allMovies.length);
    return allMovies[randomIndex];
}

// ─── USE RANDOM MOVIE (ONLY 1) ───
const heroList = [getRandomMovie()];

console.log(`🎬 Movies page hero: ${heroList[0].title}`);
console.log(`🆔 TMDB ID: ${heroList[0].tmdbId}`);

let currentHero = 0;
let videoTimeout = null;
let posterTimeout = null;

// ─── FETCH POSTER FROM TMDB ───
async function fetchPoster(tmdbId) {
    try {
        const response = await fetch(
            `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_API_KEY}`
        );
        const data = await response.json();
        if (data.poster_path) {
            return `https://image.tmdb.org/t/p/original${data.poster_path}`;
        }
        return null;
    } catch (error) {
        console.warn('Poster fetch failed:', error);
        return null;
    }
}

async function changeHero(index) {
    const movie = heroList[index];
    const banner = document.getElementById("moviesHero");
    const heroVideo = document.getElementById("hero-video");
    const heroSource = document.getElementById("hero-video-source");
    const heroContent = document.querySelector('.hero-content');
    const poster = document.getElementById('heroPoster');

    // ─── UPDATE TEXT CONTENT ───
    document.getElementById("movieHeroTitle").innerText = movie.title;
    document.getElementById("movieHeroYear").innerText = movie.year;
    document.getElementById("movieHeroDescription").innerText = movie.description;

    // ─── FETCH ORIGINAL POSTER FROM TMDB ───
    const posterUrl = await fetchPoster(movie.tmdbId);
    console.log('📸 Poster URL:', posterUrl);

    // ─── SHOW POSTER ───
    if (poster && posterUrl) {
        poster.src = posterUrl;
        poster.style.display = 'block';
        poster.style.opacity = '1';
    }

    // ─── SET BACKGROUND (fallback) ───
    if (posterUrl) {
        banner.style.backgroundImage = `
            linear-gradient(to right, rgba(0,0,0,.9), rgba(0,0,0,.3)),
            url('${posterUrl}')
        `;
        banner.style.backgroundSize = 'cover';
        banner.style.backgroundPosition = 'center';
    } else {
        banner.style.backgroundImage = 'none';
        banner.style.backgroundColor = '#0a0a0a';
    }

    // ─── LARGE TEXT (poster visible) ───
    if (heroContent) {
        heroContent.classList.remove('small');
        heroContent.classList.add('large');
    }

    // ─── HIDE VIDEO ───
    if (heroVideo) {
        heroVideo.pause();
        heroVideo.style.opacity = "0";
        clearTimeout(videoTimeout);
        clearTimeout(posterTimeout);
    }

    // ─── AFTER 3 SECONDS, SHOW VIDEO AND SHRINK TEXT ───
    posterTimeout = setTimeout(() => {
        // Fade out poster
        if (poster) {
            poster.style.opacity = '0';
        }

        // Show video
        if (heroVideo && movie.video) {
            heroSource.src = movie.video;
            heroVideo.load();
            heroVideo.play().then(() => {
                heroVideo.style.opacity = "1";
                // Remove background image so video shows cleanly
                banner.style.backgroundImage = 'none';
                banner.style.backgroundColor = '#0a0a0a';
            }).catch(() => {
                heroVideo.style.opacity = "0";
            });
        }

        // Small text (video playing)
        if (heroContent) {
            heroContent.classList.remove('large');
            heroContent.classList.add('small');
        }

    }, 3000);
}

// ─── START HERO ───
changeHero(0);

console.log(`✅ Movies page hero set to: ${heroList[0].title}`);

/* ==========================================
   LOAD SECTION
========================================== */

function makeCard(movie) {
    const poster = movie.Poster && movie.Poster !== "N/A"
        ? movie.Poster
        : "images/placeholder.jpg";
    const genres = (movie.genres || []).join(', ');
    const trailerAttr = movie.trailerKey ? `data-trailer="${movie.trailerKey}"` : '';
    return `
        <div class="card"
             onclick="openMovie('${movie.Title.replace(/'/g, "\\'")}')"
             data-title="${movie.Title.replace(/"/g, '&quot;')}"
             data-year="${movie.Year || ''}"
             data-rating="${movie.imdbRating || ''}"
             data-genres="${genres}"
             ${trailerAttr}>
            <img src="${poster}" alt="${movie.Title}" onerror="this.parentElement.style.display='none'">
            <div class="movie-info"><h3>${movie.Title}</h3></div>
        </div>
    `;
}

async function loadSection(category, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";

    try {
        const response = await fetch(
            `https://novastream-o3ri.onrender.com/api/movies?category=${category}&limit=10`
        );
        const data = await response.json();
        if (!data.length) return;
        container.innerHTML = data.map(makeCard).join("");
        attachPreviews();
    } catch (error) {
        console.error(error);
    }
}

/* ==========================================
   LOAD EVERYTHING
========================================== */

loadSection("trending", "trendingMovies");
loadSection("action", "actionMovies");
loadSection("scifi", "sciFiMovies");
loadSection("action", "superheroMovies");
loadSection("drama", "topRated");
loadSection("comedy", "comedyMovies");
loadSection("horror", "horrorMovies");

/* ==========================================
   OPEN MOVIE
========================================== */

function openMovie(title) {
    window.location.href = `search.html?movie=${encodeURIComponent(title)}`;
}

/* ==========================================
   GENRE FILTER
========================================== */

function filterGenre(genre) {
    document.querySelector(".genre-menu").style.display = "none";
    setTimeout(() => document.querySelector(".genre-menu").style.display = "", 300);

    document.querySelectorAll(".movies-section").forEach(s => s.style.display = "none");

    if (genre === "all") {
        document.querySelectorAll(".movies-section").forEach(s => s.style.display = "block");
        setTimeout(() => document.getElementById("sectionTrending").scrollIntoView({ behavior: "smooth" }), 100);
        return;
    }

    const genreData = {
        action: [
            { title: "🔥 Top Action Picks", id: "action1" },
            { title: "💣 Explosive Blockbusters", id: "action2" },
            { title: "🥊 Fight & Survival", id: "action3" },
            { title: "🚗 High Speed Thrills", id: "action4" },
            { title: "🪖 War & Military", id: "action5" },
        ],
        scifi: [
            { title: "🚀 Space Epics", id: "scifi1" },
            { title: "🤖 AI & Future", id: "scifi2" },
            { title: "🌌 Mind Bending", id: "scifi3" },
            { title: "👽 Alien Invasion", id: "scifi4" },
            { title: "🔬 Sci-Fi Classics", id: "scifi5" },
        ],
        thriller: [
            { title: "🔍 Mystery Thrillers", id: "thriller1" },
            { title: "😰 Psychological", id: "thriller2" },
            { title: "🔪 Crime Thrillers", id: "thriller3" },
            { title: "💼 Spy Thrillers", id: "thriller4" },
            { title: "⚖️ Legal Thrillers", id: "thriller5" },
        ],
        horror: [
            { title: "😱 Must Watch Horror", id: "horror1" },
            { title: "👻 Supernatural", id: "horror2" },
            { title: "🧟 Creature Horror", id: "horror3" },
            { title: "🔪 Slasher Classics", id: "horror4" },
            { title: "🌀 Modern Horror", id: "horror5" },
        ],
        comedy: [
            { title: "😂 Must Watch Comedy", id: "comedy1" },
            { title: "🎭 Rom-Com", id: "comedy2" },
            { title: "🤣 Action Comedy", id: "comedy3" },
            { title: "👨‍👩‍👧 Family Comedy", id: "comedy4" },
            { title: "🌟 Comedy Classics", id: "comedy5" },
        ],
        romance: [
            { title: "❤️ Epic Love Stories", id: "romance1" },
            { title: "💑 Modern Romance", id: "romance2" },
            { title: "💍 Wedding & Love", id: "romance3" },
            { title: "🌹 Classic Romance", id: "romance4" },
            { title: "💔 Heartbreak Stories", id: "romance5" },
        ],
        superhero: [
            { title: "🦸 Marvel Universe", id: "superhero1" },
            { title: "🦇 DC Universe", id: "superhero2" },
            { title: "💀 Anti-Heroes", id: "superhero3" },
            { title: "🌟 Classic Superhero", id: "superhero4" },
            { title: "🔮 New Generation", id: "superhero5" },
        ],
        bollywood: [
            { title: "🎬 Blockbusters", id: "bollywood1" },
            { title: "🎵 Romantic Hits", id: "bollywood2" },
            { title: "💥 Action Dhamaka", id: "bollywood3" },
            { title: "🏆 Award Winners", id: "bollywood4" },
            { title: "😂 Comedy Kings", id: "bollywood5" },
        ],
        hindi: [
            { title: "🔥 Latest Hits", id: "hindi1" },
            { title: "🎭 Drama", id: "hindi2" },
            { title: "💥 Action", id: "hindi3" },
            { title: "😂 Comedy", id: "hindi4" },
            { title: "🏆 Critically Acclaimed", id: "hindi5" },
        ],
        tamil: [
            { title: "🔥 Mass Entertainers", id: "tamil1" },
            { title: "💥 Action", id: "tamil2" },
            { title: "🎭 Drama", id: "tamil3" },
            { title: "😂 Comedy", id: "tamil4" },
            { title: "🌟 Pan India Hits", id: "tamil5" },
        ],
        crime: [
            { title: "🕵️ Crime Masterpieces", id: "crime1" },
            { title: "🔫 Heist Movies", id: "crime2" },
            { title: "📋 True Crime", id: "crime3" },
            { title: "🌍 World Crime", id: "crime4" },
            { title: "🚔 Cop Dramas", id: "crime5" },
        ],
        fantasy: [
            { title: "🧙 Epic Fantasy", id: "fantasy1" },
            { title: "🐉 Mythological", id: "fantasy2" },
            { title: "✨ Dark Fantasy", id: "fantasy3" },
            { title: "🌊 Adventure Fantasy", id: "fantasy4" },
            { title: "🔮 Modern Fantasy", id: "fantasy5" },
        ],
        animation: [
            { title: "🎨 Pixar Classics", id: "animation1" },
            { title: "🌀 Disney Magic", id: "animation2" },
            { title: "⛩️ Studio Ghibli", id: "animation3" },
            { title: "🦸 Animated Superhero", id: "animation4" },
            { title: "😂 Animated Comedy", id: "animation5" },
        ],
        documentary: [
            { title: "🧗 Adventure Docs", id: "doc1" },
            { title: "🌍 Social Docs", id: "doc2" },
            { title: "🍣 Food & Culture", id: "doc3" },
            { title: "🎵 Music Docs", id: "doc4" },
            { title: "🔬 Science & Nature", id: "doc5" },
        ],
        sports: [
            { title: "🏆 Inspiring Sports", id: "sports1" },
            { title: "⚽ Football", id: "sports2" },
            { title: "🥊 Boxing", id: "sports3" },
            { title: "🏎️ Racing", id: "sports4" },
            { title: "🏀 Basketball", id: "sports5" },
        ],
        family: [
            { title: "👨‍👩‍👧 Family Favorites", id: "family1" },
            { title: "🦁 Animal Adventures", id: "family2" },
            { title: "🧚 Magical Stories", id: "family3" },
            { title: "🎄 Holiday Movies", id: "family4" },
            { title: "🤖 Sci-Fi Family", id: "family5" },
        ],
        anime: [
            { title: "⚔️ Action Anime", id: "anime1" },
            { title: "🌸 Studio Ghibli", id: "anime2" },
            { title: "🔮 Fantasy Anime", id: "anime3" },
            { title: "🤖 Sci-Fi Anime", id: "anime4" },
            { title: "😂 Comedy Anime", id: "anime5" },
        ],
        standup: [
            { title: "😂 Must Watch", id: "standup1" },
            { title: "🌟 Legends", id: "standup2" },
            { title: "🎤 Netflix Specials", id: "standup3" },
            { title: "🌍 International", id: "standup4" },
            { title: "🇮🇳 Indian Stand-Up", id: "standup5" },
        ],
        hollywood: [
            { title: "🌟 All Time Greats", id: "hollywood1" },
            { title: "🔥 2020s Best", id: "hollywood2" },
            { title: "💥 Action Blockbusters", id: "hollywood3" },
            { title: "🏆 Oscar Winners", id: "hollywood4" },
            { title: "🎭 Drama Masterpieces", id: "hollywood5" },
        ],
        drama: [
            { title: "🎭 Must Watch Drama", id: "drama1" },
            { title: "💼 Corporate Drama", id: "drama2" },
            { title: "⚖️ Courtroom Drama", id: "drama3" },
            { title: "🌍 World Drama", id: "drama4" },
            { title: "🎬 Biographical", id: "drama5" },
        ],
    };

    const sections = genreData[genre];
    if (!sections) return;

    sections.forEach(({ title, id }) => {
        let section = document.getElementById("dynamic_" + id);
        if (!section) {
            section = document.createElement("section");
            section.className = "movies-section";
            section.id = "dynamic_" + id;
            section.innerHTML = `<h2>${title}</h2><div class="movie-row" id="row_${id}"></div>`;
            document.getElementById("movieSectionsContainer").appendChild(section);
        }
        section.style.display = "block";

        fetch(`https://novastream-o3ri.onrender.com/api/movies?category=${genre}&limit=10`)
            .then(r => r.json())
            .then(data => {
                const row = document.getElementById("row_" + id);
                if (!row || !data.length) return;
                row.innerHTML = data.map(makeCard).join("");
                attachPreviews();
            });
    });

    setTimeout(() => {
        document.getElementById("dynamic_" + sections[0].id).scrollIntoView({ behavior: "smooth" });
    }, 100);
}