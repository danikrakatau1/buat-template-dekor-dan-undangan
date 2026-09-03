# Stage #9.9.5 — Studio + Pixi Integration Final

## Status
Implemented on `main` as the final integration pass between the Stage #9.9.4 asset registry contract, the Studio QA surface, DOM fallback rendering, and the PixiJS WebGL fidelity renderer.

## Critical integration fix
Stage #9.9.3 accidentally referenced hybrid modules through `src/engine/renderers/hybrid/*`, while the actual modules live in `src/hybrid/*`. Stage #9.9.5 corrects those imports so the hybrid renderer can boot instead of failing at module resolution.

## Shared asset-source contract
Both render paths now obey the same source priority:
1. `asset.resolvedSrc` when supplied;
2. promoted `productionSrc` only when it is already the active source;
3. current active `src`;
4. `fallbackSrc`.

This avoids a premature request to reserved `/assets/heritage-hd/*` paths before a production art plate has actually been promoted, while making promotion automatic once the active registry source equals the reserved production source.

## Pixi behavior
- Pixi tries compatible source candidates in order and keeps the DOM proxy visible if every GPU texture candidate fails.
- Mount results expose loaded and failed artwork counts.
- Registry version/readiness and pending production promotions are shown in the Studio Hybrid GPU panel.
- The current runtime engraving pack remains valid until static HD plates are promoted.

## DOM fallback behavior
`BasicRenderer` now uses the same source resolution semantics as Pixi. This keeps Studio preview and GPU output aligned and prevents DOM/Pixi source drift.

## Studio QA
The Hybrid GPU panel now reports Stage #9.9.5, registry readiness, required P0 slot count, production promotion status, and Pixi loaded/fallback layer counts.

The panel is no longer forcibly hidden below 980px; it remains available in responsive Studio layouts when the right panel itself is visible.

## Checkpoint
Generator/composer remains Stage #9.9.4 contract-compatible. Stage #9.9.5 is an integration checkpoint and intentionally does not falsely mark reserved HD paths as promoted.

## Next
Stage #9.9.6 — Final Fidelity Regression Pass: verify mobile/tablet/desktop, all four Jawa compositions, registry/renderer parity, no blank fallback, and visual fidelity against the approved engraving direction.
