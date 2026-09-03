# Stage #6 — Procedural Asset Engine

Status: implemented in `main`.

## Goal
Remove the requirement for a large image asset library at project start. The engine can now generate reusable visual assets at runtime using SVG + CSS while staying theme-color aware.

## Generator Registry
Current generators:

1. `gunungan`
2. `ornament-frame`
3. `wave`
4. `stars`
5. `mist`
6. `batik`
7. `glow`

Registry location:

`src/engine/assets/procedural-assets.js`

## Layer JSON example

```json
{
  "id": "batik-field",
  "kind": "decor",
  "role": "decor-back",
  "asset": {
    "type": "procedural",
    "generator": "batik",
    "variant": "kawung-soft"
  },
  "motion": {
    "parallax": 0.03,
    "decorMotion": "drift"
  }
}
```

The renderer checks the registry and generates inline SVG at runtime. No PNG is required for these assets.

## Seed support
Procedural generators that need randomness can receive a deterministic seed. `stars` currently uses seeded generation so the same seed reproduces the same constellation.

## Stage #6 cover demo
The Jawa cover now uses generated:
- batik back layer
- gunungan hero layer
- mist ambient layer
- ornament foreground frame
- CSS gold-dust ambient particles
- glow/vignette/grain atmosphere

## Why this matters
Stage #7 theme packs can now be assembled from procedural generators instead of requiring a pre-existing asset library. Ocean Romantic can use `wave`, Celestial Night can use `stars`, and Jawa Luxury can use `batik`, `gunungan`, and `ornament-frame` from the same runtime registry.

## Next
Stage #7 — Starter Theme Packs:
- Jawa Luxury
- Ocean Romantic
- Celestial Night

Each pack will define palette, allowed procedural assets, layout rules, motion profile, atmosphere, and responsive intensity.
