/**
 * sbox-renderer.js — 512D GPU S-Box Renderer
 *
 * Three.js scene with 196 instanced macro-cubes (5292 cubies),
 * custom vertex shader for Cayley-Dickson glyph hashing,
 * and the main animation loop.
 */

import { config } from './config.js';
import { turboColor, waveToColor } from './colormap.js';
import { calculateTopologyTargets } from './topology.js';
import { createHyperCubieTextureAtlas } from './texture-atlas.js';
import { attachOrbitControls } from './orbit-controls.js';
import { bindStateEngine } from './state-engine.js';

// Three.js globals (uses THREE from window)
let scene, camera, renderer, meshField;
export let macroCubes = [];

// Axis vectors (initialized lazily)
let yAxis, xAxis, zAxis;
function ensureAxes() {
    if (!yAxis) {
        yAxis = new THREE.Vector3(0, 1, 0);
        xAxis = new THREE.Vector3(1, 0, 0);
        zAxis = new THREE.Vector3(0, 0, 1);
    }
}

// Reusable objects for animation (initialized lazily)
let dummy, instanceColor;
function ensureAnimGlobals() {
    if (!dummy) dummy = new THREE.Object3D();
    if (!instanceColor) instanceColor = new THREE.Color();
}

/**
 * MacroCube — a logical 3×3×3 Rubik's cube containing 27 cubies.
 * Each holds a ℤ₃₂ coreState for the state computer.
 */
class MacroCube {
    constructor(index, startIndex) {
        this.index = index;
        this.coreState = Math.floor(Math.random() * 32);
        this.prevState = this.coreState;
        this.targetX = 0; this.targetY = 0; this.targetZ = 0;
        this.baseX = 0; this.baseY = 0; this.baseZ = 0;
        this.gridX = 0; this.gridZ = 0;
        this.cubies = [];

        const cols = [0xffffff, 0xffd500, 0xb71234, 0xff5800, 0x0046ad, 0x009b48];
        let i = 0;
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                for (let z = -1; z <= 1; z++) {
                    this.cubies.push({
                        ix: x, iy: y, iz: z,
                        id: startIndex + i,
                        baseColor: new THREE.Color(cols[Math.floor(Math.random() * 6)]),
                        quaternion: new THREE.Quaternion(),
                    });
                    i++;
                }
            }
        }

        this.isTwisting = false;
        this.twistAxisStr = 'y';
        this.twistAxis = yAxis;
        this.twistLayer = 1;
        this.twistAngle = 0;
        this.twistDir = 1;
    }
}

/**
 * Resize handler — updates ortho camera and renderer.
 */
export function resizeCanvas() {
    const container = document.getElementById('canvas-container');
    if (container && camera && renderer) {
        const aspect = container.clientWidth / container.clientHeight;
        const f = 250;
        camera.left = -f * aspect / 2;
        camera.right = f * aspect / 2;
        camera.top = f / 2;
        camera.bottom = -f / 2;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    }
}

/**
 * Initialize the Three.js scene, instanced mesh, and shader pipeline.
 */
export function initCanvas() {
    config.animationStarted = true;
    ensureAxes();

    const container = document.getElementById('canvas-container');
    scene = new THREE.Scene();

    const aspect = container.clientWidth / container.clientHeight;
    const f = 250;
    camera = new THREE.OrthographicCamera(
        f * aspect / -2, f * aspect / 2,
        f / 2, f / -2, -1000, 1000
    );
    camera.position.set(100, 100, 100);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        canvas: document.getElementById('petaminxCanvas'),
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Manual orbit controls
    attachOrbitControls(camera, renderer.domElement, container);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(50, 100, 20);
    scene.add(dirLight);

    // Instanced mesh: 196 macro-cubes × 27 cubies = 5292 instances
    const cubieSize = 3.15;
    const totalCubes = 196;
    const totalCubies = totalCubes * 27;
    const geometry = new THREE.BoxGeometry(cubieSize, cubieSize, cubieSize);

    // Per-instance hyper-seed for shader hashing
    const hyperSeeds = new Float32Array(totalCubies);
    for (let i = 0; i < totalCubies; i++) hyperSeeds[i] = Math.random() * 1000.0;
    geometry.setAttribute('hyperSeed', new THREE.InstancedBufferAttribute(hyperSeeds, 1));

    // Shader uniforms
    const shaderUniforms = {
        u_time: { value: 0 },
        u_glyphRate: { value: config.glyphRate },
    };

    const material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.2,
        metalness: 0.1,
        map: createHyperCubieTextureAtlas(),
    });

    // Custom shader injection: 512D Cayley-Dickson glyph hash
    material.onBeforeCompile = (shader) => {
        shader.uniforms.u_time = shaderUniforms.u_time;
        shader.uniforms.u_glyphRate = shaderUniforms.u_glyphRate;
        shader.vertexShader = `
            uniform float u_time;
            uniform float u_glyphRate;
            attribute float hyperSeed;
            float hash(float n) { return fract(sin(n) * 43758.5453123); }
            ${shader.vertexShader}
        `.replace(
            `#include <uv_vertex>`,
            `#include <uv_vertex>
             #ifdef USE_MAP
                 float volatility = hash(hyperSeed + floor(u_time * u_glyphRate)) * 4096.0;
                 float shiftX = floor(mod(volatility, 64.0)) / 64.0;
                 float shiftY = floor(mod(volatility / 64.0, 64.0)) / 64.0;
                 vUv = (uv * (1.0/64.0)) + vec2(shiftX, shiftY);
             #endif`
        );
        material.userData.shader = shader;
    };

    meshField = new THREE.InstancedMesh(geometry, material, totalCubies);

    // Create macro-cubes
    let startIndex = 0;
    for (let i = 0; i < totalCubes; i++) {
        macroCubes.push(new MacroCube(i, startIndex));
        startIndex += 27;
    }

    // Set initial layout
    calculateTopologyTargets('PLANAR', macroCubes);
    macroCubes.forEach(m => {
        m.baseX = m.targetX;
        m.baseY = m.targetY;
        m.baseZ = m.targetZ;
    });

    scene.add(meshField);

    // Bind state engine to mesh
    bindStateEngine(macroCubes, meshField);

    window.addEventListener('resize', resizeCanvas);
    setTimeout(resizeCanvas, 50);
    requestAnimationFrame(animateField);
}

