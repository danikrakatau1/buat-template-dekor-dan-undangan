import { WeddingVisualEngine } from './engine/core/engine.js';
import { createThemeProject, getThemePackOptions, getThemeSeedPrefix } from './themes/theme-packs.js';
import { createVariationSeed } from './themes/preset-rules.js';
import { generateAutoTemplate, summarizeGeneratedTemplate } from './generator/auto-template-generator.js';

const scenes = ['Cover','Couple','Event','Story','Gallery','RSVP','Closing'];
const sceneList = document.querySelector('#scene-list');
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

const engine = new WeddingVisualEngine({ root: previewRoot });
window.weddingEngine = engine;
let currentSeed = 'JL-DEMO-001';
let currentProject = null;

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
      previewRoot.querySelector(`[data-scene-id="${button.dataset.sceneTarget}"]`)?.scrollIntoView({ behavior:'smooth', block:'start' });
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

function updateInspector(project){
  const variation = project.variation || {};
  const summary = summarizeGeneratedTemplate(project);
  if (seedValue) seedValue.textContent = project.project?.seed || '-';
  if (layoutValue) layoutValue.textContent = variation.layout || '-';
  if (motionValue) motionValue.textContent = variation.motion?.hero || '-';
  if (atmosphereValue) atmosphereValue.textContent = (variation.atmosphere || []).join(' · ') || '-';
  if (generatedScenesValue) generatedScenesValue.textContent = String(summary.scenes);
  if (generatedLayersValue) generatedLayersValue.textContent = String(summary.layers);
  if (generatorModeValue) generatorModeValue.textContent = project.generator?.mode || 'theme-preview';
}

function mountProject(project, status='Generator Ready'){
  currentProject = project;
  currentSeed = project.project.seed;
  engine.mount(project);
  previewRoot.scrollTop = 0;
  engine.decorMotion?.schedule();
  document.body.dataset.themePack = project.project.preset;
  updateInspector(project);
  statusBadge.textContent = status;
  statusBadge.dataset.state = 'ready';
  return project;
}

function mountTheme(themeId, seed=currentSeed){
  return mountProject(createThemeProject(themeId, seed), 'Rules Ready');
}

function generateVariation(){
  const prefix = getThemeSeedPrefix(presetSelect.value);
  const seed = createVariationSeed(prefix);
  statusBadge.textContent = 'Generating Variant';
  statusBadge.dataset.state = 'loading';
  mountTheme(presetSelect.value, seed);
  variationButton.textContent = 'Variant Generated';
  setTimeout(() => variationButton.textContent = 'Generate Variation', 1000);
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
    autoCreateButton.textContent = 'AUTO CREATE TEMPLATE';
    engine.playIntro();
  } catch (error) {
    console.error('[Auto Template Generator]', error);
    statusBadge.textContent = 'Generator Error';
    statusBadge.dataset.state = 'error';
  } finally {
    autoCreateButton.disabled = false;
  }
}

buildSceneNavigation();
fillThemeOptions();

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
  statusBadge.textContent = 'Switching Theme';
  statusBadge.dataset.state = 'loading';
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
  const generated = project.generator?.mode === 'auto-create';
  statusBadge.textContent = generated ? 'Template Generated' : 'Rules Ready';
  statusBadge.dataset.state = 'ready';
  document.querySelector('.brand-wrap span').textContent = generated
    ? `Auto Generator V1 · ${project.project?.preset || 'custom'}`
    : `Auto Generator Ready · ${project.project?.preset || 'custom'}`;
});

engine.bus.on('scene:enter', ({ sceneId }) => {
  document.querySelectorAll('.scene-item').forEach(el => el.classList.toggle('active', el.dataset.sceneTarget === sceneId));
});

engine.bus.on('timeline:step', step => {
  statusBadge.textContent = step.label || step.action || `Timeline ${step.at || 0}ms`;
  setTimeout(() => {
    statusBadge.textContent = currentProject?.generator?.mode === 'auto-create' ? 'Template Generated' : 'Rules Ready';
  }, 900);
});

try {
  presetSelect.value = 'jawa-luxury';
  mountTheme('jawa-luxury', currentSeed);
} catch (error) {
  console.error('[Wedding Visual Engine]', error);
  statusBadge.textContent = 'Engine Error';
  statusBadge.dataset.state = 'error';
  previewRoot.innerHTML = `<div class="engine-error"><strong>Preview gagal dimuat.</strong><span>${error.message}</span></div>`;
}

console.info('[Wedding Template Studio] Stage #9 Auto Template Generator booting.');
