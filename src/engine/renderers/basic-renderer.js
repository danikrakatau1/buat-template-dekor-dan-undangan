function createLayer(layer = {}) {
  const el = document.createElement('div');
  el.className = `engine-layer layer-${layer.type || 'unknown'}`;
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
  if (transform.scale != null) el.style.scale = transform.scale;
  if (transform.rotate != null) el.style.rotate = `${transform.rotate}deg`;

  switch (layer.type) {
    case 'text': {
      el.classList.add('layer-text');
      el.textContent = layer.content || '';
      if (layer.role) el.dataset.role = layer.role;
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
      el.dataset.particle = layer.preset || layer.effect || 'gold-dust';
      break;
    }
    case 'decor': {
      el.classList.add('layer-decor');
      el.dataset.decor = layer.asset || layer.preset || 'procedural';
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

  if (layer.motion?.type) {
    el.dataset.motion = layer.motion.type;
    el.style.setProperty('--motion-delay', `${layer.motion.delay || 0}ms`);
    el.style.setProperty('--motion-duration', `${layer.motion.duration || 900}ms`);
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
