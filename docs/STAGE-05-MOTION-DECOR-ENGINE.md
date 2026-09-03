# Stage #5 — Motion & Decor Engine

Status: implemented in V1 foundation.

## Added
- reusable reveal presets: fade, directional fade, zoom, clip-up, rise-soft, zoom-soft
- MotionController for prepare/reveal/replay lifecycle
- DecorMotionController with requestAnimationFrame scheduling
- depth/parallax response to scroll + pointer
- decor idle motions: float, sway, breathe, drift
- upgraded procedural gunungan internal motion
- upgraded gold-dust particle flow
- dynamic background renderer with Ken Burns-compatible animation
- reduced-motion guard
- replayable cover intro

## Design rule
Motion stays data-driven from Scene JSON. Decor assets do not own application logic; the engine interprets motion/depth settings.

## Stage #6 handoff
Next: Procedural Asset Engine.
Planned generators: stars, glow fields, grain/noise, mist, abstract waves, gradients, geometric ornaments and reusable procedural patterns.
