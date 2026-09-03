const clamp=(value,min=0,max=1)=>Math.max(min,Math.min(max,value));
const uid=()=>globalThis.crypto?.randomUUID?.()||`art-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;

export const ARTWORK_ENGINE_VERSION='10.9.0';
export const MASTER_TRANSFORM_PROMPT_VERSION='MASTER-TRANSFORM-PROMPT-V1';

export const ARTWORK_PRESETS=Object.freeze({
  'vintage-engraving':{id:'vintage-engraving',label:'Vintage Engraving',palette:['#f3e6c9','#8b6940','#5f432c','#b88a60'],style:'fine etched linework, antique print, parchment',decor:['tree-frame','floral-bottom'],lineDensity:.78,texture:.62,detail:.84,atmosphere:.12},
  'javanese-heritage':{id:'javanese-heritage',label:'Javanese Heritage',palette:['#efe0bd','#7a552f','#a77a42','#6d4930'],style:'Javanese heritage engraving, carved ornament, luxury stationery',decor:['carved-arch','gunungan','floral-bottom'],lineDensity:.82,texture:.58,detail:.92,atmosphere:.10},
  'royal-botanical':{id:'royal-botanical',label:'Royal Botanical',palette:['#f5e7d4','#7a3140','#81744d','#9c7658'],style:'botanical engraving, luxury editorial floral',decor:['floral-side','floral-bottom'],lineDensity:.72,texture:.48,detail:.90,atmosphere:.08},
  'sakura-engraving':{id:'sakura-engraving',label:'Sakura Engraving',palette:['#f5ead1','#a97f67','#d7a9a1','#70513c'],style:'Japanese vintage engraving, sakura branches, fine line landscape',decor:['branch-top','floral-bottom'],lineDensity:.80,texture:.54,detail:.90,atmosphere:.09},
  'tropical-sepia':{id:'tropical-sepia',label:'Tropical Sepia',palette:['#efe0bf','#80613e','#7b7651','#b09265'],style:'tropical colonial engraving, palms, warm sepia',decor:['tree-frame','floral-bottom'],lineDensity:.74,texture:.60,detail:.84,atmosphere:.12},
  'luxury-stationery':{id:'luxury-stationery',label:'Luxury Stationery',palette:['#f7edd9','#8a653c','#b58d56','#7b343d'],style:'high-end wedding stationery, restrained engraved ornament',decor:['carved-arch','floral-bottom'],lineDensity:.66,texture:.38,detail:.86,atmosphere:.06}
});

export const THEME_ADAPTERS=Object.freeze({
  'vintage-engraving':{id:'classic-antique-engraving',motifs:'botanical branches, antique landscape foliage, refined ornamental flowers',cultural:'subtle antique print ornament with no dominant regional symbol',subjectRule:'Preserve the original landmark or subject exactly as the visual anchor.',accent:'warm ivory, antique brown, muted beige, olive and restrained dusty rose'},
  'javanese-heritage':{id:'javanese-heritage',motifs:'tropical foliage, jasmine, refined muted burgundy and ivory flowers, carved wood botanical details',cultural:'Javanese carved ornament, restrained gunungan-inspired details, joglo or pendopo cues when relevant, subtle batik-derived geometry',subjectRule:'Preserve the original architecture, landmark, mountain or venue; reinterpret it with refined Javanese heritage engraving language without replacing it.',accent:'warm ivory, golden taupe, antique brown, dark olive, muted burgundy and soft blush'},
  'royal-botanical':{id:'royal-botanical',motifs:'layered natural leaves, elegant flowering branches, garden roses, peonies and fine botanical linework',cultural:'restrained luxury stationery ornament, symmetrical or semi-symmetrical framing',subjectRule:'Keep the original focal subject recognizable and give it generous breathing space inside a botanical frame.',accent:'ivory, taupe, dark olive, muted burgundy, dusty rose and blush'},
  'sakura-engraving':{id:'japanese-sakura',motifs:'cherry blossom branches, muted dusty-pink sakura, ivory flowers, dark brown branches and restrained olive foliage',cultural:'subtle Japanese geometric patterns and restrained traditional Japanese decorative accents',subjectRule:'If the source contains Mount Fuji, keep Mount Fuji as the central visual landmark. Otherwise preserve the original main landmark or subject and adapt only the surrounding visual language.',accent:'parchment cream, golden taupe, antique brown, dusty pink, soft blush and dark olive'},
  'tropical-sepia':{id:'tropical-heritage',motifs:'palms, tropical branches, banana leaves, refined tropical flowers and engraved foliage',cultural:'restrained tropical heritage ornament with antique stationery character',subjectRule:'Preserve the source landmark and horizon; use tropical botanical framing to support, never replace, the subject.',accent:'warm ivory, sepia brown, olive, muted beige and restrained floral accents'},
  'luxury-stationery':{id:'luxury-stationery',motifs:'refined botanical corners, fine branches, restrained floral foreground and elegant ornamental linework',cultural:'timeless premium wedding stationery with minimal culturally specific ornament unless visible in the source',subjectRule:'Preserve the main subject and composition with the strongest restraint; decoration must remain secondary.',accent:'ivory, golden taupe, antique brown, dark olive and restrained burgundy'}
});

const MASTER_BASE=`Transform the provided reference image into a premium vintage engraved wedding illustration.

