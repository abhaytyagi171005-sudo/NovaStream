// ===============================
// FEATURED SERIES
// ===============================
const TMDB_API_KEY = "f08c9127f4fa4a8642bffa57c5b8955e";

function shuffle(array) {
    return [...array].sort(() => Math.random() - 0.5);
}

// ─── SERIES DATA WITH TMDB IDs ───
const featuredSeries = [
    {
        title: "Bloodhounds",
        year: "2023",
        genre: "Action • Crime",
        description: "Two young boxers band together with a benevolent moneylender to take down a ruthless loan shark who preys on the financially desperate.",
        video: "assets/series/previews/bloodhounds.mp4",
        tmdb: 127529
    },
    {
        title: "Delhi Crime",
        year: "2019",
        genre: "Crime • Drama",
        description: "Following the police force as they investigate high-profile crimes in Delhi, this series has seasons inspired by both real and fictional events.",
        video: "assets/series/previews/delhi-crime.mp4",
        tmdb: 87508
    },
    {
        title: "Jujutsu Kaisen",
        year: "2020",
        genre: "Animation • Action",
        description: "A boy swallows a cursed talisman - the finger of a demon - and becomes cursed himself, entering a shared existence with the demon Ryomen Sukuna.",
        video: "assets/series/previews/jujutsu-kaisen.mp4",
        tmdb: 95479
    },
    {
        title: "My Royal Nemesis",
        year: "2026",
        genre: "Romance • Fantasy",
        description: "A Joseon-era villain doomed to die opens her eyes in modern-day Seoul — where a ruthless chaebol heir may be her last chance to rewrite her fate.",
        video: "assets/series/previews/my-royal-nemesis.mp4",
        tmdb: 303143
    },
    {
        title: "Panchayat",
        year: "2020",
        genre: "Comedy • Drama",
        description: "An engineering graduate, for lack of a better job option, joins as secretary of a panchayat office in a remote village of Uttar Pradesh.",
        video: "assets/series/previews/panchayat.mp4",
        tmdb: 101352
    },
    {
        title: "Peaky Blinders",
        year: "2013",
        genre: "Crime • Drama",
        description: "A gangster family epic set in 1919 Birmingham, England, centered on a gang who sew razor blades in the peaks of their caps, and their fierce boss Tommy Shelby.",
        video: "assets/series/previews/peaky-blinders.mp4",
        tmdb: 60574
    },
    {
        title: "Squid Game",
        year: "2021",
        genre: "Thriller • Drama",
        description: "Hundreds of cash-strapped players accept a strange invitation to compete in children's games. Inside, a tempting prize awaits — with deadly high stakes.",
        video: "assets/series/previews/squid-game.mp4",
        tmdb: 93405
    },
    {
        title: "Stranger Things",
        year: "2016",
        genre: "Sci-Fi • Horror",
        description: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.",
        video: "assets/series/previews/stranger-things.mp4",
        tmdb: 66732
    },
    {
        title: "The Boys",
        year: "2019",
        genre: "Action • Comedy",
        description: "A group of vigilantes set out to take down corrupt superheroes who abuse their superpowers.",
        video: "assets/series/previews/the-boys.mp4",
        tmdb: 76479
    }
];

// ─── GET RANDOM SERIES ───
function getRandomSeries() {
    const randomIndex = Math.floor(Math.random() * featuredSeries.length);
    return featuredSeries[randomIndex];
}

// ─── LOAD SERIES JSON ───
async function loadSeriesData() {
    try {
        const response = await fetch('data/series.json');
        if (!response.ok) throw new Error('Series JSON not found');
        const data = await response.json();
        return data;
    } catch (error) {
        console.warn('⚠️ Series JSON not found, using fallback');
        return null;
    }
}

