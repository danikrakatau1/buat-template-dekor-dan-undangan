# Stage #9.9.2B — Runtime Artwork Swap

## Status
Implemented as the first live runtime swap from simplified hero SVG artwork to generated engraving WebP artwork while preserving stable layer IDs and the Stage #9.8 hybrid Pixi/DOM pipeline.

## Swapped stable IDs
- `landscape-java-engraving-01` → generated sepia tropical mountain/valley engraving.
- `hero-joglo-sepia-01` → generated detailed carved Javanese joglo artwork.
- `floral-bottom-burgundy-01` → generated botanical burgundy/ivory/olive foreground arrangement.

Stable IDs intentionally remain unchanged so the editor, variation locks, timeline targets and regression rules continue to work.

## Runtime transport
The generated WebP preview assets are stored as small base64 chunks and assembled into data URLs by `runtime-artwork-pack.js`. This is a connector-safe transport for the #9.9.2B integration prototype and works in both DOM `<img>` rendering and PixiJS texture loading.

The original SVG files remain in the repository and are recorded as `fallbackSrc` in the manifest. Stage #9.9.3 should replace the embedded preview transport with higher-resolution optimized static WebP/AVIF files once the visual composition is approved.

## Composition retune
The engraving landscape is now significantly more visible, legacy tree frames and side florals are deliberately suppressed, the detailed joglo is smaller and lower, and the new botanical foreground is used as the dominant floral frame. Haze/grain intensity is reduced to avoid washing out the engraving detail.

## Compatibility
`fidelity.system` / project `fidelity.mode` intentionally remain `hd-vector-layered` for Stage #9.8 hybrid renderer compatibility. New metadata `artworkMode: generated-engraving-raster-v1` identifies the raster artwork path.

## Remaining P0 gaps
The carved arch, gunungan, paper surface, side tree accents and optional side florals still use the previous asset generation. These are the next quality targets after validating this live swap.
