const REVISION='10.10N.2';

function currentProject(){
  return window.weddingEditor?.getProject?.() || window.weddingEngine?.store?.getState?.().project || null;
}

function sceneSections(){
  return [...document.querySelectorAll('[data-scene-id]')];
}

function hasMeaningfulContent(section){
  if(!section) return false;
  const project=currentProject();
  const id=section.dataset.sceneId;
  const scene=project?.scenes?.find(item=>item?.id===id);
  const layerCount=Array.isArray(scene?.layers)?scene.layers.length:0;
  const domContent=section.querySelectorAll('.engine-layer,.scene-placeholder,img,button,[data-layer-id]').length;
  return layerCount>0 || domContent>0;
}

function revealPostCoverScenes(coverSection){
  const sections=sceneSections();
  const index=sections.indexOf(coverSection);
  const after=index>=0?sections.slice(index+1):[];
  for(const section of after){
    section.hidden=false;
    section.removeAttribute('aria-hidden');
    section.style.removeProperty('display');
    section.style.removeProperty('visibility');
    section.style.removeProperty('opacity');
    section.style.removeProperty('pointer-events');
    section.classList.add('is-active','post-cover-ready');
  }
  return after.filter(hasMeaningfulContent);
}

async function pulseCover(section){
  section.style.removeProperty('display');
  section.style.removeProperty('visibility');
  section.style.removeProperty('opacity');
  section.style.removeProperty('pointer-events');
  section.dataset.opening='true';
  const animation=section.animate([
    {transform:'translateY(0) scale(1)',filter:'brightness(1)'},
    {transform:'translateY(-1%) scale(.995)',filter:'brightness(1.04)',offset:.5},
    {transform:'translateY(0) scale(1)',filter:'brightness(1)'}
  ],{duration:650,easing:'cubic-bezier(.22,1,.36,1)'});
  try{await animation.finished;}catch{}
  section.dataset.opening='false';
  section.dataset.openFallback='no-valid-post-cover-scene';
}

async function openToNext(section,nextScene){
  nextScene.hidden=false;
  nextScene.removeAttribute('aria-hidden');
  nextScene.style.display='';
  nextScene.style.visibility='visible';
  nextScene.style.opacity='1';
  nextScene.style.pointerEvents='auto';
  nextScene.classList.add('is-active','post-cover-ready');

  section.dataset.opening='true';
  const animation=section.animate([
    {opacity:1,transform:'translateY(0)'},
    {opacity:.94,offset:.28},
    {opacity:0,transform:'translateY(-100%)'}
  ],{duration:1500,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'});
  try{await animation.finished;}catch{}
  section.style.display='none';
  nextScene.scrollIntoView({behavior:'smooth',block:'start'});
}

function onCoverClick(event){
  const button=event.target?.closest?.('[data-layer-id="cover-open"] .engine-button');
  if(!button) return;
  const section=button.closest('[data-scene-id]');
  if(!section || !section.classList.contains('auto-generated-cover-handoff')) return;

  event.preventDefault();
  event.stopImmediatePropagation();

  try{document.querySelector('#song')?.play?.().catch?.(()=>{});}catch{}
  const validScenes=revealPostCoverScenes(section);
  const nextScene=validScenes[0]||null;

  if(!nextScene){
    pulseCover(section);
    return;
  }
  openToNext(section,nextScene);
}

document.addEventListener('click',onCoverClick,true);
window.weddingCoverOpeningSafety={revision:REVISION,revealPostCoverScenes};
console.info(`[Wedding Template Studio] Stage #${REVISION} cover opening safety active.`);
