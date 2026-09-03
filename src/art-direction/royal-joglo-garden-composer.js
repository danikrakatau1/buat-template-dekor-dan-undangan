import { getHdAsset, ROYAL_JOGLO_GARDEN_ASSETS, auditHdManifest } from './hd-asset-manifest.js';

function imageLayer(id, role, transform={}, motion={}){
  const asset=getHdAsset(id);
  return {
    id,
    kind:'image',
    role,
    asset:{ src:asset?.src || '', manifestId:id, quality:asset?.quality || 'foreground' },
    transform,
    motion:{ preset:motion.preset || 'fade-in', durationMs:motion.durationMs || 1100, delayMs:motion.delayMs || 0, parallax:motion.parallax ?? transform.depth ?? 0, decorMotion:motion.decorMotion || '', decorDurationMs:motion.decorDurationMs || 12000 },
    fidelity:{ family:asset?.family, status:asset?.status, fallback:asset?.fallback }
  };
}

function textLayer(id, content, motion='fade-up', delayMs=0, extra={}){
  return { id, kind:'text', role:'content', content, motion:{ preset:motion, durationMs:900, delayMs, easing:'premium', once:true }, ...extra };
}

export function composeRoyalJogloGarden({ names='Anif & Dini', eyebrow='THE WEDDING OF', guest='Tamu Undangan', seed='RJG-001' }={}){
  const manifest=auditHdManifest();
  const scene={
    id:'cover', type:'cover', preset:'jawa-heritage-floral-royal-joglo-garden',
    fidelity:{ system:'hd-layered', composition:'royal-joglo-garden', seed, manifestReady:manifest.valid, assetIds:[...ROYAL_JOGLO_GARDEN_ASSETS] },
    background:{ type:'procedural', transition:'cinematic-crossfade', durationMs:9000, transitionMs:1600, kenBurns:'zoom-in' },
    atmosphere:{ effects:['glow','vignette','grain'], intensity:.42 },
    timeline:[
      { at:100,target:'arch-jawa-carved-gold-01',action:'reveal' },
      { at:520,target:'hero-joglo-sepia-01',action:'reveal' },
      { at:950,target:'orn-gunungan-gold-01',action:'reveal' },
      { at:1350,target:'cover-title',action:'reveal' },
      { at:1720,target:'couple-name',action:'reveal' },
      { at:2150,target:'guest-name',action:'reveal' },
      { at:2600,target:'open-button',action:'reveal' }
    ],
    layers:[
      imageLayer('paper-parchment-cream-01','base',{x:50,y:50,width:'112%',opacity:1,depth:0},{preset:'fade-in'}),
      imageLayer('landscape-java-engraving-01','background',{x:50,y:45,width:'122%',opacity:.6,depth:.025},{preset:'fade-in',decorMotion:'drift',decorDurationMs:22000}),
      imageLayer('tree-frame-left-sepia-01','environment-back',{x:8,y:48,width:'48%',opacity:.72,depth:.06},{preset:'fade-right',parallax:.08,decorMotion:'sway',decorDurationMs:17000}),
      imageLayer('tree-frame-right-sepia-01','environment-back',{x:92,y:48,width:'48%',opacity:.72,depth:.06},{preset:'fade-left',parallax:.08,decorMotion:'sway',decorDurationMs:17000}),
      imageLayer('arch-jawa-carved-gold-01','ornament-back',{x:50,y:8,width:'106%',opacity:.86,depth:.1},{preset:'clip-up',parallax:.06}),
      imageLayer('hero-joglo-sepia-01','hero',{x:50,y:67,width:'92%',opacity:.92,depth:.14},{preset:'rise-soft',parallax:.13,decorMotion:'breathe',decorDurationMs:15000}),
      imageLayer('orn-gunungan-gold-01','ornament-front',{x:50,y:23,width:'23%',opacity:.88,depth:.18},{preset:'zoom-soft',parallax:.14,decorMotion:'float',decorDurationMs:10000}),
      textLayer('cover-title',eyebrow,'clip-up',1350,{ style:{ letterSpacing:'.24em' } }),
      textLayer('couple-name',names,'fade-up',1720),
      textLayer('guest-kicker','Kepada Yth.','fade-up',1960),
      textLayer('guest-name',guest,'fade-up',2150),
      imageLayer('floral-side-left-burgundy-01','ornament-front',{x:7,y:44,width:'43%',opacity:.96,depth:.22},{preset:'fade-right',parallax:.18,decorMotion:'sway',decorDurationMs:12000}),
      imageLayer('floral-side-right-burgundy-01','ornament-front',{x:93,y:44,width:'43%',opacity:.96,depth:.22},{preset:'fade-left',parallax:.18,decorMotion:'sway',decorDurationMs:12000}),
      imageLayer('floral-bottom-burgundy-01','foreground-floral',{x:50,y:91,width:'118%',opacity:.98,depth:.3},{preset:'fade-up',parallax:.24,decorMotion:'float',decorDurationMs:14000}),
      imageLayer('overlay-warm-haze-01','atmosphere-front',{x:50,y:52,width:'120%',opacity:.34,depth:.04},{preset:'fade-in',decorMotion:'drift',decorDurationMs:18000}),
      { id:'open-button', kind:'button', role:'interaction', content:'Buka Undangan', motion:{ preset:'zoom-soft', delayMs:2600, durationMs:760, easing:'premium', once:true } },
      imageLayer('texture-grain-paper-01','ui-fx',{x:50,y:50,width:'110%',opacity:.14,depth:0},{preset:'fade-in'})
    ],
    responsive:{ desktop:{parallaxMultiplier:1}, tablet:{parallaxMultiplier:.72}, mobile:{parallaxMultiplier:.42} }
  };

  return scene;
}

export function createRoyalJogloGardenProject(options={}){
  const seed=options.seed || 'RJG-001';
  return {
    project:{ id:`royal-joglo-garden-${String(seed).toLowerCase()}`, name:'Royal Joglo Garden', version:1, preset:'jawa-heritage-floral', seed },
    theme:{ id:'jawa-heritage-floral', palette:{ background:'#efe3c9', surface:'#f8f0df', text:'#77552c', accent:'#ad8446', muted:'#a78358' }, tokens:{ radius:26, motionIntensity:.72, decorIntensity:.84 } },
    fidelity:{ mode:'hd-layered', composition:'royal-joglo-garden', manifest:auditHdManifest() },
    audio:{ src:'', autoplayAfterOpen:true, loop:true, volume:.72, fadeInMs:1400 },
    scenes:[composeRoyalJogloGarden(options)]
  };
}
