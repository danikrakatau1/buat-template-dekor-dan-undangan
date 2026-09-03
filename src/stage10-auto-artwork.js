import { AutoArtworkTransformEngine, ARTWORK_PRESETS, ARTWORK_ENGINE_VERSION, MASTER_TRANSFORM_PROMPT_VERSION, providerStatus } from './artwork/auto-artwork-transform-engine.js';
import { installDefaultGenerativeProvider } from './artwork/providers/http-generative-provider.js';

const STAGE_REVISION='10.10I';
const STABLE_LABEL='AUTO ARTWORK TRANSFORM V1 STABLE';
const defaultProvider=installDefaultGenerativeProvider({name:'Cloudflare Workers AI Provider'});
const engine=new AutoArtworkTransformEngine();
let sourceUrl='';
let currentFileName='';
let responsiveObserver=null;

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
function round(value,digits=3){const f=10**digits;return Math.round(value*f)/f;}

function readImage(src){
  return new Promise((resolve,reject)=>{
    const img=new Image();img.decoding='async';
    img.onload=()=>resolve(img);
    img.onerror=()=>reject(new Error('Generated artwork could not be decoded for layout analysis'));
    img.src=src;
  });
}

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

async function analyzeGeneratedArtwork(src,sourceAnalysis={}){
  const img=await readImage(src);
  const width=96,height=160;
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,width,height);
  const data=ctx.getImageData(0,0,width,height).data;
  const lum=new Float32Array(width*height);
  const density=new Float32Array(width*height);
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const i=(y*width+x)*4;
    lum[y*width+x]=(.2126*data[i]+.7152*data[i+1]+.0722*data[i+2])/255;
  }
  let total=0;
  for(let y=1;y<height-1;y++)for(let x=1;x<width-1;x++){
    const i=y*width+x;
    const gx=Math.abs(lum[i+1]-lum[i-1]);
    const gy=Math.abs(lum[i+width]-lum[i-width]);
    const edge=Math.min(1,(gx+gy)*1.9);
    const ink=Math.abs(lum[i]-.84);
    const value=clamp(edge*.68+ink*.32,0,1);
    density[i]=value;total+=value;
  }
  const scoreRect=(x0,y0,x1,y1)=>{
    const xa=Math.floor(clamp(x0,0,1)*width),xb=Math.ceil(clamp(x1,0,1)*width);
    const ya=Math.floor(clamp(y0,0,1)*height),yb=Math.ceil(clamp(y1,0,1)*height);
    let sum=0,count=0;
    for(let y=ya;y<yb;y++)for(let x=xa;x<xb;x++){sum+=density[y*width+x];count++;}
    return count?sum/count:1;
  };
  const sourceSafe=sourceAnalysis?.safeTextArea||{x:.16,y:.12,w:.68,h:.36};
  const sourceCenter=(sourceSafe.y||.12)+(sourceSafe.h||.36)/2;
  const layouts=[
    {mode:'top-copy',range:[.10,.45],anchor:.275},
    {mode:'center-copy',range:[.27,.63],anchor:.45},
    {mode:'bottom-copy',range:[.50,.86],anchor:.68}
  ].map(item=>{
    const raw=scoreRect(.17,item.range[0],.83,item.range[1]);
    const bias=Math.abs(item.anchor-sourceCenter)*.035;
    return {...item,score:raw+bias,rawScore:raw};
  }).sort((a,b)=>a.score-b.score);

  const best=layouts[0],second=layouts[1];
  const blockRange=best.range;
  const ctaCandidates=[.46,.52,.58,.64,.70,.76,.82].map(y=>{
    const raw=scoreRect(.31,y-.035,.69,y+.035);
    const insideBlock=y>blockRange[0]-.035&&y<blockRange[1]+.035;
    const edgePenalty=(y<.45||y>.84)?.08:0;
    return {y,rawScore:raw,score:raw+(insideBlock?.22:0)+edgePenalty};
  }).sort((a,b)=>a.score-b.score);
  const cta=ctaCandidates[0];
  const confidence=clamp((second.score-best.score)*5+.45,0,1);
  return {
    width:img.naturalWidth,height:img.naturalHeight,
    overallDensity:round(total/Math.max(1,(width-2)*(height-2))),
    mode:best.mode,blockScore:round(best.rawScore),ctaY:Math.round(cta.y*100),ctaScore:round(cta.rawScore),
    confidence:round(confidence),candidates:layouts.map(v=>({mode:v.mode,score:round(v.rawScore)}))
  };
}

