// Game 1: Lateralidad
const btnStartLat = document.getElementById('btn-start-lat');
const btnLeft = document.getElementById('btn-left');
const btnRight = document.getElementById('btn-right');
const starTarget = document.getElementById('star-target');
const latScoreEl = document.querySelector('#lat-score span');

let latScore = 0;
let currentSide = null; // 'left' or 'right'
let latTimeout = null;
let latPlaying = false;

function spawnStar() {
    if (!latPlaying) return;
    
    // Random side
    currentSide = Math.random() > 0.5 ? 'left' : 'right';
    
    // Position star
    starTarget.classList.remove('hidden');
    if (currentSide === 'left') {
        starTarget.style.left = '25%';
    } else {
        starTarget.style.left = '75%';
    }

    // Auto fail if too slow
    clearTimeout(latTimeout);
    latTimeout = setTimeout(() => {
        if (latPlaying) {
            handleLatClick('timeout');
        }
    }, 2000);
}

function handleLatClick(side) {
    if (!latPlaying) return;
    
    if (side === currentSide) {
        latScore += 10;
        starTarget.classList.add('hidden');
        latScoreEl.textContent = latScore;
        latScoreEl.style.color = '#009A44'; // UPEL green
        
        setTimeout(spawnStar, 500);
    } else {
        // Wrong or timeout
        latScore -= 5;
        if (latScore < 0) latScore = 0;
        latScoreEl.textContent = latScore;
        latScoreEl.style.color = '#f43f5e'; // red
        
        starTarget.classList.add('hidden');
        setTimeout(spawnStar, 500);
    }
}

btnStartLat.addEventListener('click', () => {
    if (latPlaying) {
        // Stop
        latPlaying = false;
        btnStartLat.textContent = 'Iniciar';
        starTarget.classList.add('hidden');
        clearTimeout(latTimeout);
        latScore = 0;
        latScoreEl.textContent = latScore;
        latScoreEl.style.color = 'inherit';
    } else {
        // Start
        latPlaying = true;
        btnStartLat.textContent = 'Detener';
        latScore = 0;
        latScoreEl.textContent = latScore;
        latScoreEl.style.color = 'inherit';
        spawnStar();
    }
});

btnLeft.addEventListener('click', () => handleLatClick('left'));
btnRight.addEventListener('click', () => handleLatClick('right'));


// Game 2: Equilibrio
const btnStartEq = document.getElementById('btn-start-eq');
const btnTiltLeft = document.getElementById('btn-tilt-left');
const btnTiltRight = document.getElementById('btn-tilt-right');
const beam = document.getElementById('beam');
const ball = document.getElementById('ball');
const eqStatus = document.querySelector('#eq-status span');

let eqPlaying = false;
let beamAngle = 0;
let ballPos = 50; // percentage
let eqAnimFrame;
let gravity = 0;
let timeSurvived = 0;
let lastTime = 0;

function updateEquilibrio(timestamp) {
    if (!eqPlaying) return;

    if (!lastTime) lastTime = timestamp;
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    timeSurvived += deltaTime;

    // Random wind/gravity effect increases over time
    const difficulty = 1 + (timeSurvived / 10000); // gets harder
    gravity += (Math.random() - 0.5) * 0.1 * difficulty;

    // Beam angle changes based on gravity
    beamAngle += gravity;

    // Ball moves based on beam angle
    ballPos += beamAngle * 0.1;

    // Apply visual updates
    beam.style.transform = `rotate(${beamAngle}deg)`;
    ball.style.left = `${ballPos}%`;

    // Check conditions
    if (Math.abs(beamAngle) > 25 || ballPos < 0 || ballPos > 100) {
        gameOverEq();
    } else {
        eqStatus.textContent = `Equilibrando... (${Math.floor(timeSurvived/1000)}s)`;
        eqStatus.style.color = '#009A44';
        eqAnimFrame = requestAnimationFrame(updateEquilibrio);
    }
}

function gameOverEq() {
    eqPlaying = false;
    btnStartEq.textContent = 'Intentar de Nuevo';
    eqStatus.textContent = `¡Caída! Tiempo: ${Math.floor(timeSurvived/1000)}s`;
    eqStatus.style.color = '#f43f5e';
    cancelAnimationFrame(eqAnimFrame);
}

