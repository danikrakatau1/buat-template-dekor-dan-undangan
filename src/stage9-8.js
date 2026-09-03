import { PixiFidelityRenderer } from './hybrid/pixi-fidelity-renderer.js';
import { KonvaEditorOverlay } from './hybrid/konva-editor-overlay.js';
import { mountAuxiliaryLayers } from './hybrid/auxiliary-adapters.js';
import { HYBRID_RUNTIME_VERSIONS } from './hybrid/runtime-dependencies.js';

let pixi=null, konva=null, auxiliary=null, activeSceneId=null, generation=0;

function currentProject(){ return window.weddingEditor?.getProject?.() || window.weddingEngine?.store?.getState?.().project || null; }
function coverScene(project){ return project?.scenes?.find(scene=>scene.type==='cover') || null; }
function isFidelity(scene,project){ return Boolean(scene?.fidelity?.system==='hd-vector-layered' || project?.fidelity?.mode==='hd-vector-layered'); }

function ensurePanel(){
  let panel=document.querySelector('#hybrid-renderer-panel');
  if(panel) return panel;
  const anchor=document.querySelector('.right-panel .property-group');
  if(!anchor) return null;
  panel=document.createElement('section');
  panel.id='hybrid-renderer-panel';
  panel.className='hybrid-renderer-panel';
  panel.innerHTML=`<div class="hybrid-head"><div><span>Stage #9.8</span><strong>Hybrid GPU Renderer</strong></div><i data-hybrid-dot></i></div><div class="hybrid-grid"><div><span>Renderer</span><strong data-hybrid-renderer>Booting</strong></div><div><span>Motion</span><strong>GSAP ${HYBRID_RUNTIME_VERSIONS.gsap}</strong></div><div><span>Editor</span><strong>Konva ${HYBRID_RUNTIME_VERSIONS.konva}</strong></div><div><span>Aux</span><strong>SVG · Lottie · Rive</strong></div></div><div class="hybrid-note">PixiJS renders artwork layers on WebGL. Existing DOM text/buttons remain editable and act as fallback/hit proxies.</div>`;
  anchor.insertAdjacentElement('afterend',panel);
  return panel;
}

function setStatus(state,text){
  const panel=ensurePanel(); if(!panel) return;
  panel.dataset.state=state;
  const target=panel.querySelector('[data-hybrid-renderer]'); if(target) target.textContent=text;
  const dot=panel.querySelector('[data-hybrid-dot]'); if(dot) dot.dataset.state=state;
}

function cleanup(){
  pixi?.destroy(); konva?.destroy(); auxiliary?.destroy?.();
  pixi=null; konva=null; auxiliary=null; activeSceneId=null;
  document.querySelectorAll('.gpu-scene-surface').forEach(el=>el.remove());
}

async function mountHybrid(project=currentProject()){
  const run=++generation;
  const scene=coverScene(project);
  if(!scene || !isFidelity(scene,project)){
    cleanup(); setStatus('idle','DOM fallback'); return;
  }
  const section=document.querySelector(`[data-scene-id="${CSS.escape(scene.id)}"]`);
  if(!section) return;
  cleanup(); setStatus('loading','Loading PixiJS…');
  const surface=document.createElement('div'); surface.className='gpu-scene-surface';
  section.prepend(surface);
  try{
    pixi=new PixiFidelityRenderer();
    const result=await pixi.mount(scene,surface);
    if(run!==generation){ pixi.destroy(); return; }
    setStatus('ready',`Pixi WebGL · ${result.layers} layers`);
    konva=new KonvaEditorOverlay();
    konva.mount(section).catch(error=>console.warn('[Konva Overlay]',error));
    auxiliary=await mountAuxiliaryLayers(scene,section);
    activeSceneId=scene.id;
    section.dataset.hybridFidelity='ready';
  }catch(error){
    console.error('[Stage 9.8 Hybrid Renderer]',error);
    surface.remove(); pixi?.destroy(); pixi=null;
    setStatus('warning','DOM fallback active');
  }
}

function boot(){
  ensurePanel();
  if(!window.weddingEngine || !window.weddingEditor){ setTimeout(boot,60); return; }
  mountHybrid();
  window.weddingEngine.bus?.on?.('engine:ready',({project})=>requestAnimationFrame(()=>mountHybrid(project)));
  document.querySelectorAll('[data-device]').forEach(button=>button.addEventListener('click',()=>setTimeout(()=>{ if(pixi) pixi.layout(); },80)));
}

boot();
window.addEventListener('beforeunload',cleanup,{once:true});
console.info('[Wedding Template Studio] Stage #9.8 Hybrid GPU Renderer booting.');
