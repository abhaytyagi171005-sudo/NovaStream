const fs = require("fs");
const axios = require("axios");
//const { default: pLimit } = require("p-limit");
require("dotenv").config();

const API_KEY = process.env.TMDB_API_KEY;
const BASE = "https://api.themoviedb.org/3";
const IMAGE = "https://image.tmdb.org/t/p";

//const limit = pLimit(15);

const catalog = [];
const seen = new Set();
async function get(endpoint) {
    const url = `${BASE}${endpoint}${endpoint.includes("?") ? "&" : "?"}api_key=${API_KEY}`;

    const { data } = await axios.get(url);

    return data;
} function normalize(item, type, flags = {}) {

    const title = type === "movie"
        ? item.title
        : item.name;

    const year = type === "movie"
        ? (item.release_date || "").slice(0, 4)
        : (item.first_air_date || "").slice(0, 4);

    return {
        id: item.id,
        title,
        type,
        year,

        rating: item.vote_average,

        language: item.original_language,

        description: item.overview,

        poster: item.poster_path
            ? `${IMAGE}/w500${item.poster_path}`
            : "",

        backdrop: item.backdrop_path
            ? `${IMAGE}/original${item.backdrop_path}`
            : "",

        genres: item.genre_ids || [],

        featured: !!flags.featured,
        trending: !!flags.trending,
        popular: !!flags.popular
    };
}
async function fetchCategory(type, endpoint, flags = {}) {

    console.log(`Fetching ${type} ${endpoint}...`);

    for (let page = 1; page <= 20; page++) {

        try {

            const url =
                type === "trending"
                    ? `/trending/${endpoint}?page=${page}`
                    : `/${type}/${endpoint}?page=${page}`;

            const data = await get(url);

            add(data.results || [], type, flags);

        } catch (err) {

            console.log(`Failed ${type}/${endpoint} page ${page}`);

        }

    }

}
function add(items, type, flags) {

    for (const item of items) {

        const key = `${type}-${item.id}`;

        if (seen.has(key)) continue;

        seen.add(key);

        catalog.push(
            normalize(item, type, flags)
        );
    }
}
(async () => {

    // Movies
    await Promise.all([
        fetchCategory("movie", "popular", { popular: true }),
        fetchCategory("movie", "top_rated", { featured: true }),
        fetchCategory("movie", "now_playing", { trending: true }),
        fetchCategory("movie", "upcoming", { popular: true }),
        fetchCategory("trending", "movie/day", { trending: true })
    ]);

    // TV
    await Promise.all([
        fetchCategory("tv", "popular", { popular: true }),
        fetchCategory("tv", "top_rated", { featured: true }),
        fetchCategory("tv", "airing_today", { trending: true }),
        fetchCategory("tv", "on_the_air", { trending: true }),
        fetchCategory("trending", "tv/day", { trending: true })
    ]);

    fs.writeFileSync(
        "./catalog/catalog.json",
        JSON.stringify(catalog, null, 2)
    );

    console.log("\n✅ Catalog created");
    console.log("Titles:", catalog.length);

})();