const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const axios = require('axios');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const MAX_MOVIES = 200;  // Total movies to process
const BATCH_SIZE = 50;   // Process 50 movies at a time

// ─── FETCH TRENDING MOVIES ───
async function fetchTrendingMovies() {
    if (!TMDB_API_KEY) {
        console.error('❌ TMDB_API_KEY not set');
        return [];
    }

    try {
        let allMovies = [];
        for (let page = 1; page <= 4; page++) {
            const response = await axios.get(
                `https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`
            );
            allMovies = allMovies.concat(response.data.results || []);
            console.log(`📄 Fetched page ${page}: ${response.data.results?.length || 0} movies`);
        }
        return allMovies;
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

// ─── DOWNLOAD YOUTUBE VIDEO (HD 720p) ───
function downloadYouTube(trailerKey, outputPath) {
    try {
        const cmd = `yt-dlp -f "best[height<=720][ext=mp4]" --no-check-certificate --user-agent "Mozilla/5.0" --no-warnings -o "${outputPath}" "https://www.youtube.com/watch?v=${trailerKey}"`;
        execSync(cmd, {
            stdio: 'pipe',
            timeout: 120000
        });

        if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 50000) {
            return true;
        }
        return false;
    } catch (error) {
        return false;
    }
}

// ─── CREATE 8-SECOND PREVIEW ───
function createPreview(inputPath, outputPath) {
    try {
        if (!fs.existsSync(inputPath) || fs.statSync(inputPath).size < 10000) {
            return false;
        }

        const cmd = `ffmpeg -ss 5 -i "${inputPath}" -t 8 -c:v libx264 -c:a aac -movflags +faststart -crf 28 -preset veryfast "${outputPath}" -y`;
        execSync(cmd, {
            stdio: 'pipe',
            timeout: 60000
        });

        if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 5000) {
            return true;
        }
        return false;
    } catch (error) {
        return false;
    }
}

