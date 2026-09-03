import { validateAssetMeta } from './asset-taxonomy.js';

export const HD_ASSET_MANIFEST = Object.freeze({
  'paper-parchment-cream-01': {
    id:'paper-parchment-cream-01', role:'base', family:'parchment', presets:['jawa-heritage-floral'],
    src:'/assets/art/backgrounds/jawa-heritage-floral/bg-parchment-cream-01.webp', kind:'image', quality:'background', status:'required',
    fallback:{ type:'gradient', value:'linear-gradient(180deg,#f4ead4 0%,#ead9b8 52%,#e3cfa7 100%)' }
  },
  'landscape-java-engraving-01': {
    id:'landscape-java-engraving-01', role:'background', family:'engraved-landscape', presets:['jawa-heritage-floral','mountain-heritage'],
    src:'/assets/art/landscapes/jawa/landscape-java-engraving-01.webp', kind:'image', quality:'background', status:'required',
    fallback:{ type:'procedural', generator:'mist' }
  },
  'tree-frame-left-sepia-01': {
    id:'tree-frame-left-sepia-01', role:'environment-back', family:'tree-frame', presets:['jawa-heritage-floral','mountain-heritage'],
    src:'/assets/art/nature/trees/tree-frame-left-sepia-01.webp', kind:'image', quality:'foreground', status:'required', fallback:{ type:'procedural', generator:'mist' }
  },
  'tree-frame-right-sepia-01': {
    id:'tree-frame-right-sepia-01', role:'environment-back', family:'tree-frame', presets:['jawa-heritage-floral','mountain-heritage'],
    src:'/assets/art/nature/trees/tree-frame-right-sepia-01.webp', kind:'image', quality:'foreground', status:'required', fallback:{ type:'procedural', generator:'mist' }
  },
  'arch-jawa-carved-gold-01': {
    id:'arch-jawa-carved-gold-01', role:'ornament-back', family:'carved-arch', presets:['jawa-heritage-floral'],
    src:'/assets/art/ornaments/arches/arch-jawa-carved-gold-01.svg', kind:'image', quality:'hero', status:'required', fallback:{ type:'procedural', generator:'ornament-frame' }
  },
  'hero-joglo-sepia-01': {
    id:'hero-joglo-sepia-01', role:'hero', family:'joglo', presets:['jawa-heritage-floral','mountain-heritage'],
    src:'/assets/art/architecture/joglo/hero-joglo-sepia-01.webp', kind:'image', quality:'hero', status:'required', fallback:{ type:'procedural', generator:'gunungan' }
  },
  'orn-gunungan-gold-01': {
    id:'orn-gunungan-gold-01', role:'ornament-front', family:'gunungan', presets:['jawa-heritage-floral','jawa-luxury'],
    src:'/assets/art/ornaments/gunungan/orn-gunungan-gold-01.svg', kind:'image', quality:'foreground', status:'required', fallback:{ type:'procedural', generator:'gunungan' }
  },
  'floral-side-left-burgundy-01': {
    id:'floral-side-left-burgundy-01', role:'ornament-front', family:'floral-side', presets:['jawa-heritage-floral'],
    src:'/assets/art/florals/side/floral-side-left-burgundy-01.webp', kind:'image', quality:'foreground', status:'required', fallback:{ type:'procedural', generator:'mist' }
  },
  'floral-side-right-burgundy-01': {
    id:'floral-side-right-burgundy-01', role:'ornament-front', family:'floral-side', presets:['jawa-heritage-floral'],
    src:'/assets/art/florals/side/floral-side-right-burgundy-01.webp', kind:'image', quality:'foreground', status:'required', fallback:{ type:'procedural', generator:'mist' }
  },
  'floral-bottom-burgundy-01': {
    id:'floral-bottom-burgundy-01', role:'foreground-floral', family:'floral-bottom', presets:['jawa-heritage-floral'],
    src:'/assets/art/florals/bottom/floral-bottom-burgundy-01.webp', kind:'image', quality:'foreground', status:'required', fallback:{ type:'procedural', generator:'mist' }
  },
  'overlay-warm-haze-01': {
    id:'overlay-warm-haze-01', role:'atmosphere-front', family:'haze', presets:['jawa-heritage-floral','mountain-heritage'],
    src:'/assets/overlays/haze/overlay-warm-haze-01.webp', kind:'image', quality:'overlay', status:'optional', fallback:{ type:'procedural', generator:'glow' }
  },
  'texture-grain-paper-01': {
    id:'texture-grain-paper-01', role:'ui-fx', family:'grain', presets:['jawa-heritage-floral'],
    src:'/assets/textures/grain/texture-grain-paper-01.webp', kind:'image', quality:'overlay', status:'optional', fallback:{ type:'procedural', generator:'glow' }
  }
});

export const ROYAL_JOGLO_GARDEN_ASSETS = Object.freeze([
  'paper-parchment-cream-01','landscape-java-engraving-01','tree-frame-left-sepia-01','tree-frame-right-sepia-01',
  'arch-jawa-carved-gold-01','hero-joglo-sepia-01','orn-gunungan-gold-01','floral-side-left-burgundy-01',
  'floral-side-right-burgundy-01','floral-bottom-burgundy-01','overlay-warm-haze-01','texture-grain-paper-01'
]);

export function getHdAsset(id){ return HD_ASSET_MANIFEST[id] || null; }

export function auditHdManifest(ids=ROYAL_JOGLO_GARDEN_ASSETS){
  const assets = ids.map(getHdAsset).filter(Boolean);
  const invalid=[];
  for (const asset of assets) {
    const check=validateAssetMeta(asset);
    if (!check.valid) invalid.push({ id:asset.id, errors:check.errors });
  }
  const required=assets.filter(asset => asset.status === 'required');
  return { valid:invalid.length===0, assets:assets.length, required:required.length, invalid, ids:[...ids] };
}
