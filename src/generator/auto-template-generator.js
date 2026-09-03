import { createThemeProject, getThemeSeedPrefix } from '../themes/theme-packs.js';
import { createVariationSeed, seededRandom } from '../themes/preset-rules.js';

const SCENE_COPY = Object.freeze({
  couple: {
    eyebrow: 'Mempelai',
    title: 'Anif & Dini',
    body: 'Dua hati, satu perjalanan, dan satu hari yang kami rayakan bersama orang-orang terkasih.'
  },
  event: {
    eyebrow: 'Rangkaian Acara',
    title: 'Akad & Resepsi',
    body: 'Sabtu · 25 September 2026 · Pekalongan'
  },
  story: {
    eyebrow: 'Our Story',
    title: 'Dari Pertemuan Menjadi Tujuan',
    body: 'Sebuah cerita sederhana yang tumbuh menjadi keputusan untuk berjalan bersama.'
  },
  gallery: {
    eyebrow: 'Gallery',
    title: 'Captured Moments',
    body: 'Ruang untuk foto, video, dan kenangan yang nanti dapat diisi dari Visual Editor.'
  },
  rsvp: {
    eyebrow: 'RSVP',
    title: 'Konfirmasi Kehadiran',
    body: 'Kehadiran dan doa Anda adalah hadiah yang sangat berarti bagi kami.'
  },
  closing: {
    eyebrow: 'Terima Kasih',
    title: 'Sampai Bertemu di Hari Bahagia Kami',
    body: 'Dengan penuh kebahagiaan, Anif & Dini.'
  }
});

const THEME_SCENE_DECOR = Object.freeze({
  'jawa-luxury': ['batik', 'ornament-frame', 'mist', 'gunungan'],
  'ocean-romantic': ['glow', 'wave', 'mist', 'wave'],
  'celestial-night': ['stars', 'glow', 'mist', 'ornament-frame']
});

function pick(rand, values) {
  return values[Math.min(values.length - 1, Math.floor(rand() * values.length))];
}

function textLayer(id, content, role='content', preset='fade-up', delayMs=0) {
  return {
    id,
    kind:'text',
    role,
    content,
    motion:{ preset, delayMs, durationMs:900, easing:'premium', once:true }
  };
}

function decorLayer({ id, generator, role, seed, x=50, y=50, width='100%', opacity=.55, depth=.08, motion='fade-in', decorMotion='drift' }) {
  return {
    id,
    kind:'decor',
    role,
    asset:{ type:'procedural', generator, seed, variant:'soft' },
    transform:{ x, y, width, opacity, depth },
    motion:{ preset:motion, delayMs:0, durationMs:1200, parallax:depth, decorMotion, decorDurationMs:12000 }
  };
}

function generateScene(themeId, type, seed, index) {
  const rand = seededRandom(`${themeId}:${seed}:${type}`);
  const copy = SCENE_COPY[type];
  const decorPool = THEME_SCENE_DECOR[themeId] || THEME_SCENE_DECOR['jawa-luxury'];
  const back = pick(rand, decorPool);
  const front = pick(rand, decorPool);
  const heroMotion = pick(rand, ['fade-up','clip-up','zoom-soft','rise-soft']);
  const ambientMotion = pick(rand, ['drift','float','sway','breathe']);
  const x = Number((47 + rand() * 6).toFixed(1));
  const y = Number((49 + rand() * 8).toFixed(1));

  const layers = [
    decorLayer({
      id:`${type}-back`, generator:back, role:'decor-back', seed:`${seed}-${type}-back`,
      x:50, y:50, width:'112%', opacity:.28 + rand()*.24, depth:.03, decorMotion:ambientMotion
    }),
    decorLayer({
      id:`${type}-ambient`, generator:type === 'gallery' ? 'glow' : (themeId === 'celestial-night' ? 'stars' : 'mist'),
      role:'ambient', seed:`${seed}-${type}-ambient`, x, y, width:'118%', opacity:.22 + rand()*.26, depth:.06,
      decorMotion:'drift'
    }),
    textLayer(`${type}-eyebrow`, copy.eyebrow, 'content', 'clip-up', 120),
    textLayer(`${type}-title`, copy.title, 'content', heroMotion, 360),
    textLayer(`${type}-body`, copy.body, 'content', 'fade-up', 620),
    decorLayer({
      id:`${type}-front`, generator:front, role:'decor-front', seed:`${seed}-${type}-front`,
      x:50, y:74 + rand()*8, width:`${Math.round(84 + rand()*28)}%`, opacity:.18 + rand()*.22,
      depth:.14 + rand()*.08, motion:'fade-up', decorMotion:ambientMotion
    })
  ];

  if (type === 'rsvp') {
    layers.push({
      id:'rsvp-action', kind:'button', role:'interaction', content:'Konfirmasi Kehadiran',
      motion:{ preset:'zoom-soft', delayMs:900, durationMs:780, easing:'premium', once:true }
    });
  }

  return {
    id:type,
    type,
    preset:`${themeId}-${type}`,
    generator:{ version:1, seed, sceneIndex:index, generated:true },
    background:{ type:'procedural', transition:'crossfade', durationMs:6500, transitionMs:1200, kenBurns:pick(rand,['zoom-in','zoom-out','pan-right']) },
    atmosphere:{ effects:pick(rand,[['glow','vignette'],['glow','grain'],['glow','vignette','grain']]), intensity:Number((.38 + rand()*.22).toFixed(2)) },
    timeline:[],
    layers,
    responsive:{
      desktop:{ particleMultiplier:1, parallaxMultiplier:1 },
      tablet:{ particleMultiplier:.72, parallaxMultiplier:.7 },
      mobile:{ particleMultiplier:.48, parallaxMultiplier:.4 }
    }
  };
}

export function generateAutoTemplate({ themeId='jawa-luxury', seed }={}) {
  const resolvedSeed = seed || createVariationSeed(getThemeSeedPrefix(themeId));
  const project = createThemeProject(themeId, resolvedSeed);
  const sceneTypes = ['couple','event','story','gallery','rsvp','closing'];
  const generatedScenes = sceneTypes.map((type, index) => generateScene(project.project.preset, type, resolvedSeed, index + 1));

  project.project = {
    ...project.project,
    id:`auto-${project.project.preset}-${resolvedSeed.toLowerCase()}`,
    name:`Auto ${project.project.name}`,
    generatedAt:new Date().toISOString(),
    generatorVersion:'1.0.0'
  };
  project.generator = {
    mode:'auto-create',
    version:'1.0.0',
    themeId:project.project.preset,
    seed:resolvedSeed,
    sceneCount:7,
    generatedSceneCount:6
  };
  project.scenes = [project.scenes[0], ...generatedScenes];
  return project;
}

export function summarizeGeneratedTemplate(project) {
  return {
    seed:project.project?.seed || '-',
    theme:project.project?.preset || '-',
    scenes:project.scenes?.length || 0,
    layers:(project.scenes || []).reduce((sum, scene) => sum + (scene.layers?.length || 0), 0),
    generated:project.generator?.generatedSceneCount || 0
  };
}
