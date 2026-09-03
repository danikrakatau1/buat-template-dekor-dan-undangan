function hashSeed(seed='seed') {
  let h = 2166136261;
  for (const ch of String(seed)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return h >>> 0;
}

export function seededRandom(seed='seed') {
  let x = hashSeed(seed) || 1;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 4294967295;
  };
}

function pick(rand, values=[]) {
  if (!values.length) return undefined;
  return values[Math.min(values.length - 1, Math.floor(rand() * values.length))];
}

function range(rand, min, max, digits=2) {
  const value = min + (max - min) * rand();
  return Number(value.toFixed(digits));
}

const RULES = Object.freeze({
  'jawa-luxury': {
    layouts: ['royal-center','asymmetric-right','framed-heritage'],
    heroVariants: ['royal-center','slender','wide'],
    backDecor: ['batik','glow'],
    frontDecor: ['ornament-frame','mist'],
    motionSets: [
      { hero:'rise-soft', title:'clip-up', names:'fade-up', decorMotion:'breathe' },
      { hero:'zoom-soft', title:'fade-up', names:'clip-up', decorMotion:'sway' },
      { hero:'fade-up', title:'clip-up', names:'zoom-soft', decorMotion:'float' }
    ],
    atmosphereSets: [
      ['glow','vignette','grain'],
      ['glow','vignette'],
      ['glow','grain']
    ],
    backgroundMotions: ['zoom-in','pan-right','zoom-out']
  },
  'ocean-romantic': {
    layouts: ['horizon-center','coastal-asymmetric','deep-tide'],
    heroVariants: ['deep','soft'],
    backDecor: ['glow','mist'],
    frontDecor: ['wave','mist'],
    motionSets: [
      { hero:'fade-up', title:'clip-up', names:'fade-up', decorMotion:'sway' },
      { hero:'zoom-soft', title:'fade-up', names:'clip-up', decorMotion:'drift' },
      { hero:'rise-soft', title:'clip-up', names:'zoom-soft', decorMotion:'float' }
    ],
    atmosphereSets: [
      ['glow','vignette'],
      ['glow','grain'],
      ['glow','vignette','grain']
    ],
    backgroundMotions: ['pan-right','zoom-in','pan-left']
  },
  'celestial-night': {
    layouts: ['orbit-center','cosmic-asymmetric','constellation-frame'],
    heroVariants: ['soft','wide'],
    backDecor: ['glow','stars'],
    frontDecor: ['mist','ornament-frame'],
    motionSets: [
      { hero:'zoom-soft', title:'clip-up', names:'fade-up', decorMotion:'sway' },
      { hero:'fade-up', title:'fade-up', names:'zoom-soft', decorMotion:'drift' },
      { hero:'rise-soft', title:'clip-up', names:'fade-up', decorMotion:'breathe' }
    ],
    atmosphereSets: [
      ['glow','vignette','grain'],
      ['glow','vignette'],
      ['glow','grain']
    ],
    backgroundMotions: ['zoom-out','pan-left','zoom-in']
  }
});

export function resolveThemeVariation(themeId='jawa-luxury', seed='DEMO-001') {
  const rules = RULES[themeId] || RULES['jawa-luxury'];
  const rand = seededRandom(`${themeId}:${seed}`);
  const motion = pick(rand, rules.motionSets);
  return {
    seed,
    layout: pick(rand, rules.layouts),
    heroVariant: pick(rand, rules.heroVariants),
    backDecor: pick(rand, rules.backDecor),
    frontDecor: pick(rand, rules.frontDecor),
    motion,
    atmosphere: pick(rand, rules.atmosphereSets),
    backgroundMotion: pick(rand, rules.backgroundMotions),
    decorScale: range(rand, .92, 1.08),
    decorX: range(rand, 46, 54, 1),
    decorY: range(rand, 52, 60, 1),
    ambientOpacity: range(rand, .48, .82),
    parallax: range(rand, .08, .2),
    particleDensity: Math.round(range(rand, 44, 82, 0)),
    motionIntensity: range(rand, .66, .92),
    decorIntensity: range(rand, .62, .9)
  };
}

export function createVariationSeed(prefix='VAR') {
  const now = Date.now().toString(36).toUpperCase();
  const random = Math.floor(Math.random()*1679616).toString(36).padStart(4,'0').toUpperCase();
  return `${prefix}-${now.slice(-5)}-${random}`;
}

export function getPresetRules(themeId) {
  return RULES[themeId] || RULES['jawa-luxury'];
}
