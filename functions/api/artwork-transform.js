const PRIMARY_MODEL='@cf/black-forest-labs/flux-2-klein-9b';
const FALLBACK_MODEL='@cf/black-forest-labs/flux-2-klein-4b';
const REVISION='10.10K-source-fidelity-lock';

function json(data,status=200,extraHeaders={}){
  return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...extraHeaders}});
}
function numberEnv(value,fallback,min,max){const parsed=Number(value);return Number.isFinite(parsed)?Math.max(min,Math.min(max,parsed)):fallback;}
function modelConfig(env){
  return {
    primary:env.WORKERS_AI_IMAGE_MODEL||PRIMARY_MODEL,
    fallback:env.WORKERS_AI_FALLBACK_MODEL??FALLBACK_MODEL,
    width:Math.round(numberEnv(env.WORKERS_AI_IMAGE_WIDTH,1024,256,1920)/64)*64,
    height:Math.round(numberEnv(env.WORKERS_AI_IMAGE_HEIGHT,1792,256,1920)/64)*64,
    guidance:numberEnv(env.WORKERS_AI_IMAGE_GUIDANCE,3.2,1,20)
  };
}

function buildEditPrompt(positive,negative){
  return `${positive}\n\nSOURCE FIDELITY LOCK — MANDATORY:\ninput_image_0 is the geometry contract. Perform STYLE TRANSFORMATION ONLY. Keep the same primary subject, same silhouette, same camera/viewpoint, same crop relationship, same horizon, same perspective, same object count, same object placement and same large negative-space regions. Do not redesign the scene. Do not invent a new wedding composition. Do not replace the landmark, mountain, building, person, tree line, water line, road or background with a different subject. Do not move a major subject to another area of the frame.\n\nARTWORK-ONLY RULE:\nConvert the existing visible pixels into refined antique engraved / etched / cross-hatched artwork with warm ivory paper character, restrained sepia-brown/olive/burgundy accents and fine print texture. This must look visibly illustrated rather than photographic, but geometry must remain recognizable.\n\nNO GENERATED DECOR RULE:\nDo NOT add a floral border, botanical frame, carved arch, gunungan, joglo, decorative corner, wreath, ribbon, stationery border or extra flowers unless that exact structural element already exists in the source image. Decorative framing, cultural ornaments, typography and CTA are added later by the Studio as separate native layers.\n\nTEXTLESS RULE:\nAbsolutely no letters, words, signs, handwriting, calligraphy, typography, labels, logos, watermarks, pseudo-text or readable characters anywhere in the generated artwork. Any sign or text-bearing surface from the source should become blank engraved texture while preserving its shape.\n\nSUCCESS CRITERIA:\nA viewer must immediately recognize this as the SAME source scene and SAME composition, only redrawn in premium vintage engraving language.\n${negative?`\nAVOID / NEGATIVE CONSTRAINTS:\n${negative}, new composition, new border, new frame, added flowers, added ornaments, changed camera angle, changed crop, changed horizon, replaced landmark, invented architecture, invented mountain, generated text, pseudo-text`:''}`;
}

async function runFluxReference(env,model,{image,prompt,width,height,guidance}){
  if(!env.AI?.run) throw new Error('Workers AI binding AI is not configured');
  const form=new FormData();
  form.append('input_image_0',image,image.name||'reference.png');
  form.append('prompt',prompt);
  form.append('width',String(width));
  form.append('height',String(height));
  form.append('guidance',String(guidance));
  const serialized=new Response(form);
  const contentType=serialized.headers.get('content-type');
  if(!serialized.body||!contentType) throw new Error('Could not serialize FLUX multipart request');
  return env.AI.run(model,{multipart:{body:serialized.body,contentType}});
}

function resultImageBase64(result){
  if(typeof result?.image==='string'&&result.image) return result.image.replace(/^data:image\/\w+;base64,/, '');
  if(typeof result?.result?.image==='string'&&result.result.image) return result.result.image.replace(/^data:image\/\w+;base64,/, '');
  return '';
}

