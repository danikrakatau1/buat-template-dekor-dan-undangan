export const LAYER_STACK = Object.freeze([
  { key: 'base', index: 0, label: 'L0 Base Background' },
  { key: 'dynamic-bg', index: 1, label: 'L1 Dynamic Background' },
  { key: 'decor-back', index: 2, label: 'L2 Decor Back' },
  { key: 'ambient', index: 3, label: 'L3 Ambient' },
  { key: 'atmosphere', index: 4, label: 'L4 Atmosphere' },
  { key: 'decor-main', index: 5, label: 'L5 Main Decor' },
  { key: 'media', index: 6, label: 'L6 Media' },
  { key: 'content', index: 7, label: 'L7 Content' },
  { key: 'decor-front', index: 8, label: 'L8 Foreground Decor' },
  { key: 'interaction', index: 9, label: 'L9 Interaction' },
  { key: 'floating', index: 10, label: 'L10 Floating UI' }
]);

const ROLE_ALIASES = Object.freeze({
  background: 'base',
  base: 'base',
  'base-background': 'base',
  'dynamic-background': 'dynamic-bg',
  slideshow: 'dynamic-bg',
  video: 'dynamic-bg',
  'back-decor': 'decor-back',
  'decor-back': 'decor-back',
  'environment-back': 'decor-back',
  'ornament-back': 'decor-back',
  particle: 'ambient',
  ambient: 'ambient',
  'atmosphere-front': 'atmosphere',
  atmosphere: 'atmosphere',
  overlay: 'atmosphere',
  hero: 'decor-main',
  decor: 'decor-main',
  'decor-main': 'decor-main',
  media: 'media',
  image: 'media',
  content: 'content',
  text: 'content',
  'ornament-front': 'decor-front',
  'foreground-floral': 'decor-front',
  'foreground-decor': 'decor-front',
  'decor-front': 'decor-front',
  interaction: 'interaction',
  button: 'interaction',
  'ui-fx': 'floating',
  floating: 'floating',
  'floating-ui': 'floating'
});

export function resolveLayerKey(layer = {}) {
  const role = String(layer.role || '').toLowerCase();
  const kind = String(layer.kind || layer.type || '').toLowerCase();
  return ROLE_ALIASES[role] || ROLE_ALIASES[kind] || 'content';
}

export function getLayerDefinition(key) {
  return LAYER_STACK.find(item => item.key === key) || LAYER_STACK[7];
}

export function groupSceneLayers(scene = {}) {
  const groups = new Map(LAYER_STACK.map(item => [item.key, []]));
  for (const layer of scene.layers || []) {
    groups.get(resolveLayerKey(layer)).push(layer);
  }
  return groups;
}

export function createLayerHost(definition) {
  const host = document.createElement('div');
  host.className = `scene-layer-host scene-layer-${definition.key}`;
  host.dataset.layerGroup = definition.key;
  host.dataset.layerIndex = String(definition.index);
  host.style.setProperty('--layer-index', definition.index);
  return host;
}
