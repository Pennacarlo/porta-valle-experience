
// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, CustomEase, SplitText, DrawSVGPlugin, MotionPathPlugin, MorphSVGPlugin, ScrambleTextPlugin, TextPlugin);

// Custom eases
CustomEase.create("smoothStep", "0.4, 0.1, 0.3, 1");
CustomEase.create("elasticOut", "0.64, 0.57, 0.67, 1.53");
CustomEase.create("gentleBounce", "0.25, 0.46, 0.45, 0.94");
CustomEase.create("italianEase", "0.16, 1, 0.3, 1");

// Global state
let currentScene = 0;
let totalScenes = 3;
let isAnimating = false;
let lenis;
let renderer, scene, camera, particles, raycaster, mouse;
let sceneTransitionInProgress = false;
let scrollBlockerActive = true;
let nextSectionFixed = false;
let map = null;
let travelDots = {};
let journeyPaths = [];

// Initialize on document load
document.addEventListener('DOMContentLoaded', initPortaValleExperience);

// Main initialization
function initPortaValleExperience() {
  const targetContainer = document.querySelector('.home-two-hero');
  if (!targetContainer) return;
  
  setupHTML(targetContainer);
  initLoadingSequence();
}

// Setup HTML structure
function setupHTML(targetContainer) {
  // Clear existing content
  targetContainer.innerHTML = '';
  
  // Set container styles
  targetContainer.style.padding = '0';
  targetContainer.style.overflow = 'hidden';
  targetContainer.style.position = 'relative';
  
  // Create main container
  const experienceContainer = document.createElement('div');
  experienceContainer.className = 'porta-valle-experience';
  
  // Create WebGL container (for particle effect background)
  const webglContainer = document.createElement('div');
  webglContainer.className = 'webgl-container';
  webglContainer.innerHTML = '<canvas class="webgl-canvas"></canvas>';
  
  // Create Mapbox container for Scene 1
  const mapboxContainer = document.createElement('div');
  mapboxContainer.className = 'mapbox-container';
  mapboxContainer.id = 'mapbox-container';
  
  // Create SVG container for connection paths
  const connectionPathsContainer = document.createElement('div');
  connectionPathsContainer.className = 'connection-paths-container';
  connectionPathsContainer.innerHTML = `<svg width="100%" height="100%" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice"></svg>`;
  
  // Create SVG filters
  const svgFilters = document.createElement('div');
  svgFilters.className = 'svg-filters';
  svgFilters.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1">
      <defs>
        <filter id="noise-filter">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feBlend mode="multiply" in="SourceGraphic" result="blend" />
        </filter>
        <filter id="glow-filter" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
    </svg>
  `;
  
  // Create progress bar
  const progressBar = document.createElement('div');
  progressBar.className = 'progress-bar';
  
  // Create scene indicators
  const sceneIndicators = document.createElement('div');
  sceneIndicators.className = 'scene-indicators';
  
  const sceneLabels = ['Heartbeat', 'Culture', 'Home'];
  
  for (let i = 0; i < totalScenes; i++) {
    const indicator = document.createElement('div');
    indicator.className = 'scene-indicator';
    indicator.dataset.scene = i;
    indicator.dataset.label = sceneLabels[i];
    if (i === 0) indicator.classList.add('active');
    
    indicator.addEventListener('click', () => {
      if (isAnimating) return;
      transitionToScene(i);
    });
    
    sceneIndicators.appendChild(indicator);
  }
  
  // Create scenes
  const scenes = [
    createHeartbeatScene(),
    createCultureScene(),
    createHomeScene()
  ];
  
  // Create grain overlay
  const grainOverlay = document.createElement('div');
  grainOverlay.className = 'grain-overlay';
  
  // Create scroll blocker
  const scrollBlocker = document.createElement('div');
  scrollBlocker.className = 'scroll-blocker active';
  
  // Create scene transition element
  const sceneTransition = document.createElement('div');
  sceneTransition.className = 'scene-transition';
  
  // Create loading screen
  const loadingScreen = document.createElement('div');
  loadingScreen.className = 'loading-screen';
  loadingScreen.innerHTML = `
    <div class="loading-counter">0%</div>
    <div class="loading-text">Preparing your Italian experience</div>
    <div class="loading-progress">
      <div class="loading-bar"></div>
    </div>
  `;
  
  // Add next section fixer
  const nextSectionFixer = document.createElement('div');
  nextSectionFixer.className = 'next-section-fixer';
  
  // Assemble everything
  scenes.forEach(scene => experienceContainer.appendChild(scene));
  experienceContainer.appendChild(webglContainer);
  experienceContainer.appendChild(connectionPathsContainer);
  experienceContainer.appendChild(mapboxContainer);
  experienceContainer.appendChild(svgFilters);
  
  targetContainer.appendChild(experienceContainer);
  document.body.appendChild(progressBar);
  document.body.appendChild(sceneIndicators);
  document.body.appendChild(grainOverlay);
  document.body.appendChild(scrollBlocker);
  document.body.appendChild(sceneTransition);
  document.body.appendChild(loadingScreen);
  
  // Insert next section fixer after the target container
  targetContainer.parentNode.insertBefore(nextSectionFixer, targetContainer.nextSibling);
}

// Create Scene 1: Heartbeat of Italy
function createHeartbeatScene() {
  const scene = document.createElement('div');
  scene.className = 'scene scene-1';
  scene.dataset.scene = '0';
  
  const typography = document.createElement('div');
  typography.className = 'spatial-typography top';
  typography.innerHTML = `
    <h2 class="variable-title">The Heart<span class="weight-shift">beat</span> of Italy</h2>
    <p class="reveal-text">Castro Dei Volsci B&B sits at the geographical center of Italy's treasures.</p>
  `;
  
  const connectionPoints = document.createElement('div');
  connectionPoints.className = 'connection-points';
  
  // B&B Center point
  const centerPoint = document.createElement('div');
  centerPoint.className = 'connection-point center-point';
  centerPoint.style.top = '50%';
  centerPoint.style.left = '50%';
  
  centerPoint.addEventListener('mouseenter', () => {
    gsap.to(centerPoint, {
      scale: 1.3,
      duration: 0.3,
      ease: "back.out(2)"
    });
  });
  
  centerPoint.addEventListener('mouseleave', () => {
    gsap.to(centerPoint, {
      scale: 1,
      duration: 0.3,
      ease: "power2.out"
    });
  });
  
  connectionPoints.appendChild(centerPoint);
  
  scene.appendChild(typography);
  scene.appendChild(connectionPoints);
  
  return scene;
}

// Create Scene 2: Cultural Immersion
function createCultureScene() {
  const scene = document.createElement('div');
  scene.className = 'scene scene-2';
  scene.dataset.scene = '1';
  
  const typography = document.createElement('div');
  typography.className = 'spatial-typography bottom';
  typography.innerHTML = `
    <h2 class="variable-title">Cultural <span class="weight-shift">Immersion</span></h2>
    <p class="reveal-text">Experience authentic Italian life in every direction.</p>
  `;
  
  const gallery = document.createElement('div');
  gallery.className = 'spatial-gallery';
  
  const galleryItems = [
    { 
      title: 'Wine Country', 
      description: '30 minutes away', 
      image: 'https://images.unsplash.com/photo-1635149596376-9822cc45e377?q=80&w=880&auto=format',
      backupImage: 'https://i.ibb.co/bRJ5WcH/tuscany-vineyard.jpg'
    },
    { 
      title: 'Local Markets', 
      description: '15 minutes away', 
      image: 'https://images.unsplash.com/photo-1550684663-5ebded3aae3c?q=80&w=880&auto=format',
      backupImage: 'https://i.ibb.co/ypzkFWT/italian-market.jpg'
    },
    { 
      title: 'Historic Piazzas', 
      description: '20 minutes away', 
      image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=880&auto=format',
      backupImage: 'https://i.ibb.co/kcxzbFq/italian-piazza.jpg'
    }
  ];
  
  galleryItems.forEach(item => {
    const galleryItem = document.createElement('div');
    galleryItem.className = 'gallery-item';
    
    galleryItem.innerHTML = `
      <div class="item-image">
        <img src="${item.image}" alt="${item.title}" onerror="this.src='${item.backupImage}'; this.onerror='this.outerHTML=\"<div style=\\'background-color:#b55a40;color:white;display:flex;align-items:center;justify-content:center;height:100%;font-family:var(--font-display);font-variation-settings:\\'wght\\' 600;font-size:24px;padding:1rem;text-align:center;\\'>${item.title}</div>\"';">
      </div>
      <div class="item-caption">
        <h3>${item.title}</h3>
        <p>${item.description}</p>
      </div>
    `;
    
    gallery.appendChild(galleryItem);
  });
  
  scene.appendChild(typography);
  scene.appendChild(gallery);
  
  return scene;
}

// Create Scene 3: Your Italian Home
function createHomeScene() {
  const scene = document.createElement('div');
  scene.className = 'scene scene-3';
  scene.dataset.scene = '2';
  
  const typography = document.createElement('div');
  typography.className = 'spatial-typography centered';
  typography.innerHTML = `
    <h2 class="variable-title">Your Italian <span class="weight-shift">Home</span></h2>
    <p class="reveal-text">Authentic comfort at the center of it all.</p>
  `;
  
  const showcase = document.createElement('div');
  showcase.className = 'architectural-showcase';
  
  // Primary image
  const primary = document.createElement('div');
  primary.className = 'showcase-primary';
  primary.innerHTML = `
    <img src="https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=880&auto=format" alt="Castro Dei Volsci B&B" onerror="this.src='https://i.ibb.co/t3bTnZw/italian-living-room.jpg'; this.onerror='this.outerHTML=\"<div style=\\'background-color:#b55a40;color:white;display:flex;align-items:center;justify-content:center;height:100%;font-family:var(--font-display);font-variation-settings:\\'wght\\' 600;font-size:36px;padding:1rem;text-align:center;\\'></div>\"';">
  `;
  
  // Detail images
  const details = document.createElement('div');
  details.className = 'showcase-details';
  
  const detailImages = [
    { 
      url: 'https://images.unsplash.com/photo-1521783593447-5702b9bfd267?q=80&w=880&auto=format', 
      backup: 'https://i.ibb.co/fNnBxnW/italian-bedroom.jpg',
      alt: 'Bedroom' 
    },
    { 
      url: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=880&auto=format', 
      backup: 'https://i.ibb.co/wLTjWTW/italian-balcony.jpg',
      alt: 'Balcony' 
    },
    { 
      url: 'https://images.unsplash.com/photo-1476673160081-cf065607f449?q=80&w=880&auto=format', 
      backup: 'https://i.ibb.co/Kx0bTS6/italian-dining.jpg',
      alt: 'Dining' 
    }
  ];
  
  detailImages.forEach(img => {
    const detail = document.createElement('div');
    detail.className = 'detail-item';
    detail.innerHTML = `
      <img src="${img.url}" alt="${img.alt}" onerror="this.src='${img.backup}'; this.onerror='this.outerHTML=\"<div style=\\'background-color:#b55a40;color:white;display:flex;align-items:center;justify-content:center;height:100%;font-family:var(--font-display);font-variation-settings:\\'wght\\' 600;font-size:18px;padding:1rem;text-align:center;\\'>${img.alt}</div>\"';">
    `;
    details.appendChild(detail);
  });
  
  // CTA Button
  const ctaContainer = document.createElement('div');
  ctaContainer.className = 'cta-container';
  ctaContainer.innerHTML = `
    <a href="#booking-section" class="dimensional-button">
      <span class="button-text">Reserve Your Stay</span>
      <span class="button-backdrop"></span>
    </a>
  `;
  
  showcase.appendChild(primary);
  showcase.appendChild(details);
  scene.appendChild(typography);
  scene.appendChild(showcase);
  scene.appendChild(ctaContainer);
  
  return scene;
}

// Initialize loading sequence
function initLoadingSequence() {
  const loadingScreen = document.querySelector('.loading-screen');
  const loadingCounter = document.querySelector('.loading-counter');
  const loadingBar = document.querySelector('.loading-bar');
  
  // Preload images
  const images = document.querySelectorAll('img');
  const totalAssets = images.length + 3; // Images + WebGL + Mapbox + Fonts
  let loadedAssets = 0;
  
  // Function to update loading progress
  function updateLoadingProgress() {
    loadedAssets++;
    const progress = Math.floor((loadedAssets / totalAssets) * 100);
    
    // Animate counter
    gsap.to(loadingCounter, {
      innerText: progress,
      duration: 0.3,
      snap: { innerText: 1 },
      ease: "smoothStep"
    });
    
    // Animate progress bar
    gsap.to(loadingBar, {
      scaleX: loadedAssets / totalAssets,
      duration: 0.3,
      ease: "smoothStep"
    });
    
    if (loadedAssets >= totalAssets) {
      finishLoading();
    }
  }
  
  // Simulate font loading
  setTimeout(updateLoadingProgress, 500);
  
  // Initialize WebGL
  initWebGL();
  setTimeout(updateLoadingProgress, 800);
  
  // Initialize Mapbox (will be hidden initially)
  initMapbox();
  setTimeout(updateLoadingProgress, 1200);
  
  // Track image loading
  images.forEach(img => {
    if (img.complete) {
      updateLoadingProgress();
    } else {
      img.addEventListener('load', updateLoadingProgress);
      img.addEventListener('error', updateLoadingProgress);
    }
  });
  
  // Fallback in case loading takes too long
  setTimeout(finishLoading, 6000);
}

// Initialize WebGL background
function initWebGL() {
  try {
    const canvas = document.querySelector('.webgl-canvas');
    
    // Initialize Three.js
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Create scene
    scene = new THREE.Scene();
    
    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50;
    scene.add(camera);
    
    // Create particle system
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1000;
    
    const posArray = new Float32Array(particlesCount * 3);
    const scaleArray = new Float32Array(particlesCount);
    
    for (let i = 0; i < particlesCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 200;
      posArray[i + 1] = (Math.random() - 0.5) * 200;
      posArray[i + 2] = (Math.random() - 0.5) * 100;
      
      scaleArray[i / 3] = Math.random();
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('scale', new THREE.BufferAttribute(scaleArray, 1));
    
    // Create material
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.3,
      color: 0xb55a40,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true
    });
    
    // Create particles
    particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);
    
    // Set up raycaster for mouse interaction
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    
    // Handle window resize
    window.addEventListener('resize', () => {
      // Update sizes
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Update camera
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      
      // Update renderer
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
    
    // Handle mouse move
    window.addEventListener('mousemove', (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });
    
    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      
      // Rotate particles
      particles.rotation.x += 0.0003;
      particles.rotation.y += 0.0005;
      
      // Update scene based on mouse position
      if (particles && mouse) {
        particles.rotation.x += mouse.y * 0.0001;
        particles.rotation.y += mouse.x * 0.0001;
      }
      
      // Render scene
      renderer.render(scene, camera);
    }
    
    animate();
  } catch (e) {
    console.error('WebGL initialization error:', e);
  }
}

// Initialize Mapbox
function initMapbox() {
  try {
    mapboxgl.accessToken = 'pk.eyJ1IjoibG9vY2hpZSIsImEiOiJjbTJ5ZHoyZWgwMGpyMmpvZTg3OXoxMTg4In0.7pLHV95yKAIbSYHonXP1Yg';
    
    map = new mapboxgl.Map({
      container: 'mapbox-container',
      style: 'mapbox://styles/mapbox/light-v11',
      center: [13.1, 41.5], // Castro Dei Volsci, centered on Italy
      zoom: 6,
      pitch: 50, // 3D perspective
      bearing: 0, // Straight rotation
      interactive: false, // Disable user interaction
      attributionControl: false // Hide attribution
    });
    
    map.on('load', function() {
      // Customize map style to match design aesthetic
      customizeMapStyle();
    });
  } catch (e) {
    console.error('Mapbox initialization error:', e);
  }
}

// Customize Mapbox style
function customizeMapStyle() {
  if (!map) return;
  
  // Update map colors to match the site's design system
  map.setPaintProperty('water', 'fill-color', '#d8e8f0');
  map.setPaintProperty('land', 'background-color', '#f0e9df');
  
  // Enhance mountain terrain
  map.setPaintProperty('hillshade-accent', 'hillshade-exaggeration', 0.6);
  map.setPaintProperty('hillshade-highlight', 'hillshade-exaggeration', 0.7);
  map.setPaintProperty('hillshade-accent', 'hillshade-highlight-color', '#e5c1b5');
  
  // Style roads
  map.setPaintProperty('road-major-label', 'text-color', '#7a3e30');
  map.setPaintProperty('road-secondary-tertiary', 'line-color', '#e5c1b5');
  map.setPaintProperty('road-primary', 'line-color', '#d0c5b3');
  
  // Style place labels
  map.setPaintProperty('settlement-major-label', 'text-color', '#1b1511');
  map.setPaintProperty('settlement-minor-label', 'text-color', '#7a3e30');
  map.setPaintProperty('settlement-major-label', 'text-halo-color', 'rgba(248, 245, 242, 0.9)');
  map.setPaintProperty('country-label', 'text-color', '#b55a40');
  
  // Decrease label visibility for smaller places
  map.setLayoutProperty('settlement-minor-label', 'text-size', 10);
  map.setLayoutProperty('state-label', 'text-size', 10);
  map.setPaintProperty('country-label', 'text-color', '#1B1511');
  map.setLayoutProperty('country-label', 'text-size', 16);
  
  // Add a subtle border around Italy
  if (map.getSource('italy-border')) return;
  
  map.addSource('italy-border', {
    'type': 'geojson',
    'data': {
      'type': 'Feature',
      'properties': {},
      'geometry': {
        'type': 'Polygon',
        'coordinates': [
          [
            [7.6, 36.6], [9.2, 41.2], [8.2, 43.9], [7.5, 45.9],
            [11.6, 46.5], [13.7, 46.5], [13.9, 45.6], [15.0, 45.2],
            [16.0, 41.9], [17.0, 40.9], [18.5, 40.2], [18.3, 39.4],
            [17.5, 38.4], [16.6, 38.9], [15.7, 38.3], [15.9, 37.5],
            [15.1, 37.0], [13.5, 37.5], [12.6, 38.2], [12.3, 39.9],
            [9.0, 41.9], [8.3, 40.0], [9.3, 39.1], [8.5, 37.9],
            [7.6, 36.6]
          ]
        ]
      }
    }
  });
  
  map.addLayer({
    'id': 'italy-border',
    'type': 'line',
    'source': 'italy-border',
    'layout': {},
    'paint': {
      'line-color': '#B55A40',
      'line-width': 2,
      'line-opacity': 0.7
    }
  });
  
  // Add a subtle highlight to Italy
  map.addLayer({
    'id': 'italy-highlight',
    'type': 'fill',
    'source': 'italy-border',
    'layout': {},
    'paint': {
      'fill-color': '#B55A40',
      'fill-opacity': 0.03
    }
  });
}

// Add markers to Mapbox for Italian cities
function addMapMarkers() {
  if (!map) return;
  
  // Define Castro Dei Volsci location (central Italy)
  const castroLocation = [13.1, 41.5]; // Castro Dei Volsci coordinates
  
  // Add Castro Dei Volsci marker (larger, center marker)
  addMarkerToMap(castroLocation, true, 'Castro Dei Volsci', 'Your Italian home');
  
  // Define major cities with coordinates
  const cities = [
    { name: 'Rome', location: [12.496366, 41.902782], timeToReach: '1.5h by Train' },
    { name: 'Florence', location: [11.255814, 43.769562], timeToReach: '2h by Train' },
    { name: 'Naples', location: [14.252532, 40.839981], timeToReach: '2h by Car' },
    { name: 'Venice', location: [12.315515, 45.440847], timeToReach: '3.5h by Train' },
    { name: 'Siena', location: [11.331021, 43.318809], timeToReach: '1.5h by Car' }
  ];
  
  // Add markers for each city
  cities.forEach(city => {
    addMarkerToMap(city.location, false, city.name, city.timeToReach);
    
    // Add connection line from Castro Dei Volsci to each city
    addConnectionLine(castroLocation, city.location, city.name);
    
    // Create label in DOM for each city
    addCityLabel(city);
  });
  
  // Create the animated paths for each connection
  createConnectionPaths(castroLocation, cities);
}

// Add a marker to the map
function addMarkerToMap(location, isCenter, name, description) {
  if (!map) return;
  
  // Create marker container
  const markerEl = document.createElement('div');
  markerEl.className = isCenter ? 'mapboxgl-marker center-marker' : 'mapboxgl-marker';
  
  // Add pulse effect
  const pulseEl = document.createElement('div');
  pulseEl.className = 'marker-pulse';
  markerEl.appendChild(pulseEl);
  
  // Add tooltip
  const tooltipEl = document.createElement('div');
  tooltipEl.className = 'marker-tooltip';
  tooltipEl.innerHTML = `<strong>${name}</strong>${description}`;
  markerEl.appendChild(tooltipEl);
  
  // Create container for marker and tooltip
  const containerEl = document.createElement('div');
  containerEl.className = 'marker-container';
  containerEl.appendChild(markerEl);
  
  // Add marker to map
  new mapboxgl.Marker(containerEl)
    .setLngLat(location)
    .addTo(map);
}

// Add city label to Scene 1
function addCityLabel(city) {
  const connectionPoints = document.querySelector('.connection-points');
  if (!connectionPoints) return;
  
  // Calculate position based on city coordinates relative to Italy's center
  // This is approximate positioning for visual effect
  const centerX = 50;
  const centerY = 50;
  
  // Normalize coordinates to approximate screen position
  // Rome is reference (center-south)
  const romeCoords = [12.496366, 41.902782];
  const veniceCoords = [12.315515, 45.440847];
  const latSpan = veniceCoords[1] - romeCoords[1]; // North-south span
  
  // Calculate visual positions based on geographical coordinates
  let posX = centerX + ((city.location[0] - 13.1) * 10); // 10 is a scaling factor
  let posY = centerY - ((city.location[1] - 41.5) * 15); // 15 is a scaling factor
  
  // Clamp to reasonable screen positions
  posX = Math.max(20, Math.min(80, posX));
  posY = Math.max(20, Math.min(80, posY));
  
  // Create city point
  const cityPoint = document.createElement('div');
  cityPoint.className = 'connection-point';
  cityPoint.style.top = `${posY}%`;
  cityPoint.style.left = `${posX}%`;
  
  // Add hover effects
  cityPoint.addEventListener('mouseenter', () => {
    gsap.to(cityPoint, {
      scale: 1.5,
      duration: 0.3,
      ease: "back.out(2)"
    });
    
    const label = document.querySelector(`.connection-label[data-city="${city.name}"]`);
    if (label) {
      label.classList.add('visible');
      gsap.to(label, {
        scale: 1,
        opacity: 1,
        duration: 0.3,
        ease: "back.out(1.7)"
      });
    }
  });
  
  cityPoint.addEventListener('mouseleave', () => {
    gsap.to(cityPoint, {
      scale: 1,
      duration: 0.3,
      ease: "power2.out"
    });
    
    const label = document.querySelector(`.connection-label[data-city="${city.name}"]`);
    if (label) {
      label.classList.remove('visible');
      gsap.to(label, {
        scale: 0.8,
        opacity: 0,
        duration: 0.3,
        ease: "power2.in"
      });
    }
  });
  
  connectionPoints.appendChild(cityPoint);
  
  // Create city label
  const cityLabel = document.createElement('div');
  cityLabel.className = 'connection-label';
  cityLabel.dataset.city = city.name;
  cityLabel.innerHTML = `<strong>${city.name}</strong>${city.timeToReach}`;
  cityLabel.style.top = `${posY}%`;
  cityLabel.style.left = `${posX}%`;
  cityLabel.style.transform = 'translate(-50%, -120%) scale(0.8)';
  cityLabel.style.opacity = '0';
  
  connectionPoints.appendChild(cityLabel);
}

// Add a connection line between two points on the map
function addConnectionLine(start, end, cityName) {
  if (!map) return;
  
  // Create a geojson source for the line
  map.addSource(`line-${cityName}`, {
    'type': 'geojson',
    'data': {
      'type': 'Feature',
      'properties': {},
      'geometry': {
        'type': 'LineString',
        'coordinates': [start, end]
      }
    }
  });
  
  // Add the line layer
  map.addLayer({
    'id': `line-${cityName}`,
    'type': 'line',
    'source': `line-${cityName}`,
    'layout': {
      'line-join': 'round',
      'line-cap': 'round'
    },
    'paint': {
      'line-color': '#B55A40',
      'line-width': 2,
      'line-opacity': 0,
      'line-dasharray': [2, 1]
    }
  });
}

// Create SVG connection paths for animation
function createConnectionPaths(centerLocation, cities) {
  const svgContainer = document.querySelector('.connection-paths-container svg');
  if (!svgContainer) return;
  
  // Map coordinates to SVG coordinates (approximate)
  function mapCoordinatesToSVG(coords) {
    // This is a simplistic mapping for visualization purposes
    // Adjust these calculations based on your specific needs
    const centerX = 960; // SVG center X
    const centerY = 540; // SVG center Y
    
    // Calculate distance from center of Italy
    const x = centerX + ((coords[0] - centerLocation[0]) * 100);
    const y = centerY - ((coords[1] - centerLocation[1]) * 150);
    
    return { x, y };
  }
  
  // Create center point coordinates
  const center = mapCoordinatesToSVG(centerLocation);
  
  // Create path for each city
  cities.forEach(city => {
    const cityCoords = mapCoordinatesToSVG(city.location);
    
    // Create curved path between Castro Dei Volsci and city
    // Use a quadratic curve for a nice arc
    const dx = cityCoords.x - center.x;
    const dy = cityCoords.y - center.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Calculate control point for curve (perpendicular to direct line)
    const midX = (center.x + cityCoords.x) / 2;
    const midY = (center.y + cityCoords.y) / 2;
    
    // Control point offset (perpendicular to line direction)
    const offset = distance / 3;
    const angle = Math.atan2(dy, dx) + Math.PI / 2; // Perpendicular angle
    
    const ctrlX = midX + Math.cos(angle) * offset;
    const ctrlY = midY + Math.sin(angle) * offset;
    
    // Create path element
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", `M${center.x},${center.y} Q${ctrlX},${ctrlY} ${cityCoords.x},${cityCoords.y}`);
    path.setAttribute("class", "connection-path");
    path.setAttribute("id", `path-${city.name.toLowerCase()}`);
    svgContainer.appendChild(path);
    
    // Create animated dot
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("r", "6");
    circle.setAttribute("class", "pulsing-dot");
    
    // Add filter for glow effect
    circle.setAttribute("filter", "url(#glow-filter)");
    svgContainer.appendChild(circle);
    
    // Store reference to the circle
    travelDots[city.name] = circle;
    
    // Store path for animation
    journeyPaths.push({
      city: city.name,
      path: path
    });
  });
}

// Animate connection lines on map
function animateMapConnectionLines() {
  if (!map) return;
  
  const cities = ['Rome', 'Florence', 'Naples', 'Venice', 'Siena'];
  
  cities.forEach((city, index) => {
    gsap.to({}, {
      onUpdate: function() {
        const progress = this.progress();
        map.setPaintProperty(`line-${city}`, 'line-opacity', progress);
      },
      duration: 1.8,
      delay: 0.3 * index,
      ease: "power2.inOut"
    });
  });
}

// Animate SVG connection paths with traveling dots
function animateConnectionPaths() {
  journeyPaths.forEach((item, index) => {
    // Get path element
    const path = item.path;
    const dot = travelDots[item.city];
    
    if (!path || !dot) return;
    
    // Draw the path
    gsap.fromTo(path, 
      { drawSVG: "0%" },
      { 
        drawSVG: "100%", 
        duration: 1.5, 
        delay: 0.3 * index,
        ease: "power2.inOut"
      }
    );
    
    // Animate dot along the path
    gsap.to(dot, {
      motionPath: {
        path: `#path-${item.city.toLowerCase()}`,
        align: `#path-${item.city.toLowerCase()}`,
        alignOrigin: [0.5, 0.5],
        autoRotate: true
      },
      duration: 3 + index,
      delay: 0.3 * index,
      repeat: -1,
      ease: "none",
      repeatDelay: 0.5
    });
  });
}

