/* ─────────────────────────────────────────────────────────
   ADD THIS FUNCTION anywhere in movies.js
   (it powers the toast on the home page too)
   ───────────────────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────────────────
   WHEREVER you have:
       alert("Added to My List ❤️");
   REPLACE it with:
       showToast("Added to My List");
   ───────────────────────────────────────────────────────── */

/* ─────────────────────────────────────────────────────────
   ALSO add the toast HTML just before </body> in home.html:

    <div id="toast" class="toast">
        <span class="toast-icon">♥</span>
        <span id="toastMsg">Added to My List</span>
    </div>

   ───────────────────────────────────────────────────────── */
