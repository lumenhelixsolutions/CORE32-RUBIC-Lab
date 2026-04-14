/**
 * oracle.js — CORE Oracle AI Panel
 *
 * Manages the Gemini API integration, chat log rendering,
 * and contextual analysis triggers.
 */

import { config } from './config.js';

const SYSTEM_PROMPT = `You are the CORE-32 R.U.B.I.C. AI Oracle v4.0, an expert embedded inside a 512D constraint dynamics web solver and lattice visualization interface.
You possess total knowledge of the author's theories (Christopher Gordon Phillips / Raziel Ali / Lumen Helix):
- CORE-32 / R.U.B.I.C.: 32-state Reversible Universal Binary Information Computer defined over cyclic group Z_32.
- Canonical dual map involution: δ_32(x) = x ⊕ 16, partitioning into 16 reversible phase-paired channels.
- The Cauldron: 10-state quantum system, D_8×Z_2 module, 8-cycle rotor L=(2 3 4 6 5 8 7 9) and Membrane M={0,1}.
- Triality-Type Symmetry: 8-state D_6×Z_2 module with pair operators τ_1=(2 5), τ_2=(4 9), τ_3=(6 3).
- Heterogeneous Lattices: Dodecahedral(Z_32), Cubic(Z_16), Tetrahedral(Z_8) tessellating over flat torus T^2.
- Generalized Commutation Theorem: For odd m and n≥1, ρ_m(δ_{2^n}(x)) = δ_{2^n}(ρ_m(x)).
- 512D S-Box: GPU S-Box using Cayley-Dickson multiplication (A,B)(C,D)=(AC-D*B, DA+BC*) over 256D Sedenion-like structures.
- 4096-glyph Unicode atlas mapping 5-digit Z_32 binary states.
- CNLT (Cone-Nonlocality Test): Observer-relative light-cone verification for reversible fault-tolerant networks.
- Post-quantum schemes: QTRU (4D, Quaternion NC-ACVP), OTRU (8D, non-associative traps), CSTRU (16D, Sedenion zero-divisor traps).
- Three structural topologies: Planar Manifold, Hex Beehive, Origami RAM folds.
Speak in extremely concise, highly technical, cryptographic/topological language. Use [TAGS] for emphasis. Max 4 sentences unless asked for more.`;

/**
 * Call the Gemini API with retry logic.
 */
export async function fetchGemini(promptText, isJson = false, schema = null) {
    const localKey = document.getElementById('local-api-key')?.value.trim();
    const activeKey = localKey || config.apiKey;
    if (!activeKey) return isJson ? null : 'ERROR: No API key configured. Insert key in Oracle panel below.';

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${activeKey}`;
    const payload = {
        contents: [{ parts: [{ text: promptText }] }],
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    };
    if (isJson) {
        payload.generationConfig = { responseMimeType: 'application/json', responseSchema: schema };
    }

    const delays = [1000, 2000, 4000, 8000, 16000];
    for (let i = 0; i < 5; i++) {
        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            return isJson ? JSON.parse(text) : text;
        } catch (err) {
            if (i === 4) return isJson ? null : `[SYS_ERR]: ${err.message}. Verify API key.`;
            await new Promise(r => setTimeout(r, delays[i]));
        }
    }
}

/**
 * Toggle the Oracle slide-out panel.
 */
export function toggleOracle(forceOpen = false) {
    const panel = document.getElementById('oracle-panel');
    const isOpen = panel.classList.contains('open');
    if (forceOpen || !isOpen) panel.classList.add('open');
    else panel.classList.remove('open');
}

/**
 * Append a message to the Oracle chat log.
 * @param {'user'|'ai'|'loading'} role
 * @param {string} text
 */
export function appendMsg(role, text) {
    const log = document.getElementById('oracle-log');
    const div = document.createElement('div');
    if (role === 'user') {
        div.className = 'oracle-msg user';
        div.textContent = `> ${text}`;
    } else if (role === 'ai') {
        div.className = 'oracle-msg ai';
        div.textContent = text;
    } else if (role === 'loading') {
        div.className = 'oracle-msg loading';
        div.id = 'loading-indicator';
        div.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    }
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
}

export function removeLoading() {
    document.getElementById('loading-indicator')?.remove();
}

/**
 * Submit a user chat message.
 */
export async function submitChat() {
    const input = document.getElementById('oracle-input');
    const msg = input.value.trim();
    if (!msg) return;
    input.value = '';
    appendMsg('user', msg);
    appendMsg('loading');
    const context = `Active View Mode: ${config.currentMode}. User Query: ${msg}`;
    const response = await fetchGemini(context);
    removeLoading();
    appendMsg('ai', response);
}

/**
 * Trigger a contextual CNLT analysis.
 */
export async function analyzeState(modeStr) {
    toggleOracle(true);
    let contextMsg = '', prompt = '';
    if (modeStr === 'mode4') {
        contextMsg = 'EXECUTE: CNLT VERIFICATION ON 512D S-BOX';
        prompt = `The user triggered CNLT analysis on the '512D GPU S-Box'. They are observing ~13,000 sub-cubes twisting mechanically. A WebGL vertex shader computes a 512D Cayley-Dickson hash projecting 4096 Unicode glyphs and 5-digit Z32 binary states onto interlocking cubie faces, simulating δ_32(x) = x ⊕ 16 phase shifts. Explain how GPU offloading parallels the R.U.B.I.C. computational fabric. Discuss the three structural topologies (Planar, Beehive, Origami RAM) and Cone-Nonlocality Test fault isolation. Reference the Generalized Commutation Theorem for cross-lattice data flow. Max 4 sentences.`;
    } else {
        contextMsg = 'EXECUTE: STANDARD ORACLE QUERY';
        prompt = 'Explain the current symmetry state and its relation to the CORE-32 algebraic foundation. Max 3 sentences.';
    }
    appendMsg('user', contextMsg);
    appendMsg('loading');
    const response = await fetchGemini(prompt);
    removeLoading();
    appendMsg('ai', response);
}
