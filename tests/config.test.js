import { describe, it, expect } from 'vitest';
import { config } from '../js/config.js';

// ---------------------------------------------------------------------------
// config — Shared mutable state
// ---------------------------------------------------------------------------
describe('config', () => {
  it('exports a config object', () => {
    expect(config).toBeDefined();
    expect(typeof config).toBe('object');
  });

  // Telemetry defaults
  describe('telemetry defaults', () => {
    it('has mutationRate defaulting to 0.002', () => {
      expect(config.mutationRate).toBe(0.002);
    });

    it('has twistSpeed defaulting to 0.08', () => {
      expect(config.twistSpeed).toBe(0.08);
    });

    it('has waveAmplitude defaulting to 8.0', () => {
      expect(config.waveAmplitude).toBe(8.0);
    });

    it('has waveFrequency defaulting to 2.0', () => {
      expect(config.waveFrequency).toBe(2.0);
    });

    it('has glyphRate defaulting to 12.0', () => {
      expect(config.glyphRate).toBe(12.0);
    });
  });

  // Runtime defaults
  describe('runtime defaults', () => {
    it('has currentMode defaulting to 4', () => {
      expect(config.currentMode).toBe(4);
    });

    it('has currentTopology defaulting to PLANAR', () => {
      expect(config.currentTopology).toBe('PLANAR');
    });

    it('has isCanvasActive defaulting to false', () => {
      expect(config.isCanvasActive).toBe(false);
    });

    it('has animationStarted defaulting to false', () => {
      expect(config.animationStarted).toBe(false);
    });

    it('has globalTime defaulting to 0', () => {
      expect(config.globalTime).toBe(0);
    });
  });

  // API defaults
  describe('API defaults', () => {
    it('has apiKey defaulting to empty string', () => {
      expect(config.apiKey).toBe('');
    });
  });

  // Mutability
  describe('mutability', () => {
    it('allows mutation of telemetry values', () => {
      const original = config.mutationRate;
      config.mutationRate = 0.05;
      expect(config.mutationRate).toBe(0.05);
      config.mutationRate = original; // restore
    });

    it('allows mutation of runtime values', () => {
      const original = config.currentMode;
      config.currentMode = 2;
      expect(config.currentMode).toBe(2);
      config.currentMode = original; // restore
    });
  });
});
