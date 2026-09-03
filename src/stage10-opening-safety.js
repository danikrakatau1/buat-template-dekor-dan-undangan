const REVISION='10.10N.3';

function currentProject(){
  return window.weddingEditor?.getProject?.() || window.weddingEngine?.store?.getState?.().project || null;
}

function sceneSections(){
  return [...document.querySelectorAll('[data-scene-id]')];
}

function coverArtworkSrc(){
  return document.querySelector('[data-scene-id="cover"] [data-layer-id="ai-transformed-base"] img')?.src || '';
}

function coverNames(){
  return document.querySelector('[data-scene-id="cover"] [data-layer-id="cover-names"]')?.textContent?.trim() || 'Anif & Dini';
}

function ensureRecoveryStyle(){
  if(document.querySelector('style[data-post-cover-recovery]')) return;
  const style=document.createElement('style');
  style.dataset.postCoverRecovery='true';
  style.textContent=`
  .post-cover-recovered{position:relative!important;min-height:100%!important;overflow:hidden!important;background:#efe3c9!important;color:#66472d!important;isolation:isolate!important}
  .post-cover-recovered::before{content:"";position:absolute;inset:0;z-index:0;background-image:var(--recovery-art);background-size:cover;background-position:center;opacity:.14;filter:saturate(.75) contrast(.9)}
  .post-cover-recovered::after{content:"";position:absolute;inset:0;z-index:1;background:linear-gradient(180deg,rgba(249,241,223,.88),rgba(239,227,201,.78) 52%,rgba(244,234,213,.92));pointer-events:none}
  .post-cover-recovered .post-cover-recovery-content{position:relative;z-index:2;min-height:100%;padding:68px 34px 60px;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;gap:18px;box-sizing:border-box}
  .post-cover-recovered .recovery-kicker{font:700 9px/1.2 Inter,system-ui,sans-serif;letter-spacing:.28em;text-transform:uppercase;color:#9b6c38}
  .post-cover-recovered .recovery-title{margin:0;font:500 clamp(31px,8vw,46px)/1 Georgia,"Times New Roman",serif;color:#604029;letter-spacing:-.035em}
  .post-cover-recovered .recovery-copy{margin:0;max-width:285px;font:400 12px/1.75 Inter,system-ui,sans-serif;color:#735f4b}
  .post-cover-recovered .recovery-card{width:min(290px,88%);padding:20px 18px;border:1px solid rgba(129,91,50,.20);border-radius:22px;background:rgba(250,242,225,.72);box-shadow:0 14px 34px rgba(74,50,29,.08);backdrop-filter:blur(8px)}
  .post-cover-recovered .recovery-card strong{display:block;margin-bottom:8px;font:600 22px/1.05 Georgia,"Times New Roman",serif;color:#68482d}
  .post-cover-recovered .recovery-card span{display:block;font:500 10px/1.6 Inter,system-ui,sans-serif;color:#7d6954}
  .post-cover-recovered .recovery-grid{width:min(300px,90%);display:grid;grid-template-columns:1fr 1fr;gap:10px}
  .post-cover-recovered .recovery-photo{aspect-ratio:4/5;border-radius:18px;border:1px solid rgba(129,91,50,.16);background:linear-gradient(145deg,rgba(255,250,237,.82),rgba(211,190,157,.38));display:grid;place-items:center;font:600 10px Inter,system-ui,sans-serif;letter-spacing:.12em;color:#8f765d}
  .post-cover-recovered .recovery-action{border:1px solid rgba(121,83,45,.30);border-radius:999px;background:rgba(247,234,207,.92);padding:12px 22px;font:800 10px Inter,system-ui,sans-serif;color:#684a2d}
  .post-cover-recovered .recovery-form{width:min(300px,90%);display:grid;gap:9px}.post-cover-recovered .recovery-form input,.post-cover-recovered .recovery-form textarea{width:100%;box-sizing:border-box;border:1px solid rgba(121,83,45,.20);border-radius:13px;background:rgba(255,250,239,.72);padding:11px 12px;color:#64482f;font:500 11px Inter,system-ui,sans-serif;outline:none}.post-cover-recovered .recovery-form textarea{min-height:88px;resize:none}
  `;
  document.head.appendChild(style);
}

