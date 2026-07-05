const fs = require('fs');
const path = require('path');
const axios = require('axios');

const TMDB_API_KEY = process.env.TMDB_API_KEY;

// ─── FETCH TRENDING MOVIES ───
async function fetchTrendingMovies() {
    if (!TMDB_API_KEY) {
        console.error('❌ TMDB_API_KEY not set');
        return [];
    }

    try {
        const response = await axios.get(
            `https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_API_KEY}&language=en-US`
        );
        return response.data.results || [];
    } catch (error) {
        console.error('Error fetching trending:', error.message);
        return [];
    }
}

// ─── FETCH MOVIE TRAILER ───
async function fetchTrailer(movieId) {
    try {
        const response = await axios.get(
            `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${TMDB_API_KEY}&language=en-US`
        );
        const trailer = response.data.results?.find(v =>
            v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
        );
        return trailer?.key || null;
    } catch (error) {
        return null;
    }
}

// ─── DOWNLOAD FILE ───
async function downloadFile(url, outputPath) {
    try {
        const response = await axios({
            method: 'get',
            url: url,
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(outputPath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    } catch (error) {
        console.error(`   ⚠️ Download failed:`, error.message);
        throw error;
    }
}

// ─── CREATE SLUG ───
function createSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// ─── BUILD YOUTUBE EMBED URL ───
function buildYouTubeEmbedUrl(key) {
    if (!key) return null;
    return `https://www.youtube-nocookie.com/embed/${key}?autoplay=1&mute=1&loop=1&playlist=${key}&start=5&end=13&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1`;
}

// ─── MAIN ───
async function main() {
    console.log('🎬 Fetching trending movies from TMDB...');
    const movies = await fetchTrendingMovies();

    if (!movies || movies.length === 0) {
        console.error('❌ No movies found');
        return;
    }

    console.log(`📊 Found ${movies.length} trending movies`);
    console.log('🔍 Filtering: 2025-2026 + HD Poster + Trailer\n');

    // ─── STRICT FILTER ───
    const qualifiedMovies = [];

    for (const movie of movies) {
        const year = parseInt(movie.release_date?.slice(0, 4));

        if (isNaN(year) || year < 2025 || year > 2026) {
            console.log(`❌ ${movie.title} - Skipped (Year: ${year || 'N/A'})`);
            continue;
        }

        if (!movie.poster_path) {
            console.log(`❌ ${movie.title} - Skipped (No poster)`);
            continue;
        }

        if (!movie.backdrop_path) {
            console.log(`❌ ${movie.title} - Skipped (No backdrop)`);
            continue;
        }

        if (!movie.vote_count || movie.vote_count < 100) {
            console.log(`❌ ${movie.title} - Skipped (Low popularity: ${movie.vote_count || 0} votes)`);
            continue;
        }

        const trailerKey = await fetchTrailer(movie.id);
        if (!trailerKey) {
            console.log(`❌ ${movie.title} - Skipped (No trailer)`);
            continue;
        }

        qualifiedMovies.push({
            ...movie,
            trailerKey: trailerKey
        });

        console.log(`✅ ${movie.title} (${year}) - Poster: Yes, Backdrop: Yes, Trailer: Yes, Votes: ${movie.vote_count}`);
    }

    const topMovies = qualifiedMovies.slice(0, 5);

    if (topMovies.length === 0) {
        console.log('\n❌ No 2025-2026 movies with HD posters and trailers found!');
        return;
    }

    console.log(`\n📥 Processing ${topMovies.length} movies with HD posters...\n`);

    const postersDir = path.join(__dirname, '../../frontend/images/hero-posters');
    const previewsDir = path.join(__dirname, '../../frontend/images/hero-previews');

    [postersDir, previewsDir].forEach(dir => {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });

    const heroData = [];

    for (const movie of topMovies) {
        const title = movie.title;
        const slug = createSlug(title);

        console.log(`📽️ ${title} (${movie.release_date?.slice(0, 4)})`);

        // ─── 1. DOWNLOAD HD POSTER ───
        const posterPath = path.join(postersDir, `${slug}.jpg`);
        if (movie.poster_path) {
            const posterUrl = `https://image.tmdb.org/t/p/original${movie.poster_path}`;
            try {
                await downloadFile(posterUrl, posterPath);
                console.log(`   ✅ HD Poster downloaded`);
            } catch (e) {
                console.log(`   ⚠️ Poster download failed`);
            }
        }

        // ─── 2. DOWNLOAD HD BACKDROP ───
        const backdropPath = path.join(postersDir, `${slug}-backdrop.jpg`);
        if (movie.backdrop_path) {
            const backdropUrl = `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;
            try {
                await downloadFile(backdropUrl, backdropPath);
                console.log(`   ✅ HD Backdrop downloaded`);
            } catch (e) {
                console.log(`   ⚠️ Backdrop download failed`);
            }
        }

        // ─── 3. USE YOUTUBE EMBED AS PREVIEW ───
        const trailerKey = movie.trailerKey;
        const videoUrl = buildYouTubeEmbedUrl(trailerKey);

        console.log(`   🎬 Trailer: ${trailerKey}`);
        console.log(`   ✅ YouTube embed ready (8-second preview)`);

        // ─── 4. SAVE TO DATA ───
        heroData.push({
            id: movie.id,
            title: title,
            year: movie.release_date?.slice(0, 4) || "N/A",
            description: movie.overview || "No description available",
            rating: movie.vote_average ? movie.vote_average.toFixed(1) : "N/A",
            poster: `/images/hero-posters/${slug}.jpg`,
            backdrop: `/images/hero-posters/${slug}-backdrop.jpg`,
            preview: videoUrl,  // YouTube embed URL
            hasPreview: true,   // Always true since we have YouTube embed
            genres: (movie.genre_ids || []).slice(0, 3).join(' • '),
            trailerKey: trailerKey
        });

        console.log('');
    }

    // ─── SAVE JSON ───
    const dataPath = path.join(__dirname, '../../frontend/data/heroMovies.json');
    const dataDir = path.dirname(dataPath);
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

    fs.writeFileSync(dataPath, JSON.stringify(heroData, null, 2));

    console.log('✅ Done!');
    console.log(`📁 HD Posters: ${postersDir}`);
    console.log(`📄 Data: ${dataPath}`);
    console.log(`📊 Movies with previews: ${heroData.filter(m => m.hasPreview).length}/${heroData.length}`);
    console.log(`📅 All movies are from 2025-2026 with HD posters!`);
}

main().catch(console.error);