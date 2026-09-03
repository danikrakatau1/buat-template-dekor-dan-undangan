import { JAWA_FIDELITY_COMPOSITIONS } from './art-direction/jawa-composition-variants.js';

const DEVICES=['mobile','tablet','desktop'];
const REQUIRED_LAYERS=[
  'paper-parchment-cream-01','landscape-java-engraving-01','tree-frame-left-sepia-01','tree-frame-right-sepia-01',
  'arch-jawa-carved-gold-01','hero-joglo-sepia-01','orn-gunungan-gold-01','cover-title','couple-name','guest-name',
  'floral-side-left-burgundy-01','floral-side-right-burgundy-01','floral-bottom-burgundy-01','open-button'
];

const LABELS={
  'royal-joglo-garden':'Royal Joglo Garden',
  'carved-arch-heritage':'Carved Arch Heritage',
  'mountain-heritage':'Mountain Heritage',
  'floral-pendopo':'Floral Pendopo'
};

const wait=(ms=80)=>new Promise(resolve=>setTimeout(resolve,ms));
const widthNumber=value=>Number.parseFloat(String(value ?? '0').replace('%','')) || 0;
const getLayer=(scene,id)=>scene?.layers?.find(layer=>layer.id===id);

function inspectProject(project,device){
  const scene=project?.scenes?.find(item=>item.id==='cover');
  const ids=(scene?.layers||[]).map(layer=>layer.id);
  const duplicateIds=ids.filter((id,index)=>ids.indexOf(id)!==index);
  const missing=REQUIRED_LAYERS.filter(id=>!ids.includes(id));
  const hero=getLayer(scene,'hero-joglo-sepia-01');
  const gunungan=getLayer(scene,'orn-gunungan-gold-01');
  const names=getLayer(scene,'couple-name');
  const guest=getLayer(scene,'guest-name');
  const button=getLayer(scene,'open-button');
  const floral=getLayer(scene,'floral-bottom-burgundy-01');
  const manifest=project?.fidelity?.manifest || {};
  const issues=[];

  if(!scene) issues.push('cover scene missing');
  if(missing.length) issues.push(`missing layers: ${missing.join(', ')}`);
  if(duplicateIds.length) issues.push(`duplicate layer ids: ${[...new Set(duplicateIds)].join(', ')}`);
  if(manifest.valid===false) issues.push('HD manifest invalid');
  if(Number.isFinite(manifest.assets) && Number.isFinite(manifest.ready) && manifest.ready < manifest.assets) issues.push(`${manifest.assets-manifest.ready} asset(s) not ready`);

  const heroY=Number(hero?.transform?.y);
  if(!(heroY>=70 && heroY<=84)) issues.push(`joglo y ${heroY || '-'} outside heritage zone`);
  const heroWidth=widthNumber(hero?.transform?.width);
  if(!(heroWidth>=70 && heroWidth<=105)) issues.push(`joglo width ${heroWidth || '-'}% outside tuned range`);
  const gununganWidth=widthNumber(gunungan?.transform?.width);
  if(gununganWidth>18) issues.push(`gunungan too dominant (${gununganWidth}%)`);
  const nameY=Number(names?.transform?.y);
  if(!(nameY>=34 && nameY<=42)) issues.push(`couple-name y ${nameY || '-'} outside safe zone`);
  const guestY=Number(guest?.transform?.y);
  if(!(guestY>=45 && guestY<=52)) issues.push(`guest-name y ${guestY || '-'} outside safe zone`);
  const buttonY=Number(button?.transform?.y);
  if(!(buttonY>=55 && buttonY<=62)) issues.push(`CTA y ${buttonY || '-'} outside safe zone`);
  const floralY=Number(floral?.transform?.y);
  if(!(floralY>=90 && floralY<=97)) issues.push(`foreground floral y ${floralY || '-'} outside bottom bed`);
  if(Number(scene?.atmosphere?.intensity)>0.2) issues.push('atmosphere is too strong for engraving fidelity');
  if(device==='mobile' && Number(scene?.responsive?.mobile?.parallaxMultiplier)>0.3) issues.push('mobile parallax exceeds 0.30');

  const score=Math.max(0,100-(missing.length*10)-(duplicateIds.length*12)-(issues.length*4));
  const status=score>=90?'pass':score>=75?'warn':'fail';
  return {composition:project?.variation?.layout || '-',device,status,score,issues};
}

