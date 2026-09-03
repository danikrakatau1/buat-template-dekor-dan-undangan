# Stage #4 — Layer & Scene Engine

Stage #4 turns every scene into a deterministic composition of canonical visual layers.

## Canonical stack

- L0 `base` — solid/gradient/static procedural background
- L1 `dynamic-bg` — slideshow/video/Ken Burns target host
- L2 `decor-back` — batik, silhouettes, back ornaments
- L3 `ambient` — particles, dust, stars, petals
- L4 `atmosphere` — glow, vignette, grain, overlays
- L5 `decor-main` — gunungan / hero decorative objects
- L6 `media` — images/video/gallery media
- L7 `content` — headings, names, body, dates
- L8 `decor-front` — foreground floral/frame/depth decor
- L9 `interaction` — buttons and interactive controls
- L10 `floating` — music/nav/toasts/lightbox controls

## Rules

1. JSON layer `role` resolves to one canonical host.
2. Each host owns ordering; child `z` is local to its host.
3. Foreground/ambient/decor layers do not block interaction.
4. Scene atmosphere is generated as a dedicated L4 host.
5. Procedural scene backgrounds are generated in L0.
6. Scene metadata exposes id/type/preset for future editor selection.
7. Renderer remains data-driven; template JSON stays the source of truth.

## Stage #4 additions

- `src/engine/layers/layer-system.js`
- `src/engine/scenes/scene-composer.js`
- canonical host rendering in `basic-renderer.js`
- procedural SVG gunungan placeholder upgraded from triangles
- dedicated atmosphere effects for glow, vignette, and grain
- separate `stage4.css` composition layer

## Next

Stage #5 adds the actual reusable Motion & Decor Engine: motion presets, parallax/depth transforms, decor animation, richer particle behavior, slideshow/Ken Burns, and interaction motion.
