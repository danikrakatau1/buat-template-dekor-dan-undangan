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

## Final post-V1 reference checkpoint
**Stage #10.10N — Reference Architecture Final Regression**

Stages #10.10J–#10.10N replace the previous poster-style generated-cover approach.

### J — Reference Architecture Recovery
The cover is modeled as an artwork plate plus native HTML/DOM typography and CTA. Generated artwork is not treated as a complete wedding poster.

### K — Artwork-Only Transform Lock
Cloudflare Workers AI / FLUX receives the source as a geometry contract. It must preserve the main subject, silhouette, camera/viewpoint, crop relationship, horizon, perspective and major object placement. It may transform rendering style into engraved/etched stationery artwork, but it must not invent a new scene, floral frame, arch, gunungan, joglo, border or typography.

### L — Native Layer Composition
The generated result is mounted as one isolated artwork image layer. `THE WEDDING OF`, couple names, recipient copy, guest name, `Di Tempat` and `Buka Undangan` remain separate native layers. Legacy generated/procedural decor is disabled on this final cover path.

### M — Motion / Opening Fidelity
The native CTA triggers a 1500 ms premium cover exit, dispatches `wedding:cover-open`, and attempts to start the existing `#song` audio element when available. Pixi remains a presentation layer for artwork; Konva selection overlay is disabled for the final cover.

### N — Final Reference Regression
Before reporting a final candidate, the Studio analyzes source and generated artwork structure and compares row/column edge profiles, subject center and horizon. The panel reports source fidelity, style delta and a final regression score. A high score is reported as `LOCKED`; drift is surfaced instead of silently calling the result stable.

### Final success indicators
A successful run should show:
- `REFERENCE · 10.10N`
- backend revision `10.10K-source-fidelity-lock`
- Source Fidelity values for structure / center / horizon
- non-zero Style Delta
- Final Regression `LOCKED`
- status `REFERENCE PIPELINE LOCKED · siap dilihat`

The final architecture is intentionally conservative: AI transforms artwork style only; composition, wedding copy, CTA, motion and editor/runtime behavior remain under deterministic Studio control.
