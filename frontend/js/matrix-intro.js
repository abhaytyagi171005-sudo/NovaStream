/*=========================================================
    NOVASTREAM INTRO ENGINE – RAIN REVERSE + SCATTER REDIRECT
=========================================================*/

"use strict";

/*=========================
        DOM
=========================*/

const loginForm = document.getElementById("loginForm");
const loginCard = document.querySelector(".login-card");
const overlay = document.getElementById("transitionOverlay");

/*=========================
      CANVAS
=========================*/

let canvas;
let ctx;

let WIDTH = 0;
let HEIGHT = 0;

let animationId = null;

/*=========================
      SETTINGS
=========================*/

const CONFIG = {

    fontSize: 10,

    columnWidth: 10,

    fadeSpeed: 0.08,

    glow: 12,

    maxSpeed: 6,

    minSpeed: 2,

    maxLength: 28,

    minLength: 12

};

/*=========================
      MATRIX SYMBOLS
=========================*/

const GLYPHS =
    "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";

/*=========================
      STORAGE
=========================*/

const columns = [];
const logoImage = new Image();

logoImage.src = "images/novastream-logo.png";
const particles = [];

const logoTargets = [];
let rainConverted = false;

/*=========================
      TIMELINE
=========================*/

const timeline = {

    started: false,

    rain: true,

    attract: false,

    logo: false,

    glow: false,

    zoom: false,

    finished: false

};

// ===== State =====
let logoComplete = false;
let mouseX = -9999, mouseY = -9999;
let audioThumpPlayed = false;
let redirectPending = false;

// ===== Audio Context =====
let audioCtx = null;

/*=========================
    RANDOM HELPER
=========================*/

function random(min, max) {

    return Math.random() * (max - min) + min;

}

function randomInt(min, max) {

    return Math.floor(random(min, max));

}

function randomGlyph() {

    return GLYPHS[
        randomInt(0, GLYPHS.length)
    ];

}
/*=========================================================
    CANVAS ENGINE
=========================================================*/

function createCanvas() {
    overlay.style.backgroundColor = "#000000";
    overlay.style.display = "block";

    overlay.innerHTML = "";

    canvas = document.createElement("canvas");

    canvas.id = "matrixCanvas";

    overlay.appendChild(canvas);

    // ---- Mouse tracking ----
    canvas.addEventListener("mousemove", (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    });
    canvas.addEventListener("mouseleave", () => {
        mouseX = -9999;
        mouseY = -9999;
    });

    ctx = canvas.getContext("2d");

    ctx.textBaseline = "top";

    resizeCanvas();

}

function resizeCanvas() {

    WIDTH = window.innerWidth;

    HEIGHT = window.innerHeight;

    canvas.width = WIDTH;

    canvas.height = HEIGHT;

    buildColumns();

}

window.addEventListener("resize", () => {

    if (!canvas) return;

    resizeCanvas();

});


/*=========================================================
    MATRIX COLUMN CLASS
=========================================================*/

class MatrixColumn {

    constructor(x) {

        this.x = x;
        this.characters = [];
        this.reset();

    }

    reset() {

        this.y = random(-HEIGHT, 0);

        if (Math.random() < 0.7) {

            this.speed = random(1.5, 3);

        } else {

            this.speed = random(5, 9);

        }

        this.length = randomInt(

            CONFIG.minLength,

            CONFIG.maxLength

        );
        this.characters = [];

        for (let i = 0; i < this.length; i++) {

            this.characters.push(

                randomGlyph()

            );

        }

    }

}


/*=========================================================
    CREATE MATRIX COLUMNS
=========================================================*/

function buildColumns() {

    columns.length = 0;

    const totalColumns = Math.ceil(

        WIDTH / CONFIG.columnWidth

    );

    for (let i = 0; i < totalColumns; i++) {

        columns.push(

            new MatrixColumn(

                i * CONFIG.columnWidth

            )

        );

    }

}

