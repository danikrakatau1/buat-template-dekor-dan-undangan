import { loadRuntime } from './runtime-dependencies.js';

const ROLE_ORDER = Object.freeze({
  base:0, background:10, 'environment-back':20, 'ornament-back':30, hero:40,
  content:50, 'ornament-front':60, 'foreground-floral':70, 'atmosphere-front':80, 'ui-fx':90
});

function numeric(value,fallback=0){ const n=Number(value); return Number.isFinite(n)?n:fallback; }
function percentWidth(value){
  if(typeof value==='number') return value;
  const match=String(value ?? '100%').match(/-?\d+(?:\.\d+)?/);
  return match ? numeric(match[0],100) : 100;
}
function sceneImageLayers(scene){
  return (scene.layers || []).map((layer,index)=>({layer,index})).filter(item=>{
    const asset=item.layer.asset || {};
    return item.layer.kind==='image' && (asset.resolvedSrc || asset.src || item.layer.src || asset.fallbackSrc);
  }).sort((a,b)=>{
    const az=ROLE_ORDER[a.layer.role] ?? 50, bz=ROLE_ORDER[b.layer.role] ?? 50;
    return az===bz ? a.index-b.index : az-bz;
  });
}
function sourceCandidates(layer){
  const asset=layer.asset || {};
  const list=[];
  const push=value=>{ if(value && !list.includes(value)) list.push(value); };
  push(asset.resolvedSrc);
  if(asset.productionSrc && asset.src===asset.productionSrc) push(asset.productionSrc);
  push(asset.src || layer.src);
  push(asset.fallbackSrc);
  return list;
}

export class PixiFidelityRenderer {
  constructor(){
    this.app=null; this.host=null; this.scene=null; this.records=[]; this.failedLayers=[]; this.resizeObserver=null;
    this.pointerHandler=null; this.pointerLeaveHandler=null; this.gsap=null; this.PIXI=null; this.pointer={x:0,y:0}; this.frame=0;
  }

  async mount(scene,host){
    this.destroy();
    this.scene=scene; this.host=host; this.failedLayers=[];
    const [PIXI,gsapModule]=await Promise.all([loadRuntime('pixi'),loadRuntime('gsap')]);
    this.PIXI=PIXI;
    this.gsap=gsapModule.gsap || gsapModule.default || gsapModule;
    const app=new PIXI.Application();
    await app.init({ resizeTo:host, preference:'webgl', backgroundAlpha:0, antialias:true, autoDensity:true, resolution:Math.min(globalThis.devicePixelRatio || 1,2) });
    this.app=app;
    app.canvas.className='gpu-fidelity-canvas';
    app.canvas.setAttribute('aria-hidden','true');
    host.prepend(app.canvas);

    for(const {layer} of sceneImageLayers(scene)) await this.addLayer(layer);
    this.layout();
    this.bindParallax();
    this.resizeObserver=new ResizeObserver(()=>this.layout());
    this.resizeObserver.observe(host);
    host.dataset.gpuRenderer='pixi-webgl';
    host.dataset.gpuLayers=String(this.records.length);
    host.dataset.gpuFallbackLayers=String(this.failedLayers.length);
    return { layers:this.records.length, failed:this.failedLayers.length, failedIds:[...this.failedLayers], backend:'pixi-webgl' };
  }

  async loadTexture(layer){
    let lastError=null;
    for(const src of sourceCandidates(layer)){
      try{
        const texture=await this.PIXI.Assets.load(src);
        if(texture) return {texture,src};
      }catch(error){ lastError=error; }
    }
    throw lastError || new Error(`No usable artwork source for ${layer.id}`);
  }

  async addLayer(layer){
    try{
      const {texture,src}=await this.loadTexture(layer);
      const anchor=new this.PIXI.Container();
      const sprite=new this.PIXI.Sprite(texture);
      sprite.anchor.set(.5);
      anchor.addChild(sprite);
      anchor.label=layer.id;
      this.app.stage.addChild(anchor);
      const record={layer,anchor,sprite,source:src,baseX:0,baseY:0,baseScale:1};
      this.records.push(record);
      this.applyMaterial(record);
      this.applyMotion(record);
      const proxy=this.host.querySelector(`[data-layer-id="${CSS.escape(layer.id)}"]`);
      if(proxy){ proxy.classList.add('gpu-backed-proxy'); proxy.dataset.gpuSource=src===layer.asset?.productionSrc?'production':'active'; }
    }catch(error){
      this.failedLayers.push(layer.id);
      console.warn('[Pixi Fidelity] keeping DOM fallback for',layer.id,error);
    }
  }