btnStartEq.addEventListener('click', () => {
    if (eqPlaying) {
        // Stop
        eqPlaying = false;
        btnStartEq.textContent = 'Iniciar';
        cancelAnimationFrame(eqAnimFrame);
        eqStatus.textContent = 'Esperando...';
        eqStatus.style.color = 'inherit';
    } else {
        // Start
        eqPlaying = true;
        btnStartEq.textContent = 'Detener';
        beamAngle = 0;
        ballPos = 50;
        gravity = 0;
        timeSurvived = 0;
        lastTime = 0;
        beam.style.transform = `rotate(0deg)`;
        ball.style.left = `50%`;
        eqAnimFrame = requestAnimationFrame(updateEquilibrio);
    }
});

// Tilt controls
const tiltAmount = 2.5;
btnTiltLeft.addEventListener('mousedown', () => { if(eqPlaying) gravity -= tiltAmount; });
btnTiltRight.addEventListener('mousedown', () => { if(eqPlaying) gravity += tiltAmount; });

// Add touch support
btnTiltLeft.addEventListener('touchstart', (e) => { e.preventDefault(); if(eqPlaying) gravity -= tiltAmount; });
btnTiltRight.addEventListener('touchstart', (e) => { e.preventDefault(); if(eqPlaying) gravity += tiltAmount; });

// Scroll Animations (Intersection Observer)
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.card-section').forEach(section => {
    observer.observe(section);
});

// Video Fullscreen Logic
document.querySelectorAll('.clickable-video').forEach(video => {
    // Bloquear audio permanentemente
    video.muted = true;
    video.volume = 0;
    video.addEventListener('volumechange', () => {
        if (!video.muted || video.volume > 0) {
            video.muted = true;
            video.volume = 0;
        }
    });

    video.addEventListener('click', () => {
        if (video.requestFullscreen) {
            video.requestFullscreen();
        } else if (video.webkitRequestFullscreen) { /* Safari */
            video.webkitRequestFullscreen();
        } else if (video.msRequestFullscreen) { /* IE11 */
            video.msRequestFullscreen();
        }
        
        // Ensure controls are visible when fullscreen
        video.setAttribute('controls', 'true');
    });
});

// Remove controls when exiting fullscreen to keep the design clean
document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
        document.querySelectorAll('.clickable-video').forEach(video => {
            video.removeAttribute('controls');
        });
    }
});

// Carousel Logic
const track = document.getElementById('carousel-track');
const slides = Array.from(track.children);
const menuNav = document.querySelector('.carousel-menu');
const menuTabs = Array.from(menuNav.querySelectorAll('.menu-tab'));

let currentSlideIndex = 0;

const updateCarousel = (index) => {
    // Move track
    track.style.transform = `translateX(-${index * 100}%)`;
    
    // Update menu tabs
    menuTabs.forEach(tab => tab.classList.remove('active'));
    menuTabs[index].classList.add('active');
};

menuNav.addEventListener('click', e => {
    const targetTab = e.target.closest('.menu-tab');
    if (!targetTab) return;
    
    currentSlideIndex = parseInt(targetTab.getAttribute('data-slide'));
    updateCarousel(currentSlideIndex);
});

// Lightbox Logic for Gallery
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const closeBtn = document.querySelector('.lightbox-close');
const lbPrevBtn = document.getElementById('lightbox-prev');
const lbNextBtn = document.getElementById('lightbox-next');

const galleryImages = Array.from(document.querySelectorAll('.gallery-img'));
let currentLbIndex = 0;

if (lightbox && lightboxImg) {
    galleryImages.forEach((img, index) => {
        img.addEventListener('click', function() {
            currentLbIndex = index;
            lightbox.style.display = 'flex';
            setTimeout(() => lightbox.classList.add('show'), 10);
            lightboxImg.src = galleryImages[currentLbIndex].src;
        });
    });

    const closeLightbox = () => {
        lightbox.classList.remove('show');
        setTimeout(() => lightbox.style.display = 'none', 300);
    };

    const navigateLightbox = (direction) => {
        currentLbIndex += direction;
        if (currentLbIndex < 0) currentLbIndex = galleryImages.length - 1;
        if (currentLbIndex >= galleryImages.length) currentLbIndex = 0;
        
        lightboxImg.src = galleryImages[currentLbIndex].src;
    };

    if (lbPrevBtn) lbPrevBtn.addEventListener('click', (e) => { e.stopPropagation(); navigateLightbox(-1); });
    if (lbNextBtn) lbNextBtn.addEventListener('click', (e) => { e.stopPropagation(); navigateLightbox(1); });
    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('show')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') navigateLightbox(-1);
        if (e.key === 'ArrowRight') navigateLightbox(1);
    });
}
