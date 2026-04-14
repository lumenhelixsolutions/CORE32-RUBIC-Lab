import { describe, it, expect } from 'vitest';
import { turboColor, waveToColor, stateToGridColor } from '../js/colormap.js';

// ---------------------------------------------------------------------------
// turboColor — Turbo colormap polynomial approximation
// ---------------------------------------------------------------------------
describe('turboColor', () => {
  it('returns an object with r, g, b properties', () => {
    const color = turboColor(0.5);
    expect(color).toHaveProperty('r');
    expect(color).toHaveProperty('g');
    expect(color).toHaveProperty('b');
  });

  it('clamps output RGB channels to [0, 1]', () => {
    for (let t = 0; t <= 1; t += 0.05) {
      const { r, g, b } = turboColor(t);
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThanOrEqual(1);
      expect(g).toBeGreaterThanOrEqual(0);
      expect(g).toBeLessThanOrEqual(1);
      expect(b).toBeGreaterThanOrEqual(0);
      expect(b).toBeLessThanOrEqual(1);
    }
  });

  it('clamps input t to [0, 1]', () => {
    // t < 0 should behave like t = 0
    const atZero = turboColor(0);
    const belowZero = turboColor(-1);
    expect(belowZero.r).toBe(atZero.r);
    expect(belowZero.g).toBe(atZero.g);
    expect(belowZero.b).toBe(atZero.b);

    // t > 1 should behave like t = 1
    const atOne = turboColor(1);
    const aboveOne = turboColor(2);
    expect(aboveOne.r).toBe(atOne.r);
    expect(aboveOne.g).toBe(atOne.g);
    expect(aboveOne.b).toBe(atOne.b);
  });

  it('produces distinct colors at t=0, t=0.5, and t=1', () => {
    const c0 = turboColor(0);
    const c05 = turboColor(0.5);
    const c1 = turboColor(1);
    // Colors should be different at these points
    expect(c0.r).not.toBeCloseTo(c05.r, 1);
    expect(c0.r).not.toBeCloseTo(c1.r, 1);
  });

  it('t=0 produces a dark color (all channels near zero)', () => {
    const { r, g, b } = turboColor(0);
    // At t=0, all polynomial constant terms are small
    expect(r).toBeLessThan(0.2);
    expect(g).toBeLessThan(0.2);
    expect(b).toBeLessThan(0.2);
  });

  it('returns valid RGB for boundary values', () => {
    for (const t of [0, 0.001, 0.25, 0.5, 0.75, 0.999, 1]) {
      const { r, g, b } = turboColor(t);
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThanOrEqual(1);
      expect(g).toBeGreaterThanOrEqual(0);
      expect(g).toBeLessThanOrEqual(1);
      expect(b).toBeGreaterThanOrEqual(0);
      expect(b).toBeLessThanOrEqual(1);
    }
  });

  it('is a continuous function (nearby inputs produce nearby outputs)', () => {
    const step = 0.01;
    for (let t = 0; t < 1; t += step) {
      const c1 = turboColor(t);
      const c2 = turboColor(t + step);
      // Adjacent samples should not jump more than 0.15 per channel
      expect(Math.abs(c2.r - c1.r)).toBeLessThan(0.15);
      expect(Math.abs(c2.g - c1.g)).toBeLessThan(0.15);
      expect(Math.abs(c2.b - c1.b)).toBeLessThan(0.15);
    }
  });
});

