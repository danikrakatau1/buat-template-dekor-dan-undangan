function createLayer(layer = {}) {
  const kind = layer.kind || layer.type || 'unknown';
  const el = document.createElement('div');
  el.className = `engine-layer layer-${kind}`;
  el.dataset.layerId = layer.id || crypto.randomUUID?.() || String(Math.random());

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
  if (transform.scale != null) el.style.scale = transform.scale;
  if (transform.rotate != null) el.style.rotate = `${transform.rotate}deg`;

  switch (kind) {
    case 'text': {
      el.classList.add('layer-text');
      el.textContent = layer.content || '';
      if (layer.id === 'cover-title') el.dataset.role = 'eyebrow';
      else if (layer.role) el.dataset.role = layer.role;
      break;
    }
    case 'button': {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = layer.content || 'Buka Undangan';
      button.className = 'engine-button';
      el.appendChild(button);
      break;
    }
    case 'particle': {
      el.classList.add('layer-particle');
      el.dataset.particle = layer.particle?.type || layer.preset || 'gold-dust';
      if (layer.particle?.opacity != null) el.style.opacity = layer.particle.opacity;
      break;
    }
    case 'decor': {
      el.classList.add('layer-decor');
      el.dataset.decor = layer.asset?.generator || layer.asset?.type || layer.preset || 'procedural';
      break;
    }
    case 'background': {
      el.classList.add('layer-background');
      if (layer.gradient) el.style.background = layer.gradient;
      break;
    }
    default:
      el.textContent = layer.content || '';
  }

  const motionPreset = layer.motion?.preset || layer.motion?.type;
  if (motionPreset) {
    const normalizedMotion = {
      'rise-soft': 'fade-up',
      'clip-up': 'fade-up',
      'zoom-soft': 'zoom-in'
    }[motionPreset] || motionPreset;
    el.dataset.motion = normalizedMotion;
    el.style.setProperty('--motion-delay', `${layer.motion.delayMs ?? layer.motion.delay ?? 0}ms`);
    el.style.setProperty('--motion-duration', `${layer.motion.durationMs ?? layer.motion.duration ?? 900}ms`);
  }

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
    this.bus.emit('renderer:project-rendered', { project, sceneCount: scenes.length });
  }

  renderScene(scene, project) {
    const section = document.createElement('section');
    section.className = `engine-scene scene-${scene.type || 'generic'}`;
    section.dataset.sceneId = scene.id;
    section.dataset.sceneType = scene.type || 'generic';

    const palette = project?.theme?.palette || {};
    section.style.setProperty('--scene-bg', palette.background || '#120e0b');
    section.style.setProperty('--scene-fg', palette.text || '#f7ecd8');
    section.style.setProperty('--scene-accent', palette.accent || '#d9ad67');

    if (scene.background?.type === 'procedural') {
      const background = createLayer({
        id: `${scene.id}-background`,
        kind: 'background',
        gradient: 'radial-gradient(circle at 50% 18%, rgba(214,178,110,.23), transparent 28%), linear-gradient(180deg,#211a19 0%,#101218 62%,#080b12 100%)'
      });
      section.appendChild(background);
    }

    (scene.layers || []).forEach(layer => section.appendChild(createLayer(layer)));

    if (!(scene.layers || []).length) {
      const placeholder = document.createElement('div');
      placeholder.className = 'scene-placeholder';
      placeholder.innerHTML = `<span>${scene.type || 'Scene'}</span><strong>${scene.id}</strong>`;
      section.appendChild(placeholder);
    }

    return section;
  }
}