export async function onRequestGet({env}){
  const config=modelConfig(env);
  const configured=Boolean(env.AI?.run);
  return json({ok:true,configured,provider:'cloudflare-workers-ai',model:config.primary,fallbackModel:config.fallback||'',mode:'reference-edit-source-fidelity',generation:{width:config.width,height:config.height,guidance:config.guidance,steps:4,inputTransport:'multipart/input_image_0'},revision:REVISION,message:configured?'Workers AI binding active · source fidelity lock enabled':'Add a Workers AI binding named AI to this Cloudflare Pages project'});
}

export async function onRequestPost({request,env}){
  if(!env.AI?.run) return json({error:{code:'workers_ai_binding_missing',message:'Workers AI binding belum aktif. Tambahkan binding Workers AI dengan nama AI di Cloudflare Pages project.'},provider:'cloudflare-workers-ai'},503);
  let incoming;
  try{incoming=await request.formData();}catch{return json({error:{code:'invalid_form',message:'Request harus multipart/form-data.'}},400);}
  const image=incoming.get('image');
  const positive=String(incoming.get('prompt')||'').trim();
  const negative=String(incoming.get('negative_prompt')||'').trim();
  const promptVersion=String(incoming.get('prompt_version')||'MASTER-TRANSFORM-PROMPT-V1');
  const themeAdapter=String(incoming.get('theme_adapter')||'');
  const preset=String(incoming.get('preset')||'');
  const referenceWidth=Number(incoming.get('reference_width')||0);
  const referenceHeight=Number(incoming.get('reference_height')||0);
  const referenceResized=String(incoming.get('reference_resized')||'false')==='true';
  if(!(image instanceof File)||!image.size) return json({error:{code:'missing_image',message:'Source image wajib dikirim.'}},400);
  if(!positive) return json({error:{code:'missing_prompt',message:'Master transform prompt kosong.'}},400);
  if(referenceWidth>=512||referenceHeight>=512) return json({error:{code:'reference_too_large',message:'FLUX reference image harus lebih kecil dari 512×512. Client resize belum diterapkan dengan benar.',referenceWidth,referenceHeight}},400);

  const config=modelConfig(env);
  const prompt=buildEditPrompt(positive,negative);
  let result,model=config.primary,fallbackUsed=false,primaryError='';
  try{result=await runFluxReference(env,config.primary,{image,prompt,width:config.width,height:config.height,guidance:config.guidance});}
  catch(error){
    primaryError=error?.message||String(error);
    if(!config.fallback||config.fallback===config.primary) return json({error:{code:'workers_ai_error',message:`Primary gagal: ${primaryError}`},provider:'cloudflare-workers-ai',model:config.primary,revision:REVISION},502);
    try{model=config.fallback;result=await runFluxReference(env,config.fallback,{image,prompt,width:config.width,height:config.height,guidance:config.guidance});fallbackUsed=true;}
    catch(fallbackError){return json({error:{code:'workers_ai_error',message:`Primary gagal: ${primaryError}. Fallback gagal: ${fallbackError?.message||String(fallbackError)}`},provider:'cloudflare-workers-ai',model:config.primary,fallbackModel:config.fallback,revision:REVISION},502);}
  }

  const b64=resultImageBase64(result);
  if(!b64) return json({error:{code:'empty_output',message:'FLUX Workers AI tidak mengembalikan field image base64 yang diharapkan.'},provider:'cloudflare-workers-ai',model,revision:REVISION},502);
  const compositeSrc=`data:image/png;base64,${b64}`;
  return json({ok:true,provider:'cloudflare-workers-ai',model,fallbackModel:config.fallback||'',fallbackUsed,revision:REVISION,generatedAt:new Date().toISOString(),promptVersion,preset,themeAdapter,reference:{width:referenceWidth,height:referenceHeight,resized:referenceResized},generation:{width:config.width,height:config.height,guidance:config.guidance,steps:4,inputTransport:'multipart/input_image_0',sourceFidelityLock:true,artworkOnly:true,textless:true},compositeSrc,layers:[{id:'ai-transformed-base',role:'background',src:compositeSrc,depth:.02,transparent:false,transform:{x:50,y:50,width:'100%',opacity:1}}]});
}
