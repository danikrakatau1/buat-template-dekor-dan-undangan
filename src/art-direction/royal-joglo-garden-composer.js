import { getHdAsset, ROYAL_JOGLO_GARDEN_ASSETS, auditHdManifest } from './hd-asset-manifest.js';

function imageLayer(id, role, transform={}, motion={}){
  const asset=getHdAsset(id);
  return {
    id, kind:'image', role,
    asset:{ src:asset?.src || '', manifestId:id, quality:asset?.quality || 'foreground', format:asset?.format || 'svg' },
    transform,
    motion:{
      preset:motion.preset || 'fade-in', durationMs:motion.durationMs || 1100, delayMs:motion.delayMs || 0,
      parallax:motion.parallax ?? transform.depth ?? 0, decorMotion:motion.decorMotion || '', decorDurationMs:motion.decorDurationMs || 12000
    },
    fidelity:{ family:asset?.family, status:asset?.status, scalable:Boolean(asset?.scalable) }
  };
}

function textLayer(id, content, y, motion='fade-up', delayMs=0){
  return {
    id, kind:'text', role:'content', content,
    transform:{ x:50, y, width:'78%', opacity:1 },
    motion:{ preset:motion, durationMs:900, delayMs, easing:'premium', once:true }
  };
}

export function composeRoyalJogloGarden({ names='Anif & Dini', eyebrow='THE WEDDING OF', guest='Tamu Undangan', seed='RJG-001' }={}){
  const manifest=auditHdManifest();
  return {
    id:'cover', type:'cover', preset:'jawa-heritage-floral-royal-joglo-garden',
    fidelity:{ system:'hd-vector-layered', composition:'royal-joglo-garden', seed, manifestReady:manifest.valid, assetIds:[...ROYAL_JOGLO_GARDEN_ASSETS] },
    background:{ type:'static', transition:'cinematic-crossfade', durationMs:9000, transitionMs:1600, kenBurns:'zoom-in' },
    atmosphere:{ effects:['glow','vignette','grain'], intensity:.22 },
    timeline:[
      {at:80,target:'paper-parchment-cream-01',action:'reveal'},
      {at:220,target:'landscape-java-engraving-01',action:'reveal'},
      {at:420,target:'arch-jawa-carved-gold-01',action:'reveal'},
      {at:620,target:'hero-joglo-sepia-01',action:'reveal'},
      {at:900,target:'orn-gunungan-gold-01',action:'reveal'},
      {at:1180,target:'cover-title',action:'reveal'},
      {at:1450,target:'couple-name',action:'reveal'},
      {at:1850,target:'guest-name',action:'reveal'},
      {at:2250,target:'open-button',action:'reveal'}
    ],
    layers:[
      imageLayer('paper-parchment-cream-01','base',{x:50,y:50,width:'112%',opacity:1,depth:0},{preset:'fade-in'}),
      imageLayer('landscape-java-engraving-01','background',{x:50,y:60,width:'126%',opacity:.58,depth:.025},{preset:'fade-in',parallax:.025,decorMotion:'drift',decorDurationMs:24000}),
      imageLayer('tree-frame-left-sepia-01','environment-back',{x:5,y:48,width:'48%',opacity:.74,depth:.065},{preset:'fade-right',parallax:.07,decorMotion:'sway',decorDurationMs:18000}),
      imageLayer('tree-frame-right-sepia-01','environment-back',{x:95,y:48,width:'48%',opacity:.74,depth:.065},{preset:'fade-left',parallax:.07,decorMotion:'sway',decorDurationMs:18000}),
      imageLayer('arch-jawa-carved-gold-01','ornament-back',{x:50,y:9,width:'110%',opacity:.9,depth:.09},{preset:'clip-up',parallax:.05}),
      imageLayer('hero-joglo-sepia-01','hero',{x:50,y:75,width:'92%',opacity:.82,depth:.14},{preset:'rise-soft',parallax:.11,decorMotion:'breathe',decorDurationMs:16000}),
      imageLayer('orn-gunungan-gold-01','ornament-front',{x:50,y:20,width:'17%',opacity:.86,depth:.18},{preset:'zoom-soft',parallax:.12,decorMotion:'float',decorDurationMs:11000}),
      textLayer('cover-title',eyebrow,30.5,'clip-up',1180),
      textLayer('couple-name',names,37.5,'fade-up',1450),
      textLayer('guest-kicker','Kepada Bapak/Ibu/Saudara/i',45.8,'fade-up',1670),
      textLayer('guest-name',guest,49.4,'fade-up',1850),
      textLayer('guest-place','Di Tempat',52.5,'fade-up',1990),
      imageLayer('floral-side-left-burgundy-01','ornament-front',{x:5,y:47,width:'39%',opacity:.9,depth:.21},{preset:'fade-right',parallax:.15,decorMotion:'sway',decorDurationMs:13000}),
      imageLayer('floral-side-right-burgundy-01','ornament-front',{x:95,y:47,width:'39%',opacity:.9,depth:.21},{preset:'fade-left',parallax:.15,decorMotion:'sway',decorDurationMs:13000}),
      imageLayer('floral-bottom-burgundy-01','foreground-floral',{x:50,y:91,width:'118%',opacity:.96,depth:.3},{preset:'fade-up',parallax:.2,decorMotion:'float',decorDurationMs:14500}),
      imageLayer('overlay-warm-haze-01','atmosphere-front',{x:50,y:50,width:'118%',opacity:.28,depth:.035},{preset:'fade-in',decorMotion:'drift',decorDurationMs:20000}),
      { id:'open-button', kind:'button', role:'interaction', content:'Buka Undangan', transform:{x:50,y:58.5}, motion:{preset:'zoom-soft',delayMs:2250,durationMs:760,easing:'premium',once:true} },
      imageLayer('texture-grain-paper-01','ui-fx',{x:50,y:50,width:'110%',opacity:.085,depth:0},{preset:'fade-in'})
    ],
    responsive:{ desktop:{parallaxMultiplier:1}, tablet:{parallaxMultiplier:.7}, mobile:{parallaxMultiplier:.38} }
  };
}

export function createRoyalJogloGardenProject(options={}){
  const seed=options.seed || 'RJG-001';
  const manifest=auditHdManifest();
  return {
    project:{ id:`royal-joglo-garden-${String(seed).toLowerCase()}`, name:'Royal Joglo Garden', version:1, preset:'jawa-luxury', seed },
    theme:{ id:'jawa-luxury', palette:{ background:'#efe3c9', surface:'#f8f0df', text:'#75542f', accent:'#a77a42', muted:'#9c7d59' }, tokens:{radius:26,motionIntensity:.66,decorIntensity:.86} },
    variation:{ seed, layout:'royal-joglo-garden', heroVariant:'joglo-sepia', backgroundMotion:'zoom-in', motion:{hero:'rise-soft',title:'clip-up',names:'fade-up'}, atmosphere:['warm-haze','paper-grain'] },
    fidelity:{ mode:'hd-vector-layered', composition:'royal-joglo-garden', manifest },
    generator:{ mode:'fidelity-composer', version:'9.3' },
    audio:{src:'',autoplayAfterOpen:true,loop:true,volume:.72,fadeInMs:1400},
    scenes:[composeRoyalJogloGarden(options)]
  };
}
