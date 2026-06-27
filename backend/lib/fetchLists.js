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

async function fetchDiscoverMovies(params, page = 1) {
    const query = new URLSearchParams({ ...params, page }).toString();
    const data = await request(`/discover/movie?${query}`);
    return data?.results || [];
}

async function fetchDiscoverTV(params, page = 1) {
    const query = new URLSearchParams({ ...params, page }).toString();
    const data = await request(`/discover/tv?${query}`);
    return data?.results || [];
}

module.exports = {
    fetchMovieList,
    fetchTVList,
    fetchTrending,
    fetchDiscoverMovies,
    fetchDiscoverTV
};