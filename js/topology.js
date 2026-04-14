/**
 * topology.js — Structural Topology Layouts
 *
 * Computes target positions for the 196 macro-cubes across
 * three structural fold modes:
 *   - PLANAR:  14×14 flat grid
 *   - BEEHIVE: Hexagonal staggered close-packing
 *   - ORIGAMI: 4 stacked RAM banks of 7×7
 */

import { config } from './config.js';

const MACRO_SIZE = 10;

/**
 * Calculate target positions for all macro-cubes.
 * @param {string} type - 'PLANAR' | 'BEEHIVE' | 'ORIGAMI'
 * @param {Array} macroCubes - array of MacroCube instances
 */
export function calculateTopologyTargets(type, macroCubes) {
    macroCubes.forEach((macro, i) => {
        let tx, ty, tz, gx, gz;

        if (type === 'PLANAR') {
            gx = i % 14;
            gz = Math.floor(i / 14);
            tx = (gx - 7) * MACRO_SIZE;
            ty = 0;
            tz = (gz - 7) * MACRO_SIZE;
        } else if (type === 'BEEHIVE') {
            gx = i % 14;
            gz = Math.floor(i / 14);
            tx = (gx - 7) * MACRO_SIZE + (gz % 2 === 0 ? MACRO_SIZE / 2 : 0);
            ty = 0;
            tz = (gz - 7) * (MACRO_SIZE * 0.866);
        } else if (type === 'ORIGAMI') {
            const layer = Math.floor(i / 49);
            const rem = i % 49;
            gx = rem % 7;
            gz = Math.floor(rem / 7);
            tx = (gx - 3.5) * MACRO_SIZE;
            ty = (layer - 1.5) * (MACRO_SIZE * 3.5);
            tz = (gz - 3.5) * MACRO_SIZE;
        }

        macro.gridX = gx;
        macro.gridZ = gz;
        macro.targetX = tx;
        macro.targetY = ty;
        macro.targetZ = tz;
    });
}

/**
 * Set the active topology and update UI toggle buttons.
 */
export function setTopology(type, macroCubes) {
    config.currentTopology = type;
    document.getElementById('btn-planar').classList.toggle('active', type === 'PLANAR');
    document.getElementById('btn-beehive').classList.toggle('active', type === 'BEEHIVE');
    document.getElementById('btn-origami').classList.toggle('active', type === 'ORIGAMI');
    calculateTopologyTargets(type, macroCubes);
}
