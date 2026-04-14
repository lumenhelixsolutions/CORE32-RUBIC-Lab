import { describe, it, expect } from 'vitest';
import {
  delta32,
  rhoM,
  rotorDigit,
  applyRotorToState,
  applyInvRotorToState,
  verifyCommutation,
  TRIALITY_PAIRS,
  CAULDRON_DIGITS,
  SEED_DIGITS,
} from '../js/algebra.js';

// ---------------------------------------------------------------------------
// delta32 — Phase Dual Involution: δ₃₂(x) = x ⊕ 16
// ---------------------------------------------------------------------------
describe('delta32', () => {
  it('applies XOR with 16 for known values', () => {
    expect(delta32(0)).toBe(16);
    expect(delta32(16)).toBe(0);
    expect(delta32(1)).toBe(17);
    expect(delta32(31)).toBe(15);
    expect(delta32(15)).toBe(31);
  });

  it('is a self-inverse (involution) for all x in ℤ₃₂', () => {
    for (let x = 0; x < 32; x++) {
      expect(delta32(delta32(x))).toBe(x);
    }
  });

  it('always returns a value in [0, 31]', () => {
    for (let x = 0; x < 32; x++) {
      const result = delta32(x);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(31);
    }
  });

  it('maps phase-0 (0–15) to phase-1 (16–31) and vice versa', () => {
    for (let x = 0; x < 16; x++) {
      expect(delta32(x)).toBeGreaterThanOrEqual(16);
    }
    for (let x = 16; x < 32; x++) {
      expect(delta32(x)).toBeLessThan(16);
    }
  });

  it('pairs each element uniquely (bijection)', () => {
    const seen = new Set();
    for (let x = 0; x < 32; x++) {
      seen.add(delta32(x));
    }
    expect(seen.size).toBe(32);
  });

  it('masks to 5 bits even for out-of-range inputs', () => {
    // Values > 31 should be masked by & 31
    expect(delta32(32)).toBe(delta32(0));
    expect(delta32(48)).toBe(delta32(16));
  });
});

