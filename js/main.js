// Main variables
let scene, camera, renderer;
let particles, geometry, material;
let mouseX = 0, mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;
let particleCount = 5000;

// Initialize the scene
function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    
    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 1000;
    
    // Create particle geometry
    geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    const color = new THREE.Color();
    
    // Create positions and colors for each particle
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Position
        positions[i3] = (Math.random() * 2 - 1) * 1000;
        positions[i3 + 1] = (Math.random() * 2 - 1) * 1000;
        positions[i3 + 2] = (Math.random() * 2 - 1) * 1000;
        
        // Color
        const hue = i / particleCount;
        color.setHSL(hue, 1.0, 0.5);
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    // Material
    material = new THREE.PointsMaterial({
        size: 2,
        vertexColors: true,
        transparent: true,
        opacity: 0.7
    });
    
    // Create particles
    particles = new THREE.Points(geometry, material);
    scene.add(particles);
    
    // Set up renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.querySelector('.wrapper').appendChild(renderer.domElement);
    
    // Add event listeners
    document.addEventListener('mousemove', onDocumentMouseMove);
    window.addEventListener('resize', onWindowResize);
    
    // Set up button interaction
    const labButton = document.querySelector('.labbutton');
    labButton.addEventListener('click', () => {
        const titleContainer = document.getElementById('title-container');
        titleContainer.style.opacity = 0;
        setTimeout(() => {
            titleContainer.style.display = 'none';
            labButton.style.display = 'none';
            
            // Show social media icons
            document.getElementById('img-container').style.display = 'block';
        }, 1000);
        
        // Change particle animation to be more dynamic
        particlesEnterLab();
    });
    
    // Add fade-in effect
    document.getElementById('img-container').style.display = 'none';
    setTimeout(() => {
        renderer.domElement.style.opacity = 1;
    }, 100);
}

// Handle window resize
function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Handle mouse movement
function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX) * 0.05;
    mouseY = (event.clientY - windowHalfY) * 0.05;
}

// Switch to a more dynamic particle animation
function particlesEnterLab() {
    // Update particle positions to be more dynamic
    const positions = geometry.attributes.position.array;
    
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3] = (Math.random() * 2 - 1) * 2000;
        positions[i3 + 1] = (Math.random() * 2 - 1) * 2000;
        positions[i3 + 2] = (Math.random() * 2 - 1) * 2000;
    }
    
    geometry.attributes.position.needsUpdate = true;
}

// Animate the scene
function animate() {
    requestAnimationFrame(animate);
    
    // Rotate particles
    particles.rotation.x += 0.0005;
    particles.rotation.y += 0.001;
    
    // Move particles based on mouse position
    particles.rotation.x += (mouseY * 0.0005 - particles.rotation.x) * 0.01;
    particles.rotation.y += (mouseX * 0.0005 - particles.rotation.y) * 0.01;
    
    renderer.render(scene, camera);
}

// Initialize and start animation
init();
animate();