Preserve the main subject and recognizable composition of the original image, but reinterpret the entire scene as an antique botanical engraving / toile de jouy / chinoiserie-inspired wedding artwork.

VISUAL STYLE:
- vintage engraved illustration
- antique etching / cross-hatching linework
- toile de jouy landscape character
- chinoiserie botanical framing
- classic wedding stationery aesthetic
- parchment / ivory paper background
- elegant hand-drawn botanical details
- refined ornamental composition
- premium, timeless, luxurious, romantic
- no modern photographic look
- no glossy digital painting look
- no cartoon style
- no 3D render look

COLOR PALETTE:
- warm ivory
- parchment cream
- golden taupe
- muted beige
- antique brown
- dark olive green
- dusty rose
- muted burgundy
- soft blush accents
- restrained colors, not overly saturated

COMPOSITION:
- preserve the main landmark / subject from the source image
- keep the central area visually readable and elegant
- create botanical framing from the top, left, and right edges
- add decorative floral foreground along the bottom
- maintain strong depth between background, main subject, botanical frame, and foreground flowers
- leave breathing space around the visual focal point
- symmetrical or semi-symmetrical wedding invitation composition
- elegant vertical poster / invitation layout

ENGRAVING DETAILS:
- fine etched contour lines
- delicate cross-hatching
- engraved clouds and landscape texture
- intricate tree and flower linework
- antique print texture
- subtle paper grain
- fine horizontal engraving strokes
- controlled vintage imperfections
- high detail but still clean and luxurious

BOTANICAL ELEMENTS:
- use flora appropriate to the scene or requested theme
- mix detailed leaves, branches, blossoms, and ornamental flowers
- flowers may retain subtle muted color while the landscape remains mostly engraved
- keep flowers sophisticated and natural, not oversized or cartoonish

LIGHTING / TONE:
- soft warm paper illumination
- brighter center
- subtle darker edges
- restrained vignette
- atmospheric vintage depth
- no harsh modern contrast

IMPORTANT:
- do not replace the main subject with a different object
- do not distort important architecture, mountain shapes, people, or landmarks
- do not add random text
- do not add logos or watermarks
- do not make the scene photorealistic
- final result should feel like a luxury wedding invitation illustration printed from an antique engraved plate

