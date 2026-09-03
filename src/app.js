import { WeddingVisualEngine } from './engine/core/engine.js';

const scenes = ['Cover','Couple','Event','Story','Gallery','RSVP','Closing'];
const sceneList = document.querySelector('#scene-list');
const previewFrame = document.querySelector('#preview-frame');
const previewRoot = document.querySelector('#engine-root');
const autoCreate = document.querySelector('#auto-create');
const statusBadge = document.querySelector('#engine-status');

const engine = new WeddingVisualEngine({ root: previewRoot });
window.weddingEngine = engine;

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

document.querySelectorAll('[data-device]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-device]').forEach(el => el.classList.remove('active'));
    button.classList.add('active');
    previewFrame.className = `preview-frame ${button.dataset.device}`;
    engine.decorMotion?.schedule();
  });
});

autoCreate.addEventListener('click', () => {
  engine.playIntro();
  autoCreate.textContent = 'Replaying…';
  setTimeout(() => autoCreate.textContent = 'Replay Motion', 1400);
});

engine.bus.on('engine:loading', () => {
  statusBadge.textContent = 'Loading';
  statusBadge.dataset.state = 'loading';
});

engine.bus.on('engine:ready', ({ project }) => {
  statusBadge.textContent = 'Assets Ready';
  statusBadge.dataset.state = 'ready';
  document.querySelector('.brand-wrap span').textContent = `Procedural Assets V1 · ${project.project?.preset || 'custom'}`;
});

engine.bus.on('scene:enter', ({ sceneId }) => {
  document.querySelectorAll('.scene-item').forEach(el => el.classList.toggle('active', el.dataset.sceneTarget === sceneId));
});

engine.bus.on('timeline:step', step => {
  statusBadge.textContent = step.label || step.action || `Timeline ${step.at || 0}ms`;
  setTimeout(() => { statusBadge.textContent = 'Assets Ready'; }, 900);
});

engine.bus.on('motion:replay', () => {
  statusBadge.textContent = 'Motion Replay';
});

engine.load('/src/data/project.example.json').catch(error => {
  console.error('[Wedding Visual Engine]', error);
  statusBadge.textContent = 'Engine Error';
  statusBadge.dataset.state = 'error';
  previewRoot.innerHTML = `<div class="engine-error"><strong>Preview gagal dimuat.</strong><span>${error.message}</span></div>`;
});

console.info('[Wedding Template Studio] Stage #6 Procedural Asset Engine booting.');
