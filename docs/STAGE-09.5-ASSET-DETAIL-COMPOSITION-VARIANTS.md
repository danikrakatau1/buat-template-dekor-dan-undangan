# Stage #9.5 — Asset Detail Upgrade + Composition Variants

## Status
Implemented on `main`.

## Goal
Increase the illustration quality of the Jawa HD pack and make the fidelity system capable of producing multiple premium compositions without falling back to the old procedural-demo look.

## Composition family
The Jawa fidelity composer now supports four compositions while preserving stable scene and layer IDs:

1. `royal-joglo-garden` — balanced reference composition; the default Studio demo.
2. `carved-arch-heritage` — stronger carved architectural crown, quieter environment and restrained florals.
3. `mountain-heritage` — wider engraved landscape, stronger tree depth and smaller architecture/foreground weight.
4. `floral-pendopo` — botanical framing becomes dominant while the pendopo/joglo remains integrated in the lower environment.

`Generate Cover Variation` can now resolve a Jawa composition deterministically from the seed. `JL-DEMO-001` remains locked to Royal Joglo Garden so the default preview stays predictable.

## Stable editing contract
All four variants keep the same important layer IDs (`hero-joglo-sepia-01`, `arch-jawa-carved-gold-01`, `floral-bottom-burgundy-01`, content IDs, etc.). This preserves compatibility with controlled variation locks, the Visual Editor, production validation and export.

## Asset-detail pass
The hero architecture, carved arch and foreground floral artwork receive denser vector detail instead of compensating with additional glow. The target remains clean-room premium Javanese heritage illustration: engraved lines, wood/carving cues, layered petals and paper-friendly sepia/gold treatment.

## Motion rule
Variation changes composition and depth, not motion noise. Parallax remains low, idle motion remains slow, and atmosphere stays subordinate to the artwork.

## Acceptance target
A Jawa seed variation should visibly change the art composition while remaining recognizably part of one luxury heritage family. No variant should return to giant procedural gunungan, empty gradient backgrounds or random decor placement.

## Next
Stage #9.6 — Live Preview QA + Variant Selector/Inspector: expose the current fidelity composition clearly in Studio and audit each composition at mobile/tablet/desktop breakpoints.
