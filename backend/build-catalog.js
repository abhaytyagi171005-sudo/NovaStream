const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

const input = path.join(__dirname, "dataset", "netflix_titles.csv");
const output = path.join(__dirname, "catalog", "catalog.json");

const catalog = [];
let id = 1;

fs.createReadStream(input)
    .pipe(csv())
    .on("data", (row) => {

        const genreMap = {
            "action & adventure": ["action", "adventure"],
            "tv action & adventure": ["action", "adventure"],

            "comedies": ["comedy"],
            "tv comedies": ["comedy"],
            "stand-up comedy": ["comedy"],
            "stand-up comedy & talk shows": ["comedy", "talk"],

            "dramas": ["drama"],
            "tv dramas": ["drama"],

            "thrillers": ["thriller"],
            "tv thrillers": ["thriller"],

            "horror movies": ["horror"],
            "tv horror": ["horror"],

            "romantic movies": ["romance"],
            "romantic tv shows": ["romance"],

            "crime tv shows": ["crime"],

            "documentaries": ["documentary"],
            "docuseries": ["documentary"],

            "anime series": ["anime"],
            "anime features": ["anime"],

            "children & family movies": ["family"],
            "kids' tv": ["family"],

            "sci-fi & fantasy": ["scifi", "fantasy"],
            "tv sci-fi & fantasy": ["scifi", "fantasy"],

            "sports movies": ["sports"],
            "music & musicals": ["music"],
            "science & nature tv": ["science"],
            "faith & spirituality": ["faith"],

            "classic movies": ["classic"],
            "cult movies": ["cult"],
            "classic & cult tv": ["classic", "cult"],

            "reality tv": ["reality"],

            "international movies": [],
            "international tv shows": [],

            "movies": [],
            "tv shows": [],

            "british tv shows": ["british"],
            "korean tv shows": ["korean"],
            "spanish-language tv shows": ["spanish"],
            "teen tv shows": ["teen"],

            "independent movies": ["indie"],
            "lgbtq movies": ["lgbtq"]
        };
        const genres = [];

        if (row.listed_in) {
            row.listed_in.split(",").forEach(g => {
                const key = g.trim().toLowerCase();

                if (genreMap[key]) {
                    genres.push(...genreMap[key]);
                } else {
                    genres.push(key);
                }
            });
        }

        const countries = row.country
            ? row.country.split(",").map(c => c.trim())
            : [];

        catalog.push({
            id: id++,
            title: row.title,
            type: row.type.toLowerCase() === "movie" ? "movie" : "series",

            year: Number(row.release_year),

            duration: row.duration,

            genres,

            countries,

            description: row.description,

            rating: null,


            language:
                countries.includes("India") ? "Hindi" :
                    countries.includes("South Korea") ? "Korean" :
                        countries.includes("Japan") ? "Japanese" :
                            countries.includes("United States") ? "English" :
                                countries.includes("United Kingdom") ? "English" :
                                    countries.includes("Canada") ? "English" :
                                        countries.includes("Australia") ? "English" :
                                            countries.includes("New Zealand") ? "English" :
                                                "Other",
            poster: `https://placehold.co/300x450/111827/ffffff?text=${encodeURIComponent(row.title)}`,

            backdrop: `https://placehold.co/1280x720/111827/ffffff?text=${encodeURIComponent(row.title)}`,

            featured: Math.random() < 0.03,   // ~3%
            trending: Math.random() < 0.12,   // ~12%
            popular: Math.random() < 0.25     // ~25%
        });

    })
    .on("end", () => {

        fs.writeFileSync(
            output,
            JSON.stringify(catalog, null, 2)
        );

        console.log(`✅ Generated ${catalog.length} titles`);
    });