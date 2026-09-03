# Stage #11.1 — Reference Structure Mapping

Target reference: `ART JAWA COKLAT 3`

Source URL: `https://web.galeriundanganofficial.com/art-jawa-coklat-3/`

## Decision

Stage 11 replaces the generic post-cover recovery direction. The target is not a generic Javanese wedding template. The target is a native, editable reconstruction whose section order, visual rhythm, artwork placement, motion vocabulary, cover opening behavior, and content hierarchy are derived from the supplied reference.

AI is restricted to artwork transformation. AI must not invent page structure, section order, wedding cards, floral frames, event layouts, or post-cover scenes.

## Source structure mapped

1. `cover` — fixed 100vh cover
   - artwork plate: `download.png`
   - native headings: The Wedding Of, couple names, recipient, location label
   - native CTA: Buka Undangan
   - motion vocabulary: fadeInUp, zoomIn, bounceIn
   - behavior: scroll locked before open; play audio; cover exits upward over 1500 ms; reveal all following top sections

2. `buka` — cinematic opening bridge
   - artwork plate: `download.png`
   - motion video: `JAWA-COKLAT-3-1.mp4`
   - text: THE WEDDING OF, names, wedding date
   - motion: zoomIn + fadeInUp
   - video starts after cover open; motion text is delayed

3. `6089310` — couple introduction
   - headings: We Are Getting Married!, bride, groom
   - artwork: `download.png`, `download-1.png`
   - motion: zoomIn, fadeInRight, fadeInUp
   - content: couple identity, full names, parents, introduction

4. `634b519` — Save The Date / quote
   - heading: Save The Date
   - quote content and wedding date/countdown role
   - motion: zoomIn, fadeInUp

5. `b63e3f5` — Wedding Event
   - headings: Wedding / Event / Akad Nikah / Resepsi
   - artwork plate: `download.png`
   - two event blocks with date, time, venue/address and map actions
   - motion: fadeInLeft, fadeInUp, zoomIn

6. `8c3c753` — Live Streaming
   - heading: live streaming
   - optional stream text + platform CTA
   - motion: zoomIn, fadeInUp

7. `bc0eeaf` — Gallery Foto
   - headings: Galeri / Foto
   - staggered gallery motion: zoomIn, fadeInRight, fadeInUp

8. `d41a1a2` — Love Story
   - heading: LOVE STORY
   - timeline/story content
   - motion: fadeInUp

9. `7e9a230` — Wedding Gift
   - headings: Wedding / Gift / Confirm
   - artwork plate: `download.png`
   - bank transfer, shipping address, confirmation action
   - motion: fadeInRight, fadeInUp

10. `11baac1d` — RSVP
    - attendance confirmation introduction + form
    - motion: fadeInUp

11. `a6858f7` — Ucapan & Doa
    - headings: Ucapan / Doa
    - guestbook/wishes content + form
    - motion: fadeInUp, zoomIn

12. `43063afc` — Closing
    - headings: Terima Kasih + couple names
    - thank-you copy
    - motion: fadeInUp

13. `7cf4c407` — source footer credit
    - source branding/logo is reference-only
    - production rebuild must use our own optional branding rather than cloning source branding

## Canonical assets detected

- `download.png` — recurring visual artwork plate, 450×648 in the source markup
- `download-1.png` — secondary/couple accent artwork
- `JAWA-COKLAT-3-1.mp4` — cinematic opening-motion video
- `Logokuw.png` — source footer branding asset; reference-only

## Motion mapping contract

- Elementor `fadeInUp` → Studio `fade-up`
- Elementor `fadeInRight` → Studio `fade-right`
- Elementor `fadeInLeft` → Studio `fade-left`
- Elementor `zoomIn` → Studio `zoom-soft`
- Elementor `bounceIn` → Studio `cta-bounce-in`

The reconstruction must preserve motion intent rather than copy Elementor runtime implementation.

## Editable data contract

The native rebuild must expose at minimum:

- couple names, full names, parents
- guest name / recipient line
- opening date
- quote and source
- Akad + Resepsi date/time/venue/address/map
- livestream enable/url/platform
- gallery images
- love-story items
- gift accounts and shipping address
- RSVP data/form configuration
- guestbook/wishes configuration
- closing text
- music/audio source
- optional own-brand footer

## Stage 11 implementation order

- #11.1 Reference Structure Mapping — COMPLETE
- #11.2 Visual DNA Extraction — NEXT
- #11.3 Section Blueprint Rewrite
- #11.4 Native Scene Reconstruction
- #11.5 Editable Data Binding
- #11.6 Motion Choreography Match
- #11.7 Fidelity QA

## Acceptance criteria for #11.1

- No generic `Couple / Event / Story / Gallery` assumptions are treated as the target architecture.
- Every meaningful source top-section has a mapped native scene role.
- Cover opening behavior is documented separately from post-cover scene content.
- Recurring artwork plate and opening video are explicitly identified.
- Editable fields are declared before visual reconstruction starts.
- Source branding is not promoted into our production template.

Runtime map: `src/reference/art-jawa-coklat-3-reference-map.js`