// Finish loading and start experience
function finishLoading() {
  const loadingScreen = document.querySelector('.loading-screen');
  if (loadingScreen.style.opacity === '0') return; // Already finished
  
  gsap.to(loadingScreen, {
    opacity: 0,
    duration: 0.8,
    ease: "smoothStep",
    onComplete: () => {
      loadingScreen.style.display = 'none';
      initExperience();
    }
  });
}

// Initialize main experience
function initExperience() {
  // Initialize smooth scrolling
  initSmoothScroll();
  
  // Set up scene 1 as active
  const scene1 = document.querySelector('.scene-1');
  scene1.classList.add('active');
  
  // Animate first scene
  animateScene(0);
  
  // Set up scroll events
  setupScrollEvents();
  
  // Add wheel event listener for magnetic scrolling
  window.addEventListener('wheel', handleWheel, { passive: false });
  
  // Add touch events for mobile
  window.addEventListener('touchstart', handleTouchStart, { passive: false });
  window.addEventListener('touchend', handleTouchEnd, { passive: false });
  
  // Add resize handler
  window.addEventListener('resize', handleResize);
  
  // Initialize progress bar
  initProgressBar();
}

// Initialize smooth scrolling
function initSmoothScroll() {
  try {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false
    });
    
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    
    requestAnimationFrame(raf);
  } catch (e) {
    console.error('Smooth scroll initialization error:', e);
  }
}

