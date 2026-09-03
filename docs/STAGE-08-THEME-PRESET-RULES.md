# Stage #8 — Theme / Preset Rules

Stage ini mengubah theme pack statis menjadi sistem variasi yang tetap konsisten dengan art direction.

## Tujuan
- hasil tidak sama terus;
- hasil tetap berada dalam keluarga theme yang dipilih;
- seed yang sama menghasilkan komposisi yang sama;
- seed baru menghasilkan variasi baru;
- generator berikutnya dapat mengonsumsi rule engine ini.

## Rule pools
Setiap theme memiliki pool untuk:
- layout;
- hero/decor variant;
- back decor;
- foreground decor;
- motion set;
- atmosphere set;
- background/Ken Burns motion;
- depth/parallax;
- density/intensity.

## Seeded variation
`resolveThemeVariation(themeId, seed)` menghasilkan variation object deterministik.

Contoh field:
```js
{
  seed,
  layout,
  heroVariant,
  backDecor,
  frontDecor,
  motion,
  atmosphere,
  backgroundMotion,
  decorScale,
  decorX,
  decorY,
  ambientOpacity,
  parallax,
  particleDensity,
  motionIntensity,
  decorIntensity
}
```

## UI
Studio sekarang mempunyai tombol `Generate Variation` dan inspector untuk:
- seed;
- layout;
- hero motion;
- atmosphere.

## Kontrak penting untuk Stage #9
Auto Template Generator tidak boleh random langsung ke renderer. Ia harus:
1. memilih theme;
2. membuat/ menerima seed;
3. resolve rules;
4. menghasilkan Scene JSON;
5. menyerahkan Scene JSON ke Wedding Visual Engine.

Dengan demikian generator menghasilkan variasi yang dapat diulang dan tetap terkontrol.
