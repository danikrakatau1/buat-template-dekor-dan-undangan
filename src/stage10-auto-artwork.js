import { AutoArtworkTransformEngine, ARTWORK_PRESETS, ARTWORK_ENGINE_VERSION, MASTER_TRANSFORM_PROMPT_VERSION, providerStatus } from './artwork/auto-artwork-transform-engine.js';
import { installDefaultGenerativeProvider } from './artwork/providers/http-generative-provider.js';

const STAGE_REVISION='10.10C';
const defaultProvider=installDefaultGenerativeProvider({name:'Cloudflare Workers AI Provider'});
const engine=new AutoArtworkTransformEngine();
let sourceUrl='';
let currentFileName='';

function ensureStyle(){if(document.querySelector('link[data-auto-artwork-style]')) return;const link=document.createElement('link');link.rel='stylesheet';link.href='/src/stage10-auto-artwork.css';link.dataset.autoArtworkStyle='true';document.head.appendChild(link);}
function ready(){return window.weddingEngine&&window.weddingEditor;}
function revoke(){if(sourceUrl?.startsWith('blob:')) URL.revokeObjectURL(sourceUrl);sourceUrl='';}
function setState(panel,state,message){panel.dataset.state=state;const target=panel.querySelector('[data-art-status]');if(target) target.textContent=message;}
function fileToUrl(file){revoke();sourceUrl=URL.createObjectURL(file);currentFileName=file.name;return sourceUrl;}
function setText(panel,selector,value){const el=panel.querySelector(selector);if(el)el.textContent=value??'-';}

async function imageSignature(src){
  if(!src)return null;
  return new Promise(resolve=>{
    const img=new Image();img.decoding='async';
    img.onload=()=>{
      try{
        const c=document.createElement('canvas');c.width=24;c.height=24;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,24,24);
        const d=ctx.getImageData(0,0,24,24).data;let sum=0,edge=0,prev=0;
        for(let i=0;i<d.length;i+=4){const y=(d[i]*.2126+d[i+1]*.7152+d[i+2]*.0722)/255;sum+=y;edge+=Math.abs(y-prev);prev=y;}
        resolve({mean:sum/576,edge:edge/576});
      }catch{resolve(null);}
    };
    img.onerror=()=>resolve(null);img.src=src;
  });
}

async function outputTrace(source,result){
  const output=result?.transformed?.compositeSrc||result?.transformed?.layers?.[0]?.src||'';
  if(!output)return {state:'NO OUTPUT',delta:null};
  if(output===source)return {state:'SOURCE REUSED',delta:0};
  const [a,b]=await Promise.all([imageSignature(source),imageSignature(output)]);
  if(!a||!b)return {state:'GENERATED OUTPUT',delta:null};
  const delta=Math.abs(a.mean-b.mean)+Math.abs(a.edge-b.edge);
  return {state:delta<.012?'SUSPICIOUSLY SIMILAR':'GENERATED / CHANGED',delta};
}

async function updateProvider(panel){
  const status=providerStatus(),target=panel.querySelector('[data-art-provider]');
  if(!status.connected){target.textContent='Fallback only';panel.dataset.provider='fallback';return;}
  target.textContent=status.name;panel.dataset.provider='checking';
  if(typeof defaultProvider.health!=='function'){panel.dataset.provider='connected';return;}
  const health=await defaultProvider.health();
  setText(panel,'[data-art-model]',health.model||'-');
  setText(panel,'[data-art-revision]',health.revision||STAGE_REVISION);
  if(health.generation){setText(panel,'[data-art-profile]',`S ${health.generation.strength??'-'} · G ${health.generation.guidance??'-'} · ${health.generation.steps??'-'} steps`);}
  if(health.reachable&&health.configured){target.textContent='Cloudflare Workers AI';panel.dataset.provider='connected';}
  else if(health.reachable){target.textContent='AI binding missing';panel.dataset.provider='warning';}
  else{target.textContent='Provider endpoint offline';panel.dataset.provider='error';}
}