// Initialize progress bar
function initProgressBar() {
  const progressBar = document.querySelector('.progress-bar');
  
  gsap.to(progressBar, {
    scaleX: 1 / totalScenes,
    duration: 0.5,
    ease: "smoothStep"
  });
}

// Update progress bar
function updateProgressBar(scene) {
  const progressBar = document.querySelector('.progress-bar');
  
  gsap.to(progressBar, {
    scaleX: (scene + 1) / totalScenes,
    duration: 0.5,
    ease: "smoothStep"
  });
}

// Set up scroll events
function setupScrollEvents() {
  // Create ScrollTrigger for each scene
  for (let i = 0; i < totalScenes; i++) {
    ScrollTrigger.create({
      trigger: `.scene-${i + 1}`,
      start: 'top top',
      end: 'bottom top',
      onEnter: () => {
        if (!sceneTransitionInProgress) {
          transitionToScene(i);
        }
      },
      onEnterBack: () => {
        if (!sceneTransitionInProgress) {
          transitionToScene(i - 1);
        }
      }
    });
  }
  
  // Create event for final scene to unpin
  ScrollTrigger.create({
    trigger: `.scene-${totalScenes}`,
    start: 'bottom top',
    onEnter: handleExperienceEnd
  });
}

// Touch variables
let touchStartY = 0;
let touchThreshold = 50;

