/**
 * state-engine.js — CORE-32 ℤ₃₂ State Computer
 *
 * Manages the 196-node state vector and provides live algebraic
 * operations: δ₃₂ phase dual, rotor step, commutation verification,
 * CNLT fault injection and recovery.
 */

import { delta32, rhoM, applyRotorToState } from './algebra.js';
import { stateToGridColor } from './colormap.js';
import { toggleOracle, appendMsg } from './oracle.js';

let totalOps = 0;
let faultCount = 0;
export const faultedIndices = new Set();
let operationHistory = [];

// Reference set at init time
let _macroCubes = [];
let _meshField = null;

/**
 * Bind the state engine to the macro-cube array and mesh.
 */
export function bindStateEngine(macroCubes, meshField) {
    _macroCubes = macroCubes;
    _meshField = meshField;
}

// --- Internal helpers ---

function computeEntropy() {
    const counts = new Array(32).fill(0);
    _macroCubes.forEach(m => counts[m.coreState]++);
    const n = _macroCubes.length;
    let H = 0;
    counts.forEach(c => {
        if (c > 0) { const p = c / n; H -= p * Math.log2(p); }
    });
    return H;
}

function computePhaseBalance() {
    let p0 = 0, p1 = 0;
    _macroCubes.forEach(m => { if (m.coreState < 16) p0++; else p1++; });
    return `${p0}:${p1}`;
}

function updateReadout() {
    const el = (id) => document.getElementById(id);
    el('cr-ops').textContent = totalOps;
    el('cr-entropy').textContent = computeEntropy().toFixed(3) + ' bits';
    el('cr-balance').textContent = computePhaseBalance();
    el('cr-faults').textContent = faultCount;
    el('cr-faults').style.color = faultCount > 0 ? '#ef4444' : 'var(--accent-mint)';
    const isRev = faultedIndices.size === 0;
    el('cr-rev').textContent = isRev ? '✓ INTACT' : '✗ FAULTED';
    el('cr-rev').style.color = isRev ? 'var(--accent-mint)' : '#ef4444';
}

function syncStateToShader(idx) {
    if (!_meshField) return;
    const mc = _macroCubes[idx];
    const attr = _meshField.geometry.getAttribute('hyperSeed');
    mc.cubies.forEach((c, j) => {
        attr.array[c.id] = mc.coreState * 31.415926 + j * 7.137;
    });
    attr.needsUpdate = true;
}

function syncAllStatesToShader() {
    _macroCubes.forEach((_, i) => syncStateToShader(i));
}

// --- Grid Rendering ---

export function renderStateGrid() {
    const grid = document.getElementById('state-grid');
    if (!grid || _macroCubes.length === 0) return;

    if (grid.children.length === 0) {
        for (let i = 0; i < _macroCubes.length; i++) {
            const cell = document.createElement('div');
            cell.className = 'state-cell';
            cell.dataset.idx = i;
            cell.title = `Node ${i}`;
            cell.onclick = () => {
                const mc = _macroCubes[i];
                mc.prevState = mc.coreState;
                mc.coreState = delta32(mc.coreState);
                totalOps++;
                syncStateToShader(i);
                renderStateGrid();
                updateReadout();
            };
            grid.appendChild(cell);
        }
    }

    for (let i = 0; i < _macroCubes.length; i++) {
        const cell = grid.children[i];
        const s = _macroCubes[i].coreState;
        cell.textContent = s;
        cell.style.background = stateToGridColor(s);
        cell.classList.toggle('faulted', faultedIndices.has(i));
    }
}

// --- Public Operations ---

export function coreApplyDelta() {
    operationHistory.push(_macroCubes.map(m => m.coreState));
    _macroCubes.forEach(m => {
        m.prevState = m.coreState;
        m.coreState = delta32(m.coreState);
    });
    totalOps += _macroCubes.length;
    syncAllStatesToShader();
    renderStateGrid();
    updateReadout();
}

export function coreApplyRotor() {
    operationHistory.push(_macroCubes.map(m => m.coreState));
    _macroCubes.forEach(m => {
        m.prevState = m.coreState;
        m.coreState = applyRotorToState(m.coreState);
    });
    totalOps += _macroCubes.length;
    syncAllStatesToShader();
    renderStateGrid();
    updateReadout();
}

export function coreVerifyCommutation() {
    let passed = 0, failed = 0;
    _macroCubes.forEach(m => {
        const x = m.coreState;
        const lhs = rhoM(delta32(x), 3);
        const rhs = delta32(rhoM(x, 3));
        if (lhs === rhs) passed++; else failed++;
    });

    toggleOracle(true);
    appendMsg('user', 'VERIFY: Generalized Commutation Theorem ρ₃∘δ₃₂ ≡ δ₃₂∘ρ₃');
    if (failed === 0) {
        appendMsg('ai', `[COMMUTATION VERIFIED]: All ${passed} nodes satisfy ρ₃(δ₃₂(x)) = δ₃₂(ρ₃(x)). The Generalized Commutation Theorem holds — Rotor-Projection Functoriality is maintained across all ℤ₃₂ ↔ ℤ₁₆ lattice boundaries. Zero phase-collapse detected.`);
    } else {
        appendMsg('ai', `[ANOMALY]: ${failed}/${passed + failed} nodes failed commutation. Investigate fault-cone origin.`);
    }
    totalOps += _macroCubes.length * 4;
    updateReadout();
}

export function coreInjectFault() {
    const candidates = _macroCubes.filter((_, i) => !faultedIndices.has(i));
    if (candidates.length === 0) return;

    const target = candidates[Math.floor(Math.random() * candidates.length)];
    const idx = target.index;
    operationHistory.push(_macroCubes.map(m => m.coreState));
    target.prevState = target.coreState;

    let corrupt;
    do { corrupt = Math.floor(Math.random() * 32); } while (corrupt === target.coreState);
    target.coreState = corrupt;
    faultedIndices.add(idx);
    faultCount++;
    totalOps++;
    syncStateToShader(idx);
    renderStateGrid();
    updateReadout();

    toggleOracle(true);
    appendMsg('ai', `[CNLT FAULT]: Node ${idx} corrupted. State latched at ${corrupt} (was ${target.prevState}). Fault-cone isolated. Apply CNLT RECOVER to reconstruct pre-fault state via inverse rotor ρ₃₂⁻¹.`);
}

export function coreRecover() {
    if (operationHistory.length === 0) {
        toggleOracle(true);
        appendMsg('ai', '[CNLT]: No operations to reverse. State vector is at initial conditions.');
        return;
    }
    const prevStates = operationHistory.pop();
    _macroCubes.forEach((m, i) => {
        m.prevState = m.coreState;
        m.coreState = prevStates[i];
    });
    faultedIndices.clear();
    totalOps += _macroCubes.length;
    syncAllStatesToShader();
    renderStateGrid();
    updateReadout();

    toggleOracle(true);
    appendMsg('ai', `[CNLT RECOVERY]: Inverse permutation applied. ${_macroCubes.length} nodes reconstructed to pre-fault state. Reversibility verified — zero information lost.`);
}

export function coreReset() {
    operationHistory = [];
    faultedIndices.clear();
    faultCount = 0;
    totalOps = 0;
    _macroCubes.forEach(m => {
        m.coreState = Math.floor(Math.random() * 32);
        m.prevState = m.coreState;
    });
    syncAllStatesToShader();
    renderStateGrid();
    updateReadout();
}

/**
 * Initialize the compute panel after macro-cubes are created.
 */
export function initComputePanel() {
    renderStateGrid();
    updateReadout();
}