function recoveredMarkup(type,names){
  const map={
    couple:`<span class="recovery-kicker">THE COUPLE</span><h2 class="recovery-title">${names}</h2><p class="recovery-copy">Dengan penuh kebahagiaan, kami memperkenalkan kedua mempelai yang akan memulai perjalanan baru bersama.</p><div class="recovery-card"><strong>${names}</strong><span>We Are Getting Married!</span></div>`,
    event:`<span class="recovery-kicker">WEDDING EVENT</span><h2 class="recovery-title">Hari Bahagia</h2><p class="recovery-copy">Tanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami.</p><div class="recovery-card"><strong>Akad Nikah</strong><span>Hari &amp; Tanggal · Waktu · Lokasi</span></div><div class="recovery-card"><strong>Resepsi</strong><span>Hari &amp; Tanggal · Waktu · Lokasi</span></div>`,
    story:`<span class="recovery-kicker">OUR STORY</span><h2 class="recovery-title">Cerita Kami</h2><p class="recovery-copy">Setiap perjalanan memiliki cerita. Bagian ini menjadi ruang untuk perjalanan ${names}, dari pertemuan hingga hari pernikahan.</p><div class="recovery-card"><strong>Our Journey</strong><span>Awal Bertemu · Lamaran · Hari Pernikahan</span></div>`,
    gallery:`<span class="recovery-kicker">GALLERY</span><h2 class="recovery-title">Momen Kami</h2><p class="recovery-copy">Kumpulan momen yang nantinya dapat diisi dengan foto pilihan kedua mempelai.</p><div class="recovery-grid"><div class="recovery-photo">PHOTO 01</div><div class="recovery-photo">PHOTO 02</div><div class="recovery-photo">PHOTO 03</div><div class="recovery-photo">PHOTO 04</div></div>`,
    rsvp:`<span class="recovery-kicker">UCAPAN &amp; RSVP</span><h2 class="recovery-title">Doa &amp; Ucapan</h2><p class="recovery-copy">Berikan harapan dan doa tulus Anda untuk perjalanan baru kedua mempelai.</p><div class="recovery-form"><input aria-label="Nama" placeholder="Nama"><textarea aria-label="Ucapan" placeholder="Tulis doa dan ucapan"></textarea><button class="recovery-action" type="button">Kirim Ucapan</button></div>`,
    closing:`<span class="recovery-kicker">THANK YOU</span><h2 class="recovery-title">${names}</h2><p class="recovery-copy">Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.</p><div class="recovery-card"><strong>Terima Kasih</strong><span>Wassalamu’alaikum Warahmatullahi Wabarakatuh</span></div>`
  };
  return map[type]||`<span class="recovery-kicker">${String(type||'SECTION').toUpperCase()}</span><h2 class="recovery-title">${names}</h2>`;
}

function recoverEmptyPostCoverScenes(coverSection){
  ensureRecoveryStyle();
  const artwork=coverArtworkSrc();
  const names=coverNames();
  const project=currentProject();
  const sections=sceneSections();
  const index=sections.indexOf(coverSection);
  const after=index>=0?sections.slice(index+1):[];
  for(const section of after){
    const id=section.dataset.sceneId;
    const scene=project?.scenes?.find(item=>item?.id===id);
    const layerCount=Array.isArray(scene?.layers)?scene.layers.length:0;
    const realLayers=section.querySelectorAll('.engine-layer[data-layer-id]').length;
    if(layerCount>0 || realLayers>0) continue;
    section.querySelector('.scene-placeholder')?.remove();
    section.classList.add('post-cover-recovered');
    if(artwork)section.style.setProperty('--recovery-art',`url("${artwork.replace(/"/g,'\\"')}")`);
    const content=document.createElement('div');
    content.className='post-cover-recovery-content';
    content.innerHTML=recoveredMarkup(scene?.type||id,names);
    section.appendChild(content);
    section.dataset.recoveredFromEmpty='true';
  }
  return after;
}

