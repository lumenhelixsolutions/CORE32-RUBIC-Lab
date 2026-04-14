/**
 * config.js — Shared mutable state for the CORE-32 R.U.B.I.C. Lab
 * All telemetry sliders and runtime flags live here.
 */

export const config = {
    // Telemetry
    mutationRate: 0.002,
    twistSpeed: 0.08,
    waveAmplitude: 8.0,
    waveFrequency: 2.0,
    glyphRate: 12.0,

    // Runtime
    currentMode: 4,
    currentTopology: 'PLANAR',
    isCanvasActive: false,
    animationStarted: false,
    globalTime: 0,

    // API
    apiKey: '',
};
