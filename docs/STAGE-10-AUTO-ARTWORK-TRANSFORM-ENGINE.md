# Stage #10 — Auto Artwork Transform Engine

## Current checkpoint
**Stage #10.9 — MASTER TRANSFORM PROMPT V1 + Automatic Theme Adapter**

The engine now treats generative artwork creation as a provider-backed transformation step instead of trying to manufacture engraving detail with destructive browser shaders.

## Pipeline
Source Image → Source Analyzer → Composition Resolver → Master Transform Prompt V1 → Automatic Theme Adapter → Scene Adapter → Provider Transform → Decor Injection → Layer Extraction → Quality Gate → Scene JSON → Pixi / Motion Runtime.

## MASTER TRANSFORM PROMPT V1
The official provider prompt locks the following visual direction:
- premium vintage engraved wedding illustration
- antique etching and cross-hatching
- toile de jouy / chinoiserie-inspired botanical framing
- parchment / ivory wedding stationery character
- warm ivory, cream, taupe, antique brown, olive, dusty rose, muted burgundy and blush palette
- botanical framing from top/left/right and refined floral foreground
- protected breathing space and readable center
- engraved clouds, landscape texture, fine contour lines, paper grain and controlled vintage imperfections
- source subject / landmark preservation
- no random text, logo, watermark, photorealism, cartoon or glossy digital-painting appearance

The negative prompt is stored separately and is sent to providers as `payload.prompt.negative`.

## Automatic theme adapters
`ARTWORK_PRESETS` map automatically to theme adapters:
- Vintage Engraving → `classic-antique-engraving`
- Javanese Heritage → `javanese-heritage`
- Royal Botanical → `royal-botanical`
- Sakura Engraving → `japanese-sakura`
- Tropical Sepia → `tropical-heritage`
- Luxury Stationery → `luxury-stationery`

Each adapter supplies theme-specific botanical motifs, cultural motifs, subject-preservation rules and restrained accent colors.

For the Japanese adapter, Mount Fuji is explicitly preserved as the central landmark when detected/present in the source instruction context; sakura branches, subtle Japanese geometry, dusty-pink blossoms, dark branches, ivory flowers and restrained olive foliage are the visual adaptation language.

## Scene adapter
The source analyzer feeds prompt variables automatically:
- source orientation
- estimated horizon percentage
- estimated subject center
- negative-space zone
- protected text-safe rectangle
- subject lock
- silhouette lock
- horizon lock
- composition lock

This means the provider receives one complete prompt assembled from:
`MASTER BASE + THEME ADAPTER + SCENE ADAPTER + NEGATIVE PROMPT`.

## Provider contract
A connected provider implements:
`window.weddingArtworkProvider.transform(payload, { signal })`

The payload now includes:
- `version: 10.9.0`
- `promptVersion: MASTER-TRANSFORM-PROMPT-V1`
- `prompt.positive`
- `prompt.negative`
- `prompt.themeAdapter`
- `prompt.scene`
- source analysis
- composition locks
- preset metadata
- output contract

If no provider is connected, the Studio still performs source analysis, prompt assembly, decor rules, layer normalization, QA and Scene JSON construction, but uses the source-preserving fallback. It does not falsely claim that a generative image transformation occurred.

## QA contract
The quality gate now also verifies that both the positive and negative master prompts exist in the transform result. Provider absence is a warning rather than a false success.

## Studio integration
The Stage #10.9 panel displays:
- provider state
- source analysis
- resolved composition
- automatic theme adapter
- prompt version
- layer count
- QA score
- engine version

`window.weddingAutoArtworkPrompt` exposes the last assembled prompt for inspection/testing.

## Design rule
Browser shaders are not the primary method for creating engraving detail. Generative/source artwork must contain the real visual information; Pixi/GSAP remain responsible for motion, parallax, depth and restrained atmosphere after the artwork has been produced.