// Handle touch start
function handleTouchStart(e) {
  touchStartY = e.touches[0].clientY;
}

// Handle touch end
function handleTouchEnd(e) {
  if (isAnimating || sceneTransitionInProgress) return;
  
  const touchEndY = e.changedTouches[0].clientY;
  const touchDiff = touchEndY - touchStartY;
  
  if (Math.abs(touchDiff) > touchThreshold) {
    // Touch direction
    if (touchDiff < 0 && currentScene < totalScenes - 1) {
      // Swipe up - next scene
      transitionToScene(currentScene + 1);
    } else if (touchDiff > 0 && currentScene > 0) {
      // Swipe down - previous scene
      transitionToScene(currentScene - 1);
    }
  }
}

// Throttle variables for wheel events
let lastWheelTime = 0;
let wheelThrottle = 1000; // ms

// Handle mouse wheel for magnetic scrolling
function handleWheel(e) {
  if (isAnimating || sceneTransitionInProgress) {
    e.preventDefault();
    return;
  }
  
  // Throttle wheel events
  const now = Date.now();
  if (now - lastWheelTime < wheelThrottle) {
    e.preventDefault();
    return;
  }
  
  // Determine scroll direction
  if (e.deltaY > 0 && currentScene < totalScenes - 1) {
    // Scrolling down - next scene
    e.preventDefault();
    lastWheelTime = now;
    transitionToScene(currentScene + 1);
  } else if (e.deltaY < 0 && currentScene > 0) {
    // Scrolling up - previous scene
    e.preventDefault();
    lastWheelTime = now;
    transitionToScene(currentScene - 1);
  } else if (currentScene === totalScenes - 1 && e.deltaY > 0) {
    // Scrolling down at last scene - end experience
    handleExperienceEnd();
  }
}

