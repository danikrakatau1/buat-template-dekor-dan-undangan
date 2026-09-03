import { createJawaFidelityProject, JAWA_FIDELITY_COMPOSITIONS } from './art-direction/jawa-composition-variants.js';

if(!document.querySelector('link[data-stage96]')){
  const link=document.createElement('link');
  link.rel='stylesheet';
  link.href='/src/stage9-6.css';
  link.dataset.stage96='true';
  document.head.appendChild(link);
}

const LABELS = {
  'royal-joglo-garden':'Royal Joglo Garden',
  'carved-arch-heritage':'Carved Arch Heritage',
  'mountain-heritage':'Mountain Heritage',
  'floral-pendopo':'Floral Pendopo'
};

function ready(){ return window.weddingEngine && window.weddingEditor; }
function device(){ return document.querySelector('[data-device].active')?.dataset.device || 'mobile'; }
function setText(selector,value){ const el=document.querySelector(selector); if(el) el.textContent=value; }

function updateInspector(project,panel){
  const variation=project?.variation || {};
  const manifest=project?.fidelity?.manifest || {};
  const layout=variation.layout || project?.fidelity?.composition || '-';
  setText('#variation-seed',project?.project?.seed || '-');
  setText('#variation-layout',layout);
  setText('#variation-motion',variation.motion?.hero || '-');
  setText('#variation-atmosphere',(variation.atmosphere || []).join(' · ') || '-');
  setText('#generator-mode',project?.generator?.mode || 'fidelity-composer');
  setText('#generated-scenes',String(project?.scenes?.length || 0));
  setText('#generated-layers',String((project?.scenes || []).reduce((n,s)=>n+(s.layers?.length||0),0)));
  if(!panel) return;
  panel.querySelector('[data-qa="composition"]').textContent=LABELS[layout] || layout;
  panel.querySelector('[data-qa="device"]').textContent=device();
  panel.querySelector('[data-qa="assets"]').textContent=`${manifest.ready ?? manifest.assets ?? '-'} / ${manifest.assets ?? '-'} ready`;
  panel.querySelector('[data-qa="vector"]').textContent=`${manifest.scalable ?? '-'} scalable`;
  panel.dataset.state=manifest.valid===false?'warning':'ready';
}

function mountComposition(composition,panel){
  if(!ready()) return;
  const current=window.weddingEditor.getProject?.() || {};
  const seed=current?.project?.seed || 'JL-DEMO-001';
  const project=createJawaFidelityProject({seed,composition});
  project.scenes=[project.scenes[0],...(current.scenes || []).filter(scene=>scene.id!=='cover')];
  window.weddingEditor.setProject(project);
  window.weddingEngine.mount(project);
  window.weddingEngine.decorMotion?.schedule?.();
  document.body.dataset.themePack='jawa-luxury';
  document.body.dataset.jawaComposition=composition;
  updateInspector(project,panel);
  const status=document.querySelector('#engine-status');
  if(status){ status.textContent='Variant Preview Ready'; status.dataset.state='ready'; }
  window.weddingEngine.playIntro?.();
}

function boot(){
  if(!ready()){ setTimeout(boot,60); return; }
  const themeGroup=document.querySelector('.right-panel .property-group');
  if(!themeGroup || document.querySelector('#jawa-composition-select')) return;
  const panel=document.createElement('section');
  panel.className='fidelity-qa-panel';
  panel.innerHTML=`<div class="fidelity-qa-head"><div><span>Stage #9.6</span><strong>Jawa Fidelity QA</strong></div><i></i></div><label class="fidelity-selector-label" for="jawa-composition-select">Composition</label><select id="jawa-composition-select" class="fidelity-selector"></select><div class="fidelity-qa-grid"><div><span>Active</span><strong data-qa="composition">-</strong></div><div><span>Viewport</span><strong data-qa="device">mobile</strong></div><div><span>Assets</span><strong data-qa="assets">-</strong></div><div><span>Quality</span><strong data-qa="vector">-</strong></div></div><button type="button" class="fidelity-replay">REPLAY FIDELITY INTRO</button>`;
  themeGroup.insertAdjacentElement('afterend',panel);
  const select=panel.querySelector('#jawa-composition-select');
  JAWA_FIDELITY_COMPOSITIONS.forEach(id=>{ const option=document.createElement('option'); option.value=id; option.textContent=LABELS[id] || id; select.appendChild(option); });
  const current=window.weddingEditor.getProject?.();
  const active=current?.variation?.layout || 'royal-joglo-garden';
  select.value=JAWA_FIDELITY_COMPOSITIONS.includes(active)?active:'royal-joglo-garden';
  updateInspector(current,panel);
  select.addEventListener('change',()=>mountComposition(select.value,panel));
  panel.querySelector('.fidelity-replay').addEventListener('click',()=>window.weddingEngine.playIntro?.());
  document.querySelectorAll('[data-device]').forEach(button=>button.addEventListener('click',()=>setTimeout(()=>updateInspector(window.weddingEditor.getProject?.(),panel),0)));
  document.querySelector('#preset-select')?.addEventListener('change',event=>{ panel.hidden=event.target.value!=='jawa-luxury'; });
  document.querySelector('#generate-variation')?.addEventListener('click',()=>setTimeout(()=>{ const p=window.weddingEditor.getProject?.(); const l=p?.variation?.layout; if(JAWA_FIDELITY_COMPOSITIONS.includes(l)) select.value=l; updateInspector(p,panel); },100));
}

boot();
