const OPENAI_IMAGES_EDIT_URL='https://api.openai.com/v1/images/edits';

function json(data,status=200,extraHeaders={}){
  return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...extraHeaders}});
}

function envModel(env){return env.OPENAI_IMAGE_MODEL||'gpt-image-2';}

export async function onRequestGet({env}){
  const configured=Boolean(env.OPENAI_API_KEY);
  return json({ok:true,configured,provider:'openai',model:envModel(env),message:configured?'Generative provider configured':'Set OPENAI_API_KEY in Cloudflare Pages environment variables'});
}

export async function onRequestPost({request,env}){
  if(!env.OPENAI_API_KEY){
    return json({error:{code:'provider_not_configured',message:'Generative provider belum dikonfigurasi. Tambahkan OPENAI_API_KEY di Cloudflare Pages environment variables.'}},503);
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
  if(image.size>20*1024*1024) return json({error:{code:'image_too_large',message:'Source image maksimal 20 MB.'}},413);

  const combinedPrompt=[positive,negative?`\n\nAVOID / NEGATIVE CONSTRAINTS:\n${negative}`:'',themeAdapter?`\n\nACTIVE THEME ADAPTER ID: ${themeAdapter}`:''].join('');
  const body=new FormData();
  body.append('model',envModel(env));
  body.append('image',image,image.name||'source.png');
  body.append('prompt',combinedPrompt);
  body.append('size',env.OPENAI_IMAGE_SIZE||'1024x1536');
  if(env.OPENAI_IMAGE_QUALITY) body.append('quality',env.OPENAI_IMAGE_QUALITY);
  if(env.OPENAI_IMAGE_INPUT_FIDELITY) body.append('input_fidelity',env.OPENAI_IMAGE_INPUT_FIDELITY);

  const upstream=await fetch(OPENAI_IMAGES_EDIT_URL,{method:'POST',headers:{authorization:`Bearer ${env.OPENAI_API_KEY}`},body});
  const requestId=upstream.headers.get('x-request-id')||'';
  const data=await upstream.json().catch(()=>({}));

  if(!upstream.ok){
    const message=data?.error?.message||`Image provider gagal (${upstream.status})`;
    return json({error:{code:data?.error?.code||'upstream_error',message},provider:'openai',model:envModel(env),requestId},upstream.status>=400&&upstream.status<600?upstream.status:502);
  }

  const first=data?.data?.[0]||{};
  let compositeSrc='';
  if(first.b64_json) compositeSrc=`data:image/png;base64,${first.b64_json}`;
  else if(first.url) compositeSrc=first.url;
  if(!compositeSrc) return json({error:{code:'empty_output',message:'Image provider tidak mengembalikan output gambar.'},provider:'openai',model:envModel(env),requestId},502);

  return json({ok:true,provider:'openai',model:envModel(env),requestId,promptVersion,preset,themeAdapter,compositeSrc,layers:[{id:'ai-transformed-base',role:'background',src:compositeSrc,depth:.02,transparent:false,transform:{x:50,y:50,width:'112%',opacity:1}}]});
}
