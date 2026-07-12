# CORE32-RUBIC-Lab

<p align="center">
  <a href="https://lumenhelix.com">
    <img src="docs/assets/lumenhelix-logo.svg" alt="LumenHelix Solutions" width="180">
  </a>
</p>

<h3 align="center">Browser laboratory for the CORE-32 reversible computing architecture</h3>

<p align="center">
  <a href="https://lumenhelixsolutions.github.io/CORE32-RUBIC-Lab/">
    <img src="https://img.shields.io/badge/Launch_Page-CORE32-RUBIC-Lab-00D4FF?style=flat-square&logo=githubpages&logoColor=white" alt="Launch Page">
  </a>
  <a href="https://lumenhelix.com">
    <img src="https://img.shields.io/badge/Built_by-LumenHelix-7C3AED?style=flat-square" alt="Built by LumenHelix">
  </a>
  <img src="https://img.shields.io/badge/license-CC-BY-NC-4.0-8A95A8?style=flat-square" alt="License">
</p>

---

**CORE32-RUBIC-Lab** is part of the [LumenHelix Solutions](https://lumenhelix.com) portfolio — applied symbolic dynamics & reversible computation for deterministic, traceable AI systems.

CORE32-RUBIC-Lab is the LumenHelix interactive research interface for the CORE-32 reversible computing framework. It renders 32-state lattice tessellations, a 512D Cayley-Dickson S-Box, and a live state computer that proves phase duality and commutation theorems in the browser with no build step.

## Why this exists

- **See reversibility.** Every operation is self-inverse or invertible, making state transitions auditable by construction.
- **Run instantly.** Open index.html from any static server — no transpiler, bundler, or cloud dependency.
- **Extend safely.** Modular ES modules and unit tests let you modify math or rendering without breaking the whole lab.

## Quick start

Install and run CORE32-RUBIC-Lab in under two minutes.

### macOS / Linux

```bash
# Clone
git clone https://github.com/lumenhelixsolutions/CORE32-RUBIC-Lab.git
cd CORE32-RUBIC-Lab

# Install & run
git clone https://github.com/lumenhelixsolutions/CORE32-RUBIC-Lab.git
cd CORE32-RUBIC-Lab
npx serve .
```

### Windows (PowerShell)

```powershell
# Clone
git clone https://github.com/lumenhelixsolutions/CORE32-RUBIC-Lab.git
Set-Location CORE32-RUBIC-Lab

# Install & run
git clone https://github.com/lumenhelixsolutions/CORE32-RUBIC-Lab.git
Set-Location CORE32-RUBIC-Lab
npx serve .
```

### Windows (Git Bash / WSL)

```bash
git clone https://github.com/lumenhelixsolutions/CORE32-RUBIC-Lab.git
cd CORE32-RUBIC-Lab
git clone https://github.com/lumenhelixsolutions/CORE32-RUBIC-Lab.git
cd CORE32-RUBIC-Lab
python3 -m http.server 8000
```

> **Device note:** CORE32-RUBIC-Lab is tested on Windows 11, macOS Sonoma, Ubuntu 22.04/24.04, and modern mobile browsers.

## Full documentation

Visit the launch page for architecture, API reference, and deployment guides:  
**https://lumenhelixsolutions.github.io/CORE32-RUBIC-Lab/**

## Features

| Feature | What it gives you |
|---------|-------------------|
| Four interactive modes | Cauldron D8xZ2, Triality D6xZ2, A2 lattice, and a 512D GPU-accelerated S-Box with 13,000+ instanced cubies. |
| Live state computer | Demonstrates delta-32 phase duality, rotor permutations, commutation verification, and CNLT fault recovery. |
| Zero build dependencies | Runs from any static server with ES modules and a global THREE.js include — no bundler required. |
| Tested core | Vitest unit tests cover algebra, state-engine, topology, colormap, and config modules. |

## Architecture at a glance

```
CORE32-RUBIC-Lab/
├── index.html      HTML shell and THREE.js loader
├── css/            Lab styling
├── js/             ES modules: algebra, state-engine, renderer, oracle
├── tests/          Vitest unit tests
└── docs/           Deep-dive architecture notes
```

## Development

```bash
# Serve locally (no build step)
npx serve .

# Run tests
npm test
```

## Roadmap

- [ ] Extended oracle AI integrations beyond Gemini
- [ ] Exportable audit packets for every state transition
- [ ] Parametric topology presets and recording exports

## Support & consulting

Need deterministic AI systems with full traceability? LumenHelix builds reversible computation kernels, governance layers, and end-to-end AI integrations.

- **Website:** https://lumenhelix.com
- **Services:** AI diagnostics, B.Y.O. support packages, governance audits
- **Research:** TEN² kernel, R.U.B.I.C. boundary discipline, C.O.R.E. constraint lens

## License

Released under the Creative Commons Attribution-NonCommercial 4.0 International License.

---

<p align="center">
  <sub>Engineered by <a href="https://lumenhelix.com">LumenHelix Solutions</a> — Applied Symbolic Dynamics & Reversible Computation.</sub>
</p>
