const {
    IMAGE_BASE,
    POSTER_SIZE,
    BACKDROP_SIZE
} = require("./constants");

function image(path, size) {
    if (!path) return "";
    return `${IMAGE_BASE}${size}${path}`;
}

function normalize(details, type, flags = {}) {

    return {

        id: details.id,

        title:
            type === "movie"
                ? details.title
                : details.name,

        type,

        year:
            (
                type === "movie"
                    ? details.release_date
                    : details.first_air_date
            )?.slice(0, 4) || "",

        rating: details.vote_average,

        runtime:
            type === "movie"
                ? details.runtime
                : details.episode_run_time?.[0] || null,

        genres:
            (details.genres || []).map(g => g.name),

        language:
            details.spoken_languages?.[0]?.english_name ||
            details.original_language,

        countries:
            (details.production_countries || [])
                .map(c => c.name),

        description:
            details.overview,

        poster:
            image(details.poster_path, POSTER_SIZE),

        backdrop:
            image(details.backdrop_path, BACKDROP_SIZE),

        popularity:
            details.popularity,

        featured: !!flags.featured,
        trending: !!flags.trending,
        popular: !!flags.popular

    };

}

module.exports = normalize;