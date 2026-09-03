import { AutoArtworkTransformEngine, ARTWORK_PRESETS, ARTWORK_ENGINE_VERSION, MASTER_TRANSFORM_PROMPT_VERSION, providerStatus } from './artwork/auto-artwork-transform-engine.js';
import { installDefaultGenerativeProvider } from './artwork/providers/http-generative-provider.js';

const STAGE_REVISION='10.10G';
const defaultProvider=installDefaultGenerativeProvider({name:'Cloudflare Workers AI Provider'});
const engine=new AutoArtworkTransformEngine();
let sourceUrl='';
let currentFileName='';

function ensureStyle(){
  if(document.querySelector('link[data-auto-artwork-style]')) return;
  const link=document.createElement('link');
  link.rel='stylesheet';
  link.href='/src/stage10-auto-artwork.css';
  link.dataset.autoArtworkStyle='true';
  document.head.appendChild(link);
}
function ready(){return window.weddingEngine&&window.weddingEditor;}
function revoke(){if(sourceUrl?.startsWith('blob:')) URL.revokeObjectURL(sourceUrl);sourceUrl='';}
function setState(panel,state,message){panel.dataset.state=state;const target=panel.querySelector('[data-art-status]');if(target) target.textContent=message;}
function fileToUrl(file){revoke();sourceUrl=URL.createObjectURL(file);currentFileName=file.name;return sourceUrl;}
function setText(panel,selector,value){const el=panel.querySelector(selector);if(el)el.textContent=value??'-';}
function clone(value){return globalThis.structuredClone?structuredClone(value):JSON.parse(JSON.stringify(value));}
function clamp(value,min,max){return Math.max(min,Math.min(max,value));}

