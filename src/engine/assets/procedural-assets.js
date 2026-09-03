const svg = (body, viewBox='0 0 320 320') => `
<svg viewBox="${viewBox}" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;

function seeded(seed='asset') {
  let h = 2166136261;
  for (const ch of String(seed)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h += h << 13; h ^= h >>> 7; h += h << 3; h ^= h >>> 17; h += h << 5;
    return (h >>> 0) / 4294967295;
  };
}

function gunungan({ id='gunungan' }={}) {
  return svg(`
    <defs>
      <linearGradient id="g-${id}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="currentColor" stop-opacity=".34"/>
        <stop offset="1" stop-color="currentColor" stop-opacity=".05"/>
      </linearGradient>
    </defs>
    <g class="asset-breathe">
      <path d="M160 18C125 70 83 121 62 184c-18 56-9 98 15 124h166c24-26 33-68 15-124C237 121 195 70 160 18Z" fill="url(#g-${id})" stroke="currentColor" stroke-opacity=".48" stroke-width="2"/>
      <path d="M160 62c-24 36-53 75-66 122-11 42-4 76 14 99h104c18-23 25-57 14-99-13-47-42-86-66-122Z" fill="none" stroke="currentColor" stroke-opacity=".25" stroke-width="1.4"/>
      <circle cx="160" cy="160" r="34" fill="none" stroke="currentColor" stroke-opacity=".28"/>
      <path d="M137 160c14-20 32-20 46 0-14 20-32 20-46 0Z" fill="currentColor" fill-opacity=".12"/>
      <path d="M160 104v174M111 211c28-18 70-18 98 0M121 249c22-12 56-12 78 0" fill="none" stroke="currentColor" stroke-opacity=".28" stroke-width="1.4"/>
    </g>`);
}

function ornamentFrame() {
  return svg(`
    <g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity=".7">
      <path d="M34 102V50c0-9 7-16 16-16h52M218 34h52c9 0 16 7 16 16v52M286 218v52c0 9-7 16-16 16h-52M102 286H50c-9 0-16-7-16-16v-52"/>
      <path d="M34 86c20-1 35-13 38-34 2 18 13 30 31 34M234 34c1 20 13 35 34 38-18 2-30 13-34 31M286 234c-20 1-35 13-38 34-2-18-13-30-31-34M86 286c-1-20-13-35-34-38 18-2 30-13 34-31"/>
      <circle cx="34" cy="34" r="4" fill="currentColor"/><circle cx="286" cy="34" r="4" fill="currentColor"/><circle cx="286" cy="286" r="4" fill="currentColor"/><circle cx="34" cy="286" r="4" fill="currentColor"/>
    </g>`);
}

function wave({ variant='soft' }={}) {
  const amp = variant === 'deep' ? 38 : 22;
  return svg(`
    <g fill="none" stroke="currentColor" stroke-linecap="round">
      <path d="M-20 170 Q40 ${170-amp} 100 170 T220 170 T340 170" stroke-opacity=".55" stroke-width="3"/>
      <path d="M-20 202 Q40 ${202+amp*.7} 100 202 T220 202 T340 202" stroke-opacity=".28" stroke-width="2"/>
      <path d="M-20 234 Q40 ${234-amp*.45} 100 234 T220 234 T340 234" stroke-opacity=".16" stroke-width="1.5"/>
    </g>`);
}

function stars({ seed='stars', count=46 }={}) {
  const rand = seeded(seed);
  let body = '';
  for (let i=0;i<count;i++) {
    const x = Math.round(rand()*320), y = Math.round(rand()*320);
    const r = (0.55 + rand()*1.7).toFixed(2), o = (0.22 + rand()*.7).toFixed(2);
    body += `<circle cx="${x}" cy="${y}" r="${r}" fill="currentColor" opacity="${o}"/>`;
  }
  return svg(`<g class="asset-stars">${body}</g>`);
}

function mist() {
  return svg(`
    <defs><filter id="mist-blur"><feGaussianBlur stdDeviation="12"/></filter></defs>
    <g fill="currentColor" opacity=".12" filter="url(#mist-blur)" class="asset-mist">
      <ellipse cx="78" cy="180" rx="110" ry="28"/>
      <ellipse cx="236" cy="150" rx="120" ry="34"/>
      <ellipse cx="165" cy="222" rx="142" ry="25"/>
    </g>`);
}

function batikPattern() {
  return svg(`
    <defs><pattern id="batik" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M24 4C34 10 40 18 40 24S34 38 24 44C14 38 8 30 8 24S14 10 24 4Z" fill="none" stroke="currentColor" stroke-opacity=".14"/>
      <circle cx="24" cy="24" r="5" fill="none" stroke="currentColor" stroke-opacity=".10"/>
    </pattern></defs>
    <rect width="320" height="320" fill="url(#batik)"/>`);
}

function glowOrb() {
  return svg(`
    <defs><radialGradient id="orb"><stop offset="0" stop-color="currentColor" stop-opacity=".32"/><stop offset=".42" stop-color="currentColor" stop-opacity=".12"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></radialGradient></defs>
    <circle cx="160" cy="160" r="150" fill="url(#orb)"/>`);
}

export const PROCEDURAL_ASSETS = Object.freeze({
  gunungan,
  'ornament-frame': ornamentFrame,
  wave,
  stars,
  mist,
  batik: batikPattern,
  glow: glowOrb
});

export function hasProceduralAsset(name) {
  return Boolean(PROCEDURAL_ASSETS[name]);
}

export function renderProceduralAsset(name, options={}) {
  const generator = PROCEDURAL_ASSETS[name];
  if (!generator) return '';
  return generator(options);
}

export function getProceduralAssetNames() {
  return Object.keys(PROCEDURAL_ASSETS);
}
