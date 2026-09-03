import { AutoArtworkTransformEngine, ARTWORK_PRESETS, ARTWORK_ENGINE_VERSION, MASTER_TRANSFORM_PROMPT_VERSION, providerStatus } from './artwork/auto-artwork-transform-engine.js';
import { installDefaultGenerativeProvider } from './artwork/providers/http-generative-provider.js';

const STAGE_REVISION='10.10B';
const defaultProvider=installDefaultGenerativeProvider({name:'Cloudflare Workers AI Provider'});
const engine=new AutoArtworkTransformEngine();
let sourceUrl='';
let currentFileName='';

function ensureStyle(){if(document.querySelector('link[data-auto-artwork-style]')) return;const link=document.createElement('link');link.rel='stylesheet';link.href='/src/stage10-auto-artwork.css';link.dataset.autoArtworkStyle='true';document.head.appendChild(link);}
function ready(){return window.weddingEngine&&window.weddingEditor;}
function revoke(){if(sourceUrl?.startsWith('blob:')) URL.revokeObjectURL(sourceUrl);sourceUrl='';}
function setState(panel,state,message){panel.dataset.state=state;const target=panel.querySelector('[data-art-status]');if(target) target.textContent=message;}
function fileToUrl(file){revoke();sourceUrl=URL.createObjectURL(file);currentFileName=file.name;return sourceUrl;}

async function updateProvider(panel){
  const status=providerStatus(),target=panel.querySelector('[data-art-provider]');
  if(!status.connected){target.textContent='Fallback only';panel.dataset.provider='fallback';return;}
  target.textContent=status.name;panel.dataset.provider='checking';
  if(typeof defaultProvider.health!=='function'){panel.dataset.provider='connected';return;}
  const health=await defaultProvider.health();
  const model=panel.querySelector('[data-art-model]');if(model) model.textContent=health.model||'-';
  const revision=panel.querySelector('[data-art-revision]');if(revision) revision.textContent=health.revision||STAGE_REVISION;
  if(health.reachable&&health.configured){target.textContent='Cloudflare Workers AI';panel.dataset.provider='connected';}
  else if(health.reachable){target.textContent='AI binding missing';panel.dataset.provider='warning';}
  else{target.textContent='Provider endpoint offline';panel.dataset.provider='error';}
}

async function run(panel){
  if(!sourceUrl){setState(panel,'warning','Pilih source image dulu');return;}
  const presetId=panel.querySelector('#auto-artwork-preset').value;
  const button=panel.querySelector('[data-art-run]');button.disabled=true;button.textContent='GENERATING…';
  setState(panel,'loading','Analyze → Master Prompt V1 → Workers AI Strong Img2Img → compose → QA');
  try{
    const result=await engine.run({source:sourceUrl,presetId,names:'Anif & Dini',guest:'Tamu Undangan'}),q=result.quality;
    panel.querySelector('[data-art-analysis]').textContent=`${result.analysis.width}×${result.analysis.height} · horizon ${Math.round(result.analysis.horizonY*100)}%`;
    panel.querySelector('[data-art-layout]').textContent=result.composition.id;
    panel.querySelector('[data-art-layers]').textContent=String(result.layers.length);
    panel.querySelector('[data-art-qa]').textContent=`${q.score} · ${q.status.toUpperCase()}`;
    panel.querySelector('[data-art-adapter]').textContent=result.prompt?.themeAdapter||result.transformed.prompt?.themeAdapter||'-';
    panel.querySelector('[data-art-prompt]').textContent=result.prompt?.version||result.transformed.prompt?.version||MASTER_TRANSFORM_PROMPT_VERSION;
    const providerMeta=result.transformed.providerMeta||{};
    if(providerMeta.model){const model=panel.querySelector('[data-art-model]');if(model)model.textContent=providerMeta.model;}
    if(providerMeta.revision){const revision=panel.querySelector('[data-art-revision]');if(revision)revision.textContent=providerMeta.revision;}
    panel.querySelector('[data-art-note]').textContent=result.transformed.fallback
      ?'Workers AI belum aktif; source-preserving fallback digunakan. Master Transform Prompt V1 tetap tersimpan di payload.'
      :`Strong img2img transform selesai${providerMeta.model?` via ${providerMeta.model}`:''}; output diteruskan ke decor rules, layer extraction, QA, Scene JSON, dan Pixi runtime.`;
    window.weddingEditor.setProject(result.project);window.weddingEngine.mount(result.project);window.weddingEngine.decorMotion?.schedule?.();window.weddingEngine.playIntro?.();
    window.weddingAutoArtworkLastRun=result;window.weddingAutoArtworkPrompt=result.prompt||result.transformed.prompt;
    setState(panel,q.ok?'ready':'warning',q.ok?'Strong transform artwork candidate ready':'Artwork candidate needs QA');
  }catch(error){
    console.error('[Auto Artwork Transform]',error);const message=error?.message||'Artwork transform failed';setState(panel,'error',message);
    panel.querySelector('[data-art-note]').textContent=message.includes('binding')||message.includes('Workers AI')
      ?`Backend #${STAGE_REVISION} memakai Cloudflare Workers AI, tetapi binding AI belum terpasang. Tambahkan Workers AI binding bernama AI di project Cloudflare Pages lalu redeploy.`
      :`Generative transform gagal: ${message}`;
  }finally{button.disabled=false;button.textContent='AUTO CREATE ARTWORK';await updateProvider(panel);}
}

