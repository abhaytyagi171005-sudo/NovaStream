const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
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

// ─── FETCH MOVIE DETAILS ───
async function fetchMovieDetails(movieId) {
    try {
        const response = await axios.get(
            `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US`
        );
        return response.data;
    } catch (error) {
        return null;
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

// ─── CREATE 8-SECOND PREVIEW ───
function createPreview(inputPath, outputPath) {
    try {
        execSync(`ffmpeg -ss 5 -i "${inputPath}" -t 8 -c:v libx264 -c:a aac -movflags +faststart -crf 23 -preset medium "${outputPath}" -y`, {
            stdio: 'pipe'
        });
        return true;
    } catch (error) {
        console.error('   ⚠️ FFmpeg error:', error.message);
        return false;
    }
}

// ─── DOWNLOAD YOUTUBE VIDEO ───
function downloadYouTube(trailerKey, outputPath) {
    try {
        const commands = [
            `yt-dlp -f "best[height<=480][ext=mp4]" -o "${outputPath}" "https://www.youtube.com/watch?v=${trailerKey}"`,
            `yt-dlp -f "best[height<=360]" -o "${outputPath}" "https://www.youtube.com/watch?v=${trailerKey}"`,
            `yt-dlp -f "worst[ext=mp4]" -o "${outputPath}" "https://www.youtube.com/watch?v=${trailerKey}"`
        ];

        for (const cmd of commands) {
            try {
                execSync(cmd, { stdio: 'pipe' });
                if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 10000) {
                    return true;
                }
            } catch (e) {
                continue;
            }
        }
        return false;
    } catch (error) {
        console.error('   ⚠️ yt-dlp error:', error.message);
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

        // 1. Must be 2025-2026
        if (isNaN(year) || year < 2025 || year > 2026) {
            console.log(`❌ ${movie.title} - Skipped (Year: ${year || 'N/A'})`);
            continue;
        }

        // 2. Must have poster_path
        if (!movie.poster_path) {
            console.log(`❌ ${movie.title} - Skipped (No poster)`);
            continue;
        }

        // 3. Must have backdrop_path
        if (!movie.backdrop_path) {
            console.log(`❌ ${movie.title} - Skipped (No backdrop)`);
            continue;
        }

        // 4. Must have vote_count > 100 (popularity)
        if (!movie.vote_count || movie.vote_count < 100) {
            console.log(`❌ ${movie.title} - Skipped (Low popularity: ${movie.vote_count || 0} votes)`);
            continue;
        }

        // 5. Must have trailer
        const trailerKey = await fetchTrailer(movie.id);
        if (!trailerKey) {
            console.log(`❌ ${movie.title} - Skipped (No trailer)`);
            continue;
        }

        // ─── PASSED ALL CHECKS ───
        qualifiedMovies.push({
            ...movie,
            trailerKey: trailerKey
        });

        console.log(`✅ ${movie.title} (${year}) - Poster: Yes, Backdrop: Yes, Trailer: Yes, Votes: ${movie.vote_count}`);
    }

    // Take top 5 qualified movies
    const topMovies = qualifiedMovies.slice(0, 5);

    if (topMovies.length === 0) {
        console.log('\n❌ No 2025-2026 movies with HD posters and trailers found!');
        console.log('💡 Try running the workflow again later when more movies are available.');
        return;
    }

    console.log(`\n📥 Processing ${topMovies.length} movies with HD posters...\n`);

    // Create directories
    const postersDir = path.join(__dirname, '../../frontend/images/hero-posters');
    const previewsDir = path.join(__dirname, '../../frontend/images/hero-previews');
    const tempDir = path.join(__dirname, '../../temp');

    [postersDir, previewsDir, tempDir].forEach(dir => {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });

    const heroData = [];

    for (const movie of topMovies) {
        const title = movie.title || movie.name;
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

        // ─── 3. DOWNLOAD & CUT PREVIEW ───
        const previewPath = path.join(previewsDir, `${slug}.mp4`);
        const trailerKey = movie.trailerKey;

        if (trailerKey) {
            console.log(`   🎬 Trailer: ${trailerKey}`);
            const tempVideo = path.join(tempDir, `${slug}.mp4`);

            console.log(`   📥 Downloading trailer...`);
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
        }

        // ─── 4. SAVE TO DATA ───
        heroData.push({
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

        console.log('');
    }

    // ─── SAVE JSON ───
    const dataPath = path.join(__dirname, '../../frontend/data/heroMovies.json');
    const dataDir = path.dirname(dataPath);
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

    fs.writeFileSync(dataPath, JSON.stringify(heroData, null, 2));

    console.log('✅ Done!');
    console.log(`📁 HD Posters: ${postersDir}`);
    console.log(`📁 Previews: ${previewsDir}`);
    console.log(`📄 Data: ${dataPath}`);
    console.log(`📊 Movies with previews: ${heroData.filter(m => m.hasPreview).length}/${heroData.length}`);
    console.log(`📅 All movies are from 2025-2026 with HD posters!`);
}

main().catch(console.error);