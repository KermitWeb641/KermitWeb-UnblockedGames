const canvas = document.getElementById('snowCanvas');
const ctx = canvas.getContext('2d');

let width, height;
let snowflakes = [];

// Snowflake configuration
const SNOWFLAKE_COUNT_FACTOR = 0.15; // Flakes per pixel of width approx
const MIN_SIZE = 1;
const MAX_SIZE = 3;
const MIN_SPEED = 0.5;
const MAX_SPEED = 1.5;

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    initSnowflakes();
}

class Snowflake {
    constructor() {
        this.reset(true);
    }

    reset(initial = false) {
        this.x = Math.random() * width;
        // Start anywhere vertically if initial, otherwise start just above screen
        this.y = initial ? Math.random() * height : -10;
        
        this.size = Math.random() * (MAX_SIZE - MIN_SIZE) + MIN_SIZE;
        this.speed = Math.random() * (MAX_SPEED - MIN_SPEED) + MIN_SPEED;
        
        // Horizontal drift properties
        this.drift = (Math.random() - 0.5) * 0.5;
        this.driftPhase = Math.random() * Math.PI * 2;
        
        this.opacity = Math.random() * 0.4 + 0.4; // 0.4 to 0.8
    }

    update() {
        this.y += this.speed;
        
        // Add subtle sine wave movement
        this.driftPhase += 0.01;
        this.x += Math.sin(this.driftPhase) * 0.3 + this.drift;

        // Reset if off screen
        if (this.y > height + 10) {
            this.reset();
        }
    }

    draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initSnowflakes() {
    snowflakes = [];
    const count = Math.floor(width * SNOWFLAKE_COUNT_FACTOR); // Responsive density
    for (let i = 0; i < Math.max(50, count); i++) {
        snowflakes.push(new Snowflake());
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);
    
    snowflakes.forEach(flake => {
        flake.update();
        flake.draw();
    });
    
    requestAnimationFrame(animate);
}

window.addEventListener('resize', resize);

 // Game Launcher Logic
const gamesContainer = document.getElementById('games-container');
const allGamesContainer = document.getElementById('all-games-container');
const galleryWrapper = document.getElementById('gallery-wrapper');
const searchInput = document.getElementById('game-search');
const suggestionsContainer = document.getElementById('search-suggestions');

// Duplicate items for infinite scroll
const originalItems = Array.from(gamesContainer.children);
originalItems.forEach(item => {
    const clone = item.cloneNode(true);
    clone.dataset.clone = "true"; // mark this as a cloned item (not original)
    gamesContainer.appendChild(clone);
});

