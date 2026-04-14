/**
 * main.js — CORE-32 R.U.B.I.C. Lab Entry Point
 *
 * Wires together all modules: boot modal, tab navigation,
 * telemetry sliders, and exposes operation handlers to the DOM.
 */

import { config } from './config.js';
import { initSeedOfLife, initFlowerOfLife, rotateMode1, rotateMode2, generateE6Shadow } from './svg-modes.js';
import { toggleOracle, submitChat, analyzeState } from './oracle.js';
import { setTopology } from './topology.js';
import { initCanvas, resizeCanvas, macroCubes } from './sbox-renderer.js';
import {
    initComputePanel, coreApplyDelta, coreApplyRotor,
    coreVerifyCommutation, coreInjectFault, coreRecover, coreReset
} from './state-engine.js';

// =====================================================================
// Expose functions to DOM onclick handlers
// =====================================================================
window.bootSystem = bootSystem;
window.toggleOracle = toggleOracle;
window.submitChat = submitChat;
window.switchTab = switchTab;
window.rotateMode1 = rotateMode1;
window.rotateMode2 = rotateMode2;
window.generateE6Shadow = generateE6Shadow;
window.analyzeState = analyzeState;
window.setTopology = (type) => setTopology(type, macroCubes);
window.coreApplyDelta = coreApplyDelta;
window.coreApplyRotor = coreApplyRotor;
window.coreVerifyCommutation = coreVerifyCommutation;
window.coreInjectFault = coreInjectFault;
window.coreRecover = coreRecover;
window.coreReset = coreReset;

// =====================================================================
// Boot Sequence
// =====================================================================

function bootSystem() {
    const bootKey = document.getElementById('boot-api-key').value.trim();
    if (bootKey) {
        config.apiKey = bootKey;
        const localInput = document.getElementById('local-api-key');
        if (localInput) localInput.value = bootKey;
    }

    document.getElementById('boot-modal').style.display = 'none';
    document.getElementById('app').style.display = 'flex';

    // Initialize SVG modes
    initSeedOfLife();
    initFlowerOfLife();

    // Start 3D engine
    config.isCanvasActive = true;
    if (!config.animationStarted) initCanvas();

    // Initialize compute panel after macro-cubes exist
    setTimeout(initComputePanel, 100);
}

// =====================================================================
// Tab Navigation
// =====================================================================

function switchTab(modeId) {
    config.currentMode = modeId;
    for (let i = 1; i <= 4; i++) {
        document.getElementById(`tab-${i}`).classList.toggle('active', i === modeId);
        const panel = document.getElementById(`mode-${i}`);
        panel.classList.toggle('visible', i === modeId);
        panel.style.display = i === modeId ? 'flex' : 'none';
    }

    if (modeId === 4) {
        config.isCanvasActive = true;
        if (!config.animationStarted) initCanvas();
        else setTimeout(resizeCanvas, 50);
    } else {
        config.isCanvasActive = false;
    }
}

// =====================================================================
// Telemetry Slider Wiring
// =====================================================================

function bindSlider(sliderId, valueId, configKey, formatter) {
    const slider = document.getElementById(sliderId);
    if (!slider) return;
    slider.addEventListener('input', (e) => {
        config[configKey] = parseFloat(e.target.value);
        document.getElementById(valueId).textContent = formatter(config[configKey]);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    bindSlider('sl-mut',   'val-mut',   'mutationRate',  v => v.toFixed(3));
    bindSlider('sl-spd',   'val-spd',   'twistSpeed',    v => v.toFixed(2));
    bindSlider('sl-amp',   'val-amp',   'waveAmplitude', v => v.toFixed(1));
    bindSlider('sl-freq',  'val-freq',  'waveFrequency', v => v.toFixed(1));
    bindSlider('sl-glyph', 'val-glyph', 'glyphRate',     v => v.toFixed(1));
});