function renderResults(panel,results){
  const list=panel.querySelector('.reference-regression-list');
  list.replaceChildren();
  for(const result of results){
    const row=document.createElement('button');
    row.type='button';
    row.className='reference-regression-case';
    row.dataset.state=result.status;
    row.innerHTML=`<span>${LABELS[result.composition] || result.composition}<em>${result.device}</em></span><strong>${result.score}</strong><i>${result.status.toUpperCase()}</i>`;
    row.title=result.issues.length?result.issues.join('\n'):'Structural fidelity checks passed';
    row.addEventListener('click',async()=>{
      const select=document.querySelector('#jawa-composition-select');
      const deviceButton=document.querySelector(`[data-device="${result.device}"]`);
      if(select){ select.value=result.composition; select.dispatchEvent(new Event('change',{bubbles:true})); }
      deviceButton?.click();
      await wait(100);
    });
    list.appendChild(row);
  }
  const pass=results.filter(item=>item.status==='pass').length;
  const warn=results.filter(item=>item.status==='warn').length;
  const fail=results.filter(item=>item.status==='fail').length;
  panel.querySelector('[data-regression="summary"]').textContent=`${pass} pass · ${warn} warn · ${fail} fail`;
  panel.dataset.state=fail?'fail':warn?'warn':'pass';
}

async function runRegression(panel){
  const select=document.querySelector('#jawa-composition-select');
  if(!select || !window.weddingEditor) return;
  const activeDevice=document.querySelector('[data-device].active')?.dataset.device || 'mobile';
  const activeComposition=select.value;
  const runButton=panel.querySelector('.reference-regression-run');
  runButton.disabled=true;
  runButton.textContent='SCANNING 12 CASES…';
  const results=[];

  for(const composition of JAWA_FIDELITY_COMPOSITIONS){
    select.value=composition;
    select.dispatchEvent(new Event('change',{bubbles:true}));
    await wait(95);
    for(const device of DEVICES){
      document.querySelector(`[data-device="${device}"]`)?.click();
      await wait(45);
      results.push(inspectProject(window.weddingEditor.getProject?.(),device));
    }
  }

  select.value=activeComposition;
  select.dispatchEvent(new Event('change',{bubbles:true}));
  await wait(80);
  document.querySelector(`[data-device="${activeDevice}"]`)?.click();
  renderResults(panel,results);
  window.weddingReferenceRegression={version:'9.7',ranAt:new Date().toISOString(),results};
  runButton.disabled=false;
  runButton.textContent='RUN 12-CASE REGRESSION';
}

async function copyReport(panel){
  const report=window.weddingReferenceRegression;
  if(!report) return;
  try{
    await navigator.clipboard.writeText(JSON.stringify(report,null,2));
    const button=panel.querySelector('.reference-regression-copy');
    button.textContent='REPORT COPIED';
    setTimeout(()=>button.textContent='COPY REPORT JSON',1000);
  }catch{}
}

function boot(){
  const qaPanel=document.querySelector('.fidelity-qa-panel');
  if(!qaPanel || !window.weddingEditor){ setTimeout(boot,80); return; }
  if(document.querySelector('.reference-regression-panel')) return;
  const panel=document.createElement('section');
  panel.className='reference-regression-panel';
  panel.dataset.state='idle';
  panel.innerHTML=`
    <div class="reference-regression-head"><div><span>Stage #9.7</span><strong>Reference Regression</strong></div><b data-regression="summary">not run</b></div>
    <p>Automated structural fidelity scan for 4 Jawa compositions × 3 viewports. Pixel/reference judgement remains a visual QA step.</p>
    <div class="reference-regression-actions"><button type="button" class="reference-regression-run">RUN 12-CASE REGRESSION</button><button type="button" class="reference-regression-copy">COPY REPORT JSON</button></div>
    <div class="reference-regression-list"></div>`;
  qaPanel.insertAdjacentElement('afterend',panel);
  panel.querySelector('.reference-regression-run').addEventListener('click',()=>runRegression(panel));
  panel.querySelector('.reference-regression-copy').addEventListener('click',()=>copyReport(panel));
  document.querySelector('#preset-select')?.addEventListener('change',event=>{ panel.hidden=event.target.value!=='jawa-luxury'; });
}

boot();
