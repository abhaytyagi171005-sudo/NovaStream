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
        // Simple centered empty state – no box
        container.innerHTML = `
            <div class="empty-state-simple">
                <h2 class="empty-title">Oops! <span>No movies or series</span> added yet</h2>
                <p class="empty-desc">Start building your watchlist by adding your favourite titles from the home page.</p>
                <div class="empty-action">
                    <a href="movies.html" class="btn-primary">+ Browse Movies</a>
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

// Expose toast globally
window.showToast = showToast;
// ─── Notification Dropdown ───
const notifBtn = document.getElementById('notifBtn');
const notifDropdown = document.getElementById('notifDropdown');

if (notifBtn && notifDropdown) {
    notifBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notifDropdown.classList.toggle('open');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!notifBtn.contains(e.target) && !notifDropdown.contains(e.target)) {
            notifDropdown.classList.remove('open');
        }
    });

    // Optionally, close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            notifDropdown.classList.remove('open');
        }
    });
}