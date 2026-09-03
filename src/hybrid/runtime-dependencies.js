const CDN = Object.freeze({
  pixi:'https://cdn.jsdelivr.net/npm/pixi.js@8.20.0/dist/pixi.min.mjs',
  gsap:'https://esm.sh/gsap@3.15.0',
  konva:'https://esm.sh/konva@10.3.2',
  svg:'https://esm.sh/@svgdotjs/svg.js@3.2.8',
  lottie:'https://esm.sh/lottie-web@5.13.0',
  rive:'https://esm.sh/@rive-app/canvas@2.42.0'
});

const cache = new Map();

export const HYBRID_RUNTIME_VERSIONS = Object.freeze({
  pixi:'8.20.0', gsap:'3.15.0', konva:'10.3.2', svg:'3.2.8', lottie:'5.13.0', rive:'2.42.0'
});

export function getRuntimeURL(name){ return CDN[name] || ''; }

export async function loadRuntime(name){
  if(!CDN[name]) throw new Error(`Unknown hybrid runtime: ${name}`);
  if(!cache.has(name)){
    cache.set(name, import(CDN[name]).catch(error=>{
      cache.delete(name);
      throw new Error(`[Hybrid Runtime] ${name} failed to load: ${error?.message || error}`);
    }));
  }
  return cache.get(name);
}

export function runtimeStatus(){
  return Object.fromEntries(Object.keys(CDN).map(name=>[name,cache.has(name)?'requested':'idle']));
}
