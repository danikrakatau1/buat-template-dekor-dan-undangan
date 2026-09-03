const DEFAULT_ENDPOINT='/api/artwork-transform';

function asErrorMessage(payload,status){
  return payload?.error?.message||payload?.message||payload?.error||`Generative provider request failed (${status})`;
}

async function sourceToFile(source){
  const response=await fetch(source);
  if(!response.ok) throw new Error(`Could not read source image (${response.status})`);
  const blob=await response.blob();
  const ext=(blob.type?.split('/')[1]||'png').replace('jpeg','jpg');
  return new File([blob],`source.${ext}`,{type:blob.type||'image/png'});
}

export function createHttpGenerativeProvider({endpoint=DEFAULT_ENDPOINT,name='Cloudflare Workers AI Img2Img'}={}){
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
      const file=await sourceToFile(payload.source);
      const form=new FormData();
      form.append('image',file,file.name);
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
        providerMeta:{provider:data.provider||'server',model:data.model||'',fallbackModel:data.fallbackModel||'',fallbackUsed:Boolean(data.fallbackUsed),generation:data.generation||null,revision:data.revision||'',generatedAt:data.generatedAt||'',requestId:data.requestId||'',promptVersion:data.promptVersion||payload.promptVersion}
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
