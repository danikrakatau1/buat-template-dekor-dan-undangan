# Stage #9.9.4 — Manifest Assembly + Asset Registry Final

## Status
Implemented as the final contract layer between stable scene IDs, the current runtime artwork, and future production WebP/AVIF art plates.

## What changed
- Added `src/art-direction/final-asset-registry.js`.
- Every Royal Joglo fidelity artwork slot now has a stable production contract: role, depth, required/optional status, priority, preferred formats, production path, target long edge, alpha requirement, motion behavior and fallback policy.
- Existing stable layer IDs remain unchanged, preserving editor, timeline, variation locks, regression checks and Stage #9.8 Pixi integration.
- Composer now resolves artwork through the final registry instead of reading the manifest directly.
- Scene JSON now carries both the currently active `src` and the future `productionSrc`, allowing promotion to static HD files without changing layer IDs or composition logic.
- Registry audit distinguishes `contractReady` from `productionPromotionPending`; this avoids falsely claiming that runtime preview payloads are already final production HD files.

## P0 required slots
1. `paper-parchment-cream-01`
2. `landscape-java-engraving-01`
3. `arch-jawa-carved-gold-01`
4. `hero-joglo-sepia-01`
5. `orn-gunungan-gold-01`
6. `floral-bottom-burgundy-01`

## Production promotion paths
The registry reserves `/assets/heritage-hd/...` paths for final static art plates. Current runtime artwork continues to work until those files are promoted during final Studio/Pixi integration.

## Quality contract
- hero/landscape raster plates target 3200–3840px long edge;
- transparent foreground/architecture assets require alpha-safe edges;
- AVIF/WebP is preferred for opaque/complex raster artwork;
- PNG remains an allowed transparency fallback;
- SVG remains fallback for legacy ornament slots where appropriate.

## Audit semantics
`auditFinalAssetRegistry()` reports:
- contract readiness;
- active asset count;
- required slot count;
- role mismatches;
- missing active assets;
- missing production paths;
- missing fallbacks;
- assets still awaiting production-path promotion.

## Fidelity metadata
Royal Joglo composer now reports:
- generator version `9.9.4`;
- tuning `final-asset-registry-v1`;
- registry version and readiness;
- `productionPromotionPending` IDs.

## Next
Stage #9.9.5 — Studio + Pixi Integration Final: wire the final registry into Studio QA/inspector and GPU renderer, promote approved P0 artwork sources, and ensure DOM fallback/Pixi consume the same resolved asset contract.
