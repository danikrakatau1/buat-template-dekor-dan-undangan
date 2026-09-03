const commonTimeline = [
  { at: 120, target: 'hero-decor', action: 'reveal' },
  { at: 900, target: 'hero-ambient', action: 'start' },
  { at: 1450, target: 'cover-title', action: 'reveal' },
  { at: 1900, target: 'couple-name', action: 'reveal' },
  { at: 2350, target: 'open-button', action: 'reveal' }
];

const emptyScenes = [
  ['couple','couple'],['event','event'],['story','story'],['gallery','gallery'],['rsvp','rsvp'],['closing','closing']
].map(([id,type]) => ({ id, type, layers: [] }));

function layer(id, generator, role, transform={}, motion={}) {
  return {
    id,
    kind: 'decor',
    role,
    asset: { type:'procedural', generator, seed:id, variant: motion.variant || 'soft', count: motion.count },
    transform,
    motion: {
      preset: motion.preset || 'fade-in',
      delayMs: motion.delayMs || 0,
      durationMs: motion.durationMs || 1100,
      parallax: motion.parallax || transform.depth || 0,
      decorMotion: motion.decorMotion || 'float',
      decorDurationMs: motion.decorDurationMs || 7600
    }
  };
}

function baseCover({ preset, background, atmosphere, decor, title='The Wedding Of', names='Anif & Dini' }) {
  return {
    id:'cover', type:'cover', preset, background,
    atmosphere,
    timeline: commonTimeline,
    layers:[
      ...decor,
      {
        id:'cover-title', kind:'text', role:'content', content:title,
        motion:{ preset:'clip-up', delayMs:1450, durationMs:850, easing:'premium', once:true }
      },
      {
        id:'couple-name', kind:'text', role:'content', content:names,
        motion:{ preset:'fade-up', delayMs:1900, durationMs:1000, easing:'premium', once:true }
      },
      {
        id:'open-button', kind:'button', role:'interaction', content:'Buka Undangan',
        motion:{ preset:'zoom-soft', delayMs:2350, durationMs:780, easing:'premium', once:true }
      }
    ],
    responsive:{
      desktop:{ particleMultiplier:1, parallaxMultiplier:1 },
      tablet:{ particleMultiplier:.72, parallaxMultiplier:.7 },
      mobile:{ particleMultiplier:.48, parallaxMultiplier:.4 }
    }
  };
}

