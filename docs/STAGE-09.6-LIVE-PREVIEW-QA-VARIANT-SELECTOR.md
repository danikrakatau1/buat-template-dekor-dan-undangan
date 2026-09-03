# Stage #9.6 — Live Preview QA + Variant Selector / Inspector

## Status
Implemented on `main`.

## Goal
Make the Jawa HD fidelity system directly inspectable in Studio instead of requiring repeated random seeds to compare compositions.

## Added
- `src/stage9-6.js`
- `src/stage9-6.css`
- automatic Stage #9.6 boot through the theme system

## Direct composition selector
When `jawa-luxury` is active, the right-side Studio panel now exposes the four Stage #9.5 compositions directly:
- Royal Joglo Garden
- Carved Arch Heritage
- Mountain Heritage
- Floral Pendopo

Switching the selector rebuilds only the fidelity cover while preserving the current non-cover scenes. The same seed is retained, so QA compares composition rather than unrelated random content.

## Live QA inspector
The panel reports:
- active composition
- active preview viewport (mobile/tablet/desktop)
- ready asset count
- scalable vector asset count

The existing Generator State and Variation inspector are synchronized after a manual composition switch.

## Motion QA
A dedicated `REPLAY FIDELITY INTRO` action replays the current entrance choreography without generating a new seed.

## Theme behavior
The panel appears only for `jawa-luxury`. Other theme packs keep their existing Studio behavior.

## Acceptance target
Stage #9.6 is complete when a reviewer can compare all four Jawa compositions from one Studio session and inspect the same cover across mobile, tablet, and desktop without touching Scene JSON manually.

## Next
Stage #9.7 — reference regression pass: use screenshots from the deployed Studio to tune the strongest composition and identify any remaining artwork-level gaps before extending fidelity treatment to the full Couple/Event sections.
