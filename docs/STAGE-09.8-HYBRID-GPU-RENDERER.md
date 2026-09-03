# Stage #9.8 — Hybrid GPU Renderer Integration

## Status
Implemented on `main` as an additive hybrid rendering backend. The existing Scene JSON, editor, variation, validation and export pipeline remain intact.

## Primary runtime
- PixiJS 8.20.0: WebGL fidelity renderer for artwork/image layers.
- GSAP 3.15.0: idle motion, drift, sway, breathe and float on GPU scene objects.
- Konva 10.3.2: non-destructive editor selection overlay.

## Auxiliary runtime adapters
- SVG.js 3.2.8: `svg-live` layer adapter.
- Lottie Web 5.13.0: `lottie` layer adapter.
- Rive Canvas 2.42.0: `rive` layer adapter.

Auxiliary libraries are lazy-loaded only when a matching layer kind exists, so normal fidelity covers do not pay their download cost.

## Render strategy
The DOM renderer remains the source-of-truth/fallback. On fidelity scenes, Stage #9.8 mounts a transparent PixiJS canvas above the scene and renders image artwork on WebGL. DOM image layers become invisible hit proxies only after their Pixi textures load successfully. Text, buttons and editor controls remain DOM-based and editable.

If PixiJS or a texture fails to load, the DOM artwork remains visible automatically.

## Fidelity behavior
- Stable layer IDs and transforms are reused directly from Scene JSON.
- Fidelity role order is preserved on the GPU scene graph.
- Artwork receives restrained depth-aware pointer parallax.
- GSAP applies slow decorative motion without replacing the existing timeline semantics.
- Landscape/tree/joglo layers use multiply blending; haze uses screen blending.
- `prefers-reduced-motion` disables GPU idle animation.

## Editor behavior
Konva runs only as an overlay. It mirrors the currently selected DOM layer rectangle and does not replace the existing VisualEditor data model.

## Why hybrid instead of a destructive rewrite
This allows visual fidelity to move to a GPU renderer without throwing away the stable V1 engine/editor/export architecture. The renderer can be rolled back per scene and the DOM fallback remains production-safe.

## Next fidelity requirement
Renderer capability is no longer the primary blocker. The largest remaining fidelity gap is source artwork quality. Replace the current simplified SVG hero assets with high-detail engraving/raster art plates (WebP/AVIF where appropriate), then tune GPU material grading against the target reference.
