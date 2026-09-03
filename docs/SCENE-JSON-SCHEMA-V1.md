# Scene JSON Schema V1

Scene JSON adalah sumber utama template. HTML hanyalah hasil render.

## Root
- `project`: metadata, preset, seed
- `theme`: palette dan design token
- `audio`: musik global
- `scenes`: urutan section undangan

## Scene
Jenis awal:
`cover`, `intro`, `couple`, `event`, `story`, `gallery`, `rsvp`, `gift`, `closing`, `custom`.

Setiap scene dapat punya:
- `background`
- `atmosphere`
- `timeline`
- `layers`
- `responsive`

## Layer roles
Urutan semantic:
1. background
2. decor-back
3. ambient
4. atmosphere
5. decor-main
6. media
7. content
8. decor-front
9. interaction
10. floating

## Layer kinds
`text`, `image`, `svg`, `video`, `decor`, `particle`, `shape`, `button`, `countdown`, `gallery`, `slider`, `form`, `custom`.

## Asset source
- `local`: file lokal project
- `generated`: asset hasil generator
- `procedural`: dibuat runtime oleh CSS/SVG/Canvas/WebGL
- `remote`: URL eksternal yang memang diizinkan

## Motion
Motion dikontrol lewat preset + parameter:
- delayMs
- durationMs
- easing
- distance
- once
- threshold
- loop
- parallax

Contoh:
```json
{
  "preset": "fade-up",
  "delayMs": 300,
  "durationMs": 900,
  "easing": "premium",
  "once": true
}
```

## Transform + depth
Transform menyimpan posisi dan komposisi:
- x/y
- width/height
- scale
- rotate
- opacity
- depth
- z
- anchor

`depth` dipakai untuk parallax/2.5D. `z` menentukan ordering eksplisit bila dibutuhkan.

## Background engine
Type:
- color
- gradient
- image
- video
- slideshow
- procedural

Slideshow mendukung transition, duration, transition duration, dan Ken Burns.

## Atmosphere
Efek awal:
- overlay
- glass
- frost
- glow
- bloom
- vignette
- grain
- noise
- light-leak
- mist

## Particle
Preset awal:
- snow
- gold-dust
- sparkle
- stars
- petals
- leaves
- bokeh
- embers
- mist
- floating-dots

## Timeline
Timeline mengorkestrasi cinematic intro tanpa hard-coded `setTimeout()` tersebar.

```json
[
  { "at": 100, "target": "intro-video", "action": "play" },
  { "at": 1800, "target": "gunungan", "action": "reveal" },
  { "at": 3000, "target": "names", "action": "reveal" }
]
```

## Responsive
Setiap scene/layer boleh override:
- desktop
- tablet
- mobile

Ini memungkinkan particle density, parallax, ukuran decor, atau source video berbeda per device.

## Seed
`project.seed` membuat generator reproducible:
- seed sama → variasi sama
- seed berbeda → variasi baru

Schema teknis tersedia di `src/schema/template.schema.json`.
