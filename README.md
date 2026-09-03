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

## Active post-V1 checkpoint
**Stage #11.7 — Reference-Locked Native Rebuild Final**

Target reference: `ART JAWA COKLAT 3`

Stage #11 replaces the earlier generated-cover + generic-post-cover approach. The final path is a deterministic native reconstruction driven by the Stage #11.1 reference map and a generated artwork plate.

### Completed Stage 11
- #11.1 Reference Structure Mapping ✅
- #11.2 Visual DNA Extraction ✅
- #11.3 Section Blueprint Rewrite ✅
- #11.4 Native Scene Reconstruction ✅
- #11.5 Editable Data Binding ✅
- #11.6 Motion Choreography Match ✅
- #11.7 Fidelity QA ✅

Runtime files:
- `src/reference/art-jawa-coklat-3-reference-map.js`
- `src/reference/art-jawa-coklat-3-native-rebuild.js`
- `src/stage11-reference-rebuild.js`
- `src/stage11-reference-rebuild.css`

Blueprints:
- `docs/STAGE-11.1-REFERENCE-STRUCTURE-MAPPING.md`
- `docs/STAGE-11.2-11.7-REFERENCE-NATIVE-REBUILD-FINAL.md`

Native reconstructed flow:
1. Cover
2. Opening Motion
3. Couple Introduction
4. Save The Date / Quote
5. Wedding Event — Akad + Resepsi
6. Live Streaming
7. Gallery Foto
8. Love Story
9. Wedding Gift
10. RSVP
11. Ucapan & Doa
12. Closing

Source branding is excluded from production output. The original reference media is used only as design/behavior evidence; the runtime reconstruction reuses the generated artwork plate and native Studio layers.

## Final architecture

`Source Image → AI artwork transform → generated artwork plate → Stage 11 reference-native rebuild → 12 editable scenes → native opening/motion → fidelity QA`

### Final runtime indicators
- header: `Reference Native Rebuild · Stage #11.7`
- checkpoint: `#11.7 Visual DNA · Native Reconstruction · Data Binding · Motion · Fidelity QA`
- `window.weddingReferenceRebuildQA.status === "locked"`
- no generic `COUPLE / Couple` placeholder after opening
- cover opening duration remains 1500 ms

## Architecture rule

Reference first. Native Studio reconstruction second. AI is limited to artwork transformation and must not invent page structure, section order, wedding cards, typography, CTA placement, forms, or post-cover scenes.
