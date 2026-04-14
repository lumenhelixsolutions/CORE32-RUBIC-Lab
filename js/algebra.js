/**
 * algebra.js — CORE-32 ℤ₃₂ Algebraic Operations
 *
 * Implements the foundational algebra of the CORE-32 architecture:
 *   - δ₃₂(x) = x ⊕ 16  (canonical phase dual involution)
 *   - L = (2 3 4 6 5 8 7 9) (8-cycle Cauldron rotor)
 *   - ρₘ(x) = m·x mod 2ⁿ  (global rotor permutation)
 */

// The 8-cycle rotor L = (2 3 4 6 5 8 7 9)
// Forward: each digit maps to its successor in the cycle
const ROTOR_FWD = new Map([
    [2, 3], [3, 4], [4, 6], [6, 5],
    [5, 8], [8, 7], [7, 9], [9, 2]
]);

// Inverse: each digit maps to its predecessor in the cycle
const ROTOR_INV = new Map([
    [3, 2], [4, 3], [6, 4], [5, 6],
    [8, 5], [7, 8], [9, 7], [2, 9]
]);

/**
 * δ₃₂(x) = x ⊕ 16 — the canonical phase dual map (involution).
 * Partitions ℤ₃₂ into 16 paired channels. Self-inverse: δ(δ(x)) = x.
 */
export function delta32(x) {
    return (x ^ 16) & 31;
}

/**
 * ρₘ(x) = m·x mod 32 — global rotor permutation on ℤ₃₂.
 * For odd m, this is a bijection (permutation).
 */
export function rhoM(x, m) {
    return (x * m) & 31;
}

/**
 * Apply the 8-cycle rotor L to a single decimal digit.
 * Membrane digits {0, 1} are fixed points.
 * @param {number} d - decimal digit (0-9)
 * @param {boolean} inverse - if true, apply L⁻¹
 * @returns {number} permuted digit
 */
export function rotorDigit(d, inverse = false) {
    const map = inverse ? ROTOR_INV : ROTOR_FWD;
    return map.has(d) ? map.get(d) : d;
}

/**
 * Apply the Cauldron rotor to a ℤ₃₂ state.
 * Extracts the last decimal digit, permutes it through L,
 * and reconstructs the state.
 */
export function applyRotorToState(s) {
    const digit = s % 10;
    const prefix = s - digit;
    return (prefix + rotorDigit(digit, false)) & 31;
}

/**
 * Apply the inverse rotor L⁻¹ to a ℤ₃₂ state.
 */
export function applyInvRotorToState(s) {
    const digit = s % 10;
    const prefix = s - digit;
    return (prefix + rotorDigit(digit, true)) & 31;
}

/**
 * Verify the Generalized Commutation Theorem for a single state x:
 *   ρₘ(δ₃₂(x)) = δ₃₂(ρₘ(x))
 * @param {number} x - state in ℤ₃₂
 * @param {number} m - odd multiplier (default 3)
 * @returns {boolean} true if commutation holds
 */
export function verifyCommutation(x, m = 3) {
    const lhs = rhoM(delta32(x), m);
    const rhs = delta32(rhoM(x, m));
    return lhs === rhs;
}

/**
 * Triality pair operators for the D₆×ℤ₂ module (Mode 2).
 */
export const TRIALITY_PAIRS = [
    [2, 5], // τ₁
    [4, 9], // τ₂
    [6, 3], // τ₃
];

/**
 * Mode 1: Cauldron rotor digit sequence.
 */
export const CAULDRON_DIGITS = ['2', '3', '4', '6', '5', '8', '7', '9'];

/**
 * Mode 2: Seed of Life digit sequence.
 */
export const SEED_DIGITS = ['2', '4', '5', '6', '9', '3'];
