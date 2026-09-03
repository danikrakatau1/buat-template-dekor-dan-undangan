import { JAWA_FIDELITY_COMPOSITIONS } from './art-direction/jawa-composition-variants.js';
import { auditFinalAssetRegistry, ROYAL_JOGLO_FINAL_SLOTS, FINAL_ASSET_REGISTRY_VERSION } from './art-direction/final-asset-registry.js';

const DEVICES=['mobile','tablet','desktop'];
const REQUIRED_P0=Object.values(ROYAL_JOGLO_FINAL_SLOTS).filter(slot=>slot.required).map(slot=>slot.id);
const REQUIRED_CONTENT=['cover-title','couple-name','guest-name','open-button'];
const LABELS={
  'royal-joglo-garden':'Royal Joglo Garden',
  'carved-arch-heritage':'Carved Arch Heritage',
  'mountain-heritage':'Mountain Heritage',
  'floral-pendopo':'Floral Pendopo'
};

const wait=(ms=120)=>new Promise(resolve=>setTimeout(resolve,ms));
const widthNumber=value=>Number.parseFloat(String(value ?? '0').replace('%','')) || 0;
const getLayer=(scene,id)=>scene?.layers?.find(layer=>layer.id===id);
const unique=items=>[...new Set(items)];

function sourceContract(layer){
  const asset=layer?.asset || {};
  return {
    active:asset.resolvedSrc || asset.src || '',
    production:asset.productionSrc || '',
    fallback:asset.fallbackSrc || '',
    hasUsable:Boolean(asset.resolvedSrc || asset.src || asset.fallbackSrc)
  };
}

function inspectDom(scene){
  const section=document.querySelector(`[data-scene-id="${CSS.escape(scene?.id || 'cover')}"]`);
  if(!section) return {section:false,hybrid:false,domImages:0,gpuBacked:0,blank:true};
  const images=[...section.querySelectorAll('.layer-image img')];
  const loaded=images.filter(img=>Boolean(img.currentSrc || img.src));
  const hybrid=section.dataset.hybridFidelity==='ready';
  const gpuBacked=section.querySelectorAll('.gpu-backed-proxy').length;
  const blank=!hybrid && loaded.length===0;
  return {section:true,hybrid,domImages:loaded.length,gpuBacked,blank};
}

