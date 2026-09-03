import { AutoArtworkTransformEngine, ARTWORK_PRESETS, ARTWORK_ENGINE_VERSION, MASTER_TRANSFORM_PROMPT_VERSION, providerStatus } from './artwork/auto-artwork-transform-engine.js';
import { installDefaultGenerativeProvider } from './artwork/providers/http-generative-provider.js';

const STAGE_REVISION='10.10N';
const PIPELINE_LABEL='REFERENCE ARCHITECTURE · SOURCE FIDELITY · NATIVE LAYERS · MOTION · REGRESSION';
const defaultProvider=installDefaultGenerativeProvider({name:'Cloudflare Workers AI Provider'});
const engine=new AutoArtworkTransformEngine();
let sourceUrl='';
let currentFileName='';
let responsiveObserver=null;

function ensureStyle(){
  if(document.querySelector('link[data-auto-artwork-style]')) return;
  const link=document.createElement('link');link.rel='stylesheet';link.href='/src/stage10-auto-artwork.css';link.dataset.autoArtworkStyle='true';document.head.appendChild(link);
}
function ready(){return window.weddingEngine&&window.weddingEditor;}
function revoke(){if(sourceUrl?.startsWith('blob:'))URL.revokeObjectURL(sourceUrl);sourceUrl='';}
function setState(panel,state,message){panel.dataset.state=state;const el=panel.querySelector('[data-art-status]');if(el)el.textContent=message;}
function setText(panel,selector,value){const el=panel.querySelector(selector);if(el)el.textContent=value??'-';}
function fileToUrl(file){revoke();sourceUrl=URL.createObjectURL(file);currentFileName=file.name;return sourceUrl;}
function clone(value){return globalThis.structuredClone?structuredClone(value):JSON.parse(JSON.stringify(value));}
function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
function round(v,d=3){const f=10**d;return Math.round(v*f)/f;}
function findText(layers,test,fallback){return layers.find(layer=>layer?.kind==='text'&&test(String(layer.content||'')))?.content||fallback;}

function readImage(src){return new Promise((resolve,reject)=>{const img=new Image();img.decoding='async';img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('Artwork image could not be decoded'));img.src=src;});}

async function analyzeStructure(src){
  const img=await readImage(src),w=64,h=96;
  const c=document.createElement('canvas');c.width=w;c.height=h;
  const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,w,h);
  const data=ctx.getImageData(0,0,w,h).data,lum=new Float32Array(w*h),row=new Float32Array(h),col=new Float32Array(w);
  let mean=0,edgeTotal=0,cx=0,cy=0,mass=0;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,l=(.2126*data[i]+.7152*data[i+1]+.0722*data[i+2])/255;lum[y*w+x]=l;mean+=l;}
  mean/=w*h;
  for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){
    const i=y*w+x,gx=Math.abs(lum[i+1]-lum[i-1]),gy=Math.abs(lum[i+w]-lum[i-w]),e=clamp((gx+gy)*1.6,0,1);
    row[y]+=e;col[x]+=e;edgeTotal+=e;cx+=x*e;cy+=y*e;mass+=e;
  }
  const normalize=a=>{const max=Math.max(...a,1e-6);return Array.from(a,v=>v/max);};
  let horizon=0,best=0;for(let y=Math.floor(h*.28);y<Math.floor(h*.82);y++){if(row[y]>best){best=row[y];horizon=y;}}
  return {width:img.naturalWidth,height:img.naturalHeight,mean:round(mean),edge:round(edgeTotal/((w-2)*(h-2))),row:normalize(row),col:normalize(col),center:{x:round(mass?cx/mass/w:.5),y:round(mass?cy/mass/h:.5)},horizon:round(horizon/h)};
}

