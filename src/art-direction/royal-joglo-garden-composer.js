import { getHdAsset, ROYAL_JOGLO_GARDEN_ASSETS, auditHdManifest } from './hd-asset-manifest.js';

function imageLayer(id,role,transform={},motion={}){
  const asset=getHdAsset(id);
  return {id,kind:'image',role,asset:{src:asset?.src||'',fallbackSrc:asset?.fallbackSrc||'',manifestId:id,quality:asset?.quality||'foreground',format:asset?.format||'svg'},transform,motion:{preset:motion.preset||'fade-in',durationMs:motion.durationMs||1100,delayMs:motion.delayMs||0,parallax:motion.parallax??transform.depth??0,decorMotion:motion.decorMotion||'',decorDurationMs:motion.decorDurationMs||12000},fidelity:{family:asset?.family,status:asset?.status,scalable:Boolean(asset?.scalable),artworkQuality:asset?.artworkQuality||'vector'}};
}
function textLayer(id,content,y,width='78%',motion='fade-up',delayMs=0){return {id,kind:'text',role:'content',content,transform:{x:50,y,width,opacity:1},motion:{preset:motion,durationMs:900,delayMs,easing:'premium',once:true}};}

export function composeRoyalJogloGarden({names='Anif & Dini',eyebrow='THE WEDDING OF',guest='Tamu Undangan',seed='RJG-001'}={}){
  const manifest=auditHdManifest();
  return {
    id:'cover',type:'cover',preset:'jawa-heritage-floral-royal-joglo-garden',
    fidelity:{system:'hd-vector-layered',artworkMode:'generated-engraving-raster-v1',composition:'royal-joglo-garden',tuning:'runtime-artwork-swap-v1',seed,manifestReady:manifest.valid,assetIds:[...ROYAL_JOGLO_GARDEN_ASSETS]},
    background:{type:'procedural',transition:'cinematic-crossfade',durationMs:11000,transitionMs:1800,kenBurns:'zoom-in'},
    atmosphere:{effects:['glow','vignette','grain'],intensity:.12},
    timeline:[{at:60,target:'paper-parchment-cream-01',action:'reveal'},{at:180,target:'landscape-java-engraving-01',action:'reveal'},{at:470,target:'arch-jawa-carved-gold-01',action:'reveal'},{at:650,target:'hero-joglo-sepia-01',action:'reveal'},{at:860,target:'orn-gunungan-gold-01',action:'reveal'},{at:1060,target:'cover-title',action:'reveal'},{at:1300,target:'couple-name',action:'reveal'},{at:1660,target:'guest-name',action:'reveal'},{at:2040,target:'open-button',action:'reveal'},{at:2200,target:'floral-bottom-burgundy-01',action:'reveal'}],
    layers:[
      imageLayer('paper-parchment-cream-01','base',{x:50,y:50,width:'116%',opacity:1,depth:0}),
      imageLayer('landscape-java-engraving-01','background',{x:50,y:50,width:'112%',opacity:.78,depth:.018},{parallax:.018,decorMotion:'drift',decorDurationMs:30000}),
      imageLayer('tree-frame-left-sepia-01','environment-back',{x:1.5,y:51,width:'42%',opacity:.13,depth:.052},{preset:'fade-right',parallax:.045,decorMotion:'sway',decorDurationMs:23000}),
      imageLayer('tree-frame-right-sepia-01','environment-back',{x:98.5,y:51,width:'42%',opacity:.13,depth:.052},{preset:'fade-left',parallax:.045,decorMotion:'sway',decorDurationMs:23000}),
      imageLayer('arch-jawa-carved-gold-01','ornament-back',{x:50,y:6.2,width:'112%',opacity:.82,depth:.078},{preset:'clip-up',parallax:.035}),
      imageLayer('hero-joglo-sepia-01','hero',{x:50,y:80.5,width:'86%',opacity:.96,depth:.12},{preset:'rise-soft',parallax:.075,decorMotion:'breathe',decorDurationMs:24000}),
      imageLayer('orn-gunungan-gold-01','ornament-front',{x:50,y:21.7,width:'15%',opacity:.82,depth:.15},{preset:'zoom-soft',parallax:.08,decorMotion:'float',decorDurationMs:15000}),
      textLayer('cover-title',eyebrow,31.2,'74%','clip-up',1060),textLayer('couple-name',names,37.8,'84%','fade-up',1300),textLayer('guest-kicker','Kepada Bapak/Ibu/Saudara/i',45.3,'72%','fade-up',1510),textLayer('guest-name',guest,48.6,'70%','fade-up',1660),textLayer('guest-place','Di Tempat',51.4,'68%','fade-up',1780),
      imageLayer('floral-side-left-burgundy-01','ornament-front',{x:2.5,y:47,width:'34%',opacity:.16,depth:.19},{preset:'fade-right',parallax:.08,decorMotion:'sway',decorDurationMs:20000}),
      imageLayer('floral-side-right-burgundy-01','ornament-front',{x:97.5,y:47,width:'34%',opacity:.16,depth:.19},{preset:'fade-left',parallax:.08,decorMotion:'sway',decorDurationMs:20000}),
      imageLayer('floral-bottom-burgundy-01','foreground-floral',{x:50,y:92.5,width:'116%',opacity:.99,depth:.27},{preset:'fade-up',parallax:.13,decorMotion:'float',decorDurationMs:22000}),
      imageLayer('overlay-warm-haze-01','atmosphere-front',{x:50,y:49,width:'122%',opacity:.10,depth:.025},{decorMotion:'drift',decorDurationMs:26000}),
      {id:'open-button',kind:'button',role:'interaction',content:'Buka Undangan',transform:{x:50,y:58.1},motion:{preset:'zoom-soft',delayMs:2040,durationMs:760,easing:'premium',once:true}},
      imageLayer('texture-grain-paper-01','ui-fx',{x:50,y:50,width:'114%',opacity:.045,depth:0})
    ],responsive:{desktop:{parallaxMultiplier:.72},tablet:{parallaxMultiplier:.48},mobile:{parallaxMultiplier:.22}}
  };
}

export function createRoyalJogloGardenProject(options={}){
  const seed=options.seed||'RJG-001',manifest=auditHdManifest();
  return {project:{id:`royal-joglo-garden-${String(seed).toLowerCase()}`,name:'Royal Joglo Garden',version:1,preset:'jawa-luxury',seed},theme:{id:'jawa-luxury',palette:{background:'#f1e6ce',surface:'#f8f0df',text:'#76552f',accent:'#a77a42',muted:'#9c7d59'},tokens:{radius:26,motionIntensity:.52,decorIntensity:.78}},variation:{seed,layout:'royal-joglo-garden',heroVariant:'joglo-engraving-raster',backgroundMotion:'zoom-in',motion:{hero:'rise-soft',title:'clip-up',names:'fade-up'},atmosphere:['warm-haze','paper-grain']},fidelity:{mode:'hd-vector-layered',artworkMode:'generated-engraving-raster-v1',composition:'royal-joglo-garden',tuning:'runtime-artwork-swap-v1',manifest},generator:{mode:'fidelity-composer',version:'9.9.2B'},audio:{src:'',autoplayAfterOpen:true,loop:true,volume:.72,fadeInMs:1400},scenes:[composeRoyalJogloGarden(options)]};
}
