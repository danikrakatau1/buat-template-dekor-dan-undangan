import { buildArtJawaCoklat3NativeProject, runReferenceFidelityQA, ART_JAWA_COKLAT_3_REBUILD_VERSION } from './reference/art-jawa-coklat-3-native-rebuild.js';

const STAGE='11.7';
let rebuilding=false;

function ensureStyle(){
  if(document.querySelector('link[data-stage11-reference-style]'))return;
  const link=document.createElement('link');link.rel='stylesheet';link.href='/src/stage11-reference-rebuild.css';link.dataset.stage11ReferenceStyle='true';document.head.appendChild(link);
}
function currentProject(){return window.weddingEditor?.getProject?.()||window.weddingEngine?.store?.getState?.().project||null;}
function hasGeneratedPlate(project){return (project?.scenes||[]).some(scene=>(scene.layers||[]).some(layer=>layer?.id==='ai-transformed-base'||layer?.id==='reference-cover-art'));}
function eligible(project){return Boolean(project&&!project?.generator?.referenceNativeRebuild&&hasGeneratedPlate(project)&&(project?.generator?.mode==='auto-artwork-transform'||project?.generator?.referenceArchitecture));}

function updateHeader(project){
  const qa=project?.referenceQA;
  const header=document.querySelector('.brand-wrap span');if(header)header.textContent=`Reference Native Rebuild · Stage #${STAGE}`;
  const checkpoint=document.querySelector('.checkpoint');if(checkpoint)checkpoint.textContent=`#${STAGE} Visual DNA · Native Reconstruction · Data Binding · Motion · Fidelity QA`;
  const status=document.querySelector('#engine-status');if(status){status.textContent=qa?.status==='locked'?`Reference Locked ${qa.score}`:`Reference QA ${qa?.score??'-'}`;status.dataset.state=qa?.status==='locked'?'ready':'warning';}
  const sceneCount=document.querySelector('#generated-scenes');if(sceneCount)sceneCount.textContent=String(project?.scenes?.length||0);
  const layerCount=document.querySelector('#generated-layers');if(layerCount)layerCount.textContent=String((project?.scenes||[]).reduce((n,s)=>n+(s.layers?.length||0),0));
  const mode=document.querySelector('#generator-mode');if(mode)mode.textContent='reference-native-rebuild';
}

function syncSceneNavigation(project){
  const list=document.querySelector('#scene-list');if(!list)return;
  list.replaceChildren();
  (project?.scenes||[]).forEach((scene,index)=>{
    const button=document.createElement('button');button.type='button';button.className=`scene-item${index===0?' active':''}`;button.dataset.sceneTarget=scene.id;
    const label=scene.type==='opening-motion'?'Opening Motion':scene.type==='save-date'?'Save The Date':scene.type==='wishes'?'Ucapan & Doa':scene.type.charAt(0).toUpperCase()+scene.type.slice(1);
    button.textContent=`${String(index+1).padStart(2,'0')}  ${label}`;
    button.addEventListener('click',()=>{
      list.querySelectorAll('.scene-item').forEach(el=>el.classList.remove('active'));button.classList.add('active');
      const target=document.querySelector(`[data-scene-id="${CSS.escape(scene.id)}"]`);target?.scrollIntoView?.({behavior:'smooth',block:'start'});activateScene(target);
      const first=scene.layers?.find(layer=>layer.kind==='text'||layer.kind==='button');if(first)window.weddingEditor?.select?.(scene.id,first.id);
    });
    list.appendChild(button);
  });
}

function activateScene(section){section?.classList.add('is-active','is-reference-entering');setTimeout(()=>section?.classList.remove('is-reference-entering'),900);}

function installOpening(){
  document.addEventListener('click',event=>{
    const button=event.target?.closest?.('.reference-native-scene [data-layer-id="cover-open"] .engine-button');
    if(!button)return;
    const cover=button.closest('.reference-native-scene');
    if(!cover||cover.dataset.referenceOpened==='true')return;
    event.preventDefault();event.stopImmediatePropagation();cover.dataset.referenceOpened='true';
    try{document.querySelector('#song')?.play?.().catch?.(()=>{});}catch{}
    const next=cover.nextElementSibling?.matches?.('.reference-native-scene')?cover.nextElementSibling:null;
    if(next){next.hidden=false;next.style.visibility='visible';next.style.opacity='1';activateScene(next);}
    cover.classList.add('reference-cover-exit');
    setTimeout(()=>{cover.style.display='none';next?.scrollIntoView?.({behavior:'smooth',block:'start'});},1500);
  },true);
}

function installSceneObserver(){
  const root=document.querySelector('#engine-root');if(!root||!('IntersectionObserver'in window))return;
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.querySelectorAll('[data-motion]').forEach(el=>el.classList.add('is-visible'));}}),{root,threshold:.18});
  root.querySelectorAll('.reference-native-scene').forEach(section=>observer.observe(section));
}

function exposeQA(project){
  const qa=runReferenceFidelityQA(project);project.referenceQA=qa;window.weddingReferenceRebuildQA=qa;window.weddingReferenceRebuild={stage:STAGE,version:ART_JAWA_COKLAT_3_REBUILD_VERSION,project,qa};return qa;
}

function rebuild(project){
  if(rebuilding||!eligible(project))return false;
  rebuilding=true;
  try{
    const rebuilt=buildArtJawaCoklat3NativeProject(project);
    exposeQA(rebuilt);
    window.weddingEditor.setProject(rebuilt);
    window.weddingEngine.mount(rebuilt);
    window.weddingEditor.clearSelection?.();
    window.weddingEngine.playIntro?.();
    updateHeader(rebuilt);syncSceneNavigation(rebuilt);
    requestAnimationFrame(()=>installSceneObserver());
    console.info(`[Wedding Template Studio] Stage #${STAGE} reference-native rebuild mounted · ${rebuilt.referenceQA.score}/100.`);
    return true;
  }catch(error){console.error('[Stage 11 Reference Rebuild]',error);return false;}
  finally{rebuilding=false;}
}

function boot(){
  ensureStyle();
  if(!window.weddingEngine||!window.weddingEditor){setTimeout(boot,80);return;}
  installOpening();
  const initial=currentProject();if(initial)rebuild(initial);
  window.weddingEngine.bus?.on?.('engine:ready',({project})=>requestAnimationFrame(()=>{if(!rebuilding)rebuild(project);}));
}

boot();
console.info(`[Wedding Template Studio] Stage #${STAGE} full reference rebuild runtime armed.`);
