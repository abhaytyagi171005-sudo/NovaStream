const IMAGE_BASE = "https://image.tmdb.org/t/p/";

const POSTER_SIZE = "w500";
const BACKDROP_SIZE = "w1280";
const LOGO_SIZE = "w500";

const MOVIE_LISTS = [
    "popular",
    "top_rated",
    "now_playing",
    "upcoming"
];

const TV_LISTS = [
    "popular",
    "top_rated",
    "airing_today",
    "on_the_air"
];

const TRENDING = [
    "movie/day",
    "tv/day"
];
const CONCURRENT_REQUESTS = 10;
module.exports = {
    IMAGE_BASE,
    POSTER_SIZE,
    BACKDROP_SIZE,
    LOGO_SIZE,
    MOVIE_LISTS,
    TV_LISTS,
    TRENDING,
    CONCURRENT_REQUESTS
};