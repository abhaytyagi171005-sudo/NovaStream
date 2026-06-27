// Netflix-style hover preview with YouTube trailer
let hoverTimer = null;
let activePreview = null;

function attachPreviews() {
    document.querySelectorAll(".card[data-trailer]").forEach(card => {
        card.addEventListener("mouseenter", () => {
            hoverTimer = setTimeout(() => showPreview(card), 1000);
        });
        card.addEventListener("mouseleave", () => {
            clearTimeout(hoverTimer);
            hidePreview();
        });
    });
}

function showPreview(card) {
    hidePreview();

    const trailerKey = card.dataset.trailer;
    const title = card.dataset.title;
    const year = card.dataset.year;
    const rating = card.dataset.rating;
    const genres = card.dataset.genres;

    const rect = card.getBoundingClientRect();

    const preview = document.createElement("div");
    preview.id = "previewPopup";
    preview.style.cssText = `
        position: fixed;
        top: ${Math.max(rect.top - 60, 10)}px;
        left: ${rect.left - 40}px;
        width: 380px;
        background: #181818;
        border-radius: 12px;
        z-index: 99999;
        box-shadow: 0 20px 60px rgba(0,0,0,.8);
        overflow: hidden;
        animation: popIn .2s ease;
    `;

    preview.innerHTML = `
        <style>
            @keyframes popIn {
                from { transform: scale(0.9); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
        </style>
        <div style="width:100%;height:210px;background:#000;position:relative;">
            <iframe
                src="https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${trailerKey}"
                style="width:100%;height:100%;border:none;"
                allow="autoplay; encrypted-media"
                allowfullscreen>
            </iframe>
        </div>
        <div style="padding:15px;">
            <h3 style="font-size:1rem;margin-bottom:6px;color:white;">${title}</h3>
            <div style="display:flex;gap:10px;align-items:center;margin-bottom:8px;">
                <span style="color:#46d369;font-weight:600;font-size:.85rem;">⭐ ${rating || 'N/A'}</span>
                <span style="color:#aaa;font-size:.8rem;">${year || ''}</span>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:6px;">
                ${(genres || '').split(',').map(g => `
                    <span style="background:rgba(255,255,255,.1);padding:3px 10px;border-radius:20px;font-size:.7rem;color:#ccc;">${g.trim()}</span>
                `).join('')}
            </div>
        </div>
    `;

    preview.addEventListener("mouseenter", () => clearTimeout(hoverTimer));
    preview.addEventListener("mouseleave", hidePreview);

    document.body.appendChild(preview);
    activePreview = preview;

    // Adjust if goes off screen
    const popRect = preview.getBoundingClientRect();
    if (popRect.right > window.innerWidth) {
        preview.style.left = `${window.innerWidth - 400}px`;
    }
    if (popRect.bottom > window.innerHeight) {
        preview.style.top = `${rect.top - preview.offsetHeight - 10}px`;
    }
}

function hidePreview() {
    if (activePreview) {
        activePreview.remove();
        activePreview = null;
    }
}