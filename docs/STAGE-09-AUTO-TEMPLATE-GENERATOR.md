# Stage #9 — Auto Template Generator

Status: implemented on `main`.

## Goal

Turn the Stage #7 theme packs and Stage #8 deterministic rule system into a complete runnable wedding template without hand-authoring every scene.

Pipeline:

`Theme → Seed → Preset Rules → Scene Generator → Scene JSON → Existing Visual Engine`

## Added

### `src/generator/auto-template-generator.js`

Generates a full seven-scene project:

1. Cover
2. Couple
3. Event
4. Story
5. Gallery
6. RSVP
7. Closing

The cover continues to use the theme pack resolver. The remaining six scenes are generated from the selected theme and seed with procedural decor, atmosphere, motion, depth/parallax, and starter copy.

Generation is deterministic for the same theme + seed. Generated projects include `project.generatorVersion`, `project.generatedAt`, and a root `generator` metadata object.

### Studio integration

The top-bar `AUTO CREATE TEMPLATE` action now creates a fresh seed, generates the complete project, mounts it into the existing engine, updates the inspector, and plays the cover intro.

The inspector exposes generator mode, scene count, layer count, seed, cover layout, cover hero motion, and atmosphere.

### Stage #9 styling

`src/stage9.css` adds generator status UI and presentation rules for generated non-cover scenes while preserving the canonical layer stack and existing motion/decor engine.

## Architecture rule

The generator does not generate bespoke HTML templates. It generates Scene JSON consumed by the same renderer, layer engine, motion engine, decor engine, procedural asset registry, and responsive preview.

## Next

Stage #10 — Visual Editor / Studio.

The next stage should make generated layers selectable and editable through the UI, beginning with text content, layer position/size, scene navigation, and direct property changes without breaking deterministic generation metadata.
