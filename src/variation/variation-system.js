import { generateAutoTemplate } from '../generator/auto-template-generator.js';
import { createVariationSeed } from '../themes/preset-rules.js';
import { getThemeSeedPrefix } from '../themes/theme-packs.js';

function clone(value){
  return typeof structuredClone === 'function'
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));
}

function indexLayers(project){
  const map = new Map();
  for (const scene of project?.scenes || []) {
    for (const layer of scene.layers || []) {
      map.set(`${scene.id}:${layer.id}`, layer);
    }
  }
  return map;
}

function copyContent(source, target){
  if (!source || !target) return;
  if ('content' in source) target.content = source.content;
}

function copyLayout(source, target){
  if (!source || !target) return;
  if (source.transform) target.transform = clone(source.transform);
}

function copyMotion(source, target){
  if (!source || !target) return;
  if (source.motion) target.motion = clone(source.motion);
}

function copyAsset(source, target){
  if (!source || !target) return;
  if (source.asset) target.asset = clone(source.asset);
}

export const VARIATION_LOCKS = Object.freeze({
  content:'content',
  layout:'layout',
  motion:'motion',
  assets:'assets'
});

export function createVariationProject({
  project,
  themeId,
  seed,
  locks={ content:true, layout:false, motion:false, assets:false }
}={}){
  const source = clone(project || {});
  const resolvedTheme = themeId || source.project?.preset || 'jawa-luxury';
  const resolvedSeed = seed || createVariationSeed(getThemeSeedPrefix(resolvedTheme));
  const next = generateAutoTemplate({ themeId:resolvedTheme, seed:resolvedSeed });
  const sourceLayers = indexLayers(source);

  for (const scene of next.scenes || []) {
    for (const layer of scene.layers || []) {
      const previous = sourceLayers.get(`${scene.id}:${layer.id}`);
      if (!previous) continue;
      if (locks.content) copyContent(previous, layer);
      if (locks.layout) copyLayout(previous, layer);
      if (locks.motion) copyMotion(previous, layer);
      if (locks.assets) copyAsset(previous, layer);
    }
  }

  next.variationSystem = {
    version:'1.0.0',
    sourceSeed:source.project?.seed || null,
    seed:resolvedSeed,
    locks:{
      content:Boolean(locks.content),
      layout:Boolean(locks.layout),
      motion:Boolean(locks.motion),
      assets:Boolean(locks.assets)
    },
    preserved:true
  };

  return next;
}

export function summarizeVariation(project){
  const state = project?.variationSystem || {};
  const locks = state.locks || {};
  return {
    seed:project?.project?.seed || '-',
    sourceSeed:state.sourceSeed || '-',
    locked:Object.entries(locks).filter(([,value]) => value).map(([key]) => key),
    preserved:Boolean(state.preserved)
  };
}