// Handle window resize
function handleResize() {
  // Update scene animations based on current scene
  animateScene(currentScene, true);
  
  // If Mapbox is initialized, update the map
  if (map) {
    map.resize();
  }
}

// Transition to a specific scene
function transitionToScene(targetScene) {
  if (targetScene < 0 || targetScene >= totalScenes || targetScene === currentScene || sceneTransitionInProgress) {
    return;
  }
  
  sceneTransitionInProgress = true;
  isAnimating = true;
  
  // Get scene elements
  const currentSceneEl = document.querySelector(`.scene[data-scene="${currentScene}"]`);
  const targetSceneEl = document.querySelector(`.scene[data-scene="${targetScene}"]`);
  const sceneTransitionEl = document.querySelector('.scene-transition');
  
  // Update indicators
  document.querySelectorAll('.scene-indicator').forEach((indicator, index) => {
    if (index === targetScene) {
      indicator.classList.add('active');
    } else {
      indicator.classList.remove('active');
    }
  });
  
  // Update progress bar
  updateProgressBar(targetScene);
  
  // Perform transition animation
  if (targetScene > currentScene) {
    // Transition to next scene
    gsap.to(sceneTransitionEl, {
      scaleY: 1,
      duration: 0.5,
      transformOrigin: 'bottom center',
      ease: "smoothStep",
      onComplete: () => {
        currentSceneEl.classList.remove('active');
        targetSceneEl.classList.add('active');
        
        gsap.to(sceneTransitionEl, {
          scaleY: 0,
          duration: 0.5,
          transformOrigin: 'top center',
          ease: "smoothStep",
          onComplete: () => {
            currentScene = targetScene;
            sceneTransitionInProgress = false;
            animateScene(currentScene);
          }
        });
      }
    });
  } else {
    // Transition to previous scene
    gsap.to(sceneTransitionEl, {
      scaleY: 1,
      duration: 0.5,
      transformOrigin: 'top center',
      ease: "smoothStep",
      onComplete: () => {
        currentSceneEl.classList.remove('active');
        targetSceneEl.classList.add('active');
        
        gsap.to(sceneTransitionEl, {
          scaleY: 0,
          duration: 0.5,
          transformOrigin: 'bottom center',
          ease: "smoothStep",
          onComplete: () => {
            currentScene = targetScene;
            sceneTransitionInProgress = false;
            animateScene(currentScene);
          }
        });
      }
    });
  }
}

