const fs = require("fs");
const path = require("path");

const {
    fetchMovieList,
    fetchTVList,
    fetchTrending
} = require("./lib/fetchLists");
const {
    fetchMovieDetails,
    fetchTVDetails
} = require("./lib/fetchDetails");

const normalize = require("./lib/normalize");

const catalog = [];
const movieIds = new Map();
const tvIds = new Map();
async function processInBatches(entries, batchSize, worker) {

    for (let i = 0; i < entries.length; i += batchSize) {

        const batch = entries.slice(i, i + batchSize);

        await Promise.all(
            batch.map(worker)
        );

        console.log(
            `Processed ${Math.min(i + batch.length, entries.length)} / ${entries.length}`
        );

    }

}
async function collectMovieIds() {

    console.log("🎬 Collecting movie IDs...");

    const movieLists = [
        { name: "popular", flag: "popular" },
        { name: "top_rated", flag: "featured" },
        { name: "now_playing", flag: "trending" },
        { name: "upcoming", flag: "popular" }
    ];

    for (const list of movieLists) {

        console.log(`   → ${list.name}`);

        for (let page = 1; page <= 50; page++) {

            const movies = await fetchMovieList(list.name, page);

            for (const movie of movies) {

                const flags = movieIds.get(movie.id) || {
                    featured: false,
                    trending: false,
                    popular: false
                };

                flags[list.flag] = true;

                movieIds.set(movie.id, flags);

            }

        }

    }

}
async function collectTVIds() {

    console.log("📺 Collecting TV IDs...");

    const tvLists = [
        { name: "popular", flag: "popular" },
        { name: "top_rated", flag: "featured" },
        { name: "airing_today", flag: "trending" },
        { name: "on_the_air", flag: "popular" }
    ];

    for (const list of tvLists) {

        console.log(`   → ${list.name}`);

        for (let page = 1; page <= 50; page++) {

            const shows = await fetchTVList(list.name, page);

            for (const show of shows) {

                const flags = tvIds.get(show.id) || {
                    featured: false,
                    trending: false,
                    popular: false
                };

                flags[list.flag] = true;

                tvIds.set(show.id, flags);

            }

        }

    }

}
async function collectTrending() {

    console.log("🔥 Collecting trending titles...");

    const movies = await fetchTrending("movie");
    const tv = await fetchTrending("tv");

    for (const movie of movies) {

        const flags = movieIds.get(movie.id) || {
            featured: false,
            trending: false,
            popular: false
        };

        flags.trending = true;

        movieIds.set(movie.id, flags);

    }

    for (const show of tv) {

        const flags = tvIds.get(show.id) || {
            featured: false,
            trending: false,
            popular: false
        };

        flags.trending = true;

        tvIds.set(show.id, flags);

    }

} async function buildMovies() {

    console.log(`🎥 Fetching ${movieIds.size} movie details...`);

    const {
        CONCURRENT_REQUESTS
    } = require("./lib/constants");

    await processInBatches(

        [...movieIds.entries()],

        CONCURRENT_REQUESTS,

        async ([id, flags]) => {
            const details = await fetchMovieDetails(id);
            if (!details) return;
            if (!details.poster_path) return;
            if (details.vote_count < 100) return;  // ← min 100 votes
            if (details.vote_average < 5.0) return; // ← min 5.0 rating
            catalog.push(normalize(details, "movie", flags));
        }

    );

} async function buildSeries() {

    console.log(`📺 Fetching ${tvIds.size} TV details...`);

    const {
        CONCURRENT_REQUESTS
    } = require("./lib/constants");

    await processInBatches(

        [...tvIds.entries()],

        CONCURRENT_REQUESTS,

        async ([id, flags]) => {
            const details = await fetchTVDetails(id);
            if (!details) return;
            if (!details.poster_path) return;
            if (details.vote_count < 50) return;   // ← min 50 votes
            if (details.vote_average < 5.0) return; // ← min 5.0 rating
            catalog.push(normalize(details, "series", flags));
        }

    );

} async function main() {

    console.log("🚀 Starting NovaStream Catalog Generator...\n");

    await collectMovieIds();
    await collectTVIds();
    await collectTrending();

    await buildMovies();
    await buildSeries();

    const outputDir = path.join(__dirname, "catalog");

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    catalog.sort((a, b) => b.popularity - a.popularity);

    const movies = catalog.filter(item => item.type === "movie");
    const series = catalog.filter(item => item.type === "series");

    fs.writeFileSync(
        path.join(outputDir, "catalog.json"),
        JSON.stringify(catalog, null, 2)
    );

    fs.writeFileSync(
        path.join(outputDir, "movies.json"),
        JSON.stringify(movies, null, 2)
    );

    fs.writeFileSync(
        path.join(outputDir, "series.json"),
        JSON.stringify(series, null, 2)
    );
    console.log("\n==============================");
    console.log("✅ Catalog generation complete!");
    console.log(`🎬 Movies : ${catalog.filter(x => x.type === "movie").length}`);
    console.log(`📺 Series : ${catalog.filter(x => x.type === "series").length}`);
    console.log(`📦 Total  : ${catalog.length}`);
    console.log("==============================");

}

main().catch(err => {
    console.error(err);
    process.exit(1);
});