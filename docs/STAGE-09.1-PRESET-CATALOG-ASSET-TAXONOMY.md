# Stage 9.1 — Preset Catalog + Asset Taxonomy

Status: LOCKED FOR IMPLEMENTATION

## Objective
Move the studio from procedural-demo visual quality toward high-fidelity layered wedding artwork while keeping the existing Scene → Layer → Motion → Preset architecture.

## Initial preset catalog

### 1. jawa-luxury
DNA: dark brown/black, warm gold, restrained glow, premium Javanese line art.
Primary compositions: centered emblem, carved arch, asymmetric heritage, night-gold.
Asset families: gunungan, carved ornaments, thin frames, warm glow, gold dust, dark paper texture.
Motion profile: luxury-slow.

### 2. jawa-heritage-floral
DNA: cream parchment, sepia engraving, muted gold, burgundy/ivory florals.
Primary compositions: carved arch floral, royal joglo garden, floral pendopo.
Asset families: carved arch, joglo, botanical corners, flower bed, parchment, landscape engraving.
Motion profile: heritage-soft.

### 3. mountain-heritage
DNA: antique landscape engraving, mountain depth, traditional architecture, soft haze.
Primary compositions: mountain joglo, valley pendopo, forest heritage.
Asset families: mountain engraving, tree framing, joglo/pendopo, mist, sunlight haze, foreground flora.
Motion profile: cinematic-depth.

### 4. ocean-elegance
DNA: deep teal/aqua, pearl highlights, layered waves/coral, caustic shimmer.
Primary compositions: horizon pearl, coastal luxury, deep-sea elegant.
Asset families: waves, coral, shells/pearls, mist, underwater glow, caustic overlay.
Motion profile: ocean-drift.

### 5. night-gold-premium
DNA: near-black, warm spotlight, gold accents, minimal couture composition.
Primary compositions: spotlight monogram, gold frame, cinematic dark.
Asset families: gold line frame, dust, bloom, haze, vignette.
Motion profile: night-cinematic.

## Fidelity rule
Core artwork is not generated from primitive SVG alone. High-value hero/environment artwork must come from HD layered assets (SVG or large transparent raster/WebP). Procedural generators remain responsible for atmosphere, glow, grain, mist, particles and secondary motion.

## Required layer order
1. base
2. background
3. environment-back
4. ornament-back
5. hero/architecture
6. content
7. ornament-front
8. foreground-floral
9. atmosphere-front
10. ui/fx

## Asset taxonomy

```txt
assets/
  art/
    backgrounds/{preset}/
    architecture/{joglo,pendopo,gapura}/
    landscapes/{mountain,forest,ocean}/
    ornaments/{gunungan,ukiran,frames,arches,dividers}/
    florals/{corner,side,bottom,garland}/
    nature/{trees,palms,waves,coral,clouds}/
  textures/{paper,grain,wood,gold,stone}/
  overlays/{glow,mist,haze,vignette,light-rays,caustic}/
  particles/{gold-dust,sparkle,petals,bubbles}/
  masks/
  previews/
```

## Naming convention
`{role}-{subject}-{style}-{variant}.{ext}`
Examples:
- `bg-landscape-engraving-01.webp`
- `hero-joglo-sepia-01.webp`
- `orn-gunungan-gold-02.svg`
- `floral-bottom-burgundy-01.webp`
- `overlay-haze-warm-01.webp`
- `fx-grain-paper-01.webp`

## Quality requirements
- Raster hero/background assets: target 3000–5000 px on the long edge.
- Transparent decor/floral: high-resolution WebP/PNG; SVG preferred for line art.
- Avoid baking glow, mist, grain or vignette into hero assets when possible; keep effects separate.
- Every asset requires id, family, preset tags, role, quality tier and default depth.
- Mobile portrait is the primary composition target.

## Mapping by preset

### jawa-luxury
Background: dark-paper / warm-radial / bronze-night.
Hero: gunungan emblem or carved architectural silhouette.
Back decor: thin ukiran/arch.
Front decor: restrained corner floral or line frame.
FX: bronze glow, gold dust, vignette, grain.

### jawa-heritage-floral
Background: cream parchment + engraved landscape.
Hero: joglo/pendopo, gunungan as secondary emblem.
Back decor: carved arch + side carving.
Front decor: burgundy/ivory floral bed and corner florals.
FX: warm haze, paper grain, soft vignette.

### mountain-heritage
Background: mountain/valley engraving.
Hero: joglo/pendopo.
Back decor: trees and distant vegetation.
Front decor: botanical foreground.
FX: mist, sunlight haze, depth vignette.

### ocean-elegance
Background: horizon/underwater gradient artwork.
Hero: wave crest / pearl emblem.
Back decor: distant wave/coral silhouettes.
Front decor: coral/sea flora.
FX: caustic shimmer, bubbles, soft bloom.

### night-gold-premium
Background: deep-black/brown gradient.
Hero: monogram/gunungan/frame.
Front decor: minimal gold ornaments.
FX: spotlight, haze, gold dust, vignette.

## Scene rule target
Cover is first priority, then Couple and Event. Each scene must satisfy:
- readable content hierarchy
- at least 3 visible depth planes
- one focal art object
- one foreground anchor where appropriate
- atmosphere separated from hero artwork
- restrained motion profile

## Stage 9.1 acceptance checklist
- [x] Preset catalog locked
- [x] Asset folder taxonomy locked
- [x] Naming convention locked
- [x] Per-preset asset mapping defined
- [x] Layer-role order defined
- [x] Quality requirements defined
- [x] First implementation target: `jawa-heritage-floral / royal-joglo-garden`

## Next: Stage 9.2
Create the HD asset manifest + fidelity composer. The first art pack will be `royal-joglo-garden`, with slots for parchment, engraved landscape, tree framing, joglo hero, carved arch, gunungan emblem, floral foreground and atmosphere overlays.
