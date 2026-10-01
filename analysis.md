# MiniFusion Project Analysis

The repository contains a **single‑page web application** that implements a parametric CAD tool called *MiniFusion*.

## Directory structure

| Folder / file | Purpose |
|---------------|---------|
| `fusion_mvp.html` | The only file that must be opened in a browser. It holds an inline `<script>` section that concatenates all `src/*.js` files in order.
| `src/` | Source modules, split into 14 files (00–99). They are *concatenated in ascending numeric order* during the build.
| `threejs/` | Three‑D rendering engine (three.js, OrbitControls, CSG). These are bundled separately as a third‑party library.
| `occt/` | OpenCascade WebAssembly kernel (`opencascade.wasm.wasm`, `opencascade.full.wasm`, `opencascade.full.js`). The project can fall back to a CSG solver when the exact kernel is not available.
| `README.md`, `CHANGELOG.md`, `package.json`, `build.js`, `Server.bat` | Project metadata and build tools.
| `Backup/` | Snapshots of previous successful builds used for regression tests.
| `diff_g_o.txt` | Difference file for verifying the build output.
| `S:	extbackslash Dropbox	extbackslash Fusion2` | Root of the repository.

## Build & development workflow

1. **Edit** a source file in `src/` (never touch `fusion_mvp.html`).
2. Run `node build.js` to concatenate the sources and rebuild `fusion_mvp.html`.
3. Validate that the build is up‑to‑date by running `node build.js --check`. The script will exit with code 1 if changes in `src/` were not reflected in the HTML.
4. Use `Server.bat` (or any static file server) to serve the files at `http://localhost:3000`.
5. For local file access, double‑click `fusion_mvp.html`. It will automatically use the bundled WASM when available.

## Core modules (src files)

| File | Key responsibilities |
|------|-----------------------|
| `00-entete-et-outils.js` | Project metadata, global utilities, UI helpers, constants, and the `APP_VER` marker.
| `10-scene-3d.js` | Three.js setup: camera, renderer, controls, lighting, environment, mirror plane.
| `20-noyau-et-operations-solides.js` | OpenCascade kernel integration; handles exact operations (extrude, cut, fillet, etc.).
| `30-marqueur-temps.js` | Timeline/clock for replaying operations and time‑based controls.
| `40-interface-arbre-props.js` | Tree view of the model, properties panel, selection logic.
| `45-annuler-document.js` | Undo/redo stack for the document (sketches, features, operations).
| `50-esquisse-2d-solveur.js` | 2‑D sketching, constraint solver, SVG export.
| `60-trim-et-souris.js` | Mouse interaction helpers for trim, control points, and drawing.
| `70-extrusion.js` | Extrusion operation UI, distance and “to‑face” logic.
| `75-revolve.js` | Revolution operation, handling axis and angle.
| `80-conges-chanfreins.js` | Chamfer/fillet logic using both CSG and exact OCCT.
| `90-picking-mesure-import.js` | 3‑D picking, measurement, import/export utilities.
| `95-toolbar.js` | Toolbar, shortcuts, and UI commands.
| `96-noyau-occt-tiers-lgpl.js` | Third‑party OpenCascade wrapper (LGPL) – kept intact.
| `97-auto-tests.js` | In‑app regression tests for sketches and constraints.
| `99-init.js` | Bootstrapping – entry point that orchestrates all modules.

## User experience flow

1. **Open** `fusion_mvp.html` → the renderer displays an empty scene.
2. **Create sketches**: use toolbar actions (line, circle, rectangle, etc.). Sketches are stored in `doc.sketches`.
3. **Apply constraints**: the solver checks over 12 constraint types and maintains an internal *health panel*.
4. **Generate features**: extrude, revolve, chamfer, fillet, etc. Each feature is a node in the tree view and triggers a rebuild of the geometry.
5. **Inspect/measure**: pick entities, view 3‑D dimensions, and export to SVG/STEP.
6. **Undo / redo**: the document stack (`doc`) records each change.
7. **Autosave**: on each rebuild, a snapshot is written to `localStorage` so reopening the page restores the last state.

## Key design decisions

- **Single‑file delivery**: All JS lives inside one HTML so that opening the file via `file://` is possible, with dynamic WebAssembly loading.
- **Mirror rendering**: A custom shader provides a real‑time floor reflection, updated only when the camera moves.
- **Performance optimization**: Document hashing (`_docVersion`) triggers rebuilds only when necessary; caching of geometry and view parameters.
- **Test-driven**: `97-auto-tests.js` contains a battery of non‑regression tests that run from the in‑app UI; the build script also enforces that `fusion_mvp.html` is regenerated after any source change.
- **Modular source files**: The numeric prefixes keep the execution order clear and make it trivial to locate new functionality.
- **OpenCascade fall‑back**: When the exact kernel isn’t available (e.g., in file:// mode), the system automatically switches to a CSG implementation.

## Extensions & future work

- Add full STEP import/export via the OCCT WASM.
- Introduce an Electron wrapper (already listed as a dev dependency). It could expose file‑system dialogs and allow offline operation.
- Expand the test suite to cover edge cases such as high‑frequency constraints and very large models.
- Optional: persist user preferences (themes, grid spacing, etc.) in `localStorage`.

---

This document provides an overview of the codebase, the build process, and how the application operates from a developer’s perspective. For specific code‑level inquiries, refer to the individual `src/*.js` modules.