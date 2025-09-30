import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xff7e5f); // Sunset pink/orange
scene.fog = new THREE.Fog(0xffa07a, 20, 100);

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 10, 30); // Flying camera starting position

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Lighting - Sunset colors
const ambientLight = new THREE.AmbientLight(0xffd4a3, 0.7);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xff9966, 0.8);
directionalLight.position.set(-20, 15, 10); // Low sun position
directionalLight.castShadow = true;
directionalLight.shadow.camera.left = -80;
directionalLight.shadow.camera.right = 80;
directionalLight.shadow.camera.top = 80;
directionalLight.shadow.camera.bottom = -80;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
scene.add(directionalLight);

// Ground with rolling hills
const groundGeometry = new THREE.PlaneGeometry(200, 200, 100, 100);
const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x4a7c3f,
    flatShading: true
});

// Create hills
const vertices = groundGeometry.attributes.position.array;
for (let i = 0; i < vertices.length; i += 3) {
    const x = vertices[i];
    const y = vertices[i + 1];
    vertices[i + 2] = Math.sin(x * 0.1) * 2 + Math.cos(y * 0.15) * 2 + Math.random() * 0.5;
}
groundGeometry.computeVertexNormals();

const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Castle - More detailed and prettier
const stoneMaterial = new THREE.MeshStandardMaterial({
    color: 0xc5b9a0,
    roughness: 0.9,
    metalness: 0.1
});
const darkStoneMaterial = new THREE.MeshStandardMaterial({ color: 0x7a7165 });
const roofMaterial = new THREE.MeshStandardMaterial({
    color: 0x4a0e0e,
    roughness: 0.8
});

// Castle base/foundation
const baseGeometry = new THREE.BoxGeometry(16, 2, 16);
const base = new THREE.Mesh(baseGeometry, darkStoneMaterial);
base.position.set(0, 1, -25);
base.castShadow = true;
base.receiveShadow = true;
scene.add(base);

// Main castle keep (taller and more detailed)
const keepGeometry = new THREE.BoxGeometry(10, 18, 10);
const keep = new THREE.Mesh(keepGeometry, stoneMaterial);
keep.position.set(0, 10, -25);
keep.castShadow = true;
keep.receiveShadow = true;
scene.add(keep);

// Keep battlements
for (let i = -4; i <= 4; i += 2) {
    for (let j = -4; j <= 4; j += 2) {
        if (i === 0 && j === 0) continue;
        const battlement = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 1.5, 1.5),
            stoneMaterial
        );
        battlement.position.set(i, 19.5, -25 + j);
        battlement.castShadow = true;
        scene.add(battlement);
    }
}

// Keep windows
const windowMaterial = new THREE.MeshStandardMaterial({
    color: 0x4a4a2a,
    emissive: 0xffaa55,
    emissiveIntensity: 0.3
});
const windowPositions = [
    [0, 12, -20.1], [0, 15, -20.1],
    [-3, 12, -20.1], [3, 12, -20.1]
];
windowPositions.forEach(pos => {
    const window = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1.5, 0.2),
        windowMaterial
    );
    window.position.set(...pos);
    scene.add(window);
});

// Castle towers (4 corners, taller)
const towerGeometry = new THREE.CylinderGeometry(2.2, 2.5, 22, 12);
const towerPositions = [
    [-7, 11, -32],
    [7, 11, -32],
    [-7, 11, -18],
    [7, 11, -18]
];

towerPositions.forEach(pos => {
    const tower = new THREE.Mesh(towerGeometry, stoneMaterial);
    tower.position.set(...pos);
    tower.castShadow = true;
    tower.receiveShadow = true;
    scene.add(tower);

    // Tower battlements (small blocks around top)
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const battlement = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 1.2, 0.8),
            stoneMaterial
        );
        battlement.position.set(
            pos[0] + Math.cos(angle) * 2.5,
            22.5,
            pos[2] + Math.sin(angle) * 2.5
        );
        battlement.castShadow = true;
        scene.add(battlement);
    }

    // Tower roof (taller spires)
    const roofGeometry = new THREE.ConeGeometry(3, 6, 12);
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.set(pos[0], 25.5, pos[2]);
    roof.castShadow = true;
    scene.add(roof);

    // Decorative spire tips
    const spireGeometry = new THREE.ConeGeometry(0.3, 2, 8);
    const spireMaterial = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        metalness: 0.8,
        roughness: 0.2
    });
    const spire = new THREE.Mesh(spireGeometry, spireMaterial);
    spire.position.set(pos[0], 29.5, pos[2]);
    scene.add(spire);

    // Tower windows
    const towerWindow = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 1.2, 0.2),
        windowMaterial
    );
    towerWindow.position.set(pos[0], pos[1] + 3, pos[2] > -25 ? pos[2] - 2.6 : pos[2] + 2.6);
    scene.add(towerWindow);
});

