# Stage #9.3 — Real HD Asset Pack + Studio Preview Integration

## Status
Implemented on `main`.

## Goal
Replace the Jawa procedural-demo cover with a real, scalable layered art pack and make `Jawa Luxury` open in Studio using the `Royal Joglo Garden` fidelity composition.

## Real vector asset pack
The first production art pack now contains independent SVG artwork for:
- cream parchment paper
- engraved Java landscape
- left heritage tree frame
- right heritage tree frame
- carved Javanese arch
- sepia joglo hero
- gold gunungan emblem
- left burgundy/ivory floral cluster
- right burgundy/ivory floral cluster
- burgundy/ivory floral foreground bed
- warm haze overlay
- paper grain texture

SVG is used deliberately for the first pack because it remains crisp at mobile, tablet, desktop, retina and export sizes without raster upscaling artifacts.

## Studio integration
`jawa-luxury` now routes through `createRoyalJogloGardenProject()` when selected or mounted in Studio. The project still uses the existing renderer, editor, timeline, parallax and production-export architecture.

The Studio default remains `jawa-luxury`, so the first preview now receives the HD Royal Joglo Garden scene instead of the previous giant procedural gunungan demo.

## Visual hierarchy
The cover is composed as:
1. parchment paper
2. engraved landscape
3. tree framing
4. carved arch
5. joglo architecture
6. small gunungan emblem
7. title and couple names
8. guest block
9. floral side framing
10. floral foreground
11. warm haze and paper grain
12. invitation CTA

## Motion
Motion is restrained and depth-aware:
- landscape slow drift
- tree sway
- joglo rise/breathe
- gunungan soft float
- floral side sway
- foreground float
- warm haze drift
- staged intro reveal

## Compatibility
No renderer rewrite was required. Stage #9.3 continues using the stable L0–L10 engine and the fidelity role aliases introduced in Stage #9.2.

## Next
Stage #9.4 should focus on visual QA against the target references, composition tuning on real mobile viewport sizes, and stronger engraving/floral detail where needed before creating additional Jawa composition variants.
