import { createRoyalJogloGardenProject } from './royal-joglo-garden-composer.js';

export const JAWA_FIDELITY_COMPOSITIONS = Object.freeze([
  'royal-joglo-garden',
  'carved-arch-heritage',
  'mountain-heritage',
  'floral-pendopo'
]);

function clone(value){ return globalThis.structuredClone ? structuredClone(value) : JSON.parse(JSON.stringify(value)); }
function layer(scene,id){ return scene.layers.find(item=>item.id===id); }
function patch(scene,id,transform={}){ const target=layer(scene,id); if(target) target.transform={...(target.transform||{}),...transform}; }
function seedIndex(seed=''){
  let hash=0;
  for(const char of String(seed)) hash=((hash<<5)-hash+char.charCodeAt(0))|0;
  return Math.abs(hash)%JAWA_FIDELITY_COMPOSITIONS.length;
}

export function resolveJawaComposition(seed='JL-DEMO-001'){
  if(/DEMO-001$/i.test(seed)) return 'royal-joglo-garden';
  return JAWA_FIDELITY_COMPOSITIONS[seedIndex(seed)];
}

export function applyJawaComposition(baseProject,composition='royal-joglo-garden'){
  const project=clone(baseProject);
  const scene=project.scenes[0];
  const chosen=JAWA_FIDELITY_COMPOSITIONS.includes(composition)?composition:'royal-joglo-garden';
  scene.variation={...(scene.variation||{}),layout:chosen,seed:project.project.seed};
  scene.fidelity={...(scene.fidelity||{}),composition:chosen,tuning:'reference-fidelity-v2'};
  project.variation={...(project.variation||{}),layout:chosen};
  project.fidelity={...(project.fidelity||{}),composition:chosen,tuning:'reference-fidelity-v2'};
  project.project.name=`Jawa Luxury · ${chosen.split('-').map(v=>v[0].toUpperCase()+v.slice(1)).join(' ')}`;
  project.generator={...(project.generator||{}),version:'9.5',variantSystem:'jawa-fidelity-compositions'};

  if(chosen==='carved-arch-heritage'){
    patch(scene,'arch-jawa-carved-gold-01',{x:50,y:5.1,width:'124%',opacity:1,depth:.09});
    patch(scene,'landscape-java-engraving-01',{x:50,y:64,width:'126%',opacity:.30});
    patch(scene,'tree-frame-left-sepia-01',{x:-1,y:52,width:'49%',opacity:.58});
    patch(scene,'tree-frame-right-sepia-01',{x:101,y:52,width:'49%',opacity:.58});
    patch(scene,'hero-joglo-sepia-01',{x:50,y:79,width:'79%',opacity:.56});
    patch(scene,'orn-gunungan-gold-01',{x:50,y:20.8,width:'13%',opacity:.9});
    patch(scene,'floral-side-left-burgundy-01',{x:2,y:48,width:'35%',opacity:.82});
    patch(scene,'floral-side-right-burgundy-01',{x:98,y:48,width:'35%',opacity:.82});
    patch(scene,'floral-bottom-burgundy-01',{x:50,y:94,width:'114%',opacity:.9});
  }

  if(chosen==='mountain-heritage'){
    patch(scene,'landscape-java-engraving-01',{x:50,y:58.5,width:'146%',opacity:.60,depth:.025});
    patch(scene,'tree-frame-left-sepia-01',{x:-2,y:50,width:'60%',opacity:.72});
    patch(scene,'tree-frame-right-sepia-01',{x:102,y:50,width:'60%',opacity:.72});
    patch(scene,'arch-jawa-carved-gold-01',{x:50,y:5.5,width:'104%',opacity:.52});
    patch(scene,'hero-joglo-sepia-01',{x:50,y:80.5,width:'83%',opacity:.62});
    patch(scene,'floral-side-left-burgundy-01',{x:1,y:51,width:'31%',opacity:.66});
    patch(scene,'floral-side-right-burgundy-01',{x:99,y:51,width:'31%',opacity:.66});
    patch(scene,'floral-bottom-burgundy-01',{x:50,y:95,width:'108%',opacity:.78});
    scene.atmosphere.intensity=.12;
  }

  if(chosen==='floral-pendopo'){
    patch(scene,'landscape-java-engraving-01',{x:50,y:63,width:'124%',opacity:.32});
    patch(scene,'tree-frame-left-sepia-01',{x:-2,y:51,width:'47%',opacity:.48});
    patch(scene,'tree-frame-right-sepia-01',{x:102,y:51,width:'47%',opacity:.48});
    patch(scene,'arch-jawa-carved-gold-01',{x:50,y:6,width:'106%',opacity:.78});
    patch(scene,'hero-joglo-sepia-01',{x:50,y:80,width:'76%',opacity:.52});
    patch(scene,'orn-gunungan-gold-01',{x:50,y:21.5,width:'14%',opacity:.78});
    patch(scene,'floral-side-left-burgundy-01',{x:2,y:46,width:'51%',opacity:1});
    patch(scene,'floral-side-right-burgundy-01',{x:98,y:46,width:'51%',opacity:1});
    patch(scene,'floral-bottom-burgundy-01',{x:50,y:92.5,width:'138%',opacity:1});
  }

  return project;
}

export function createJawaFidelityProject({seed='JL-DEMO-001',composition,names,eyebrow,guest}={}){
  const chosen=composition||resolveJawaComposition(seed);
  return applyJawaComposition(createRoyalJogloGardenProject({seed,names,eyebrow,guest}),chosen);
}
