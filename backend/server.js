const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());

function loadCatalog(filename) {
    const filePath = path.join(__dirname, "catalog", filename);
    if (!fs.existsSync(filePath)) {
        console.warn(`⚠  ${filename} not found`);
        return [];
    }
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    console.log(`✅  Loaded ${data.length} entries from ${filename}`);
    return data;
}

let CATALOG = loadCatalog("catalog.json");
const getMovies = () => CATALOG.filter(item => item.type === "movie");
const getSeries = () => CATALOG.filter(item => item.type === "series");
const getPremiumMovies = () => getMovies().filter(x => x.premium && x.poster && x.poster !== "");
const getPremiumSeries = () => getSeries().filter(x => x.premium && x.poster && x.poster !== "");

function shuffle(arr) {
    return [...arr].sort(() => Math.random() - 0.5);
}

function mapMovieCategory(category) {
    const map = {
        "scifi": "science fiction",
        "anime": "animation",
        "superhero": "action",
        "bollywood": "drama",
        "hindi": "drama",
        "tamil": "drama",
        "hollywood": "drama",
        "standup": "comedy",
        "sports": "documentary",
        "fantasy": "fantasy",
        "historical": "history"
    };
    return map[category.toLowerCase()] || category.toLowerCase();
}

function mapSeriesCategory(category) {
    const map = {
        "scifi": "sci-fi",
        "fantasy": "sci-fi",
        "action": "action & adventure",
        "superhero": "action & adventure",
        "anime": "animation",
        "korean": "drama",
        "japanese": "animation",
        "indian": "drama",
        "hindi": "drama",
        "tamil": "drama",
        "bollywood": "drama",
        "standup": "comedy",
        "sitcom": "comedy",
        "historical": "war & politics",
        "thriller": "crime",
        "sports": "documentary"
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
        trailerKey: item.trailerKey || null,
        Response: "True",
        Type: item.type
    };
}
app.get("/", (req, res) => res.send("NovaStream Backend Running ✅"));
app.get("/api/test", (req, res) => res.json({ message: "Backend Connected Successfully" }));

app.get("/api/movies", (req, res) => {
    const { category, limit = 20 } = req.query;
    let results = getPremiumMovies();

    if (category) {
        if (category === "trending") {
            results = getPremiumMovies().filter(m => m.trending);
        } else {
            const cat = mapMovieCategory(category);
            results = getPremiumMovies().filter(movie =>
                (movie.genres || []).some(g => g.toLowerCase().includes(cat))
            );
        }
    }

    if (results.length === 0) return res.json([]);
    const selected = shuffle(results).slice(0, parseInt(limit));
    res.json(selected.map(mapToResponse));
});

app.get("/api/series", (req, res) => {
    const { category, limit = 20 } = req.query;
    let results = getPremiumSeries();

    if (category) {
        if (category === "trending") {
            results = getPremiumSeries().filter(s => s.trending);
        } else {
            const cat = mapSeriesCategory(category);
            results = getSeries().filter(s =>
                (s.genres || []).some(g => g.toLowerCase().includes(cat))
            );
        }
    }

    if (results.length === 0) return res.json([]);
    const selected = shuffle(results).slice(0, parseInt(limit));
    res.json(selected.map(mapToResponse));
});

app.get("/api/trending", (req, res) => {
    const { type = "all", limit = 20 } = req.query;
    let results = [];

    if (type === "movie" || type === "all") results.push(...getPremiumMovies().filter(m => m.trending));
    if (type === "series" || type === "all") results.push(...getPremiumSeries().filter(s => s.trending));

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
    const genres = ["action", "crime", "drama", "comedy", "scifi", "thriller",
        "mystery", "animation", "anime", "family", "documentary"];

    const stats = {
        totalMovies: getMovies().length,
        totalSeries: getSeries().length,
        movieGenres: {},
        seriesGenres: {}
    };

    genres.forEach(g => {
        const mcat = mapMovieCategory(g);
        const scat = mapSeriesCategory(g);
        stats.movieGenres[g] = getPremiumMovies().filter(m =>
            (m.genres || []).some(genre => genre.toLowerCase().includes(mcat))
        ).length;
        stats.seriesGenres[g] = getPremiumSeries().filter(s =>
            (s.genres || []).some(genre => genre.toLowerCase().includes(scat))
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
    console.log(`🎬 Total: ${CATALOG.length} | 📽 Movies: ${getMovies().length} | 📺 Series: ${getSeries().length}`);
});
// ─── HERO BANNER ENDPOINT ───
app.get("/api/hero", (req, res) => {
    // Get all premium movies
    let movies = getPremiumMovies();

    // If no premium movies, use all movies
    if (movies.length === 0) {
        movies = getMovies();
    }

    if (movies.length === 0) {
        return res.json([]);
    }

    // Shuffle and pick 5 random movies
    const shuffled = shuffle(movies);
    const selected = shuffled.slice(0, 5);

    // Map to hero format with YouTube embed
    const heroMovies = selected.map(movie => {
        // Build YouTube embed URL with 8-second clip
        let trailerUrl = null;

        if (movie.trailerKey) {
            // YouTube embed with 8-second loop (starts at 5s, ends at 13s)
            trailerUrl = `https://www.youtube.com/embed/${movie.trailerKey}?autoplay=1&mute=1&loop=1&playlist=${movie.trailerKey}&start=5&end=13&controls=0&modestbranding=1&rel=0&showinfo=0`;
        }

        // Get the first genre or use "Movie" as fallback
        const primaryGenre = movie.genres && movie.genres.length > 0
            ? movie.genres[0]
            : "Movie";

        // Format rating
        const rating = movie.rating && parseFloat(movie.rating) > 0
            ? parseFloat(movie.rating).toFixed(1)
            : "N/A";

        return {
            id: movie.id,
            title: movie.title,
            year: movie.year,
            description: movie.description || "No description available",
            poster: movie.poster || "N/A",
            backdrop: movie.backdrop || movie.poster || "N/A",
            rating: rating,
            genre: primaryGenre,
            genres: movie.genres || [],
            trailer: trailerUrl,
            hasTrailer: !!trailerUrl,
            language: movie.language || "en"
        };
    });

    res.json(heroMovies);
});