// Animate a specific scene
function animateScene(sceneIndex, isResize = false) {
  if (isResize && !isAnimating) return;
  
  switch (sceneIndex) {
    case 0:
      animateHeartbeatScene(isResize);
      break;
    case 1:
      animateCultureScene(isResize);
      break;
    case 2:
      animateHomeScene(isResize);
      break;
  }
}

// Animate Scene 1: Heartbeat of Italy
function animateHeartbeatScene(isResize) {
  // Show mapbox container for this scene
  const mapContainer = document.getElementById('mapbox-container');
  if (mapContainer) {
    gsap.to(mapContainer, {
      opacity: 1,
      duration: 1.2,
      ease: "smoothStep"
    });
  }
  
  // Initialize map markers if not already done
  if (map && map.loaded() && !map.getLayer('line-Rome')) {
    addMapMarkers();
    
    // Delayed animation for connection lines
    setTimeout(() => {
      animateMapConnectionLines();
      animateConnectionPaths();
    }, 1000);
  }
  
  if (isResize) return;
  
  const timeline = gsap.timeline({
    onComplete: () => {
      isAnimating = false;
    }
  });
  
  // Split text for animation
  try {
    const titleElement = document.querySelector('.scene-1 .variable-title');
    const textElement = document.querySelector('.scene-1 .reveal-text');
    
    if (!titleElement || !textElement) return;
    
    const titleSplit = new SplitText(titleElement, { type: "chars", position: "relative" });
    
    // Reset if needed
    gsap.set(titleElement, { opacity: 0 });
    gsap.set(textElement, { opacity: 0, y: 30 });
    
    // Animate title characters with staggered entrance
    timeline.to(titleElement, {
      opacity: 1,
      duration: 0.4,
      ease: "smoothStep"
    }, 0.2);
    
    timeline.to(titleSplit.chars, {
      opacity: 1,
      y: 0,
      stagger: 0.03,
      duration: 0.8,
      ease: "back.out(1.7)"
    }, 0.4);
    
    // Animate weight shift of "beat" part
    const beatElement = document.querySelector('.scene-1 .weight-shift');
    if (beatElement) {
      timeline.fromTo(beatElement, 
        { fontVariationSettings: "'wght' 300" },
        {
          fontVariationSettings: "'wght' 700",
          duration: 0.5,
          repeat: 1,
          yoyo: true,
          ease: "sine.inOut"
        }, 
      1.2);
      
      // Set up heartbeat animation
      gsap.to(beatElement, {
        fontVariationSettings: "'wght' 700",
        duration: 0.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        repeatDelay: 2
      });
    }
    
    // Animate description text with scramble effect
    timeline.to(textElement, {
      opacity: 1,
      y: 0,
      duration: 1.2,
      ease: "smoothStep",
      onStart: () => {
        if (textElement.innerText) {
          gsap.to(textElement, {
            scrambleText: {
              text: textElement.innerText,
              chars: "lowerCase",
              revealDelay: 0.5,
              speed: 0.3
            },
            duration: 1.5
          });
        }
      }
    }, 0.8);
    
    // Animate center point
    const centerPoint = document.querySelector('.center-point');
    if (centerPoint) {
      timeline.fromTo(centerPoint,
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 1.2,
          ease: "elastic.out(1.2, 0.5)"
        }, 
      1);
    }
    
    // Animate city points
    const cityPoints = document.querySelectorAll('.connection-point:not(.center-point)');
    cityPoints.forEach((point, index) => {
      timeline.fromTo(point,
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.8,
          ease: "back.out(2)"
        }, 
      1.2 + index * 0.15);
    });
    
  } catch (e) {
    console.error('Error animating heartbeat scene:', e);
    isAnimating = false;
  }
}

