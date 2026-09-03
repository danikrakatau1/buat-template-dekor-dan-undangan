import { WeddingVisualEngine } from './engine/core/engine.js';
import { createThemeProject, getThemePackOptions, getThemeSeedPrefix } from './themes/theme-packs.js';
import { createVariationSeed } from './themes/preset-rules.js';
import { generateAutoTemplate, summarizeGeneratedTemplate } from './generator/auto-template-generator.js';
import { VisualEditor } from './editor/visual-editor.js';
import { createVariationProject, summarizeVariation } from './variation/variation-system.js';

const scenes = ['Cover','Couple','Event','Story','Gallery','RSVP','Closing'];
const sceneList = document.querySelector('#scene-list');
const layerBrowser = document.querySelector('#layer-browser');
const previewFrame = document.querySelector('#preview-frame');
const previewRoot = document.querySelector('#engine-root');
const replayButton = document.querySelector('#replay-motion');
const autoCreateButton = document.querySelector('#auto-create-template');
const statusBadge = document.querySelector('#engine-status');
const presetSelect = document.querySelector('#preset-select');
const variationButton = document.querySelector('#generate-variation');
const seedValue = document.querySelector('#variation-seed');
const layoutValue = document.querySelector('#variation-layout');
const motionValue = document.querySelector('#variation-motion');
const atmosphereValue = document.querySelector('#variation-atmosphere');
const generatedScenesValue = document.querySelector('#generated-scenes');
const generatedLayersValue = document.querySelector('#generated-layers');
const generatorModeValue = document.querySelector('#generator-mode');

const editorEmpty = document.querySelector('#editor-empty');
const editorPanel = document.querySelector('#editor-panel');
const editorSelectedLayer = document.querySelector('#editor-selected-layer');
const editorContentField = document.querySelector('#editor-content-field');
const editorContent = document.querySelector('#editor-content');
const editorX = document.querySelector('#editor-x');
const editorY = document.querySelector('#editor-y');
const editorWidth = document.querySelector('#editor-width');
const editorOpacity = document.querySelector('#editor-opacity');
const editorScale = document.querySelector('#editor-scale');
const editorRotate = document.querySelector('#editor-rotate');
const editorMotion = document.querySelector('#editor-motion');
const editorReplay = document.querySelector('#editor-replay');
const editorCopyJSON = document.querySelector('#editor-copy-json');

const controlledVariationButton = document.querySelector('#create-controlled-variation');
const lockContent = document.querySelector('#lock-content');
const lockLayout = document.querySelector('#lock-layout');
const lockMotion = document.querySelector('#lock-motion');
const lockAssets = document.querySelector('#lock-assets');
const variationLockCount = document.querySelector('#variation-lock-count');
const variationSourceSeed = document.querySelector('#variation-source-seed');
const variationCurrentSeed = document.querySelector('#variation-current-seed');

const engine = new WeddingVisualEngine({ root: previewRoot });
window.weddingEngine = engine;
let currentSeed = 'JL-DEMO-001';
let currentProject = null;
let activeEditorScene = 'cover';
let renderQueued = false;

function getVariationLocks(){
  return {
    content:Boolean(lockContent?.checked),
    layout:Boolean(lockLayout?.checked),
    motion:Boolean(lockMotion?.checked),
    assets:Boolean(lockAssets?.checked)
  };
}

function updateVariationLockUI(){
  const locks = getVariationLocks();
  const count = Object.values(locks).filter(Boolean).length;
  if (variationLockCount) variationLockCount.textContent = `${count} locked`;
}