function profileSimilarity(a=[],b=[]){
  const n=Math.min(a.length,b.length);if(!n)return 0;
  let diff=0;for(let i=0;i<n;i++)diff+=Math.abs(Number(a[i]||0)-Number(b[i]||0));
  return clamp(1-diff/n,0,1);
}
function compareStructure(source,output){
  if(!source||!output)return {score:0,row:0,col:0,center:0,horizon:0,styleDelta:0};
  const row=profileSimilarity(source.row,output.row),col=profileSimilarity(source.col,output.col);
  const centerDist=Math.hypot(source.center.x-output.center.x,source.center.y-output.center.y);
  const center=clamp(1-centerDist/.55,0,1),horizon=clamp(1-Math.abs(source.horizon-output.horizon)/.38,0,1);
  const score=clamp(row*.30+col*.30+center*.24+horizon*.16,0,1);
  const styleDelta=Math.abs(source.mean-output.mean)+Math.abs(source.edge-output.edge);
  return {score:round(score),row:round(row),col:round(col),center:round(center),horizon:round(horizon),styleDelta:round(styleDelta)};
}

function referenceLayout(){
  return {mode:'reference-cover',title:19,names:26,guestLabel:39,guest:44,location:48,cta:56};
}

function normalizeReferenceProject(result,generatedSrc,fidelity){
  const project=clone(result.project||{});
  const cover=project?.scenes?.find(scene=>scene.type==='cover')||project?.scenes?.[0];
  if(!cover)return project;
  const oldLayers=Array.isArray(cover.layers)?cover.layers:[];
  const names=findText(oldLayers,v=>v.includes('&'),'Anif & Dini');
  const guest=findText(oldLayers,v=>/tamu undangan/i.test(v),'Tamu Undangan');
  const layout=referenceLayout();

  cover.background=null;cover.atmosphere={effects:[]};cover.disableEditorOverlay=true;
  cover.renderHandoff=STAGE_REVISION;
  cover.referenceArchitecture={version:'ARTWORK-PLATE-HTML-UI-V1',artworkPlate:true,generatedDecor:false,textInArtwork:false,nativeTypography:true,nativeCTA:true,openingMotion:true};
  cover.sourceFidelity=fidelity;
  cover.safeUILayout=layout;
  cover.fidelity={...(cover.fidelity||{}),system:'auto-artwork-transform',handoff:`reference-architecture-${STAGE_REVISION}`};
  cover.layers=[
    {id:'ai-transformed-base',kind:'image',role:'background',src:generatedSrc,depth:0,asset:{src:generatedSrc,resolvedSrc:generatedSrc},transform:{x:50,y:50,width:'100%',opacity:1,scale:1,depth:0},motion:{parallax:0}},
    {id:'cover-title',kind:'text',role:'content',content:'THE WEDDING OF',transform:{x:50,y:layout.title,width:'72%',opacity:1},motion:{preset:'fade-in',durationMs:650}},
    {id:'cover-names',kind:'text',role:'content',content:names,transform:{x:50,y:layout.names,width:'82%',opacity:1},motion:{preset:'fade-up',durationMs:800}},
    {id:'cover-guest-label',kind:'text',role:'content',content:'Kepada Bapak/Ibu/Saudara/i',transform:{x:50,y:layout.guestLabel,width:'74%',opacity:1},motion:{preset:'fade-in',durationMs:620}},
    {id:'cover-guest',kind:'text',role:'content',content:guest,transform:{x:50,y:layout.guest,width:'72%',opacity:1},motion:{preset:'fade-up',durationMs:720}},
    {id:'cover-location',kind:'text',role:'content',content:'Di Tempat',transform:{x:50,y:layout.location,width:'58%',opacity:1},motion:{preset:'fade-in',durationMs:600}},
    {id:'cover-open',kind:'button',role:'button',content:'Buka Undangan',transform:{x:50,y:layout.cta,width:'150px',opacity:1},motion:{preset:'zoom-in',durationMs:760}}
  ];
  cover.timeline=[];
  project.generator={...(project.generator||{}),mode:'auto-artwork-transform',handoff:STAGE_REVISION,referenceArchitecture:true,sourceFidelityLock:true,generatedDecor:false,nativeLayers:true,textlessArtwork:true,disableEditorOverlay:true,openingMotion:true,finalRegression:true};
  project.fidelity={...(project.fidelity||{}),mode:'auto-artwork-transform',handoff:STAGE_REVISION,referenceArchitecture:true};
  return project;
}