/*=========================================================
    DRAW MATRIX RAIN
=========================================================*/

function drawMatrixRain() {

    ctx.font = `${CONFIG.fontSize}px "MS Gothic", "Consolas", monospace`;

    columns.forEach(column => {

        for (let i = 0; i < column.length; i++) {

            const y =

                column.y -

                i * CONFIG.fontSize;

            if (y < 0 || y > HEIGHT) continue;

            const progress = i / column.length;

            const alpha = Math.pow(

                1 - progress,

                2

            );

            ctx.shadowColor = "#00ff41";
            ctx.shadowBlur = CONFIG.glow;

            if (i === 0) {

                ctx.fillStyle =
                    `rgba(0,255,65,${alpha})`;

            }

            else {

                ctx.fillStyle =
                    `rgba(0,200,50,${alpha})`;

            }

            ctx.fillText(

                column.characters[i],

                column.x,

                y

            );
        }

        column.y += column.speed;

        if (Math.random() < 0.04) {

            const index = randomInt(0, column.characters.length);

            column.characters[index] = randomGlyph();

        }

        if (

            column.y -

            column.length *

            CONFIG.fontSize >

            HEIGHT

        ) {

            column.reset();

        }

    });

}


/*=========================================================
    DRAW ENGINE
=========================================================*/

function renderScene() {

    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    drawMatrixRain();

    if (timeline.attract) {

        if (!rainConverted) {
            convertRainToParticles();
            assignTargets();
            rainConverted = true;
        }

        updateParticles();
        drawParticles();

        if (!logoComplete) {
            checkLogoCompletion();
        }
    }

    // ---- Trigger redirect after logo is complete ----
    if (logoComplete && !redirectPending) {
        redirectPending = true;
        console.log("✅ Logo complete – starting redirect in 1.5s");
        setTimeout(() => {
            performRedirect();
        }, 1500);
    }

}

/*=========================================================
    ENGINE LOOP
=========================================================*/

function engineLoop() {

    renderScene();

    animationId = requestAnimationFrame(

        engineLoop

    );

}


/*=========================================================
    START INTRO – INSTANT BLACK + HIDE LOGIN CARD
=========================================================*/

function startIntro() {

    if (timeline.started) return;

    // ==========================================
    // 1. INSTANTLY cover the screen with black
    // ==========================================
    overlay.style.backgroundColor = "#000000";
    overlay.style.display = "block";
    overlay.style.opacity = "1";

    // ==========================================
    // 2. INSTANTLY hide the login card (no transition)
    // ==========================================
    loginCard.style.transition = "none";
    loginCard.style.opacity = "0";
    loginCard.style.transform = "translateY(-20px) scale(.96)";
    // Force reflow so the changes apply immediately
    void loginCard.offsetHeight;

    // Restore transition for any future use
    loginCard.style.transition = "all 0.6s ease";

    // ==========================================
    // 3. Create AudioContext (user gesture)
    // ==========================================
    try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        audioCtx.resume();
        console.log("AudioContext created and resumed.");
    } catch (e) {
        console.log("Web Audio not supported");
    }

    timeline.started = true;

    // ==========================================
    // 4. Proceed with canvas creation after a short delay
    // ==========================================
    setTimeout(() => {

        createCanvas();
        buildLogoTargets();
        engineLoop();

        setTimeout(() => {

            timeline.attract = true;
            console.log("Red particles forming logo... Rain continues!");

        }, 1500);
    }, 500);
}


/*=========================================================
    LOGIN EVENT
=========================================================*/

loginForm.addEventListener(

    "submit",

    e => {

        e.preventDefault();

        startIntro();

    }

);


/*=========================================================
    PARTICLE CLASS
=========================================================*/

class MatrixParticle {

    constructor(x, y, glyph) {

        this.x = x;
        this.y = y;
        this.glyph = glyph;

        this.vx = random(-5, 5);
        this.vy = random(-5, 5);

        this.life = 1;
        this.target = null;

        this.baseSize = 1.8;

    }