function updateInspector(project){
  const variation = project.variation || {};
  const summary = summarizeGeneratedTemplate(project);
  const variationSummary = summarizeVariation(project);
  if (seedValue) seedValue.textContent = project.project?.seed || '-';
  if (layoutValue) layoutValue.textContent = variation.layout || '-';
  if (motionValue) motionValue.textContent = variation.motion?.hero || '-';
  if (atmosphereValue) atmosphereValue.textContent = (variation.atmosphere || []).join(' · ') || '-';
  if (generatedScenesValue) generatedScenesValue.textContent = String(summary.scenes);
  if (generatedLayersValue) generatedLayersValue.textContent = String(summary.layers);
  if (generatorModeValue) generatorModeValue.textContent = project.variationSystem ? 'controlled-variation' : (project.generator?.mode || 'theme-preview');
  if (variationSourceSeed) variationSourceSeed.textContent = variationSummary.sourceSeed;
  if (variationCurrentSeed) variationCurrentSeed.textContent = variationSummary.seed;
  document.body.dataset.variationActive = project.variationSystem ? 'true' : 'false';
}

function markSelection(){
  previewRoot.querySelectorAll('[data-editor-selected]').forEach(el => delete el.dataset.editorSelected);
  const selection = editor.selection;
  if (!selection) return;
  const scene = previewRoot.querySelector(`[data-scene-id="${selection.sceneId}"]`);
  const layer = scene?.querySelector(`[data-layer-id="${selection.layerId}"]`);
  if (layer) layer.dataset.editorSelected = 'true';
}

function renderLayerBrowser(sceneId=activeEditorScene){
  activeEditorScene = sceneId;
  layerBrowser.replaceChildren();
  const layers = editor.getSceneLayers(sceneId);
  if (!layers.length) {
    const empty = document.createElement('div');
    empty.className = 'editor-empty';
    empty.textContent = 'Scene ini belum punya layer. Gunakan AUTO CREATE TEMPLATE untuk menghasilkan scene lengkap.';
    layerBrowser.appendChild(empty);
    return;
  }
  for (const layer of layers) {
    const button = document.createElement('button');
    button.type = 'button';
    button.classList.toggle('active', editor.selection?.sceneId === sceneId && editor.selection?.layerId === layer.id);
    button.innerHTML = `<span>${layer.id}</span><em>${layer.kind || 'layer'}</em>`;
    button.addEventListener('click', () => editor.select(sceneId, layer.id));
    layerBrowser.appendChild(button);
  }
}

function fillEditorFields(layer){
  const hasSelection = Boolean(layer);
  editorEmpty.hidden = hasSelection;
  editorPanel.hidden = !hasSelection;
  if (!layer) return;

  const transform = layer.transform || {};
  editorSelectedLayer.textContent = `${editor.selection.sceneId} / ${layer.id}`;
  const supportsContent = ['text','button'].includes(layer.kind);
  editorContentField.hidden = !supportsContent;
  editorContent.value = supportsContent ? (layer.content || '') : '';
  editorX.value = transform.x ?? 50;
  editorY.value = transform.y ?? 50;
  editorWidth.value = transform.width ?? '100%';
  editorOpacity.value = transform.opacity ?? 1;
  editorScale.value = transform.scale ?? 1;
  editorRotate.value = transform.rotate ?? 0;
  editorMotion.value = layer.motion?.preset || layer.motion?.type || 'fade-in';
}

function renderEditedProject(){
  if (renderQueued) return;
  renderQueued = true;
  requestAnimationFrame(() => {
    renderQueued = false;
    currentProject = editor.getProject();
    engine.mount(currentProject);
    updateInspector(currentProject);
    renderLayerBrowser(activeEditorScene);
    fillEditorFields(editor.getSelectedLayer());
    markSelection();
    statusBadge.textContent = 'Editor Updated';
    statusBadge.dataset.state = 'ready';
  });
}

const editor = new VisualEditor({
  onSelect: ({ layer, selection }) => {
    if (selection) activeEditorScene = selection.sceneId;
    fillEditorFields(layer);
    renderLayerBrowser(activeEditorScene);
    markSelection();
    statusBadge.textContent = layer ? 'Layer Selected' : 'Variation Ready';
  },
  onChange: renderEditedProject
});
window.weddingEditor = editor;