async function imageSignature(src){
  if(!src)return null;
  return new Promise(resolve=>{
    const img=new Image();img.decoding='async';
    img.onload=()=>{
      try{
        const c=document.createElement('canvas');c.width=24;c.height=24;
        const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,24,24);
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

function findText(layers,test,fallback){
  return layers.find(layer=>layer?.kind==='text'&&test(String(layer.content||'')))?.content||fallback;
}

function resolveSafeTypographyLayout(result){
  const analysis=result?.analysis||{};
  const safe=result?.composition?.safeTextArea||analysis.safeTextArea||{x:.16,y:.10,w:.68,h:.38};
  const subjectY=Number(analysis?.subjectCenter?.y??.58);
  const subjectX=Number(analysis?.subjectCenter?.x??.5);
  const safeTop=clamp(Number(safe.y??.12)*100,8,42);
  const safeHeight=clamp(Number(safe.h??.36)*100,24,44);
  const safeBottom=clamp(safeTop+safeHeight,38,66);
  const subjectInMiddle=subjectY>.34&&subjectY<.70;
  const preferTop=analysis.negativeSpace==='center-top'||subjectY>=.52||subjectInMiddle;
  const mode=preferTop?'top-copy':'bottom-copy';

  if(mode==='top-copy'){
    const title=clamp(safeTop+2,9,22);
    const names=clamp(title+7,17,31);
    const guestLabel=clamp(names+9,28,41);
    const guest=clamp(guestLabel+4,33,46);
    const location=clamp(guest+4,37,50);
    const cta=clamp(Math.max(location+7,safeBottom+2),46,58);
    return {mode,title,names,guestLabel,guest,location,cta,subjectX,subjectY,safe};
  }

  const cta=clamp(Math.max(68,safeTop+safeHeight-2),66,82);
  const location=clamp(cta-7,59,75);
  const guest=clamp(location-4,55,70);
  const guestLabel=clamp(guest-4,50,66);
  const names=clamp(guestLabel-10,39,56);
  const title=clamp(names-7,32,49);
  return {mode,title,names,guestLabel,guest,location,cta,subjectX,subjectY,safe};
}

function normalizeGeneratedProject(result){
  if(result?.transformed?.fallback) return result.project;
  const generatedSrc=result?.transformed?.compositeSrc||result?.transformed?.layers?.find(layer=>layer?.src)?.src||'';
  if(!generatedSrc) return result.project;

  const project=clone(result.project||{});
  const cover=project?.scenes?.find(scene=>scene.type==='cover')||project?.scenes?.[0];
  if(!cover) return project;
  const oldLayers=Array.isArray(cover.layers)?cover.layers:[];
  const names=findText(oldLayers,value=>value.includes('&'),'Anif & Dini');
  const guest=findText(oldLayers,value=>/tamu undangan/i.test(value),'Tamu Undangan');
  const layout=resolveSafeTypographyLayout(result);

  cover.background=null;
  cover.atmosphere={effects:[]};
  cover.disableEditorOverlay=true;
  cover.fidelity={...(cover.fidelity||{}),system:'auto-artwork-transform',handoff:'generated-safe-ui-10.10G'};
  cover.renderHandoff='10.10G';
  cover.safeUILayout={...layout,safeTextArea:layout.safe};
  cover.layers=[
    {
      id:'ai-transformed-base',kind:'image',role:'background',src:generatedSrc,depth:0,
      asset:{src:generatedSrc,resolvedSrc:generatedSrc},
      transform:{x:50,y:50,width:'100%',opacity:1,scale:1,depth:0},
      motion:{parallax:0}
    },
    {id:'cover-title',kind:'text',role:'content',content:'THE WEDDING OF',transform:{x:50,y:layout.title,width:'72%',opacity:1},motion:{preset:'fade-in',durationMs:550}},
    {id:'cover-names',kind:'text',role:'content',content:names,transform:{x:50,y:layout.names,width:'82%',opacity:1},motion:{preset:'fade-up',durationMs:650}},
    {id:'cover-guest-label',kind:'text',role:'content',content:'Kepada Bapak/Ibu/Saudara/i',transform:{x:50,y:layout.guestLabel,width:'74%',opacity:1},motion:{preset:'fade-in',durationMs:520}},
    {id:'cover-guest',kind:'text',role:'content',content:guest,transform:{x:50,y:layout.guest,width:'72%',opacity:1},motion:{preset:'fade-up',durationMs:580}},
    {id:'cover-location',kind:'text',role:'content',content:'Di Tempat',transform:{x:50,y:layout.location,width:'58%',opacity:1},motion:{preset:'fade-in',durationMs:500}},
    {id:'cover-open',kind:'button',role:'button',content:'Buka Undangan',transform:{x:50,y:layout.cta,width:'150px',opacity:1},motion:{preset:'fade-up',durationMs:620}}
  ];
  cover.timeline=[];
  project.generator={...(project.generator||{}),mode:'auto-artwork-transform',handoff:'10.10G',generatedArtworkIsolated:true,disableEditorOverlay:true,cleanTypography:true,textlessArtwork:true,safeUILayout:layout.mode};
  project.fidelity={...(project.fidelity||{}),mode:'auto-artwork-transform',handoff:'10.10G'};
  return project;
}

function markGeneratedCover(project){
  requestAnimationFrame(()=>{
    const cover=project?.scenes?.find(scene=>scene.type==='cover')||project?.scenes?.[0];
    if(!cover?.id)return;
    const section=document.querySelector(`[data-scene-id="${CSS.escape(cover.id)}"]`);
    if(!section)return;
    section.classList.add('auto-generated-cover-handoff','auto-generated-cover-safe-ui');
    section.dataset.autoArtworkHandoff='10.10G';
    section.dataset.safeUiLayout=cover?.safeUILayout?.mode||'top-copy';
  });
}

async function updateProvider(panel){
  const status=providerStatus(),target=panel.querySelector('[data-art-provider]');
  if(!status.connected){target.textContent='Fallback only';panel.dataset.provider='fallback';return;}
  target.textContent=status.name;panel.dataset.provider='checking';
  if(typeof defaultProvider.health!=='function'){panel.dataset.provider='connected';return;}
  const health=await defaultProvider.health();
  setText(panel,'[data-art-model]',health.model||'-');
  setText(panel,'[data-art-backend]',health.revision||'-');
  if(health.generation){
    const g=health.generation;
    setText(panel,'[data-art-profile]',g.profile||g.mode||g.inputTransport||`${g.width||'-'}×${g.height||'-'}`);
  }
  if(health.reachable&&health.configured){target.textContent='Cloudflare Workers AI';panel.dataset.provider='connected';}
  else if(health.reachable){target.textContent='AI binding missing';panel.dataset.provider='warning';}
  else{target.textContent='Provider endpoint offline';panel.dataset.provider='error';}
}

async function run(panel){
  if(!sourceUrl){setState(panel,'warning','Pilih source image dulu');return;}
  const presetId=panel.querySelector('#auto-artwork-preset').value;
  const button=panel.querySelector('[data-art-run]');button.disabled=true;button.textContent='GENERATING…';
  setText(panel,'[data-art-output]','WAITING FOR AI');setText(panel,'[data-art-fallback]','-');setText(panel,'[data-art-handoff]','WAITING');setText(panel,'[data-art-safe-ui]','CALCULATING');
  setState(panel,'loading','Analyze → Master Prompt V1 → textless AI → trace → safe typography → Pixi');
  try{
    const result=await engine.run({source:sourceUrl,presetId,names:'Anif & Dini',guest:'Tamu Undangan'}),q=result.quality;
    setText(panel,'[data-art-analysis]',`${result.analysis.width}×${result.analysis.height} · horizon ${Math.round(result.analysis.horizonY*100)}%`);
    setText(panel,'[data-art-layout]',result.composition.id);
    setText(panel,'[data-art-qa]',`${q.score} · ${q.status.toUpperCase()}`);
    setText(panel,'[data-art-adapter]',result.prompt?.themeAdapter||result.transformed.prompt?.themeAdapter||'-');
    setText(panel,'[data-art-prompt]',result.prompt?.version||result.transformed.prompt?.version||MASTER_TRANSFORM_PROMPT_VERSION);
    const providerMeta=result.transformed.providerMeta||{};
    if(providerMeta.model)setText(panel,'[data-art-model]',providerMeta.model);
    if(providerMeta.revision)setText(panel,'[data-art-backend]',providerMeta.revision);
    setText(panel,'[data-art-fallback]',providerMeta.fallbackUsed?'YES':'NO');

    const trace=await outputTrace(sourceUrl,result);
    setText(panel,'[data-art-output]',trace.delta==null?trace.state:`${trace.state} · Δ ${trace.delta.toFixed(3)}`);
    panel.dataset.outputTrace=trace.state.toLowerCase().replace(/\s+/g,'-');

    const mountedProject=result.transformed.fallback?result.project:normalizeGeneratedProject(result);
    result.project=mountedProject;
    const mountedCover=mountedProject?.scenes?.find(scene=>scene.type==='cover')||mountedProject?.scenes?.[0];
    setText(panel,'[data-art-layers]',String(mountedCover?.layers?.length||0));
    setText(panel,'[data-art-handoff]',result.transformed.fallback?'FALLBACK':'CLEAN · 10.10G');
    setText(panel,'[data-art-safe-ui]',result.transformed.fallback?'-':`${mountedCover?.safeUILayout?.mode||'top-copy'} · CTA ${Math.round(mountedCover?.safeUILayout?.cta||0)}%`);

    window.weddingEditor.setProject(mountedProject);
    window.weddingEngine.mount(mountedProject);
    markGeneratedCover(mountedProject);
    window.weddingEngine.decorMotion?.schedule?.();
    window.weddingEngine.playIntro?.();

    window.weddingAutoArtworkLastRun=result;
    window.weddingAutoArtworkPrompt=result.prompt||result.transformed.prompt;
    window.weddingAutoArtworkTrace=trace;
    window.weddingAutoArtworkHandoff=STAGE_REVISION;

    panel.querySelector('[data-art-note]').textContent=result.transformed.fallback
      ?'Workers AI belum aktif; source-preserving fallback digunakan.'
      :trace.state==='SOURCE REUSED'
        ?'Provider mengembalikan source asli; safe UI tidak bisa memperbaiki output provider.'
        :`Stage #10.10G aktif: generated artwork dibuat textless, legacy UI dibersihkan, Konva overlay dimatikan, lalu typography + CTA ditempatkan dari safeTextArea (${mountedCover?.safeUILayout?.mode||'top-copy'}).`;
    setState(panel,q.ok?'ready':'warning',trace.state==='SOURCE REUSED'?'Provider output reused source':q.ok?'AI artwork mounted · safe typography clean':'Artwork candidate needs QA');
  }catch(error){
    console.error('[Auto Artwork Transform]',error);const message=error?.message||'Artwork transform failed';
    setState(panel,'error',message);setText(panel,'[data-art-output]','ERROR');setText(panel,'[data-art-handoff]','ERROR');setText(panel,'[data-art-safe-ui]','ERROR');
    panel.querySelector('[data-art-note]').textContent=message.includes('binding')||message.includes('Workers AI')
      ?`Backend #${STAGE_REVISION} memakai Cloudflare Workers AI, tetapi binding AI belum aktif.`
      :`Generative transform gagal: ${message}`;
  }finally{button.disabled=false;button.textContent='AUTO CREATE ARTWORK';await updateProvider(panel);}
}

function boot(){
  ensureStyle();if(!ready()){setTimeout(boot,80);return;}if(document.querySelector('#auto-artwork-panel')) return;
  const anchor=document.querySelector('.right-panel .property-group');if(!anchor) return;
  const panel=document.createElement('section');panel.id='auto-artwork-panel';panel.className='auto-artwork-panel';panel.dataset.state='idle';
  panel.innerHTML=`<div class="auto-art-head"><div><span>Stage #${STAGE_REVISION}</span><strong>Cloudflare Workers AI · Safe Typography</strong></div><i></i></div><label class="auto-art-file"><input id="auto-artwork-file" type="file" accept="image/*"><span data-art-file>Choose source image</span></label><label class="auto-art-label">Artwork preset<select id="auto-artwork-preset"></select></label><div class="auto-art-grid"><div><span>Provider</span><strong data-art-provider>checking…</strong></div><div><span>Model</span><strong data-art-model>-</strong></div><div><span>Studio Revision</span><strong>${STAGE_REVISION}</strong></div><div><span>Backend Revision</span><strong data-art-backend>-</strong></div><div><span>Output Trace</span><strong data-art-output>not run</strong></div><div><span>Render Handoff</span><strong data-art-handoff>not run</strong></div><div><span>Safe UI</span><strong data-art-safe-ui>not run</strong></div><div><span>Profile</span><strong data-art-profile>reference edit</strong></div><div><span>Fallback Model</span><strong data-art-fallback>-</strong></div><div><span>Prompt</span><strong data-art-prompt>${MASTER_TRANSFORM_PROMPT_VERSION}</strong></div><div><span>Theme Adapter</span><strong data-art-adapter>auto</strong></div><div><span>Analysis</span><strong data-art-analysis>not run</strong></div><div><span>Composition</span><strong data-art-layout>-</strong></div><div><span>Mounted Layers</span><strong data-art-layers>-</strong></div><div><span>Quality</span><strong data-art-qa>-</strong></div></div><button type="button" data-art-run class="auto-art-run">AUTO CREATE ARTWORK</button><div class="auto-art-status" data-art-status>Ready for source image</div><p data-art-note>Stage #10.10G memisahkan artwork dan UI: artwork generatif textless, typography DOM bersih, CTA memakai safe zone, dan editor overlay tidak menutupi cover final.</p>`;
  anchor.insertAdjacentElement('afterend',panel);
  const select=panel.querySelector('#auto-artwork-preset');Object.values(ARTWORK_PRESETS).forEach(p=>{const o=document.createElement('option');o.value=p.id;o.textContent=p.label;select.appendChild(o);});select.value='javanese-heritage';
  const fileInput=panel.querySelector('#auto-artwork-file');fileInput.addEventListener('change',()=>{const file=fileInput.files?.[0];if(!file)return;fileToUrl(file);panel.querySelector('[data-art-file]').textContent=file.name;setState(panel,'idle','Source ready · choose preset and generate');setText(panel,'[data-art-output]','SOURCE READY');setText(panel,'[data-art-handoff]','WAITING');setText(panel,'[data-art-safe-ui]','WAITING');});
  panel.querySelector('[data-art-run]').addEventListener('click',()=>run(panel));updateProvider(panel);
  window.weddingAutoArtwork={engine,provider:defaultProvider,run:options=>engine.run(options),version:ARTWORK_ENGINE_VERSION,promptVersion:MASTER_TRANSFORM_PROMPT_VERSION,stageRevision:STAGE_REVISION};
  const header=document.querySelector('.brand-wrap span');if(header) header.textContent=`Cloudflare Workers AI Safe Typography · Stage #${STAGE_REVISION}`;
  const checkpoint=document.querySelector('.checkpoint');if(checkpoint) checkpoint.textContent=`#${STAGE_REVISION} Textless AI → Safe UI → Collision Guard → Pixi`;
}

window.addEventListener('pagehide',revoke,{once:true});
boot();
console.info(`[Wedding Template Studio] Stage #${STAGE_REVISION} safe typography cleanup active.`);
