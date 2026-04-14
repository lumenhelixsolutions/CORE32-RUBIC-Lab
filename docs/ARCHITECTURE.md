# Architecture — CORE-32 R.U.B.I.C. Lab

## Module Dependency Graph

```
                    ┌─────────────┐
                    │  THREE.js   │  (global, loaded via <script>)
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
  ┌─────▼─────┐    ┌──────▼──────┐    ┌──────▼──────┐
  │ config.js  │    │ algebra.js  │    │ colormap.js │
  │ (state)    │    │ (pure math) │    │ (pure fn)   │
  └──┬──┬──┬──┘    └──┬──────┬──┘    └──┬──────┬──┘
     │  │  │          │      │          │      │
     │  │  │    ┌─────▼──┐   │    ┌─────▼──┐   │
     │  │  └────▶oracle  │   │    │texture │   │
     │  │       │  .js   │   │    │atlas.js│   │
     │  │       └──┬─────┘   │    └──┬─────┘   │
     │  │          │         │       │         │
     │  │    ┌─────▼─────────▼───────┼─────────▼──┐
     │  │    │     state-engine.js                 │
     │  │    │  (ℤ₃₂ computer, grid, operations)  │
     │  │    └────────────┬────────────────────────┘
     │  │                 │
     │  ├──────┐    ┌─────▼────────────────────────┐
     │  │      │    │      sbox-renderer.js        │
     │  │      │    │  (Three.js scene, shader,    │
     │  │      │    │   MacroCube, animation loop) │
     │  │      │    └─────────┬────────────────────┘
     │  │      │              │
  ┌──▼──▼──┐ ┌▼──────────┐ ┌─▼───────────────┐
  │topology│ │orbit-ctrl  │ │  svg-modes.js   │
  │  .js   │ │    .js     │ │ (Modes 1-3 SVG) │
  └────────┘ └────────────┘ └─────────────────┘
                    │
              ┌─────▼─────┐
              │  main.js   │  ← entry point
              │ (boot/tabs │
              │  /wiring)  │
              └────────────┘
```

## Data Flow

### Boot Sequence

```
User clicks INITIALIZE CORE
  → bootSystem() in main.js
    → Stores API key in config
    → Shows app shell, hides modal
    → initSeedOfLife() + initFlowerOfLife()
    → initCanvas() → creates Three.js scene
      → 196 MacroCubes created (each with coreState ∈ ℤ₃₂)
      → bindStateEngine() links state-engine to mesh
      → requestAnimationFrame(animateField)
    → initComputePanel() renders the state grid
```

### Animation Loop (per frame)

```
animateField()
  ├─ Update shader uniforms (u_time, u_glyphRate)
  ├─ For each MacroCube:
  │   ├─ Smooth-interpolate position toward topology target
  │   ├─ Compute topological wave (sin superposition)
  │   ├─ Maybe trigger random Rubik's twist (cfgMut probability)
  │   ├─ Animate ongoing twist quaternions
  │   └─ For each of 27 cubies:
  │       ├─ Apply twist transform if in active layer
  │       ├─ Set world position (base + wave)
  │       ├─ Compute color: baseColor → wave blend → state tint
  │       └─ Write to InstancedMesh matrix/color buffers
  └─ Render scene
```

### Shader Pipeline

```
Vertex Shader (per cubie instance):
  hyperSeed (per-instance attribute)
    → hash(hyperSeed + floor(u_time * u_glyphRate))
      → volatility ∈ [0, 4096)
        → (shiftX, shiftY) = tile coordinates in 64×64 atlas
          → vUv remapped to specific glyph tile
```

### State Computer

```
196 macro-cubes × 1 ℤ₃₂ state each

Operations:
  δ₃₂(x) = x ⊕ 16          Involution (self-inverse)
  ρ(x)   = rotor L step     8-cycle permutation on last digit
  ρₘ(x)  = m·x mod 32       Global rotor (used in commutation)

Verification:
  ∀x: ρ₃(δ₃₂(x)) = δ₃₂(ρ₃(x))    Commutation Theorem

CNLT Fault Model:
  Inject: corrupt random node, push state to history stack
  Recover: pop history stack → exact pre-fault reconstruction
  Visual: faulted nodes pulse red in state grid
```

## Key Design Decisions

1. **ES Modules, No Build Step** — All files use native `import`/`export`.
   Serves directly from any static file server. No webpack, no bundler.

2. **THREE.js as Global** — Loaded via `<script>` tag (not importable as ESM
   from CDN). All modules that need THREE reference the global `window.THREE`.

3. **Config as Mutable Singleton** — `config.js` exports a single object.
   Sliders mutate it directly; the animation loop reads it each frame.
   Simple, no reactive framework needed.

4. **Manual Orbit Controls** — `THREE.OrbitControls` requires a separate
   CDN import. Replaced with a 60-line spherical orbit implementation.

5. **Manual Turbo Colormap** — Polynomial approximation replaces the full
   D3 dependency. Only the colormap was needed; no reason to load 500KB of D3.

6. **State→Shader Feedback** — When CORE-32 operations change a node's state,
   `syncStateToShader()` writes new `hyperSeed` values to the instanced buffer,
   causing the GPU to show different glyph tiles deterministically.

## File Sizes (approximate)

| File | Lines | Purpose |
|------|-------|---------|
| index.html | ~270 | Markup shell |
| css/styles.css | ~614 | All styling |
| js/main.js | ~90 | Boot, tabs, wiring |
| js/config.js | ~20 | Shared state |
| js/algebra.js | ~100 | Pure math |
| js/colormap.js | ~50 | Color functions |
| js/oracle.js | ~130 | Gemini API |
| js/svg-modes.js | ~130 | SVG visualizations |
| js/state-engine.js | ~200 | State computer |
| js/sbox-renderer.js | ~270 | Three.js engine |
| js/orbit-controls.js | ~70 | Camera controls |
| js/texture-atlas.js | ~60 | Glyph atlas |
| js/topology.js | ~60 | Layout math |