function mountProject(project, status='Variation Ready'){
  currentProject = editor.setProject(project);
  currentSeed = currentProject.project.seed;
  engine.mount(currentProject);
  previewRoot.scrollTop = 0;
  engine.decorMotion?.schedule();
  document.body.dataset.themePack = currentProject.project.preset;
  updateInspector(currentProject);
  editor.clearSelection();
  activeEditorScene = 'cover';
  renderLayerBrowser(activeEditorScene);
  statusBadge.textContent = status;
  statusBadge.dataset.state = 'ready';
  return currentProject;
}

function mountTheme(themeId, seed=currentSeed){
  return mountProject(createThemeProject(themeId, seed), 'Variation Ready');
}

function buildSceneNavigation(){
  sceneList.replaceChildren();
  scenes.forEach((name, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `scene-item${index === 0 ? ' active' : ''}`;
    button.dataset.sceneTarget = name.toLowerCase();
    button.textContent = `${String(index + 1).padStart(2, '0')}  ${name}`;
    button.addEventListener('click', () => {
      document.querySelectorAll('.scene-item').forEach(el => el.classList.remove('active'));
      button.classList.add('active');
      activeEditorScene = button.dataset.sceneTarget;
      renderLayerBrowser(activeEditorScene);
      previewRoot.querySelector(`[data-scene-id="${activeEditorScene}"]`)?.scrollIntoView({ behavior:'smooth', block:'start' });
    });
    sceneList.appendChild(button);
  });
}

function fillThemeOptions(){
  presetSelect.replaceChildren();
  for (const option of getThemePackOptions()) {
    const el = document.createElement('option');
    el.value = option.id;
    el.textContent = option.label;
    presetSelect.appendChild(el);
  }
}

function generateVariation(){
  const prefix = getThemeSeedPrefix(presetSelect.value);
  const seed = createVariationSeed(prefix);
  statusBadge.textContent = 'Generating Cover';
  statusBadge.dataset.state = 'loading';
  mountTheme(presetSelect.value, seed);
  variationButton.textContent = 'Variant Generated';
  setTimeout(() => variationButton.textContent = 'Generate Cover Variation', 1000);
}

function autoCreateTemplate(){
  const prefix = getThemeSeedPrefix(presetSelect.value);
  const seed = createVariationSeed(prefix);
  statusBadge.textContent = 'Auto Creating';
  statusBadge.dataset.state = 'loading';
  autoCreateButton.disabled = true;
  autoCreateButton.textContent = 'Generating…';
  try {
    const project = generateAutoTemplate({ themeId:presetSelect.value, seed });
    mountProject(project, 'Template Generated');
    engine.playIntro();
  } catch (error) {
    console.error('[Auto Template Generator]', error);
    statusBadge.textContent = 'Generator Error';
    statusBadge.dataset.state = 'error';
  } finally {
    autoCreateButton.disabled = false;
    autoCreateButton.textContent = 'AUTO CREATE TEMPLATE';
  }
}

function createControlledVariation(){
  if (!currentProject) return;
  const sourceProject = editor.getProject();
  const locks = getVariationLocks();
  controlledVariationButton.disabled = true;
  controlledVariationButton.textContent = 'CREATING VARIATION…';
  statusBadge.textContent = 'Preserving Edits';
  statusBadge.dataset.state = 'loading';
  try {
    const project = createVariationProject({
      project:sourceProject,
      themeId:presetSelect.value,
      locks
    });
    mountProject(project, 'Controlled Variation');
    engine.playIntro();
  } catch (error) {
    console.error('[Variation System]', error);
    statusBadge.textContent = 'Variation Error';
    statusBadge.dataset.state = 'error';
  } finally {
    controlledVariationButton.disabled = false;
    controlledVariationButton.textContent = 'CREATE CONTROLLED VARIATION';
  }
}