function inspectProject(project,device){
  const scene=project?.scenes?.find(item=>item.id==='cover');
  const ids=(scene?.layers||[]).map(layer=>layer.id);
  const duplicateIds=unique(ids.filter((id,index)=>ids.indexOf(id)!==index));
  const missingP0=REQUIRED_P0.filter(id=>!ids.includes(id));
  const missingContent=REQUIRED_CONTENT.filter(id=>!ids.includes(id));
  const registry=auditFinalAssetRegistry();
  const issues=[];
  const warnings=[];

  if(!scene) issues.push('cover scene missing');
  if(missingP0.length) issues.push(`missing P0 artwork: ${missingP0.join(', ')}`);
  if(missingContent.length) issues.push(`missing content layers: ${missingContent.join(', ')}`);
  if(duplicateIds.length) issues.push(`duplicate layer ids: ${duplicateIds.join(', ')}`);
  if(!registry.contractReady) issues.push('final asset registry contract invalid');
  if(project?.fidelity?.registryVersion && project.fidelity.registryVersion!==FINAL_ASSET_REGISTRY_VERSION) issues.push(`registry version drift: ${project.fidelity.registryVersion}`);

  for(const id of REQUIRED_P0){
    const layer=getLayer(scene,id);
    const contract=sourceContract(layer);
    if(layer && !contract.hasUsable) issues.push(`${id} has no active/fallback source`);
    if(layer?.fidelity?.required!==true) warnings.push(`${id} is not marked required in Scene JSON`);
  }

  const hero=getLayer(scene,'hero-joglo-sepia-01');
  const gunungan=getLayer(scene,'orn-gunungan-gold-01');
  const names=getLayer(scene,'couple-name');
  const guest=getLayer(scene,'guest-name');
  const button=getLayer(scene,'open-button');
  const floral=getLayer(scene,'floral-bottom-burgundy-01');

  const heroY=Number(hero?.transform?.y);
  if(!(heroY>=70 && heroY<=86)) issues.push(`joglo y ${heroY || '-'} outside heritage zone`);
  const heroWidth=widthNumber(hero?.transform?.width);
  if(!(heroWidth>=68 && heroWidth<=108)) issues.push(`joglo width ${heroWidth || '-'}% outside tuned range`);
  const gununganWidth=widthNumber(gunungan?.transform?.width);
  if(gununganWidth>19) issues.push(`gunungan too dominant (${gununganWidth}%)`);
  const nameY=Number(names?.transform?.y);
  if(!(nameY>=33 && nameY<=43)) issues.push(`couple-name y ${nameY || '-'} outside safe zone`);
  const guestY=Number(guest?.transform?.y);
  if(!(guestY>=44 && guestY<=53)) issues.push(`guest-name y ${guestY || '-'} outside safe zone`);
  const buttonY=Number(button?.transform?.y);
  if(!(buttonY>=54 && buttonY<=63)) issues.push(`CTA y ${buttonY || '-'} outside safe zone`);
  const floralY=Number(floral?.transform?.y);
  if(!(floralY>=89 && floralY<=98)) issues.push(`foreground floral y ${floralY || '-'} outside bottom bed`);
  if(Number(scene?.atmosphere?.intensity)>0.18) warnings.push('atmosphere stronger than final engraving recommendation');
  if(device==='mobile' && Number(scene?.responsive?.mobile?.parallaxMultiplier)>0.30) issues.push('mobile parallax exceeds 0.30');

  const dom=inspectDom(scene);
  if(dom.blank) issues.push('renderer output appears blank: no GPU surface and no DOM image fallback');
  if(!dom.hybrid) warnings.push('Pixi not ready; DOM fallback is active');

  const promotionPending=registry.productionPromotionPending || [];
  if(promotionPending.length) warnings.push(`${promotionPending.length} production HD path(s) still pending promotion`);

  const penalty=(issues.length*9)+(warnings.length*2)+(missingP0.length*10)+(duplicateIds.length*10);
  const score=Math.max(0,100-penalty);
  const status=issues.length===0 && score>=90?'pass':issues.length===0?'warn':'fail';
  return {
    composition:project?.variation?.layout || scene?.fidelity?.composition || '-',
    device,status,score,issues,warnings,
    registry:{version:registry.version,contractReady:registry.contractReady,required:registry.required,promotionPending:promotionPending.length},
    renderer:dom
  };
}

function renderResults(panel,results){
  const list=panel.querySelector('.reference-regression-list');
  list.replaceChildren();
  for(const result of results){
    const row=document.createElement('button');
    row.type='button';
    row.className='reference-regression-case';
    row.dataset.state=result.status;
    row.innerHTML=`<span>${LABELS[result.composition] || result.composition}<em>${result.device} · ${result.renderer.hybrid?'Pixi':'DOM'}</em></span><strong>${result.score}</strong><i>${result.status.toUpperCase()}</i>`;
    row.title=[...result.issues,...result.warnings].join('\n') || 'Final fidelity regression checks passed';
    row.addEventListener('click',async()=>{
      const select=document.querySelector('#jawa-composition-select');
      const deviceButton=document.querySelector(`[data-device="${result.device}"]`);
      if(select){ select.value=result.composition; select.dispatchEvent(new Event('change',{bubbles:true})); }
      deviceButton?.click();
      await wait(180);
    });
    list.appendChild(row);
  }
  const pass=results.filter(item=>item.status==='pass').length;
  const warn=results.filter(item=>item.status==='warn').length;
  const fail=results.filter(item=>item.status==='fail').length;
  const gpu=results.filter(item=>item.renderer.hybrid).length;
  panel.querySelector('[data-regression="summary"]').textContent=`${pass} pass · ${warn} warn · ${fail} fail · ${gpu}/12 Pixi`;
  panel.dataset.state=fail?'fail':warn?'warn':'pass';
}