// Animate Scene 2: Cultural Immersion
function animateCultureScene(isResize) {
  // Hide mapbox container when not in scene 1
  const mapContainer = document.getElementById('mapbox-container');
  if (mapContainer) {
    gsap.to(mapContainer, {
      opacity: 0,
      duration: 0.5,
      ease: "smoothStep"
    });
  }
  
  if (isResize) return;
  
  const timeline = gsap.timeline({
    onComplete: () => {
      isAnimating = false;
    }
  });
  
  try {
    const titleElement = document.querySelector('.scene-2 .variable-title');
    const textElement = document.querySelector('.scene-2 .reveal-text');
    
    if (!titleElement || !textElement) return;
    
    const titleSplit = new SplitText(titleElement, { type: "chars", position: "relative" });
    
    // Reset if needed
    gsap.set(titleElement, { opacity: 0 });
    gsap.set(textElement, { opacity: 0, y: 30 });
    gsap.set(titleSplit.chars, { y: 50, opacity: 0 });
    
    // Animate title
    timeline.to(titleElement, {
      opacity: 1,
      duration: 0.4,
      ease: "smoothStep"
    }, 0.2);
    
    timeline.to(titleSplit.chars, {
      opacity: 1,
      y: 0,
      stagger: 0.03,
      duration: 0.8,
      ease: "back.out(1.7)"
    }, 0.4);
    
    // Animate weight shift of "Immersion" part
    const immersionElement = document.querySelector('.scene-2 .weight-shift');
    if (immersionElement) {
      timeline.fromTo(immersionElement, 
        { fontVariationSettings: "'wght' 300" },
        {
          fontVariationSettings: "'wght' 700",
          duration: 1.5,
          ease: "italianEase"
        },
      1);
    }
    
    // Animate description text
    timeline.to(textElement, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "smoothStep"
    }, 0.8);
    
    // Animate gallery items
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach((item, index) => {
      // Initial state
      gsap.set(item, { 
        opacity: 0, 
        scale: 0.8, 
        transformOrigin: "center center",
        rotationY: -15,
        translateZ: -200
      });
      
      // Animation
      timeline.to(item, {
        opacity: 1,
        scale: 1,
        rotationY: 0,
        translateZ: 0,
        duration: 1.2,
        ease: "back.out(1.7)"
      }, 1 + index * 0.25);
      
      // Add class for hover animations
      timeline.add(() => item.classList.add('active'), 1 + index * 0.25);
      
      // Add subtle floating animation
      const xOffset = (index === 0) ? -20 : (index === 2) ? 20 : 0;
      const yOffset = (index === 1) ? -10 : 5;
      
      gsap.to(item, {
        x: xOffset,
        y: yOffset,
        duration: 8 + index,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 2 + index * 0.5
      });
    });
  } catch (e) {
    console.error('Error animating culture scene:', e);
    isAnimating = false;
  }
}

