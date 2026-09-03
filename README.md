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

## Active post-V1 direction
**Stage #11 — Reference-Locked Native Rebuild**

Target reference: `ART JAWA COKLAT 3`

The earlier #10.10J–#10.10N work proved the artwork-only/source-fidelity path, but it is no longer considered the final page architecture. The next production target is a native section-by-section reconstruction of the supplied reference rather than a generated cover followed by generic Studio scenes.

### #11.1 — Reference Structure Mapping — COMPLETE

Runtime reference contract:
`src/reference/art-jawa-coklat-3-reference-map.js`

Blueprint:
`docs/STAGE-11.1-REFERENCE-STRUCTURE-MAPPING.md`

Mapped source flow:
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
13. Optional own-brand footer

Canonical reference media identified:
- `download.png` recurring artwork plate
- `download-1.png` secondary/couple accent artwork
- `JAWA-COKLAT-3-1.mp4` opening cinematic motion

Motion intent is mapped from Elementor vocabulary into native Studio presets. Source branding is reference-only and must not be copied into production.

## Stage 11 remaining roadmap

- #11.2 Visual DNA Extraction
- #11.3 Section Blueprint Rewrite
- #11.4 Native Scene Reconstruction
- #11.5 Editable Data Binding
- #11.6 Motion Choreography Match
- #11.7 Fidelity QA

## Architecture rule

Reference first. Native Studio reconstruction second. AI is limited to artwork transformation and must not invent the page structure, section order, floral frame, wedding cards, typography, CTA placement, or post-cover scenes.
