# Stage #7 — Starter Theme Packs

## Goal
Prove that one Wedding Visual Engine can create clearly different invitation art directions without duplicating renderer logic.

## Packs
### Jawa Luxury
- warm brown / antique gold palette
- batik procedural back layer
- gunungan main decor
- ornamental foreground frame
- mist / glow / vignette / grain
- subtle float + breathe + parallax

### Ocean Romantic
- deep teal / aqua palette
- procedural glow horizon
- mist layer
- two procedural wave depths
- layered parallax and slow sway
- soft aquatic atmosphere

### Celestial Night
- midnight indigo / lavender palette
- seeded star field
- cosmic glow
- ornamental orbit-like frame
- mist foreground
- star twinkle + slow drift

## Architecture
Theme packs produce Scene JSON-compatible project objects. The renderer remains shared.

`theme pack -> project config -> scene/layer renderer -> motion/decor controllers -> live preview`

This is the foundation for Stage #8 Theme / Preset Rules and later Stage #9 Auto Template Generator.