// ---------------------------------------------------------------------------
// waveToColor — Maps wave value [-8, 8] → turbo color
// ---------------------------------------------------------------------------
describe('waveToColor', () => {
  it('returns an object with r, g, b properties', () => {
    const color = waveToColor(0);
    expect(color).toHaveProperty('r');
    expect(color).toHaveProperty('g');
    expect(color).toHaveProperty('b');
  });

  it('maps val=0 to turboColor(0.5)', () => {
    const fromWave = waveToColor(0);
    const fromTurbo = turboColor(0.5);
    expect(fromWave.r).toBeCloseTo(fromTurbo.r, 10);
    expect(fromWave.g).toBeCloseTo(fromTurbo.g, 10);
    expect(fromWave.b).toBeCloseTo(fromTurbo.b, 10);
  });

  it('maps val=-8 to turboColor(0)', () => {
    const fromWave = waveToColor(-8);
    const fromTurbo = turboColor(0);
    expect(fromWave.r).toBeCloseTo(fromTurbo.r, 10);
    expect(fromWave.g).toBeCloseTo(fromTurbo.g, 10);
    expect(fromWave.b).toBeCloseTo(fromTurbo.b, 10);
  });

  it('maps val=8 to turboColor(1)', () => {
    const fromWave = waveToColor(8);
    const fromTurbo = turboColor(1);
    expect(fromWave.r).toBeCloseTo(fromTurbo.r, 10);
    expect(fromWave.g).toBeCloseTo(fromTurbo.g, 10);
    expect(fromWave.b).toBeCloseTo(fromTurbo.b, 10);
  });

  it('produces valid RGB for values across the domain', () => {
    for (let val = -8; val <= 8; val += 0.5) {
      const { r, g, b } = waveToColor(val);
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThanOrEqual(1);
      expect(g).toBeGreaterThanOrEqual(0);
      expect(g).toBeLessThanOrEqual(1);
      expect(b).toBeGreaterThanOrEqual(0);
      expect(b).toBeLessThanOrEqual(1);
    }
  });

  it('normalizes linearly: val=4 maps to t=0.75', () => {
    const fromWave = waveToColor(4);
    const fromTurbo = turboColor(0.75);
    expect(fromWave.r).toBeCloseTo(fromTurbo.r, 10);
    expect(fromWave.g).toBeCloseTo(fromTurbo.g, 10);
    expect(fromWave.b).toBeCloseTo(fromTurbo.b, 10);
  });
});

// ---------------------------------------------------------------------------
// stateToGridColor — Maps ℤ₃₂ state to HSL color string
// ---------------------------------------------------------------------------
describe('stateToGridColor', () => {
  it('returns a valid HSL string', () => {
    const color = stateToGridColor(0);
    expect(color).toMatch(/^hsl\(\d+(\.\d+)?, \d+(\.\d+)?%, \d+(\.\d+)?%\)$/);
  });

  it('returns valid HSL strings for all 32 states', () => {
    for (let s = 0; s < 32; s++) {
      const color = stateToGridColor(s);
      expect(color).toMatch(/^hsl\(/);
      expect(color).toMatch(/%\)$/);
    }
  });

  it('produces distinct colors for different states', () => {
    const colors = new Set();
    for (let s = 0; s < 32; s++) {
      colors.add(stateToGridColor(s));
    }
    // Should have many distinct colors (at least 16, since hue varies)
    expect(colors.size).toBeGreaterThanOrEqual(16);
  });

  it('phase-0 states (0–15) have higher lightness than phase-1 (16–31)', () => {
    // Phase 0: lit = 50 + 10 = 60
    // Phase 1: lit = 50 - 5 = 45
    const phase0Color = stateToGridColor(0);
    const phase1Color = stateToGridColor(16);
    const lit0 = parseFloat(phase0Color.match(/(\d+)%\)$/)[1]);
    const lit1 = parseFloat(phase1Color.match(/(\d+)%\)$/)[1]);
    expect(lit0).toBeGreaterThan(lit1);
  });

  it('hue increases with state value', () => {
    // hue = (s / 32) * 300 + 180
    const hue0 = parseFloat(stateToGridColor(0).match(/hsl\((\d+(\.\d+)?)/)[1]);
    const hue16 = parseFloat(stateToGridColor(16).match(/hsl\((\d+(\.\d+)?)/)[1]);
    // hue at s=0 = 180, hue at s=16 = 330
    expect(hue0).toBeCloseTo(180, 0);
    expect(hue16).toBeCloseTo(330, 0);
  });

  it('saturation varies with s % 4', () => {
    // sat = 70 + (s % 4) * 8
    // s=0: sat=70, s=1: sat=78, s=2: sat=86, s=3: sat=94
    const sat0 = parseFloat(stateToGridColor(0).match(/, (\d+)%,/)[1]);
    const sat1 = parseFloat(stateToGridColor(1).match(/, (\d+)%,/)[1]);
    const sat2 = parseFloat(stateToGridColor(2).match(/, (\d+)%,/)[1]);
    const sat3 = parseFloat(stateToGridColor(3).match(/, (\d+)%,/)[1]);
    expect(sat0).toBe(70);
    expect(sat1).toBe(78);
    expect(sat2).toBe(86);
    expect(sat3).toBe(94);
  });
});