function hasMeaningfulContent(section){
  if(!section) return false;
  if(section.dataset.recoveredFromEmpty==='true') return true;
  const project=currentProject();
  const id=section.dataset.sceneId;
  const scene=project?.scenes?.find(item=>item?.id===id);
  const layerCount=Array.isArray(scene?.layers)?scene.layers.length:0;
  const domContent=section.querySelectorAll('.engine-layer[data-layer-id],.post-cover-recovery-content,img,button').length;
  return layerCount>0 || domContent>0;
}

function revealPostCoverScenes(coverSection){
  const after=recoverEmptyPostCoverScenes(coverSection);
  for(const section of after){
    section.hidden=false;section.removeAttribute('aria-hidden');section.style.removeProperty('display');section.style.removeProperty('visibility');section.style.removeProperty('opacity');section.style.removeProperty('pointer-events');section.classList.add('is-active','post-cover-ready');
  }
  return after.filter(hasMeaningfulContent);
}

async function pulseCover(section){
  section.style.removeProperty('display');section.style.removeProperty('visibility');section.style.removeProperty('opacity');section.style.removeProperty('pointer-events');section.dataset.opening='true';
  const animation=section.animate([{transform:'translateY(0) scale(1)',filter:'brightness(1)'},{transform:'translateY(-1%) scale(.995)',filter:'brightness(1.04)',offset:.5},{transform:'translateY(0) scale(1)',filter:'brightness(1)'}],{duration:650,easing:'cubic-bezier(.22,1,.36,1)'});
  try{await animation.finished;}catch{}section.dataset.opening='false';section.dataset.openFallback='no-valid-post-cover-scene';
}

async function openToNext(section,nextScene){
  nextScene.hidden=false;nextScene.removeAttribute('aria-hidden');nextScene.style.display='';nextScene.style.visibility='visible';nextScene.style.opacity='1';nextScene.style.pointerEvents='auto';nextScene.classList.add('is-active','post-cover-ready');
  section.dataset.opening='true';
  const animation=section.animate([{opacity:1,transform:'translateY(0)'},{opacity:.94,offset:.28},{opacity:0,transform:'translateY(-100%)'}],{duration:1500,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'});
  try{await animation.finished;}catch{}section.style.display='none';nextScene.scrollIntoView({behavior:'smooth',block:'start'});
}

function onCoverClick(event){
  const button=event.target?.closest?.('[data-layer-id="cover-open"] .engine-button');if(!button)return;
  const section=button.closest('[data-scene-id]');if(!section||!section.classList.contains('auto-generated-cover-handoff'))return;
  event.preventDefault();event.stopImmediatePropagation();
  try{document.querySelector('#song')?.play?.().catch?.(()=>{});}catch{}
  const validScenes=revealPostCoverScenes(section),nextScene=validScenes[0]||null;
  if(!nextScene){pulseCover(section);return;}openToNext(section,nextScene);
}

function warmRecovery(){
  requestAnimationFrame(()=>{
    const cover=document.querySelector('[data-scene-id="cover"].auto-generated-cover-handoff');
    if(cover)recoverEmptyPostCoverScenes(cover);
  });
}

document.addEventListener('click',onCoverClick,true);
window.weddingEngine?.bus?.on?.('engine:ready',warmRecovery);
setTimeout(warmRecovery,300);
window.weddingCoverOpeningSafety={revision:REVISION,revealPostCoverScenes,recoverEmptyPostCoverScenes};
console.info(`[Wedding Template Studio] Stage #${REVISION} post-cover recovery active.`);
