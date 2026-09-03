# Stage #11 — Variation System

Stage #11 adds controlled regeneration on top of the Auto Template Generator and Visual Editor.

## Goal

A user can manually edit a generated template, request a new variation, and decide which categories of work must survive regeneration.

## Variation Locks

- **Content** — preserves text/button content by stable `sceneId:layerId`.
- **Layout** — preserves transform values such as X, Y, width, opacity, scale, rotation, and depth.
- **Motion** — preserves the layer motion object.
- **Assets** — preserves procedural asset generator configuration.

Content is locked by default so names and copy are not lost when exploring new visual directions.

## Pipeline

`Current Scene JSON → New Seed → Auto Template Generator → Merge Locked Fields → Visual Editor → Renderer`

The generated project remains the source of truth. The variation system never creates a parallel HTML template.

## Determinism and lineage

Every controlled variation stores:

- current seed
- source seed
- active lock state
- variation system version

This makes variation lineage inspectable in exported Project JSON.

## Stable IDs

Edit preservation depends on matching stable scene and layer IDs. The current generator uses consistent IDs for semantic text, buttons, and major generated decor layers across variations.

## Stage #12

The next stage is **Export + Production Hardening**: runnable export, validation, resilience, performance guards, and final production checks.