// ─── CREATE SLUG ───
function createSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// ─── PROCESS BATCH ───
async function processBatch(movies, postersDir, previewsDir, tempDir, batchNumber, totalBatches) {
    const results = [];
    let index = 0;

    for (const movie of movies) {
        index++;
        const title = movie.title;
        const slug = createSlug(title);

        console.log(`\n📽️ [${batchNumber}/${totalBatches}] ${index}/${movies.length} - ${title} (${movie.release_date?.slice(0, 4)})`);

        // ─── 1. DOWNLOAD HD POSTER ───
        const posterPath = path.join(postersDir, `${slug}.jpg`);
        if (movie.poster_path && !fs.existsSync(posterPath)) {
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
        if (movie.backdrop_path && !fs.existsSync(backdropPath)) {
            const backdropUrl = `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;
            try {
                await downloadFile(backdropUrl, backdropPath);
                console.log(`   ✅ HD Backdrop downloaded`);
            } catch (e) {
                console.log(`   ⚠️ Backdrop download failed`);
            }
        }

        // ─── 3. DOWNLOAD & CUT PREVIEW ───
        const previewPath = path.join(previewsDir, `${slug}.mp4`);
        const trailerKey = movie.trailerKey;

        if (trailerKey && !fs.existsSync(previewPath)) {
            console.log(`   🎬 Trailer: ${trailerKey}`);
            const tempVideo = path.join(tempDir, `${slug}.mp4`);

            console.log(`   📥 Downloading trailer (HD 720p)...`);
            if (downloadYouTube(trailerKey, tempVideo)) {
                console.log(`   ✂️ Cutting 8-second preview...`);
                if (createPreview(tempVideo, previewPath)) {
                    const sizeMB = (fs.statSync(previewPath).size / 1024 / 1024).toFixed(1);
                    console.log(`   ✅ Preview: 8 seconds (${sizeMB} MB)`);
                }
                if (fs.existsSync(tempVideo)) fs.unlinkSync(tempVideo);
            } else {
                console.log(`   ⚠️ Failed to download trailer`);
            }
        } else if (fs.existsSync(previewPath)) {
            console.log(`   ⏭️ Preview already exists`);
        }

        // ─── 4. SAVE TO DATA ───
        results.push({
            id: movie.id,
            title: title,
            year: movie.release_date?.slice(0, 4) || "N/A",
            description: movie.overview || "No description available",
            rating: movie.vote_average ? movie.vote_average.toFixed(1) : "N/A",
            poster: `/images/hero-posters/${slug}.jpg`,
            backdrop: `/images/hero-posters/${slug}-backdrop.jpg`,
            preview: fs.existsSync(previewPath) ? `/images/hero-previews/${slug}.mp4` : null,
            hasPreview: fs.existsSync(previewPath),
            genres: (movie.genre_ids || []).slice(0, 3).join(' • '),
            trailerKey: trailerKey
        });
    }

    return results;
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

        if (isNaN(year) || year < 2025 || year > 2026) continue;
        if (!movie.poster_path) continue;
        if (!movie.backdrop_path) continue;
        if (!movie.vote_count || movie.vote_count < 100) continue;

        const trailerKey = await fetchTrailer(movie.id);
        if (!trailerKey) continue;

        qualifiedMovies.push({
            ...movie,
            trailerKey: trailerKey
        });

        console.log(`✅ ${movie.title} (${year}) - Trailer: ${trailerKey}`);
    }

    if (qualifiedMovies.length === 0) {
        console.log('\n❌ No 2025-2026 movies with HD posters and trailers found!');
        return;
    }

    console.log(`\n✅ Found ${qualifiedMovies.length} qualifying movies`);

    // ─── TAKE UP TO 200 MOVIES ───
    const totalToProcess = Math.min(qualifiedMovies.length, MAX_MOVIES);
    const selectedMovies = qualifiedMovies.slice(0, totalToProcess);

    console.log(`📥 Processing ${selectedMovies.length} movies in batches of ${BATCH_SIZE}\n`);

    // Create directories
    const postersDir = path.join(__dirname, '../../frontend/images/hero-posters');
    const previewsDir = path.join(__dirname, '../../frontend/images/hero-previews');
    const tempDir = path.join(__dirname, '../../temp');

    [postersDir, previewsDir, tempDir].forEach(dir => {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });

    // ─── PROCESS IN BATCHES OF 50 ───
    let allResults = [];
    const batches = [];
    for (let i = 0; i < selectedMovies.length; i += BATCH_SIZE) {
        batches.push(selectedMovies.slice(i, i + BATCH_SIZE));
    }

    console.log(`📦 Splitting into ${batches.length} batches of ${BATCH_SIZE} movies each\n`);

    for (let b = 0; b < batches.length; b++) {
        const batch = batches[b];
        console.log(`\n${'='.repeat(60)}`);
        console.log(`🔄 BATCH ${b + 1}/${batches.length} (${batch.length} movies)`);
        console.log(`${'='.repeat(60)}`);

        const batchResults = await processBatch(batch, postersDir, previewsDir, tempDir, b + 1, batches.length);
        allResults = allResults.concat(batchResults);

        const previewsInBatch = batchResults.filter(r => r.hasPreview).length;
        console.log(`\n✅ Batch ${b + 1} complete: ${previewsInBatch}/${batchResults.length} HD previews downloaded`);

        // ─── SAVE AFTER EACH BATCH (in case workflow times out) ───
        const dataPath = path.join(__dirname, '../../frontend/data/heroMovies.json');
        const dataDir = path.dirname(dataPath);
        if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
        fs.writeFileSync(dataPath, JSON.stringify(allResults, null, 2));
        console.log(`💾 Saved progress (${allResults.length} movies so far)`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ COMPLETE!');
    console.log('='.repeat(60));
    console.log(`📁 HD Posters: ${postersDir}`);
    console.log(`📁 HD Previews: ${previewsDir}`);
    console.log(`📄 Data: ${path.join(__dirname, '../../frontend/data/heroMovies.json')}`);
    console.log(`📊 Total movies processed: ${allResults.length}`);
    console.log(`📊 Movies with HD previews: ${allResults.filter(m => m.hasPreview).length}`);
    console.log(`📅 All movies are from 2025-2026 with HD posters!`);
}

main().catch(console.error);