// Castle walls (with crenellations)
const wallHeight = 8;
const wallGeometry = new THREE.BoxGeometry(16, wallHeight, 1.5);
const wall1 = new THREE.Mesh(wallGeometry, stoneMaterial);
wall1.position.set(0, wallHeight / 2, -34);
wall1.castShadow = true;
wall1.receiveShadow = true;
scene.add(wall1);

const wall2 = new THREE.Mesh(wallGeometry, stoneMaterial);
wall2.position.set(0, wallHeight / 2, -16);
wall2.castShadow = true;
wall2.receiveShadow = true;
scene.add(wall2);

// Wall crenellations (front wall)
for (let i = -6; i <= 6; i += 3) {
    const cren = new THREE.Mesh(
        new THREE.BoxGeometry(2, 1.5, 1.5),
        stoneMaterial
    );
    cren.position.set(i, wallHeight + 0.75, -34);
    cren.castShadow = true;
    scene.add(cren);
}

const wallSideGeometry = new THREE.BoxGeometry(1.5, wallHeight, 18);
const wall3 = new THREE.Mesh(wallSideGeometry, stoneMaterial);
wall3.position.set(-9, wallHeight / 2, -25);
wall3.castShadow = true;
wall3.receiveShadow = true;
scene.add(wall3);

const wall4 = new THREE.Mesh(wallSideGeometry, stoneMaterial);
wall4.position.set(9, wallHeight / 2, -25);
wall4.castShadow = true;
wall4.receiveShadow = true;
scene.add(wall4);

// Gate entrance
const gateGeometry = new THREE.BoxGeometry(3, 5, 0.3);
const gateMaterial = new THREE.MeshStandardMaterial({
    color: 0x3d2817,
    roughness: 1.0
});
const gate = new THREE.Mesh(gateGeometry, gateMaterial);
gate.position.set(0, 2.5, -15.3);
scene.add(gate);

// Gate arch
const archGeometry = new THREE.CylinderGeometry(1.8, 1.8, 0.8, 16, 1, false, 0, Math.PI);
const arch = new THREE.Mesh(archGeometry, stoneMaterial);
arch.rotation.z = Math.PI / 2;
arch.rotation.y = Math.PI / 2;
arch.position.set(0, 5.2, -16);
scene.add(arch);

// Decorative flags on towers (with wave animation)
const flags = [];
towerPositions.forEach((pos, idx) => {
    const flagPoleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 4);
    const flagPoleMaterial = new THREE.MeshStandardMaterial({ color: 0x2c2c2c });
    const flagPole = new THREE.Mesh(flagPoleGeometry, flagPoleMaterial);
    flagPole.position.set(pos[0], 30, pos[2]);
    scene.add(flagPole);

    const flagGeometry = new THREE.PlaneGeometry(2, 1.2, 20, 10);
    const flagColors = [0xff0000, 0x0000ff, 0xffff00, 0x00ff00];
    const flagMaterial = new THREE.MeshStandardMaterial({
        color: flagColors[idx],
        side: THREE.DoubleSide
    });
    const flag = new THREE.Mesh(flagGeometry, flagMaterial);
    flag.position.set(pos[0] + 1, 31, pos[2]);
    scene.add(flag);

    flags.push({ mesh: flag, offset: idx * 0.5 });
});

// Clouds in the sky
const cloudMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.6,
    roughness: 1.0
});

const clouds = [];
for (let i = 0; i < 20; i++) {
    const cloudGroup = new THREE.Group();

    // Create puffy cloud from multiple spheres
    const numPuffs = 3 + Math.floor(Math.random() * 3);
    for (let j = 0; j < numPuffs; j++) {
        const puffSize = 2 + Math.random() * 2;
        const puffGeometry = new THREE.SphereGeometry(puffSize, 8, 8);
        const puff = new THREE.Mesh(puffGeometry, cloudMaterial);
        puff.position.x = (Math.random() - 0.5) * 6;
        puff.position.y = (Math.random() - 0.5) * 2;
        puff.position.z = (Math.random() - 0.5) * 4;
        cloudGroup.add(puff);
    }

    cloudGroup.position.x = (Math.random() - 0.5) * 150;
    cloudGroup.position.y = 35 + Math.random() * 25;
    cloudGroup.position.z = (Math.random() - 0.5) * 150;

    scene.add(cloudGroup);
    clouds.push({
        group: cloudGroup,
        speed: 0.5 + Math.random() * 1,
        direction: Math.random() > 0.5 ? 1 : -1
    });
}

// Trees scattered around
const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x4d3319 });
const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x2d5016 });