 // Auto Scroll Logic
let autoScrollSpeed = 1; // Pixels per frame

function loop() {
    gamesContainer.scrollLeft += autoScrollSpeed;

    // Seamless reset
    // If we've scrolled past half the width (approx one set of items)
    if (gamesContainer.scrollLeft >= gamesContainer.scrollWidth / 2) {
        gamesContainer.scrollLeft -= gamesContainer.scrollWidth / 2;
    }

    requestAnimationFrame(loop);
}

// Start loop
loop();

// Event Delegation for Game Launchers (handles originals and clones)
gamesContainer.addEventListener('click', handleLauncherClick);

if (allGamesContainer) {
    allGamesContainer.addEventListener('click', handleLauncherClick);
}

function handleLauncherClick(e) {
    const launcher = e.target.closest('.game-launcher');
    if (!launcher) return;

    const url = launcher.dataset.url;
    if (!url) return;

    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.allowFullscreen = true;

    iframe.style.position = 'fixed';
    iframe.style.top = '2%';
    iframe.style.left = '2%';
    iframe.style.width = '96%';
    iframe.style.height = '96%';
    iframe.style.border = 'none';
    iframe.style.zIndex = '1000';
    iframe.style.borderRadius = '12px';
    iframe.style.boxShadow = '0 0 30px rgba(0, 0, 0, 0.7)';
    iframe.style.backgroundColor = '#111827';

    const gameTitle = getGameTitleFromLauncher(launcher) || 'Game';

    // Create close button (X)
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.setAttribute('aria-label', 'Close game');
    closeBtn.style.position = 'fixed';
    closeBtn.style.top = '1.2%';
    closeBtn.style.right = '2.5%';
    closeBtn.style.width = '32px';
    closeBtn.style.height = '32px';
    closeBtn.style.borderRadius = '50%';
    closeBtn.style.border = 'none';
    closeBtn.style.background = 'rgba(10,10,15,0.9)';
    closeBtn.style.color = '#f5f5f5';
    closeBtn.style.fontSize = '18px';
    closeBtn.style.lineHeight = '32px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.zIndex = '1001';
    closeBtn.style.display = 'flex';
    closeBtn.style.alignItems = 'center';
    closeBtn.style.justifyContent = 'center';
    closeBtn.style.boxShadow = '0 0 10px rgba(0,0,0,0.8)';
    closeBtn.style.transition = 'transform 0.15s ease, box-shadow 0.15s ease';

    closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.transform = 'scale(1.08) rotate(6deg)';
        closeBtn.style.boxShadow = '0 0 14px rgba(0,0,0,0.95)';
    });

    closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.transform = 'scale(1) rotate(0deg)';
        closeBtn.style.boxShadow = '0 0 10px rgba(0,0,0,0.8)';
    });

    closeBtn.addEventListener('mousedown', () => {
        closeBtn.style.transform = 'scale(0.92) rotate(-4deg)';
    });

    closeBtn.addEventListener('mouseup', () => {
        closeBtn.style.transform = 'scale(1.08) rotate(6deg)';
    });

    closeBtn.addEventListener('click', () => {
        iframe.remove();
        closeBtn.remove();
        downloadBtn.remove();
        if (galleryWrapper) {
            galleryWrapper.style.display = '';
        }
        if (allGamesContainer) {
            allGamesContainer.style.display = '';
        }
    });

    // Create download button
    const downloadBtn = document.createElement('button');
    downloadBtn.setAttribute('aria-label', 'Download game HTML');
    downloadBtn.style.position = 'fixed';
    downloadBtn.style.top = '1.2%';
    downloadBtn.style.right = '5.5%';
    downloadBtn.style.width = '32px';
    downloadBtn.style.height = '32px';
    downloadBtn.style.borderRadius = '50%';
    downloadBtn.style.border = 'none';
    downloadBtn.style.background = 'rgba(10,10,15,0.9)';
    downloadBtn.style.cursor = 'pointer';
    downloadBtn.style.zIndex = '1001';
    downloadBtn.style.display = 'flex';
    downloadBtn.style.alignItems = 'center';
    downloadBtn.style.justifyContent = 'center';
    downloadBtn.style.boxShadow = '0 0 10px rgba(0,0,0,0.8)';
    downloadBtn.style.transition = 'transform 0.15s ease, box-shadow 0.15s ease';

    const downloadIcon = document.createElement('img');
    downloadIcon.src = 'download_24dp_FFFFFF_FILL0_wght400_GRAD0_opsz24.svg';
    downloadIcon.alt = 'Download';
    downloadIcon.style.width = '18px';
    downloadIcon.style.height = '18px';
    downloadIcon.style.pointerEvents = 'none';
    downloadBtn.appendChild(downloadIcon);

    downloadBtn.addEventListener('mouseenter', () => {
        downloadBtn.style.transform = 'scale(1.08)';
        downloadBtn.style.boxShadow = '0 0 14px rgba(0,0,0,0.95)';
    });

    downloadBtn.addEventListener('mouseleave', () => {
        downloadBtn.style.transform = 'scale(1)';
        downloadBtn.style.boxShadow = '0 0 10px rgba(0,0,0,0.8)';
    });

    downloadBtn.addEventListener('mousedown', () => {
        downloadBtn.style.transform = 'scale(0.92)';
    });

    downloadBtn.addEventListener('mouseup', () => {
        downloadBtn.style.transform = 'scale(1.08)';
    });

    downloadBtn.addEventListener('click', () => {
        const fullUrl = new URL(url, window.location.href).href;
        const safeName = gameTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'game';
        const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${gameTitle}</title>
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<style>
html,body{margin:0;height:100%;background:#000;}
iframe{border:0;width:100%;height:100%;}
</style>
</head>
<body>
<iframe src="${fullUrl}" allowfullscreen></iframe>
</body>
</html>`;
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `${safeName || 'game'}.html`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            URL.revokeObjectURL(blobUrl);
            a.remove();
        }, 1500);
    });

    document.body.appendChild(iframe);
    document.body.appendChild(closeBtn);
    document.body.appendChild(downloadBtn);

    if (galleryWrapper) {
        galleryWrapper.style.display = 'none';
    }
    if (allGamesContainer) {
        allGamesContainer.style.display = 'none';
    }
}

 // Hover tooltip for game names
const gameTooltip = document.createElement('div');
gameTooltip.id = 'game-tooltip';
gameTooltip.style.display = 'none';
document.body.appendChild(gameTooltip);

function positionTooltip(e) {
    const offsetX = 14; // to the right of cursor
    const offsetY = -10; // slightly above cursor
    let x = e.clientX + offsetX;
    let y = e.clientY + offsetY;

    const tooltipRect = gameTooltip.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (x + tooltipRect.width > vw) {
        x = vw - tooltipRect.width - 8;
    }
    if (y < 0) {
        y = 0;
    } else if (y + tooltipRect.height > vh) {
        y = vh - tooltipRect.height - 8;
    }

    gameTooltip.style.left = x + 'px';
    gameTooltip.style.top = y + 'px';
}

function getGameTitleFromLauncher(launcher) {
    if (!launcher) return '';

    const overlayTitle = launcher.querySelector('.game-title');
    if (overlayTitle && overlayTitle.textContent.trim()) {
        return overlayTitle.textContent.trim();
    }

    const coverLabel = launcher.querySelector('.cover-label');
    if (coverLabel && coverLabel.textContent.trim()) {
        return coverLabel.textContent.trim();
    }

    return '';
}

function showGameTooltip(e, launcher) {
    const titleText = getGameTitleFromLauncher(launcher);
    if (!titleText) return;

    gameTooltip.textContent = titleText;
    gameTooltip.style.display = 'block';
    positionTooltip(e);
}

function hideGameTooltip() {
    gameTooltip.style.display = 'none';
}

function handleLauncherHover(event) {
    const type = event.type;
    const launcher = event.target.closest('.game-launcher');
    if (!launcher) return;

    if (type === 'mouseover') {
        showGameTooltip(event, launcher);
    } else if (type === 'mouseout') {
        if (!event.relatedTarget || !launcher.contains(event.relatedTarget)) {
            hideGameTooltip();
        }
    }
}

document.addEventListener('mousemove', (e) => {
    if (gameTooltip.style.display === 'block') {
        positionTooltip(e);
    }
});

if (gamesContainer) {
    gamesContainer.addEventListener('mouseover', handleLauncherHover);
    gamesContainer.addEventListener('mouseout', handleLauncherHover);
}
if (allGamesContainer) {
    allGamesContainer.addEventListener('mouseover', handleLauncherHover);
    allGamesContainer.addEventListener('mouseout', handleLauncherHover);
}

const gameMetaEl = document.getElementById('game-meta');

function initGameMeta() {
    if (!gameMetaEl) return;

    const uniqueLaunchers = Array.from(document.querySelectorAll('#games-container .game-launcher:not([data-clone="true"]), #all-games-container .game-launcher'));
    const gameCount = uniqueLaunchers.length;

    function updateTime() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        gameMetaEl.textContent = `${gameCount} games • ${timeStr}`;
    }

    updateTime();
    setInterval(updateTime, 1000);
}

initGameMeta();

// Search bar + suggestions logic
if (searchInput && suggestionsContainer) {
    const searchableLaunchers = Array.from(document.querySelectorAll('.game-launcher:not([data-clone="true"])'));

    function updateSuggestions(query) {
        const q = query.trim().toLowerCase();
        suggestionsContainer.innerHTML = '';

        if (!q) {
            suggestionsContainer.style.display = 'none';
            // Reset visibility of all launchers when query cleared
            searchableLaunchers.forEach(l => {
                l.style.display = '';
            });
            return;
        }

        const matches = searchableLaunchers
            .map(launcher => ({
                launcher,
                title: getGameTitleFromLauncher(launcher)
            }))
            .filter(item => item.title && item.title.toLowerCase().includes(q))
            .sort((a, b) => a.title.localeCompare(b.title, 'en', { sensitivity: 'base' }))
            .slice(0, 6);

        // Do not hide or show any cards while searching; only show suggestions

        if (matches.length === 0) {
            suggestionsContainer.style.display = 'none';
            return;
        }

        matches.forEach(({ launcher, title }) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'search-suggestion-item';
            btn.textContent = title;
            btn.addEventListener('click', () => {
                suggestionsContainer.style.display = 'none';
                searchInput.blur();
                // Launch the game
                launcher.click();
            });
            suggestionsContainer.appendChild(btn);
        });

        suggestionsContainer.style.display = 'block';
    }

    searchInput.addEventListener('input', (e) => {
        updateSuggestions(e.target.value);
    });

    // Hide suggestions shortly after blur (allows click)
    searchInput.addEventListener('blur', () => {
        setTimeout(() => {
            suggestionsContainer.style.display = 'none';
        }, 150);
    });

    // Keep suggestions open when interacting with them
    suggestionsContainer.addEventListener('mousedown', (e) => {
        e.preventDefault();
    });
}

// Start
resize();
animate();