import { PixiFidelityRenderer } from './hybrid/pixi-fidelity-renderer.js';
import { KonvaEditorOverlay } from './hybrid/konva-editor-overlay.js';
import { mountAuxiliaryLayers } from './hybrid/auxiliary-adapters.js';
import { HYBRID_RUNTIME_VERSIONS } from './hybrid/runtime-dependencies.js';
import { warmRuntimeEngravingArtwork } from './art-direction/runtime-artwork/runtime-artwork-pack.js';
import { auditFinalAssetRegistry, FINAL_ASSET_REGISTRY_VERSION } from './art-direction/final-asset-registry.js';

let pixi=null, konva=null, auxiliary=null, generation=0, artworkWarmPromise=null;
function currentProject(){ return window.weddingEditor?.getProject?.() || window.weddingEngine?.store?.getState?.().project || null; }
function coverScene(project){ return project?.scenes?.find(scene=>scene.type==='cover') || null; }
function isFidelity(scene,project){ return Boolean(scene?.fidelity?.system==='hd-vector-layered' || project?.fidelity?.mode==='hd-vector-layered' || scene?.fidelity?.system==='auto-artwork-transform' || project?.generator?.mode==='auto-artwork-transform'); }
function warmArtwork(){ return artworkWarmPromise ||= warmRuntimeEngravingArtwork().catch(error=>{ console.warn('[Stage 9.9.5 Artwork Warmup]',error); return 0; }); }
function registrySnapshot(){ try{return auditFinalAssetRegistry();}catch(error){console.warn('[Stage 9.9.5 Registry Audit]',error);return null;} }
function autoHandoff(scene,project){ return String(scene?.renderHandoff || project?.generator?.handoff || ''); }

function ensurePanel(){
  let panel=document.querySelector('#hybrid-renderer-panel');if(panel) return panel;
  const anchor=document.querySelector('.right-panel .property-group');if(!anchor) return null;
  panel=document.createElement('section');panel.id='hybrid-renderer-panel';panel.className='hybrid-renderer-panel';
  panel.innerHTML=`<div class="hybrid-head"><div><span>Stage #9.9.5</span><strong>Studio + Pixi Integration Final</strong></div><i data-hybrid-dot></i></div><div class="hybrid-grid"><div><span>Renderer</span><strong data-hybrid-renderer>Booting</strong></div><div><span>Registry</span><strong data-hybrid-registry>Checking</strong></div><div><span>P0 Required</span><strong data-hybrid-p0>-</strong></div><div><span>Promotion</span><strong data-hybrid-promotion>-</strong></div><div><span>Motion</span><strong>GSAP ${HYBRID_RUNTIME_VERSIONS.gsap}</strong></div><div><span>Editor</span><strong>Konva ${HYBRID_RUNTIME_VERSIONS.konva}</strong></div></div><div class="hybrid-note">Pixi remains presentation/runtime only. Reference-architecture artwork uses one image plate; native typography and CTA stay above it.</div>`;
  anchor.insertAdjacentElement('afterend',panel);return panel;
}
function updateRegistryUI(){
  const panel=ensurePanel(), audit=registrySnapshot();if(!panel || !audit) return audit;
  const registry=panel.querySelector('[data-hybrid-registry]'),p0=panel.querySelector('[data-hybrid-p0]'),promotion=panel.querySelector('[data-hybrid-promotion]');
  if(registry) registry.textContent=audit.contractReady?`v${audit.version} · ready`:`v${audit.version} · check`;
  if(p0) p0.textContent=`${audit.required-audit.requiredPending.length}/${audit.required} ready`;
  if(promotion) promotion.textContent=audit.productionPromotionPending.length?`${audit.productionPromotionPending.length} pending`:'HD promoted';panel.dataset.registryReady=audit.contractReady?'true':'false';return audit;
}
function setStatus(state,text){const panel=ensurePanel();if(!panel)return;panel.dataset.state=state;const target=panel.querySelector('[data-hybrid-renderer]');if(target)target.textContent=text;const dot=panel.querySelector('[data-hybrid-dot]');if(dot)dot.dataset.state=state;}
function cleanup(){pixi?.destroy();konva?.destroy();auxiliary?.destroy?.();pixi=null;konva=null;auxiliary=null;document.querySelectorAll('.gpu-scene-surface').forEach(el=>el.remove());}

async function mountHybrid(project=currentProject()){
  const run=++generation,scene=coverScene(project);updateRegistryUI();
  if(!scene || !isFidelity(scene,project)){cleanup();setStatus('idle','DOM fallback');return;}
  const section=document.querySelector(`[data-scene-id="${CSS.escape(scene.id)}"]`);if(!section)return;cleanup();
  const isAuto=scene?.fidelity?.system==='auto-artwork-transform',handoff=autoHandoff(scene,project);
  const disableEditorOverlay=Boolean(project?.generator?.disableEditorOverlay || scene?.disableEditorOverlay || /^10\.10[A-Z]/.test(handoff));
  if(!isAuto){setStatus('loading','Decoding engraving…');await warmArtwork();if(run!==generation)return;}
  setStatus('loading','Loading Pixi WebGL…');const surface=document.createElement('div');surface.className='gpu-scene-surface';section.prepend(surface);
  try{
    pixi=new PixiFidelityRenderer();const result=await pixi.mount(scene,surface);if(run!==generation){pixi.destroy();return;}
    const suffix=result.failed?` · ${result.failed} DOM fallback`:'';setStatus(result.failed?'warning':'ready',`Pixi WebGL · ${result.layers} layers${suffix}`);
    if(!disableEditorOverlay){konva=new KonvaEditorOverlay();konva.mount(section).catch(error=>console.warn('[Konva Overlay]',error));}else section.dataset.editorOverlay='disabled';
    auxiliary=await mountAuxiliaryLayers(scene,section);const audit=updateRegistryUI();section.dataset.hybridFidelity='ready';section.dataset.artworkOptimization=isAuto?(handoff?`auto-artwork-${handoff}`:'auto-artwork-runtime'):'9.9.5';section.dataset.assetRegistry=FINAL_ASSET_REGISTRY_VERSION;section.dataset.productionPromotionPending=String(audit?.productionPromotionPending?.length || 0);
  }catch(error){console.error('[Hybrid Renderer]',error);surface.remove();pixi?.destroy();pixi=null;setStatus('warning','DOM fallback active');}
}
function boot(){ensurePanel();updateRegistryUI();warmArtwork();if(!window.weddingEngine || !window.weddingEditor){setTimeout(boot,60);return;}mountHybrid();window.weddingEngine.bus?.on?.('engine:ready',({project})=>requestAnimationFrame(()=>mountHybrid(project)));document.querySelectorAll('[data-device]').forEach(button=>button.addEventListener('click',()=>setTimeout(()=>{if(pixi)pixi.layout();updateRegistryUI();},80)));}
boot();import('./stage10-auto-artwork.js').catch(error=>console.error('[Auto Artwork Studio Bootstrap]',error));window.addEventListener('beforeunload',cleanup,{once:true});console.info('[Wedding Template Studio] Hybrid renderer + Auto Artwork bootstrap active.');