for (let i = 0; i < 30; i++) {
    const x = (Math.random() - 0.5) * 160;
    const z = (Math.random() - 0.5) * 160;

    // Avoid castle and spawn area
    if (Math.abs(x) < 20 && Math.abs(z) < 40) continue;
    if (Math.abs(x) < 20 && z > -40 && z < -10) continue;

    // Tree trunk
    const trunkHeight = 3 + Math.random() * 2;
    const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.4, trunkHeight, 8),
        trunkMaterial
    );
    trunk.position.set(x, trunkHeight / 2, z);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    scene.add(trunk);

    // Tree leaves
    const leaves = new THREE.Mesh(
        new THREE.SphereGeometry(2 + Math.random(), 8, 8),
        leavesMaterial
    );
    leaves.position.set(x, trunkHeight + 1.5, z);
    leaves.castShadow = true;
    leaves.receiveShadow = true;
    scene.add(leaves);
}

// Rocks scattered around
const rockMaterial = new THREE.MeshStandardMaterial({
    color: 0x6b6b6b,
    roughness: 0.95
});

for (let i = 0; i < 25; i++) {
    const x = (Math.random() - 0.5) * 140;
    const z = (Math.random() - 0.5) * 140;

    // Avoid castle area
    if (Math.abs(x) < 20 && z > -40 && z < -10) continue;

    const rockSize = 0.5 + Math.random() * 1.5;
    const rock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(rockSize, 0),
        rockMaterial
    );
    rock.position.set(x, rockSize * 0.5, z);
    rock.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
    );
    rock.castShadow = true;
    rock.receiveShadow = true;
    scene.add(rock);
}

// Flowers scattered around
const flowerColors = [0xff69b4, 0xffb6c1, 0xffd700, 0xff8c00, 0xda70d6, 0xffffff];

for (let i = 0; i < 100; i++) {
    const stemGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.3);
    const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);

    const petalGeometry = new THREE.SphereGeometry(0.1, 6, 6);
    const petalMaterial = new THREE.MeshStandardMaterial({
        color: flowerColors[Math.floor(Math.random() * flowerColors.length)]
    });
    const petal = new THREE.Mesh(petalGeometry, petalMaterial);

    const x = Math.random() * 80 - 40;
    const z = Math.random() * 80 - 40;

    // Avoid placing flowers in castle area
    if (Math.abs(x) < 15 && z > -35 && z < -15) continue;

    stem.position.set(x, 0.15, z);
    petal.position.set(x, 0.35, z);

    scene.add(stem);
    scene.add(petal);
}

// First-person controls
const controls = new PointerLockControls(camera, renderer.domElement);

const instructions = document.getElementById('instructions');

renderer.domElement.addEventListener('click', () => {
    controls.lock();
});

controls.addEventListener('lock', () => {
    instructions.classList.add('hidden');
});

controls.addEventListener('unlock', () => {
    instructions.classList.remove('hidden');
});

// Movement
const moveSpeed = 15;
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

const keys = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false
};

document.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'KeyW': keys.forward = true; break;
        case 'KeyS': keys.backward = true; break;
        case 'KeyA': keys.left = true; break;
        case 'KeyD': keys.right = true; break;
        case 'Space': keys.up = true; break;
        case 'ShiftLeft':
        case 'ShiftRight': keys.down = true; break;
    }
});

document.addEventListener('keyup', (event) => {
    switch (event.code) {
        case 'KeyW': keys.forward = false; break;
        case 'KeyS': keys.backward = false; break;
        case 'KeyA': keys.left = false; break;
        case 'KeyD': keys.right = false; break;
        case 'Space': keys.up = false; break;
        case 'ShiftLeft':
        case 'ShiftRight': keys.down = false; break;
    }
});

// Resize handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const time = clock.getElapsedTime();

    // Animate flags with wave effect
    flags.forEach(flagData => {
        const flag = flagData.mesh;
        const positions = flag.geometry.attributes.position;

        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);

            // Create wave effect based on x position
            const wave = Math.sin(x * 3 + time * 3 + flagData.offset) * 0.15 * (x / 2 + 1);
            positions.setZ(i, wave);
        }

        positions.needsUpdate = true;
    });

    // Animate clouds slowly drifting
    clouds.forEach(cloudData => {
        cloudData.group.position.x += cloudData.speed * delta * cloudData.direction;

        // Wrap around if cloud goes too far
        if (cloudData.group.position.x > 100) cloudData.group.position.x = -100;
        if (cloudData.group.position.x < -100) cloudData.group.position.x = 100;
    });

    if (controls.isLocked) {
        // Flying camera controls
        direction.z = Number(keys.forward) - Number(keys.backward);
        direction.x = Number(keys.right) - Number(keys.left);
        direction.y = Number(keys.up) - Number(keys.down);
        direction.normalize();

        // Apply velocity in all directions
        velocity.x = direction.x * moveSpeed * delta;
        velocity.z = direction.z * moveSpeed * delta;
        velocity.y = direction.y * moveSpeed * delta;

        // Move camera freely in 3D space
        controls.moveRight(velocity.x);
        controls.moveForward(velocity.z);
        camera.position.y += velocity.y;
    }

    renderer.render(scene, camera);
}

animate();