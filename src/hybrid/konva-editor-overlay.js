import { loadRuntime } from './runtime-dependencies.js';

export class KonvaEditorOverlay {
  constructor(){ this.stage=null; this.layer=null; this.rect=null; this.host=null; this.observer=null; this.resizeObserver=null; }

  async mount(host){
    this.destroy();
    this.host=host;
    const module=await loadRuntime('konva');
    const Konva=module.default || module;
    const container=document.createElement('div');
    container.className='konva-editor-overlay';
    host.appendChild(container);
    this.stage=new Konva.Stage({container,width:host.clientWidth,height:host.clientHeight});
    this.layer=new Konva.Layer();
    this.rect=new Konva.Rect({x:0,y:0,width:0,height:0,stroke:'#d6b26e',strokeWidth:1.4,dash:[7,5],cornerRadius:8,visible:false,listening:false});
    this.layer.add(this.rect); this.stage.add(this.layer);
    const sync=()=>this.syncSelection();
    this.observer=new MutationObserver(sync);
    this.observer.observe(host,{subtree:true,attributes:true,attributeFilter:['data-editor-selected','style','class']});
    this.resizeObserver=new ResizeObserver(()=>{ this.stage.size({width:host.clientWidth,height:host.clientHeight}); sync(); });
    this.resizeObserver.observe(host);
    sync();
    return {backend:'konva-overlay'};
  }

  syncSelection(){
    if(!this.host || !this.rect) return;
    const selected=this.host.querySelector('[data-editor-selected="true"]');
    if(!selected){ this.rect.visible(false); this.layer.batchDraw(); return; }
    const hostRect=this.host.getBoundingClientRect(), rect=selected.getBoundingClientRect();
    this.rect.setAttrs({x:rect.left-hostRect.left,y:rect.top-hostRect.top,width:rect.width,height:rect.height,visible:true});
    this.layer.batchDraw();
  }

  destroy(){
    this.observer?.disconnect(); this.resizeObserver?.disconnect(); this.stage?.destroy();
    this.host?.querySelector('.konva-editor-overlay')?.remove();
    this.stage=null; this.layer=null; this.rect=null; this.host=null; this.observer=null; this.resizeObserver=null;
  }
}
