import { describe, it, expect } from 'vitest';
import { calculateTopologyTargets } from '../js/topology.js';

/**
 * Helper: create mock macroCube objects with the properties that
 * calculateTopologyTargets reads and writes.
 */
function createMockCubes(count = 196) {
  return Array.from({ length: count }, (_, i) => ({
    index: i,
    gridX: undefined,
    gridZ: undefined,
    targetX: undefined,
    targetY: undefined,
    targetZ: undefined,
  }));
}

const MACRO_SIZE = 10; // mirrors the constant in topology.js

// ---------------------------------------------------------------------------
// PLANAR topology — 14×14 flat grid
// ---------------------------------------------------------------------------
describe('calculateTopologyTargets – PLANAR', () => {
  it('sets target positions for all 196 cubes', () => {
    const cubes = createMockCubes();
    calculateTopologyTargets('PLANAR', cubes);
    cubes.forEach(c => {
      expect(c.targetX).toBeDefined();
      expect(c.targetY).toBeDefined();
      expect(c.targetZ).toBeDefined();
    });
  });

  it('places all cubes at y=0 (flat grid)', () => {
    const cubes = createMockCubes();
    calculateTopologyTargets('PLANAR', cubes);
    cubes.forEach(c => {
      expect(c.targetY).toBe(0);
    });
  });

  it('computes grid indices correctly (14-column layout)', () => {
    const cubes = createMockCubes();
    calculateTopologyTargets('PLANAR', cubes);
    // First cube: index 0 → gx=0, gz=0
    expect(cubes[0].gridX).toBe(0);
    expect(cubes[0].gridZ).toBe(0);
    // 14th cube: index 13 → gx=13, gz=0
    expect(cubes[13].gridX).toBe(13);
    expect(cubes[13].gridZ).toBe(0);
    // 15th cube: index 14 → gx=0, gz=1
    expect(cubes[14].gridX).toBe(0);
    expect(cubes[14].gridZ).toBe(1);
    // Last cube: index 195 → gx=13, gz=13
    expect(cubes[195].gridX).toBe(13);
    expect(cubes[195].gridZ).toBe(13);
  });

  it('computes target positions with correct spacing and centering', () => {
    const cubes = createMockCubes();
    calculateTopologyTargets('PLANAR', cubes);
    // Cube 0: gx=0, gz=0 → tx=(0-7)*10=-70, tz=(0-7)*10=-70
    expect(cubes[0].targetX).toBe(-70);
    expect(cubes[0].targetZ).toBe(-70);
    // Cube 7: gx=7, gz=0 → tx=(7-7)*10=0
    expect(cubes[7].targetX).toBe(0);
    // Center-ish cube: index 98 → gx=0, gz=7
    expect(cubes[98].targetZ).toBe(0);
  });

  it('produces a symmetric grid centered around the origin', () => {
    const cubes = createMockCubes();
    calculateTopologyTargets('PLANAR', cubes);
    const xs = cubes.map(c => c.targetX);
    const zs = cubes.map(c => c.targetZ);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minZ = Math.min(...zs);
    const maxZ = Math.max(...zs);
    // Grid should be symmetric: min + max = gx(0)+gx(13) centered at -7
    expect(minX + maxX).toBe(-10); // (-7+6)*10 = range from -70 to 60
    expect(minZ + maxZ).toBe(-10);
  });
});

// ---------------------------------------------------------------------------
// BEEHIVE topology — Hexagonal staggered close-packing
// ---------------------------------------------------------------------------
describe('calculateTopologyTargets – BEEHIVE', () => {
  it('sets target positions for all 196 cubes', () => {
    const cubes = createMockCubes();
    calculateTopologyTargets('BEEHIVE', cubes);
    cubes.forEach(c => {
      expect(c.targetX).toBeDefined();
      expect(c.targetY).toBeDefined();
      expect(c.targetZ).toBeDefined();
    });
  });

  it('places all cubes at y=0', () => {
    const cubes = createMockCubes();
    calculateTopologyTargets('BEEHIVE', cubes);
    cubes.forEach(c => {
      expect(c.targetY).toBe(0);
    });
  });

  it('applies hex stagger (MACRO_SIZE/2 offset) on even rows', () => {
    const cubes = createMockCubes();
    calculateTopologyTargets('BEEHIVE', cubes);
    // Row 0 (gz=0, even): offset = MACRO_SIZE/2 = 5
    // Row 1 (gz=1, odd): no offset
    const cubeRow0Col0 = cubes[0]; // gx=0, gz=0
    const cubeRow1Col0 = cubes[14]; // gx=0, gz=1
    // Row 0: tx = (0-7)*10 + 5 = -65
    expect(cubeRow0Col0.targetX).toBe(-65);
    // Row 1: tx = (0-7)*10 + 0 = -70
    expect(cubeRow1Col0.targetX).toBe(-70);
  });

  it('applies 0.866 vertical spacing factor', () => {
    const cubes = createMockCubes();
    calculateTopologyTargets('BEEHIVE', cubes);
    // Row 0: tz = (0-7)*10*0.866
    // Row 1: tz = (1-7)*10*0.866
    const row0z = cubes[0].targetZ;
    const row1z = cubes[14].targetZ;
    const expectedSpacing = MACRO_SIZE * 0.866;
    expect(row1z - row0z).toBeCloseTo(expectedSpacing, 5);
  });
});

