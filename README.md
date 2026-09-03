# Wedding Template Studio

Private experimental studio for building reusable wedding invitation templates with scene, layer, motion, decor, preset, auto-generation, and artwork-transformation systems.

## V1 core roadmap
1. Foundation Repo & App Skeleton
2. Scene JSON Schema
3. Core Visual Engine
4. Layer & Scene Engine
5. Motion & Decor Engine
6. Procedural Asset Engine
7. Starter Asset Packs
8. Theme / Preset Rules
9. Auto Template Generator
10. Visual Editor / Studio
11. Variation System
12. Export + Production Hardening

## Stable post-V1 checkpoint
**Stage #10.10I — Auto Artwork Transform V1 Stable**

Final pipeline:
- source image analysis and composition locks
- Master Transform Prompt V1 with theme adapters and strict textless-artwork guard
- Cloudflare Workers AI reference-edit provider path
- provider output tracing and source-reuse detection
- generated artwork full-bleed handoff with legacy decor isolation
- clean DOM typography layer separated from generated artwork
- output-artwork density analysis after generation
- automatic Top Copy / Center Copy / Bottom Copy selection
- CTA density scoring and collision guard
- responsive portrait / compact / landscape presentation guard
- Pixi/GSAP presentation integration with Konva editor overlay disabled for final generated covers
- engine quality gate plus final layout QA score
- source-preserving fallback when the generative provider is unavailable

The generative provider is never treated as successful merely because the endpoint is reachable. A generated candidate is traced, analyzed again, normalized into Scene JSON, mounted as the final artwork layer, and then independently checked for layout quality before the Studio reports a stable result.

### Stable success indicators
A successful final run should show:
- `OUTPUT-AWARE · 10.10I`
- an output layout such as `top-copy`, `center-copy`, or `bottom-copy`
- density values for copy and CTA lanes
- `Final QA` score/status
- `Auto Artwork Transform V1 stable · output-aware layout ready` when the final QA reaches stable status
