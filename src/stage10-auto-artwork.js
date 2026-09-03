import { AutoArtworkTransformEngine, ARTWORK_PRESETS, ARTWORK_ENGINE_VERSION, providerStatus } from './artwork/auto-artwork-transform-engine.js';

const engine=new AutoArtworkTransformEngine();
let sourceUrl='';
let currentFileName='';

function ensureStyle(){
  if(document.querySelector('link[data-auto-artwork-style]')) return;
  const link=document.createElement('link'); link.rel='stylesheet'; link.href='/src/stage10-auto-artwork.css'; link.dataset.autoArtworkStyle='true'; document.head.appendChild(link);
}
function ready(){return window.weddingEngine&&window.weddingEditor;}
function revoke(){if(sourceUrl?.startsWith('blob:')) URL.revokeObjectURL(sourceUrl); sourceUrl='';}
function setState(panel,state,message){panel.dataset.state=state; const target=panel.querySelector('[data-art-status]'); if(target) target.textContent=message;}
function updateProvider(panel){const status=providerStatus(); panel.querySelector('[data-art-provider]').textContent=status.connected?status.name:'Fallback only'; panel.dataset.provider=status.connected?'connected':'fallback';}
function fileToUrl(file){revoke(); sourceUrl=URL.createObjectURL(file); currentFileName=file.name; return sourceUrl;}

async function run(panel){
  if(!sourceUrl){setState(panel,'warning','Pilih source image dulu');return;}
  const presetId=panel.querySelector('#auto-artwork-preset').value;
  const button=panel.querySelector('[data-art-run]'); button.disabled=true; button.textContent='PROCESSING…';
  setState(panel,'loading','Analyze → transform → compose → QA');
  try{
    const result=await engine.run({source:sourceUrl,presetId,names:'Anif & Dini',guest:'Tamu Undangan'});
    const q=result.quality;
    panel.querySelector('[data-art-analysis]').textContent=`${result.analysis.width}×${result.analysis.height} · horizon ${Math.round(result.analysis.horizonY*100)}%`;
    panel.querySelector('[data-art-layout]').textContent=result.composition.id;
    panel.querySelector('[data-art-layers]').textContent=String(result.layers.length);
    panel.querySelector('[data-art-qa]').textContent=`${q.score} · ${q.status.toUpperCase()}`;
    panel.querySelector('[data-art-note]').textContent=result.transformed.fallback?'Provider belum terhubung: Studio memakai source-preserving fallback + decor rules. Sambungkan window.weddingArtworkProvider.transform(payload) untuk image-to-image generatif.':'Generative artwork provider aktif; hasil transform dipakai sebagai Scene JSON.';
    window.weddingEditor.setProject(result.project);
    window.weddingEngine.mount(result.project);
    window.weddingEngine.decorMotion?.schedule?.();
    window.weddingEngine.playIntro?.();
    window.weddingAutoArtworkLastRun=result;
    setState(panel,q.ok?'ready':'warning',q.ok?'Artwork candidate ready':'Artwork candidate needs QA');
  }catch(error){console.error('[Auto Artwork Transform]',error); setState(panel,'error',error?.message||'Artwork transform failed');}
  finally{button.disabled=false; button.textContent='AUTO CREATE ARTWORK'; updateProvider(panel);}
}

function boot(){
  ensureStyle();
  if(!ready()){setTimeout(boot,80);return;}
  if(document.querySelector('#auto-artwork-panel')) return;
  const anchor=document.querySelector('.right-panel .property-group'); if(!anchor) return;
  const panel=document.createElement('section'); panel.id='auto-artwork-panel'; panel.className='auto-artwork-panel'; panel.dataset.state='idle';
  panel.innerHTML=`<div class="auto-art-head"><div><span>Stage #10.1–#10.8</span><strong>Auto Artwork Transform Engine</strong></div><i></i></div><label class="auto-art-file"><input id="auto-artwork-file" type="file" accept="image/*"><span data-art-file>Choose source image</span></label><label class="auto-art-label">Artwork preset<select id="auto-artwork-preset"></select></label><div class="auto-art-grid"><div><span>Provider</span><strong data-art-provider>-</strong></div><div><span>Analysis</span><strong data-art-analysis>not run</strong></div><div><span>Composition</span><strong data-art-layout>-</strong></div><div><span>Layers</span><strong data-art-layers>-</strong></div><div><span>Quality</span><strong data-art-qa>-</strong></div><div><span>Version</span><strong>${ARTWORK_ENGINE_VERSION}</strong></div></div><button type="button" data-art-run class="auto-art-run">AUTO CREATE ARTWORK</button><div class="auto-art-status" data-art-status>Ready for source image</div><p data-art-note>Pipeline aktif. Tanpa provider generatif, engine tetap menganalisis source, memilih composition, inject decor, membangun layers, QA, Scene JSON, dan preview fallback.</p>`;
  anchor.insertAdjacentElement('afterend',panel);
  const select=panel.querySelector('#auto-artwork-preset'); Object.values(ARTWORK_PRESETS).forEach(p=>{const o=document.createElement('option');o.value=p.id;o.textContent=p.label;select.appendChild(o);}); select.value='javanese-heritage';
  const fileInput=panel.querySelector('#auto-artwork-file'); fileInput.addEventListener('change',()=>{const file=fileInput.files?.[0]; if(!file)return; fileToUrl(file); panel.querySelector('[data-art-file]').textContent=file.name; setState(panel,'idle','Source ready');});
  panel.querySelector('[data-art-run]').addEventListener('click',()=>run(panel)); updateProvider(panel);
  window.weddingAutoArtwork={engine,run:options=>engine.run(options),version:ARTWORK_ENGINE_VERSION};
  const header=document.querySelector('.brand-wrap span'); if(header) header.textContent='Auto Artwork Transform Engine · Stage #10.8';
  const checkpoint=document.querySelector('.checkpoint'); if(checkpoint) checkpoint.textContent='#10.8 Auto Artwork Transform · Analyze → Transform → Layer → QA → Scene JSON';
}

window.addEventListener('pagehide',revoke,{once:true});
boot();
console.info(`[Wedding Template Studio] Auto Artwork Transform Engine ${ARTWORK_ENGINE_VERSION} booting.`);
