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
// ── Load catalogs from disk ───────────────────────────────────
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

// ── Helpers ───────────────────────────────────────────────────
function shuffle(arr) {
    return [...arr].sort(() => Math.random() - 0.5);
}

function mapToResponse(item) {
    return {
        // Keep OMDB-compatible field names so your frontend works unchanged
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

// ── Routes ────────────────────────────────────────────────────

app.get("/", (req, res) => res.send("NovaStream Backend Running ✅"));
app.get("/api/test", (req, res) => res.json({ message: "Backend Connected Successfully" }));

// ── SERIES endpoint ───────────────────────────────────────────
// GET /api/series?category=action
// GET /api/series?category=trending
// GET /api/series          (returns random 20)
app.get("/api/series", (req, res) => {
    const { category, limit = 20 } = req.query;

    let results = getPremiumSeries();

    if (category) {
        results = getSeries().filter(s => s.genres.includes(category.toLowerCase()));
    }

    if (results.length === 0) {
        return res.json([]);
    }

    const selected = shuffle(results).slice(0, parseInt(limit));
    res.json(selected.map(mapToResponse));
});

// ── MOVIES endpoint ───────────────────────────────────────────
// GET /api/movies?category=action
// GET /api/movies?category=trending
// GET /api/movies          (returns random 20)
app.get("/api/movies", (req, res) => {
    const { category, limit = 20 } = req.query;

    let results = getPremiumMovies();

    if (category) {
        if (category) {
            const cat = category.toLowerCase();

            results = getMovies().filter(movie =>
                (movie.genres || []).some(g =>
                    g.toLowerCase().includes(cat)
                )
            );
        }
    }

    if (results.length === 0) {
        return res.json([]);
    }

    const selected = shuffle(results).slice(0, parseInt(limit));
    res.json(selected.map(mapToResponse));
});

// ── TRENDING endpoint ─────────────────────────────────────────
// GET /api/trending?type=movie|series|all
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

// ── SEARCH endpoint ───────────────────────────────────────────
// GET /api/search?q=breaking+bad&type=series|movie|all
app.get("/api/search", (req, res) => {
    const { q, type = "all", limit = 30 } = req.query;

    if (!q || q.trim() === "") {
        return res.json([]);
    }

    const query = q.toLowerCase().trim();
    let pool = [];

    if (type === "movie" || type === "all") pool.push(...getMovies());
    if (type === "series" || type === "all") pool.push(...getSeries());

    const results = pool
        .filter(item => item.title.toLowerCase().includes(query))
        .slice(0, parseInt(limit));

    res.json(results.map(mapToResponse));
});

// ── CATALOG STATS ─────────────────────────────────────────────
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
        stats.movieGenres[g] = getMovies().filter(m =>
            (m.genres || []).includes(g)
        ).length;

        stats.seriesGenres[g] = getSeries().filter(s =>
            (s.genres || []).includes(g)
        ).length;
    });

    res.json(stats);
});

// ── RELOAD catalog without restarting server ──────────────────
app.post("/api/reload", (req, res) => {
    CATALOG = loadCatalog("catalog.json");
    res.json({
        message: "Catalog reloaded",
        total: CATALOG.length
    });
});

// ─────────────────────────────────────────────────────────────
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
