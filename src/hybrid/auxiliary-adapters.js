import { loadRuntime } from './runtime-dependencies.js';

export async function mountSvgEditableLayer(layer,host){
  if(layer.kind!=='svg-live' || !layer.asset?.src) return null;
  const { SVG }=await loadRuntime('svg');
  const wrap=document.createElement('div'); wrap.className='aux-vector-layer'; wrap.dataset.layerId=layer.id;
  host.appendChild(wrap);
  const draw=SVG().addTo(wrap).size('100%','100%');
  const text=await fetch(layer.asset.src).then(r=>r.text());
  draw.svg(text);
  return {type:'svg',destroy:()=>wrap.remove()};
}

export async function mountLottieLayer(layer,host){
  if(layer.kind!=='lottie' || !layer.asset?.src) return null;
  const mod=await loadRuntime('lottie');
  const lottie=mod.default || mod;
  const wrap=document.createElement('div'); wrap.className='aux-motion-layer'; wrap.dataset.layerId=layer.id; host.appendChild(wrap);
  const animation=lottie.loadAnimation({container:wrap,renderer:'svg',loop:layer.loop!==false,autoplay:layer.autoplay!==false,path:layer.asset.src});
  return {type:'lottie',destroy:()=>{ animation.destroy(); wrap.remove(); }};
}

export async function mountRiveLayer(layer,host){
  if(layer.kind!=='rive' || !layer.asset?.src) return null;
  const mod=await loadRuntime('rive');
  const canvas=document.createElement('canvas'); canvas.className='aux-motion-layer'; canvas.dataset.layerId=layer.id; host.appendChild(canvas);
  const Rive=mod.Rive || mod.default?.Rive;
  if(!Rive){ canvas.remove(); throw new Error('Rive runtime did not expose Rive'); }
  const rive=new Rive({src:layer.asset.src,canvas,autoplay:layer.autoplay!==false,stateMachines:layer.stateMachine || undefined,onLoad:()=>rive.resizeDrawingSurfaceToCanvas?.()});
  return {type:'rive',destroy:()=>{ rive.cleanup?.(); canvas.remove(); }};
}

export async function mountAuxiliaryLayers(scene,host){
  const mounts=[];
  for(const layer of scene.layers || []){
    try{
      const mounted=await mountSvgEditableLayer(layer,host) || await mountLottieLayer(layer,host) || await mountRiveLayer(layer,host);
      if(mounted) mounts.push(mounted);
    }catch(error){ console.warn('[Hybrid Auxiliary]',layer.id,error); }
  }
  return {count:mounts.length,destroy:()=>mounts.forEach(item=>item.destroy?.())};
}
