const clamp=(value,min=0,max=1)=>Math.max(min,Math.min(max,value));
const uid=()=>globalThis.crypto?.randomUUID?.()||`art-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;

export const ARTWORK_ENGINE_VERSION='10.8.0';

export const ARTWORK_PRESETS=Object.freeze({
  'vintage-engraving':{id:'vintage-engraving',label:'Vintage Engraving',palette:['#f3e6c9','#8b6940','#5f432c','#b88a60'],style:'fine etched linework, antique print, parchment',decor:['tree-frame','floral-bottom'],lineDensity:.78,texture:.62,detail:.84,atmosphere:.12},
  'javanese-heritage':{id:'javanese-heritage',label:'Javanese Heritage',palette:['#efe0bd','#7a552f','#a77a42','#6d4930'],style:'Javanese heritage engraving, carved ornament, luxury stationery',decor:['carved-arch','gunungan','floral-bottom'],lineDensity:.82,texture:.58,detail:.92,atmosphere:.10},
  'royal-botanical':{id:'royal-botanical',label:'Royal Botanical',palette:['#f5e7d4','#7a3140','#81744d','#9c7658'],style:'botanical engraving, luxury editorial floral',decor:['floral-side','floral-bottom'],lineDensity:.72,texture:.48,detail:.90,atmosphere:.08},
  'sakura-engraving':{id:'sakura-engraving',label:'Sakura Engraving',palette:['#f5ead1','#a97f67','#d7a9a1','#70513c'],style:'Japanese vintage engraving, sakura branches, fine line landscape',decor:['branch-top','floral-bottom'],lineDensity:.80,texture:.54,detail:.90,atmosphere:.09},
  'tropical-sepia':{id:'tropical-sepia',label:'Tropical Sepia',palette:['#efe0bf','#80613e','#7b7651','#b09265'],style:'tropical colonial engraving, palms, warm sepia',decor:['tree-frame','floral-bottom'],lineDensity:.74,texture:.60,detail:.84,atmosphere:.12},
  'luxury-stationery':{id:'luxury-stationery',label:'Luxury Stationery',palette:['#f7edd9','#8a653c','#b58d56','#7b343d'],style:'high-end wedding stationery, restrained engraved ornament',decor:['carved-arch','floral-bottom'],lineDensity:.66,texture:.38,detail:.86,atmosphere:.06}
});

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
  const rowEnergy=new Float64Array(height);
  const lum=new Float32Array(width*height);
  for(let y=0;y<height;y++) for(let x=0;x<width;x++){
    const i=(y*width+x)*4,r=data[i],g=data[i+1],b=data[i+2];
    const value=(.2126*r+.7152*g+.0722*b)/255; lum[y*width+x]=value; luma+=value;
    const hi=Math.max(r,g,b),lo=Math.min(r,g,b); saturation+=(hi-lo)/255;
    const weight=clamp(Math.abs(value-.72)*1.4); cx+=x*weight; cy+=y*weight; mass+=weight;
  }
  for(let y=1;y<height-1;y++) for(let x=1;x<width-1;x++){
    const i=y*width+x,gx=lum[i+1]-lum[i-1],gy=lum[i+width]-lum[i-width];
    const e=Math.hypot(gx,gy); edge+=e; rowEnergy[y]+=e;
  }
  let horizonRow=Math.round(height*.66),best=0;
  for(let y=Math.round(height*.28);y<Math.round(height*.82);y++) if(rowEnergy[y]>best){best=rowEnergy[y];horizonRow=y;}
  const aspect=image.naturalWidth/image.naturalHeight;
  const subjectCenter={x:mass?cx/mass/width:.5,y:mass?cy/mass/height:.55};
  const negativeSpace=subjectCenter.y>.52?'center-top':'center';
  return {id:uid(),width:image.naturalWidth,height:image.naturalHeight,aspect,orientation:aspect>.9?'landscape':'portrait',brightness:luma/(width*height),saturation:saturation/(width*height),edgeDensity:edge/(width*height),horizonY:horizonRow/height,subjectCenter,negativeSpace,safeTextArea:negativeSpace==='center-top'?{x:.16,y:.12,w:.68,h:.38}:{x:.18,y:.22,w:.64,h:.34},source};
}

export function resolveComposition(analysis,presetId='javanese-heritage'){
  const preset=ARTWORK_PRESETS[presetId]||ARTWORK_PRESETS['javanese-heritage'];
  const bottomHeavy=analysis.subjectCenter.y>.54 || analysis.horizonY>.58;
  return {id:bottomHeavy?'landscape-bottom-heavy':'centered-monument',preset:preset.id,subjectLock:'strong',silhouetteLock:'strong',horizonLock:'strong',cameraAngleLock:'medium',compositionLock:'strong',styleFreedom:'medium',decorFreedom:'high',safeTextArea:analysis.safeTextArea};
}

function provider(){ return globalThis.weddingArtworkProvider?.transform ? globalThis.weddingArtworkProvider : null; }
export function providerStatus(){return provider()?{connected:true,name:globalThis.weddingArtworkProvider.name||'custom-provider'}:{connected:false,name:'fallback-only'};}

export async function transformArtwork({source,analysis,composition,presetId,locks={},signal}={}){
  const preset=ARTWORK_PRESETS[presetId]||ARTWORK_PRESETS['javanese-heritage'];
  const payload={version:ARTWORK_ENGINE_VERSION,source,analysis,composition,preset,locks:{subject:true,composition:true,palette:false,decor:false,textArea:true,...locks},output:{aspect:'9:16',textless:true,layeredPreferred:true,formats:['webp','png'],transparentDecor:true}};
  const active=provider();
  if(active){
    const result=await active.transform(payload,{signal});
    if(!result?.compositeSrc && !result?.layers?.length) throw new Error('Artwork provider returned no image output');
    return {...result,provider:providerStatus(),preset:preset.id,payload};
  }
  return {provider:providerStatus(),preset:preset.id,payload,compositeSrc:source,layers:[{id:'transformed-base',role:'background',src:source,depth:.02}],fallback:true,notice:'No transform provider connected; source-preserving fallback used.'};
}

export function injectDecor(result,{presetId='javanese-heritage',composition}={}){
  const preset=ARTWORK_PRESETS[presetId]||ARTWORK_PRESETS['javanese-heritage'];
  const safe=composition?.safeTextArea||{x:.18,y:.18,w:.64,h:.38};
  const decor=[];
  if(preset.decor.includes('carved-arch')) decor.push({id:'auto-carved-arch',role:'ornament-back',src:'/assets/art/ornaments/arches/arch-jawa-carved-gold-02.svg',depth:.08,transform:{x:50,y:6,width:'110%',opacity:.64}});
  if(preset.decor.includes('gunungan')) decor.push({id:'auto-gunungan',role:'ornament-front',src:'/assets/art/ornaments/gunungan/orn-gunungan-gold-01.svg',depth:.15,transform:{x:50,y:20,width:'12%',opacity:.74}});
  if(preset.decor.includes('tree-frame')){
    decor.push({id:'auto-tree-left',role:'environment-back',src:'/assets/art/nature/trees/tree-frame-left-sepia-01.svg',depth:.08,transform:{x:0,y:53,width:'42%',opacity:.48}});
    decor.push({id:'auto-tree-right',role:'environment-back',src:'/assets/art/nature/trees/tree-frame-right-sepia-01.svg',depth:.08,transform:{x:100,y:53,width:'42%',opacity:.48}});
  }
  if(preset.decor.includes('floral-side')){
    decor.push({id:'auto-floral-left',role:'ornament-front',src:'/assets/art/florals/side/floral-side-left-burgundy-01.svg',depth:.18,transform:{x:1,y:52,width:'36%',opacity:.74}});
    decor.push({id:'auto-floral-right',role:'ornament-front',src:'/assets/art/florals/side/floral-side-right-burgundy-01.svg',depth:.18,transform:{x:99,y:52,width:'36%',opacity:.74}});
  }
  if(preset.decor.includes('floral-bottom')) decor.push({id:'auto-floral-bottom',role:'foreground-floral',src:'/assets/art/florals/bottom/floral-bottom-burgundy-02.svg',depth:.26,transform:{x:50,y:94,width:'118%',opacity:.88}});
  return {...result,decor,safeTextArea:safe};
}

export function extractArtworkLayers(result){
  const raw=(result.layers?.length?result.layers:[{id:'transformed-base',role:'background',src:result.compositeSrc,depth:.02}]);
  const layers=raw.filter(layer=>layer?.src).map((layer,index)=>({id:layer.id||`art-layer-${index+1}`,role:layer.role||'background',src:layer.src,depth:Number(layer.depth??index*.04),transparent:Boolean(layer.transparent),transform:layer.transform||{x:50,y:50,width:'112%',opacity:1}}));
  return [...layers,...(result.decor||[])];
}

export function runArtworkQualityGate({analysis,composition,result,layers}){
  const issues=[],warnings=[];
  if(!result?.compositeSrc && !layers.length) issues.push('No usable artwork output');
  if(analysis.width<720 || analysis.height<720) warnings.push('Source resolution is below preferred production size');
  if(analysis.edgeDensity<.006) warnings.push('Source has low structural edge density; transform may need stronger structure lock');
  if(!composition.safeTextArea) issues.push('Missing protected text-safe area');
  if(layers.some(layer=>!layer.src)) issues.push('One or more layers has no source');
  if(result.fallback) warnings.push('AI transform provider is not connected; using source-preserving fallback');
  const score=Math.max(0,100-issues.length*25-warnings.length*6);
  return {ok:issues.length===0,score,status:issues.length?'fail':warnings.length?'warn':'pass',issues,warnings,retryRecommended:issues.length>0||score<82};
}

export function buildArtworkSceneProject({source,analysis,composition,presetId,result,layers,quality,names='Anif & Dini',guest='Tamu Undangan'}={}){
  const preset=ARTWORK_PRESETS[presetId]||ARTWORK_PRESETS['javanese-heritage'];
  const imageLayers=layers.map((layer,index)=>({id:layer.id,kind:'image',role:layer.role,asset:{src:layer.src,source:'auto-artwork-transform',transparent:layer.transparent},transform:{x:50,y:50,width:'112%',opacity:1,...layer.transform,depth:layer.depth},motion:{preset:'fade-in',durationMs:1000+index*80,delayMs:index*70,parallax:Math.min(.12,layer.depth*.6),decorMotion:layer.role==='foreground-floral'?'sway':layer.role==='background'?'drift':''}}));
  const text=[
    {id:'cover-title',kind:'text',role:'content',content:'THE WEDDING OF',transform:{x:50,y:31,width:'72%',opacity:1},motion:{preset:'clip-up',delayMs:900,durationMs:800}},
    {id:'couple-name',kind:'text',role:'content',content:names,transform:{x:50,y:38,width:'84%',opacity:1},motion:{preset:'fade-up',delayMs:1150,durationMs:900}},
    {id:'guest-name',kind:'text',role:'content',content:guest,transform:{x:50,y:49,width:'70%',opacity:1},motion:{preset:'fade-up',delayMs:1450,durationMs:800}},
    {id:'open-button',kind:'button',role:'interaction',content:'Buka Undangan',transform:{x:50,y:58},motion:{preset:'zoom-soft',delayMs:1750,durationMs:760}}
  ];
  const scene={id:'cover',type:'cover',preset:`auto-artwork-${preset.id}`,background:{type:'solid'},atmosphere:{effects:['grain','vignette'],intensity:preset.atmosphere},layers:[...imageLayers,...text],responsive:{desktop:{parallaxMultiplier:.55},tablet:{parallaxMultiplier:.34},mobile:{parallaxMultiplier:.16}},fidelity:{system:'auto-artwork-transform',version:ARTWORK_ENGINE_VERSION,preset:preset.id,provider:result.provider,quality,safeTextArea:composition.safeTextArea,sourceAnalysis:{width:analysis.width,height:analysis.height,horizonY:analysis.horizonY,negativeSpace:analysis.negativeSpace}}};
  return {project:{id:`auto-artwork-${uid()}`,name:`Auto Artwork · ${preset.label}`,version:1,preset:'jawa-luxury',seed:uid()},theme:{id:'jawa-luxury',palette:{background:preset.palette[0],text:preset.palette[1],accent:preset.palette[2],surface:'#f7edd9'}},variation:{layout:composition.id,artworkPreset:preset.id},generator:{mode:'auto-artwork-transform',version:ARTWORK_ENGINE_VERSION,stages:['10.1','10.2','10.3','10.4','10.5','10.6','10.7','10.8']},artwork:{source,analysis,composition,preset:preset.id,provider:result.provider,quality},scenes:[scene]};
}

export class AutoArtworkTransformEngine{
  constructor({transformProvider}={}){if(transformProvider) globalThis.weddingArtworkProvider=transformProvider; this.lastRun=null;}
  async run({source,presetId='javanese-heritage',locks={},names,guest,signal}={}){
    const analysis=await analyzeSourceImage(source);
    const composition=resolveComposition(analysis,presetId);
    let transformed=await transformArtwork({source,analysis,composition,presetId,locks,signal});
    transformed=injectDecor(transformed,{presetId,composition});
    const layers=extractArtworkLayers(transformed);
    const quality=runArtworkQualityGate({analysis,composition,result:transformed,layers});
    const project=buildArtworkSceneProject({source,analysis,composition,presetId,result:transformed,layers,quality,names,guest});
    this.lastRun={analysis,composition,transformed,layers,quality,project};
    return this.lastRun;
  }
}
