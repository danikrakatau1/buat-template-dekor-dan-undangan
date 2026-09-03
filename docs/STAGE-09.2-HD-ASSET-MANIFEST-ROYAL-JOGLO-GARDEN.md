# Stage #9.2 — HD Asset Manifest + Royal Joglo Garden Composer

## Goal
Replace the earlier procedural-only art direction with an HD layered composition contract for `jawa-heritage-floral`, starting with the `royal-joglo-garden` composition.

## Added
- `src/art-direction/hd-asset-manifest.js`
- `src/art-direction/royal-joglo-garden-composer.js`
- Fidelity role aliases in `src/engine/layers/layer-system.js`

## Royal Joglo Garden asset contract
The composition now expects independent production assets for:
1. parchment base
2. engraved Java landscape
3. left and right tree framing
4. carved Javanese arch
5. joglo hero illustration
6. gunungan emblem
7. left and right floral side clusters
8. floral foreground bed
9. warm haze
10. paper grain

The manifest deliberately separates `required` visual artwork from `optional` atmosphere assets. Each manifest item includes the final repository path, visual role, family, quality tier, and a fallback description.

## Fidelity composer
`createRoyalJogloGardenProject()` returns a runnable project for the existing Wedding Visual Engine. It creates a cover scene with:
- explicit depth separation
- heritage palette
- staged reveal timeline
- parallax values per depth
- slow decor motion
- guest content slot
- interaction layer
- HD manifest metadata for auditing

The composer uses `image` layers so final production artwork can replace the current procedural-demo look without replacing the renderer or editor architecture.

## Layer mapping
New fidelity roles are mapped onto the stable L0–L10 renderer stack:
- `environment-back` → `decor-back`
- `ornament-back` → `decor-back`
- `hero` → `decor-main`
- `ornament-front` → `decor-front`
- `foreground-floral` → `decor-front`
- `atmosphere-front` → `atmosphere`
- `ui-fx` → `floating`

This preserves compatibility with all previous engine stages.

## Important status
Stage #9.2 creates the **asset contract and composition engine**. It does not pretend that the final separated HD artwork files already exist. The target paths are now locked, so the next asset-production pass can fill those exact slots without changing scene logic.

## Next
Stage #9.3 — Produce/import the first real HD asset pack for `royal-joglo-garden`, then connect the composition into Studio preview as the first fidelity preset.
