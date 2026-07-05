const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

// ─── DEFINE APP FIRST ───
const app = express();
app.use(cors());

// ─── CATALOG LOADER ───
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

// ─── ROUTES ───
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

// ─── ORIGINAL HERO ENDPOINT ───
app.get("/api/hero", async (req, res) => {
    try {
        let movies = getPremiumMovies();
        if (movies.length === 0) movies = getMovies();
        if (movies.length === 0) return res.json([]);

        const shuffled = shuffle(movies);
        const selected = shuffled.slice(0, 5);

        const TMDB_API_KEY = process.env.TMDB_API_KEY;

        function buildYouTubeEmbedUrl(key) {
            if (!key) return null;
            return `https://www.youtube-nocookie.com/embed/${key}?autoplay=1&mute=1&loop=1&playlist=${key}&start=5&end=13&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1`;
        }

        if (!TMDB_API_KEY) {
            console.warn('⚠️ TMDB_API_KEY not set - using catalog trailerKey');
            const basicMovies = selected.map(movie => ({
                id: movie.id,
                title: movie.title,
                year: movie.year,
                description: movie.description || "No description available",
                poster: movie.poster || "N/A",
                backdrop: movie.backdrop || movie.poster || "N/A",
                rating: movie.rating && parseFloat(movie.rating) > 0 ? parseFloat(movie.rating).toFixed(1) : "N/A",
                genre: movie.genres && movie.genres.length > 0 ? movie.genres[0] : "Movie",
                genres: movie.genres || [],
                trailerKey: movie.trailerKey || null,
                videoUrl: buildYouTubeEmbedUrl(movie.trailerKey),
                hasVideo: !!movie.trailerKey,
                language: movie.language || "en"
            }));
            return res.json(basicMovies);
        }

        const heroMovies = await Promise.all(selected.map(async (movie) => {
            let videoKey = null;
            let videoType = null;
            const tmdbId = movie.tmdbId || movie.id;

            try {
                const videoResponse = await fetch(
                    `https://api.themoviedb.org/3/movie/${tmdbId}/videos?api_key=${TMDB_API_KEY}&language=en-US`
                );
                if (videoResponse.ok) {
                    const videoData = await videoResponse.json();
                    const videos = videoData.results || [];
                    const priority = ['Trailer', 'Teaser', 'Clip', 'Featurette'];
                    let bestVideo = null;
                    for (const type of priority) {
                        const found = videos.find(v => v.type === type && v.site === 'YouTube');
                        if (found) { bestVideo = found; break; }
                    }
                    if (!bestVideo) bestVideo = videos.find(v => v.site === 'YouTube') || videos[0];
                    if (bestVideo && bestVideo.key) {
                        videoKey = bestVideo.key;
                        videoType = bestVideo.type || 'Trailer';
                        console.log(`✅ Found ${videoType} for ${movie.title}: ${videoKey}`);
                    }
                }
            } catch (error) {
                console.warn(`⚠️ Could not fetch video for ${movie.title}:`, error.message);
            }

            if (!videoKey && movie.trailerKey) {
                videoKey = movie.trailerKey;
                videoType = 'Trailer (catalog)';
                console.log(`📦 Using catalog trailerKey for ${movie.title}: ${videoKey}`);
            }

            const videoUrl = buildYouTubeEmbedUrl(videoKey);

            return {
                id: movie.id,
                title: movie.title,
                year: movie.year,
                description: movie.description || "No description available",
                poster: movie.poster || "N/A",
                backdrop: movie.backdrop || movie.poster || "N/A",
                rating: movie.rating && parseFloat(movie.rating) > 0 ? parseFloat(movie.rating).toFixed(1) : "N/A",
                genre: movie.genres && movie.genres.length > 0 ? movie.genres[0] : "Movie",
                genres: movie.genres || [],
                trailerKey: videoKey,
                videoUrl: videoUrl,
                videoType: videoType || 'Trailer',
                hasVideo: !!videoUrl,
                language: movie.language || "en",
                tmdbId: tmdbId
            };
        }));

        res.json(heroMovies);
    } catch (error) {
        console.error('❌ Error in /api/hero:', error);
        res.status(500).json({ error: 'Failed to fetch hero movies' });
    }
});

