// Main variables
let scene, camera, renderer;
let particleSystem, particleCount = 8000;
let particles, geometry, materials = [];
let mouseX = 0, mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

// Initialize the scene
function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    
    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 1000;
    
    // Create geometry for flowing particles
    geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const colors = new Float32Array(particleCount * 3);
    
    const color = new THREE.Color();
    
    // Create particle system with flowing effect
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Random position in 3D space, but more concentrated in a specific area
        const x = (Math.random() * 2 - 1) * 800;
        const y = (Math.random() * 2 - 1) * 800;
        const z = (Math.random() * 2 - 1) * 800;
        
        positions[i3] = x;
        positions[i3 + 1] = y;
        positions[i3 + 2] = z;
        
        // Random size, but generally elongated
        sizes[i] = Math.random() * 20 + 5;
        
        // Purple color palette with some variation
        const purple = Math.random() * 0.3 + 0.6; // Higher value for more intense purple
        const brightness = Math.random() * 0.3 + 0.7; // Control brightness
        
        color.setHSL(0.75, purple, brightness); // HSL: purple is around 0.75
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Create shader material for better-looking particles
    const vertexShader = `
        attribute float size;
        varying vec3 vColor;
        
        void main() {
            vColor = color;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
        }
    `;
    
    const fragmentShader = `
        varying vec3 vColor;
        
        void main() {
            // Create elongated particle shape
            vec2 coord = gl_PointCoord - vec2(0.5, 0.5);
            if (length(coord) > 0.5) discard;
            
            // Apply radial gradient and elongate particles
            float alpha = 0.8 - length(coord) * 1.5;
            if (coord.x > 0.1 || coord.x < -0.1) alpha *= 0.5;
            
            gl_FragColor = vec4(vColor, alpha);
        }
    `;
    
    // Create particle material with shaders
    const shaderMaterial = new THREE.ShaderMaterial({
        uniforms: {},
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        transparent: true,
        vertexColors: true
    });
    
    // Create particle system
    particleSystem = new THREE.Points(geometry, shaderMaterial);
    scene.add(particleSystem);
    
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
    // Make more particles visible and increase flow speed
    const positions = geometry.attributes.position.array;
    const sizes = geometry.attributes.size.array;
    
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        // Spread particles out more
        positions[i3] = (Math.random() * 2 - 1) * 1500;
        positions[i3 + 1] = (Math.random() * 2 - 1) * 1500;
        positions[i3 + 2] = (Math.random() * 2 - 1) * 1500;
        
        // Increase particle sizes
        sizes[i] = Math.random() * 30 + 10;
    }
    
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.size.needsUpdate = true;
}

// Create flowing animation for particles
function updateParticles() {
    const positions = geometry.attributes.position.array;
    const time = Date.now() * 0.0001;
    
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Create flowing effect with sine/cosine waves
        // Each particle moves along a unique path
        const x = positions[i3];
        const y = positions[i3 + 1];
        const z = positions[i3 + 2];
        
        // Apply flowing movement
        positions[i3] = x + Math.sin(time + i * 0.01) * 2;
        positions[i3 + 1] = y + Math.cos(time + i * 0.01) * 2;
        positions[i3 + 2] = z + Math.sin(time + i * 0.01) * 2;
        
        // Reset particles that move too far away
        const distance = Math.sqrt(x*x + y*y + z*z);
        if (distance > 1500) {
            positions[i3] = (Math.random() * 2 - 1) * 800;
            positions[i3 + 1] = (Math.random() * 2 - 1) * 800;
            positions[i3 + 2] = (Math.random() * 2 - 1) * 800;
        }
    }
    
    geometry.attributes.position.needsUpdate = true;
}

// Animate the scene
function animate() {
    requestAnimationFrame(animate);
    
    // Update particle positions for flowing effect
    updateParticles();
    
    // Rotate particle system
    particleSystem.rotation.x += 0.0005;
    particleSystem.rotation.y += 0.001;
    
    // Make rotation responsive to mouse movement
    particleSystem.rotation.x += (mouseY * 0.0002 - particleSystem.rotation.x) * 0.01;
    particleSystem.rotation.y += (mouseX * 0.0002 - particleSystem.rotation.y) * 0.01;
    
    renderer.render(scene, camera);
}

// Initialize and start animation
init();
animate();