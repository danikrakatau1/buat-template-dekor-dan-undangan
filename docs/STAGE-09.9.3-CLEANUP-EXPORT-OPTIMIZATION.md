# Stage #9.9.3 — Cleanup + Export Optimization

## Status
Implemented as runtime cleanup and delivery hardening for the generated engraving artwork introduced in #9.9.2B.

## What changed
- Runtime WebP payloads are decoded from their connector-safe chunks into revocable `Blob` URLs instead of keeping giant `data:` URLs attached to DOM/Pixi layers.
- `data:` URLs remain only as a compatibility fallback when Object URLs are unavailable.
- Engraving artwork is pre-decoded before the Pixi fidelity surface mounts to reduce first-frame image popping.
- Runtime artwork URLs are revoked on `pagehide` to avoid leaking Blob URL allocations across Studio sessions.
- Manifest entries now expose delivery metadata (`transport`, async decode, preload, alpha cleanup) and audit the number of optimized raster assets.
- Composer fidelity metadata is bumped to `generated-engraving-raster-v2-clean` / `cleanup-export-optimization-v1` and generator version `9.9.3`.
- Haze, legacy side florals and parallax intensity are reduced slightly so engraving detail survives motion and compositing.

## Alpha / edge policy
Joglo and botanical foreground retain transparent WebP delivery. The runtime metadata marks them as edge-safe cleanup candidates and the DOM/Pixi fallback paths remain intact.

## Export policy
The stable artwork IDs are unchanged. Exported Scene JSON therefore continues to reference the same IDs while carrying optimized delivery metadata. DOM fallback assets remain available through `fallbackSrc`.

## Important fidelity note
This checkpoint optimizes delivery, decode lifecycle and composition cleanliness. It does **not** claim a resolution increase for the connector-safe runtime preview payloads currently checked into the repository. Promotion to final static high-resolution WebP/AVIF files should happen once the art plates are approved and can be committed as production binary assets.

## Regression expectations
- no blank cover if Blob URLs are unsupported;
- Pixi WebGL and DOM fallback resolve the same stable layer IDs;
- repeated theme/composition mounts do not accumulate unreleased runtime artwork URLs;
- reduced-motion behavior remains unchanged;
- editor/variation/timeline compatibility remains unchanged.

## Next
#9.9.4 should finalize the asset registry/manifest contract for production art plates, including static source paths, quality tiers, fallback paths, dimensions and future AVIF/WebP variants.
