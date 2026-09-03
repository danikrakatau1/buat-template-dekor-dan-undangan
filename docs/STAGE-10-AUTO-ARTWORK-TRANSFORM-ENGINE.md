# Stage #10 — Auto Artwork Transform Engine

## Status
Implemented as one integrated post-V1 pipeline covering #10.1 through #10.8.

## Scope
The engine converts a user-supplied source image into a controlled wedding-artwork candidate pipeline. It does not rely on destructive browser shaders to invent carving detail. Instead, it separates source analysis, composition rules, transform-provider orchestration, decor injection, logical layer extraction, QA, Scene JSON generation, and Studio runtime preview.

## #10.1 Source Analyzer
- Browser-side image decode and compact canvas analysis.
- Captures dimensions, aspect/orientation, luminance, saturation, edge density, approximate horizon, subject center, negative-space direction, and a protected text-safe area.

## #10.2 Preset Engine
Built-in presets: Vintage Engraving, Javanese Heritage, Royal Botanical, Sakura Engraving, Tropical Sepia, and Luxury Stationery. Presets own palette, detail/line-density intent, texture/atmosphere strength, and decor families.

## #10.3 Transform Pipeline
`transformArtwork()` exposes a provider contract rather than embedding secrets in the browser. A generative backend can be connected with:

```js
window.weddingArtworkProvider = {
  name: 'my-image-provider',
  async transform(payload, { signal }) {
    return { compositeSrc, layers };
  }
};
```

The payload contains source analysis, structural locks, selected preset, textless/layered output intent, and production format preferences. If no provider is connected, the engine uses a source-preserving fallback rather than pretending an AI transform occurred.

## #10.4 Decor Injection
Preset-aware curated decor is placed around the protected text region using the existing heritage asset library. Javanese presets can inject carved arch, gunungan, trees, and botanical foreground. This stage is deterministic and remains usable even without an AI backend.

## #10.5 Layer Extraction
Provider-supplied layers are normalized into the Studio's role/depth contract. A flat provider result becomes a safe background layer plus separately injected decor. This is logical extraction unless the configured provider returns true segmented layers.

## #10.6 Quality Gate
Checks output availability, source resolution, edge structure, protected text area, usable layer sources, and provider/fallback state. It produces pass/warn/fail, a numeric score, issue/warning lists, and a retry recommendation.

## #10.7 Studio Integration
The right-side Studio panel provides image upload, preset selection, provider state, source-analysis summary, selected composition, layer count, QA score, and an `AUTO CREATE ARTWORK` action. Successful runs are converted to Scene JSON, mounted into the existing editor/engine, scheduled through decor motion, and replayed with the existing intro system.

## #10.8 Production Regression Contract
Each generated project records engine version, all eight stage IDs, source analysis, composition locks, provider mode, QA report, responsive parallax limits, and safe text area. The engine deliberately marks provider-less runs as fallback/warn instead of calling them generative output.

## Core files
- `src/artwork/auto-artwork-transform-engine.js`
- `src/stage10-auto-artwork.js`
- `src/stage10-auto-artwork.css`

## Architectural rule
AI/image transformation creates the artwork. Pixi/GSAP only animate and present the artwork. Runtime Sobel/emboss carving is not part of this pipeline.

## Production backend boundary
A real image-to-image model/API is still an external dependency. This repository now has the complete browser orchestration/provider boundary, deterministic fallback, Scene JSON builder, and Studio integration; it does not ship a hidden model endpoint or expose API credentials in client code.
