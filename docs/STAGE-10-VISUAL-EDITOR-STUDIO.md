# Stage #10 — Visual Editor / Studio V1

Stage #10 adds an interactive editing layer above the existing Scene JSON architecture. The editor does not generate separate HTML. It mutates the in-memory project model and remounts the same renderer.

## Added

- `src/editor/visual-editor.js`
  - project clone/state ownership
  - scene/layer lookup
  - layer selection
  - content mutation
  - transform mutation (`x`, `y`, `width`, `opacity`, `scale`, `rotate`, `depth`)
  - motion preset mutation
  - JSON export
- `src/stage10.css`
  - hover/selection outlines
  - layer browser
  - property inspector
  - editor status UI
- Studio wiring in `src/app.js`
  - click-to-select layers directly in preview
  - select layers from Scene Layers browser
  - realtime property editing
  - replay selected layer motion
  - copy current Project JSON
  - selection preserved through editor rerenders
- Studio UI checkpoint updated to Stage #10.

## Editing Flow

`Generated Project JSON → VisualEditor → mutate selected layer → WeddingVisualEngine.mount() → BasicRenderer`

Scene JSON remains the source of truth.

## Current V1 controls

- Text/button content
- X / Y
- Width
- Opacity
- Scale
- Rotate
- Motion preset
- Scene/layer selection
- Project JSON copy/export

## Deliberately deferred

Stage #10 V1 does not yet implement drag handles, resize handles, undo/redo history, image upload, persistent database saves, or multi-user collaboration. These can build on top of the same editor model without changing the core Scene → Layer → Motion → Preset architecture.

## Next

Stage #11 — Variation System: preserve manual edits while creating controlled template variations, expose variation locks, and support deterministic variant families.