function finalRegression(result,trace,fidelity){
  let score=100;const issues=[];
  if(trace.state==='SOURCE REUSED'){score-=45;issues.push('source-reused');}
  if(fidelity.score<.72){score-=28;issues.push('structure-drift');}
  else if(fidelity.score<.80){score-=12;issues.push('structure-warning');}
  if(fidelity.center<.72){score-=10;issues.push('subject-shift');}
  if(fidelity.horizon<.70){score-=10;issues.push('horizon-shift');}
  if(fidelity.styleDelta<.025){score-=12;issues.push('style-too-weak');}
  if(!result?.quality?.ok){score-=8;issues.push('engine-qa');}
  score=clamp(score,0,100);
  return {score,status:score>=88?'locked':score>=74?'pass-with-warning':'review',ok:score>=74,issues};
}

function installCoverOpening(project){
  requestAnimationFrame(()=>{
    const cover=project?.scenes?.find(s=>s.type==='cover')||project?.scenes?.[0];if(!cover?.id)return;
    const section=document.querySelector(`[data-scene-id="${CSS.escape(cover.id)}"]`);if(!section)return;
    const button=section.querySelector('[data-layer-id="cover-open"] .engine-button');if(!button)return;
    button.onclick=async()=>{
      if(section.dataset.opening==='true')return;section.dataset.opening='true';
      try{document.querySelector('#song')?.play?.().catch?.(()=>{});}catch{}
      window.dispatchEvent(new CustomEvent('wedding:cover-open',{detail:{sceneId:cover.id,revision:STAGE_REVISION}}));
      const animation=section.animate([{opacity:1,transform:'translateY(0)'},{opacity:.94,offset:.28},{opacity:0,transform:'translateY(-100%)'}],{duration:1500,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'});
      try{await animation.finished;}catch{}
      section.style.visibility='hidden';section.style.pointerEvents='none';
    };
  });
}

function installResponsiveGuard(project){
  responsiveObserver?.disconnect?.();responsiveObserver=null;
  requestAnimationFrame(()=>{
    const cover=project?.scenes?.find(s=>s.type==='cover')||project?.scenes?.[0];if(!cover?.id)return;
    const section=document.querySelector(`[data-scene-id="${CSS.escape(cover.id)}"]`);if(!section)return;
    const sync=()=>{const w=section.clientWidth,h=section.clientHeight;section.dataset.autoResponsive=w<340?'compact':w/h>1.05?'landscape':'portrait';};
    sync();responsiveObserver=new ResizeObserver(sync);responsiveObserver.observe(section);
  });
}

function markReferenceCover(project,regression){
  requestAnimationFrame(()=>{
    const cover=project?.scenes?.find(s=>s.type==='cover')||project?.scenes?.[0];if(!cover?.id)return;
    const section=document.querySelector(`[data-scene-id="${CSS.escape(cover.id)}"]`);if(!section)return;
    section.classList.add('auto-generated-cover-handoff','auto-reference-architecture-cover');
    section.dataset.autoArtworkHandoff=STAGE_REVISION;section.dataset.referenceRegression=regression.status;
  });
}

async function outputTrace(source,result){
  const output=result?.transformed?.compositeSrc||result?.transformed?.layers?.[0]?.src||'';
  if(!output)return {state:'NO OUTPUT'};if(output===source)return {state:'SOURCE REUSED'};
  return {state:'GENERATED / CHANGED'};
}

async function updateProvider(panel){
  const status=providerStatus(),target=panel.querySelector('[data-art-provider]');
  if(!status.connected){target.textContent='Fallback only';panel.dataset.provider='fallback';return;}
  target.textContent=status.name;panel.dataset.provider='checking';
  if(typeof defaultProvider.health!=='function'){panel.dataset.provider='connected';return;}
  const health=await defaultProvider.health();setText(panel,'[data-art-model]',health.model||'-');setText(panel,'[data-art-backend]',health.revision||'-');
  if(health.generation)setText(panel,'[data-art-profile]',`${health.generation.inputTransport||'reference'} · G ${health.generation.guidance??'-'}`);
  panel.dataset.provider=health.reachable&&health.configured?'connected':health.reachable?'warning':'error';
  target.textContent=health.reachable&&health.configured?'Cloudflare Workers AI':health.reachable?'AI binding missing':'Provider endpoint offline';
}

async function run(panel){
  if(!sourceUrl){setState(panel,'warning','Pilih source image dulu');return;}
  const presetId=panel.querySelector('#auto-artwork-preset').value,button=panel.querySelector('[data-art-run]');button.disabled=true;button.textContent='GENERATING…';
  ['[data-art-output]','[data-art-handoff]','[data-art-fidelity]','[data-art-final-qa]'].forEach(s=>setText(panel,s,'WAITING'));
  setState(panel,'loading','Reference analyze → artwork-only transform → source fidelity check → native layers → opening motion → regression');
  try{
    const sourceStructure=await analyzeStructure(sourceUrl);
    const result=await engine.run({source:sourceUrl,presetId,names:'Anif & Dini',guest:'Tamu Undangan'});
    const generatedSrc=result?.transformed?.compositeSrc||result?.transformed?.layers?.find(l=>l?.src)?.src||'';
    if(!generatedSrc)throw new Error('Provider tidak mengembalikan artwork');
    const outputStructure=await analyzeStructure(generatedSrc),fidelity=compareStructure(sourceStructure,outputStructure),trace=await outputTrace(sourceUrl,result);
    const mountedProject=result.transformed.fallback?result.project:normalizeReferenceProject(result,generatedSrc,fidelity);
    const regression=finalRegression(result,trace,fidelity),cover=mountedProject?.scenes?.find(s=>s.type==='cover')||mountedProject?.scenes?.[0];
    if(cover)cover.finalReferenceRegression=regression;if(mountedProject.generator)mountedProject.generator.finalReferenceRegression=regression;
    result.project=mountedProject;

    setText(panel,'[data-art-analysis]',`${result.analysis.width}×${result.analysis.height} · H ${Math.round(result.analysis.horizonY*100)}%`);
    setText(panel,'[data-art-layout]','ARTWORK PLATE + NATIVE UI');setText(panel,'[data-art-qa]',`${result.quality.score} · ${result.quality.status.toUpperCase()}`);
    setText(panel,'[data-art-adapter]',result.prompt?.themeAdapter||result.transformed.prompt?.themeAdapter||'-');
    setText(panel,'[data-art-prompt]',result.prompt?.version||MASTER_TRANSFORM_PROMPT_VERSION);
    const meta=result.transformed.providerMeta||{};if(meta.model)setText(panel,'[data-art-model]',meta.model);if(meta.revision)setText(panel,'[data-art-backend]',meta.revision);setText(panel,'[data-art-fallback]',meta.fallbackUsed?'YES':'NO');
    setText(panel,'[data-art-output]',trace.state);setText(panel,'[data-art-handoff]',result.transformed.fallback?'FALLBACK':`REFERENCE · ${STAGE_REVISION}`);
    setText(panel,'[data-art-fidelity]',`S ${fidelity.score} · C ${fidelity.center} · H ${fidelity.horizon}`);setText(panel,'[data-art-style-delta]',String(fidelity.styleDelta));
    setText(panel,'[data-art-layers]',String(cover?.layers?.length||0));setText(panel,'[data-art-final-qa]',`${regression.score} · ${regression.status.toUpperCase()}`);

    window.weddingEditor.setProject(mountedProject);window.weddingEngine.mount(mountedProject);markReferenceCover(mountedProject,regression);installResponsiveGuard(mountedProject);installCoverOpening(mountedProject);window.weddingEngine.playIntro?.();
    window.weddingAutoArtworkLastRun=result;window.weddingAutoArtworkFidelity=fidelity;window.weddingAutoArtworkFinalQA=regression;window.weddingAutoArtworkHandoff=STAGE_REVISION;
    panel.querySelector('[data-art-note]').textContent=`#10.10J–N aktif: AI hanya mengubah gaya artwork; komposisi source dikunci. Native text/CTA terpisah, generated decor OFF, opening motion 1500ms, regression ${regression.score}/100.`;
    setState(panel,regression.status==='locked'?'ready':'warning',regression.status==='locked'?'REFERENCE PIPELINE LOCKED · siap dilihat':`Regression ${regression.score}/100 · ${regression.issues.join(', ')||'warning'}`);
  }catch(error){console.error('[Auto Artwork Transform]',error);const message=error?.message||'Artwork transform failed';setState(panel,'error',message);['[data-art-output]','[data-art-handoff]','[data-art-fidelity]','[data-art-final-qa]'].forEach(s=>setText(panel,s,'ERROR'));panel.querySelector('[data-art-note]').textContent=message;}
  finally{button.disabled=false;button.textContent='AUTO CREATE ARTWORK';await updateProvider(panel);}
}

function boot(){
  ensureStyle();if(!ready()){setTimeout(boot,80);return;}if(document.querySelector('#auto-artwork-panel'))return;
  const anchor=document.querySelector('.right-panel .property-group');if(!anchor)return;
  const panel=document.createElement('section');panel.id='auto-artwork-panel';panel.className='auto-artwork-panel';panel.dataset.state='idle';
  panel.innerHTML=`<div class="auto-art-head"><div><span>Stage #${STAGE_REVISION}</span><strong>Reference Architecture Recovery</strong></div><i></i></div><label class="auto-art-file"><input id="auto-artwork-file" type="file" accept="image/*"><span data-art-file>Choose source image</span></label><label class="auto-art-label">Artwork preset<select id="auto-artwork-preset"></select></label><div class="auto-art-grid"><div><span>Provider</span><strong data-art-provider>checking…</strong></div><div><span>Model</span><strong data-art-model>-</strong></div><div><span>Studio Revision</span><strong>${STAGE_REVISION}</strong></div><div><span>Backend Revision</span><strong data-art-backend>-</strong></div><div><span>Output Trace</span><strong data-art-output>not run</strong></div><div><span>Render Handoff</span><strong data-art-handoff>not run</strong></div><div><span>Source Fidelity</span><strong data-art-fidelity>not run</strong></div><div><span>Style Delta</span><strong data-art-style-delta>not run</strong></div><div><span>Reference Layout</span><strong data-art-layout>not run</strong></div><div><span>Final Regression</span><strong data-art-final-qa>not run</strong></div><div><span>Profile</span><strong data-art-profile>reference edit</strong></div><div><span>Fallback</span><strong data-art-fallback>-</strong></div><div><span>Prompt</span><strong data-art-prompt>${MASTER_TRANSFORM_PROMPT_VERSION}</strong></div><div><span>Theme Adapter</span><strong data-art-adapter>auto</strong></div><div><span>Source Analysis</span><strong data-art-analysis>not run</strong></div><div><span>Mounted Layers</span><strong data-art-layers>-</strong></div><div><span>Engine Quality</span><strong data-art-qa>-</strong></div></div><button type="button" data-art-run class="auto-art-run">AUTO CREATE ARTWORK</button><div class="auto-art-status" data-art-status>Ready · source fidelity pipeline</div><p data-art-note>${PIPELINE_LABEL}. AI tidak boleh membuat frame/dekor/komposisi baru.</p>`;
  anchor.insertAdjacentElement('afterend',panel);
  const select=panel.querySelector('#auto-artwork-preset');Object.values(ARTWORK_PRESETS).forEach(p=>{const o=document.createElement('option');o.value=p.id;o.textContent=p.label;select.appendChild(o);});select.value='javanese-heritage';
  const input=panel.querySelector('#auto-artwork-file');input.addEventListener('change',()=>{const file=input.files?.[0];if(!file)return;fileToUrl(file);panel.querySelector('[data-art-file]').textContent=file.name;setState(panel,'idle','Source ready · fidelity lock armed');});
  panel.querySelector('[data-art-run]').addEventListener('click',()=>run(panel));updateProvider(panel);
  window.weddingAutoArtwork={engine,provider:defaultProvider,run:options=>engine.run(options),version:ARTWORK_ENGINE_VERSION,promptVersion:MASTER_TRANSFORM_PROMPT_VERSION,stageRevision:STAGE_REVISION,referenceArchitecture:true};
  const header=document.querySelector('.brand-wrap span');if(header)header.textContent=`Reference Architecture · Stage #${STAGE_REVISION}`;
  const checkpoint=document.querySelector('.checkpoint');if(checkpoint)checkpoint.textContent=`#${STAGE_REVISION} Source Fidelity · Native Layers · Motion · Final Regression`;
}

window.addEventListener('pagehide',()=>{responsiveObserver?.disconnect?.();revoke();},{once:true});
boot();
console.info(`[Wedding Template Studio] ${PIPELINE_LABEL} · Stage #${STAGE_REVISION}.`);
