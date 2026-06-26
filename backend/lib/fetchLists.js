const { request } = require("./api");

async function fetchMovieList(list, page = 1) {
    const data = await request(`/movie/${list}?page=${page}`);
    return data?.results || [];
}

async function fetchTVList(list, page = 1) {
    const data = await request(`/tv/${list}?page=${page}`);
    return data?.results || [];
}

async function fetchTrending(type) {
    const data = await request(`/trending/${type}/day`);
    return data?.results || [];
}

module.exports = {
    fetchMovieList,
    fetchTVList,
    fetchTrending
};