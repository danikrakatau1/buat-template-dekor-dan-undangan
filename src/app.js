import { WeddingVisualEngine } from './engine/core/engine.js';
import { createThemeProject, getThemePackOptions, getThemeSeedPrefix } from './themes/theme-packs.js';
import { createVariationSeed } from './themes/preset-rules.js';

const scenes = ['Cover','Couple','Event','Story','Gallery','RSVP','Closing'];
const sceneList = document.querySelector('#scene-list');
const previewFrame = document.querySelector('#preview-frame');
const previewRoot = document.querySelector('#engine-root');
const replayButton = document.querySelector('#auto-create');
const statusBadge = document.querySelector('#engine-status');
const presetSelect = document.querySelector('#preset-select');
const variationButton = document.querySelector('#generate-variation');
const seedValue = document.querySelector('#variation-seed');
const layoutValue = document.querySelector('#variation-layout');
const motionValue = document.querySelector('#variation-motion');
const atmosphereValue = document.querySelector('#variation-atmosphere');

const engine = new WeddingVisualEngine({ root: previewRoot });
window.weddingEngine = engine;
let currentSeed = 'JL-DEMO-001';

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

function updateVariationInspector(project){
  const variation = project.variation || {};
  if (seedValue) seedValue.textContent = project.project?.seed || '-';
  if (layoutValue) layoutValue.textContent = variation.layout || '-';
  if (motionValue) motionValue.textContent = variation.motion?.hero || '-';
  if (atmosphereValue) atmosphereValue.textContent = (variation.atmosphere || []).join(' · ') || '-';
}

function mountTheme(themeId, seed=currentSeed){
  const project = createThemeProject(themeId, seed);
  currentSeed = project.project.seed;
  engine.mount(project);
  previewRoot.scrollTop = 0;
  engine.decorMotion?.schedule();
  document.body.dataset.themePack = project.project.preset;
  updateVariationInspector(project);
  statusBadge.textContent = 'Rules Ready';
  statusBadge.dataset.state = 'ready';
  return project;
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

replayButton.addEventListener('click', () => {
  engine.playIntro();
  replayButton.textContent = 'Replaying…';
  setTimeout(() => replayButton.textContent = 'Replay Motion', 1400);
});

engine.bus.on('engine:ready', ({ project }) => {
  statusBadge.textContent = 'Rules Ready';
  statusBadge.dataset.state = 'ready';
  document.querySelector('.brand-wrap span').textContent = `Preset Rules V1 · ${project.project?.preset || 'custom'}`;
});

engine.bus.on('scene:enter', ({ sceneId }) => {
  document.querySelectorAll('.scene-item').forEach(el => el.classList.toggle('active', el.dataset.sceneTarget === sceneId));
});

engine.bus.on('timeline:step', step => {
  statusBadge.textContent = step.label || step.action || `Timeline ${step.at || 0}ms`;
  setTimeout(() => { statusBadge.textContent = 'Rules Ready'; }, 900);
});

engine.bus.on('motion:replay', () => {
  statusBadge.textContent = 'Motion Replay';
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

console.info('[Wedding Template Studio] Stage #8 Theme & Preset Rules booting.');