/**
 * Main animation loop — drives topology morphing, wave dynamics,
 * Rubik's twist mutations, and state-based color tinting.
 */
function animateField() {
    requestAnimationFrame(animateField);
    if (!config.isCanvasActive) return;
    ensureAnimGlobals();

    config.globalTime += 0.02;

    // Update shader uniforms
    if (meshField?.material?.userData?.shader) {
        meshField.material.userData.shader.uniforms.u_time.value = config.globalTime;
        meshField.material.userData.shader.uniforms.u_glyphRate.value = config.glyphRate;
    }

    macroCubes.forEach(macro => {
        // Smooth topology morphing
        macro.baseX += (macro.targetX - macro.baseX) * 0.05;
        macro.baseY += (macro.targetY - macro.baseY) * 0.05;
        macro.baseZ += (macro.targetZ - macro.baseZ) * 0.05;

        // Topological wave
        const dist = Math.sqrt(macro.baseX ** 2 + macro.baseZ ** 2);
        const wave = Math.sin(dist * 0.05 - config.globalTime * config.waveFrequency) * config.waveAmplitude
                   + Math.sin(macro.baseX * 0.08 + config.globalTime) * (config.waveAmplitude * 0.5);
        const finalY = macro.baseY + wave;

        // Wave color
        const tc = waveToColor(wave);
        const waveColor = new THREE.Color(tc.r, tc.g, tc.b);

        // Rubik's twist mutations
        if (!macro.isTwisting && Math.random() < config.mutationRate) {
            macro.isTwisting = true;
            const axes = ['x', 'y', 'z'];
            macro.twistAxisStr = axes[Math.floor(Math.random() * 3)];
            macro.twistAxis = macro.twistAxisStr === 'x' ? xAxis
                            : macro.twistAxisStr === 'y' ? yAxis : zAxis;
            macro.twistLayer = [-1, 0, 1][Math.floor(Math.random() * 3)];
            macro.twistAngle = 0;
            macro.twistDir = Math.random() > 0.5 ? 1 : -1;
        }

        if (macro.isTwisting) {
            macro.twistAngle += config.twistSpeed * macro.twistDir;
            if (Math.abs(macro.twistAngle) >= Math.PI / 2) {
                macro.twistAngle = (Math.PI / 2) * macro.twistDir;
                macro.isTwisting = false;
                const qRot = new THREE.Quaternion().setFromAxisAngle(macro.twistAxis, macro.twistAngle);
                macro.cubies.forEach(c => {
                    const lv = macro.twistAxisStr === 'x' ? c.ix
                             : macro.twistAxisStr === 'y' ? c.iy : c.iz;
                    if (lv === macro.twistLayer) {
                        c.quaternion.premultiply(qRot);
                        const ix = c.ix, iy = c.iy, iz = c.iz;
                        if (macro.twistAxisStr === 'y') {
                            c.ix = macro.twistDir > 0 ? -iz : iz;
                            c.iz = macro.twistDir > 0 ? ix : -ix;
                        } else if (macro.twistAxisStr === 'x') {
                            c.iy = macro.twistDir > 0 ? iz : -iz;
                            c.iz = macro.twistDir > 0 ? -iy : iy;
                        } else {
                            c.ix = macro.twistDir > 0 ? -iy : iy;
                            c.iy = macro.twistDir > 0 ? ix : -ix;
                        }
                    }
                });
            }
        }

        const qCurrent = new THREE.Quaternion();
        if (macro.isTwisting) qCurrent.setFromAxisAngle(macro.twistAxis, macro.twistAngle);

        // Position and color each cubie
        macro.cubies.forEach(c => {
            let isTwisting = false;
            if (macro.isTwisting) {
                const lv = macro.twistAxisStr === 'x' ? c.ix
                         : macro.twistAxisStr === 'y' ? c.iy : c.iz;
                if (lv === macro.twistLayer) isTwisting = true;
            }

            dummy.position.set(c.ix * 3.333, c.iy * 3.333, c.iz * 3.333);
            dummy.quaternion.copy(c.quaternion);
            if (isTwisting) {
                dummy.position.applyQuaternion(qCurrent);
                dummy.quaternion.premultiply(qCurrent);
            }
            dummy.position.x += macro.baseX;
            dummy.position.y += finalY;
            dummy.position.z += macro.baseZ;
            dummy.updateMatrix();
            meshField.setMatrixAt(c.id, dummy.matrix);

            // Color: base → wave blend → state tint
            instanceColor.copy(c.baseColor).lerp(waveColor, 0.75);
            const stateHue = macro.coreState / 32;
            const stateColor = turboColor(stateHue);
            instanceColor.lerp(new THREE.Color(stateColor.r, stateColor.g, stateColor.b), 0.3);
            meshField.setColorAt(c.id, instanceColor);
        });
    });

    meshField.instanceMatrix.needsUpdate = true;
    meshField.instanceColor.needsUpdate = true;
    renderer.render(scene, camera);
}