function resolveOutputAwareLayout(result,outputAnalysis){
  const source=result?.analysis||{};
  const safe=result?.composition?.safeTextArea||source.safeTextArea||{x:.16,y:.12,w:.68,h:.36};
  const mode=outputAnalysis?.mode||'top-copy';
  const presets={
    'top-copy':{title:15,names:22,guestLabel:32,guest:36,location:40},
    'center-copy':{title:29,names:36,guestLabel:46,guest:50,location:54},
    'bottom-copy':{title:54,names:61,guestLabel:71,guest:75,location:79}
  };
  const base={...(presets[mode]||presets['top-copy'])};
  const textMin=base.title-3,textMax=base.location+3;
  let cta=clamp(Number(outputAnalysis?.ctaY??58),44,84);
  if(cta>textMin-3&&cta<textMax+5){
    const above=clamp(textMin-7,44,84),below=clamp(textMax+8,44,84);
    cta=Math.abs(cta-above)<Math.abs(cta-below)?above:below;
  }
  const spacing={namesTitle:base.names-base.title,guestNames:base.guestLabel-base.names,guestLine:base.guest-base.guestLabel,locationGuest:base.location-base.guest,ctaNearest:Math.min(Math.abs(cta-base.title),Math.abs(cta-base.names),Math.abs(cta-base.guestLabel),Math.abs(cta-base.guest),Math.abs(cta-base.location))};
  return {...base,mode,cta,safe,subjectX:Number(source?.subjectCenter?.x??.5),subjectY:Number(source?.subjectCenter?.y??.55),outputAnalysis,spacing};
}

function normalizeGeneratedProject(result,outputAnalysis){
  if(result?.transformed?.fallback) return result.project;
  const generatedSrc=result?.transformed?.compositeSrc||result?.transformed?.layers?.find(layer=>layer?.src)?.src||'';
  if(!generatedSrc) return result.project;
  const project=clone(result.project||{});
  const cover=project?.scenes?.find(scene=>scene.type==='cover')||project?.scenes?.[0];
  if(!cover) return project;
  const oldLayers=Array.isArray(cover.layers)?cover.layers:[];
  const names=findText(oldLayers,value=>value.includes('&'),'Anif & Dini');
  const guest=findText(oldLayers,value=>/tamu undangan/i.test(value),'Tamu Undangan');
  const layout=resolveOutputAwareLayout(result,outputAnalysis);

  cover.background=null;
  cover.atmosphere={effects:[]};
  cover.disableEditorOverlay=true;
  cover.fidelity={...(cover.fidelity||{}),system:'auto-artwork-transform',handoff:'generated-output-aware-10.10I'};
  cover.renderHandoff='10.10I';
  cover.safeUILayout={...layout,safeTextArea:layout.safe};
  cover.outputArtworkAnalysis=outputAnalysis;
  cover.layers=[
    {id:'ai-transformed-base',kind:'image',role:'background',src:generatedSrc,depth:0,asset:{src:generatedSrc,resolvedSrc:generatedSrc},transform:{x:50,y:50,width:'100%',opacity:1,scale:1,depth:0},motion:{parallax:0}},
    {id:'cover-title',kind:'text',role:'content',content:'THE WEDDING OF',transform:{x:50,y:layout.title,width:'72%',opacity:1},motion:{preset:'fade-in',durationMs:500}},
    {id:'cover-names',kind:'text',role:'content',content:names,transform:{x:50,y:layout.names,width:'82%',opacity:1},motion:{preset:'fade-up',durationMs:600}},
    {id:'cover-guest-label',kind:'text',role:'content',content:'Kepada Bapak/Ibu/Saudara/i',transform:{x:50,y:layout.guestLabel,width:'74%',opacity:1},motion:{preset:'fade-in',durationMs:480}},
    {id:'cover-guest',kind:'text',role:'content',content:guest,transform:{x:50,y:layout.guest,width:'72%',opacity:1},motion:{preset:'fade-up',durationMs:540}},
    {id:'cover-location',kind:'text',role:'content',content:'Di Tempat',transform:{x:50,y:layout.location,width:'58%',opacity:1},motion:{preset:'fade-in',durationMs:460}},
    {id:'cover-open',kind:'button',role:'button',content:'Buka Undangan',transform:{x:50,y:layout.cta,width:'150px',opacity:1},motion:{preset:'fade-up',durationMs:580}}
  ];
  cover.timeline=[];
  project.generator={...(project.generator||{}),mode:'auto-artwork-transform',handoff:'10.10I',generatedArtworkIsolated:true,disableEditorOverlay:true,cleanTypography:true,textlessArtwork:true,outputAwareLayout:true,stableV1:true,safeUILayout:layout.mode};
  project.fidelity={...(project.fidelity||{}),mode:'auto-artwork-transform',handoff:'10.10I',stableV1:true};
  return project;
}

