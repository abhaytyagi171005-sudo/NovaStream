// ===============================
// FEATURED SERIES
// ===============================
function shuffle(array) {
    return [...array].sort(() => Math.random() - 0.5);
}

const featuredSeries = [
    {
        title: "Breaking Bad",
        year: "2008",
        genre: "Crime • Drama",
        description: "A chemistry teacher diagnosed with cancer begins producing methamphetamine with a former student.",
        banner: "images/banners/breakingbad-banner.jpg",
        video: "images/breakingbad-preview.mp4"
    },
    {
        title: "Stranger Things",
        year: "2016",
        genre: "Sci-Fi • Horror",
        description: "A group of kids uncover terrifying supernatural mysteries in their small town.",
        banner: "images/banners/strangerthings-banner.jpg",
        video: "images/strangerthings-preview.mp4"
    },
    {
        title: "Dark",
        year: "2017",
        genre: "Mystery • Sci-Fi",
        description: "The disappearance of two children exposes secrets that span several generations.",
        banner: "images/banners/dark-banner.jpg",
        video: "images/dark-preview.mp4"
    },
    {
        title: "Peaky Blinders",
        year: "2013",
        genre: "Crime • Drama",
        description: "Tommy Shelby leads one of the most feared gangs in post-war Birmingham.",
        banner: "images/banners/peaky-banner.jpg",
        video: "images/peakyblinders-preview.mp4"
    },
    {
        title: "Money Heist",
        year: "2017",
        genre: "Crime • Thriller",
        description: "Eight robbers lock themselves inside the Royal Mint under the Professor's plan.",
        banner: "images/banners/moneyheist-banner.jpg",
        video: "images/moneyheist-preview.mp4"
    }
];

// ===============================
// GENRE TEMPLATES — ALL 16 CATEGORIES
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

// ===============================
// SECTIONS MAPPING
// ===============================
const sections = {
    trending: "trending",
    action: "action",
    crime: "crime",
    drama: "drama",
    comedy: "comedy",
    scifi: "scifi",
    top: "toprated"
};

// Static sections are visible by default on page load — no hiding needed

// ===============================
// FIX 2: ALL SERIES — scroll to sections instead of top
// ===============================
function showHomeSections() {
    document.getElementById("dynamicGenreSections").innerHTML = "";
    document.getElementById("dynamicGenreSections").style.display = "none";

    document.querySelectorAll(".series-section").forEach(section => {
        section.style.display = "block";
    });

    // Scroll to first section (below hero), not page top
    const firstSection = document.querySelector(".series-section");
    if (firstSection) {
        firstSection.scrollIntoView({ behavior: "smooth" });
    }
}

// ===============================
// FIX 3 & 4: SHOW GENRE — all categories work
// ===============================
async function showGenre(category) {
    const container = document.getElementById("dynamicGenreSections");

    // Show loading state immediately and scroll
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
        const response = await fetch(`http://localhost:5000/api/series?category=${category}`);
        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
            container.innerHTML = `
                <div style="text-align:center;padding:100px 0;font-size:1.1rem;color:#aaa;">
                    No series found for <strong style="color:white">${category}</strong>.<br>
                    <span style="font-size:.85rem;color:#666;margin-top:10px;display:block">
                        Make sure your series.json entries have <code>"genres": ["${category}"]</code>
                    </span>
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
            // Loop back if fewer than 36 items in catalog for this genre
            const pool = shuffle(data);
            const start = (i * 6) % data.length;
            const items = [];
            for (let j = 0; j < 6; j++) {
                items.push(pool[(start + j) % pool.length]);
            }
            items.forEach(series => row.appendChild(createCard(series)));
        }

    } catch (err) {
        console.error(err);
        container.innerHTML = `
            <div style="text-align:center;padding:100px 0;color:#e50914;">
                Could not connect to backend.<br>
                <span style="font-size:.85rem;color:#888">Make sure the server is running on port 5000.</span>
            </div>`;
    }
}

// ===============================
// CREATE CARD
// ===============================
function createCard(series) {
    const card = document.createElement("div");
    card.className = "card";
    const poster = series.Poster && series.Poster !== "N/A"
        ? series.Poster
        : "images/placeholder.jpg";
    card.innerHTML = `
        <img src="${poster}" alt="${series.Title || 'Series'}">
        <div class="series-info">
            <h3>${series.Title || "Unknown"}</h3>
            <p>${series.Year || ""}</p>
        </div>
    `;
    return card;
}

// ===============================
// HERO ROTATION
// ===============================
const hero = document.getElementById("seriesHero");
const heroTitle = document.getElementById("seriesHeroTitle");
const heroYear = document.getElementById("seriesHeroYear");
const heroDescription = document.getElementById("seriesHeroDescription");
const heroVideo = document.getElementById("hero-video");
const heroVideoSource = document.getElementById("hero-video-source");

let heroIndex = 0;

function loadHero(index) {
    hero.querySelector(".hero-content").classList.add("fade-out");
    heroVideo.style.opacity = 0;

    setTimeout(() => {
        const s = featuredSeries[index];
        hero.style.backgroundImage =
            `linear-gradient(to right, rgba(0,0,0,.92), rgba(0,0,0,.35)), url('${s.banner}')`;
        heroTitle.textContent = s.title;
        heroYear.textContent = s.year;
        document.querySelector(".series-meta span:last-child").textContent = s.genre;
        heroDescription.textContent = s.description;

        heroVideoSource.src = s.video;
        heroVideo.load();
        heroVideo.oncanplay = () => {
            heroVideo.style.opacity = 1;
            heroVideo.play().catch(() => { });
        };
        hero.querySelector(".hero-content").classList.remove("fade-out");
    }, 700);
}

loadHero(heroIndex);
setInterval(() => {
    heroIndex = (heroIndex + 1) % featuredSeries.length;
    loadHero(heroIndex);
}, 6800);

// ===============================
// LOAD STATIC HOME SECTIONS
// ===============================
async function loadSection(category, rowId) {
    try {
        const response = await fetch(`http://localhost:5000/api/series?category=${category}`);
        const data = await response.json();
        const row = document.getElementById(rowId);
        row.innerHTML = "";
        if (!Array.isArray(data)) return;
        data.forEach(series => {
            if (series.Response === "False") return;
            row.appendChild(createCard(series));
        });
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