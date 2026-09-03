import { LAYER_STACK, createLayerHost, groupSceneLayers } from '../layers/layer-system.js';
import { createAtmosphere, createProceduralBackground, decorateSceneMetadata } from '../scenes/scene-composer.js';
import { hasProceduralAsset, renderProceduralAsset } from '../assets/procedural-assets.js';

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

function mountProceduralAsset(layer, el, generator) {
  el.classList.add('procedural-asset', `procedural-${generator}`);
  el.dataset.generator = generator;
  const options = {id: layer.id || generator,seed: layer.asset?.seed || layer.seed || layer.id || generator,variant: layer.asset?.variant || layer.variant || 'soft',count: layer.asset?.count || layer.particle?.density};
  el.innerHTML = renderProceduralAsset(generator, options);
}

function resolveLayerImageSource(layer={}) {
  const asset=layer.asset || {};
  if (asset.resolvedSrc) return asset.resolvedSrc;
  if (asset.productionSrc && asset.src === asset.productionSrc) return asset.productionSrc;
  return asset.src || layer.src || asset.fallbackSrc || '';
}

function createLayer(layer = {}) {
  const kind = layer.kind || layer.type || 'unknown';
  const el = document.createElement('div');
  el.className = `engine-layer layer-${kind}`;
  el.dataset.layerId = layer.id || crypto.randomUUID?.() || String(Math.random());
  el.dataset.role = layer.role || '';
  const style = layer.style || {}, transform = layer.transform || {}, depth = Number(layer.depth ?? transform.depth ?? 0);
  if(style.tone) el.dataset.tone=style.tone;
  el.style.setProperty('--layer-depth', depth);
  if (style.color) el.style.color = style.color;if (style.background) el.style.background = style.background;if (style.opacity != null) el.style.opacity = style.opacity;if (style.zIndex != null) el.style.zIndex = style.zIndex;
  if (transform.x != null) el.style.left = `${transform.x}%`;if (transform.y != null) el.style.top = `${transform.y}%`;if (transform.width != null) el.style.width = transform.width;if (transform.opacity != null) el.style.opacity = transform.opacity;if (transform.z != null) el.style.zIndex = transform.z;if (transform.scale != null) el.style.setProperty('--layer-scale', transform.scale);if (transform.rotate != null) el.style.setProperty('--layer-rotate', `${transform.rotate}deg`);
  switch (kind) {
    case 'text': el.classList.add('layer-text');el.textContent = layer.content || '';if (layer.id === 'cover-title') el.dataset.role = 'eyebrow';break;
    case 'button': {const button = document.createElement('button');button.type = 'button';button.textContent = layer.content || 'Buka Undangan';button.className = 'engine-button';el.appendChild(button);break;}
    case 'field': {const input=document.createElement('input');input.type='text';input.placeholder=layer.content||'';input.className='reference-input';input.setAttribute('aria-label',layer.content||layer.id||'Input');el.appendChild(input);break;}
    case 'textarea': {const textarea=document.createElement('textarea');textarea.placeholder=layer.content||'';textarea.className='reference-textarea';textarea.setAttribute('aria-label',layer.content||layer.id||'Pesan');el.appendChild(textarea);break;}
    case 'particle': {const generator = layer.asset?.generator || layer.particle?.type;el.classList.add('layer-particle');if (generator && hasProceduralAsset(generator)) mountProceduralAsset(layer, el, generator);else el.dataset.particle = layer.particle?.type || layer.preset || 'gold-dust';if (layer.particle?.opacity != null) el.style.opacity = layer.particle.opacity;break;}
    case 'decor': {el.classList.add('layer-decor');const generator = layer.asset?.generator || layer.asset?.type || layer.preset || 'procedural';el.dataset.decor = generator;if (hasProceduralAsset(generator)) mountProceduralAsset(layer, el, generator);break;}
    case 'image': {const img = document.createElement('img');img.src = resolveLayerImageSource(layer);img.alt = layer.alt || '';img.loading = 'lazy';img.decoding = 'async';if (layer.asset?.productionSrc && img.src === layer.asset.productionSrc) el.dataset.assetSource = 'production';else el.dataset.assetSource = 'active';el.appendChild(img);break;}
    case 'background': el.classList.add('layer-background');if (layer.gradient) el.style.background = layer.gradient;break;
    default: el.textContent = layer.content || '';
  }
  applyMotion(layer, el);return el;
}

