# CORE32-RUBIC-Lab

<p align="center">
  <img src="docs/assets/logo.svg" alt="CORE32-RUBIC-Lab logo" width="160">
</p>

<h3 align="center">Reversible. Auditable. Alive.</h3>

<p align="center">Browser laboratory for the CORE-32 reversible computing architecture.</p>

<p align="center">
  <a href="https://lumenhelixsolutions.github.io/CORE32-RUBIC-Lab/">Launch Page</a>
  <span> · </span>
  <a href="https://github.com/lumenhelixsolutions/CORE32-RUBIC-Lab">GitHub</a>
  <span> · </span>
  <a href="https://lumenhelix.com">LumenHelix</a>
</p>

---

CORE32-RUBIC-Lab renders the CORE-32 reversible computing framework in the browser: 32-state lattice tessellations, a 512D Cayley-Dickson S-Box, and a live state computer that proves phase duality and commutation theorems with no build step.

## Why CORE32-RUBIC-Lab

- **See reversibility.** Every operation is self-inverse or invertible, making state transitions auditable by construction.
- **Run instantly.** Open index.html from any static server — no transpiler, bundler, or cloud dependency.
- **Extend safely.** Modular ES modules and unit tests let you modify math or rendering without breaking the whole lab.

## Quick start

### macOS / Linux

```bash
git clone https://github.com/lumenhelixsolutions/CORE32-RUBIC-Lab.git
cd CORE32-RUBIC-Lab
git clone https://github.com/lumenhelixsolutions/CORE32-RUBIC-Lab.git
cd CORE32-RUBIC-Lab
npx serve .
```

### Windows (PowerShell)

```powershell
git clone https://github.com/lumenhelixsolutions/CORE32-RUBIC-Lab.git
Set-Location CORE32-RUBIC-Lab
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

> Tested on Windows 11, macOS Sonoma, Ubuntu 22.04/24.04, and modern mobile browsers.

## Features

| Feature | What it gives you |
|---------|-------------------|
| Four interactive modes | Cauldron D8xZ2, Triality D6xZ2, A2 lattice, and a 512D GPU-accelerated S-Box with 13,000+ instanced cubies. |
| Live state computer | Demonstrates delta-32 phase duality, rotor permutations, commutation verification, and CNLT fault recovery. |
| Zero build dependencies | Runs from any static server with ES modules and a global THREE.js include — no bundler required. |
| Tested core | Vitest unit tests cover algebra, state-engine, topology, colormap, and config modules. |

## Architecture

```
index.html  ->  THREE.js renderer
                ->  algebra.js  ->  state-engine.js
                ->  renderer.js  ->  oracle.js
                ->  Vitest unit tests
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

## License

Released under the Creative Commons Attribution-NonCommercial 4.0 International License. Commercial use requires written permission.

---

<p align="center">
  <sub>CORE32-RUBIC-Lab is a <a href="https://lumenhelix.com">LumenHelix</a> project — Applied Symbolic Dynamics & Reversible Computation.</sub>
</p>
