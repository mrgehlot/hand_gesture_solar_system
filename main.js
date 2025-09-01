// Solar System 3D Web App with Hand Gesture Controls
// Using Three.js for 3D rendering and MediaPipe HandGestureRecognizer for gesture detection

import {
    GestureRecognizer,
    FilesetResolver,
    DrawingUtils
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";

class SolarSystemApp {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.planets = [];
        this.currentPlanetIndex = 0;
        this.detailLevel = 'overview'; // overview, detailed, deep
        this.isLocked = false;
        
        // Hand gesture recognition
        this.gestureRecognizer = null;
        this.video = null;
        this.canvas = null;
        this.ctx = null;
        this.webcamRunning = false;
        
        // Gesture detection
        this.lastGesture = null;
        this.lastHandPosition = { x: 0, y: 0, z: 0 };
        this.lastVideoTime = -1;
        this.results = null;
        
        // Planet data with orbital information
        this.planetData = [
            {
                name: 'Sun',
                radius: 5,
                distance: 0,
                color: 0xffff00,
                texture: null,
                orbitalPeriod: 0, // Sun doesn't orbit
                orbitalSpeed: 0,
                moons: [], // Sun has no moons
                description: {
                    overview: 'The Sun is the star at the center of our Solar System.',
                    detailed: 'A yellow dwarf star, the Sun provides light and heat to all planets. It contains 99.86% of the Solar System\'s mass.',
                    deep: 'The Sun is a G-type main-sequence star with a surface temperature of 5,778 K. It formed 4.6 billion years ago and will continue to shine for another 5 billion years.'
                }
            },
            {
                name: 'Mercury',
                radius: 0.8,
                distance: 15,
                color: 0x8c7853,
                texture: null,
                orbitalPeriod: 88, // Earth days
                orbitalSpeed: 0.01, // Speed multiplier for animation
                moons: [], // Mercury has no moons
                description: {
                    overview: 'Mercury is the smallest and innermost planet in the Solar System.',
                    detailed: 'Mercury has no moons and no atmosphere. It\'s heavily cratered and experiences extreme temperature variations.',
                    deep: 'Mercury\'s surface temperature ranges from -180°C to 430°C. It has a large iron core and completes one orbit every 88 Earth days.'
                }
            },
            {
                name: 'Venus',
                radius: 1.2,
                distance: 22,
                color: 0xffa500,
                texture: null,
                orbitalPeriod: 225, // Earth days
                orbitalSpeed: 0.008,
                moons: [], // Venus has no moons
                description: {
                    overview: 'Venus is the second planet from the Sun and Earth\'s closest planetary neighbor.',
                    detailed: 'Venus has a thick atmosphere of carbon dioxide and sulfuric acid clouds. It\'s the hottest planet in our Solar System.',
                    deep: 'Venus has a runaway greenhouse effect with surface temperatures reaching 462°C. It rotates backwards compared to most planets.'
                }
            },
            {
                name: 'Earth',
                radius: 1.3,
                distance: 30,
                color: 0x0077ff,
                texture: null,
                orbitalPeriod: 365, // Earth days
                orbitalSpeed: 0.006,
                moons: [
                    { name: 'Moon', radius: 0.3, distance: 2.5, color: 0xcccccc, orbitalSpeed: 0.02 }
                ],
                description: {
                    overview: 'Earth is our home planet and the only known planet with life.',
                    detailed: 'Earth has one moon, liquid water, and a protective atmosphere. It\'s the only planet known to support life.',
                    deep: 'Earth formed 4.54 billion years ago. It has a magnetic field that protects life from solar radiation and cosmic rays.'
                }
            },
            {
                name: 'Mars',
                radius: 1.0,
                distance: 38,
                color: 0xff4500,
                texture: null,
                orbitalPeriod: 687, // Earth days
                orbitalSpeed: 0.005,
                moons: [
                    { name: 'Phobos', radius: 0.15, distance: 1.8, color: 0x8b4513, orbitalSpeed: 0.03 },
                    { name: 'Deimos', radius: 0.12, distance: 2.2, color: 0x654321, orbitalSpeed: 0.025 }
                ],
                description: {
                    overview: 'Mars is the fourth planet from the Sun, often called the Red Planet.',
                    detailed: 'Mars has two moons, thin atmosphere, and evidence of ancient water. It\'s a target for future human exploration.',
                    deep: 'Mars has the largest volcano in the Solar System (Olympus Mons) and evidence of ancient river valleys and lake beds.'
                }
            },
            {
                name: 'Jupiter',
                radius: 3.0,
                distance: 50,
                color: 0xffd700,
                texture: null,
                orbitalPeriod: 4333, // Earth days
                orbitalSpeed: 0.003,
                moons: [
                    { name: 'Io', radius: 0.4, distance: 4.5, color: 0xff8c00, orbitalSpeed: 0.04 },
                    { name: 'Europa', radius: 0.35, distance: 5.0, color: 0x87ceeb, orbitalSpeed: 0.035 },
                    { name: 'Ganymede', radius: 0.5, distance: 5.5, color: 0x8b4513, orbitalSpeed: 0.03 },
                    { name: 'Callisto', radius: 0.45, distance: 6.0, color: 0x696969, orbitalSpeed: 0.025 }
                ],
                description: {
                    overview: 'Jupiter is the largest planet in our Solar System.',
                    detailed: 'Jupiter is a gas giant with 79 known moons. It has a Great Red Spot storm that has raged for centuries.',
                    deep: 'Jupiter\'s mass is 2.5 times that of all other planets combined. It acts as a cosmic vacuum cleaner, protecting inner planets from asteroids.'
                }
            },
            {
                name: 'Saturn',
                radius: 2.5,
                distance: 65,
                color: 0xffd700,
                texture: null,
                orbitalPeriod: 10759, // Earth days
                orbitalSpeed: 0.002,
                moons: [
                    { name: 'Titan', radius: 0.4, distance: 4.0, color: 0xffa500, orbitalSpeed: 0.035 },
                    { name: 'Enceladus', radius: 0.2, distance: 3.5, color: 0xffffff, orbitalSpeed: 0.04 },
                    { name: 'Mimas', radius: 0.15, distance: 3.0, color: 0xcccccc, orbitalSpeed: 0.045 }
                ],
                description: {
                    overview: 'Saturn is famous for its spectacular ring system.',
                    detailed: 'Saturn has 82 moons and beautiful rings made of ice, rock, and dust. It\'s the least dense planet in our Solar System.',
                    deep: 'Saturn\'s rings are only about 10 meters thick but span 280,000 km. The planet could float in water if there was an ocean large enough.'
                }
            },
            {
                name: 'Uranus',
                radius: 2.0,
                distance: 80,
                color: 0x00ffff,
                texture: null,
                orbitalPeriod: 30687, // Earth days
                orbitalSpeed: 0.0015,
                moons: [
                    { name: 'Miranda', radius: 0.15, distance: 3.0, color: 0x8b4513, orbitalSpeed: 0.04 },
                    { name: 'Ariel', radius: 0.2, distance: 3.5, color: 0xcccccc, orbitalSpeed: 0.035 },
                    { name: 'Umbriel', radius: 0.18, distance: 4.0, color: 0x696969, orbitalSpeed: 0.03 }
                ],
                description: {
                    overview: 'Uranus is the seventh planet from the Sun and an ice giant.',
                    detailed: 'Uranus rotates on its side and has 27 moons. It appears blue-green due to methane in its atmosphere.',
                    deep: 'Uranus was the first planet discovered with a telescope. It has 13 faint rings and experiences extreme seasons due to its tilted axis.'
                }
            },
            {
                name: 'Neptune',
                radius: 1.9,
                distance: 95,
                color: 0x0000ff,
                texture: null,
                orbitalPeriod: 60190, // Earth days
                orbitalSpeed: 0.001,
                moons: [
                    { name: 'Triton', radius: 0.25, distance: 3.0, color: 0x87ceeb, orbitalSpeed: 0.035 },
                    { name: 'Proteus', radius: 0.2, distance: 3.5, color: 0x696969, orbitalSpeed: 0.03 }
                ],
                description: {
                    overview: 'Neptune is the eighth and farthest known planet from the Sun.',
                    detailed: 'Neptune is an ice giant with 14 moons and the strongest winds in the Solar System, reaching 2,100 km/h.',
                    deep: 'Neptune was predicted mathematically before it was discovered. It has a Great Dark Spot storm similar to Jupiter\'s Great Red Spot.'
                }
            }
        ];
        
        // Z-depth calibration
        this.calibratedZDepth = null;
        
        // Rotary dial detection
        this.lastFingerPositions = null;
        this.rotationHistory = [];
        
        // Add debouncing for detail level changes
        this.lastDetailChangeTime = 0;
        this.detailChangeCooldown = 1000; // 1 second cooldown between changes
        
        // Swipe gesture detection
        this.swipeStartPosition = null;
        this.swipeStartTime = null;
        this.swipeThreshold = 0.15; // Minimum distance for swipe (15% of screen)
        this.swipeTimeThreshold = 500; // Maximum time for swipe (500ms)
        this.lastSwipeTime = 0;
        this.swipeCooldown = 500; // Cooldown between swipes (800ms)
        
        // Continuous swipe detection
        this.lastPalmPosition = null;
        this.swipeVelocityThreshold = 0.001; // Much lower threshold for normalized coordinates
        
        // Planet tracking
        this.isTrackingPlanet = false;
        this.trackingPlanetIndex = -1;
        this.cameraOffset = new THREE.Vector3(0, 10, 20);
        
        // Zoom state variables
        this.isZoomedIn = false;
        this.zoomTarget = null;
        this.originalCameraOffset = new THREE.Vector3(0, 10, 20);
        this.zoomedCameraOffset = new THREE.Vector3(0, 2, 8);
        this.zoomTransitionProgress = 0;
        this.zoomTransitionDuration = 1000; // 1 second
        this.zoomStartTime = 0;
        this.zoomedPlanetIndex = -1; // Track which planet is zoomed in
        this.isRevolvingAroundPlanet = false; // Track if we're revolving around a specific planet
        
        this.init();
    }
    
    async init() {
        try {
            // Initialize Three.js
            this.initThreeJS();
            
            // Initialize MediaPipe HandGestureRecognizer
            await this.createGestureRecognizer();
            
            // Create solar system
            this.createSolarSystem();
            
            // Start animation loop
            this.animate();
            
            // Hide loading screen
            setTimeout(() => {
                document.getElementById('loading').classList.add('hidden');
            }, 1000);
            
        } catch (error) {
            console.error('Initialization error:', error);
        }
    }
    
    initThreeJS() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000011);
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 20, 50);
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: document.getElementById('webgl'),
            antialias: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Enhanced lighting system
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        
        // Main sun light
        const sunLight = new THREE.PointLight(0xffffff, 3, 200);
        sunLight.position.set(0, 0, 0);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        this.scene.add(sunLight);
        
        // Additional rim lighting for better planet visibility
        const rimLight = new THREE.DirectionalLight(0xffffff, 0.5);
        rimLight.position.set(50, 50, 50);
        this.scene.add(rimLight);
        
        // Stars background
        this.createStarField();
        

        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    createStarField() {
        const starsGeometry = new THREE.BufferGeometry();
        const starsMaterial = new THREE.PointsMaterial({ 
            color: 0xffffff, 
            size: 0.1,
            transparent: true,
            opacity: 0.8
        });
        
        const starsVertices = [];
        for (let i = 0; i < 1000; i++) {
            const x = (Math.random() - 0.5) * 2000;
            const y = (Math.random() - 0.5) * 2000;
            const z = (Math.random() - 0.5) * 2000;
            starsVertices.push(x, y, z);
        }
        
        starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
        const stars = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(stars);
    }
    
    createSolarSystem() {
        this.planets = [];
        
        this.planetData.forEach((planetInfo, index) => {
            // Create planet geometry with higher resolution
            const geometry = new THREE.SphereGeometry(planetInfo.radius, 64, 64);
            
            let material;
            
            if (planetInfo.name === 'Sun') {
                // Sun with glowing effect
                material = new THREE.MeshBasicMaterial({ 
                    color: 0xffff00,
                    emissive: 0xffaa00,
                    emissiveIntensity: 0.8
                });
                
                // Add sun glow effect
                this.createSunGlow(planetInfo.radius);
            } else {
                // Create realistic planet material
                material = this.createPlanetMaterial(planetInfo);
            }
            
            const planet = new THREE.Mesh(geometry, material);
            
            // Position planets in a line for simplicity
            planet.position.x = planetInfo.distance;
            
            // Add to scene
            this.scene.add(planet);
            
            // Create moons for this planet
            const moons = [];
            planetInfo.moons.forEach((moonInfo, moonIndex) => {
                const moonGeometry = new THREE.SphereGeometry(moonInfo.radius, 32, 32);
                const moonMaterial = new THREE.MeshPhongMaterial({ color: moonInfo.color });
                const moon = new THREE.Mesh(moonGeometry, moonMaterial);
                
                // Position moon relative to planet
                moon.position.x = moonInfo.distance;
                moon.position.y = (moonIndex - (planetInfo.moons.length - 1) / 2) * 0.5; // Stack moons vertically
                
                // Add moon to planet (so it moves with the planet)
                planet.add(moon);
                
                // Store moon data
                moons.push({
                    mesh: moon,
                    data: moonInfo,
                    orbitalAngle: Math.random() * Math.PI * 2,
                    orbitalRadius: moonInfo.distance
                });
            });
            
            // Store reference with orbital data and moons
            this.planets.push({
                mesh: planet,
                data: planetInfo,
                index: index,
                orbitalAngle: Math.random() * Math.PI * 2,
                orbitalRadius: planetInfo.distance,
                moons: moons
            });
            
            // Add orbit ring for non-sun planets
            if (planetInfo.name !== 'Sun') {
                this.createOrbitRing(planetInfo.distance);
            }
        });
        
        // Update UI
        this.updatePlanetInfo();
    }
    
    // Create sun glow effect
    createSunGlow(radius) {
        // Create a larger sphere for the glow effect
        const glowGeometry = new THREE.SphereGeometry(radius * 1.5, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xffaa00,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending
        });
        
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.set(0, 0, 0);
        this.scene.add(glow);
        
        // Add corona effect
        const coronaGeometry = new THREE.SphereGeometry(radius * 2, 32, 32);
        const coronaMaterial = new THREE.MeshBasicMaterial({
            color: 0xff6600,
            transparent: true,
            opacity: 0.1,
            blending: THREE.AdditiveBlending
        });
        
        const corona = new THREE.Mesh(coronaGeometry, coronaMaterial);
        corona.position.set(0, 0, 0);
        this.scene.add(corona);
    }
    
    // Create realistic planet materials
    createPlanetMaterial(planetInfo) {
        const material = new THREE.MeshPhongMaterial({
            color: planetInfo.color,
            shininess: planetInfo.shininess || 30,
            specular: planetInfo.specular || 0x111111,
            transparent: false
        });
        
        // Add specific enhancements for each planet
        switch (planetInfo.name) {
            case 'Mercury':
                // Mercury - rocky, cratered surface
                material.color.setHex(0x8c7853);
                material.shininess = 10;
                material.specular.setHex(0x222222);
                break;
                
            case 'Venus':
                // Venus - thick atmosphere, yellowish
                material.color.setHex(0xffa500);
                material.shininess = 5;
                material.specular.setHex(0x444444);
                break;
                
            case 'Earth':
                // Earth - blue oceans, green continents
                material.color.setHex(0x0077ff);
                material.shininess = 50;
                material.specular.setHex(0x0066cc);
                break;
                
            case 'Mars':
                // Mars - red, rusty surface
                material.color.setHex(0xff4500);
                material.shininess = 20;
                material.specular.setHex(0xcc3300);
                break;
                
            case 'Jupiter':
                // Jupiter - gas giant with bands
                material.color.setHex(0xffd700);
                material.shininess = 100;
                material.specular.setHex(0xffff00);
                break;
                
            case 'Saturn':
                // Saturn - golden gas giant
                material.color.setHex(0xffd700);
                material.shininess = 80;
                material.specular.setHex(0xffaa00);
                break;
                
            case 'Uranus':
                // Uranus - ice giant, blue-green
                material.color.setHex(0x00ffff);
                material.shininess = 60;
                material.specular.setHex(0x00aaaa);
                break;
                
            case 'Neptune':
                // Neptune - deep blue ice giant
                material.color.setHex(0x0000ff);
                material.shininess = 70;
                material.specular.setHex(0x0066ff);
                break;
        }
        
        return material;
    }
    
    // Enhanced orbit rings with better visual quality
    createOrbitRing(distance) {
        const ringGeometry = new THREE.RingGeometry(distance - 0.1, distance + 0.1, 128);
        const ringMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x444444, 
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.2,
            blending: THREE.AdditiveBlending
        });
        
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = -Math.PI / 2;
        this.scene.add(ring);
    }
    
    async createGestureRecognizer() {
        try {
            // Create video element for camera
            this.video = document.createElement('video');
            this.video.style.display = 'none';
            this.video.autoplay = true;
            this.video.playsinline = true;
            document.body.appendChild(this.video);
            
                    // Create canvas for hand tracking visualization (make it visible)
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '10px';
        this.canvas.style.right = '10px';
        this.canvas.style.width = '320px';
        this.canvas.style.height = '240px';
        this.canvas.style.border = '2px solid #00ff00';
        this.canvas.style.zIndex = '1000';
        this.canvas.width = 640;
        this.canvas.height = 480;
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        
        // Create debug info panel
        this.debugPanel = document.createElement('div');
        this.debugPanel.style.position = 'fixed';
        this.debugPanel.style.top = '260px';
        this.debugPanel.style.right = '10px';
        this.debugPanel.style.width = '320px';
        this.debugPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        this.debugPanel.style.color = '#00ff00';
        this.debugPanel.style.padding = '10px';
        this.debugPanel.style.fontFamily = 'monospace';
        this.debugPanel.style.fontSize = '12px';
        this.debugPanel.style.zIndex = '1000';
        this.debugPanel.style.border = '1px solid #00ff00';
        this.debugPanel.innerHTML = '<strong>Debug Info:</strong><br>Waiting for camera...';
        document.body.appendChild(this.debugPanel);
            
            // Initialize MediaPipe HandGestureRecognizer
            const vision = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
            );
            
            this.gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath:
                        "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
                    delegate: "CPU"
                },
                runningMode: "VIDEO"
            });
        
            // Start webcam
            await this.startWebcam();
            
        } catch (error) {
            console.error('❌ Error creating gesture recognizer:', error);
        }
    }
    
    async startWebcam() {
        try {
            const constraints = { 
                video: { 
                    width: 640, 
                    height: 480,
                    facingMode: 'user'
                } 
            };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.video.srcObject = stream;
            this.video.addEventListener('loadeddata', () => {
                this.webcamRunning = true;
                this.predictWebcam();
            });
        } catch (error) {
            console.error('❌ Error starting webcam:', error);
        }
    }
    
    predictWebcam() {
        if (!this.webcamRunning) return;
        
        // Get current time for video processing
        const nowInMs = Date.now();
        
        // Process video frame for gesture recognition
        if (this.video.currentTime !== this.lastVideoTime) {
            this.lastVideoTime = this.video.currentTime;
            this.results = this.gestureRecognizer.recognizeForVideo(this.video, nowInMs);
            this.processGestureResults();
            this.drawHandLandmarks();
        }
        
        // Continue processing
        if (this.webcamRunning) {
            requestAnimationFrame(() => this.predictWebcam());
        } else {
            
        }
    }
    
    processGestureResults() {
        if (!this.results) return;
                
        // Update debug panel
        this.updateDebugPanel();
        
        // Process gestures
        if (this.results.gestures && this.results.gestures.length > 0) {
            const gesture = this.results.gestures[0][0];
            const gestureName = gesture.categoryName;
            const confidence = gesture.score;
            
            // Process gestures with lower confidence threshold
            if (confidence > 0.6) {
                this.handleGesture(gestureName);
            } else{

            }
        } else {

        }
        
        // Process hand position for detail level
        if (this.results.landmarks && this.results.landmarks.length > 0) {
            const landmarks = this.results.landmarks[0];
            this.processHandPosition(landmarks);
        } else {

        }
    }
    
    updateDebugPanel() {
        if (!this.debugPanel) return;
        
        let debugInfo = '<strong>Debug Info:</strong><br>';
        
        if (this.results) {
            if (this.results.gestures && this.results.gestures.length > 0) {
                const gesture = this.results.gestures[0][0];
                debugInfo += `Gesture: ${gesture.categoryName}<br>`;
                debugInfo += `Confidence: ${(gesture.score * 100).toFixed(1)}%<br>`;
            } else {
                debugInfo += 'Gesture: None detected<br>';
            }
            
            if (this.results.landmarks && this.results.landmarks.length > 0) {
                debugInfo += `Hand: ${this.results.landmarks.length} landmarks<br>`;
                debugInfo += `Current Detail: ${this.detailLevel}<br>`;
                debugInfo += `Planet: ${this.planets[this.currentPlanetIndex]?.data.name || 'Unknown'}<br>`;
                
                // Show lock status and mode
                if (this.isLocked) {
                    debugInfo += `Mode: LOCKED (Rotary Dial)<br>`;
                } else {
                    debugInfo += `Mode: UNLOCKED (Swipe)<br>`;
                }
                
                // Show palm velocity for swipe detection
                if (this.lastPalmPosition && this.results.landmarks[0][9]) {
                    const palmCenter = this.results.landmarks[0][9];
                    const currentTime = Date.now();
                    const deltaTime = currentTime - this.lastPalmPosition.time;
                    if (deltaTime > 0) {
                        const deltaX = palmCenter.x - this.lastPalmPosition.x;
                        const velocity = Math.abs(deltaX) / deltaTime;
                        debugInfo += `Palm Velocity: ${velocity.toFixed(4)}<br>`;
                        debugInfo += `Delta X: ${deltaX.toFixed(4)}<br>`;
                        debugInfo += `Delta Time: ${deltaTime}ms<br>`;
                    }
                }
            } else {
                debugInfo += 'Hand: Not detected<br>';
            }
        } else {
            debugInfo += 'No results yet<br>';
        }
        
        debugInfo += `<br>Status: ${this.webcamRunning ? 'Webcam Active' : 'Webcam Inactive'}`;
        
        this.debugPanel.innerHTML = debugInfo;
    }
    
    handleGesture(gestureName) {
        switch (gestureName) {
            case 'Open_Palm':
                if (this.isZoomedIn) {
                    // Zoom out but continue revolving around the same planet
                    this.zoomOutButKeepRevolving();
                }
                this.isLocked = false;
                // Reset any ongoing gestures and rotary dial state
                this.lastPalmPosition = null;
                this.lastFingerPositions = null;
                this.rotationHistory = [];
                break;
            case 'Closed_Fist':
                if (!this.isZoomedIn) {
                    // Zoom in to current planet and halt its movement
                    this.zoomInAndHaltPlanet();
                }
                this.isLocked = true;
                // Reset swipe state when locking
                this.lastPalmPosition = null;
                break;
            default:
                break;
        }
    }
    
    processHandPosition(landmarks) {
        // Get all finger tip positions for rotary dial detection
        const thumbTip = landmarks[4];    // Thumb tip
        const indexTip = landmarks[8];    // Index finger tip
        const middleTip = landmarks[12];  // Middle finger tip
        const ringTip = landmarks[16];    // Ring finger tip
        const pinkyTip = landmarks[20];   // Pinky finger tip
        
        // Calculate center point of all five finger tips
        const centerX = (thumbTip.x + indexTip.x + middleTip.x + ringTip.x + pinkyTip.x) / 5;
        const centerY = (thumbTip.y + indexTip.y + middleTip.y + ringTip.y + pinkyTip.y) / 5;
        
        // Check for fist-to-palm transition for calibration
        const isFist = this.detectFist(landmarks);
        const wasFist = this.lastGesture === 'Closed_Fist';
        
        // Calibration: When transitioning from fist to open palm
        if (wasFist && !isFist) {
            // User just opened their palm - calibrate Z-depth
            this.calibrateZDepth(thumbTip.z); // Use thumb tip Z for calibration
        }
        
        // Update last gesture for next frame
        this.lastGesture = isFist ? 'Closed_Fist' : 'Open_Palm';
        
        // Process continuous swipe gestures (only when unlocked)
        if (!this.isLocked) {
            this.processContinuousSwipe(landmarks);
            // Ensure rotary dial state is cleared when in swipe mode
            this.lastFingerPositions = null;
            this.rotationHistory = [];
        }
        
        // Process rotary dial (only when locked)
        if (this.isLocked) {
            // Ensure swipe state is cleared when in rotary dial mode
            this.lastPalmPosition = null;
            
            // Simple check: if we have a center point and fingers are spread out enough
            const isDialFormation = this.checkSimpleDialFormation(landmarks);
            
            if (isDialFormation) {
                // Calculate rotation direction and magnitude based on center point movement
                const currentRotation = this.calculateCenterRotation(landmarks);
                
                if (currentRotation !== 0) {
                    this.handleRotaryDial(currentRotation);
                }
            }
        }
        
        // Update last position
        this.lastHandPosition = {
            x: centerX * window.innerWidth,
            y: centerY * window.innerHeight,
            z: (thumbTip.z + indexTip.z + middleTip.z + ringTip.z + pinkyTip.z) / 5
        };
    }
    
    // Continuous swipe detection using palm center
    processContinuousSwipe(landmarks) {
        if (!landmarks || landmarks.length < 21) return;
        
        const palmCenter = landmarks[9]; // Palm center landmark
        const currentTime = Date.now();
        
        if (!this.lastPalmPosition) {
            this.lastPalmPosition = { 
                x: palmCenter.x, 
                y: palmCenter.y, 
                time: currentTime 
            };
            return;
        }
        
        const deltaX = palmCenter.x - this.lastPalmPosition.x;
        const deltaY = palmCenter.y - this.lastPalmPosition.y;
        const deltaTime = currentTime - this.lastPalmPosition.time;
        
        // Only process if enough time has passed (avoid too frequent updates)
        if (deltaTime < 16) return; // ~60fps
        
        // Calculate velocity
        const velocity = Math.abs(deltaX) / deltaTime;
        
        // Check for fast horizontal movement (swipe) - adjusted thresholds
        if (deltaTime > 0 && Math.abs(deltaX) > 0.01 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
            
            // Check if velocity is high enough and cooldown has passed
            if (velocity > this.swipeVelocityThreshold && currentTime - this.lastSwipeTime > this.swipeCooldown) {
                if (deltaX > 0) {
                    // Swipe right - next planet
                    this.nextPlanet();
                } else {
                    // Swipe left - previous planet
                    this.previousPlanet();
                }
                this.lastSwipeTime = currentTime;
            } else {

            }
        } else {
            
        }
        
        // Update last palm position
        this.lastPalmPosition = { 
            x: palmCenter.x, 
            y: palmCenter.y, 
            time: currentTime 
        };
    }
    
    // Simple dial formation check - just check if fingers are spread out enough
    checkSimpleDialFormation(landmarks) {
        if (!landmarks || landmarks.length < 21) {
            return false;
        }
        
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        const middleTip = landmarks[12];
        const ringTip = landmarks[16];
        const pinkyTip = landmarks[20];
        
        // Calculate center point
        const centerX = (thumbTip.x + indexTip.x + middleTip.x + ringTip.x + pinkyTip.x) / 5;
        const centerY = (thumbTip.y + indexTip.y + middleTip.y + ringTip.y + pinkyTip.y) / 5;
        
        // Check if fingers are spread out enough from the center
        const fingerTips = [thumbTip, indexTip, middleTip, ringTip, pinkyTip];
        const distances = fingerTips.map(tip => 
            Math.sqrt(Math.pow(tip.x - centerX, 2) + Math.pow(tip.y - centerY, 2))
        );
        
        const avgDistance = distances.reduce((sum, dist) => sum + dist, 0) / 5;
        
        // Simple check: if average distance is reasonable (fingers are spread out)
        const isSpreadOut = avgDistance > 0.05; // Minimum spread threshold
        
        return isSpreadOut;
    }
    
    // Calculate rotation based on center point movement and finger tip positions
    calculateCenterRotation(landmarks) {
        if (!this.lastFingerPositions) {
            // First time, just store positions for all five fingers
            this.lastFingerPositions = {
                thumb: { x: landmarks[4].x, y: landmarks[4].y },
                index: { x: landmarks[8].x, y: landmarks[8].y },
                middle: { x: landmarks[12].x, y: landmarks[12].y },
                ring: { x: landmarks[16].x, y: landmarks[16].y },
                pinky: { x: landmarks[20].x, y: landmarks[20].y }
            };
            this.rotationHistory = [];
            return 0;
        }
        
        // Calculate center points for both current and last positions
        const lastCenterX = (this.lastFingerPositions.thumb.x + this.lastFingerPositions.index.x + 
                           this.lastFingerPositions.middle.x + this.lastFingerPositions.ring.x + 
                           this.lastFingerPositions.pinky.x) / 5;
        const lastCenterY = (this.lastFingerPositions.thumb.y + this.lastFingerPositions.index.y + 
                           this.lastFingerPositions.middle.y + this.lastFingerPositions.ring.y + 
                           this.lastFingerPositions.pinky.y) / 5;
        
        const currentCenterX = (landmarks[4].x + landmarks[8].x + landmarks[12].x + landmarks[16].x + landmarks[20].x) / 5;
        const currentCenterY = (landmarks[4].y + landmarks[8].y + landmarks[12].y + landmarks[16].y + landmarks[20].y) / 5;
        
        // Check if center has moved too much (indicates hand movement, not rotation)
        const centerMovement = Math.sqrt(
            Math.pow(currentCenterX - lastCenterX, 2) + Math.pow(currentCenterY - lastCenterY, 2)
        );
        
        if (centerMovement > 0.03) { // Allow some center movement
            // Hand moved too much, reset positions
            this.lastFingerPositions = {
                thumb: { x: landmarks[4].x, y: landmarks[4].y },
                index: { x: landmarks[8].x, y: landmarks[8].y },
                middle: { x: landmarks[12].x, y: landmarks[12].y },
                ring: { x: landmarks[16].x, y: landmarks[16].y },
                pinky: { x: landmarks[20].x, y: landmarks[20].y }
            };
            this.rotationHistory = [];
            return 0;
        }
        
        // Calculate the rotation by looking at how the finger tips move relative to the center
        // We'll use the thumb as our reference point for rotation
        const lastThumbAngle = Math.atan2(
            this.lastFingerPositions.thumb.y - lastCenterY, 
            this.lastFingerPositions.thumb.x - lastCenterX
        );
        const currentThumbAngle = Math.atan2(
            landmarks[4].y - currentCenterY, 
            landmarks[4].x - currentCenterX
        );
        
        // Calculate angle difference
        let angleDiff = currentThumbAngle - lastThumbAngle;
        
        // Normalize angle difference to -π to π range
        angleDiff = this.normalizeAngle(angleDiff);
        
        // Store rotation in history for smoothing
        this.rotationHistory.push(angleDiff);
        if (this.rotationHistory.length > 8) {
            this.rotationHistory.shift();
        }
        
        // Calculate average rotation over last few frames
        const avgRotation = this.rotationHistory.reduce((sum, val) => sum + val, 0) / this.rotationHistory.length;
        
        // Update last positions
        this.lastFingerPositions = {
            thumb: { x: landmarks[4].x, y: landmarks[4].y },
            index: { x: landmarks[8].x, y: landmarks[8].y },
            middle: { x: landmarks[12].x, y: landmarks[12].y },
            ring: { x: landmarks[16].x, y: landmarks[16].y },
            pinky: { x: landmarks[20].x, y: landmarks[20].y }
        };
        
        // Return rotation direction with threshold
        const threshold = 0.02; // Threshold for rotation detection
        if (Math.abs(avgRotation) > threshold) {
            return avgRotation > 0 ? 1 : -1; // Positive = clockwise, Negative = counter-clockwise
        }
        
        return 0;
    }
    
    // Helper method to normalize angles to -π to π range
    normalizeAngle(angle) {
        while (angle > Math.PI) angle -= 2 * Math.PI;
        while (angle < -Math.PI) angle += 2 * Math.PI;
        return angle;
    }
    
    // Handle rotary dial rotation with debouncing
    handleRotaryDial(rotationDirection) {
        const currentTime = Date.now();
        
        // Check if enough time has passed since last change
        if (currentTime - this.lastDetailChangeTime < this.detailChangeCooldown) {
            return; // Too soon, ignore this rotation
        }
        
        const currentLevel = this.detailLevel;
        
        if (rotationDirection > 0) {
            // Clockwise rotation - increase detail level
            switch (currentLevel) {
                case 'overview':
                    this.setDetailLevel('detailed');
                    this.lastDetailChangeTime = currentTime;
                    break;
                case 'detailed':
                    this.setDetailLevel('deep');
                    this.lastDetailChangeTime = currentTime;
                    break;
                case 'deep':
                    break;
            }
        } else if (rotationDirection < 0) {
            // Counter-clockwise rotation - decrease detail level
            switch (currentLevel) {
                case 'deep':
                    this.setDetailLevel('detailed');
                    this.lastDetailChangeTime = currentTime;
                    break;
                case 'detailed':
                    this.setDetailLevel('overview');
                    this.lastDetailChangeTime = currentTime;
                    break;
                case 'overview':
                    break;
            }
        }
    }
    
    // Add this new method for Z-depth calibration
    calibrateZDepth(zDepth) {
        this.calibratedZDepth = zDepth;
        // Reset to overview when calibrating
        this.setDetailLevel('overview');
    }
    
    // Add this method to detect fist (if not already present)
    detectFist(landmarks) {
        // Check if fingers are closed (simplified detection)
        const fingerTips = [4, 8, 12, 16, 20]; // thumb, index, middle, ring, pinky
        const fingerMCPs = [3, 5, 9, 13, 17]; // finger base joints
        
        let closedFingers = 0;
        
        fingerTips.forEach((tip, index) => {
            const tipY = landmarks[tip].y;
            const mcpY = landmarks[fingerMCPs[index]].y;
            
            // For thumb, check X position instead
            if (index === 0) {
                const tipX = landmarks[tip].x;
                const mcpX = landmarks[fingerMCPs[index]].x;
                if (Math.abs(tipX - mcpX) < 0.05) {
                    closedFingers++;
                }
            } else {
                if (tipY > mcpY) {
                    closedFingers++;
                }
            }
        });
        
        return closedFingers >= 4; // At least 4 fingers closed
    }
    
    drawHandLandmarks() {
        if (!this.results || !this.results.landmarks || this.results.landmarks.length === 0) {
            // Clear canvas if no hand detected
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            return;
        }
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw video frame (scaled down)
        this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
        
        // Draw hand landmarks
        const landmarks = this.results.landmarks[0];
        if (landmarks) {
            // Draw connections
            this.ctx.strokeStyle = '#00FF00';
            this.ctx.lineWidth = 2;
            
            // Draw hand connections (simplified)
            const connections = [
                [0, 1], [1, 2], [2, 3], [3, 4], // thumb
                [0, 5], [5, 6], [6, 7], [7, 8], // index finger
                [0, 9], [9, 10], [10, 11], [11, 12], // middle finger
                [0, 13], [13, 14], [14, 15], [15, 16], // ring finger
                [0, 17], [17, 18], [18, 19], [19, 20], // pinky
                [5, 9], [9, 13], [13, 17] // palm connections
            ];
            
            connections.forEach(([start, end]) => {
                if (landmarks[start] && landmarks[end]) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(
                        landmarks[start].x * this.canvas.width,
                        landmarks[start].y * this.canvas.height
                    );
                    this.ctx.lineTo(
                        landmarks[end].x * this.canvas.width,
                        landmarks[end].y * this.canvas.height
                    );
                    this.ctx.stroke();
                }
            });
            
            // Draw all landmarks with default color
            landmarks.forEach((landmark, index) => {
                this.ctx.fillStyle = '#FF0000';
                this.ctx.beginPath();
                this.ctx.arc(
                    landmark.x * this.canvas.width,
                    landmark.y * this.canvas.height,
                    3,
                    0,
                    2 * Math.PI
                );
                this.ctx.fill();
                
                // Add landmark number for debugging
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.font = '10px Arial';
                this.ctx.fillText(
                    index.toString(),
                    landmark.x * this.canvas.width + 5,
                    landmark.y * this.canvas.height - 5
                );
            });
            
            // Highlight all five finger tips used for dial detection with special colors
            if (landmarks[4] && landmarks[8] && landmarks[12] && landmarks[16] && landmarks[20]) {
                // Thumb tip (4) - BLUE
                this.ctx.fillStyle = '#0066FF';
                this.ctx.beginPath();
                this.ctx.arc(
                    landmarks[4].x * this.canvas.width,
                    landmarks[4].y * this.canvas.height,
                    8,
                    0,
                    2 * Math.PI
                );
                this.ctx.fill();
                
                // Index finger tip (8) - GREEN
                this.ctx.fillStyle = '#00FF00';
                this.ctx.beginPath();
                this.ctx.arc(
                    landmarks[8].x * this.canvas.width,
                    landmarks[8].y * this.canvas.height,
                    8,
                    0,
                    2 * Math.PI
                );
                this.ctx.fill();
                
                // Middle finger tip (12) - YELLOW
                this.ctx.fillStyle = '#FFFF00';
                this.ctx.beginPath();
                this.ctx.arc(
                    landmarks[12].x * this.canvas.width,
                    landmarks[12].y * this.canvas.height,
                    8,
                    0,
                    2 * Math.PI
                );
                this.ctx.fill();
                
                // Ring finger tip (16) - ORANGE
                this.ctx.fillStyle = '#FF8800';
                this.ctx.beginPath();
                this.ctx.arc(
                    landmarks[16].x * this.canvas.width,
                    landmarks[16].y * this.canvas.height,
                    8,
                    0,
                    2 * Math.PI
                );
                this.ctx.fill();
                
                // Pinky finger tip (20) - PINK
                this.ctx.fillStyle = '#FF00FF';
                this.ctx.beginPath();
                this.ctx.arc(
                    landmarks[20].x * this.canvas.width,
                    landmarks[20].y * this.canvas.height,
                    8,
                    0,
                    2 * Math.PI
                );
                this.ctx.fill();
                
                // Draw dial center point
                const centerX = (landmarks[4].x + landmarks[8].x + landmarks[12].x + landmarks[16].x + landmarks[20].x) / 5;
                const centerY = (landmarks[4].y + landmarks[8].y + landmarks[12].y + landmarks[16].y + landmarks[20].y) / 5;
                
                // Center point - WHITE with black border
                this.ctx.strokeStyle = '#000000';
                this.ctx.lineWidth = 2;
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.beginPath();
                this.ctx.arc(
                    centerX * this.canvas.width,
                    centerY * this.canvas.height,
                    8, // Slightly larger center for five fingers
                    0,
                    2 * Math.PI
                );
                this.ctx.fill();
                this.ctx.stroke();
                
                // Draw lines from center to each finger tip
                this.ctx.strokeStyle = '#FFFFFF';
                this.ctx.lineWidth = 1;
                this.ctx.setLineDash([5, 5]); // Dashed lines
                
                const fingerColors = ['#0066FF', '#00FF00', '#FFFF00', '#FF8800', '#FF00FF'];
                const fingerTips = [landmarks[4], landmarks[8], landmarks[12], landmarks[16], landmarks[20]];
                const fingerNames = ['THUMB', 'INDEX', 'MIDDLE', 'RING', 'PINKY'];
                
                fingerTips.forEach((tip, index) => {
                    // Line to finger tip
                    this.ctx.beginPath();
                    this.ctx.moveTo(centerX * this.canvas.width, centerY * this.canvas.height);
                    this.ctx.lineTo(tip.x * this.canvas.width, tip.y * this.canvas.height);
                    this.ctx.stroke();
                });
                
                // Reset line style
                this.ctx.setLineDash([]);
                
                // Add labels for all five finger tips
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.font = 'bold 10px Arial';
                this.ctx.strokeStyle = '#000000';
                this.ctx.lineWidth = 2;
                
                fingerTips.forEach((tip, index) => {
                    this.ctx.strokeText(fingerNames[index], tip.x * this.canvas.width + 10, tip.y * this.canvas.height - 10);
                    this.ctx.fillText(fingerNames[index], tip.x * this.canvas.width + 10, tip.y * this.canvas.height - 10);
                });
            }
        }
    }
    
    nextPlanet() {
        this.currentPlanetIndex = (this.currentPlanetIndex + 1) % this.planets.length;
        this.focusOnPlanet();
    }
    
    previousPlanet() {
        this.currentPlanetIndex = (this.currentPlanetIndex - 1 + this.planets.length) % this.planets.length;
        this.focusOnPlanet();
    }
    
    focusOnPlanet() {
        const planet = this.planets[this.currentPlanetIndex];
        const targetPosition = planet.mesh.position.clone();
        
        // Move camera to focus on planet
        const targetCameraPosition = targetPosition.clone().add(this.cameraOffset);
        
        // Smooth camera movement
        this.animateCameraTo(targetCameraPosition, targetPosition);
        
        // Enable continuous tracking
        this.isTrackingPlanet = true;
        this.trackingPlanetIndex = this.currentPlanetIndex;
        
        this.updatePlanetInfo();
    }
    
    // Add method to stop tracking
    stopTracking() {
        this.isTrackingPlanet = false;
        this.trackingPlanetIndex = -1;
    }
    
    // Add method to update camera tracking
    updateCameraTracking() {
        if (this.isTrackingPlanet && this.trackingPlanetIndex >= 0) {
            const planet = this.planets[this.trackingPlanetIndex];
            const planetPosition = planet.mesh.position.clone();
            
            // Calculate new camera position relative to planet
            const targetCameraPosition = planetPosition.clone().add(this.cameraOffset);
            
            // Smooth camera movement to follow planet
            this.camera.position.lerp(targetCameraPosition, 0.05);
            
            // Always look at the planet
            this.camera.lookAt(planetPosition);
        }
    }
    
    animateCameraTo(targetPosition, lookAtTarget) {
        const startPosition = this.camera.position.clone();
        const startLookAt = new THREE.Vector3();
        this.camera.getWorldDirection(startLookAt);
        startLookAt.multiplyScalar(20).add(this.camera.position);
        
        const duration = 1000;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = this.easeOutCubic(progress);
            
            // Interpolate position
            this.camera.position.lerpVectors(startPosition, targetPosition, easeProgress);
            
            // Interpolate lookAt
            const currentLookAt = new THREE.Vector3();
            currentLookAt.lerpVectors(startLookAt, lookAtTarget, easeProgress);
            this.camera.lookAt(currentLookAt);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
    
    setDetailLevel(level) {
        this.detailLevel = level;
        this.updatePlanetInfo();
    }
    
    updatePlanetInfo() {
        const planet = this.planets[this.currentPlanetIndex];
        const planetInfo = planet.data;
        
        // Update planet name
        document.getElementById('planet-name').textContent = planetInfo.name;
        
        // Update detail level
        document.getElementById('detail-level').textContent = this.detailLevel.toUpperCase();
        
        // Update description
        const description = planetInfo.description[this.detailLevel] || planetInfo.description.overview;
        document.getElementById('planet-description').textContent = description;
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Update zoom transition
        this.updateZoomTransition();
        
        // Animate planets with orbital mechanics
        this.planets.forEach(planet => {
            if (planet.data.name !== 'Sun') {
                // Rotate planet on its axis (always happens)
                planet.mesh.rotation.y += 0.005;
                
                // Enhanced rotation when zoomed in
                if (planet.mesh.userData.enhancedRotation) {
                    planet.mesh.rotation.y += 0.02; // 4x faster rotation
                }
                
                // Only update orbital position if NOT halted
                if (!planet.mesh.userData.orbitalHalted) {
                    planet.orbitalAngle += planet.data.orbitalSpeed;
                    
                    // Calculate new position based on orbital angle
                    const x = Math.cos(planet.orbitalAngle) * planet.orbitalRadius;
                    const z = Math.sin(planet.orbitalAngle) * planet.orbitalRadius;
                    
                    // Update planet position
                    planet.mesh.position.x = x;
                    planet.mesh.position.z = z;
                }
                
                // Keep Y position at 0 for flat orbital plane
                planet.mesh.position.y = 0;
                
                // Animate moons
                planet.moons.forEach(moon => {
                    if (moon.mesh.userData.orbiting && !moon.mesh.userData.orbitalHalted) {
                        // Moon orbits around planet
                        moon.orbitalAngle += moon.data.orbitalSpeed;
                        const moonX = Math.cos(moon.orbitalAngle) * moon.orbitalRadius;
                        const moonZ = Math.sin(moon.orbitalAngle) * moon.orbitalRadius;
                        moon.mesh.position.x = moonX;
                        moon.mesh.position.z = moonZ;
                    }
                });
            } else {
                // Sun rotates on its axis
                planet.mesh.rotation.y += 0.002;
            }
        });
        
        // Update camera tracking if enabled
        this.updateCameraTracking();
        
        // Render
        this.renderer.render(this.scene, this.camera);
    }

    zoomIn() {
        if (this.isZoomedIn) return;
        
        this.isZoomedIn = true;
        this.zoomTarget = this.planets[this.currentPlanetIndex];
        this.zoomStartTime = Date.now();
        
        console.log(`Zooming in to ${this.zoomTarget.data.name}`);
        
        // Update UI to show zoom status
        document.getElementById('planet-status').style.transform = 'scale(1.2)';
        document.getElementById('planet-status').style.transition = 'transform 0.3s ease';
    }

    zoomOut() {
        if (!this.isZoomedIn) return;
        
        this.isZoomedIn = false;
        this.zoomTarget = null;
        this.zoomStartTime = Date.now();
        
        console.log('Zooming out to overview');
        
        // Reset UI
        document.getElementById('planet-status').style.transform = 'scale(1)';
        document.getElementById('planet-status').style.transition = 'transform 0.3s ease';
    }

    updateZoomTransition() {
        if (!this.isZoomedIn || !this.zoomTarget) return;
        
        const currentTime = Date.now();
        const elapsed = currentTime - this.zoomStartTime;
        const progress = Math.min(elapsed / this.zoomTransitionDuration, 1);
        
        // Smooth easing
        const easeProgress = this.easeOutCubic(progress);
        
        // Interpolate camera offset
        this.cameraOffset.lerpVectors(
            this.originalCameraOffset, 
            this.zoomedCameraOffset, 
            easeProgress
        );
        
        // If zoom transition is complete, start enhanced planet rotation
        if (progress >= 1) {
            this.startEnhancedPlanetRotation();
        }
    }

    startEnhancedPlanetRotation() {
        if (!this.isZoomedIn || !this.zoomTarget) return;
        
        // Enable enhanced rotation for the zoomed planet (only on its axis, not orbital)
        this.zoomTarget.mesh.userData.enhancedRotation = true;
        
        // Enable moon orbiting around the halted planet
        this.zoomTarget.moons.forEach(moon => {
            moon.mesh.userData.orbiting = true;
        });
    }

    stopEnhancedPlanetRotation() {
        if (this.zoomTarget) {
            this.zoomTarget.mesh.userData.enhancedRotation = false;
            this.zoomTarget.moons.forEach(moon => {
                moon.mesh.userData.orbiting = false;
            });
        }
    }

    zoomInAndHaltPlanet() {
        if (this.isZoomedIn) return;
        
        this.isZoomedIn = true;
        this.zoomedPlanetIndex = this.currentPlanetIndex;
        this.zoomTarget = this.planets[this.currentPlanetIndex];
        this.zoomStartTime = Date.now();
        
        console.log(`Zooming in to ${this.zoomTarget.data.name} - Planet halted for reading`);
        
        // Halt the planet's orbital movement
        this.zoomTarget.mesh.userData.orbitalHalted = true;
        
        // Halt moon orbital movement
        this.zoomTarget.moons.forEach(moon => {
            moon.mesh.userData.orbitalHalted = true;
        });
        
        // Update UI to show zoom status
        document.getElementById('planet-status').style.transform = 'scale(1.2)';
        document.getElementById('planet-status').style.transition = 'transform 0.3s ease';
        
    }

    zoomOutButKeepRevolving() {
        if (!this.isZoomedIn) return;
        
        this.isZoomedIn = false;
        this.zoomStartTime = Date.now();
        
        console.log(`Zooming out from ${this.zoomTarget.data.name} - Continuing to revolve around it`);
        
        // Resume planet orbital movement but keep it as the focus
        this.zoomTarget.mesh.userData.orbitalHalted = false;
        
        // Resume moon orbital movement
        this.zoomTarget.moons.forEach(moon => {
            moon.mesh.userData.orbitalHalted = false;
        });
        
        // Set this planet as the one to revolve around
        this.isRevolvingAroundPlanet = true;
        this.trackingPlanetIndex = this.zoomedPlanetIndex;
        
        // Reset UI
        document.getElementById('planet-status').style.transform = 'scale(1)';
        document.getElementById('planet-status').style.transition = 'transform 0.3s ease';
        
    }
}



// Initialize app when page loads
document.addEventListener('DOMContentLoaded', () => {
    new SolarSystemApp();
});
