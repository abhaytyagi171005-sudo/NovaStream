const { request } = require("./lib/api");

(async () => {

    const movie = await request("/movie/550");

    console.log(movie.title);
    console.log(movie.vote_average);

})();