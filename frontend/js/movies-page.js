
/* ==========================================
   HERO SYSTEM
========================================== */

const heroMovies = {

    dune: {
        title: "DUNE PART TWO",
        year: "2024",
        description: "Paul Atreides unites with the Fremen and fights for Arrakis.",
        image: "images/banners/dune-banner.jpg",
        video: "images/Dune 2-preview.mp4"
    },

    oppenheimer: {
        title: "OPPENHEIMER",
        year: "2023",
        description: "The story of J. Robert Oppenheimer and the atomic bomb.",
        image: "images/banners/oppenheimer-banner.jpg",
        video: "images/oppenheimer-preview.mp4"
    },
    topgun: {
        title: "TOP GUN MAVERICK",
        year: "2022",
        description: "Maverick trains the next generation.",
        image: "images/banners/topgun-banner.jpg",
        video: "images/topgun-preview.mp4"
    },

    kingsman: {
        title: "Kingsman: The Secret Service",
        year: "2014",
        description: "A spy organisation recruits a promising street kid into the agency's training program.",
        image: "images/banners/kingsman-banner.jpg",
        video: "images/kingsman-preview.mp4"
    },

    dhurandhar: {
        title: "Dhurandhar",
        year: "2025",
        description: "Hamza moves through the shadows of Karachi with the cold detachment of a man already dead.",
        image: "images/banners/Dhurandhar-banner.jpg",
        video: "images/Dhurandhar-preview.mp4"
    }
};

const heroList = [
    heroMovies.dune,
    heroMovies.oppenheimer,

    heroMovies.topgun,
    heroMovies.kingsman,
    heroMovies.dhurandhar
];

let currentHero = 0;
let heroInterval = null;
let videoTimeout = null;

function changeHero(index) {

    const movie = heroList[index];

    const banner =
        document.getElementById("moviesHero");

    const heroVideo =
        document.getElementById("hero-video");

    const heroSource =
        document.getElementById("hero-video-source");

    document.getElementById(
        "movieHeroTitle"
    ).innerText = movie.title;

    document.getElementById(
        "movieHeroYear"
    ).innerText = movie.year;

    document.getElementById(
        "movieHeroDescription"
    ).innerText = movie.description;

    banner.style.backgroundImage = `
linear-gradient(
    to right,
    rgba(0,0,0,.9),
    rgba(0,0,0,.3)
),
url('${movie.image}')
`;

    if (!heroVideo) return;

    heroVideo.pause();
    heroVideo.style.opacity = "0";

    clearTimeout(videoTimeout);

    videoTimeout = setTimeout(() => {

        heroSource.src = movie.video;

        heroVideo.load();

        heroVideo.play().then(() => {

            heroVideo.style.opacity = "1";

        }).catch(() => { });

    }, 2000);
}

function nextHero() {

    currentHero =
        (currentHero + 1) %
        heroList.length;

    changeHero(currentHero);
}

changeHero(0);

heroInterval =
    setInterval(nextHero, 9000);

const heroVideo =
    document.getElementById("hero-video");

if (heroVideo) {

    heroVideo.addEventListener("ended", () => {

        currentHero =
            (currentHero + 1) %
            heroList.length;

        changeHero(currentHero);

    });
}

/* ==========================================
   MOVIE DATA
========================================== */

const trendingList = [

    "mission impossible",
    "transformers",
    "taken",
    "equalizer",
    "top gun maverick",
    "kingsman"
];

const actionList = [

    "mission impossible",
    "taken",
    "sicario",
    "equalizer",
    "mad max",
    "expendables"
];

const sciFiList = [
    "dune",
    "arrival",
    "gravity",
    "martian",
    "blade runner 2049",
    "edge of tomorrow",
    "district 9"
];

const superheroList = [
    "batman",
    "spider man",
    "iron man",
    "thor",
    "deadpool",
    "doctor strange",
    "black panther"
];

