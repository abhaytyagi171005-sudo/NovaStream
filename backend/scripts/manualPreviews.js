const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const axios = require('axios');

const TMDB_API_KEY = process.env.TMDB_API_KEY;

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

// ─── FETCH MOVIE TRAILER KEY ───
async function fetchTrailerKey(movieId) {
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

// ─── CREATE SLUG ───
function createSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// ─── DOWNLOAD YOUTUBE VIDEO ───
function downloadYouTube(trailerKey, outputPath) {
    try {
        // Try multiple formats
        const commands = [
            `yt-dlp -f "best[height<=720][ext=mp4]" --no-check-certificate --user-agent "Mozilla/5.0" -o "${outputPath}" "https://www.youtube.com/watch?v=${trailerKey}"`,
            `yt-dlp -f "best[height<=480]" --no-check-certificate -o "${outputPath}" "https://www.youtube.com/watch?v=${trailerKey}"`,
            `yt-dlp -f "best" --no-check-certificate -o "${outputPath}" "https://www.youtube.com/watch?v=${trailerKey}"`
        ];

        for (const cmd of commands) {
            try {
                execSync(cmd, { stdio: 'pipe', timeout: 120000 });
                if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 50000) {
                    console.log(`   ✅ Downloaded: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(1)} MB`);
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

// ─── CREATE 45-SECOND PREVIEW ───
function createPreview(inputPath, outputPath) {
    try {
        if (!fs.existsSync(inputPath) || fs.statSync(inputPath).size < 10000) {
            return false;
        }

        // Cut from 10s to 55s (45 seconds)
        const cmd = `ffmpeg -ss 10 -i "${inputPath}" -t 45 -c:v libx264 -c:a aac -movflags +faststart -crf 23 -preset medium "${outputPath}" -y`;
        execSync(cmd, { stdio: 'pipe', timeout: 60000 });

        if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 5000) {
            return true;
        }
        return false;
    } catch (error) {
        console.error('   ⚠️ FFmpeg error:', error.message);
        return false;
    }
}

// ─── MAIN ───
async function main() {
    // Get movie IDs from command line or use defaults
    const args = process.argv.slice(2);
    let movieIds = [];

    if (args.length > 0) {
        movieIds = args.map(id => parseInt(id));
    } else {
        console.log('📋 Please provide TMDB movie IDs as arguments');
        console.log('Example: node manualPreviews.js 12345 67890 11111');
        console.log('\nOr enter movie titles to search:');
        process.exit(1);
    }

    console.log(`🎬 Processing ${movieIds.length} movies...\n`);

    // Create directories
    const previewsDir = path.join(__dirname, '../../frontend/images/hero-previews');
    if (!fs.existsSync(previewsDir)) fs.mkdirSync(previewsDir, { recursive: true });

    const heroData = [];

    for (const movieId of movieIds) {
        console.log(`📽️ Fetching movie ${movieId}...`);

        const details = await fetchMovieDetails(movieId);
        if (!details) {
            console.log(`   ❌ Movie ${movieId} not found`);
            continue;
        }

        const title = details.title;
        const slug = createSlug(title);
        const year = details.release_date?.slice(0, 4) || "N/A";

        console.log(`\n📽️ ${title} (${year})`);

        // ─── GET TRAILER KEY ───
        const trailerKey = await fetchTrailerKey(movieId);
        if (!trailerKey) {
            console.log(`   ❌ No trailer found`);
            continue;
        }

        // ─── DOWNLOAD TRAILER ───
        const tempDir = path.join(__dirname, '../../temp');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

        const tempVideo = path.join(tempDir, `${slug}.mp4`);
        const previewPath = path.join(previewsDir, `${slug}.mp4`);

        console.log(`   🎬 Trailer key: ${trailerKey}`);
        console.log(`   📥 Downloading trailer...`);

        if (downloadYouTube(trailerKey, tempVideo)) {
            console.log(`   ✂️ Creating 45-second preview...`);
            if (createPreview(tempVideo, previewPath)) {
                const sizeMB = (fs.statSync(previewPath).size / 1024 / 1024).toFixed(1);
                console.log(`   ✅ Preview: 45 seconds (${sizeMB} MB)`);

                // Clean up temp
                if (fs.existsSync(tempVideo)) fs.unlinkSync(tempVideo);

                heroData.push({
                    id: movieId,
                    title: title,
                    year: year,
                    description: details.overview || "No description available",
                    rating: details.vote_average ? details.vote_average.toFixed(1) : "N/A",
                    poster: details.poster_path ? `https://image.tmdb.org/t/p/original${details.poster_path}` : "N/A",
                    backdrop: details.backdrop_path ? `https://image.tmdb.org/t/p/original${details.backdrop_path}` : "N/A",
                    preview: `/images/hero-previews/${slug}.mp4`,
                    hasPreview: true,
                    genres: (details.genres || []).map(g => g.name).slice(0, 3).join(' • '),
                    trailerKey: trailerKey
                });
            } else {
                console.log(`   ❌ Failed to create preview`);
            }
        } else {
            console.log(`   ❌ Failed to download trailer`);
        }
    }

    // ─── SAVE JSON ───
    if (heroData.length > 0) {
        const dataPath = path.join(__dirname, '../../frontend/data/heroMovies.json');
        const dataDir = path.dirname(dataPath);
        if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

        fs.writeFileSync(dataPath, JSON.stringify(heroData, null, 2));
        console.log('\n✅ Done!');
        console.log(`📁 Previews: ${previewsDir}`);
        console.log(`📄 Data: ${dataPath}`);
        console.log(`📊 ${heroData.length} movies with HD previews`);
    } else {
        console.log('\n❌ No previews created');
    }
}

main().catch(console.error);