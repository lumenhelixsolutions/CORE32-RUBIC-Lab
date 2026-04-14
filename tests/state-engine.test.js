import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock oracle.js before importing state-engine
vi.mock('../js/oracle.js', () => ({
  toggleOracle: vi.fn(),
  appendMsg: vi.fn(),
}));

// Mock colormap.js
vi.mock('../js/colormap.js', () => ({
  stateToGridColor: vi.fn((s) => `hsl(${s * 10}, 70%, 50%)`),
}));

import {
  bindStateEngine,
  faultedIndices,
  coreApplyDelta,
  coreApplyRotor,
  coreReset,
  coreRecover,
  coreInjectFault,
  coreVerifyCommutation,
} from '../js/state-engine.js';
import { toggleOracle, appendMsg } from '../js/oracle.js';
import { delta32, applyRotorToState } from '../js/algebra.js';

/**
 * Create a minimal mock DOM environment for state-engine.
 * state-engine.js reads/writes specific elements via getElementById.
 */
function setupMockDOM() {
  const elements = {};
  const createElement = (tag) => {
    const el = {
      tagName: tag.toUpperCase(),
      textContent: '',
      style: {},
      className: '',
      dataset: {},
      title: '',
      children: [],
      classList: {
        toggle: vi.fn(),
        add: vi.fn(),
        remove: vi.fn(),
      },
      appendChild: vi.fn((child) => {
        el.children.push(child);
        return child;
      }),
      onclick: null,
    };
    return el;
  };

  // Create DOM elements that state-engine expects
  const ids = ['cr-ops', 'cr-entropy', 'cr-balance', 'cr-faults', 'cr-rev', 'state-grid'];
  ids.forEach(id => {
    elements[id] = createElement('div');
  });

  // state-grid starts empty
  elements['state-grid'].children = [];

  globalThis.document = {
    getElementById: vi.fn((id) => elements[id] || null),
    createElement: vi.fn((tag) => createElement(tag)),
  };

  return elements;
}

/**
 * Create mock macro-cubes with initial random states in ℤ₃₂.
 */
function createMockMacroCubes(count = 196) {
  return Array.from({ length: count }, (_, i) => ({
    index: i,
    coreState: i % 32,
    prevState: i % 32,
    cubies: [{ id: i * 27 }, { id: i * 27 + 1 }],
  }));
}

/**
 * Create a mock mesh field for shader sync.
 */
function createMockMeshField(cubeCount = 196) {
  const totalCubies = cubeCount * 27;
  return {
    geometry: {
      getAttribute: vi.fn(() => ({
        array: new Float32Array(totalCubies),
        needsUpdate: false,
      })),
    },
  };
}

