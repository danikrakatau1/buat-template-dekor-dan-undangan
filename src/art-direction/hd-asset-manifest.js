import { validateAssetMeta } from './asset-taxonomy.js';
import { RUNTIME_ENGRAVING_ARTWORK, RUNTIME_ENGRAVING_META } from './runtime-artwork/runtime-artwork-pack.js';

function vectorAsset(id,role,family,src,presets=['jawa-heritage-floral'],quality='foreground'){
  return Object.freeze({id,role,family,presets,src,kind:'image',format:'svg',quality,status:'ready',scalable:true});
}
function rasterAsset(id,role,family,src,fallbackSrc,meta,presets=['jawa-heritage-floral'],quality='foreground'){
  return Object.freeze({
    id,role,family,presets,src,fallbackSrc,kind:'image',format:'webp',quality,status:'ready',scalable:false,
    artworkQuality:'generated-engraving',runtimeSwap:'9.9.3',optimized:true,sourceMeta:meta,
    delivery:{transport:meta?.transport || 'runtime',decode:'async',preload:true,alphaCleanup:meta?.alphaCleanup || null}
  });
}

export const HD_ASSET_MANIFEST=Object.freeze({
  'paper-parchment-cream-01':vectorAsset('paper-parchment-cream-01','base','parchment','/assets/art/backgrounds/jawa-heritage-floral/bg-parchment-cream-01.svg',['jawa-heritage-floral','jawa-luxury'],'background'),
  'landscape-java-engraving-01':rasterAsset('landscape-java-engraving-01','background','engraved-landscape',RUNTIME_ENGRAVING_ARTWORK.landscape,'/assets/art/landscapes/jawa/landscape-java-engraving-01.svg',RUNTIME_ENGRAVING_META.landscape,['jawa-heritage-floral','jawa-luxury','mountain-heritage'],'background'),
  'tree-frame-left-sepia-01':vectorAsset('tree-frame-left-sepia-01','environment-back','tree-frame','/assets/art/nature/trees/tree-frame-left-sepia-01.svg',['jawa-heritage-floral','jawa-luxury','mountain-heritage']),
  'tree-frame-right-sepia-01':vectorAsset('tree-frame-right-sepia-01','environment-back','tree-frame','/assets/art/nature/trees/tree-frame-right-sepia-01.svg',['jawa-heritage-floral','jawa-luxury','mountain-heritage']),
  'arch-jawa-carved-gold-01':vectorAsset('arch-jawa-carved-gold-01','ornament-back','carved-arch','/assets/art/ornaments/arches/arch-jawa-carved-gold-02.svg',['jawa-heritage-floral','jawa-luxury'],'hero'),
  'hero-joglo-sepia-01':rasterAsset('hero-joglo-sepia-01','hero','joglo',RUNTIME_ENGRAVING_ARTWORK.joglo,'/assets/art/architecture/joglo/hero-joglo-sepia-02.svg',RUNTIME_ENGRAVING_META.joglo,['jawa-heritage-floral','jawa-luxury','mountain-heritage'],'hero'),
  'orn-gunungan-gold-01':vectorAsset('orn-gunungan-gold-01','ornament-front','gunungan','/assets/art/ornaments/gunungan/orn-gunungan-gold-01.svg',['jawa-heritage-floral','jawa-luxury']),
  'floral-side-left-burgundy-01':vectorAsset('floral-side-left-burgundy-01','ornament-front','floral-side','/assets/art/florals/side/floral-side-left-burgundy-01.svg',['jawa-heritage-floral','jawa-luxury']),
  'floral-side-right-burgundy-01':vectorAsset('floral-side-right-burgundy-01','ornament-front','floral-side','/assets/art/florals/side/floral-side-right-burgundy-01.svg',['jawa-heritage-floral','jawa-luxury']),
  'floral-bottom-burgundy-01':rasterAsset('floral-bottom-burgundy-01','foreground-floral','floral-bottom',RUNTIME_ENGRAVING_ARTWORK.floralBottom,'/assets/art/florals/bottom/floral-bottom-burgundy-02.svg',RUNTIME_ENGRAVING_META.floralBottom,['jawa-heritage-floral','jawa-luxury']),
  'overlay-warm-haze-01':vectorAsset('overlay-warm-haze-01','atmosphere-front','haze','/assets/overlays/haze/overlay-warm-haze-01.svg',['jawa-heritage-floral','jawa-luxury','mountain-heritage'],'overlay'),
  'texture-grain-paper-01':vectorAsset('texture-grain-paper-01','ui-fx','grain','/assets/textures/grain/texture-grain-paper-01.svg',['jawa-heritage-floral','jawa-luxury'],'overlay')
});

export const ROYAL_JOGLO_GARDEN_ASSETS=Object.freeze(Object.keys(HD_ASSET_MANIFEST));
export function getHdAsset(id){return HD_ASSET_MANIFEST[id]||null;}
export function auditHdManifest(ids=ROYAL_JOGLO_GARDEN_ASSETS){
  const assets=ids.map(getHdAsset).filter(Boolean),invalid=[];
  for(const asset of assets){const check=validateAssetMeta(asset);if(!check.valid) invalid.push({id:asset.id,errors:check.errors});}
  const missing=ids.filter(id=>!getHdAsset(id));
  return {
    valid:invalid.length===0&&missing.length===0,
    assets:assets.length,
    ready:assets.filter(a=>a.status==='ready').length,
    scalable:assets.filter(a=>a.scalable).length,
    rasterEngraving:assets.filter(a=>a.artworkQuality==='generated-engraving').length,
    optimizedRaster:assets.filter(a=>a.optimized&&a.format==='webp').length,
    invalid,missing,ids:[...ids]
  };
}
