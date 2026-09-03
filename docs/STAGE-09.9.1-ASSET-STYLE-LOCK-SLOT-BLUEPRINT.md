# Stage #9.9.1 — Asset Style Lock + Asset Slot Blueprint

## Status
Implemented on `main` as the production contract for the Real Engraving Artwork Pack.

## Why this stage exists
Stage #9.8 proved the renderer stack is no longer the main fidelity blocker. The largest remaining gap is source artwork quality. The current simplified vector artwork must be replaced by a consistent, textless, high-detail engraving asset system.

## Locked visual direction
The target style is:

**Javanese Heritage + Vintage Engraving + Luxury Stationery**

Mandatory visual traits:
- antique cream / warm sepia paper
- fine engraving / etching linework and hatching
- natural mountain depth
- natural tree framing
- detailed joglo architecture with wood and carved-detail cues
- restrained carved Javanese ornament
- small gunungan emblem rather than a giant hero object
- botanically believable florals and foliage
- muted burgundy / ivory / olive / restrained gold palette
- clear central negative space for editable DOM typography

Explicitly forbidden:
- flat clipart flowers
- simple geometric joglo forms
- neon glow
- giant gunungan
- synthetic gradients used as hero artwork
- oversaturated botanical colors
- baked text inside artwork

## Runtime contract
- PixiJS/WebGL remains the fidelity renderer.
- GSAP remains the motion backend.
- Text/buttons remain DOM/editable.
- Hero artwork should primarily be WebP/AVIF/PNG; SVG is reserved for ornaments unless the vector artwork is genuinely complex and handcrafted.
- Every artwork asset is textless.
- Isolated elements require transparent backgrounds.
- Asset IDs and slots are stable and deterministic.

## Quality targets
- background long edge: >= 3200 px
- hero artwork long edge: >= 2200 px
- foreground artwork long edge: >= 1800 px
- overlay long edge: >= 1800 px
- target display quality: 2x DPR
- no visible upscale
- cleaned transparent edges
- no baked typography or CTA

## Slot blueprint
The first Royal Joglo Garden engraving pack defines 27 production slots spanning:
- backgrounds
- nature / tree framing
- architecture
- ornaments
- botanicals
- overlays

Required core slots include:
- sky engraving
- mountain far / mid
- horizon haze
- left / right heritage trees
- main joglo
- top carved arch
- gunungan emblem
- bottom floral center
- side floral left / right

Optional slots add palms, shrubs, joglo shadow/highlight/detail passes, corner ornaments, extra floral clusters and material overlays.

## Files
- `src/art-direction/heritage-art-style-lock.js`
- `src/art-direction/heritage-asset-slot-blueprint.js`

## Acceptance gate for Stage #9.9.2+
A generated/imported asset is not accepted unless it:
1. maps to a declared slot,
2. is textless,
3. respects transparency requirements,
4. avoids the forbidden visual language,
5. meets target resolution for its class,
6. preserves central typography readability,
7. works as an independent compositing layer rather than a flattened invitation screenshot.

## Next
**Stage #9.9.2 — Core Artwork Production Pack**

Produce the first real assets for the required slots, optimize to WebP/AVIF where appropriate, update the manifest to `ready`, then mount them through the Stage #9.8 Pixi fidelity renderer.