// ---------------------------------------------------------------------------
// rhoM — Global Rotor Permutation: ρₘ(x) = m·x mod 32
// ---------------------------------------------------------------------------
describe('rhoM', () => {
  it('returns 0 when x is 0 for any multiplier', () => {
    expect(rhoM(0, 1)).toBe(0);
    expect(rhoM(0, 3)).toBe(0);
    expect(rhoM(0, 7)).toBe(0);
  });

  it('computes m*x mod 32 correctly for known values', () => {
    expect(rhoM(1, 3)).toBe(3);
    expect(rhoM(2, 3)).toBe(6);
    expect(rhoM(10, 3)).toBe(30);
    expect(rhoM(11, 3)).toBe(1); // 33 mod 32
    expect(rhoM(5, 7)).toBe(3); // 35 mod 32
  });

  it('identity when m = 1', () => {
    for (let x = 0; x < 32; x++) {
      expect(rhoM(x, 1)).toBe(x);
    }
  });

  it('is a bijection for odd multipliers', () => {
    for (const m of [1, 3, 5, 7, 9, 11, 13, 15]) {
      const seen = new Set();
      for (let x = 0; x < 32; x++) {
        seen.add(rhoM(x, m));
      }
      expect(seen.size).toBe(32);
    }
  });

  it('is NOT a bijection for even multipliers', () => {
    const seen = new Set();
    for (let x = 0; x < 32; x++) {
      seen.add(rhoM(x, 2));
    }
    expect(seen.size).toBeLessThan(32);
  });

  it('always returns a value in [0, 31]', () => {
    for (let m = 1; m <= 31; m++) {
      for (let x = 0; x < 32; x++) {
        const result = rhoM(x, m);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThanOrEqual(31);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// rotorDigit — 8-cycle rotor L on single digits
// ---------------------------------------------------------------------------
describe('rotorDigit', () => {
  it('follows the forward cycle: 2→3→4→6→5→8→7→9→2', () => {
    const cycle = [2, 3, 4, 6, 5, 8, 7, 9];
    for (let i = 0; i < cycle.length; i++) {
      expect(rotorDigit(cycle[i], false)).toBe(cycle[(i + 1) % cycle.length]);
    }
  });

  it('follows the inverse cycle: 3→2, 4→3, 6→4, 5→6, 8→5, 7→8, 9→7, 2→9', () => {
    const inversePairs = [
      [3, 2], [4, 3], [6, 4], [5, 6],
      [8, 5], [7, 8], [9, 7], [2, 9],
    ];
    for (const [input, expected] of inversePairs) {
      expect(rotorDigit(input, true)).toBe(expected);
    }
  });

  it('fixes membrane digits 0 and 1', () => {
    expect(rotorDigit(0, false)).toBe(0);
    expect(rotorDigit(1, false)).toBe(1);
    expect(rotorDigit(0, true)).toBe(0);
    expect(rotorDigit(1, true)).toBe(1);
  });

  it('forward followed by inverse returns the original digit', () => {
    for (let d = 0; d <= 9; d++) {
      expect(rotorDigit(rotorDigit(d, false), true)).toBe(d);
    }
  });

  it('inverse followed by forward returns the original digit', () => {
    for (let d = 0; d <= 9; d++) {
      expect(rotorDigit(rotorDigit(d, true), false)).toBe(d);
    }
  });

  it('applying forward 8 times returns to start (cycle length 8)', () => {
    for (const start of [2, 3, 4, 6, 5, 8, 7, 9]) {
      let d = start;
      for (let i = 0; i < 8; i++) {
        d = rotorDigit(d, false);
      }
      expect(d).toBe(start);
    }
  });
});

// ---------------------------------------------------------------------------
// applyRotorToState / applyInvRotorToState
// ---------------------------------------------------------------------------
describe('applyRotorToState', () => {
  it('permutes the last decimal digit of a state', () => {
    // State 2: last digit = 2, rotor(2) = 3, so prefix 0 + 3 = 3, masked to ℤ₃₂
    expect(applyRotorToState(2)).toBe(3);
    // State 12: last digit = 2, prefix = 10, 10 + 3 = 13
    expect(applyRotorToState(12)).toBe(13);
  });

  it('keeps results within ℤ₃₂ (0–31)', () => {
    for (let s = 0; s < 32; s++) {
      const result = applyRotorToState(s);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(31);
    }
  });

  it('leaves states with membrane digits (0, 1) unchanged', () => {
    // States ending in 0: 0, 10, 20, 30
    expect(applyRotorToState(0)).toBe(0);
    expect(applyRotorToState(10)).toBe(10);
    expect(applyRotorToState(20)).toBe(20);
    expect(applyRotorToState(30)).toBe(30);
    // States ending in 1: 1, 11, 21, 31
    expect(applyRotorToState(1)).toBe(1);
    expect(applyRotorToState(11)).toBe(11);
    expect(applyRotorToState(21)).toBe(21);
    expect(applyRotorToState(31)).toBe(31);
  });
});

describe('applyInvRotorToState', () => {
  it('is the inverse of applyRotorToState for all ℤ₃₂ states', () => {
    for (let s = 0; s < 32; s++) {
      expect(applyInvRotorToState(applyRotorToState(s))).toBe(s);
    }
  });

  it('applyRotor(applyInvRotor(s)) = s for all states', () => {
    for (let s = 0; s < 32; s++) {
      expect(applyRotorToState(applyInvRotorToState(s))).toBe(s);
    }
  });

  it('keeps results within ℤ₃₂ (0–31)', () => {
    for (let s = 0; s < 32; s++) {
      const result = applyInvRotorToState(s);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(31);
    }
  });
});

// ---------------------------------------------------------------------------
// verifyCommutation — ρₘ(δ₃₂(x)) = δ₃₂(ρₘ(x))
// ---------------------------------------------------------------------------
describe('verifyCommutation', () => {
  it('holds for all x in ℤ₃₂ with default m=3', () => {
    for (let x = 0; x < 32; x++) {
      expect(verifyCommutation(x)).toBe(true);
    }
  });

  it('holds for all x and all odd m in [1, 31]', () => {
    for (let m = 1; m <= 31; m += 2) {
      for (let x = 0; x < 32; x++) {
        expect(verifyCommutation(x, m)).toBe(true);
      }
    }
  });

  it('may fail for even multipliers (not bijections on ℤ₃₂)', () => {
    // Even multipliers are not guaranteed to commute with delta32
    // because ρₘ is not a bijection when m is even.
    // Verify that at least some x fail for m=2.
    let failures = 0;
    for (let x = 0; x < 32; x++) {
      if (!verifyCommutation(x, 2)) failures++;
    }
    expect(failures).toBeGreaterThan(0);
  });

  it('verifies specific known values manually', () => {
    // x=5, m=3: δ₃₂(5)=21, ρ₃(21)=63 mod 32=31; ρ₃(5)=15, δ₃₂(15)=31
    expect(verifyCommutation(5, 3)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Exported Constants
// ---------------------------------------------------------------------------
describe('exported constants', () => {
  it('TRIALITY_PAIRS has 3 pairs', () => {
    expect(TRIALITY_PAIRS).toHaveLength(3);
    TRIALITY_PAIRS.forEach(pair => {
      expect(pair).toHaveLength(2);
      expect(pair[0]).toBeGreaterThanOrEqual(0);
      expect(pair[0]).toBeLessThanOrEqual(9);
      expect(pair[1]).toBeGreaterThanOrEqual(0);
      expect(pair[1]).toBeLessThanOrEqual(9);
    });
  });

  it('CAULDRON_DIGITS has 8 elements matching the rotor cycle', () => {
    expect(CAULDRON_DIGITS).toEqual(['2', '3', '4', '6', '5', '8', '7', '9']);
  });

  it('SEED_DIGITS has 6 elements', () => {
    expect(SEED_DIGITS).toEqual(['2', '4', '5', '6', '9', '3']);
  });

  it('TRIALITY_PAIRS contains expected operator pairs', () => {
    expect(TRIALITY_PAIRS).toEqual([[2, 5], [4, 9], [6, 3]]);
  });
});
