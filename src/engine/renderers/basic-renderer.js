import { LAYER_STACK, createLayerHost, groupSceneLayers } from '../layers/layer-system.js';
import { createAtmosphere, createProceduralBackground, decorateSceneMetadata } from '../scenes/scene-composer.js';

function createProceduralGunungan(layer, el) {
  el.classList.add('procedural-gunungan');
  el.innerHTML = `
    <svg viewBox="0 0 240 360" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="gununganFill-${layer.id}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="currentColor" stop-opacity=".34"/>
          <stop offset="1" stop-color="currentColor" stop-opacity=".08"/>
        </linearGradient>
      </defs>
      <g class="gunungan-pulse">
        <path d="M120 16C93 58 58 102 44 158c-14 55-5 111 20 151h112c25-40 34-96 20-151C182 102 147 58 120 16Z" fill="url(#gununganFill-${layer.id})" stroke="currentColor" stroke-opacity=".48" stroke-width="2"/>
        <path d="M120 55c-18 30-43 65-52 105-9 39-3 79 14 109h76c17-30 23-70 14-109-9-40-34-75-52-105Z" fill="none" stroke="currentColor" stroke-opacity=".30" stroke-width="1.5"/>
        <path d="M120 96v170M82 192c21-14 55-14 76 0M90 226c17-10 43-10 60 0" fill="none" stroke="currentColor" stroke-opacity=".34" stroke-width="1.5"/>
        <circle cx="120" cy="152" r="26" fill="none" stroke="currentColor" stroke-opacity=".34" stroke-width="1.5"/>
        <path d="M103 152c10-16 24-16 34 0-10 16-24 16-34 0Z" fill="currentColor" fill-opacity=".14"/>
      </g>
      <g class="gunungan-orbit" opacity=".34">
        <circle cx="120" cy="152" r="43" fill="none" stroke="currentColor" stroke-dasharray="2 7"/>
      </g>
      <path d="M70 309h100M88 326h64" stroke="currentColor" stroke-opacity=".38" stroke-width="2" stroke-linecap="round"/>
    </svg>`;
}

function applyMotion(layer, el) {
  const motion = layer.motion || {};
  const preset = motion.preset || motion.type;
  if (preset) {
    el.dataset.motion = preset;
    el.style.setProperty('--motion-delay', `${motion.delayMs ?? motion.delay ?? 0}ms`);
    el.style.setProperty('--motion-duration', `${motion.durationMs ?? motion.duration ?? 900}ms`);
  }
  const parallax = Number(motion.parallax ?? layer.transform?.depth ?? 0);
  if (parallax) el.dataset.parallax = String(parallax);

  const decorMotion = motion.decorMotion || (layer.kind === 'decor' ? 'float' : '');
  if (decorMotion) {
    el.dataset.decorMotion = decorMotion;
    el.style.setProperty('--decor-duration', `${motion.decorDurationMs ?? 7200}ms`);
  }
}

function createLayer(layer = {}) {
  const kind = layer.kind || layer.type || 'unknown';
  const el = document.createElement('div');
  el.className = `engine-layer layer-${kind}`;
  el.dataset.layerId = layer.id || crypto.randomUUID?.() || String(Math.random());
  el.dataset.role = layer.role || '';

  const style = layer.style || {};
  const transform = layer.transform || {};
  const depth = Number(layer.depth ?? transform.depth ?? 0);

  el.style.setProperty('--layer-depth', depth);
  if (style.color) el.style.color = style.color;
  if (style.background) el.style.background = style.background;
  if (style.opacity != null) el.style.opacity = style.opacity;
  if (style.zIndex != null) el.style.zIndex = style.zIndex;
  if (transform.x != null) el.style.left = `${transform.x}%`;
  if (transform.y != null) el.style.top = `${transform.y}%`;
  if (transform.width != null) el.style.width = transform.width;
  if (transform.opacity != null) el.style.opacity = transform.opacity;
  if (transform.z != null) el.style.zIndex = transform.z;
  if (transform.scale != null) el.style.setProperty('--layer-scale', transform.scale);
  if (transform.rotate != null) el.style.setProperty('--layer-rotate', `${transform.rotate}deg`);

  switch (kind) {
    case 'text':
      el.classList.add('layer-text');
      el.textContent = layer.content || '';
      if (layer.id === 'cover-title') el.dataset.role = 'eyebrow';
      break;
    case 'button': {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = layer.content || 'Buka Undangan';
      button.className = 'engine-button';
      el.appendChild(button);
      break;
    }
    case 'particle':
      el.classList.add('layer-particle');
      el.dataset.particle = layer.particle?.type || layer.preset || 'gold-dust';
      if (layer.particle?.opacity != null) el.style.opacity = layer.particle.opacity;
      break;
    case 'decor': {
      el.classList.add('layer-decor');
      const generator = layer.asset?.generator || layer.asset?.type || layer.preset || 'procedural';
      el.dataset.decor = generator;
      if (generator === 'gunungan') createProceduralGunungan(layer, el);
      break;
    }
    case 'image': {
      const img = document.createElement('img');
      img.src = layer.asset?.src || layer.src || '';
      img.alt = layer.alt || '';
      img.loading = 'lazy';
      el.appendChild(img);
      break;
    }
    case 'background':
      el.classList.add('layer-background');
      if (layer.gradient) el.style.background = layer.gradient;
      break;
    default:
      el.textContent = layer.content || '';
  }

  applyMotion(layer, el);
  return el;
}

