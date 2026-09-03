const PRIMARY_MODEL='@cf/stabilityai/stable-diffusion-xl-base-1.0';
const FALLBACK_MODEL='@cf/runwayml/stable-diffusion-v1-5-img2img';

function json(data,status=200,extraHeaders={}){
  return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...extraHeaders}});
}

function numberEnv(value,fallback,min,max){
  const parsed=Number(value);
  return Number.isFinite(parsed)?Math.max(min,Math.min(max,parsed)):fallback;
}

function modelConfig(env){
  return {
    primary:env.WORKERS_AI_IMAGE_MODEL||PRIMARY_MODEL,
    fallback:env.WORKERS_AI_FALLBACK_MODEL||FALLBACK_MODEL,
    width:Math.round(numberEnv(env.WORKERS_AI_IMAGE_WIDTH,1024,256,2048)/64)*64,
    height:Math.round(numberEnv(env.WORKERS_AI_IMAGE_HEIGHT,1792,256,2048)/64)*64,
    steps:Math.round(numberEnv(env.WORKERS_AI_IMAGE_STEPS,20,1,20)),
    // Stage 10.10B: previous .58 preserved too much of the source. Cloudflare documents
    // lower strength as closer to the input, so use a clearly transformative default.
    strength:numberEnv(env.WORKERS_AI_IMAGE_STRENGTH,.82,0,1),
    guidance:numberEnv(env.WORKERS_AI_IMAGE_GUIDANCE,9,1,20)
  };
}

function bufferToBase64(buffer){
  const bytes=new Uint8Array(buffer);
  const chunk=0x8000;
  let binary='';
  for(let offset=0;offset<bytes.length;offset+=chunk){
    binary+=String.fromCharCode(...bytes.subarray(offset,Math.min(offset+chunk,bytes.length)));
  }
  return btoa(binary);
}

async function resultToBytes(result){
  if(result instanceof Response) return new Uint8Array(await result.arrayBuffer());
  if(result instanceof ReadableStream) return new Uint8Array(await new Response(result).arrayBuffer());
  if(result instanceof ArrayBuffer) return new Uint8Array(result);
  if(ArrayBuffer.isView(result)) return new Uint8Array(result.buffer,result.byteOffset,result.byteLength);
  if(result?.body instanceof ReadableStream) return new Uint8Array(await new Response(result.body).arrayBuffer());
  throw new Error('Workers AI returned an unsupported image response');
}

async function runImageModel(env,model,input){
  if(!env.AI?.run) throw new Error('Workers AI binding AI is not configured');
  const result=await env.AI.run(model,input);
  return resultToBytes(result);
}

export async function onRequestGet({env}){
  const config=modelConfig(env);
  const configured=Boolean(env.AI?.run);
  return json({
    ok:true,
    configured,
    provider:'cloudflare-workers-ai',
    model:config.primary,
    fallbackModel:config.fallback,
    mode:'img2img',
    generation:{width:config.width,height:config.height,steps:config.steps,strength:config.strength,guidance:config.guidance},
    revision:'10.10B-strong-transform',
    message:configured?'Workers AI binding active':'Add a Workers AI binding named AI to this Cloudflare Pages project'
  });
}

export async function onRequestPost({request,env}){
  if(!env.AI?.run){
    return json({error:{code:'workers_ai_binding_missing',message:'Workers AI binding belum aktif. Tambahkan binding Workers AI dengan nama AI di Cloudflare Pages project.'},provider:'cloudflare-workers-ai'},503);
  }

  let incoming;
  try{incoming=await request.formData();}catch{
    return json({error:{code:'invalid_form',message:'Request harus multipart/form-data.'}},400);
  }

  const image=incoming.get('image');
  const positive=String(incoming.get('prompt')||'').trim();
  const negative=String(incoming.get('negative_prompt')||'').trim();
  const promptVersion=String(incoming.get('prompt_version')||'MASTER-TRANSFORM-PROMPT-V1');
  const themeAdapter=String(incoming.get('theme_adapter')||'');
  const preset=String(incoming.get('preset')||'');

  if(!(image instanceof File)||!image.size) return json({error:{code:'missing_image',message:'Source image wajib dikirim.'}},400);
  if(!positive) return json({error:{code:'missing_prompt',message:'Master transform prompt kosong.'}},400);
  if(image.size>10*1024*1024) return json({error:{code:'image_too_large',message:'Source image maksimal 10 MB untuk Workers AI img2img.'}},413);

  const config=modelConfig(env);
  const sourceBytes=new Uint8Array(await image.arrayBuffer());
  const imageB64=bufferToBase64(sourceBytes.buffer);
  const transformDirective='\n\nTRANSFORMATION INTENSITY DIRECTIVE:\nVisibly redraw the source into genuine antique engraved line art. Replace photographic rendering with etched contour lines, fine cross-hatching, engraved foliage and parchment-print texture while preserving the subject silhouette, landmark identity and composition. The output must be visibly different in rendering technique from the source, not a simple color filter.';
  const input={
    prompt:`${positive}${transformDirective}`,
    negative_prompt:negative,
    image_b64:imageB64,
    width:config.width,
    height:config.height,
    num_steps:config.steps,
    strength:config.strength,
    guidance:config.guidance
  };

  let outputBytes;
  let model=config.primary;
  let fallbackUsed=false;
  let primaryError='';
  try{
    outputBytes=await runImageModel(env,config.primary,input);
  }catch(error){
    primaryError=error?.message||String(error);
    if(!config.fallback||config.fallback===config.primary){
      return json({error:{code:'workers_ai_error',message:primaryError},provider:'cloudflare-workers-ai',model:config.primary},502);
    }
    try{
      model=config.fallback;
      outputBytes=await runImageModel(env,config.fallback,input);
      fallbackUsed=true;
    }catch(fallbackError){
      return json({
        error:{code:'workers_ai_error',message:`Primary gagal: ${primaryError}. Fallback gagal: ${fallbackError?.message||String(fallbackError)}`},
        provider:'cloudflare-workers-ai',model:config.primary,fallbackModel:config.fallback
      },502);
    }
  }

  if(!outputBytes?.byteLength) return json({error:{code:'empty_output',message:'Workers AI tidak mengembalikan output gambar.'},provider:'cloudflare-workers-ai',model},502);
  const compositeSrc=`data:image/png;base64,${bufferToBase64(outputBytes.buffer.slice(outputBytes.byteOffset,outputBytes.byteOffset+outputBytes.byteLength))}`;

  return json({
    ok:true,
    provider:'cloudflare-workers-ai',
    model,
    fallbackModel:config.fallback,
    fallbackUsed,
    revision:'10.10B-strong-transform',
    generatedAt:new Date().toISOString(),
    promptVersion,
    preset,
    themeAdapter,
    generation:{width:config.width,height:config.height,steps:config.steps,strength:config.strength,guidance:config.guidance},
    compositeSrc,
    layers:[{id:'ai-transformed-base',role:'background',src:compositeSrc,depth:.02,transparent:false,transform:{x:50,y:50,width:'112%',opacity:1}}]
  });
}
