/**
 * svg-modes.js — SVG Visualizations for Modes 1–3
 *
 * Mode 1: Cauldron D₈×ℤ₂ (four-vesica, 8-cycle rotor)
 * Mode 2: Seed of Life D₆×ℤ₂ (triality 3-cycle)
 * Mode 3: Flower of Life / A₂ Lattice (E₆ shadow mapping)
 */

import { CAULDRON_DIGITS, SEED_DIGITS } from './algebra.js';
import { toggleOracle, appendMsg, removeLoading, fetchGemini } from './oracle.js';

let m1Offset = 0;
let m2Offset = 0;

// --- MODE 1: Cauldron ---

export function rotateMode1() {
    m1Offset = (m1Offset + 1) % 8;
    for (let i = 0; i < 8; i++) {
        document.getElementById(`m1-${i}`).textContent =
            CAULDRON_DIGITS[(i - m1Offset + 8) % 8];
    }
}

// --- MODE 2: Seed of Life ---

export function initSeedOfLife() {
    const svg = document.getElementById('seed-svg');
    const R = 80;
    for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3 - Math.PI / 2;
        const cx = R * Math.cos(angle);
        const cy = R * Math.sin(angle);

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', cx);
        circle.setAttribute('cy', cy);
        circle.setAttribute('r', R);
        circle.setAttribute('class', 'sacred-circle');
        circle.style.stroke = 'rgba(45,212,168,0.3)';
        svg.appendChild(circle);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', cx * 1.5);
        text.setAttribute('y', cy * 1.5);
        text.setAttribute('class', 'digit-node');
        text.setAttribute('id', `m2-${i}`);
        text.style.fill = '#6ee7b7';
        text.textContent = SEED_DIGITS[i];
        svg.appendChild(text);
    }
}

export function rotateMode2() {
    m2Offset = (m2Offset + 1) % 6;
    for (let i = 0; i < 6; i++) {
        document.getElementById(`m2-${i}`).textContent =
            SEED_DIGITS[(i - m2Offset + 6) % 6];
    }
}

// --- MODE 3: Flower of Life ---

export function initFlowerOfLife() {
    const svg = document.getElementById('flower-svg');
    const R = 50;
    const centers = [{ x: 0, y: 0 }];

    for (let i = 0; i < 6; i++) {
        centers.push({
            x: R * Math.cos(i * Math.PI / 3),
            y: R * Math.sin(i * Math.PI / 3),
        });
    }
    for (let i = 0; i < 12; i++) {
        const angle = i * Math.PI / 6;
        const dist = i % 2 === 0 ? 2 * R : R * Math.sqrt(3);
        centers.push({
            x: dist * Math.cos(angle),
            y: dist * Math.sin(angle),
        });
    }

    centers.forEach((pos, idx) => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', pos.x);
        circle.setAttribute('cy', pos.y);
        circle.setAttribute('r', R);
        circle.setAttribute('class', 'sacred-circle');
        circle.setAttribute('id', `f3-circle-${idx}`);
        circle.style.stroke = 'rgba(167,139,250,0.25)';
        svg.appendChild(circle);
    });

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', 0);
    text.setAttribute('y', 0);
    text.setAttribute('class', 'membrane-node');
    text.style.fill = 'var(--accent-violet)';
    text.style.fontSize = '14px';
    text.textContent = '{0,1}';
    svg.appendChild(text);
}

export async function generateE6Shadow() {
    toggleOracle(true);
    appendMsg('user', 'EXECUTE: E₆ SHADOW MAPPING ON A₂ LATTICE');
    appendMsg('loading');
    const data = await fetchGemini(
        'Generate 19 hex colors and 1 sentence insight for E6 root system shadow lattice mapping onto 19 Flower of Life centers. The colors should reflect E6 Dynkin diagram weight-space spectral ordering.',
        true,
        {
            type: 'OBJECT',
            properties: {
                colors: { type: 'ARRAY', items: { type: 'STRING' } },
                insight: { type: 'STRING' },
            },
        }
    );
    removeLoading();
    if (data && data.colors) {
        for (let i = 0; i < 19 && i < data.colors.length; i++) {
            const c = document.getElementById(`f3-circle-${i}`);
            if (c) {
                c.style.fill = data.colors[i];
                c.style.fillOpacity = '0.5';
                c.style.stroke = data.colors[i];
            }
        }
        appendMsg('ai', `[MAPPING APPLIED]: ${data.insight}`);
    } else {
        appendMsg('ai', '[SYS_ERR]: E₆ mapping failed. Verify API key or try again.');
    }
}
