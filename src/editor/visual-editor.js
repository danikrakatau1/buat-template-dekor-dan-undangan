function clone(value){
  return typeof structuredClone === 'function'
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));
}

function numberOr(value, fallback){
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export class VisualEditor {
  constructor({ onChange, onSelect }={}){
    this.project = null;
    this.selection = null;
    this.onChange = onChange || (()=>{});
    this.onSelect = onSelect || (()=>{});
  }

  setProject(project){
    this.project = clone(project);
    if (this.selection && !this.getSelectedLayer()) this.selection = null;
    return this.project;
  }

  getProject(){
    return this.project;
  }

  getScene(sceneId){
    return this.project?.scenes?.find(scene => scene.id === sceneId) || null;
  }

  getLayer(sceneId, layerId){
    return this.getScene(sceneId)?.layers?.find(layer => layer.id === layerId) || null;
  }

  getSelectedLayer(){
    if (!this.selection) return null;
    return this.getLayer(this.selection.sceneId, this.selection.layerId);
  }

  select(sceneId, layerId){
    const layer = this.getLayer(sceneId, layerId);
    this.selection = layer ? { sceneId, layerId } : null;
    this.onSelect({ selection:this.selection, layer, project:this.project });
    return layer;
  }

  clearSelection(){
    this.selection = null;
    this.onSelect({ selection:null, layer:null, project:this.project });
  }

  updateSelected(patch={}){
    const layer = this.getSelectedLayer();
    if (!layer) return null;

    if ('content' in patch && ['text','button'].includes(layer.kind)) {
      layer.content = String(patch.content ?? '');
    }

    if (patch.transform) {
      layer.transform = { ...(layer.transform || {}) };
      for (const key of ['x','y','opacity','scale','rotate','depth']) {
        if (patch.transform[key] !== undefined) {
          layer.transform[key] = numberOr(patch.transform[key], layer.transform[key] ?? 0);
        }
      }
      if (patch.transform.width !== undefined) {
        const raw = String(patch.transform.width).trim();
        layer.transform.width = raw.endsWith('%') || raw.endsWith('px') ? raw : `${numberOr(raw, 100)}%`;
      }
    }

    if (patch.motion) {
      layer.motion = { ...(layer.motion || {}), ...patch.motion };
    }

    this.onChange({ project:this.project, selection:this.selection, layer });
    return layer;
  }

  getSceneLayers(sceneId){
    return this.getScene(sceneId)?.layers || [];
  }

  exportJSON(spaces=2){
    return JSON.stringify(this.project, null, spaces);
  }
}