    update() {

        if (this.target) {

            const dx = this.target.x - this.x;
            const dy = this.target.y - this.y;

            this.vx += dx * 0.40;
            this.vy += dy * 0.40;

        }

        if (logoComplete && mouseX > -100 && mouseY > -100) {
            const dx = this.x - mouseX;
            const dy = this.y - mouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120 && dist > 0) {
                const force = 0.6 / (dist + 1);
                this.vx += dx * force;
                this.vy += dy * force;
            }
        }

        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);

        if (speed > 35) {
            this.vx = (this.vx / speed) * 35;
            this.vy = (this.vy / speed) * 35;
        }
        if (!this.isScattering) {
            this.vx *= 0.94;
            this.vy *= 0.94;
        }


        this.x += this.vx;
        this.y += this.vy;

        this.life = 1;

    }

    draw() {

        ctx.save();

        let glow = 8;
        if (logoComplete) {
            const pulse = Math.sin(Date.now() * 0.003) * 0.5 + 0.5;
            glow = 8 + pulse * 20;
        }

        ctx.shadowColor = "#e50914";
        ctx.shadowBlur = glow;

        ctx.fillStyle = this.color || "rgb(229,9,20)";
        ctx.globalAlpha = this.life;

        const px = Math.round(this.x);
        const py = Math.round(this.y);

        let size = this.baseSize;
        if (logoComplete) {
            const pulse = Math.sin(Date.now() * 0.003) * 0.5 + 0.5;
            size = this.baseSize + pulse * 0.6;
        }

        ctx.fillRect(px, py, size, size);

        ctx.restore();

    }

}

/*=========================================================
    CONVERT MATRIX RAIN TO PARTICLES
=========================================================*/

function convertRainToParticles() {

    particles.length = 0;

    columns.forEach(column => {

        for (

            let i = 0;

            i < column.characters.length;

            i++

        ) {

            const px = column.x;

            const py =

                column.y -

                i * CONFIG.fontSize;

            for (let j = 0; j < 1; j++) {

                particles.push(

                    new MatrixParticle(

                        px + random(-1.5, 1.5),

                        py + random(-1.5, 1.5),

                        randomGlyph()

                    )

                );

            }

        }

    });
    console.log("Particles spawned:", particles.length);

}

/*=========================================================
    UPDATE PARTICLES
=========================================================*/

function updateParticles() {

    for (let i = particles.length - 1; i >= 0; i--) {

        const p = particles[i];

        p.update();

        if (p.life <= 0) {

            particles.splice(i, 1);

        }

    }

}


/*=========================================================
    DRAW PARTICLES
=========================================================*/

function drawParticles() {

    particles.forEach(p => {

        p.draw();

    });

}

/*=========================================================
    BUILD LOGO TARGETS
=========================================================*/

function buildLogoTargets() {

    logoTargets.length = 0;

    const buffer = document.createElement("canvas");

    buffer.width = WIDTH;

    buffer.height = HEIGHT;

    const bctx = buffer.getContext("2d");

    const logoWidth = Math.min(WIDTH * 0.8, 1100);

    const ratio =
        logoImage.width /
        logoImage.height;

    const logoHeight =
        logoWidth / ratio;

    const x =
        (WIDTH - logoWidth) / 2;

    const y =
        (HEIGHT - logoHeight) / 2;

    bctx.drawImage(

        logoImage,

        x,

        y,

        logoWidth,

        logoHeight

    );

    const img = bctx.getImageData(

        0,

        0,

        WIDTH,

        HEIGHT

    );

    const pixels = img.data;

    const step = 4;

    for (

        let y = 0;

        y < HEIGHT;

        y += step

    ) {

        for (

            let x = 0;

            x < WIDTH;

            x += step

        ) {

            const index =

                (y * WIDTH + x) * 4;

            const alpha =
                pixels[index + 3];

            if (alpha < 120)

                continue;

            const r = pixels[index];

            const g = pixels[index + 1];

            const b = pixels[index + 2];

            logoTargets.push({

                x,

                y,

                color:

                    `rgb(${r},${g},${b})`

            });

        }

    }

    console.log(

        "Logo Pixels:",

        logoTargets.length

    );
}

