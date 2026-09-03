# Stage #9.4 — Visual QA + Reference Fidelity Tuning

## Status
Implemented on `main`.

## Goal
Tune `Royal Joglo Garden` against the supplied visual references so the cover reads as a premium cream/sepiatone Javanese heritage illustration rather than a procedural demo.

## Reference fidelity changes
- Reduced atmospheric intensity so artwork detail is not washed out.
- Pushed landscape lower and wider for a more natural engraved environment.
- Moved tree frames outward and increased their scale to create a natural left/right frame.
- Raised and widened the carved arch so it reads as architecture instead of a floating ornament.
- Lowered the joglo into the bottom environment and softened opacity so it integrates with the landscape.
- Reduced the gunungan to an emblem scale rather than a hero-scale object.
- Increased bottom floral width and pushed it lower to create a real foreground bed.
- Tightened content hierarchy and guest spacing around the reference composition.
- Reduced parallax amplitude and slowed decor motion for a calmer luxury feel.

## Color and material tuning
- Warmer cream paper base.
- Sepia/multiply treatment for landscape, trees and joglo.
- Softer gold carved arch and gunungan treatment.
- Burgundy/ivory floral saturation restrained to avoid a synthetic look.
- Lower grain and vignette intensity.
- Cleaner, less glowy text treatment.

## Mobile-first tuning
Mobile remains the primary fidelity viewport. The mobile composition now uses lower parallax, softer joglo opacity and a slightly quieter engraved landscape so the center typography remains legible without flattening the scene.

## Current visual hierarchy
1. carved arch / ornamental top frame
2. small gunungan emblem
3. wedding eyebrow
4. couple names
5. guest block
6. invitation CTA
7. engraved landscape and joglo environment
8. tree side framing
9. floral foreground bed

## Acceptance target
The scene should now read immediately as `Jawa Heritage Wedding Artwork`: cream antique paper, illustrated environment, joglo architecture, botanical framing and restrained luxury motion.

This tuning is still a clean-room interpretation of the target references. The next fidelity increase should come from richer source artwork/detail inside the SVG asset pack rather than from adding more glow or more motion.

## Next
Stage #9.5 — Asset Detail Upgrade + Composition Variants (`Carved Arch Heritage`, `Mountain Heritage`, `Floral Pendopo`).
