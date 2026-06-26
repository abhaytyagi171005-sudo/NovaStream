const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

const input = path.join(__dirname, "datasets", "movies", "movies_metadata.csv");
const output = path.join(__dirname, "datasets", "movies", "movies-index.json");

const index = {};

fs.createReadStream(input)
    .pipe(csv())
    .on("data", row => {

        if (!row.title) return;

        const key = row.title
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "")
            .trim();

        index[key] = {
            rating: row.vote_average,
            runtime: row.runtime,
            poster: row.poster_path,
            language: row.original_language,
            overview: row.overview,
            popularity: row.popularity,
            release: row.release_date
        };

    })
    .on("end", () => {

        fs.writeFileSync(
            output,
            JSON.stringify(index)
        );

        console.log("✅ Indexed", Object.keys(index).length, "movies");

    });