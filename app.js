// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Preloader
const preloader = document.getElementById('preloader');

window.addEventListener('load', () => {
    setTimeout(() => {
        gsap.to(preloader, {
            opacity: 0,
            duration: 1.2,
            ease: "power2.out",
            onComplete: () => {
                preloader.style.display = 'none';
            }
        });
    }, 800);
});

// Three.js Background
let scene, camera, renderer;
let torusKnot;
let particles;
let mouseX = 0, mouseY = 0;
let targetMouseX = 0, targetMouseY = 0;
let scrollVelocity = 0;
let lastScrollY = 0;

function initThree() {
    const canvas = document.getElementById('bg-canvas');
    renderer = new THREE.WebGLRenderer({ 
        canvas: canvas, 
        antialias: true,
        alpha: true 
    });
    
    const dpr = Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = false;

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    // Torus Knot Geometry
    const geometry = new THREE.TorusKnotGeometry(8, 2.8, 128, 32, 3, 7);
    const material = new THREE.PointsMaterial({
        size: 0.12,
        color: 0x3b82f6,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending,
        depthTest: false
    });

    torusKnot = new THREE.Points(geometry, material);
    scene.add(torusKnot);

    // Additional subtle particle field
    const particleCount = window.innerWidth < 768 ? 800 : 1800;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
        const radius = 25 + Math.random() * 15;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        positions[i] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i + 2] = radius * Math.cos(phi);

        const intensity = 0.4 + Math.random() * 0.6;
        colors[i] = 0.2 * intensity;
        colors[i + 1] = 0.5 * intensity;
        colors[i + 2] = 1.0 * intensity;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
        size: 0.085,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });

    particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Mouse move parallax
    window.addEventListener('mousemove', (e) => {
        targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
        targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    window.addEventListener('resize', debounce(resizeHandler, 150));
    
    animate();
}

function resizeHandler() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    if (torusKnot) {
        torusKnot.rotation.x += 0.0025;
        torusKnot.rotation.y += 0.0032;
        
        // Dynamic scaling based on scroll velocity
        const scaleFactor = 1 + Math.abs(scrollVelocity) * 0.012;
        torusKnot.scale.setScalar(scaleFactor);
    }

    if (particles) {
        particles.rotation.y += 0.0008;
    }

    // Smooth mouse follow
    mouseX = mouseX * 0.92 + targetMouseX * 0.08;
    mouseY = mouseY * 0.92 + targetMouseY * 0.08;

    if (torusKnot) {
        torusKnot.rotation.x = mouseY * 0.15;
        torusKnot.rotation.y = mouseX * 0.25;
    }

    renderer.render(scene, camera);
}

// Scroll velocity tracking
let scrollTimeout;
window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    scrollVelocity = Math.abs(currentScrollY - lastScrollY);
    lastScrollY = currentScrollY;

    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        scrollVelocity = 0;
    }, 180);
}, { passive: true });

// GSAP Animations
function initGSAP() {
    // Hero title reveal
    const title = document.getElementById('hero-title');
    const chars = title.textContent.split('');
    title.innerHTML = '';
    
    chars.forEach((char, index) => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.opacity = 0;
        span.style.display = 'inline-block';
        title.appendChild(span);
        
        gsap.to(span, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            delay: 0.8 + index * 0.035,
            ease: "back.out(1.4)"
        });
    });

    gsap.from(".hero-subtitle", {
        y: 60,
        opacity: 0,
        duration: 1.1,
        delay: 1.8,
        ease: "power3.out"
    });

    gsap.from(".hero-meta", {
        y: 40,
        opacity: 0,
        duration: 1,
        delay: 2.3
    });

    // Pillars
    gsap.from(".pillar-card", {
        scrollTrigger: {
            trigger: ".pillars-grid",
            start: "top 75%",
        },
        y: 120,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out"
    });

    // Leadership cards
    const leaderCards = document.querySelectorAll('.leader-card');
    
    leaderCards.forEach((card, i) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: "top 82%",
                toggleActions: "play none none reverse"
            },
            y: 140,
            rotationX: -25,
            opacity: 0,
            duration: 1.1,
            delay: i * 0.1,
            ease: "elastic.out(1, 0.5)"
        });

        // Viewport active glow
        ScrollTrigger.create({
            trigger: card,
            start: "top 65%",
            end: "bottom 35%",
            onEnter: () => card.classList.add('active'),
            onLeave: () => card.classList.remove('active'),
            onEnterBack: () => card.classList.add('active'),
            onLeaveBack: () => card.classList.remove('active')
        });
    });
}

// Utility: Debounce
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    initThree();
    initGSAP();
    
    // Mobile optimizations already handled in Three.js init
    console.log('%cSaanvi International School - Premium Experience Loaded', 'color:#3b82f6; font-family:monospace;');
});