async function runRegression(panel){
  const select=document.querySelector('#jawa-composition-select');
  if(!select || !window.weddingEditor) return;
  const activeDevice=document.querySelector('[data-device].active')?.dataset.device || 'mobile';
  const activeComposition=select.value;
  const runButton=panel.querySelector('.reference-regression-run');
  runButton.disabled=true;
  runButton.textContent='SCANNING 12 FINAL CASES…';
  const results=[];

  for(const composition of JAWA_FIDELITY_COMPOSITIONS){
    select.value=composition;
    select.dispatchEvent(new Event('change',{bubbles:true}));
    await wait(260);
    for(const device of DEVICES){
      document.querySelector(`[data-device="${device}"]`)?.click();
      await wait(180);
      results.push(inspectProject(window.weddingEditor.getProject?.(),device));
    }
  }

  select.value=activeComposition;
  select.dispatchEvent(new Event('change',{bubbles:true}));
  await wait(220);
  document.querySelector(`[data-device="${activeDevice}"]`)?.click();
  renderResults(panel,results);
  const registry=auditFinalAssetRegistry();
  window.weddingFinalFidelityRegression={
    version:'9.9.6',ranAt:new Date().toISOString(),
    matrix:'4 compositions × 3 viewports',
    registry,
    results,
    visualJudgementRequired:true,
    note:'Automated regression verifies structure, registry/source parity, fallback safety and render availability. Human visual comparison against the approved engraving reference remains required.'
  };
  window.weddingReferenceRegression=window.weddingFinalFidelityRegression;
  runButton.disabled=false;
  runButton.textContent='RUN FINAL 12-CASE REGRESSION';
}

async function copyReport(panel){
  const report=window.weddingFinalFidelityRegression || window.weddingReferenceRegression;
  if(!report) return;
  try{
    await navigator.clipboard.writeText(JSON.stringify(report,null,2));
    const button=panel.querySelector('.reference-regression-copy');
    button.textContent='FINAL REPORT COPIED';
    setTimeout(()=>button.textContent='COPY FINAL REPORT JSON',1000);
  }catch{}
}

function boot(){
  const qaPanel=document.querySelector('.fidelity-qa-panel');
  if(!qaPanel || !window.weddingEditor){ setTimeout(boot,80); return; }
  document.querySelector('.reference-regression-panel')?.remove();
  const panel=document.createElement('section');
  panel.className='reference-regression-panel';
  panel.dataset.state='idle';
  panel.innerHTML=`
    <div class="reference-regression-head"><div><span>Stage #9.9.6</span><strong>Final Fidelity Regression</strong></div><b data-regression="summary">not run</b></div>
    <p>Final 4-composition × 3-viewport regression for registry parity, P0 artwork contracts, Pixi/DOM fallback safety and tuned cover geometry. Visual reference judgement is intentionally kept as a human QA gate.</p>
    <div class="reference-regression-actions"><button type="button" class="reference-regression-run">RUN FINAL 12-CASE REGRESSION</button><button type="button" class="reference-regression-copy">COPY FINAL REPORT JSON</button></div>
    <div class="reference-regression-list"></div>`;
  qaPanel.insertAdjacentElement('afterend',panel);
  panel.querySelector('.reference-regression-run').addEventListener('click',()=>runRegression(panel));
  panel.querySelector('.reference-regression-copy').addEventListener('click',()=>copyReport(panel));
  document.querySelector('#preset-select')?.addEventListener('change',event=>{ panel.hidden=event.target.value!=='jawa-luxury'; });
}

boot();
console.info('[Wedding Template Studio] Stage #9.9.6 Final Fidelity Regression Pass ready.');