function updateSelectedFromControls(){
  const layer = editor.getSelectedLayer();
  if (!layer) return;
  editor.updateSelected({
    content:editorContent.value,
    transform:{
      x:editorX.value,
      y:editorY.value,
      width:editorWidth.value,
      opacity:editorOpacity.value,
      scale:editorScale.value,
      rotate:editorRotate.value
    },
    motion:{ preset:editorMotion.value }
  });
}

buildSceneNavigation();
fillThemeOptions();
updateVariationLockUI();

previewRoot.addEventListener('click', event => {
  const layerEl = event.target.closest?.('[data-layer-id]');
  const sceneEl = event.target.closest?.('[data-scene-id]');
  if (!layerEl || !sceneEl) return;
  event.preventDefault();
  event.stopPropagation();
  editor.select(sceneEl.dataset.sceneId, layerEl.dataset.layerId);
});

for (const input of [editorContent, editorX, editorY, editorWidth, editorOpacity, editorScale, editorRotate, editorMotion]) {
  input?.addEventListener(input.tagName === 'SELECT' ? 'change' : 'input', updateSelectedFromControls);
}

for (const lock of [lockContent, lockLayout, lockMotion, lockAssets]) {
  lock?.addEventListener('change', updateVariationLockUI);
}

controlledVariationButton?.addEventListener('click', createControlledVariation);

editorReplay?.addEventListener('click', () => {
  const selection = editor.selection;
  if (!selection) return;
  const scope = previewRoot.querySelector(`[data-scene-id="${selection.sceneId}"] [data-layer-id="${selection.layerId}"]`);
  if (scope) engine.motion?.replay(scope.parentElement || scope);
});

editorCopyJSON?.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(editor.exportJSON());
    editorCopyJSON.textContent = 'JSON Copied';
    setTimeout(() => editorCopyJSON.textContent = 'Copy Project JSON', 1100);
  } catch {
    statusBadge.textContent = 'Clipboard Blocked';
  }
});

document.querySelectorAll('[data-device]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-device]').forEach(el => el.classList.remove('active'));
    button.classList.add('active');
    previewFrame.className = `preview-frame ${button.dataset.device}`;
    engine.decorMotion?.schedule();
  });
});

presetSelect.addEventListener('change', () => {
  const prefix = getThemeSeedPrefix(presetSelect.value);
  currentSeed = `${prefix}-DEMO-001`;
  mountTheme(presetSelect.value, currentSeed);
});
variationButton?.addEventListener('click', generateVariation);
autoCreateButton?.addEventListener('click', autoCreateTemplate);
replayButton?.addEventListener('click', () => {
  engine.playIntro();
  replayButton.textContent = 'Replaying…';
  setTimeout(() => replayButton.textContent = 'Replay Motion', 1400);
});

engine.bus.on('engine:ready', ({ project }) => {
  document.querySelector('.brand-wrap span').textContent = project.variationSystem
    ? `Variation System V1 · ${project.project?.preset || 'custom'}`
    : `Variation Ready · ${project.project?.preset || 'custom'}`;
});
engine.bus.on('scene:enter', ({ sceneId }) => {
  document.querySelectorAll('.scene-item').forEach(el => el.classList.toggle('active', el.dataset.sceneTarget === sceneId));
});
engine.bus.on('timeline:step', step => {
  statusBadge.textContent = step.label || step.action || `Timeline ${step.at || 0}ms`;
  setTimeout(() => statusBadge.textContent = currentProject?.variationSystem ? 'Controlled Variation' : 'Variation Ready', 900);
});
engine.bus.on('motion:replay', () => { statusBadge.textContent = 'Motion Replay'; });

try {
  presetSelect.value = 'jawa-luxury';
  mountTheme('jawa-luxury', currentSeed);
} catch (error) {
  console.error('[Wedding Visual Engine]', error);
  statusBadge.textContent = 'Engine Error';
  statusBadge.dataset.state = 'error';
  previewRoot.innerHTML = `<div class="engine-error"><strong>Preview gagal dimuat.</strong><span>${error.message}</span></div>`;
}

console.info('[Wedding Template Studio] Stage #11 Variation System booting.');
