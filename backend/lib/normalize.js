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

    // Get YouTube trailer key from videos
    const trailer = (details.videos?.results || []).find(
        v => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
    );

    // ─── GENERATE PREVIEW URL (8-second clip, no YouTube branding) ───
    let preview = null;
    if (trailer?.key) {
        // Clean YouTube embed with 8-second preview (5s to 13s)
        // No YouTube branding, no controls, clean loop
        preview = `https://www.youtube-nocookie.com/embed/${trailer.key}?autoplay=1&mute=1&loop=1&playlist=${trailer.key}&start=5&end=13&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1`;
    }

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

        trailerKey: trailer?.key || null,

        preview: preview,  // ← NEW: 8-second preview URL

        popularity:
            details.popularity,

        featured: !!flags.featured,
        trending: !!flags.trending,
        popular: !!flags.popular

    };

}

module.exports = normalize;