function finalLayoutQA(result,trace,cover){
  const layout=cover?.safeUILayout||{};
  const output=cover?.outputArtworkAnalysis||{};
  let score=100;
  const issues=[];
  const spacing=layout.spacing||{};
  if(trace.state==='SOURCE REUSED'){score-=60;issues.push('source-reused');}
  if(trace.state==='SUSPICIOUSLY SIMILAR'){score-=15;issues.push('low-transform-delta');}
  if(Number(output.ctaScore??1)>.42){score-=12;issues.push('cta-high-density');}
  if(Number(output.blockScore??1)>.43){score-=10;issues.push('copy-high-density');}
  if(Number(output.confidence??0)<.4){score-=6;issues.push('layout-low-confidence');}
  if(Number(spacing.namesTitle??0)<6){score-=8;issues.push('title-spacing');}
  if(Number(spacing.guestNames??0)<8){score-=8;issues.push('guest-spacing');}
  if(Number(spacing.ctaNearest??0)<6){score-=12;issues.push('cta-collision');}
  if(!result?.quality?.ok){score-=10;issues.push('engine-qa');}
  score=clamp(score,0,100);
  return {score,status:score>=88?'stable':score>=74?'pass-with-warning':'review',issues,ok:score>=74};
}

function installResponsiveGuard(project){
  responsiveObserver?.disconnect?.();responsiveObserver=null;
  requestAnimationFrame(()=>{
    const cover=project?.scenes?.find(scene=>scene.type==='cover')||project?.scenes?.[0];
    if(!cover?.id)return;
    const section=document.querySelector(`[data-scene-id="${CSS.escape(cover.id)}"]`);
    if(!section)return;
    const sync=()=>{
      const w=Math.max(1,section.clientWidth),h=Math.max(1,section.clientHeight),aspect=w/h;
      const mode=w<340?'compact':aspect>1.05?'landscape':'portrait';
      section.dataset.autoResponsive=mode;
      section.dataset.safeUiLayout=cover?.safeUILayout?.mode||'top-copy';
      section.style.setProperty('--auto-copy-scale',mode==='compact'?'.88':mode==='landscape'?'.82':'1');
    };
    sync();responsiveObserver=new ResizeObserver(sync);responsiveObserver.observe(section);
  });
}