/*=========================================================
    ASSIGN PARTICLES TO LOGO PIXELS
=========================================================*/

function assignTargets() {

    if (logoTargets.length === 0) return;

    const shuffledTargets = [...logoTargets];

    for (let i = shuffledTargets.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [shuffledTargets[i], shuffledTargets[j]] =
            [shuffledTargets[j], shuffledTargets[i]];
    }

    const total = Math.min(
        particles.length,
        shuffledTargets.length
    );

    for (let i = 0; i < total; i++) {

        particles[i].target = shuffledTargets[i];

        particles[i].color = shuffledTargets[i].color;

    }

    if (particles.length > total) {

        particles.splice(total, particles.length - total);

    }

    console.log("Particles with targets:", particles.length);
}


/*=========================================================
    LOGO COMPLETION DETECTION
=========================================================*/

function checkLogoCompletion() {
    if (particles.length === 0) return;

    let allSettled = true;
    for (const p of particles) {
        if (p.target) {
            const dx = p.target.x - p.x;
            const dy = p.target.y - p.y;
            if (Math.sqrt(dx * dx + dy * dy) > 2.5) {
                allSettled = false;
                break;
            }
        }
    }

    if (allSettled && !logoComplete) {
        logoComplete = true;
        timeline.logo = true;
        console.log("🎯 Logo formed! Playing thump...");
        playBassThump();
    }
}


/*=========================================================
    AUDIO – LOW FREQUENCY THUMP
=========================================================*/

function playBassThump() {
    if (audioThumpPlayed) return;
    audioThumpPlayed = true;

    if (!audioCtx) {
        console.log("Audio context not available.");
        return;
    }

    try {
        if (audioCtx.state === "suspended") {
            audioCtx.resume().then(() => {
                playSound(audioCtx);
            }).catch(() => console.log("Could not resume audio."));
        } else {
            playSound(audioCtx);
        }
    } catch (e) {
        console.log("Audio error:", e);
    }
}

function playSound(ctx) {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(60, ctx.currentTime);

    gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.25);
}


/*=========================================================
    REDIRECT – RAIN REVERSE + TRUE PARTICLE SCATTER
=========================================================*/

function performRedirect() {
    console.log("🌀 Reversing rain + scattering particles off screen...");

    // 1. Reverse the rain direction
    columns.forEach(col => {
        col.speed = -Math.abs(col.speed) * 0.6;
    });

    // 2. Calculate center of the logo
    let cx = 0, cy = 0;
    let count = 0;
    particles.forEach(p => {
        if (p.target) {
            cx += p.target.x;
            cy += p.target.y;
            count++;
        }
    });
    if (count > 0) {
        cx /= count;
        cy /= count;
    } else {
        cx = WIDTH / 2;
        cy = HEIGHT / 2;
    }

    // 3. Scatter particles with high speed and NO damping
    const speed = 12; // fast enough to leave the screen in ~1s
    particles.forEach(p => {
        // Stop attraction
        p.target = null;
        // Direction outward from center
        const dx = p.x - cx;
        const dy = p.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const angle = Math.atan2(dy, dx);
        // Set velocity directly
        p.vx = Math.cos(angle) * speed + random(-1, 1);
        p.vy = Math.sin(angle) * speed + random(-1, 1);
        // Mark as scattering so we can skip damping
        p.isScattering = true;
    });

    // 4. After 1.2 seconds, remove all particles and redirect
    setTimeout(() => {
        particles.length = 0; // completely remove red particles
        window.location.href = "https://abhaytyagi171005-sudo.github.io/NovaStream/frontend/home.html";
    }, 1200);
}