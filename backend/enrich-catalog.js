const fs = require("fs");
const path = require("path");

const catalogPath = path.join(__dirname, "catalog", "catalog.json");
const movieIndexPath = path.join(__dirname, "datasets", "movies", "movies-index.json");

const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const movieIndex = JSON.parse(fs.readFileSync(movieIndexPath, "utf8"));

let matched = 0;
const tvIndex = JSON.parse(
    fs.readFileSync(
        path.join(__dirname, "datasets", "tv", "tv-index.json"),
        "utf8"
    )
);

for (const item of catalog) {

    const key = item.title
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .trim();

    if (item.type === "movie") {

        const movie = movieIndex[key];

        if (!movie) continue;

        matched++;

        item.rating = movie.rating || item.rating;
        item.runtime = movie.runtime || item.runtime;
        item.description = movie.overview || item.description;
        item.language = movie.language || item.language;
        item.popularity = Number(movie.popularity) || 0;

        if (movie.poster) {
            item.poster = `https://image.tmdb.org/t/p/w500${movie.poster}`;
            item.backdrop = `https://image.tmdb.org/t/p/original${movie.poster}`;
        }

    } else {

        const show = tvIndex[key];

        if (!show) continue;

        matched++;

        item.description = show.overview || item.description;
        item.runtime = show.runtime || item.runtime;
        item.popularity = show.popularity || 0;
        item.seasons = show.seasons;
        item.episodes = show.episodes;
    }
}
fs.writeFileSync(
    catalogPath,
    JSON.stringify(catalog, null, 2)
);

console.log(`✅ Matched ${matched} titles`);
console.log("✅ catalog.json updated");