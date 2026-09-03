export const FIDELITY_PRESETS = Object.freeze({
  'jawa-luxury': {
    id:'jawa-luxury', label:'Jawa Luxury', motionProfile:'luxury-slow',
    palette:{ bg:'#120d0a', surface:'#24170f', text:'#f4e7cf', accent:'#c59b55', floral:'#7f2931' },
    compositions:['centered-emblem','carved-arch','asymmetric-heritage','night-gold'],
    assetFamilies:['gunungan','ukiran','frames','dark-paper','warm-glow','gold-dust']
  },
  'jawa-heritage-floral': {
    id:'jawa-heritage-floral', label:'Jawa Heritage Floral', motionProfile:'heritage-soft',
    palette:{ bg:'#efe3c9', surface:'#f8f0df', text:'#77552c', accent:'#ad8446', floral:'#8f2935' },
    compositions:['carved-arch-floral','royal-joglo-garden','floral-pendopo'],
    assetFamilies:['parchment','engraved-landscape','joglo','carved-arch','gunungan','floral-bottom','floral-corner']
  },
  'mountain-heritage': {
    id:'mountain-heritage', label:'Mountain Heritage', motionProfile:'cinematic-depth',
    palette:{ bg:'#e9dfc8', surface:'#f5ecdb', text:'#654d31', accent:'#9f794a', floral:'#7c5138' },
    compositions:['mountain-joglo','valley-pendopo','forest-heritage'],
    assetFamilies:['mountain-engraving','tree-frame','joglo','mist','sunlight-haze','foreground-flora']
  },
  'ocean-elegance': {
    id:'ocean-elegance', label:'Ocean Elegance', motionProfile:'ocean-drift',
    palette:{ bg:'#082532', surface:'#103f4c', text:'#effcff', accent:'#9edbd2', floral:'#d7d5bd' },
    compositions:['horizon-pearl','coastal-luxury','deep-sea-elegant'],
    assetFamilies:['waves','coral','pearl','ocean-haze','underwater-glow','caustic']
  },
  'night-gold-premium': {
    id:'night-gold-premium', label:'Night Gold Premium', motionProfile:'night-cinematic',
    palette:{ bg:'#070708', surface:'#151211', text:'#f5ead7', accent:'#d2a85f', floral:'#6a252b' },
    compositions:['spotlight-monogram','gold-frame','cinematic-dark'],
    assetFamilies:['gold-line','spotlight','haze','gold-dust','vignette']
  }
});

export const STAGE_91_PRIMARY_TARGET = Object.freeze({
  preset:'jawa-heritage-floral',
  composition:'royal-joglo-garden',
  layerOrder:['base','background','environment-back','ornament-back','hero','content','ornament-front','foreground-floral','atmosphere-front','ui-fx']
});

export function getFidelityPreset(id='jawa-heritage-floral'){
  return FIDELITY_PRESETS[id] || FIDELITY_PRESETS['jawa-heritage-floral'];
}

export function getFidelityPresetOptions(){
  return Object.values(FIDELITY_PRESETS).map(({id,label}) => ({id,label}));
}