  applyMaterial(record){
    const {layer,sprite}=record;
    const id=layer.id || '';
    if(/landscape|tree-frame|joglo/.test(id)) sprite.blendMode='multiply';
    if(/haze/.test(id)) sprite.blendMode='screen';
    sprite.alpha=numeric(layer.transform?.opacity,1);
  }

  layout(){
    if(!this.app || !this.host) return;
    const w=Math.max(1,this.host.clientWidth), h=Math.max(1,this.host.clientHeight);
    for(const record of this.records){
      const {layer,anchor,sprite}=record;
      const t=layer.transform || {};
      const x=w*numeric(t.x,50)/100, y=h*numeric(t.y,50)/100;
      const wanted=w*percentWidth(t.width)/100;
      const scale=(sprite.texture?.width ? wanted/sprite.texture.width : 1)*numeric(t.scale,1);
      record.baseX=x; record.baseY=y; record.baseScale=scale;
      anchor.position.set(x,y);
      sprite.scale.set(scale);
      sprite.rotation=numeric(t.rotate,0)*Math.PI/180;
      sprite.alpha=numeric(t.opacity,1);
    }
  }

  applyMotion(record){
    if(matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const {sprite,layer}=record, motion=layer.motion || {}, type=motion.decorMotion;
    const duration=Math.max(4,numeric(motion.decorDurationMs,16000)/1000);
    if(type==='sway') this.gsap.to(sprite,{rotation:'+=0.012',duration:duration/2,yoyo:true,repeat:-1,ease:'sine.inOut'});
    else if(type==='breathe') this.gsap.to(sprite.scale,{x:'*=1.012',y:'*=1.012',duration:duration/2,yoyo:true,repeat:-1,ease:'sine.inOut'});
    else if(type==='float') this.gsap.to(sprite,{y:'-=5',duration:duration/2,yoyo:true,repeat:-1,ease:'sine.inOut'});
    else if(type==='drift') this.gsap.to(sprite,{x:'+=6',duration:duration/2,yoyo:true,repeat:-1,ease:'sine.inOut'});
  }

  bindParallax(){
    if(!this.host) return;
    this.pointerHandler=event=>{
      const rect=this.host.getBoundingClientRect();
      this.pointer.x=((event.clientX-rect.left)/Math.max(1,rect.width)-.5);
      this.pointer.y=((event.clientY-rect.top)/Math.max(1,rect.height)-.5);
      if(this.frame) return;
      this.frame=requestAnimationFrame(()=>{
        this.frame=0;
        for(const record of this.records){
          const depth=numeric(record.layer.motion?.parallax ?? record.layer.transform?.depth,0);
          record.anchor.x=record.baseX+this.pointer.x*depth*34;
          record.anchor.y=record.baseY+this.pointer.y*depth*24;
        }
      });
    };
    this.pointerLeaveHandler=()=>{
      this.pointer={x:0,y:0};
      for(const r of this.records){ r.anchor.x=r.baseX; r.anchor.y=r.baseY; }
    };
    this.host.addEventListener('pointermove',this.pointerHandler,{passive:true});
    this.host.addEventListener('pointerleave',this.pointerLeaveHandler,{passive:true});
  }

  destroy(){
    if(this.frame) cancelAnimationFrame(this.frame);
    this.gsap?.killTweensOf?.(this.records.flatMap(r=>[r.sprite,r.sprite?.scale]));
    this.resizeObserver?.disconnect();
    if(this.host && this.pointerHandler) this.host.removeEventListener('pointermove',this.pointerHandler);
    if(this.host && this.pointerLeaveHandler) this.host.removeEventListener('pointerleave',this.pointerLeaveHandler);
    this.host?.querySelectorAll('.gpu-backed-proxy').forEach(el=>{el.classList.remove('gpu-backed-proxy');delete el.dataset.gpuSource;});
    this.app?.destroy?.(true,{children:true,texture:false});
    this.app=null; this.host=null; this.scene=null; this.records=[]; this.failedLayers=[]; this.resizeObserver=null;
    this.pointerHandler=null; this.pointerLeaveHandler=null; this.PIXI=null; this.gsap=null;
  }
}