const topRatedList = [
    "godfather",
    "fight club",
    "forrest gump",
    "gladiator",
    "parasite",
    "shutter island"
];

const comedyList = [
    "hangover",
    "free guy",
    "ted",
    "central intelligence",
    "grown ups",
    "we are the millers"
];

const horrorList = [
    "conjuring",
    "insidious",
    "annabelle",
    "the nun",
    "it",
    "smile"
];

/* ==========================================
   LOAD NETFLIX ROW
========================================== */

async function loadSection(category, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";

    try {
        const response = await fetch(
            `https://novastream-o3ri.onrender.com/api/movies?category=${category}&limit=10`
        );
        const data = await response.json();
        if (!data.length) return;

        data.forEach(movie => {
            const poster = movie.Poster && movie.Poster !== "N/A"
                ? movie.Poster
                : "images/placeholder.jpg";
            container.innerHTML += `
                <div class="card" onclick="openMovie('${movie.Title.replace(/'/g, "\\'")}')">
                    <img src="${poster}" alt="${movie.Title}">
                    <div class="movie-info"><h3>${movie.Title}</h3></div>
                </div>
            `;
        });
    } catch (error) {
        console.error(error);
    }
}

/* ==========================================
   LOAD EVERYTHING
========================================== */
loadSection("trending", "trendingMovies");
loadSection("action", "actionMovies");
loadSection("scifi", "sciFiMovies");
loadSection("thriller", "superheroMovies");
loadSection("drama", "topRated");
loadSection("comedy", "comedyMovies");
loadSection("horror", "horrorMovies");

/* ==========================================
   OPEN MOVIE
========================================== */

function openMovie(title) {

    window.location.href =
        `search.html?movie=${encodeURIComponent(title)}`;

}

/* ==========================================
   GENRE FILTER
========================================== */

