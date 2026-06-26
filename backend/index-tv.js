const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

const input = path.join(__dirname, "datasets", "tv", "shows.csv");
const output = path.join(__dirname, "datasets", "tv", "tv-index.json");

const index = {};

fs.createReadStream(input)
    .pipe(csv())
    .on("data", row => {

        if (!row.name) return;

        const key = row.name
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "")
            .trim();

        index[key] = {
            overview: row.overview || "",
            popularity: Number(row.popularity) || 0,
            seasons: Number(row.number_of_seasons) || 0,
            episodes: Number(row.number_of_episodes) || 0,
            runtime: row.eposide_run_time || ""
        };

    })
    .on("end", () => {

        fs.writeFileSync(
            output,
            JSON.stringify(index)
        );

        console.log("✅ Indexed", Object.keys(index).length, "TV shows");

    });