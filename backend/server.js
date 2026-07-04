// ─── HERO BANNER ENDPOINT (with TMDB video fetch) ───
app.get("/api/hero", async (req, res) => {
    try {
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

        const TMDB_API_KEY = process.env.TMDB_API_KEY;

        // If no TMDB API key, fall back to catalog trailerKey
        if (!TMDB_API_KEY) {
            console.warn('⚠️ TMDB_API_KEY not set, using catalog trailerKey');
            return res.json(selected.map(movie => {
                let trailerUrl = null;
                if (movie.trailerKey) {
                    trailerUrl = `https://www.youtube.com/embed/${movie.trailerKey}?autoplay=1&mute=1&loop=1&playlist=${movie.trailerKey}&start=5&end=13&controls=0&modestbranding=1&rel=0&showinfo=0`;
                }
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
                    trailer: trailerUrl,
                    hasTrailer: !!trailerUrl,
                    language: movie.language || "en",
                    tmdbId: movie.tmdbId || movie.id
                };
            }));
        }

        // Fetch videos from TMDB for each movie
        const heroMovies = await Promise.all(selected.map(async (movie) => {
            let trailerUrl = null;
            let trailerKey = null;
            let videoType = null;

            const tmdbId = movie.tmdbId || movie.id;

            try {
                // Fetch videos from TMDB
                const videoResponse = await fetch(
                    `https://api.themoviedb.org/3/movie/${tmdbId}/videos?api_key=${TMDB_API_KEY}&language=en-US`
                );

                if (videoResponse.ok) {
                    const videoData = await videoResponse.json();
                    const videos = videoData.results || [];

                    // Priority: Trailer > Teaser > Clip > Featurette
                    const priority = ['Trailer', 'Teaser', 'Clip', 'Featurette'];
                    let bestVideo = null;

                    for (const type of priority) {
                        const found = videos.find(v =>
                            v.type === type && v.site === 'YouTube'
                        );
                        if (found) {
                            bestVideo = found;
                            break;
                        }
                    }

                    // If no preferred type, take first YouTube video
                    if (!bestVideo) {
                        bestVideo = videos.find(v => v.site === 'YouTube') || videos[0];
                    }

                    if (bestVideo && bestVideo.key) {
                        trailerKey = bestVideo.key;
                        videoType = bestVideo.type || 'Trailer';

                        // Build YouTube embed URL with 8-second loop
                        trailerUrl = `https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&loop=1&playlist=${trailerKey}&start=5&end=13&controls=0&modestbranding=1&rel=0&showinfo=0`;

                        console.log(`✅ Found ${videoType} for ${movie.title}: ${trailerKey}`);
                    }
                }
            } catch (error) {
                console.warn(`⚠️ Could not fetch video for ${movie.title}:`, error.message);
            }

            // Fallback: use catalog trailerKey if TMDB fetch failed
            if (!trailerUrl && movie.trailerKey) {
                trailerKey = movie.trailerKey;
                trailerUrl = `https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&loop=1&playlist=${trailerKey}&start=5&end=13&controls=0&modestbranding=1&rel=0&showinfo=0`;
                videoType = 'Trailer (catalog)';
                console.log(`📦 Using catalog trailerKey for ${movie.title}: ${trailerKey}`);
            }

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
                trailer: trailerUrl,
                trailerKey: trailerKey,
                videoType: videoType || 'Trailer',
                hasTrailer: !!trailerUrl,
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