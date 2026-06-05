
/**
 * Saanvi International School - High-Performance Creative Portal UI Engine
 * Specialized WebGL Framework & Hardware-Accelerated Layout Controllers
 */

document.addEventListener('DOMContentLoaded', () => {
    // Register GSAP Plugins immediately
    gsap.registerPlugin(ScrollTrigger);

    // Core Global Execution Context Variables
    let webglEngine, uiAnimationEngine;

    // Helper: Debounce window resizing transactions
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    /* ==========================================================================
       1. CORE INITIALIZATION ENGINE RUNNERS
       ========================================================================== */
    class WebGLEngine {
        constructor() {
            this.canvas = document.getElementById('webgl-bg');
            this.isMobile = window.innerWidth < 768;
            this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
            this.scrollVelocity = 0;
            this.lastScrollY = window.scrollY;
            
            this.initScene();
            this.initParticles();
            this.initListeners();
            this.animate();
        }

        initScene() {
            this.scene = new THREE.Scene();
            
            // Optical parameters
            this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
            this.camera.position.z = 28;

            // Enforce explicit hardware constraints: Max DPR of 2 prevents mobile GPU throttling
            this.renderer = new THREE.WebGLRenderer({
                canvas: this.canvas,
                alpha: true,
                antialias: !this.isMobile,
                powerPreference: "high-performance"
            });
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }

        initParticles() {
            // Mobile Optimization Asset Scaling down by 60% if under mobile threshold
            const radialSegments = this.isMobile ? 12 : 30;
            const tubularSegments = this.isMobile ? 80 : 250;
            
            // Kinetic Torus Knot Setup
            this.geometry = new THREE.TorusKnotGeometry(10, 3, tubularSegments, radialSegments, 2, 3);
            
            // Extract positions to create custom interactive Point Vortex
            const sourcePositions = this.geometry.attributes.position;
            const count = sourcePositions.count;
            
            this.particleGeometry = new THREE.BufferGeometry();
            this.positions = new Float32Array(count * 3);
            this.colors = new Float32Array(count * 3);

            const colorOne = new THREE.Color('#1d4ed8'); // Deep Sapphire
            const colorTwo = new THREE.Color('#3b82f6'); // Electric Blue
            const interpolatorColor = new THREE.Color();

            for (let i = 0; i < count; i++) {
                this.positions[i * 3] = sourcePositions.getX(i);
                this.positions[i * 3 + 1] = sourcePositions.getY(i);
                this.positions[i * 3 + 2] = sourcePositions.getZ(i);

                // Vertex distribution color map scaling
                const mixFactor = Math.random();
                interpolatorColor.lerpColors(colorOne, colorTwo, mixFactor);
                this.colors[i * 3] = interpolatorColor.r;
                this.colors[i * 3 + 1] = interpolatorColor.g;
                this.colors[i * 3 + 2] = interpolatorColor.b;
            }

            this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
            this.particleGeometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));

            this.material = new THREE.PointsMaterial({
                size: this.isMobile ? 0.08 : 0.05,
                vertexColors: true,
                transparent: true,
                opacity: 0.85,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });

            this.pointCloud = new THREE.Points(this.particleGeometry, this.material);
            this.scene.add(this.pointCloud);
        }

        initListeners() {
            // Track mouse parameters for parallax layout computation
            if (!this.isMobile) {
                window.addEventListener('mousemove', (e) => {
                    this.mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2.5;
                    this.mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2.5;
                });
            }

            // Debounced Resizing execution
            window.addEventListener('resize', debounce(() => {
                this.isMobile = window.innerWidth < 768;
                this.camera.aspect = window.innerWidth / window.innerHeight;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(window.innerWidth, window.innerHeight);
                this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            }, 150));
        }

        animate() {
            requestAnimationFrame(() => this.animate());

            // Real-time computation of scroll velocity vectors via structural loop
            const currentScrollY = window.scrollY;
            this.scrollVelocity = currentScrollY - this.lastScrollY;
            this.lastScrollY = currentScrollY;

            // Velocity interpolation damping
            this.scrollVelocity *= 0.92;

            // Smooth mouse interpolations for desktop configurations
            this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
            this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

            // Dynamic kinetic transformations tied to scroll mechanics and speed
            const velocityEffect = Math.abs(this.scrollVelocity) * 0.0015;
            
            this.pointCloud.rotation.x += 0.002 + velocityEffect;
            this.pointCloud.rotation.y += 0.003;

            // Dynamic scale response based directly on interactive velocity values
            const baseScale = 1.0;
            const scaleFactor = baseScale + (velocityEffect * 1.8);
            this.pointCloud.scale.set(scaleFactor, baseScale / (1 + velocityEffect), scaleFactor);

            // Subtle parallax tracking integration
            this.pointCloud.position.x = this.mouse.x;
            this.pointCloud.position.y = -this.mouse.y;

            this.renderer.render(this.scene, this.camera);
        }
    }

    class UIAnimationEngine {
        constructor() {
            this.initPreloader();
            this.splitHeroText();
            this.initScrollAnimations();
        }

        initPreloader() {
            const preloader = document.getElementById('preloader');
            const progressBar = document.querySelector('.preloader-progress');
            
            // Simulation logic matching asset pipeline readiness
            const tl = gsap.timeline({
                onComplete: () => {
                    preloader.style.display = 'none';
                    this.triggerHeroEntrance();
                }
            });

            tl.to(progressBar, { width: '100%', duration: 1.2, ease: 'power2.out' })
              .to(preloader, { opacity: 0, duration: 0.6, ease: 'power3.inOut' });
        }

        splitHeroText() {
            const titleEl = document.getElementById('split-title');
            if (!titleEl) return;

            const textString = titleEl.textContent;
            const characters = textString.split('');
            titleEl.textContent = '';

            characters.forEach(char => {
                const span = document.createElement('span');
                // Retain layout geometry spaces explicitly
                span.textContent = char === ' ' ? '\u00A0' : char;
                span.style.display = 'inline-block';
                span.className = 'char';
                titleEl.appendChild(span);
            });
        }

        triggerHeroEntrance() {
            const tl = gsap.timeline();

            tl.from('.navbar', { y: -80, opacity: 0, duration: 0.8, ease: 'power3.out' })
              .from('.hero-motto', { opacity: 0, y: 20, duration: 0.5 }, '-=0.4')
              .from('#split-title .char', {
                  opacity: 0,
                  y: 50,
                  rotationX: -30,
                  stagger: 0.02,
                  duration: 0.8,
                  ease: 'back.out(1.7)'
              }, '-=0.4')
              .from('.hero-tagline', { opacity: 0, y: 20, duration: 0.6 }, '-=0.3')
              .from('.hero-scroll-indicator', { opacity: 0, duration: 0.4 }, '-=0.2');
        }

        initScrollAnimations() {
            // Vision Section Pillars Matrix Scale, Skew and build-in animation logic
            gsap.from('.vision-statement', {
                scrollTrigger: {
                    trigger: '.vision-statement',
                    start: 'top 85%',
                },
                opacity: 0,
                y: 40,
                duration: 0.8,
                ease: 'power3.out'
            });

            gsap.from('.animate-pillar', {
                scrollTrigger: {
                    trigger: '.pillars-grid',
                    start: 'top 85%',
                },
                opacity: 0,
                y: 50,
                scale: 0.95,
                skewY: 2,
                stagger: 0.1,
                duration: 0.8,
                ease: 'power3.out'
            });

            // Executive Leadership Elastic Bounce Animation Logic
            gsap.from('.animate-card', {
                scrollTrigger: {
                    trigger: '.leadership-grid',
                    start: 'top 80%',
                },
                opacity: 0,
                y: 70,
                scale: 0.9,
                stagger: 0.15,
                duration: 1.2,
                ease: 'elastic.out(1, 0.75)'
            });

            // VIEWPORT-TRIGGERED ACTIVE GLOW TOGGLE CONTROLLER
            const dynamicCards = gsap.utils.toArray('.glass-card');
            dynamicCards.forEach(card => {
                ScrollTrigger.create({
                    trigger: card,
                    start: 'top 75%',
                    end: 'bottom 25%',
                    onEnter: () => card.classList.add('active-glow'),
                    onLeave: () => card.classList.remove('active-glow'),
                    onEnterBack: () => card.classList.add('active-glow'),
                    onLeaveBack: () => card.classList.remove('active-glow')
                });
            });
        }
    }

    /* ==========================================================================
       2. EXECUTION ENGINE BOOTSTRAPPER
       ========================================================================== */
    // Initialize WebGL background layer
    webglEngine = new WebGLEngine();
    
    // Initialize standard structural UI animation layer
    uiAnimationEngine = new UIAnimationEngine();
});
