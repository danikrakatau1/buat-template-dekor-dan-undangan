import { HD_ASSET_MANIFEST } from './hd-asset-manifest.js';

const slot=(id,config)=>Object.freeze({id,...config});

export const FINAL_ASSET_REGISTRY_VERSION='9.9.4';

export const ROYAL_JOGLO_FINAL_SLOTS=Object.freeze({
  'paper-parchment-cream-01':slot('paper-parchment-cream-01',{required:true,priority:'P0',role:'base',depth:0,productionPath:'/assets/heritage-hd/backgrounds/paper-parchment-cream-01.webp',preferredFormats:['avif','webp'],target:{longEdge:3200,alpha:false},motion:'static',fallbackPolicy:'svg'}),
  'landscape-java-engraving-01':slot('landscape-java-engraving-01',{required:true,priority:'P0',role:'background',depth:.018,productionPath:'/assets/heritage-hd/backgrounds/landscape-java-engraving-01.webp',preferredFormats:['avif','webp'],target:{longEdge:3840,alpha:false},motion:'drift',fallbackPolicy:'runtime-preview-svg'}),
  'tree-frame-left-sepia-01':slot('tree-frame-left-sepia-01',{required:false,priority:'P1',role:'environment-back',depth:.052,productionPath:'/assets/heritage-hd/nature/tree-frame-left-sepia-01.webp',preferredFormats:['webp','png'],target:{longEdge:2800,alpha:true},motion:'sway',fallbackPolicy:'svg'}),
  'tree-frame-right-sepia-01':slot('tree-frame-right-sepia-01',{required:false,priority:'P1',role:'environment-back',depth:.052,productionPath:'/assets/heritage-hd/nature/tree-frame-right-sepia-01.webp',preferredFormats:['webp','png'],target:{longEdge:2800,alpha:true},motion:'sway',fallbackPolicy:'svg'}),
  'arch-jawa-carved-gold-01':slot('arch-jawa-carved-gold-01',{required:true,priority:'P0',role:'ornament-back',depth:.078,productionPath:'/assets/heritage-hd/ornaments/arch-jawa-carved-gold-01.webp',preferredFormats:['webp','png','svg'],target:{longEdge:3000,alpha:true},motion:'static-parallax',fallbackPolicy:'svg'}),
  'hero-joglo-sepia-01':slot('hero-joglo-sepia-01',{required:true,priority:'P0',role:'hero',depth:.12,productionPath:'/assets/heritage-hd/architecture/hero-joglo-sepia-01.webp',preferredFormats:['avif','webp','png'],target:{longEdge:3600,alpha:true},motion:'breathe',fallbackPolicy:'runtime-preview-svg'}),
  'orn-gunungan-gold-01':slot('orn-gunungan-gold-01',{required:true,priority:'P0',role:'ornament-front',depth:.15,productionPath:'/assets/heritage-hd/ornaments/orn-gunungan-gold-01.webp',preferredFormats:['webp','png','svg'],target:{longEdge:1800,alpha:true},motion:'float',fallbackPolicy:'svg'}),
  'floral-side-left-burgundy-01':slot('floral-side-left-burgundy-01',{required:false,priority:'P1',role:'ornament-front',depth:.19,productionPath:'/assets/heritage-hd/botanicals/floral-side-left-burgundy-01.webp',preferredFormats:['webp','png'],target:{longEdge:2600,alpha:true},motion:'sway',fallbackPolicy:'svg'}),
  'floral-side-right-burgundy-01':slot('floral-side-right-burgundy-01',{required:false,priority:'P1',role:'ornament-front',depth:.19,productionPath:'/assets/heritage-hd/botanicals/floral-side-right-burgundy-01.webp',preferredFormats:['webp','png'],target:{longEdge:2600,alpha:true},motion:'sway',fallbackPolicy:'svg'}),
  'floral-bottom-burgundy-01':slot('floral-bottom-burgundy-01',{required:true,priority:'P0',role:'foreground-floral',depth:.27,productionPath:'/assets/heritage-hd/botanicals/floral-bottom-burgundy-01.webp',preferredFormats:['avif','webp','png'],target:{longEdge:3200,alpha:true},motion:'float',fallbackPolicy:'runtime-preview-svg'}),
  'overlay-warm-haze-01':slot('overlay-warm-haze-01',{required:false,priority:'P2',role:'atmosphere-front',depth:.025,productionPath:'/assets/heritage-hd/overlays/overlay-warm-haze-01.webp',preferredFormats:['webp','png'],target:{longEdge:2400,alpha:true},motion:'drift',fallbackPolicy:'svg'}),
  'texture-grain-paper-01':slot('texture-grain-paper-01',{required:false,priority:'P2',role:'ui-fx',depth:0,productionPath:'/assets/heritage-hd/overlays/texture-grain-paper-01.webp',preferredFormats:['webp','png'],target:{longEdge:2400,alpha:true},motion:'static',fallbackPolicy:'svg'})
});

export const ROYAL_JOGLO_FINAL_IDS=Object.freeze(Object.keys(ROYAL_JOGLO_FINAL_SLOTS));

export function getRegisteredAsset(id){
  const active=HD_ASSET_MANIFEST[id] || null;
  const slotMeta=ROYAL_JOGLO_FINAL_SLOTS[id] || null;
  if(!active && !slotMeta) return null;
  return Object.freeze({...(active||{}),registry:slotMeta,registryVersion:FINAL_ASSET_REGISTRY_VERSION});
}

export function getProductionAssetContract(id){ return ROYAL_JOGLO_FINAL_SLOTS[id] || null; }

export function auditFinalAssetRegistry(){
  const ids=ROYAL_JOGLO_FINAL_IDS;
  const missingActive=[],roleMismatch=[],missingProductionPath=[],missingFallback=[],requiredPending=[];
  let activeReady=0,rasterActive=0,required=0;
  for(const id of ids){
    const slotMeta=ROYAL_JOGLO_FINAL_SLOTS[id],active=HD_ASSET_MANIFEST[id];
    if(slotMeta.required) required++;
    if(!active){ missingActive.push(id); if(slotMeta.required) requiredPending.push(id); continue; }
    activeReady+=active.status==='ready'?1:0;
    rasterActive+=active.format==='webp'?1:0;
    if(active.role!==slotMeta.role) roleMismatch.push({id,expected:slotMeta.role,actual:active.role});
    if(!slotMeta.productionPath) missingProductionPath.push(id);
    if(!active.fallbackSrc && slotMeta.fallbackPolicy!=='svg' && active.format!=='svg') missingFallback.push(id);
    if(slotMeta.required && active.status!=='ready') requiredPending.push(id);
  }
  return Object.freeze({
    version:FINAL_ASSET_REGISTRY_VERSION,
    contractReady:missingActive.length===0&&roleMismatch.length===0&&missingProductionPath.length===0,
    slots:ids.length,required,activeReady,rasterActive,
    missingActive,roleMismatch,missingProductionPath,missingFallback,requiredPending,
    productionPromotionPending:ids.filter(id=>HD_ASSET_MANIFEST[id]?.src!==ROYAL_JOGLO_FINAL_SLOTS[id]?.productionPath),
    ids:[...ids]
  });
}
