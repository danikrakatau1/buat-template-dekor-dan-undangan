import { ROYAL_JOGLO_GARDEN_ASSETS, auditHdManifest } from './hd-asset-manifest.js';
import { getRegisteredAsset, auditFinalAssetRegistry, FINAL_ASSET_REGISTRY_VERSION } from './final-asset-registry.js';

function imageLayer(id,role,transform={},motion={}){
  const asset=getRegisteredAsset(id);
  const registry=asset?.registry || null;
  return {
    id,kind:'image',role,
    asset:{
      src:asset?.src||'',fallbackSrc:asset?.fallbackSrc||'',manifestId:id,
      productionSrc:registry?.productionPath||'',preferredFormats:registry?.preferredFormats||[],
      quality:asset?.quality||'foreground',format:asset?.format||'svg',delivery:asset?.delivery||null
    },
    transform,
    motion:{preset:motion.preset||'fade-in',durationMs:motion.durationMs||1100,delayMs:motion.delayMs||0,parallax:motion.parallax??transform.depth??registry?.depth??0,decorMotion:motion.decorMotion||registry?.motion||'',decorDurationMs:motion.decorDurationMs||12000},
    fidelity:{family:asset?.family,status:asset?.status,scalable:Boolean(asset?.scalable),artworkQuality:asset?.artworkQuality||'vector',optimized:Boolean(asset?.optimized),registryVersion:FINAL_ASSET_REGISTRY_VERSION,priority:registry?.priority||'P2',required:Boolean(registry?.required)}
  };
}
function textLayer(id,content,y,width='78%',motion='fade-up',delayMs=0){return {id,kind:'text',role:'content',content,transform:{x:50,y,width,opacity:1},motion:{preset:motion,durationMs:900,delayMs,easing:'premium',once:true}};}

