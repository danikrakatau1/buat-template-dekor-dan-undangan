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
**Stage #10.1–#10.8 — Auto Artwork Transform Engine**

The active pipeline now provides:
- source-image analysis
- composition resolver and structure locks
- controlled style presets
- optional image-transform provider contract
- deterministic decor injection fallback
- logical layer normalization
- artwork quality gate
- Scene JSON builder
- Studio upload/preset/QA panel
- Pixi/GSAP presentation integration

A real image-to-image model is intentionally kept behind an external provider boundary. When no provider is connected, the Studio preserves the source image and still performs analysis, composition, decor, layering, QA, Scene JSON generation, and runtime preview without pretending a generative transform occurred.
