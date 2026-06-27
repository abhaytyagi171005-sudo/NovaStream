const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(cors());

const getPremiumMovies = () =>
    getMovies().filter(x => x.premium && x.poster && x.poster !== "");

const getPremiumSeries = () =>
    getSeries().filter(x => x.premium && x.poster && x.poster !== "");

function loadCatalog(filename) {
    const filePath = path.join(__dirname, "catalog", filename);
    if (!fs.existsSync(filePath)) {
        console.warn(`⚠  ${filename} not found — run: node build-catalog.js`);
        return [];
    }
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    console.log(`✅  Loaded ${data.length} entries from ${filename}`);
    return data;
}

let CATALOG = loadCatalog("catalog.json");
const getMovies = () => CATALOG.filter(item => item.type === "movie");
const getSeries = () => CATALOG.filter(item => item.type === "series");

function shuffle(arr) {
    return [...arr].sort(() => Math.random() - 0.5);
}

function mapCategory(category) {
    const map = {
        "scifi": "sci-fi",
        "thriller": "crime",
        "sitcom": "comedy",
        "korean": "drama",
        "japanese": "animation",
        "indian": "drama",
        "historical": "war & politics",
        "anime": "animation",
        "superhero": "action & adventure",
        "bollywood": "drama",
        "hindi": "drama",
        "tamil": "drama",
        "hollywood": "drama",
        "standup": "comedy",
        "sports": "documentary",
        "fantasy": "sci-fi",
        "action": "action & adventure"
    };
    return map[category.toLowerCase()] || category.toLowerCase();
}
function mapToResponse(item) {
    return {
        Title: item.title,
        Year: item.year,
        Poster: item.poster || "N/A",
        Backdrop: item.backdrop || "N/A",
        Plot: item.description,
        imdbRating: item.rating ? String(item.rating) : "N/A",
        Language: item.language,
        genres: item.genres,
        trending: item.trending,
        tmdbId: item.id,
        Response: "True",
        Type: item.type
    };
}

app.get("/", (req, res) => res.send("NovaStream Backend Running ✅"));
app.get("/api/test", (req, res) => res.json({ message: "Backend Connected Successfully" }));

app.get("/api/series", (req, res) => {
    const { category, limit = 20 } = req.query;

    let results = getPremiumSeries();

    if (category) {
        const cat = mapCategory(category);
        results = getSeries().filter(s =>
            (s.genres || []).some(g => g.toLowerCase().includes(cat))
        );
    }

    if (results.length === 0) return res.json([]);

    const selected = shuffle(results).slice(0, parseInt(limit));
    res.json(selected.map(mapToResponse));
});

app.get("/api/movies", (req, res) => {
    const { category, limit = 20 } = req.query;

    let results = getPremiumMovies();

    if (category) {
        const cat = mapCategory(category);
        results = getMovies().filter(movie =>
            (movie.genres || []).some(g => g.toLowerCase().includes(cat))
        );
    }

    if (results.length === 0) return res.json([]);

    const selected = shuffle(results).slice(0, parseInt(limit));
    res.json(selected.map(mapToResponse));
});

app.get("/api/trending", (req, res) => {
    const { type = "all", limit = 20 } = req.query;

    let results = [];

    if (type === "movie" || type === "all") {
        results.push(...getPremiumMovies().filter(m => m.trending));
    }

    if (type === "series" || type === "all") {
        results.push(...getPremiumSeries().filter(s => s.trending));
    }

    const selected = shuffle(results).slice(0, parseInt(limit));
    res.json(selected.map(mapToResponse));
});

app.get("/api/search", (req, res) => {
    const { q, type = "all", limit = 30 } = req.query;

    if (!q || q.trim() === "") return res.json([]);

    const query = q.toLowerCase().trim();
    let pool = [];

    if (type === "movie" || type === "all") pool.push(...getMovies());
    if (type === "series" || type === "all") pool.push(...getSeries());

    const results = pool
        .filter(item => item.title.toLowerCase().includes(query))
        .slice(0, parseInt(limit));

    res.json(results.map(mapToResponse));
});

app.get("/api/stats", (req, res) => {
    const genres = ["trending", "action", "crime", "drama", "comedy", "scifi",
        "thriller", "mystery", "animation", "anime", "family",
        "sitcom", "korean", "japanese", "indian", "historical", "documentary"];

    const stats = {
        totalMovies: getMovies().length,
        totalSeries: getSeries().length,
        movieGenres: {},
        seriesGenres: {}
    };

    genres.forEach(g => {
        const mapped = mapCategory(g);
        stats.movieGenres[g] = getMovies().filter(m =>
            (m.genres || []).some(genre => genre.toLowerCase().includes(mapped))
        ).length;

        stats.seriesGenres[g] = getSeries().filter(s =>
            (s.genres || []).some(genre => genre.toLowerCase().includes(mapped))
        ).length;
    });

    res.json(stats);
});

app.post("/api/reload", (req, res) => {
    CATALOG = loadCatalog("catalog.json");
    res.json({ message: "Catalog reloaded", total: CATALOG.length });
});

app.listen(5000, () => {
    console.log("\n🚀  Server running on http://localhost:5000");
    console.log(`🎬 Total Titles: ${CATALOG.length}`);
    console.log(`📽 Movies: ${getMovies().length}`);
    console.log(`📺 Series: ${getSeries().length}`);
    if (CATALOG.length === 0) {
        console.log("\n⚠   Empty catalog! Run this first:");
        console.log("    node build-catalog.js\n");
    }
});