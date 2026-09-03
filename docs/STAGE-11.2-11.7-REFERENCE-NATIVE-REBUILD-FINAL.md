# Stage #11.2–#11.7 — Reference-Locked Native Rebuild Final

Reference: ART JAWA COKLAT 3 structure map from Stage #11.1.

## #11.2 Visual DNA Extraction
Locked design vocabulary:
- warm ivory / parchment surfaces
- brown-sepia ink hierarchy
- Cormorant-style editorial display typography + compact sans body copy
- artwork plate reused as a visual anchor rather than a generated poster
- edge-rich engraving with readable central copy area
- restrained card borders, soft shadows, rounded heritage stationery surfaces
- motion dictionary translated from fadeInUp / fadeInRight / fadeInLeft / zoomIn / bounceIn.

Runtime contract: `ART_JAWA_COKLAT_3_VISUAL_DNA`.

## #11.3 Section Blueprint Rewrite
The previous generic Couple/Event/Story placeholders are retired from the Auto Artwork path. The rebuilt project uses deterministic blueprints for:
1. Cover
2. Opening Motion
3. Couple
4. Save The Date
5. Wedding Event
6. Live Streaming
7. Gallery
8. Love Story
9. Wedding Gift
10. RSVP
11. Ucapan & Doa
12. Closing

Source branding is intentionally excluded from production output.

## #11.4 Native Scene Reconstruction
`buildArtJawaCoklat3NativeProject()` rebuilds all post-cover scenes after a generated artwork plate is available. The artwork plate is reused as background/media while every title, body copy, CTA, field, card, and scene boundary remains native Studio data.

The generic post-cover recovery module is no longer booted.

## #11.5 Editable Data Binding
The native rebuild carries structured editable data for:
- couple identity
- guest label/name
- primary date
- akad / reception times
- venue / address
- quote/introduction
- story milestones
- gift content
- RSVP and wishes inputs
- closing copy.

Form-like RSVP / Wishes fields are rendered natively by BasicRenderer (`field` and `textarea` kinds) so they no longer appear as placeholder headings.

## #11.6 Motion Choreography Match
Native motion behavior:
- cover CTA is the sole opening trigger
- cover exit duration: 1500 ms
- opening-motion scene receives a cinematic Ken Burns treatment
- scene content uses reference-derived directional reveal vocabulary
- reduced-motion remains supported
- Stage 10 generic opening-safety interception is retired to avoid competing handlers.

## #11.7 Fidelity QA + Final Lock
`runReferenceFidelityQA()` checks:
- all 12 required native scenes exist
- no scene is empty
- no placeholder layer remains
- generated artwork plate is present on cover
- native cover CTA is present.

Expected final runtime indicators:
- header: `Reference Native Rebuild · Stage #11.7`
- checkpoint: `#11.7 Visual DNA · Native Reconstruction · Data Binding · Motion · Fidelity QA`
- `window.weddingReferenceRebuildQA.status === "locked"`
- scene count: 12
- no `COUPLE / Couple` generic placeholder after opening.

## Architecture lock
Final path:

`Source Image → AI artwork transform → generated artwork plate → Stage 11 reference-native rebuild → 12 deterministic editable scenes → native motion → fidelity QA`

AI is not allowed to invent page structure. Layout, section order, copy layers, forms, CTAs, opening behavior, and post-cover flow are owned by Wedding Template Studio.
