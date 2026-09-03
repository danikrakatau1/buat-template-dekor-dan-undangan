function clone(value){
  return typeof structuredClone === 'function'
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));
}

function safeFilePart(value='wedding-template'){
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g,'-')
    .replace(/^-+|-+$/g,'') || 'wedding-template';
}

function escapeHTML(value=''){
  return String(value)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#039;');
}

function downloadBlob(filename, content, type='application/octet-stream'){
  const blob = content instanceof Blob ? content : new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function validateProject(project){
  const errors = [];
  const warnings = [];
  if (!project || typeof project !== 'object') errors.push('Project must be an object.');
  if (!project?.project?.id) errors.push('Missing project.id.');
  if (!project?.project?.preset) warnings.push('Missing project preset.');
  if (!Array.isArray(project?.scenes) || !project.scenes.length) errors.push('Project must contain at least one scene.');

  const sceneIds = new Set();
  for (const [sceneIndex, scene] of (project?.scenes || []).entries()) {
    if (!scene?.id) errors.push(`Scene ${sceneIndex + 1} has no id.`);
    if (scene?.id && sceneIds.has(scene.id)) errors.push(`Duplicate scene id: ${scene.id}.`);
    if (scene?.id) sceneIds.add(scene.id);
    if (!Array.isArray(scene?.layers)) warnings.push(`Scene ${scene?.id || sceneIndex + 1} has no layers array.`);

    const layerIds = new Set();
    for (const [layerIndex, layer] of (scene?.layers || []).entries()) {
      if (!layer?.id) errors.push(`Scene ${scene?.id || sceneIndex + 1}, layer ${layerIndex + 1} has no id.`);
      if (layer?.id && layerIds.has(layer.id)) errors.push(`Duplicate layer id in ${scene.id}: ${layer.id}.`);
      if (layer?.id) layerIds.add(layer.id);
      if (!layer?.kind) warnings.push(`Layer ${layer?.id || layerIndex + 1} has no kind.`);
      const opacity = layer?.transform?.opacity;
      if (opacity != null && (!Number.isFinite(Number(opacity)) || Number(opacity) < 0 || Number(opacity) > 1)) {
        errors.push(`Layer ${layer.id} opacity must be between 0 and 1.`);
      }
    }
  }

  return {
    ok:errors.length === 0,
    errors,
    warnings,
    sceneCount:project?.scenes?.length || 0,
    layerCount:(project?.scenes || []).reduce((sum,scene) => sum + (scene?.layers?.length || 0),0)
  };
}

export function createProductionSnapshot(project){
  const snapshot = clone(project);
  const validation = validateProject(snapshot);
  if (!validation.ok) {
    const error = new Error(`Production validation failed: ${validation.errors.join(' ')}`);
    error.validation = validation;
    throw error;
  }

  snapshot.project = {
    ...snapshot.project,
    exportVersion:'1.0.0',
    exportedAt:new Date().toISOString(),
    productionReady:true
  };
  snapshot.production = {
    version:'1.0.0',
    validated:true,
    sceneCount:validation.sceneCount,
    layerCount:validation.layerCount,
    warnings:validation.warnings
  };
  return snapshot;
}

export function exportProjectJSON(project){
  const snapshot = createProductionSnapshot(project);
  const filename = `${safeFilePart(snapshot.project?.name || snapshot.project?.id)}.project.json`;
  downloadBlob(filename, JSON.stringify(snapshot,null,2), 'application/json;charset=utf-8');
  return { filename, snapshot };
}

export function createRunnableHTML(project, { engineBaseURL }={}){
  const snapshot = createProductionSnapshot(project);
  const base = String(engineBaseURL || globalThis.location?.origin || '').replace(/\/$/,'');
  if (!base || !/^https?:\/\//i.test(base)) throw new Error('Runnable export requires an http(s) engine base URL.');
  const serialized = JSON.stringify(snapshot).replaceAll('<','\\u003c');
  const title = escapeHTML(snapshot.project?.name || 'Wedding Invitation');
  return `<!doctype html>
<html lang="id">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
<meta name="theme-color" content="#080b12" />
<title>${title}</title>
<link rel="stylesheet" href="${base}/src/styles.css" />
<link rel="stylesheet" href="${base}/src/stage4.css" />
<link rel="stylesheet" href="${base}/src/stage5.css" />
<link rel="stylesheet" href="${base}/src/stage6.css" />
<link rel="stylesheet" href="${base}/src/stage7.css" />
</head>
<body style="margin:0;background:#080b12">
<main id="engine-root" class="engine-root" style="width:100%;height:100dvh;overflow:auto"></main>
<script type="module">
import { WeddingVisualEngine } from '${base}/src/engine/core/engine.js';
const project = ${serialized};
const root = document.querySelector('#engine-root');
try {
  const engine = new WeddingVisualEngine({ root });
  engine.mount(project);
  engine.playIntro();
  window.weddingEngine = engine;
} catch (error) {
  const box = document.createElement('pre');
  box.style.cssText='padding:24px;color:#fff;white-space:pre-wrap;font:14px/1.5 system-ui';
  box.textContent='Invitation failed to start: ' + (error?.message || error);
  root.replaceChildren(box);
}
</script>
</body>
</html>`;
}

export function exportRunnableHTML(project, options={}){
  const snapshot = createProductionSnapshot(project);
  const html = createRunnableHTML(snapshot, options);
  const filename = `${safeFilePart(snapshot.project?.name || snapshot.project?.id)}.html`;
  downloadBlob(filename, html, 'text/html;charset=utf-8');
  return { filename, snapshot };
}

export function getProductionReport(project){
  const validation = validateProject(project);
  return {
    ...validation,
    status:validation.ok ? (validation.warnings.length ? 'READY WITH WARNINGS' : 'PRODUCTION READY') : 'BLOCKED',
    checkedAt:new Date().toISOString()
  };
}
