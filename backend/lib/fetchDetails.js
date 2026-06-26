const { request } = require("./api");

async function fetchMovieDetails(id) {

    return await request(
        `/movie/${id}?append_to_response=videos,credits,images`
    );

}

async function fetchTVDetails(id) {

    return await request(
        `/tv/${id}?append_to_response=videos,credits,images`
    );

}

module.exports = {
    fetchMovieDetails,
    fetchTVDetails
};