function createDynamicBackground(scene, palette = {}) {
  if (!scene.background || scene.background.type === 'procedural') return null;
  const el = document.createElement('div');
  el.className = 'scene-dynamic-slideshow';
  el.dataset.layerId = `${scene.id}-dynamic-background`;
  const accent = palette.accent || '#d7ae67';
  const surface = palette.surface || '#2a1a12';
  el.style.setProperty('--slide-a', `radial-gradient(circle at 30% 22%, color-mix(in srgb, ${accent} 28%, transparent), transparent 32%),linear-gradient(160deg,${surface},#090d15)`);
  el.style.setProperty('--slide-b', `radial-gradient(circle at 72% 36%, color-mix(in srgb, ${accent} 18%, transparent), transparent 28%),linear-gradient(200deg,#0a0d13,${surface})`);
  el.style.setProperty('--slideshow-duration', `${Math.max(8000, (scene.background.durationMs || 5000) * 2)}ms`);
  return el;
}

export class BasicRenderer {
  constructor({ root, bus, store }) {
    this.root = root;
    this.bus = bus;
    this.store = store;
  }

  renderProject(project) {
    this.root.replaceChildren();
    const scenes = project?.scenes || [];
    scenes.forEach(scene => this.root.appendChild(this.renderScene(scene, project)));
    this.bus.emit('renderer:project-rendered', { project, sceneCount: scenes.length, layerStack: LAYER_STACK });
  }

  renderScene(scene, project) {
    const section = document.createElement('section');
    section.className = `engine-scene scene-${scene.type || 'generic'}`;
    decorateSceneMetadata(section, scene);

    const palette = project?.theme?.palette || {};
    section.style.setProperty('--scene-bg', palette.background || '#120e0b');
    section.style.setProperty('--scene-fg', palette.text || '#f7ecd8');
    section.style.setProperty('--scene-accent', palette.accent || '#d9ad67');
    section.style.setProperty('--scene-surface', palette.surface || '#2a1a12');

    const grouped = groupSceneLayers(scene);

    for (const definition of LAYER_STACK) {
      const host = createLayerHost(definition);
      if (definition.key === 'base' && scene.background?.type === 'procedural') host.appendChild(createProceduralBackground(scene, palette));
      if (definition.key === 'dynamic-bg') {
        const dynamic = createDynamicBackground(scene, palette);
        if (dynamic) host.appendChild(dynamic);
      }
      if (definition.key === 'atmosphere' && scene.atmosphere?.effects?.length) host.appendChild(createAtmosphere(scene));
      for (const layer of grouped.get(definition.key) || []) host.appendChild(createLayer(layer));
      section.appendChild(host);
    }

    if (!(scene.layers || []).length) {
      const contentHost = section.querySelector('[data-layer-group="content"]');
      const placeholder = document.createElement('div');
      placeholder.className = 'scene-placeholder';
      placeholder.innerHTML = `<span>${scene.type || 'Scene'}</span><strong>${scene.id}</strong>`;
      contentHost?.appendChild(placeholder);
    }

    return section;
  }
}