REFERENCE CHARACTER:
Use the visual language of a traditional Indonesian wedding invitation illustration: dense engraved trees around the edges, warm parchment background, ornamental floral framing, muted red and ivory flowers, dark olive foliage, fine landscape etching, decorative cultural pattern motifs near the top, and a richly layered floral foreground. Do not copy any specific existing artwork exactly; reproduce only the general visual language and composition style.`;

export const MASTER_NEGATIVE_PROMPT=`photorealistic photography, modern cinematic photo grading, neon colors, anime, cartoon, 3D render, plastic surfaces, glossy digital painting, heavy blur, overly saturated flowers, flat sepia filter, cheap poster look, modern minimalist vector art, random typography, distorted architecture, warped mountain, unnecessary people, watermark, logo`;

function themeAdapterFor(presetId){return THEME_ADAPTERS[presetId]||THEME_ADAPTERS['javanese-heritage'];}

export function buildSceneAdapter(analysis,composition){
  const horizon=Math.round((analysis?.horizonY??.62)*100);
  const subjectX=Math.round((analysis?.subjectCenter?.x??.5)*100);
  const subjectY=Math.round((analysis?.subjectCenter?.y??.55)*100);
  const safe=composition?.safeTextArea||analysis?.safeTextArea||{x:.18,y:.16,w:.64,h:.36};
  return {orientation:analysis?.orientation||'unknown',horizonPercent:horizon,subjectCenterPercent:{x:subjectX,y:subjectY},negativeSpace:analysis?.negativeSpace||'center',safeTextArea:safe,structureLocks:{subject:composition?.subjectLock||'strong',silhouette:composition?.silhouetteLock||'strong',horizon:composition?.horizonLock||'strong',cameraAngle:composition?.cameraAngleLock||'medium',composition:composition?.compositionLock||'strong'}};
}

export function buildTransformPrompt({analysis,composition,presetId='javanese-heritage'}={}){
  const preset=ARTWORK_PRESETS[presetId]||ARTWORK_PRESETS['javanese-heritage'];
  const adapter=themeAdapterFor(preset.id);
  const scene=buildSceneAdapter(analysis,composition);
  const safe=scene.safeTextArea;
  const themeBlock=`THEME ADAPTATION:\nUse ${adapter.motifs}. Use ${adapter.cultural}. ${adapter.subjectRule}\nCOLOR ACCENTS: ${adapter.accent}.`;
  const sceneBlock=`SCENE ADAPTER:\n- source orientation: ${scene.orientation}\n- estimated horizon: ${scene.horizonPercent}%\n- estimated subject center: ${scene.subjectCenterPercent.x}% x, ${scene.subjectCenterPercent.y}% y\n- protected negative-space zone: ${scene.negativeSpace}\n- protected text-safe rectangle: x ${Math.round(safe.x*100)}%, y ${Math.round(safe.y*100)}%, width ${Math.round(safe.w*100)}%, height ${Math.round(safe.h*100)}%\n- subject lock: ${scene.structureLocks.subject}\n- silhouette lock: ${scene.structureLocks.silhouette}\n- horizon lock: ${scene.structureLocks.horizon}\n- composition lock: ${scene.structureLocks.composition}\nKeep botanical and ornamental elements outside the protected text-safe area unless they are extremely subtle background linework.`;
  return {version:MASTER_TRANSFORM_PROMPT_VERSION,preset:preset.id,themeAdapter:adapter.id,positive:`${MASTER_BASE}\n\n${themeBlock}\n\n${sceneBlock}`,negative:MASTER_NEGATIVE_PROMPT,scene};
}

function readImage(source){
  return new Promise((resolve,reject)=>{
    if(!source) return reject(new Error('Source image is required'));
    const image=new Image(); image.decoding='async'; image.crossOrigin='anonymous';
    image.onload=()=>resolve(image); image.onerror=()=>reject(new Error('Source image could not be decoded')); image.src=source;
  });
}

export async function analyzeSourceImage(source){
  const image=await readImage(source);
  const max=192,scale=Math.min(1,max/Math.max(image.naturalWidth,image.naturalHeight));
  const width=Math.max(1,Math.round(image.naturalWidth*scale)),height=Math.max(1,Math.round(image.naturalHeight*scale));
  const canvas=document.createElement('canvas'); canvas.width=width; canvas.height=height;
  const ctx=canvas.getContext('2d',{willReadFrequently:true}); ctx.drawImage(image,0,0,width,height);
  const {data}=ctx.getImageData(0,0,width,height);
  let luma=0,saturation=0,edge=0,cx=0,cy=0,mass=0;
  const rowEnergy=new Float64Array(height),lum=new Float32Array(width*height);
  for(let y=0;y<height;y++) for(let x=0;x<width;x++){
    const i=(y*width+x)*4,r=data[i],g=data[i+1],b=data[i+2],value=(.2126*r+.7152*g+.0722*b)/255;
    lum[y*width+x]=value;luma+=value;const hi=Math.max(r,g,b),lo=Math.min(r,g,b);saturation+=(hi-lo)/255;
    const weight=clamp(Math.abs(value-.72)*1.4);cx+=x*weight;cy+=y*weight;mass+=weight;
  }
  for(let y=1;y<height-1;y++) for(let x=1;x<width-1;x++){const i=y*width+x,gx=lum[i+1]-lum[i-1],gy=lum[i+width]-lum[i-width],e=Math.hypot(gx,gy);edge+=e;rowEnergy[y]+=e;}
  let horizonRow=Math.round(height*.66),best=0;for(let y=Math.round(height*.28);y<Math.round(height*.82);y++) if(rowEnergy[y]>best){best=rowEnergy[y];horizonRow=y;}
  const aspect=image.naturalWidth/image.naturalHeight,subjectCenter={x:mass?cx/mass/width:.5,y:mass?cy/mass/height:.55};
  const negativeSpace=subjectCenter.y>.52?'center-top':'center';
  return {id:uid(),width:image.naturalWidth,height:image.naturalHeight,aspect,orientation:aspect>.9?'landscape':'portrait',brightness:luma/(width*height),saturation:saturation/(width*height),edgeDensity:edge/(width*height),horizonY:horizonRow/height,subjectCenter,negativeSpace,safeTextArea:negativeSpace==='center-top'?{x:.16,y:.12,w:.68,h:.38}:{x:.18,y:.22,w:.64,h:.34},source};
}

export function resolveComposition(analysis,presetId='javanese-heritage'){
  const preset=ARTWORK_PRESETS[presetId]||ARTWORK_PRESETS['javanese-heritage'];
  const bottomHeavy=analysis.subjectCenter.y>.54||analysis.horizonY>.58;
  return {id:bottomHeavy?'landscape-bottom-heavy':'centered-monument',preset:preset.id,subjectLock:'strong',silhouetteLock:'strong',horizonLock:'strong',cameraAngleLock:'medium',compositionLock:'strong',styleFreedom:'medium',decorFreedom:'high',safeTextArea:analysis.safeTextArea};
}

function provider(){return globalThis.weddingArtworkProvider?.transform?globalThis.weddingArtworkProvider:null;}
export function providerStatus(){return provider()?{connected:true,name:globalThis.weddingArtworkProvider.name||'custom-provider'}:{connected:false,name:'fallback-only'};}

export async function transformArtwork({source,analysis,composition,presetId,locks={},signal}={}){
  const preset=ARTWORK_PRESETS[presetId]||ARTWORK_PRESETS['javanese-heritage'];
  const prompt=buildTransformPrompt({analysis,composition,presetId:preset.id});
  const payload={version:ARTWORK_ENGINE_VERSION,promptVersion:MASTER_TRANSFORM_PROMPT_VERSION,source,analysis,composition,preset,prompt,locks:{subject:true,composition:true,palette:false,decor:false,textArea:true,...locks},output:{aspect:'9:16',textless:true,layeredPreferred:true,formats:['webp','png'],transparentDecor:true}};
  const active=provider();
  if(active){const result=await active.transform(payload,{signal});if(!result?.compositeSrc&&!result?.layers?.length) throw new Error('Artwork provider returned no image output');return {...result,provider:providerStatus(),preset:preset.id,prompt,payload};}
  return {provider:providerStatus(),preset:preset.id,prompt,payload,compositeSrc:source,layers:[{id:'transformed-base',role:'background',src:source,depth:.02}],fallback:true,notice:'No transform provider connected; source-preserving fallback used. Master Transform Prompt V1 is prepared in payload.prompt for the provider.'};
}

export function injectDecor(result,{presetId='javanese-heritage',composition}={}){
  const preset=ARTWORK_PRESETS[presetId]||ARTWORK_PRESETS['javanese-heritage'],safe=composition?.safeTextArea||{x:.18,y:.18,w:.64,h:.38},decor=[];
  if(preset.decor.includes('carved-arch')) decor.push({id:'auto-carved-arch',role:'ornament-back',src:'/assets/art/ornaments/arches/arch-jawa-carved-gold-02.svg',depth:.08,transform:{x:50,y:6,width:'110%',opacity:.64}});
  if(preset.decor.includes('gunungan')) decor.push({id:'auto-gunungan',role:'ornament-front',src:'/assets/art/ornaments/gunungan/orn-gunungan-gold-01.svg',depth:.15,transform:{x:50,y:20,width:'12%',opacity:.74}});
  if(preset.decor.includes('tree-frame')){decor.push({id:'auto-tree-left',role:'environment-back',src:'/assets/art/nature/trees/tree-frame-left-sepia-01.svg',depth:.08,transform:{x:0,y:53,width:'42%',opacity:.48}});decor.push({id:'auto-tree-right',role:'environment-back',src:'/assets/art/nature/trees/tree-frame-right-sepia-01.svg',depth:.08,transform:{x:100,y:53,width:'42%',opacity:.48}});}
  if(preset.decor.includes('floral-side')){decor.push({id:'auto-floral-left',role:'ornament-front',src:'/assets/art/florals/side/floral-side-left-burgundy-01.svg',depth:.18,transform:{x:1,y:52,width:'36%',opacity:.74}});decor.push({id:'auto-floral-right',role:'ornament-front',src:'/assets/art/florals/side/floral-side-right-burgundy-01.svg',depth:.18,transform:{x:99,y:52,width:'36%',opacity:.74}});}
  if(preset.decor.includes('floral-bottom')) decor.push({id:'auto-floral-bottom',role:'foreground-floral',src:'/assets/art/florals/bottom/floral-bottom-burgundy-02.svg',depth:.26,transform:{x:50,y:94,width:'118%',opacity:.88}});
  return {...result,decor,safeTextArea:safe};
}

export function extractArtworkLayers(result){
  const raw=result.layers?.length?result.layers:[{id:'transformed-base',role:'background',src:result.compositeSrc,depth:.02}];
  const layers=raw.filter(layer=>layer?.src).map((layer,index)=>({id:layer.id||`art-layer-${index+1}`,role:layer.role||'background',src:layer.src,depth:Number(layer.depth??index*.04),transparent:Boolean(layer.transparent),transform:layer.transform||{x:50,y:50,width:'112%',opacity:1}}));
  return [...layers,...(result.decor||[])];
}

export function runArtworkQualityGate({analysis,composition,result,layers}){
  const issues=[],warnings=[];
  if(!result?.compositeSrc&&!layers.length) issues.push('No usable artwork output');
  if(analysis.width<720||analysis.height<720) warnings.push('Source resolution is below preferred production size');
  if(analysis.edgeDensity<.006) warnings.push('Source has low structural edge density; transform may need stronger structure lock');
  if(!composition.safeTextArea) issues.push('Missing protected text-safe area');
  if(layers.some(layer=>!layer.src)) issues.push('One or more layers has no source');
  if(!result?.prompt?.positive||!result?.prompt?.negative) issues.push('Master Transform Prompt payload missing');
  if(result.fallback) warnings.push('AI transform provider is not connected; using source-preserving fallback');
  const score=Math.max(0,100-issues.length*25-warnings.length*6);
  return {ok:issues.length===0,score,status:issues.length?'fail':warnings.length?'warn':'pass',issues,warnings,retryRecommended:issues.length>0||score<82};
}

export function buildArtworkSceneProject({source,analysis,composition,presetId,result,layers,quality,names='Anif & Dini',guest='Tamu Undangan'}={}){
  const preset=ARTWORK_PRESETS[presetId]||ARTWORK_PRESETS['javanese-heritage'];
  const imageLayers=layers.map((layer,index)=>({id:layer.id,kind:'image',role:layer.role,asset:{src:layer.src,source:'auto-artwork-transform',transparent:layer.transparent},transform:{x:50,y:50,width:'112%',opacity:1,...layer.transform,depth:layer.depth},motion:{preset:'fade-in',durationMs:1000+index*80,delayMs:index*70,parallax:Math.min(.12,layer.depth*.6),decorMotion:layer.role==='foreground-floral'?'sway':layer.role==='background'?'drift':''}}));
  const text=[{id:'cover-title',kind:'text',role:'content',content:'THE WEDDING OF',transform:{x:50,y:31,width:'72%',opacity:1},motion:{preset:'clip-up',delayMs:900,durationMs:800}},{id:'couple-name',kind:'text',role:'content',content:names,transform:{x:50,y:38,width:'84%',opacity:1},motion:{preset:'fade-up',delayMs:1150,durationMs:900}},{id:'guest-name',kind:'text',role:'content',content:guest,transform:{x:50,y:49,width:'70%',opacity:1},motion:{preset:'fade-up',delayMs:1450,durationMs:800}},{id:'open-button',kind:'button',role:'interaction',content:'Buka Undangan',transform:{x:50,y:58},motion:{preset:'zoom-soft',delayMs:1750,durationMs:760}}];
  const scene={id:'cover',type:'cover',preset:`auto-artwork-${preset.id}`,background:{type:'solid'},atmosphere:{effects:['grain','vignette'],intensity:preset.atmosphere},layers:[...imageLayers,...text],responsive:{desktop:{parallaxMultiplier:.55},tablet:{parallaxMultiplier:.34},mobile:{parallaxMultiplier:.16}},fidelity:{system:'auto-artwork-transform',version:ARTWORK_ENGINE_VERSION,promptVersion:MASTER_TRANSFORM_PROMPT_VERSION,themeAdapter:result.prompt?.themeAdapter,preset:preset.id,provider:result.provider,quality,safeTextArea:composition.safeTextArea,sourceAnalysis:{width:analysis.width,height:analysis.height,horizonY:analysis.horizonY,negativeSpace:analysis.negativeSpace}}};
  return {project:{id:`auto-artwork-${uid()}`,name:`Auto Artwork · ${preset.label}`,version:1,preset:'jawa-luxury',seed:uid()},theme:{id:'jawa-luxury',palette:{background:preset.palette[0],text:preset.palette[1],accent:preset.palette[2],surface:'#f7edd9'}},variation:{layout:composition.id,artworkPreset:preset.id},generator:{mode:'auto-artwork-transform',version:ARTWORK_ENGINE_VERSION,promptVersion:MASTER_TRANSFORM_PROMPT_VERSION,stages:['10.1','10.2','10.3','10.4','10.5','10.6','10.7','10.8','10.9']},artwork:{source,analysis,composition,preset:preset.id,prompt:result.prompt,provider:result.provider,quality},scenes:[scene]};
}

export class AutoArtworkTransformEngine{
  constructor({transformProvider}={}){if(transformProvider) globalThis.weddingArtworkProvider=transformProvider;this.lastRun=null;}
  async run({source,presetId='javanese-heritage',locks={},names,guest,signal}={}){
    const analysis=await analyzeSourceImage(source),composition=resolveComposition(analysis,presetId);
    let transformed=await transformArtwork({source,analysis,composition,presetId,locks,signal});
    transformed=injectDecor(transformed,{presetId,composition});
    const layers=extractArtworkLayers(transformed),quality=runArtworkQualityGate({analysis,composition,result:transformed,layers});
    const project=buildArtworkSceneProject({source,analysis,composition,presetId,result:transformed,layers,quality,names,guest});
    this.lastRun={analysis,composition,prompt:transformed.prompt,transformed,layers,quality,project};
    return this.lastRun;
  }
}
