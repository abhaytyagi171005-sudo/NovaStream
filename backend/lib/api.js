const axios = require("axios");
require("dotenv").config();

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

const client = axios.create({
    baseURL: BASE_URL,
    timeout: 20000
});

async function request(endpoint, retries = 3) {

    try {

        const separator = endpoint.includes("?") ? "&" : "?";

        const { data } = await client.get(
            `${endpoint}${separator}api_key=${API_KEY}`
        );

        return data;

    } catch (err) {

        if (retries > 0) {

            console.log(`Retrying ${endpoint}...`);

            await new Promise(r => setTimeout(r, 1000));

            return request(endpoint, retries - 1);

        }

        console.error(`Failed: ${endpoint}`);

        return null;
    }
}

module.exports = {
    request
};