function filterGenre(genre) {

    document.querySelector(".genre-menu").style.display = "none";
    setTimeout(() => document.querySelector(".genre-menu").style.display = "", 300);

    document.querySelectorAll(".movies-section").forEach(s => s.style.display = "none");

    if (genre === "all") {
        document.querySelectorAll(".movies-section").forEach(s => s.style.display = "block");
        setTimeout(() => document.getElementById("sectionTrending").scrollIntoView({ behavior: "smooth" }), 100);
        return;
    }

    const genreData = {

        action: [
            { title: "🔥 Top Action Picks", id: "action1", movies: ["john wick", "mad max fury road", "extraction", "nobody", "13 hours"] },
            { title: "💣 Explosive Blockbusters", id: "action2", movies: ["mission impossible", "fast furious", "expendables", "transformers", "equalizer"] },
            { title: "🥊 Fight & Survival", id: "action3", movies: ["taken", "sicario", "heat", "collateral", "man on fire"] },
            { title: "🚗 High Speed Thrills", id: "action4", movies: ["baby driver", "ford ferrari", "rush", "need for speed", "bullet train"] },
            { title: "🪖 War & Military", id: "action5", movies: ["1917", "dunkirk", "hacksaw ridge", "lone survivor", "american sniper"] },
        ],

        scifi: [
            { title: "🚀 Space Epics", id: "scifi1", movies: ["dune", "interstellar", "gravity", "martian", "arrival"] },
            { title: "🤖 AI & Future", id: "scifi2", movies: ["ex machina", "blade runner 2049", "her", "minority report", "transcendence"] },
            { title: "🌌 Mind Bending", id: "scifi3", movies: ["inception", "tenet", "looper", "predestination", "coherence"] },
            { title: "👽 Alien Invasion", id: "scifi4", movies: ["independence day", "district 9", "arrival", "war of worlds", "edge of tomorrow"] },
            { title: "🔬 Sci-Fi Classics", id: "scifi5", movies: ["2001 space odyssey", "alien", "terminator", "total recall", "contact"] },
        ],

        thriller: [
            { title: "🔍 Mystery Thrillers", id: "thriller1", movies: ["gone girl", "prisoners", "zodiac", "fincher", "knives out"] },
            { title: "😰 Psychological", id: "thriller2", movies: ["shutter island", "black swan", "requiem dream", "fight club", "prestige"] },
            { title: "🔪 Crime Thrillers", id: "thriller3", movies: ["se7en", "silence of lambs", "no country for old men", "nightcrawler", "parasite"] },
            { title: "💼 Spy Thrillers", id: "thriller4", movies: ["tinker tailor", "bourne identity", "munich", "bridge of spies", "spy game"] },
            { title: "⚖️ Legal Thrillers", id: "thriller5", movies: ["a few good men", "the firm", "rainmaker", "michael clayton", "lincoln lawyer"] },
        ],

        horror: [
            { title: "😱 Must Watch Horror", id: "horror1", movies: ["conjuring", "hereditary", "midsommar", "it", "get out"] },
            { title: "👻 Supernatural", id: "horror2", movies: ["insidious", "annabelle", "the nun", "sinister", "oculus"] },
            { title: "🧟 Creature Horror", id: "horror3", movies: ["alien", "predator", "thing", "cloverfield", "bird box"] },
            { title: "🔪 Slasher Classics", id: "horror4", movies: ["halloween", "nightmare elm street", "friday 13th", "scream", "candyman"] },
            { title: "🌀 Modern Horror", id: "horror5", movies: ["smile", "nope", "us", "quiet place", "barbarian"] },
        ],

        comedy: [
            { title: "😂 Must Watch Comedy", id: "comedy1", movies: ["hangover", "superbad", "step brothers", "anchorman", "bridesmaids"] },
            { title: "🎭 Rom-Com", id: "comedy2", movies: ["crazy rich asians", "about time", "hitch", "proposal", "10 things i hate"] },
            { title: "🤣 Action Comedy", id: "comedy3", movies: ["free guy", "central intelligence", "game night", "21 jump street", "bad boys"] },
            { title: "👨‍👩‍👧 Family Comedy", id: "comedy4", movies: ["home alone", "elf", "mrs doubtfire", "junior", "big"] },
            { title: "🌟 Comedy Classics", id: "comedy5", movies: ["ferris bueller", "groundhog day", "blazing saddles", "airplane", "naked gun"] },
        ],

        romance: [
            { title: "❤️ Epic Love Stories", id: "romance1", movies: ["titanic", "notebook", "la la land", "pride prejudice", "atonement"] },
            { title: "💑 Modern Romance", id: "romance2", movies: ["before sunrise", "about time", "500 days summer", "eternal sunshine", "her"] },
            { title: "💍 Wedding & Love", id: "romance3", movies: ["crazy rich asians", "my best friend wedding", "mamma mia", "four weddings", "notting hill"] },
            { title: "🌹 Classic Romance", id: "romance4", movies: ["casablanca", "roman holiday", "breakfast tiffany", "gone with wind", "doctor zhivago"] },
            { title: "💔 Heartbreak Stories", id: "romance5", movies: ["blue valentine", "marriage story", "normal people", "call me your name", "brokeback mountain"] },
        ],

        superhero: [
            { title: "🦸 Marvel Universe", id: "superhero1", movies: ["avengers endgame", "spider man no way home", "iron man", "thor ragnarok", "black panther"] },
            { title: "🦇 DC Universe", id: "superhero2", movies: ["dark knight", "batman", "wonder woman", "aquaman", "shazam"] },
            { title: "💀 Anti-Heroes", id: "superhero3", movies: ["deadpool", "venom", "joker", "logan", "black adam"] },
            { title: "🌟 Classic Superhero", id: "superhero4", movies: ["superman", "batman begins", "x men", "spider man 2002", "hellboy"] },
            { title: "🔮 New Generation", id: "superhero5", movies: ["doctor strange", "eternals", "black widow", "shang chi", "captain marvel"] },
        ],

        bollywood: [
            { title: "🎬 Blockbusters", id: "bollywood1", movies: ["dangal", "3 idiots", "PK", "bajrangi bhaijaan", "war"] },
            { title: "🎵 Romantic Hits", id: "bollywood2", movies: ["dilwale dulhania", "kabir singh", "ae dil hai mushkil", "raazi", "tamasha"] },
            { title: "💥 Action Dhamaka", id: "bollywood3", movies: ["uri", "pathaan", "tiger zinda hai", "dhoom", "singham"] },
            { title: "🏆 Award Winners", id: "bollywood4", movies: ["article 15", "andhadhun", "tumbbad", "masaan", "court"] },
            { title: "😂 Comedy Kings", id: "bollywood5", movies: ["hera pheri", "golmaal", "delhi belly", "dhamaal", "welcome"] },
        ],

        hindi: [
            { title: "🔥 Latest Hits", id: "hindi1", movies: ["pathaan", "jawan", "tiger 3", "animal", "dunki"] },
            { title: "🎭 Drama", id: "hindi2", movies: ["kabir singh", "tamasha", "rockstar", "highway", "lootera"] },
            { title: "💥 Action", id: "hindi3", movies: ["war", "uri", "singham", "dabangg", "rowdy rathore"] },
            { title: "😂 Comedy", id: "hindi4", movies: ["hera pheri", "golmaal", "dhamaal", "pyaar ka punchnama", "fukrey"] },
            { title: "🏆 Critically Acclaimed", id: "hindi5", movies: ["andhadhun", "tumbbad", "article 15", "drishyam", "talvar"] },
        ],

        tamil: [
            { title: "🔥 Mass Entertainers", id: "tamil1", movies: ["vikram", "master", "bigil", "beast", "leo"] },
            { title: "💥 Action", id: "tamil2", movies: ["kgf", "pushpa", "valimai", "thunivu", "jailer"] },
            { title: "🎭 Drama", id: "tamil3", movies: ["96", "pariyerum perumal", "super deluxe", "kadaisi vivasayi", "soorarai pottru"] },
            { title: "😂 Comedy", id: "tamil4", movies: ["engeyum kadhal", "naduvula konjam pakkatha kaanom", "inaindha kaigal", "oru kal oru kannadi", "mankatha"] },
            { title: "🌟 Pan India Hits", id: "tamil5", movies: ["baahubali", "rrr", "salaar", "kalki", "devara"] },
        ],

        crime: [
            { title: "🕵️ Crime Masterpieces", id: "crime1", movies: ["godfather", "goodfellas", "departed", "scarface", "casino"] },
            { title: "🔫 Heist Movies", id: "crime2", movies: ["heat", "italian job", "oceans eleven", "inside man", "town"] },
            { title: "📋 True Crime", id: "crime3", movies: ["wolf of wall street", "catch me if you can", "american gangster", "blow", "narcos"] },
            { title: "🌍 World Crime", id: "crime4", movies: ["city of god", "parasite", "elite squad", "gomorrah", "dark"] },
            { title: "🚔 Cop Dramas", id: "crime5", movies: ["training day", "se7en", "la confidential", "true detective", "zodiac"] },
        ],

        fantasy: [
            { title: "🧙 Epic Fantasy", id: "fantasy1", movies: ["lord of the rings", "hobbit", "harry potter", "narnia", "eragon"] },
            { title: "🐉 Mythological", id: "fantasy2", movies: ["clash of titans", "immortals", "troy", "300", "hercules"] },
            { title: "✨ Dark Fantasy", id: "fantasy3", movies: ["pan labyrinth", "shape of water", "coraline", "labyrinth", "princess mononoke"] },
            { title: "🌊 Adventure Fantasy", id: "fantasy4", movies: ["pirates caribbean", "golden compass", "mummy", "national treasure", "indiana jones"] },
            { title: "🔮 Modern Fantasy", id: "fantasy5", movies: ["doctor strange", "thor", "black panther wakanda", "eternals", "shazam"] },
        ],

        animation: [
            { title: "🎨 Pixar Classics", id: "animation1", movies: ["toy story", "finding nemo", "up", "wall-e", "coco"] },
            { title: "🌀 Disney Magic", id: "animation2", movies: ["lion king", "frozen", "moana", "encanto", "ratatouille"] },
            { title: "⛩️ Studio Ghibli", id: "animation3", movies: ["spirited away", "princess mononoke", "howl moving castle", "my neighbor totoro", "nausicaa"] },
            { title: "🦸 Animated Superhero", id: "animation4", movies: ["spider man spider verse", "incredibles", "batman mask phantasm", "big hero 6", "megamind"] },
            { title: "😂 Animated Comedy", id: "animation5", movies: ["despicable me", "minions", "kung fu panda", "shrek", "madagascar"] },
        ],

        documentary: [
            { title: "🧗 Adventure Docs", id: "doc1", movies: ["free solo", "the rescue", "meru", "touching the void", "valley uprising"] },
            { title: "🌍 Social Docs", id: "doc2", movies: ["social dilemma", "13th", "icarus", "blackfish", "seaspiracy"] },
            { title: "🍣 Food & Culture", id: "doc3", movies: ["jiro dreams sushi", "chef table", "salt fat acid heat", "ugly delicious", "noma"] },
            { title: "🎵 Music Docs", id: "doc4", movies: ["amy", "bohemian rhapsody", "rocketman", "i am not your negro", "whitney"] },
            { title: "🔬 Science & Nature", id: "doc5", movies: ["planet earth", "our planet", "cosmos", "human", "life"] },
        ],

        sports: [
            { title: "🏆 Inspiring Sports", id: "sports1", movies: ["ford ferrari", "moneyball", "rocky", "remember titans", "miracle"] },
            { title: "⚽ Football", id: "sports2", movies: ["bend it like beckham", "goal", "invictus", "next goal wins", "escape to victory"] },
            { title: "🥊 Boxing", id: "sports3", movies: ["rocky", "raging bull", "southpaw", "creed", "cinderella man"] },
            { title: "🏎️ Racing", id: "sports4", movies: ["rush", "ford ferrari", "need for speed", "senna", "days of thunder"] },
            { title: "🏀 Basketball", id: "sports5", movies: ["space jam", "coach carter", "hoosiers", "white men cant jump", "he got game"] },
        ],

        family: [
            { title: "👨‍👩‍👧 Family Favorites", id: "family1", movies: ["home alone", "jumanji", "mrs doubtfire", "matilda", "paddington"] },
            { title: "🦁 Animal Adventures", id: "family2", movies: ["lion king", "babe", "lassie", "marley me", "secret life pets"] },
            { title: "🧚 Magical Stories", id: "family3", movies: ["harry potter", "narnia", "neverending story", "labyrinth", "princess bride"] },
            { title: "🎄 Holiday Movies", id: "family4", movies: ["home alone", "elf", "grinch", "christmas story", "polar express"] },
            { title: "🤖 Sci-Fi Family", id: "family5", movies: ["incredibles", "big hero 6", "iron giant", "et", "short circuit"] },
        ],

        anime: [
            { title: "⚔️ Action Anime", id: "anime1", movies: ["demon slayer", "attack on titan", "jujutsu kaisen", "naruto", "bleach"] },
            { title: "🌸 Studio Ghibli", id: "anime2", movies: ["spirited away", "princess mononoke", "howl moving castle", "my neighbor totoro", "kiki delivery"] },
            { title: "🔮 Fantasy Anime", id: "anime3", movies: ["your name", "weathering with you", "a silent voice", "wolf children", "belle"] },
            { title: "🤖 Sci-Fi Anime", id: "anime4", movies: ["akira", "ghost in the shell", "evangelion", "cowboy bebop", "serial experiments lain"] },
            { title: "😂 Comedy Anime", id: "anime5", movies: ["one punch man", "mob psycho", "konosuba", "grand blue", "nichijou"] },
        ],

        standup: [
            { title: "😂 Must Watch", id: "standup1", movies: ["dave chappelle", "john mulaney", "hannah gadsby", "bo burnham", "trevor noah"] },
            { title: "🌟 Legends", id: "standup2", movies: ["george carlin", "richard pryor", "eddie murphy", "bill hicks", "robin williams"] },
            { title: "🎤 Netflix Specials", id: "standup3", movies: ["kevin hart", "ricky gervais", "jim jefferies", "bill burr", "ali wong"] },
            { title: "🌍 International", id: "standup4", movies: ["russell howard", "michael mcintyre", "lee evans", "jimmy carr", "jack whitehall"] },
            { title: "🇮🇳 Indian Stand-Up", id: "standup5", movies: ["zakir khan", "kenny sebastian", "kanan gill", "biswa kalyan", "abhishek upmanyu"] },
        ],

        hollywood: [
            { title: "🌟 All Time Greats", id: "hollywood1", movies: ["godfather", "schindler list", "forrest gump", "shawshank redemption", "dark knight"] },
            { title: "🔥 2020s Best", id: "hollywood2", movies: ["oppenheimer", "dune", "top gun maverick", "everything everywhere", "tár"] },
            { title: "💥 Action Blockbusters", id: "hollywood3", movies: ["avengers endgame", "inception", "interstellar", "mad max fury road", "gladiator"] },
            { title: "🏆 Oscar Winners", id: "hollywood4", movies: ["parasite", "nomadland", "coda", "green book", "shape of water"] },
            { title: "🎭 Drama Masterpieces", id: "hollywood5", movies: ["there will be blood", "no country for old men", "12 years slave", "moonlight", "whiplash"] },
        ],

        drama: [
            { title: "🎭 Must Watch Drama", id: "drama1", movies: ["shawshank redemption", "forrest gump", "beautiful mind", "green book", "king speech"] },
            { title: "💼 Corporate Drama", id: "drama2", movies: ["social network", "moneyball", "big short", "wolf wall street", "margin call"] },
            { title: "⚖️ Courtroom Drama", id: "drama3", movies: ["a few good men", "lincoln lawyer", "verdict", "philadelphia", "12 angry men"] },
            { title: "🌍 World Drama", id: "drama4", movies: ["parasite", "roma", "cold war", "shoplifters", "burning"] },
            { title: "🎬 Biographical", id: "drama5", movies: ["bohemian rhapsody", "rocketman", "elvis", "judy", "harriet"] },
        ],
    };

    const sections = genreData[genre];
    if (!sections) return;

    sections.forEach(({ title, id, movies }) => {
        let section = document.getElementById("dynamic_" + id);
        if (!section) {
            section = document.createElement("section");
            section.className = "movies-section";
            section.id = "dynamic_" + id;
            section.innerHTML = `<h2>${title}</h2><div class="movie-row" id="row_${id}"></div>`;
            document.getElementById("movieSectionsContainer").appendChild(section);
        }
        section.style.display = "block";
        loadSection(movies, "row_" + id);
    });

    setTimeout(() => {
        document.getElementById("dynamic_" + sections[0].id).scrollIntoView({ behavior: "smooth" });
    }, 100);
}

/* ==========================================
   LOAD EVERYTHING
========================================== */

/* ==========================================
   LOAD EVERYTHING
========================================== */

loadSection("trending", "trendingMovies");
loadSection("action", "actionMovies");
loadSection("scifi", "sciFiMovies");
loadSection("action", "superheroMovies");
loadSection("drama", "topRated");
loadSection("comedy", "comedyMovies");
loadSection("horror", "horrorMovies");