export const ASSET_GROUPS = Object.freeze({
  backgrounds:{ root:'assets/art/backgrounds', formats:['webp','jpg'], minLongEdge:3000, preferredLongEdge:5000 },
  architecture:{ root:'assets/art/architecture', families:['joglo','pendopo','gapura'], formats:['webp','png','svg'] },
  landscapes:{ root:'assets/art/landscapes', families:['mountain','forest','ocean'], formats:['webp','jpg','svg'] },
  ornaments:{ root:'assets/art/ornaments', families:['gunungan','ukiran','frames','arches','dividers'], formats:['svg','webp','png'] },
  florals:{ root:'assets/art/florals', families:['corner','side','bottom','garland'], formats:['webp','png'] },
  nature:{ root:'assets/art/nature', families:['trees','palms','waves','coral','clouds'], formats:['webp','png','svg'] },
  textures:{ root:'assets/textures', families:['paper','grain','wood','gold','stone'], formats:['webp','png'] },
  overlays:{ root:'assets/overlays', families:['glow','mist','haze','vignette','light-rays','caustic'], formats:['webp','png'] },
  particles:{ root:'assets/particles', families:['gold-dust','sparkle','petals','bubbles'], formats:['json','webp','png'] },
  masks:{ root:'assets/masks', formats:['svg','png'] },
  previews:{ root:'assets/previews', formats:['webp','jpg'] }
});

export const ASSET_ROLES = Object.freeze([
  'base','background','environment-back','ornament-back','hero','content','ornament-front','foreground-floral','atmosphere-front','ui-fx'
]);

export const QUALITY_TIERS = Object.freeze({
  hero:{ minLongEdge:3000, targetLongEdge:5000, allowSvg:true },
  background:{ minLongEdge:3000, targetLongEdge:5000, allowSvg:true },
  foreground:{ minLongEdge:2000, targetLongEdge:3500, allowSvg:true },
  overlay:{ minLongEdge:1600, targetLongEdge:2400, allowSvg:false }
});

export function makeAssetId({ role='asset', subject='generic', style='base', variant='01' }={}){
  return [role, subject, style, variant].map(part => String(part).trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')).filter(Boolean).join('-');
}

export function validateAssetMeta(asset={}){
  const errors=[];
  if (!asset.id) errors.push('asset.id is required');
  if (!asset.src) errors.push('asset.src is required');
  if (!ASSET_ROLES.includes(asset.role)) errors.push(`invalid asset role: ${asset.role}`);
  if (!asset.family) errors.push('asset.family is required');
  if (!Array.isArray(asset.presets) || !asset.presets.length) errors.push('asset.presets must contain at least one preset');
  return { valid:errors.length===0, errors };
}