// ─── FETCH TMDB DETAILS ───
async function fetchTMDBDetails(tmdbId) {
    try {
        const response = await fetch(
            `https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${TMDB_API_KEY}&language=en-US`
        );
        if (!response.ok) throw new Error(`TMDB API error: ${response.status}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('❌ TMDB fetch failed:', error);
        return null;
    }
}

// ===============================
// GENRE TEMPLATES
// ===============================
const genreTemplates = {
    action: ["🔥 Trending Action", "⚔ Action Classics", "💥 Explosive Action", "🕶 Spy & Military", "🌍 International Action", "⭐ Top Rated Action"],
    crime: ["🔥 Trending Crime", "🕵 Crime Thrillers", "🚔 Detective Stories", "💎 Hidden Crime Gems", "🌍 International Crime", "⭐ Top Rated Crime"],
    drama: ["🔥 Trending Drama", "🎭 Emotional Stories", "💎 Award Winners", "❤️ Family Drama", "🌍 International Drama", "⭐ Critics Choice"],
    comedy: ["😂 Trending Comedy", "🤣 Sitcom Favorites", "🍿 Feel Good Comedy", "🎉 Comedy Hits", "🌍 International Comedy", "⭐ Best Comedies"],
    scifi: ["🚀 Trending Sci-Fi", "👽 Alien Worlds", "🛰 Space Adventures", "🤖 AI & Future", "🧠 Mind Bending", "⭐ Sci-Fi Masterpieces"],
    thriller: ["😰 Trending Thrillers", "🔪 Psychological Thrillers", "🕵 Mystery Thrillers", "💣 Edge of Your Seat", "🌍 International Thrillers", "⭐ Top Rated Thrillers"],
    mystery: ["🔍 Trending Mystery", "🕵 Whodunit Classics", "👻 Paranormal Mystery", "🌙 Dark Secrets", "🌍 International Mystery", "⭐ Best Mysteries"],
    animation: ["🎨 Trending Animation", "🌟 Fan Favorites", "🏆 Award Winning", "🎬 Studio Classics", "🌍 International Animation", "⭐ Top Rated Animation"],
    anime: ["⛩ Trending Anime", "⚔ Shonen Hits", "🌸 Slice of Life", "🔮 Fantasy Anime", "🤖 Mecha & Sci-Fi", "⭐ Must Watch Anime"],
    family: ["👨‍👩‍👧 Family Favorites", "🧒 Kids & Teens", "🎠 Adventure for All", "💛 Heartwarming Stories", "🎉 Fun for Everyone", "⭐ Top Family Shows"],
    sitcom: ["📺 Trending Sitcoms", "😂 Classic Sitcoms", "🏠 Home & Office", "👫 Relationship Comedy", "🌍 International Sitcoms", "⭐ Best Sitcoms"],
    korean: ["🇰🇷 Trending K-Dramas", "💕 Romantic K-Dramas", "🕵 Korean Thrillers", "👑 Historical K-Dramas", "😂 Korean Comedy", "⭐ Top Rated K-Dramas"],
    japanese: ["🇯🇵 Trending J-Dramas", "🌸 Slice of Life", "⚔ Samurai & Ninja", "🔮 Fantasy J-Dramas", "😂 Japanese Comedy", "⭐ Top Rated J-Dramas"],
    indian: ["🇮🇳 Trending Indian", "🎭 Bollywood Drama", "😂 Indian Comedy", "🕵 Indian Crime", "👑 Indian Historical", "⭐ Top Indian Shows"],
    historical: ["📜 Trending Historical", "👑 Royal & Empire", "⚔ War Stories", "🏛 Ancient Civilizations", "🌍 World History", "⭐ Top Historical Dramas"],
    documentary: ["🎥 Trending Docs", "🌍 Nature & World", "🔬 Science & Tech", "👤 True Crime Docs", "🏆 Award Winning Docs", "⭐ Must Watch Documentaries"]
};

const sections = {
    trending: "trending",
    action: "action",
    crime: "crime",
    drama: "drama",
    comedy: "comedy",
    scifi: "scifi",
    top: "toprated"
};

// ===============================
// CREATE CARD
// ===============================
function createCard(series) {
    const card = document.createElement("div");
    card.className = "card";
    const poster = series.Poster && series.Poster !== "N/A"
        ? series.Poster
        : "images/placeholder.jpg";
    const genres = (series.genres || []).join(', ');

    card.setAttribute("data-title", series.Title || "");
    card.setAttribute("data-year", series.Year || "");
    card.setAttribute("data-rating", series.imdbRating || "");
    card.setAttribute("data-genres", genres);
    if (series.trailerKey) {
        card.setAttribute("data-trailer", series.trailerKey);
    }

    card.innerHTML = `
        <img src="${poster}" alt="${series.Title || 'Series'}" onerror="this.parentElement.style.display='none'">
        <div class="series-info">
            <h3>${series.Title || "Unknown"}</h3>
            <p>${series.Year || ""}</p>
        </div>
    `;

    card.onclick = () => {
        window.location.href = `search.html?movie=${encodeURIComponent(series.Title)}`;
    };

    return card;
}

// ===============================
// SHOW HOME SECTIONS
// ===============================
function showHomeSections() {
    document.getElementById("dynamicGenreSections").innerHTML = "";
    document.getElementById("dynamicGenreSections").style.display = "none";
    document.querySelectorAll(".series-section").forEach(section => {
        section.style.display = "block";
    });
    const firstSection = document.querySelector(".series-section");
    if (firstSection) firstSection.scrollIntoView({ behavior: "smooth" });
}

// ===============================
// SHOW GENRE
// ===============================
async function showGenre(category) {
    const container = document.getElementById("dynamicGenreSections");

    container.innerHTML = `
        <div style="text-align:center;padding:100px 0;font-size:1.1rem;color:#aaa;">
            Loading <strong style="color:white">${category}</strong> series...
        </div>`;
    container.style.display = "block";

    document.querySelectorAll(".series-section").forEach(section => {
        section.style.display = "none";
    });

    container.scrollIntoView({ behavior: "smooth" });

    try {
        const response = await fetch(`https://novastream-o3ri.onrender.com/api/series?category=${category}`);
        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
            container.innerHTML = `
                <div style="text-align:center;padding:100px 0;font-size:1.1rem;color:#aaa;">
                    No series found for <strong style="color:white">${category}</strong>.
                </div>`;
            return;
        }

        const titles = genreTemplates[category] || [`📺 ${category.charAt(0).toUpperCase() + category.slice(1)} Series`];
        container.innerHTML = "";

        for (let i = 0; i < titles.length; i++) {
            const rowId = `${category}Row${i}`;
            const section = document.createElement("section");
            section.className = "series-section";
            section.innerHTML = `<h2>${titles[i]}</h2><div class="series-row" id="${rowId}"></div>`;
            container.appendChild(section);

            const row = document.getElementById(rowId);
            const pool = shuffle(data);
            const start = (i * 6) % data.length;
            const items = [];
            for (let j = 0; j < 6; j++) {
                items.push(pool[(start + j) % pool.length]);
            }
            items.forEach(series => row.appendChild(createCard(series)));
        }

        attachPreviews();

    } catch (err) {
        console.error(err);
        container.innerHTML = `
            <div style="text-align:center;padding:100px 0;color:#e50914;">
                Could not connect to backend.
            </div>`;
    }
}