// ---------------------------------------------------------------------------
// ORIGAMI topology — 4 stacked layers of 7×7
// ---------------------------------------------------------------------------
describe('calculateTopologyTargets – ORIGAMI', () => {
  it('sets target positions for all 196 cubes', () => {
    const cubes = createMockCubes();
    calculateTopologyTargets('ORIGAMI', cubes);
    cubes.forEach(c => {
      expect(c.targetX).toBeDefined();
      expect(c.targetY).toBeDefined();
      expect(c.targetZ).toBeDefined();
    });
  });

  it('distributes cubes across 4 layers (49 per layer)', () => {
    const cubes = createMockCubes();
    calculateTopologyTargets('ORIGAMI', cubes);
    const yValues = new Set(cubes.map(c => c.targetY));
    expect(yValues.size).toBe(4);
  });

  it('uses 7×7 grid within each layer', () => {
    const cubes = createMockCubes();
    calculateTopologyTargets('ORIGAMI', cubes);
    // Layer 0: indices 0–48
    // Within layer: rem = i % 49, gx = rem % 7, gz = floor(rem / 7)
    expect(cubes[0].gridX).toBe(0);
    expect(cubes[0].gridZ).toBe(0);
    expect(cubes[6].gridX).toBe(6);
    expect(cubes[6].gridZ).toBe(0);
    expect(cubes[7].gridX).toBe(0);
    expect(cubes[7].gridZ).toBe(1);
    expect(cubes[48].gridX).toBe(6);
    expect(cubes[48].gridZ).toBe(6);
  });

  it('stacks layers vertically with correct spacing', () => {
    const cubes = createMockCubes();
    calculateTopologyTargets('ORIGAMI', cubes);
    // Layer 0: y = (0-1.5)*35 = -52.5
    // Layer 1: y = (1-1.5)*35 = -17.5
    // Layer 2: y = (2-1.5)*35 = 17.5
    // Layer 3: y = (3-1.5)*35 = 52.5
    const layerSpacing = MACRO_SIZE * 3.5;
    expect(cubes[0].targetY).toBeCloseTo(-1.5 * layerSpacing, 5);
    expect(cubes[49].targetY).toBeCloseTo(-0.5 * layerSpacing, 5);
    expect(cubes[98].targetY).toBeCloseTo(0.5 * layerSpacing, 5);
    expect(cubes[147].targetY).toBeCloseTo(1.5 * layerSpacing, 5);
  });

  it('centers each 7×7 layer around x=0 and z=0', () => {
    const cubes = createMockCubes();
    calculateTopologyTargets('ORIGAMI', cubes);
    // gx ranges 0..6, tx = (gx - 3.5) * 10
    // gx=0 → -35, gx=6 → 25. Average = -5
    expect(cubes[0].targetX).toBe(-35);
    expect(cubes[6].targetX).toBe(25);
    expect(cubes[0].targetZ).toBe(-35);
    expect(cubes[42].targetZ).toBe(25); // gz=6
  });
});

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------
describe('calculateTopologyTargets – edge cases', () => {
  it('handles empty array without errors', () => {
    const cubes = [];
    expect(() => calculateTopologyTargets('PLANAR', cubes)).not.toThrow();
    expect(() => calculateTopologyTargets('BEEHIVE', cubes)).not.toThrow();
    expect(() => calculateTopologyTargets('ORIGAMI', cubes)).not.toThrow();
  });

  it('handles a single cube', () => {
    const cubes = createMockCubes(1);
    calculateTopologyTargets('PLANAR', cubes);
    expect(cubes[0].gridX).toBe(0);
    expect(cubes[0].gridZ).toBe(0);
    expect(cubes[0].targetY).toBe(0);
  });

  it('leaves properties undefined for unknown topology type', () => {
    const cubes = createMockCubes(1);
    calculateTopologyTargets('UNKNOWN', cubes);
    // The function doesn't handle unknown types — properties remain undefined
    expect(cubes[0].targetX).toBeUndefined();
  });
});