async function run(panel){
  if(!sourceUrl){setState(panel,'warning','Pilih source image dulu');return;}
  const presetId=panel.querySelector('#auto-artwork-preset').value;
  const button=panel.querySelector('[data-art-run]');button.disabled=true;button.textContent='GENERATING…';
  setText(panel,'[data-art-output]','WAITING FOR AI');setText(panel,'[data-art-fallback]','-');
  setState(panel,'loading','Analyze → Master Prompt V1 → Workers AI → verify output → compose → QA');
  try{
    const result=await engine.run({source:sourceUrl,presetId,names:'Anif & Dini',guest:'Tamu Undangan'}),q=result.quality;
    setText(panel,'[data-art-analysis]',`${result.analysis.width}×${result.analysis.height} · horizon ${Math.round(result.analysis.horizonY*100)}%`);
    setText(panel,'[data-art-layout]',result.composition.id);
    setText(panel,'[data-art-layers]',String(result.layers.length));
    setText(panel,'[data-art-qa]',`${q.score} · ${q.status.toUpperCase()}`);
    setText(panel,'[data-art-adapter]',result.prompt?.themeAdapter||result.transformed.prompt?.themeAdapter||'-');
    setText(panel,'[data-art-prompt]',result.prompt?.version||result.transformed.prompt?.version||MASTER_TRANSFORM_PROMPT_VERSION);
    const providerMeta=result.transformed.providerMeta||{};
    if(providerMeta.model)setText(panel,'[data-art-model]',providerMeta.model);
    if(providerMeta.revision)setText(panel,'[data-art-revision]',providerMeta.revision);
    if(providerMeta.generation)setText(panel,'[data-art-profile]',`S ${providerMeta.generation.strength??'-'} · G ${providerMeta.generation.guidance??'-'} · ${providerMeta.generation.steps??'-'} steps`);
    setText(panel,'[data-art-fallback]',providerMeta.fallbackUsed?'YES':'NO');
    const trace=await outputTrace(sourceUrl,result);
    setText(panel,'[data-art-output]',trace.delta==null?trace.state:`${trace.state} · Δ ${trace.delta.toFixed(3)}`);
    panel.dataset.outputTrace=trace.state.toLowerCase().replace(/\s+/g,'-');
    panel.querySelector('[data-art-note]').textContent=result.transformed.fallback
      ?'Workers AI belum aktif; source-preserving fallback digunakan.'
      :trace.state==='SOURCE REUSED'
        ?'BUG TRACE: provider path mengembalikan source asli, jadi renderer memang terlihat sama. Jalur output harus dibongkar.'
        :trace.state==='SUSPICIOUSLY SIMILAR'
          ?'Provider menghasilkan output, tetapi secara visual masih terlalu mirip source. Naikkan transform strength/model atau ganti model img2img.'
          :`Output AI terverifikasi berbeda dari source${providerMeta.model?` via ${providerMeta.model}`:''}; sekarang Scene JSON + renderer memakai candidate baru.`;
    window.weddingEditor.setProject(result.project);window.weddingEngine.mount(result.project);window.weddingEngine.decorMotion?.schedule?.();window.weddingEngine.playIntro?.();
    window.weddingAutoArtworkLastRun=result;window.weddingAutoArtworkPrompt=result.prompt||result.transformed.prompt;window.weddingAutoArtworkTrace=trace;
    setState(panel,q.ok?'ready':'warning',trace.state==='SOURCE REUSED'?'Provider output reused source':q.ok?'AI output traced · artwork candidate ready':'Artwork candidate needs QA');
  }catch(error){
    console.error('[Auto Artwork Transform]',error);const message=error?.message||'Artwork transform failed';setState(panel,'error',message);setText(panel,'[data-art-output]','ERROR');
    panel.querySelector('[data-art-note]').textContent=message.includes('binding')||message.includes('Workers AI')
      ?`Backend #${STAGE_REVISION} memakai Cloudflare Workers AI, tetapi binding AI belum aktif.`
      :`Generative transform gagal: ${message}`;
  }finally{button.disabled=false;button.textContent='AUTO CREATE ARTWORK';await updateProvider(panel);}
}