// Animate Scene 3: Your Italian Home
function animateHomeScene(isResize) {
  // Keep mapbox container hidden
  const mapContainer = document.getElementById('mapbox-container');
  if (mapContainer) {
    gsap.to(mapContainer, {
      opacity: 0,
      duration: 0.5,
      ease: "smoothStep"
    });
  }
  
  if (isResize) return;
  
  const timeline = gsap.timeline({
    onComplete: () => {
      isAnimating = false;
    }
  });
  
  try {
    const titleElement = document.querySelector('.scene-3 .variable-title');
    const textElement = document.querySelector('.scene-3 .reveal-text');
    const showcasePrimary = document.querySelector('.showcase-primary');
    const showcaseDetails = document.querySelector('.showcase-details');
    const ctaContainer = document.querySelector('.cta-container');
    
    if (!titleElement || !textElement) return;
    
    const titleSplit = new SplitText(titleElement, { type: "chars", position: "relative" });
    
    // Reset if needed
    gsap.set(titleElement, { opacity: 0 });
    gsap.set(textElement, { opacity: 0, y: 30 });
    gsap.set(titleSplit.chars, { y: 50, opacity: 0 });
    
    // Animate title
    timeline.to(titleElement, {
      opacity: 1,
      duration: 0.4,
      ease: "smoothStep"
    }, 0.2);
    
    timeline.to(titleSplit.chars, {
      opacity: 1,
      y: 0,
      stagger: 0.03,
      duration: 0.8,
      ease: "back.out(1.7)"
    }, 0.4);
    
    // Animate weight shift of "Home" part
    const homeElement = document.querySelector('.scene-3 .weight-shift');
    if (homeElement) {
      timeline.fromTo(homeElement, 
        { fontVariationSettings: "'wght' 300" },
        {
          fontVariationSettings: "'wght' 700",
          duration: 1.5,
          ease: "italianEase"
        },
      1);
    }
    
    // Animate description text
    timeline.to(textElement, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "smoothStep"
    }, 0.8);
    
    // Animate primary image
    if (showcasePrimary) {
      timeline.fromTo(showcasePrimary,
        { opacity: 0, y: 100, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.2,
          ease: "back.out(1.4)"
        }, 
      1);
      
      // Zoom in effect for primary image
      const primaryImage = showcasePrimary.querySelector('img');
      if (primaryImage) {
        timeline.to(primaryImage, {
          scale: 1,
          duration: 2,
          ease: "power2.out"
        }, 1.2);
      }
    }
    
    // Animate detail images
    if (showcaseDetails) {
      timeline.fromTo(showcaseDetails,
        { opacity: 0, y: 80 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "back.out(1.2)"
        }, 
      1.4);
      
      // Stagger detail items
      const detailItems = document.querySelectorAll('.detail-item');
      timeline.fromTo(detailItems, 
        { opacity: 0, y: 30, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.15,
          duration: 0.8,
          ease: "back.out(1.5)"
        }, 
      1.6);
    }
    
    // Animate CTA button
    if (ctaContainer) {
      timeline.fromTo(ctaContainer,
        { opacity: 0, y: 40, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: "back.out(1.7)"
        }, 
      2);
      
      // Add shine effect to button
      const buttonBackdrop = document.querySelector('.button-backdrop');
      if (buttonBackdrop) {
        timeline.fromTo(buttonBackdrop,
          { x: '-100%' },
          {
            x: '100%',
            duration: 1.2,
            ease: "power2.inOut",
            repeat: 1,
            repeatDelay: 2
          }, 
        2.3);
      }
    }
  } catch (e) {
    console.error('Error animating home scene:', e);
    isAnimating = false;
  }
}

// Handle the end of the pinned experience
function handleExperienceEnd() {
  if (nextSectionFixed) return;
  
  // Remove scroll blocker
  const scrollBlocker = document.querySelector('.scroll-blocker');
  scrollBlocker.classList.remove('active');
  scrollBlockerActive = false;
  
  // Clean up event listeners
  window.removeEventListener('wheel', handleWheel);
  window.removeEventListener('touchstart', handleTouchStart);
  window.removeEventListener('touchend', handleTouchEnd);
  
  // Stop lenis smooth scrolling
  if (lenis) {
    lenis.destroy();
  }
  
  // Fix for next section skipping issue
  const nextSectionFixer = document.querySelector('.next-section-fixer');
  if (nextSectionFixer) {
    // Force a tiny scroll to trigger the next section visibility
    window.scrollBy(0, 1);
    
    // Refresh Webflow animations
    if (window.Webflow && window.Webflow.require) {
      const ix2 = window.Webflow.require('ix2');
      if (ix2 && ix2.init) {
        setTimeout(() => {
          ix2.init();
          window.scrollBy(0, 1);
          
          // Double check with another refresh after a longer delay
          setTimeout(() => {
            ix2.init();
            window.scrollBy(0, 1);
          }, 300);
        }, 100);
      }
    }
    
    nextSectionFixed = true;
  }
}

// Initialize on load (backup)
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(initPortaValleExperience, 100);
}
