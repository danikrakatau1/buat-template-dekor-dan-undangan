export function createProceduralBackground(scene, palette = {}) {
  const layer = document.createElement('div');
  layer.className = 'engine-layer layer-background scene-procedural-background';
  layer.dataset.layerId = `${scene.id}-background`;
  layer.style.background = [
    `radial-gradient(circle at 50% 16%, color-mix(in srgb, ${palette.accent || '#d7ae67'} 24%, transparent), transparent 30%)`,
    `linear-gradient(180deg, ${palette.surface || '#2a1a12'} 0%, ${palette.background || '#160f0b'} 58%, #070a10 100%)`
  ].join(',');
  return layer;
}

export function createAtmosphere(scene = {}) {
  const wrap = document.createElement('div');
  wrap.className = 'engine-atmosphere';
  wrap.dataset.layerId = `${scene.id}-atmosphere`;

  const effects = scene.atmosphere?.effects || [];
  const intensity = Number(scene.atmosphere?.intensity ?? 0.5);
  wrap.style.setProperty('--atmosphere-intensity', intensity);

  for (const effect of effects) {
    const el = document.createElement('div');
    el.className = `atmosphere-effect atmosphere-${effect}`;
    el.dataset.effect = effect;
    wrap.appendChild(el);
  }

  return wrap;
}

export function decorateSceneMetadata(section, scene = {}) {
  section.dataset.sceneId = scene.id || '';
  section.dataset.sceneType = scene.type || 'generic';
  section.dataset.scenePreset = scene.preset || '';
  section.dataset.hasAtmosphere = String(Boolean(scene.atmosphere?.effects?.length));
  section.dataset.layout = scene.variation?.layout || 'default';
  section.dataset.variationSeed = scene.variation?.seed || '';
  section.dataset.heroVariant = scene.variation?.heroVariant || '';
  section.dataset.backgroundMotion = scene.variation?.backgroundMotion || scene.background?.kenBurns || '';
}