function markGeneratedCover(project){
  requestAnimationFrame(()=>{
    const cover=project?.scenes?.find(scene=>scene.type==='cover')||project?.scenes?.[0];
    if(!cover?.id)return;
    const section=document.querySelector(`[data-scene-id="${CSS.escape(cover.id)}"]`);
    if(!section)return;
    section.classList.add('auto-generated-cover-handoff','auto-generated-cover-safe-ui','auto-generated-cover-output-aware');
    section.dataset.autoArtworkHandoff=STAGE_REVISION;
    section.dataset.safeUiLayout=cover?.safeUILayout?.mode||'top-copy';
    section.dataset.finalQa=cover?.finalLayoutQA?.status||'pending';
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
  if(health.generation){const g=health.generation;setText(panel,'[data-art-profile]',g.profile||g.mode||g.inputTransport||`${g.width||'-'}×${g.height||'-'}`);}
  if(health.reachable&&health.configured){target.textContent='Cloudflare Workers AI';panel.dataset.provider='connected';}
  else if(health.reachable){target.textContent='AI binding missing';panel.dataset.provider='warning';}
  else{target.textContent='Provider endpoint offline';panel.dataset.provider='error';}
}

async function run(panel){
  if(!sourceUrl){setState(panel,'warning','Pilih source image dulu');return;}
  const presetId=panel.querySelector('#auto-artwork-preset').value;
  const button=panel.querySelector('[data-art-run]');button.disabled=true;button.textContent='GENERATING…';
  ['[data-art-output]','[data-art-handoff]','[data-art-layout-ai]','[data-art-final-qa]'].forEach(selector=>setText(panel,selector,'WAITING'));
  setState(panel,'loading','Source analyze → textless AI → output analyze → layout intelligence → final QA → Pixi');
  try{
    const result=await engine.run({source:sourceUrl,presetId,names:'Anif & Dini',guest:'Tamu Undangan'});
    setText(panel,'[data-art-analysis]',`${result.analysis.width}×${result.analysis.height} · horizon ${Math.round(result.analysis.horizonY*100)}%`);
    setText(panel,'[data-art-layout]',result.composition.id);
    setText(panel,'[data-art-qa]',`${result.quality.score} · ${result.quality.status.toUpperCase()}`);
    setText(panel,'[data-art-adapter]',result.prompt?.themeAdapter||result.transformed.prompt?.themeAdapter||'-');
    setText(panel,'[data-art-prompt]',result.prompt?.version||result.transformed.prompt?.version||MASTER_TRANSFORM_PROMPT_VERSION);
    const providerMeta=result.transformed.providerMeta||{};
    if(providerMeta.model)setText(panel,'[data-art-model]',providerMeta.model);
    if(providerMeta.revision)setText(panel,'[data-art-backend]',providerMeta.revision);
    setText(panel,'[data-art-fallback]',providerMeta.fallbackUsed?'YES':'NO');

    const trace=await outputTrace(sourceUrl,result);
    setText(panel,'[data-art-output]',trace.delta==null?trace.state:`${trace.state} · Δ ${trace.delta.toFixed(3)}`);
    panel.dataset.outputTrace=trace.state.toLowerCase().replace(/\s+/g,'-');

    let outputAnalysis=null;
    if(!result.transformed.fallback){
      const generatedSrc=result?.transformed?.compositeSrc||result?.transformed?.layers?.find(layer=>layer?.src)?.src||'';
      outputAnalysis=await analyzeGeneratedArtwork(generatedSrc,result.analysis);
    }
    const mountedProject=result.transformed.fallback?result.project:normalizeGeneratedProject(result,outputAnalysis);
    result.project=mountedProject;
    const mountedCover=mountedProject?.scenes?.find(scene=>scene.type==='cover')||mountedProject?.scenes?.[0];
    const finalQA=finalLayoutQA(result,trace,mountedCover);
    if(mountedCover)mountedCover.finalLayoutQA=finalQA;
    if(mountedProject.generator)mountedProject.generator.finalLayoutQA=finalQA;

    setText(panel,'[data-art-layers]',String(mountedCover?.layers?.length||0));
    setText(panel,'[data-art-handoff]',result.transformed.fallback?'FALLBACK':'OUTPUT-AWARE · 10.10I');
    setText(panel,'[data-art-layout-ai]',result.transformed.fallback?'-':`${outputAnalysis.mode} · CTA ${outputAnalysis.ctaY}% · C ${outputAnalysis.confidence}`);
    setText(panel,'[data-art-density]',result.transformed.fallback?'-':`copy ${outputAnalysis.blockScore} · CTA ${outputAnalysis.ctaScore}`);
    setText(panel,'[data-art-final-qa]',`${finalQA.score} · ${finalQA.status.toUpperCase()}`);

    window.weddingEditor.setProject(mountedProject);
    window.weddingEngine.mount(mountedProject);
    markGeneratedCover(mountedProject);
    installResponsiveGuard(mountedProject);
    window.weddingEngine.decorMotion?.schedule?.();
    window.weddingEngine.playIntro?.();

    window.weddingAutoArtworkLastRun=result;
    window.weddingAutoArtworkOutputAnalysis=outputAnalysis;
    window.weddingAutoArtworkFinalQA=finalQA;
    window.weddingAutoArtworkPrompt=result.prompt||result.transformed.prompt;
    window.weddingAutoArtworkTrace=trace;
    window.weddingAutoArtworkHandoff=STAGE_REVISION;

    panel.querySelector('[data-art-note]').textContent=result.transformed.fallback
      ?'Workers AI belum aktif; source-preserving fallback digunakan.'
      :`${STABLE_LABEL}: output AI dianalisis ulang, copy memilih ${outputAnalysis.mode}, CTA dipindah ke lane ber-density ${outputAnalysis.ctaScore}, responsive guard aktif, final QA ${finalQA.score}/100.`;
    const state=finalQA.status==='stable'?'ready':finalQA.ok?'warning':'warning';
    setState(panel,state,finalQA.status==='stable'?'Auto Artwork Transform V1 stable · output-aware layout ready':`Final QA ${finalQA.score}/100 · ${finalQA.issues.join(', ')||'review'}`);
  }catch(error){
    console.error('[Auto Artwork Transform]',error);const message=error?.message||'Artwork transform failed';
    setState(panel,'error',message);['[data-art-output]','[data-art-handoff]','[data-art-layout-ai]','[data-art-final-qa]'].forEach(selector=>setText(panel,selector,'ERROR'));
    panel.querySelector('[data-art-note]').textContent=message.includes('binding')||message.includes('Workers AI')?`Backend #${STAGE_REVISION} memakai Cloudflare Workers AI, tetapi binding AI belum aktif.`:`Generative transform gagal: ${message}`;
  }finally{button.disabled=false;button.textContent='AUTO CREATE ARTWORK';await updateProvider(panel);}
}

function boot(){
  ensureStyle();if(!ready()){setTimeout(boot,80);return;}if(document.querySelector('#auto-artwork-panel')) return;
  const anchor=document.querySelector('.right-panel .property-group');if(!anchor) return;
  const panel=document.createElement('section');panel.id='auto-artwork-panel';panel.className='auto-artwork-panel';panel.dataset.state='idle';
  panel.innerHTML=`<div class="auto-art-head"><div><span>Stage #${STAGE_REVISION}</span><strong>Auto Artwork Transform V1 · Stable</strong></div><i></i></div><label class="auto-art-file"><input id="auto-artwork-file" type="file" accept="image/*"><span data-art-file>Choose source image</span></label><label class="auto-art-label">Artwork preset<select id="auto-artwork-preset"></select></label><div class="auto-art-grid"><div><span>Provider</span><strong data-art-provider>checking…</strong></div><div><span>Model</span><strong data-art-model>-</strong></div><div><span>Studio Revision</span><strong>${STAGE_REVISION}</strong></div><div><span>Backend Revision</span><strong data-art-backend>-</strong></div><div><span>Output Trace</span><strong data-art-output>not run</strong></div><div><span>Render Handoff</span><strong data-art-handoff>not run</strong></div><div><span>Output Layout</span><strong data-art-layout-ai>not run</strong></div><div><span>Density</span><strong data-art-density>not run</strong></div><div><span>Final QA</span><strong data-art-final-qa>not run</strong></div><div><span>Profile</span><strong data-art-profile>reference edit</strong></div><div><span>Fallback Model</span><strong data-art-fallback>-</strong></div><div><span>Prompt</span><strong data-art-prompt>${MASTER_TRANSFORM_PROMPT_VERSION}</strong></div><div><span>Theme Adapter</span><strong data-art-adapter>auto</strong></div><div><span>Source Analysis</span><strong data-art-analysis>not run</strong></div><div><span>Source Composition</span><strong data-art-layout>-</strong></div><div><span>Mounted Layers</span><strong data-art-layers>-</strong></div><div><span>Engine Quality</span><strong data-art-qa>-</strong></div></div><button type="button" data-art-run class="auto-art-run">AUTO CREATE ARTWORK</button><div class="auto-art-status" data-art-status>Ready for source image</div><p data-art-note>Stage #10.10I menutup V1: source → textless AI → output density map → Top/Center/Bottom Copy → CTA collision guard → responsive guard → final QA.</p>`;
  anchor.insertAdjacentElement('afterend',panel);
  const select=panel.querySelector('#auto-artwork-preset');Object.values(ARTWORK_PRESETS).forEach(p=>{const o=document.createElement('option');o.value=p.id;o.textContent=p.label;select.appendChild(o);});select.value='javanese-heritage';
  const fileInput=panel.querySelector('#auto-artwork-file');fileInput.addEventListener('change',()=>{const file=fileInput.files?.[0];if(!file)return;fileToUrl(file);panel.querySelector('[data-art-file]').textContent=file.name;setState(panel,'idle','Source ready · generate final V1 artwork');setText(panel,'[data-art-output]','SOURCE READY');});
  panel.querySelector('[data-art-run]').addEventListener('click',()=>run(panel));updateProvider(panel);
  window.weddingAutoArtwork={engine,provider:defaultProvider,run:options=>engine.run(options),version:ARTWORK_ENGINE_VERSION,promptVersion:MASTER_TRANSFORM_PROMPT_VERSION,stageRevision:STAGE_REVISION,stable:true};
  const header=document.querySelector('.brand-wrap span');if(header) header.textContent=`Auto Artwork Transform V1 Stable · Stage #${STAGE_REVISION}`;
  const checkpoint=document.querySelector('.checkpoint');if(checkpoint) checkpoint.textContent=`#${STAGE_REVISION} Output-Aware Layout · Responsive Guard · Final QA · V1 Stable`;
}

window.addEventListener('pagehide',()=>{responsiveObserver?.disconnect?.();revoke();},{once:true});
boot();
console.info(`[Wedding Template Studio] ${STABLE_LABEL} · Stage #${STAGE_REVISION}.`);