describe('state-engine', () => {
  let elements;
  let macroCubes;
  let meshField;

  beforeEach(() => {
    vi.clearAllMocks();
    elements = setupMockDOM();
    macroCubes = createMockMacroCubes();
    meshField = createMockMeshField();
    bindStateEngine(macroCubes, meshField);
    faultedIndices.clear();
  });

  // -------------------------------------------------------------------
  // bindStateEngine
  // -------------------------------------------------------------------
  describe('bindStateEngine', () => {
    it('binds without error', () => {
      expect(() => bindStateEngine(macroCubes, meshField)).not.toThrow();
    });
  });

  // -------------------------------------------------------------------
  // coreApplyDelta
  // -------------------------------------------------------------------
  describe('coreApplyDelta', () => {
    it('applies delta32 to all macro-cube states', () => {
      const originalStates = macroCubes.map(m => m.coreState);
      coreApplyDelta();
      macroCubes.forEach((m, i) => {
        expect(m.coreState).toBe(delta32(originalStates[i]));
      });
    });

    it('saves previous state before applying delta', () => {
      const originalStates = macroCubes.map(m => m.coreState);
      coreApplyDelta();
      macroCubes.forEach((m, i) => {
        expect(m.prevState).toBe(originalStates[i]);
      });
    });

    it('is an involution: applying twice restores original states', () => {
      const originalStates = macroCubes.map(m => m.coreState);
      coreApplyDelta();
      coreApplyDelta();
      macroCubes.forEach((m, i) => {
        expect(m.coreState).toBe(originalStates[i]);
      });
    });

    it('updates DOM readout after applying', () => {
      coreApplyDelta();
      expect(elements['cr-ops'].textContent).not.toBe('');
    });
  });

  // -------------------------------------------------------------------
  // coreApplyRotor
  // -------------------------------------------------------------------
  describe('coreApplyRotor', () => {
    it('applies rotor to all macro-cube states', () => {
      const originalStates = macroCubes.map(m => m.coreState);
      coreApplyRotor();
      macroCubes.forEach((m, i) => {
        expect(m.coreState).toBe(applyRotorToState(originalStates[i]));
      });
    });

    it('saves previous state before applying rotor', () => {
      const originalStates = macroCubes.map(m => m.coreState);
      coreApplyRotor();
      macroCubes.forEach((m, i) => {
        expect(m.prevState).toBe(originalStates[i]);
      });
    });

    it('keeps all states in ℤ₃₂', () => {
      coreApplyRotor();
      macroCubes.forEach(m => {
        expect(m.coreState).toBeGreaterThanOrEqual(0);
        expect(m.coreState).toBeLessThanOrEqual(31);
      });
    });
  });

  // -------------------------------------------------------------------
  // coreVerifyCommutation
  // -------------------------------------------------------------------
  describe('coreVerifyCommutation', () => {
    it('opens the Oracle panel', () => {
      coreVerifyCommutation();
      expect(toggleOracle).toHaveBeenCalledWith(true);
    });

    it('posts verification messages to Oracle', () => {
      coreVerifyCommutation();
      expect(appendMsg).toHaveBeenCalledWith('user', expect.stringContaining('VERIFY'));
      expect(appendMsg).toHaveBeenCalledWith('ai', expect.stringContaining('COMMUTATION'));
    });

    it('reports all nodes passing when states are valid ℤ₃₂', () => {
      coreVerifyCommutation();
      // All states 0–31 satisfy commutation
      expect(appendMsg).toHaveBeenCalledWith('ai', expect.stringContaining('VERIFIED'));
    });
  });

  // -------------------------------------------------------------------
  // coreInjectFault
  // -------------------------------------------------------------------
  describe('coreInjectFault', () => {
    it('corrupts exactly one node', () => {
      const originalStates = macroCubes.map(m => m.coreState);
      coreInjectFault();
      const changed = macroCubes.filter((m, i) => m.coreState !== originalStates[i]);
      expect(changed.length).toBe(1);
    });

    it('adds the faulted index to faultedIndices', () => {
      expect(faultedIndices.size).toBe(0);
      coreInjectFault();
      expect(faultedIndices.size).toBe(1);
    });

    it('opens Oracle with fault message', () => {
      coreInjectFault();
      expect(toggleOracle).toHaveBeenCalledWith(true);
      expect(appendMsg).toHaveBeenCalledWith('ai', expect.stringContaining('CNLT FAULT'));
    });

    it('sets the corrupted state to a different value', () => {
      coreInjectFault();
      const faultedIdx = [...faultedIndices][0];
      // prevState should differ from coreState
      expect(macroCubes[faultedIdx].coreState).not.toBe(macroCubes[faultedIdx].prevState);
    });
  });

  // -------------------------------------------------------------------
  // coreRecover
  // -------------------------------------------------------------------
  describe('coreRecover', () => {
    it('restores state after coreApplyDelta', () => {
      const originalStates = macroCubes.map(m => m.coreState);
      coreApplyDelta();
      coreRecover();
      macroCubes.forEach((m, i) => {
        expect(m.coreState).toBe(originalStates[i]);
      });
    });

    it('restores state after fault injection', () => {
      const originalStates = macroCubes.map(m => m.coreState);
      coreInjectFault();
      coreRecover();
      macroCubes.forEach((m, i) => {
        expect(m.coreState).toBe(originalStates[i]);
      });
    });

    it('clears faultedIndices after recovery', () => {
      coreInjectFault();
      expect(faultedIndices.size).toBeGreaterThan(0);
      coreRecover();
      expect(faultedIndices.size).toBe(0);
    });

    it('posts recovery message when there is history', () => {
      coreApplyDelta();
      coreRecover();
      expect(appendMsg).toHaveBeenCalledWith('ai', expect.stringContaining('CNLT RECOVERY'));
    });

    it('posts no-op message when there is no history', () => {
      // Reset first to clear any accumulated history
      coreReset();
      coreRecover();
      expect(appendMsg).toHaveBeenCalledWith('ai', expect.stringContaining('No operations to reverse'));
    });
  });

  // -------------------------------------------------------------------
  // coreReset
  // -------------------------------------------------------------------
  describe('coreReset', () => {
    it('resets all states to random ℤ₃₂ values', () => {
      coreReset();
      macroCubes.forEach(m => {
        expect(m.coreState).toBeGreaterThanOrEqual(0);
        expect(m.coreState).toBeLessThanOrEqual(31);
      });
    });

    it('sets prevState equal to coreState', () => {
      coreReset();
      macroCubes.forEach(m => {
        expect(m.prevState).toBe(m.coreState);
      });
    });

    it('clears faulted indices', () => {
      coreInjectFault();
      coreReset();
      expect(faultedIndices.size).toBe(0);
    });

    it('resets operation count to 0', () => {
      coreApplyDelta();
      coreReset();
      // textContent in real DOM is always a string; in mock it stores
      // whatever value is assigned (number 0 from totalOps).
      expect(Number(elements['cr-ops'].textContent)).toBe(0);
    });
  });
});