export const THEME_PACKS = Object.freeze({
  'jawa-luxury': {
    id:'jawa-luxury', label:'Jawa Luxury', seedPrefix:'JL',
    palette:{ background:'#160f0b', surface:'#2a1a12', text:'#f7ead7', accent:'#d7ae67', muted:'#a58d78' },
    tokens:{ radius:24, motionIntensity:.8, decorIntensity:.78 },
    createCover(){
      return baseCover({
        preset:'jawa-cinematic',
        background:{ type:'procedural', transition:'cinematic-crossfade', durationMs:6000, transitionMs:1200, kenBurns:'zoom-in' },
        atmosphere:{ effects:['glow','vignette','grain'], intensity:.62 },
        decor:[
          layer('batik-back','batik','decor-back',{x:50,y:50,width:'108%',depth:.03,opacity:.52},{preset:'fade-in',decorMotion:'drift',decorDurationMs:16000}),
          layer('hero-decor','gunungan','decor-main',{x:50,y:56,width:'74%',depth:.14},{preset:'rise-soft',parallax:.14,decorMotion:'breathe'}),
          layer('ornament-frame','ornament-frame','decor-front',{x:50,y:50,width:'91%',depth:.2,opacity:.78},{preset:'fade-in',parallax:.08,decorMotion:'sway',decorDurationMs:11000}),
          layer('hero-ambient','mist','ambient',{x:50,y:55,width:'118%',depth:.05,opacity:.7},{preset:'fade-in',decorMotion:'drift',decorDurationMs:13000})
        ]
      });
    }
  },
  'ocean-romantic': {
    id:'ocean-romantic', label:'Ocean Romantic', seedPrefix:'OR',
    palette:{ background:'#071a24', surface:'#0d3440', text:'#effcff', accent:'#8ee7e3', muted:'#8eb8c3' },
    tokens:{ radius:28, motionIntensity:.72, decorIntensity:.7 },
    createCover(){
      return baseCover({
        preset:'ocean-dream',
        background:{ type:'procedural', transition:'crossfade', durationMs:7000, transitionMs:1500, kenBurns:'pan-right' },
        atmosphere:{ effects:['glow','vignette'], intensity:.55 },
        decor:[
          layer('ocean-glow','glow','decor-back',{x:50,y:34,width:'112%',depth:.02,opacity:.82},{preset:'fade-in',decorMotion:'breathe',decorDurationMs:9000}),
          layer('hero-ambient','mist','ambient',{x:50,y:37,width:'125%',depth:.05,opacity:.68},{preset:'fade-in',decorMotion:'drift',decorDurationMs:14000}),
          layer('hero-decor','wave','decor-main',{x:50,y:69,width:'132%',depth:.16,opacity:.92},{preset:'fade-up',parallax:.16,decorMotion:'sway',decorDurationMs:8000,variant:'deep'}),
          layer('wave-front','wave','decor-front',{x:50,y:79,width:'145%',depth:.28,opacity:.42},{preset:'fade-up',parallax:.22,decorMotion:'sway',decorDurationMs:10500,variant:'soft'})
        ]
      });
    }
  },
  'celestial-night': {
    id:'celestial-night', label:'Celestial Night', seedPrefix:'CN',
    palette:{ background:'#060817', surface:'#11142d', text:'#f5f2ff', accent:'#b8a7ff', muted:'#9c9abd' },
    tokens:{ radius:26, motionIntensity:.84, decorIntensity:.76 },
    createCover(){
      return baseCover({
        preset:'celestial-dream',
        background:{ type:'procedural', transition:'cosmic-dissolve', durationMs:8000, transitionMs:1800, kenBurns:'zoom-out' },
        atmosphere:{ effects:['glow','vignette','grain'], intensity:.58 },
        decor:[
          layer('cosmic-glow','glow','decor-back',{x:50,y:35,width:'118%',depth:.02,opacity:.78},{preset:'fade-in',decorMotion:'breathe',decorDurationMs:10000}),
          layer('hero-ambient','stars','ambient',{x:50,y:50,width:'116%',depth:.12,opacity:.88},{preset:'fade-in',parallax:.1,decorMotion:'drift',decorDurationMs:18000,count:74}),
          layer('hero-decor','ornament-frame','decor-main',{x:50,y:50,width:'76%',depth:.18,opacity:.5},{preset:'zoom-soft',parallax:.13,decorMotion:'sway',decorDurationMs:15000}),
          layer('celestial-mist','mist','decor-front',{x:50,y:72,width:'132%',depth:.24,opacity:.52},{preset:'fade-up',parallax:.18,decorMotion:'drift',decorDurationMs:12000})
        ]
      });
    }
  }
});

export function createThemeProject(themeId='jawa-luxury', seed) {
  const pack = THEME_PACKS[themeId] || THEME_PACKS['jawa-luxury'];
  return {
    project:{
      id:`demo-${pack.id}`,
      name:`${pack.label} Demo`,
      version:1,
      preset:pack.id,
      seed:seed || `${pack.seedPrefix}-DEMO-001`
    },
    theme:{ id:pack.id, palette:pack.palette, tokens:pack.tokens },
    audio:{ src:'', autoplayAfterOpen:true, loop:true, volume:.75, fadeInMs:1200 },
    scenes:[pack.createCover(), ...emptyScenes.map(scene => ({...scene}))]
  };
}

export function getThemePackOptions(){
  return Object.values(THEME_PACKS).map(({id,label}) => ({id,label}));
}
