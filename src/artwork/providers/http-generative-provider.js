const DEFAULT_ENDPOINT='/api/artwork-transform';
const MAX_REFERENCE_EDGE=511;

function asErrorMessage(payload,status){
  return payload?.error?.message||payload?.message||payload?.error||`Generative provider request failed (${status})`;
}

async function resizeReferenceBlob(blob,maxEdge=MAX_REFERENCE_EDGE){
  const bitmap=await createImageBitmap(blob);
  try{
    const scale=Math.min(1,maxEdge/Math.max(bitmap.width,bitmap.height));
    if(scale>=1) return {blob,width:bitmap.width,height:bitmap.height,resized:false};
    const width=Math.max(1,Math.floor(bitmap.width*scale));
    const height=Math.max(1,Math.floor(bitmap.height*scale));
    const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
    const ctx=canvas.getContext('2d',{alpha:false});ctx.drawImage(bitmap,0,0,width,height);
    const resized=await new Promise((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error('Could not resize source reference image')),'image/png',.94));
    return {blob:resized,width,height,resized:true};
  }finally{bitmap.close?.();}
}

async function sourceToFile(source){
  const response=await fetch(source);
  if(!response.ok) throw new Error(`Could not read source image (${response.status})`);
  const blob=await response.blob();
  const prepared=await resizeReferenceBlob(blob);
  return {file:new File([prepared.blob],'source-reference.png',{type:'image/png'}),...prepared};
}

export function createHttpGenerativeProvider({endpoint=DEFAULT_ENDPOINT,name='Cloudflare Workers AI Reference Edit'}={}){
  return {
    name,
    endpoint,
    async health({signal}={}){
      try{
        const response=await fetch(endpoint,{method:'GET',headers:{accept:'application/json'},signal,cache:'no-store'});
        const data=await response.json().catch(()=>({}));
        return {reachable:response.ok,configured:Boolean(data.configured),provider:data.provider||'server',model:data.model||'',fallbackModel:data.fallbackModel||'',generation:data.generation||null,revision:data.revision||'',status:response.status,message:data.message||''};
      }catch(error){
        return {reachable:false,configured:false,provider:'server',model:'',status:0,message:error?.message||'Provider endpoint unreachable'};
      }
    },
    async transform(payload,{signal}={}){
      const prepared=await sourceToFile(payload.source);
      const form=new FormData();
      form.append('image',prepared.file,prepared.file.name);
      form.append('reference_width',String(prepared.width));
      form.append('reference_height',String(prepared.height));
      form.append('reference_resized',String(prepared.resized));
      form.append('prompt',payload.prompt?.positive||'');
      form.append('negative_prompt',payload.prompt?.negative||'');
      form.append('prompt_version',payload.promptVersion||payload.prompt?.version||'');
      form.append('theme_adapter',payload.prompt?.themeAdapter||'');
      form.append('preset',payload.preset?.id||'');
      form.append('scene_adapter',JSON.stringify(payload.prompt?.scene||{}));
      form.append('locks',JSON.stringify(payload.locks||{}));
      form.append('output_aspect',payload.output?.aspect||'9:16');
      form.append('textless',String(payload.output?.textless!==false));

      const response=await fetch(endpoint,{method:'POST',body:form,headers:{accept:'application/json'},signal,cache:'no-store'});
      const data=await response.json().catch(()=>({}));
      if(!response.ok) throw new Error(asErrorMessage(data,response.status));
      if(!data.compositeSrc&&!data.layers?.length) throw new Error('Generative provider returned no artwork output');
      return {
        compositeSrc:data.compositeSrc||'',
        layers:Array.isArray(data.layers)?data.layers:[],
        fallback:false,
        providerMeta:{provider:data.provider||'server',model:data.model||'',fallbackModel:data.fallbackModel||'',fallbackUsed:Boolean(data.fallbackUsed),generation:data.generation||null,revision:data.revision||'',generatedAt:data.generatedAt||'',requestId:data.requestId||'',promptVersion:data.promptVersion||payload.promptVersion,reference:data.reference||null}
      };
    }
  };
}

export function installDefaultGenerativeProvider(options={}){
  if(globalThis.weddingArtworkProvider?.transform) return globalThis.weddingArtworkProvider;
  const provider=createHttpGenerativeProvider(options);
  globalThis.weddingArtworkProvider=provider;
  return provider;
}
