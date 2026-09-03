# Stage #12 — Export + Production Hardening

Stage #12 closes the V1 roadmap by turning the Wedding Template Studio into a production-candidate workflow.

## Production pipeline

`Theme → Seed → Rules → Auto Generator → Visual Editor → Controlled Variation → Validation → Export`

## Added in this stage

### Production validation

`src/production/export-manager.js` validates the current Scene JSON before export.

Checks include:
- project object and project ID
- at least one scene
- stable/unique scene IDs
- stable/unique layer IDs inside each scene
- layer kind warnings
- transform opacity range
- scene/layer totals

Exports are blocked when validation has errors.

### Production snapshot

A validated export receives production metadata:
- `exportVersion`
- `exportedAt`
- `productionReady`
- validation scene/layer counts
- warnings

The editor source project is cloned before production metadata is attached, so export does not mutate the working editor state.

### Export formats

1. **Project JSON** — downloadable validated Scene JSON snapshot.
2. **Runnable HTML** — downloadable HTML document containing the validated project snapshot and bootstrapping the shared hardened Wedding Visual Engine from the deployment origin.

The runnable HTML is engine-backed rather than an offline self-contained bundle. It remains intentionally connected to the deployed engine files so the V1 architecture keeps one renderer/source of truth.

### Engine lifecycle hardening

Repeated editor remounts now clean up the previous:
- timeline run
- IntersectionObserver registrations
- decor pointer/scroll listeners

before mounting the next project state. This prevents listener and observer accumulation while editing rapidly.

### Safer UI rendering

Editor layer labels and fatal preview errors are rendered with DOM `textContent` instead of interpolating user-editable values into HTML.

### Responsive / accessibility hardening

Stage #12 production controls include:
- mobile-safe action layout
- focus-visible state
- disabled state
- reduced-motion guard
- contained panel overscroll

## Production Studio controls

The right panel now exposes:
- Production status
- Scene count
- Layer count
- Warning count
- Validate
- Export JSON
- Export Runnable HTML

## V1 roadmap state

1. Foundation Repo & App Skeleton ✅
2. Scene JSON Schema ✅
3. Core Visual Engine ✅
4. Layer & Scene Engine ✅
5. Motion & Decor Engine ✅
6. Procedural Asset Engine ✅
7. Starter Theme Packs ✅
8. Theme / Preset Rules ✅
9. Auto Template Generator ✅
10. Visual Editor / Studio ✅
11. Variation System ✅
12. Export + Production Hardening ✅

Stage #12 is the V1 production-candidate checkpoint. The next work should be regression/device testing and any fixes found there, rather than adding new core architecture before validation.