// ─── NEW: HD-ONLY HERO ENDPOINT ───
// ─── NEW: HD-ONLY HERO ENDPOINT (2025-2026 Trending) ───
app.get("/api/hero-hd", async (req, res) => {
    try {
        let movies = getPremiumMovies();
        if (movies.length === 0) movies = getMovies();
        if (movies.length === 0) return res.json([]);

        // ─── HD FILTER + 2025-2026 ONLY ───
        const hdMovies = movies.filter(movie => {
            // Must have poster
            if (!movie.poster || movie.poster === "N/A" || movie.poster === "") return false;

            // Must have backdrop
            if (!movie.backdrop || movie.backdrop === "N/A" || movie.backdrop === "") return false;

            // Poster must be from TMDB (HD quality)
            if (!movie.poster.includes('image.tmdb.org')) return false;

            // Backdrop must be from TMDB
            if (!movie.backdrop.includes('image.tmdb.org')) return false;

            // Must have a rating (popularity check)
            if (!movie.rating || parseFloat(movie.rating) < 6.0) return false;

            // ─── ONLY 2025-2026 MOVIES ───
            const year = parseInt(movie.year);
            if (isNaN(year) || year < 2025 || year > 2026) return false;

            // Must be trending or popular
            if (!movie.trending && !movie.popular) return false;

            return true;
        });

        if (hdMovies.length === 0) {
            console.warn('⚠️ No 2025-2026 HD movies found, falling back to 2024+');
            // Fallback: try 2024+
            const fallbackMovies = movies.filter(movie => {
                if (!movie.poster || movie.poster === "N/A" || movie.poster === "") return false;
                if (!movie.backdrop || movie.backdrop === "N/A" || movie.backdrop === "") return false;
                if (!movie.poster.includes('image.tmdb.org')) return false;
                if (!movie.backdrop.includes('image.tmdb.org')) return false;
                if (!movie.rating || parseFloat(movie.rating) < 6.0) return false;
                const year = parseInt(movie.year);
                if (isNaN(year) || year < 2024) return false;
                if (!movie.trending && !movie.popular) return false;
                return true;
            });

            if (fallbackMovies.length === 0) {
                return res.json([]);
            }

            const shuffled = shuffle(fallbackMovies);
            const selected = shuffled.slice(0, 5);

            // Return fallback movies with YouTube embeds
            const TMDB_API_KEY = process.env.TMDB_API_KEY;
            function buildYouTubeEmbedUrl(key) {
                if (!key) return null;
                return `https://www.youtube-nocookie.com/embed/${key}?autoplay=1&mute=1&loop=1&playlist=${key}&start=5&end=13&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1`;
            }

            const heroMovies = await Promise.all(selected.map(async (movie) => {
                let videoKey = movie.trailerKey || null;
                let videoType = 'Trailer (catalog)';
                const videoUrl = buildYouTubeEmbedUrl(videoKey);

                return {
                    id: movie.id,
                    title: movie.title,
                    year: movie.year,
                    description: movie.description || "No description available",
                    poster: movie.poster,
                    backdrop: movie.backdrop,
                    rating: movie.rating && parseFloat(movie.rating) > 0 ? parseFloat(movie.rating).toFixed(1) : "N/A",
                    genre: movie.genres && movie.genres.length > 0 ? movie.genres[0] : "Movie",
                    genres: movie.genres || [],
                    trailerKey: videoKey,
                    videoUrl: videoUrl,
                    videoType: videoType || 'Trailer',
                    hasVideo: !!videoUrl,
                    language: movie.language || "en",
                    tmdbId: movie.tmdbId || movie.id
                };
            }));

            console.log(`✅ Hero-HD (fallback): ${heroMovies.length} 2024+ movies sent`);
            return res.json(heroMovies);
        }

        console.log(`✅ Found ${hdMovies.length} trending 2025-2026 HD movies`);

        // Shuffle and pick 5 random
        const shuffled = shuffle(hdMovies);
        const selected = shuffled.slice(0, 5);

        const TMDB_API_KEY = process.env.TMDB_API_KEY;

        function buildYouTubeEmbedUrl(key) {
            if (!key) return null;
            return `https://www.youtube-nocookie.com/embed/${key}?autoplay=1&mute=1&loop=1&playlist=${key}&start=5&end=13&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1`;
        }

        const heroMovies = await Promise.all(selected.map(async (movie) => {
            let videoKey = null;
            let videoType = null;
            const tmdbId = movie.tmdbId || movie.id;

            if (TMDB_API_KEY) {
                try {
                    const videoResponse = await fetch(
                        `https://api.themoviedb.org/3/movie/${tmdbId}/videos?api_key=${TMDB_API_KEY}&language=en-US`
                    );
                    if (videoResponse.ok) {
                        const videoData = await videoResponse.json();
                        const videos = videoData.results || [];
                        const priority = ['Trailer', 'Teaser', 'Clip', 'Featurette'];
                        let bestVideo = null;
                        for (const type of priority) {
                            const found = videos.find(v => v.type === type && v.site === 'YouTube');
                            if (found) { bestVideo = found; break; }
                        }
                        if (!bestVideo) bestVideo = videos.find(v => v.site === 'YouTube') || videos[0];
                        if (bestVideo && bestVideo.key) {
                            videoKey = bestVideo.key;
                            videoType = bestVideo.type || 'Trailer';
                        }
                    }
                } catch (error) {
                    console.warn(`⚠️ Could not fetch video for ${movie.title}:`, error.message);
                }
            }

            if (!videoKey && movie.trailerKey) {
                videoKey = movie.trailerKey;
                videoType = 'Trailer (catalog)';
            }

            const videoUrl = buildYouTubeEmbedUrl(videoKey);

            return {
                id: movie.id,
                title: movie.title,
                year: movie.year,
                description: movie.description || "No description available",
                poster: movie.poster,
                backdrop: movie.backdrop,
                rating: movie.rating && parseFloat(movie.rating) > 0 ? parseFloat(movie.rating).toFixed(1) : "N/A",
                genre: movie.genres && movie.genres.length > 0 ? movie.genres[0] : "Movie",
                genres: movie.genres || [],
                trailerKey: videoKey,
                videoUrl: videoUrl,
                videoType: videoType || 'Trailer',
                hasVideo: !!videoUrl,
                language: movie.language || "en",
                tmdbId: tmdbId
            };
        }));

        console.log(`✅ Hero-HD: ${heroMovies.length} trending 2025-2026 HD movies sent`);
        res.json(heroMovies);
    } catch (error) {
        console.error('❌ Error in /api/hero-hd:', error);
        res.status(500).json({ error: 'Failed to fetch HD hero movies' });
    }
});

// ─── START SERVER ───
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`🎬 Total: ${CATALOG.length} | 📽 Movies: ${getMovies().length} | 📺 Series: ${getSeries().length}`);
});