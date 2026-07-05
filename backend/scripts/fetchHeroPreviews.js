const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const https = require('https');

const TMDB_API_KEY = process.env.TMDB_API_KEY;

// ─── FETCH TRENDING MOVIES ───
async function fetchTrendingMovies() {
    if (!TMDB_API_KEY) {
        console.error('❌ TMDB_API_KEY not set');
        return [];
    }

    try {
        const response = await fetch(
            `https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_API_KEY}&language=en-US`
        );
        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error('Error fetching trending:', error.message);
        return [];
    }
}

// ─── FETCH MOVIE TRAILER ───
async function fetchTrailer(movieId) {
    try {
        const response = await fetch(
            `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${TMDB_API_KEY}&language=en-US`
        );
        const data = await response.json();
        const trailer = data.results?.find(v =>
            v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
        );
        return trailer?.key || null;
    } catch (error) {
        return null;
    }
}

// ─── DOWNLOAD FILE ───
function downloadFile(url, outputPath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(outputPath);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(outputPath, () => { });
            reject(err);
        });
    });
}

// ─── CREATE 8-SECOND PREVIEW ───
function createPreview(inputPath, outputPath) {
    try {
        // Cut from 5s to 13s (8 seconds)
        execSync(`ffmpeg -ss 5 -i "${inputPath}" -t 8 -c:v libx264 -c:a aac -movflags +faststart "${outputPath}" -y`, {
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
        execSync(`yt-dlp -f "best[height<=480]" -o "${outputPath}" "https://www.youtube.com/watch?v=${trailerKey}"`, {
            stdio: 'pipe'
        });
        return true;
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
    console.log('🎬 Fetching trending movies...');
    const movies = await fetchTrendingMovies();

    if (!movies || movies.length === 0) {
        console.error('❌ No movies found');
        return;
    }

    // Take top 5 trending
    const topMovies = movies.slice(0, 5);

    // Create directories
    const postersDir = path.join(__dirname, '../../frontend/images/hero-posters');
    const previewsDir = path.join(__dirname, '../../frontend/images/hero-previews');
    const tempDir = path.join(__dirname, '../../temp');

    [postersDir, previewsDir, tempDir].forEach(dir => {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });

    console.log(`📥 Processing ${topMovies.length} movies...\n`);

    const heroData = [];

    for (const movie of topMovies) {
        const title = movie.title || movie.name;
        const slug = createSlug(title);

        console.log(`📽️ ${title}`);

        // ─── 1. DOWNLOAD POSTER ───
        const posterPath = path.join(postersDir, `${slug}.jpg`);
        if (movie.poster_path) {
            const posterUrl = `https://image.tmdb.org/t/p/original${movie.poster_path}`;
            try {
                await downloadFile(posterUrl, posterPath);
                console.log(`   ✅ Poster: ${slug}.jpg`);
            } catch (e) {
                console.log(`   ⚠️ Poster failed`);
            }
        }

        // ─── 2. DOWNLOAD & CUT PREVIEW ───
        const previewPath = path.join(previewsDir, `${slug}.mp4`);
        const trailerKey = await fetchTrailer(movie.id);

        if (trailerKey) {
            console.log(`   🎬 Trailer: ${trailerKey}`);
            const tempVideo = path.join(tempDir, `${slug}.mp4`);

            if (downloadYouTube(trailerKey, tempVideo)) {
                if (createPreview(tempVideo, previewPath)) {
                    console.log(`   ✅ Preview: 8 seconds`);
                }
                // Clean up temp
                if (fs.existsSync(tempVideo)) fs.unlinkSync(tempVideo);
            }
        } else {
            console.log(`   ⚠️ No trailer found`);
        }

        // ─── 3. SAVE TO DATA ───
        heroData.push({
            id: movie.id,
            title: title,
            year: (movie.release_date || '').slice(0, 4),
            description: movie.overview || "No description available",
            rating: movie.vote_average ? movie.vote_average.toFixed(1) : "N/A",
            poster: `/images/hero-posters/${slug}.jpg`,
            preview: fs.existsSync(previewPath) ? `/images/hero-previews/${slug}.mp4` : null,
            hasPreview: fs.existsSync(previewPath),
            backdrop: movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null,
            genres: (movie.genre_ids || []).slice(0, 3).join(' • ')
        });

        console.log('');
    }

    // ─── SAVE JSON ───
    const dataPath = path.join(__dirname, '../../frontend/data/heroMovies.json');
    const dataDir = path.dirname(dataPath);
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

    fs.writeFileSync(dataPath, JSON.stringify(heroData, null, 2));

    console.log('✅ Done!');
    console.log(`📁 Posters: ${postersDir}`);
    console.log(`📁 Previews: ${previewsDir}`);
    console.log(`📄 Data: ${dataPath}`);
}

main().catch(console.error);