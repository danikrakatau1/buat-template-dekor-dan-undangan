export const HERITAGE_ART_STYLE_LOCK = Object.freeze({
  id:'jawa-heritage-engraving-luxury-v1',
  label:'Javanese Heritage · Vintage Engraving · Luxury Stationery',
  targetPreset:'jawa-luxury',
  targetComposition:'royal-joglo-garden',
  intent:'premium illustrated wedding artwork with real engraving depth, not flat vector decoration',
  visualLanguage:Object.freeze({
    medium:['vintage engraving','etching','fine hatching','antique stationery illustration'],
    palette:['antique cream','#efe3c9','warm sepia','#8b6a43','muted burgundy','#7f2931','olive foliage','#6f7652','restrained gold','#ad8446'],
    lighting:['soft paper luminance','warm horizon haze','restrained highlight bloom'],
    composition:['ornamental carved arch','natural tree framing','mountain landscape','centered joglo','botanical foreground','clear central negative space'],
    detail:['fine linework','cross-hatching','wood carving cues','botanical vein detail','layered mountain contour'],
    forbidden:['flat clipart flowers','simple geometric joglo','neon glow','giant gunungan','synthetic gradients as hero art','oversaturated botanical colors','cartoon architecture']
  }),
  rendering:Object.freeze({
    preferredHeroFormat:['webp','avif','png'],
    vectorUse:'ornaments-only-unless-complex-handcrafted',
    textless:true,
    transparentIsolation:true,
    colorSpace:'sRGB',
    alpha:'premultiplied-safe',
    maxMotionAmplitude:'restrained',
    gpuBackend:'pixi-webgl',
    motionBackend:'gsap'
  }),
  quality:Object.freeze({
    backgroundLongEdge:3200,
    heroLongEdge:2200,
    foregroundLongEdge:1800,
    overlayLongEdge:1800,
    targetDpr:2,
    noVisibleUpscale:true,
    edgeCleanup:true,
    noBakedText:true
  })
});

export function validateHeritageArtAsset(asset={}){
  const errors=[];
  if(!asset.id) errors.push('asset.id is required');
  if(!asset.slot) errors.push('asset.slot is required');
  if(!asset.role) errors.push('asset.role is required');
  if(!asset.kind) errors.push('asset.kind is required');
  if(asset.textless!==true) errors.push('asset.textless must be true');
  if(asset.kind==='isolated' && asset.transparent!==true) errors.push('isolated assets must be transparent');
  if(asset.bakedText===true) errors.push('baked text is forbidden');
  return {valid:errors.length===0,errors};
}