// ===============================
// HERO (Random on Refresh - NO AUTO-ROTATION)
// ===============================
const hero = document.getElementById("seriesHero");
const heroTitle = document.getElementById("seriesHeroTitle");
const heroYear = document.getElementById("seriesYear");
const heroDescription = document.getElementById("seriesHeroDescription");
const heroVideo = document.getElementById("hero-video");
const heroVideoSource = document.getElementById("hero-video-source");
const poster = document.getElementById('seriesPoster');
const heroContent = document.getElementById('heroContent');

// ─── PICK RANDOM SERIES ON PAGE LOAD ───
const randomSeries = getRandomSeries();

async function loadHero() {
    const s = randomSeries;

    if (heroContent) heroContent.classList.add("fade-out");
    heroVideo.style.opacity = 0;

    setTimeout(async () => {
        const details = await fetchTMDBDetails(s.tmdb);

        if (details) {
            document.getElementById('seriesHeroTitle').textContent = details.name || s.title;
            document.getElementById('seriesYear').textContent = details.first_air_date?.slice(0, 4) || s.year;
            document.getElementById('seriesHeroDescription').textContent = details.overview || s.description;

            const ratingEl = document.getElementById('seriesRating');
            if (ratingEl && details.vote_average) {
                ratingEl.textContent = `⭐ ${details.vote_average.toFixed(1)}`;
                ratingEl.style.display = 'inline';
            }

            const genresEl = document.getElementById('seriesGenres');
            if (genresEl) {
                const genres = (details.genres || []).map(g => g.name).slice(0, 3).join(' • ');
                genresEl.textContent = genres || s.genre;
            }

            if (poster && details.poster_path) {
                const posterUrl = `https://image.tmdb.org/t/p/original${details.poster_path}`;
                poster.src = posterUrl;
                poster.style.display = 'block';
                poster.style.opacity = '1';
                poster.style.transition = 'opacity 0.5s ease';
            }
        }



        // ─── USE SERIES.JSON FOR PREVIEW ───
        const seriesData = await loadSeriesData();
        let previewUrl = s.video; // fallback

        if (seriesData) {
            const match = seriesData.find(item => item.tmdb === s.tmdb);
            if (match && match.preview) {
                previewUrl = match.preview;
                console.log(`✅ Using series.json preview: ${previewUrl}`);
            } else {
                console.log(`⚠️ No preview found for TMDB ${s.tmdb}, using fallback`);
            }
        }

        heroVideoSource.src = previewUrl;
        heroVideo.load();

        setTimeout(() => {
            heroVideo.play().catch(() => { });
            heroVideo.style.opacity = 1;

            if (poster) {
                poster.style.opacity = '0';
                setTimeout(() => {
                    poster.style.display = 'none';
                }, 500);
            }

            if (heroContent) heroContent.classList.remove("fade-out");
        }, 3000);

    }, 500);
}

// ─── START HERO ───
loadHero();

// ─── NO AUTO-ROTATION ───

// ===============================
// LOAD STATIC HOME SECTIONS
// ===============================
async function loadSection(category, rowId) {
    try {
        const response = await fetch(`https://novastream-o3ri.onrender.com/api/series?category=${category}`);
        const data = await response.json();
        const row = document.getElementById(rowId);
        row.innerHTML = "";
        if (!Array.isArray(data)) return;
        data.forEach(series => {
            if (series.Response === "False") return;
            row.appendChild(createCard(series));
        });
        attachPreviews();
    } catch (err) {
        console.error("loadSection error:", err);
    }
}

loadSection(sections.trending, "trendingSeries");
loadSection(sections.action, "actionSeries");
loadSection(sections.crime, "crimeSeries");
loadSection(sections.drama, "dramaSeries");
loadSection(sections.comedy, "comedySeries");
loadSection(sections.scifi, "scifiSeries");
loadSection(sections.top, "topSeries");

// ─── LOAD SERIES JSON (for future use) ───
loadSeriesData();