export function composeRoyalJogloGarden({names='Anif & Dini',eyebrow='THE WEDDING OF',guest='Tamu Undangan',seed='RJG-001'}={}){
  const manifest=auditHdManifest(),registry=auditFinalAssetRegistry();
  return {
    id:'cover',type:'cover',preset:'jawa-heritage-floral-royal-joglo-garden',
    fidelity:{system:'hd-vector-layered',artworkMode:'generated-engraving-raster-v2-clean',composition:'royal-joglo-garden',tuning:'final-asset-registry-v1',seed,manifestReady:manifest.valid,registryReady:registry.contractReady,registryVersion:registry.version,assetIds:[...ROYAL_JOGLO_GARDEN_ASSETS],optimization:{asyncDecode:true,objectUrlTransport:true,alphaEdgeSafe:true,optimizedRaster:manifest.optimizedRaster},productionPromotionPending:registry.productionPromotionPending},
    background:{type:'procedural',transition:'cinematic-crossfade',durationMs:11000,transitionMs:1800,kenBurns:'zoom-in'},
    atmosphere:{effects:['glow','vignette','grain'],intensity:.11},
    timeline:[{at:60,target:'paper-parchment-cream-01',action:'reveal'},{at:180,target:'landscape-java-engraving-01',action:'reveal'},{at:470,target:'arch-jawa-carved-gold-01',action:'reveal'},{at:650,target:'hero-joglo-sepia-01',action:'reveal'},{at:860,target:'orn-gunungan-gold-01',action:'reveal'},{at:1060,target:'cover-title',action:'reveal'},{at:1300,target:'couple-name',action:'reveal'},{at:1660,target:'guest-name',action:'reveal'},{at:2040,target:'open-button',action:'reveal'},{at:2200,target:'floral-bottom-burgundy-01',action:'reveal'}],
    layers:[
      imageLayer('paper-parchment-cream-01','base',{x:50,y:50,width:'116%',opacity:1,depth:0}),
      imageLayer('landscape-java-engraving-01','background',{x:50,y:50,width:'112%',opacity:.80,depth:.018},{parallax:.018,decorMotion:'drift',decorDurationMs:32000}),
      imageLayer('tree-frame-left-sepia-01','environment-back',{x:1.5,y:51,width:'40%',opacity:.10,depth:.052},{preset:'fade-right',parallax:.04,decorMotion:'sway',decorDurationMs:25000}),
      imageLayer('tree-frame-right-sepia-01','environment-back',{x:98.5,y:51,width:'40%',opacity:.10,depth:.052},{preset:'fade-left',parallax:.04,decorMotion:'sway',decorDurationMs:25000}),
      imageLayer('arch-jawa-carved-gold-01','ornament-back',{x:50,y:6.2,width:'112%',opacity:.82,depth:.078},{preset:'clip-up',parallax:.032}),
      imageLayer('hero-joglo-sepia-01','hero',{x:50,y:80.5,width:'86%',opacity:.98,depth:.12},{preset:'rise-soft',parallax:.068,decorMotion:'breathe',decorDurationMs:26000}),
      imageLayer('orn-gunungan-gold-01','ornament-front',{x:50,y:21.7,width:'15%',opacity:.82,depth:.15},{preset:'zoom-soft',parallax:.07,decorMotion:'float',decorDurationMs:16000}),
      textLayer('cover-title',eyebrow,31.2,'74%','clip-up',1060),textLayer('couple-name',names,37.8,'84%','fade-up',1300),textLayer('guest-kicker','Kepada Bapak/Ibu/Saudara/i',45.3,'72%','fade-up',1510),textLayer('guest-name',guest,48.6,'70%','fade-up',1660),textLayer('guest-place','Di Tempat',51.4,'68%','fade-up',1780),
      imageLayer('floral-side-left-burgundy-01','ornament-front',{x:2.5,y:47,width:'32%',opacity:.11,depth:.19},{preset:'fade-right',parallax:.07,decorMotion:'sway',decorDurationMs:22000}),
      imageLayer('floral-side-right-burgundy-01','ornament-front',{x:97.5,y:47,width:'32%',opacity:.11,depth:.19},{preset:'fade-left',parallax:.07,decorMotion:'sway',decorDurationMs:22000}),
      imageLayer('floral-bottom-burgundy-01','foreground-floral',{x:50,y:92.5,width:'116%',opacity:.99,depth:.27},{preset:'fade-up',parallax:.12,decorMotion:'float',decorDurationMs:24000}),
      imageLayer('overlay-warm-haze-01','atmosphere-front',{x:50,y:49,width:'122%',opacity:.08,depth:.025},{decorMotion:'drift',decorDurationMs:28000}),
      {id:'open-button',kind:'button',role:'interaction',content:'Buka Undangan',transform:{x:50,y:58.1},motion:{preset:'zoom-soft',delayMs:2040,durationMs:760,easing:'premium',once:true}},
      imageLayer('texture-grain-paper-01','ui-fx',{x:50,y:50,width:'114%',opacity:.04,depth:0})
    ],responsive:{desktop:{parallaxMultiplier:.68},tablet:{parallaxMultiplier:.46},mobile:{parallaxMultiplier:.20}}
  };
}

export function createRoyalJogloGardenProject(options={}){
  const seed=options.seed||'RJG-001',manifest=auditHdManifest(),registry=auditFinalAssetRegistry();
  return {project:{id:`royal-joglo-garden-${String(seed).toLowerCase()}`,name:'Royal Joglo Garden',version:1,preset:'jawa-luxury',seed},theme:{id:'jawa-luxury',palette:{background:'#f1e6ce',surface:'#f8f0df',text:'#76552f',accent:'#a77a42',muted:'#9c7d59'},tokens:{radius:26,motionIntensity:.50,decorIntensity:.74}},variation:{seed,layout:'royal-joglo-garden',heroVariant:'joglo-engraving-raster',backgroundMotion:'zoom-in',motion:{hero:'rise-soft',title:'clip-up',names:'fade-up'},atmosphere:['warm-haze','paper-grain']},fidelity:{mode:'hd-vector-layered',artworkMode:'generated-engraving-raster-v2-clean',composition:'royal-joglo-garden',tuning:'final-asset-registry-v1',manifest,registry},generator:{mode:'fidelity-composer',version:'9.9.4'},audio:{src:'',autoplayAfterOpen:true,loop:true,volume:.72,fadeInMs:1400},scenes:[composeRoyalJogloGarden(options)]};
}