function boot(){
  ensureStyle();if(!ready()){setTimeout(boot,80);return;}if(document.querySelector('#auto-artwork-panel')) return;
  const anchor=document.querySelector('.right-panel .property-group');if(!anchor) return;
  const panel=document.createElement('section');panel.id='auto-artwork-panel';panel.className='auto-artwork-panel';panel.dataset.state='idle';
  panel.innerHTML=`<div class="auto-art-head"><div><span>Stage #${STAGE_REVISION}</span><strong>Cloudflare Workers AI · Strong Img2Img</strong></div><i></i></div><label class="auto-art-file"><input id="auto-artwork-file" type="file" accept="image/*"><span data-art-file>Choose source image</span></label><label class="auto-art-label">Artwork preset<select id="auto-artwork-preset"></select></label><div class="auto-art-grid"><div><span>Provider</span><strong data-art-provider>checking…</strong></div><div><span>Model</span><strong data-art-model>-</strong></div><div><span>Revision</span><strong data-art-revision>${STAGE_REVISION}</strong></div><div><span>Prompt</span><strong data-art-prompt>${MASTER_TRANSFORM_PROMPT_VERSION}</strong></div><div><span>Theme Adapter</span><strong data-art-adapter>auto</strong></div><div><span>Analysis</span><strong data-art-analysis>not run</strong></div><div><span>Composition</span><strong data-art-layout>-</strong></div><div><span>Layers</span><strong data-art-layers>-</strong></div><div><span>Quality</span><strong data-art-qa>-</strong></div></div><button type="button" data-art-run class="auto-art-run">AUTO CREATE ARTWORK</button><div class="auto-art-status" data-art-status>Ready for source image</div><p data-art-note>Stage #10.10B memakai strong-transform profile untuk memaksa redraw engraving, bukan sekadar mempertahankan source dengan filter sepia.</p>`;
  anchor.insertAdjacentElement('afterend',panel);
  const select=panel.querySelector('#auto-artwork-preset');Object.values(ARTWORK_PRESETS).forEach(p=>{const o=document.createElement('option');o.value=p.id;o.textContent=p.label;select.appendChild(o);});select.value='javanese-heritage';
  const fileInput=panel.querySelector('#auto-artwork-file');fileInput.addEventListener('change',()=>{const file=fileInput.files?.[0];if(!file)return;fileToUrl(file);panel.querySelector('[data-art-file]').textContent=file.name;setState(panel,'idle','Source ready · choose preset and generate');});
  panel.querySelector('[data-art-run]').addEventListener('click',()=>run(panel));updateProvider(panel);
  window.weddingAutoArtwork={engine,provider:defaultProvider,run:options=>engine.run(options),version:ARTWORK_ENGINE_VERSION,promptVersion:MASTER_TRANSFORM_PROMPT_VERSION,stageRevision:STAGE_REVISION};
  const header=document.querySelector('.brand-wrap span');if(header) header.textContent=`Cloudflare Workers AI Strong Img2Img · Stage #${STAGE_REVISION}`;
  const checkpoint=document.querySelector('.checkpoint');if(checkpoint) checkpoint.textContent=`#${STAGE_REVISION} Workers AI Strong Img2Img · Master Prompt V1 → Redraw → Layer → QA → Pixi`;
}

window.addEventListener('pagehide',revoke,{once:true});
boot();
console.info(`[Wedding Template Studio] Stage #${STAGE_REVISION} Cloudflare Workers AI Strong Img2Img booting on Artwork Engine ${ARTWORK_ENGINE_VERSION}.`);
