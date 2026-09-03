import { validateHeritageArtAsset } from './heritage-art-style-lock.js';

const slot=(id,role,kind,category,src,depth,required=true)=>Object.freeze({
  id,slot:id,role,kind,category,src,depth,required,textless:true,transparent:kind==='isolated',bakedText:false,status:'planned'
});

export const HERITAGE_ASSET_SLOTS = Object.freeze([
  slot('sky-engraving','base','plate','background','/assets/heritage-hd/backgrounds/sky-engraving.webp',0.02),
  slot('mountain-far','background','plate','background','/assets/heritage-hd/backgrounds/mountain-far.webp',0.06),
  slot('mountain-mid','background','plate','background','/assets/heritage-hd/backgrounds/mountain-mid.webp',0.11),
  slot('horizon-haze','atmosphere-front','plate','background','/assets/heritage-hd/backgrounds/horizon-haze.webp',0.03),
  slot('tree-left','environment-back','isolated','nature','/assets/heritage-hd/nature/tree-left.webp',0.18),
  slot('tree-right','environment-back','isolated','nature','/assets/heritage-hd/nature/tree-right.webp',0.18),
  slot('palm-left','environment-back','isolated','nature','/assets/heritage-hd/nature/palm-left.webp',0.14,false),
  slot('palm-right','environment-back','isolated','nature','/assets/heritage-hd/nature/palm-right.webp',0.14,false),
  slot('shrubs-left','environment-back','isolated','nature','/assets/heritage-hd/nature/shrubs-left.webp',0.24,false),
  slot('shrubs-right','environment-back','isolated','nature','/assets/heritage-hd/nature/shrubs-right.webp',0.24,false),
  slot('joglo-main','hero','isolated','architecture','/assets/heritage-hd/architecture/joglo-main.webp',0.40),
  slot('joglo-shadow','hero','isolated','architecture','/assets/heritage-hd/architecture/joglo-shadow.webp',0.37,false),
  slot('joglo-highlight','hero','isolated','architecture','/assets/heritage-hd/architecture/joglo-highlight.webp',0.43,false),
  slot('joglo-detail-overlay','hero','isolated','architecture','/assets/heritage-hd/architecture/joglo-detail-overlay.webp',0.45,false),
  slot('top-arch','ornament-back','isolated','ornament','/assets/heritage-hd/ornaments/top-arch.webp',0.28),
  slot('corner-top-left','ornament-back','isolated','ornament','/assets/heritage-hd/ornaments/corner-top-left.webp',0.30,false),
  slot('corner-top-right','ornament-back','isolated','ornament','/assets/heritage-hd/ornaments/corner-top-right.webp',0.30,false),
  slot('gunungan-main','ornament-front','isolated','ornament','/assets/heritage-hd/ornaments/gunungan-main.webp',0.52),
  slot('floral-bottom-center','foreground-floral','isolated','botanical','/assets/heritage-hd/botanicals/floral-bottom-center.webp',0.72),
  slot('floral-bottom-left','foreground-floral','isolated','botanical','/assets/heritage-hd/botanicals/floral-bottom-left.webp',0.75,false),
  slot('floral-bottom-right','foreground-floral','isolated','botanical','/assets/heritage-hd/botanicals/floral-bottom-right.webp',0.75,false),
  slot('floral-side-left','ornament-front','isolated','botanical','/assets/heritage-hd/botanicals/floral-side-left.webp',0.60),
  slot('floral-side-right','ornament-front','isolated','botanical','/assets/heritage-hd/botanicals/floral-side-right.webp',0.60),
  slot('paper-texture','ui-fx','plate','overlay','/assets/heritage-hd/overlays/paper-texture.webp',0,false),
  slot('grain-soft','ui-fx','plate','overlay','/assets/heritage-hd/overlays/grain-soft.webp',0,false),
  slot('vignette-warm','ui-fx','plate','overlay','/assets/heritage-hd/overlays/vignette-warm.webp',0,false),
  slot('gold-wash','atmosphere-front','plate','overlay','/assets/heritage-hd/overlays/gold-wash.webp',0.04,false)
]);

export const HERITAGE_SLOT_ORDER = Object.freeze(HERITAGE_ASSET_SLOTS.map(item=>item.id));

export function getHeritageSlot(id){ return HERITAGE_ASSET_SLOTS.find(item=>item.id===id) || null; }

export function auditHeritageSlotBlueprint(){
  const invalid=[];
  const duplicateIds=[];
  const seen=new Set();
  for(const asset of HERITAGE_ASSET_SLOTS){
    if(seen.has(asset.id)) duplicateIds.push(asset.id);
    seen.add(asset.id);
    const result=validateHeritageArtAsset(asset);
    if(!result.valid) invalid.push({id:asset.id,errors:result.errors});
  }
  const required=HERITAGE_ASSET_SLOTS.filter(item=>item.required);
  return {
    valid:invalid.length===0 && duplicateIds.length===0,
    total:HERITAGE_ASSET_SLOTS.length,
    required:required.length,
    optional:HERITAGE_ASSET_SLOTS.length-required.length,
    categories:[...new Set(HERITAGE_ASSET_SLOTS.map(item=>item.category))],
    duplicateIds,
    invalid
  };
}