function boot(){
  ensureStyle();if(!ready()){setTimeout(boot,80);return;}if(document.querySelector('#auto-artwork-panel')) return;
  const anchor=document.querySelector('.right-panel .property-group');if(!anchor) return;
  const panel=document.createElement('section');panel.id='auto-artwork-panel';panel.className='auto-artwork-panel';panel.dataset.state='idle';
  panel.innerHTML=`<div class="auto-art-head"><div><span>Stage #${STAGE_REVISION}</span><strong>Cloudflare Workers AI · Output Trace</strong></div><i></i></div><label class="auto-art-file"><input id="auto-artwork-file" type="file" accept="image/*"><span data-art-file>Choose source image</span></label><label class="auto-art-label">Artwork preset<select id="auto-artwork-preset"></select></label><div class="auto-art-grid"><div><span>Provider</span><strong data-art-provider>checking…</strong></div><div><span>Model</span><strong data-art-model>-</strong></div><div><span>Revision</span><strong data-art-revision>${STAGE_REVISION}</strong></div><div><span>Profile</span><strong data-art-profile>strong</strong></div><div><span>Output Trace</span><strong data-art-output>not run</strong></div><div><span>Fallback Model</span><strong data-art-fallback>-</strong></div><div><span>Prompt</span><strong data-art-prompt>${MASTER_TRANSFORM_PROMPT_VERSION}</strong></div><div><span>Theme Adapter</span><strong data-art-adapter>auto</strong></div><div><span>Analysis</span><strong data-art-analysis>not run</strong></div><div><span>Composition</span><strong data-art-layout>-</strong></div><div><span>Layers</span><strong data-art-layers>-</strong></div><div><span>Quality</span><strong data-art-qa>-</strong></div></div><button type="button" data-art-run class="auto-art-run">AUTO CREATE ARTWORK</button><div class="auto-art-status" data-art-status>Ready for source image</div><p data-art-note>Stage #10.10C memverifikasi apakah output Workers AI benar-benar berbeda dari source sebelum menyalahkan prompt atau renderer.</p>`;
  anchor.insertAdjacentElement('afterend',panel);
  const select=panel.querySelector('#auto-artwork-preset');Object.values(ARTWORK_PRESETS).forEach(p=>{const o=document.createElement('option');o.value=p.id;o.textContent=p.label;select.appendChild(o);});select.value='javanese-heritage';
  const fileInput=panel.querySelector('#auto-artwork-file');fileInput.addEventListener('change',()=>{const file=fileInput.files?.[0];if(!file)return;fileToUrl(file);panel.querySelector('[data-art-file]').textContent=file.name;setState(panel,'idle','Source ready · choose preset and generate');setText(panel,'[data-art-output]','SOURCE READY');});
  panel.querySelector('[data-art-run]').addEventListener('click',()=>run(panel));updateProvider(panel);
  window.weddingAutoArtwork={engine,provider:defaultProvider,run:options=>engine.run(options),version:ARTWORK_ENGINE_VERSION,promptVersion:MASTER_TRANSFORM_PROMPT_VERSION,stageRevision:STAGE_REVISION};
  const header=document.querySelector('.brand-wrap span');if(header) header.textContent=`Cloudflare Workers AI Output Trace · Stage #${STAGE_REVISION}`;
  const checkpoint=document.querySelector('.checkpoint');if(checkpoint) checkpoint.textContent=`#${STAGE_REVISION} Output Trace · Source → AI → Compare → Scene JSON → Pixi`;
}

window.addEventListener('pagehide',revoke,{once:true});
boot();
console.info(`[Wedding Template Studio] Stage #${STAGE_REVISION} Workers AI output trace active on Artwork Engine ${ARTWORK_ENGINE_VERSION}.`);
