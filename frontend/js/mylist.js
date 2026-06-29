/* ── Toast notification ── */
function showToast(message = "Added to My List ♥") {
    const toast = document.getElementById("toast");
    const toastMsg = document.getElementById("toastMsg");
    if (!toast) return;
    toastMsg.innerText = message;
    toast.classList.remove("show");
    void toast.offsetWidth;
    toast.classList.add("show");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove("show"), 3000);
}

/* ── Background collage ── */
const collagePosters = [
    "https://m.media-amazon.com/images/M/MV5BMTczNTI2ODUwOF5BMl5BanBnXkFtZTcwMTU0NTIzMw@@._V1_SX300.jpg",
    "https://m.media-amazon.com/images/M/MV5BNWIwODRlZTUtY2U3ZS00Yzg1LWJhNzYtMmZiYmEyNmU1NjMzXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    "https://m.media-amazon.com/images/M/MV5BMTg1MTY2MjYzNV5BMl5BanBnXkFtZTgwMjY0NTAzMDE@._V1_SX300.jpg",
    "https://m.media-amazon.com/images/M/MV5BMTQ0MjMxNTQ5OF5BMl5BanBnXkFtZTcwNzI3MDkwNA@@._V1_SX300.jpg"
];
function buildCollage() {
    const collage = document.getElementById("bgCollage");
    if (!collage) return;
    collage.innerHTML = "";
    for (let i = 0; i < 18; i++) {
        const img = document.createElement("img");
        img.src = collagePosters[i % collagePosters.length];
        collage.appendChild(img);
    }
}
buildCollage();

/* ── Load & render saved movies ── */
function loadMyList() {
    const myList = JSON.parse(localStorage.getItem("myList")) || [];
    const container = document.getElementById("myListMovies");
    if (!container) return;
    container.innerHTML = "";

    const count = myList.length;
    const countEl = document.querySelector(".mylist-count");
    if (countEl) {
        countEl.innerText = count === 0 ? "No movies saved yet" : `${count} ${count === 1 ? "movie" : "movies"} saved`;
    }

    if (count === 0) {
        // Empty state with working buttons
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                        <rect x="6" y="14" width="52" height="38" rx="4" stroke="currentColor" stroke-width="1.8" fill="none" />
                        <path d="M6 24h52" stroke="currentColor" stroke-width="1.8" />
                        <circle cx="22" cy="38" r="6" stroke="currentColor" stroke-width="1.8" fill="none" />
                        <path d="M26 38h24" stroke="currentColor" stroke-width="1.8" />
                        <path d="M44 32v12" stroke="currentColor" stroke-width="1.8" />
                        <path d="M38 38h12" stroke="currentColor" stroke-width="1.8" />
                    </svg>
                </div>
                <h2 class="empty-title">No movies saved yet</h2>
                <p class="empty-desc">
                    Your list is empty. Start adding your favorite movies and series from the
                    <strong>home page</strong>!
                </p>
                <div class="empty-action">
                    <a href="movies.html" class="btn-primary"><span>+</span> Browse Movies</a>
                    <a href="series.html" class="btn-secondary">Explore Series</a>
                </div>
            </div>
        `;
        return;
    }

    // Render saved movies as cards
    myList.forEach(movie => {
        container.innerHTML += `
            <div class="mylist-card">
                <span class="remove-btn" onclick="removeMovie('${movie.title.replace(/'/g, "\\'")}')">✕</span>
                <img src="${movie.poster}" alt="${movie.title}">
                <div class="overlay"><h3>${movie.title}</h3></div>
            </div>
        `;
    });
}

/* ── Remove a movie ── */
function removeMovie(title) {
    let myList = JSON.parse(localStorage.getItem("myList")) || [];
    myList = myList.filter(movie => movie.title !== title);
    localStorage.setItem("myList", JSON.stringify(myList));
    loadMyList();
    showToast(`Removed: ${title}`);
}

// ─── Initialize ───
loadMyList();

// Make showToast globally available for other pages
window.showToast = showToast;