function createDynamicBackground(scene, palette = {}) {
  if (!scene.background || scene.background.type === 'procedural') return null;
  const el = document.createElement('div');el.className = 'scene-dynamic-slideshow';el.dataset.layerId = `${scene.id}-dynamic-background`;
  const accent = palette.accent || '#d7ae67', surface = palette.surface || '#2a1a12';
  el.style.setProperty('--slide-a', `radial-gradient(circle at 30% 22%, color-mix(in srgb, ${accent} 28%, transparent), transparent 32%),linear-gradient(160deg,${surface},#090d15)`);
  el.style.setProperty('--slide-b', `radial-gradient(circle at 72% 36%, color-mix(in srgb, ${accent} 18%, transparent), transparent 28%),linear-gradient(200deg,#0a0d13,${surface})`);
  el.style.setProperty('--slideshow-duration', `${Math.max(8000, (scene.background.durationMs || 5000) * 2)}ms`);return el;
}

function isGeneratedFinalCover(scene,project){
  if(scene?.type!=='cover'||project?.generator?.referenceNativeRebuild) return false;
  const handoff=String(scene?.renderHandoff||project?.generator?.handoff||'');
  return Boolean(scene?.referenceArchitecture || project?.generator?.referenceArchitecture || project?.generator?.generatedArtworkIsolated || /^10\.10[A-Z]/.test(handoff));
}

export class BasicRenderer {
  constructor({ root, bus, store }) {this.root = root;this.bus = bus;this.store = store;}
  renderProject(project) {this.root.replaceChildren();const scenes = project?.scenes || [];scenes.forEach(scene => this.root.appendChild(this.renderScene(scene, project)));this.bus.emit('renderer:project-rendered', { project, sceneCount: scenes.length, layerStack: LAYER_STACK });}
  renderScene(scene, project) {
    const section = document.createElement('section');section.className = `engine-scene scene-${scene.type || 'generic'}`;decorateSceneMetadata(section, scene);
    if(project?.generator?.referenceNativeRebuild||scene?.referenceNative){section.classList.add('reference-native-scene');section.dataset.referenceScene=scene.id;section.dataset.referenceVersion=String(project?.generator?.referenceVersion||'11');}
    if(isGeneratedFinalCover(scene,project)){
      section.classList.add('auto-generated-cover-handoff');section.dataset.autoArtworkHandoff=String(scene?.renderHandoff||project?.generator?.handoff||'10.10');section.dataset.generatedCover='true';
      if(scene?.referenceArchitecture||project?.generator?.referenceArchitecture)section.classList.add('auto-reference-architecture-cover');
    }
    const palette = project?.theme?.palette || {};
    section.style.setProperty('--scene-bg', palette.background || '#120e0b');section.style.setProperty('--scene-fg', palette.text || '#f7ecd8');section.style.setProperty('--scene-accent', palette.accent || '#d9ad67');section.style.setProperty('--scene-surface', palette.surface || '#2a1a12');
    const grouped = groupSceneLayers(scene);
    for (const definition of LAYER_STACK) {
      const host = createLayerHost(definition);
      if (definition.key === 'base' && scene.background?.type === 'procedural') host.appendChild(createProceduralBackground(scene, palette));
      if (definition.key === 'dynamic-bg') {const dynamic = createDynamicBackground(scene, palette);if (dynamic) host.appendChild(dynamic);}
      if (definition.key === 'atmosphere' && scene.atmosphere?.effects?.length) host.appendChild(createAtmosphere(scene));
      for (const layer of grouped.get(definition.key) || []) host.appendChild(createLayer(layer));section.appendChild(host);
    }
    if (!(scene.layers || []).length) {const contentHost = section.querySelector('[data-layer-group="content"]');const placeholder = document.createElement('div');placeholder.className = 'scene-placeholder';placeholder.innerHTML = `<span>${scene.type || 'Scene'}</span><strong>${scene.id}</strong>`;contentHost?.appendChild(placeholder);}
    return section;
  }
}
