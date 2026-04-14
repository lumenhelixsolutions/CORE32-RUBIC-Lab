# CORE-32 R.U.B.I.C. Laboratory v4.0

**Reversible Universal Binary Information Computer — Interactive Research Interface**

A browser-based laboratory for exploring the CORE-32 architecture: a 32-state reversible computing framework defined over ℤ₃₂, featuring heterogeneous lattice tessellations, a 512D GPU-accelerated S-Box, and a live state computer that demonstrates δ₃₂ phase duality, rotor permutations, and CNLT fault-tolerant verification.

> © 2025–2026 Christopher G. Phillips (Raziel Ali) — [Lumen Helix](https://lumenhelix.com)
> Licensed under CC BY-NC (Non-commercial educational use only)

---

## Quick Start

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/CORE32-RUBIC-Lab.git
cd CORE32-RUBIC-Lab

# Serve (any static server works)
npx serve .
# or
python3 -m http.server 8000
```

Open `http://localhost:8000` in a modern browser. No build step required.

## Features

### Four Interactive Modes

| Mode | Name | Description |
|------|------|-------------|
| M1 | **Cauldron D₈×ℤ₂** | 10-state permutation on four-vesica diagram. Rotor L = (2 3 4 6 5 8 7 9) |
| M2 | **Triality D₆×ℤ₂** | Seed of Life with 3-cycle pair operators τ₁=(2 5), τ₂=(4 9), τ₃=(6 3) |
| M3 | **A₂ Lattice** | Flower of Life with Generalized Commutation Theorem verification |
| M4 | **512D GPU S-Box** | 13,000+ instanced Rubik's cubies with real-time Cayley-Dickson shader hashing |

### CORE-32 State Computer

Each of the 196 macro-cubes holds a real ℤ₃₂ state. Operations include:

- **δ₃₂ Phase Dual** — x ⊕ 16 involution (self-inverse, proving reversibility)
- **ρ Rotor Step** — 8-cycle Cauldron permutation on state digits
- **Commutation Verification** — proves ρ₃(δ₃₂(x)) = δ₃₂(ρ₃(x)) across all nodes
- **CNLT Fault Injection** — corrupts a node, isolates the fault cone
- **CNLT Recovery** — reconstructs pre-fault state via inverse permutation stack

### Telemetry Controls

- Mutation rate, twist speed, wave amplitude/frequency
- **Glyph Clock (Hz)** — controls Unicode iteration speed (0 = frozen, 60 = max volatility)
- Three topology modes: Planar Manifold, Hex Beehive, Origami RAM

### Oracle AI

Optional Gemini API integration for contextual analysis of the lattice state.

## Project Structure

```
CORE32-RUBIC-Lab/
├── index.html              # HTML shell (markup only)
├── css/
│   └── styles.css          # All styling
├── js/
│   ├── main.js             # Entry point — boot, tabs, slider wiring
│   ├── config.js           # Shared mutable state & constants
│   ├── algebra.js          # δ₃₂, rotor maps, ρₘ, commutation math
│   ├── colormap.js         # Turbo colormap, state→color mapping
│   ├── state-engine.js     # CORE-32 state computer & grid renderer
│   ├── oracle.js           # Gemini API client & chat panel
│   ├── svg-modes.js        # SVG visualizations (Modes 1–3)
│   ├── texture-atlas.js    # 4096-glyph Unicode texture generation
│   ├── topology.js         # Planar / Beehive / Origami layouts
│   ├── orbit-controls.js   # Manual spherical orbit camera
│   └── sbox-renderer.js    # Three.js scene, shader injection, animation loop
├── docs/
│   └── ARCHITECTURE.md     # Technical deep-dive
├── LICENSE
├── .gitignore
└── README.md
```

## Architecture

The system is structured as ES modules with zero build dependencies:

```
THREE.js (global)
    │
    ├── config.js ─────────── shared state (no deps)
    ├── algebra.js ────────── pure math (no deps)
    ├── colormap.js ───────── pure functions (no deps)
    │
    ├── oracle.js ─────────── imports config
    ├── svg-modes.js ──────── standalone
    ├── orbit-controls.js ─── standalone
    ├── texture-atlas.js ──── uses THREE global
    ├── topology.js ───────── imports config
    │
    ├── state-engine.js ───── imports config, algebra, colormap, oracle
    ├── sbox-renderer.js ──── imports config, colormap, topology,
    │                          texture-atlas, orbit-controls, state-engine
    │
    └── main.js ───────────── entry point, imports all modules
```

## Key Mathematical Objects

| Symbol | Definition | Role |
|--------|-----------|------|
| δ₃₂(x) | (x + 16) mod 32 ≡ x ⊕ 16 | Canonical phase dual involution |
| L | (2 3 4 6 5 8 7 9) | 8-cycle Cauldron rotor |
| M | {0, 1} | Membrane — topological boundary |
| ρₘ(x) | m·x mod 2ⁿ | Global rotor permutation |
| (A,B)(C,D) | (AC−D*B, DA+BC*) | 512D Cayley-Dickson multiplication |

## Browser Requirements

- Modern browser with WebGL support
- ES module support (Chrome 61+, Firefox 60+, Safari 11+, Edge 16+)
- Optional: Gemini API key for Oracle features

## References

1. Phillips, C.G. (2025–2026). *Architectural Tessellation and Hyperdimensional Constraint Dynamics within the CORE-32 R.U.B.I.C. Framework*. LumenHelix Technical Report v4.0.
2. Phillips, C.G. *Minimal Finite Permutation Representations with Triality-Type Symmetry from Circle-Packing Lattice Truncations*.
3. Bennett, C.H. (1973). *Logical Reversibility of Computation*. IBM J. Res. Dev.
4. Landauer, R. (1961). *Irreversibility and Heat Generation in the Computing Process*. IBM J. Res. Dev.
5. Baez, J.C. (2002). *The Octonions*. Bull. Amer. Math. Soc. 39, 145–205.
