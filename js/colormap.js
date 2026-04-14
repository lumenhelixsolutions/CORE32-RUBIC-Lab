/**
 * colormap.js — Color Mapping Utilities
 *
 * Provides a polynomial approximation of the Turbo colormap
 * and state-to-color mapping for the ℤ₃₂ state grid.
 */

/**
 * Turbo colormap — polynomial approximation.
 * @param {number} t - normalized value in [0, 1]
 * @returns {{ r: number, g: number, b: number }} RGB in [0, 1]
 */
export function turboColor(t) {
    t = Math.max(0, Math.min(1, t));
    const r = Math.max(0, Math.min(1,
        0.13572 + t * (4.6153 + t * (-42.66 + t * (132.13 + t * (-152.95 + t * 56.67))))));
    const g = Math.max(0, Math.min(1,
        0.09140 + t * (2.1847 + t * (4.694 + t * (-35.76 + t * (40.98 + t * (-15.41)))))));
    const b = Math.max(0, Math.min(1,
        0.1067 + t * (12.989 + t * (-60.58 + t * (109.98 + t * (-88.09 + t * 26.62))))));
    return { r, g, b };
}

/**
 * Map a topological wave value to a turbo color.
 * Domain: [-8, 8] → [0, 1] normalized.
 */
export function waveToColor(val) {
    const t = (val + 8) / 16;
    return turboColor(t);
}

/**
 * Map a ℤ₃₂ state to an HSL color string for the state grid.
 * Phase 0–15 (cold): blues/greens. Phase 16–31 (warm): oranges/reds.
 * This mirrors the δ₃₂ pairing structure visually.
 */
export function stateToGridColor(s) {
    const hue = (s / 32) * 300 + 180;
    const sat = 70 + (s % 4) * 8;
    const lit = 50 + (s < 16 ? 10 : -5);
    return `hsl(${hue % 360}, ${sat}%, ${lit}%)`;
}
