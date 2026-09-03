import landscape0 from './chunks/landscape-0.js';
import joglo0 from './chunks/joglo-0.js';
import joglo1 from './chunks/joglo-1.js';
import joglo2 from './chunks/joglo-2.js';
import floral0 from './chunks/floral-0.js';
import floral1 from './chunks/floral-1.js';
import floral2 from './chunks/floral-2.js';
import floral3 from './chunks/floral-3.js';

const runtimeUrls=new Set();
const hasObjectUrl=typeof URL!=='undefined' && typeof URL.createObjectURL==='function' && typeof Blob!=='undefined' && typeof atob==='function';

function decodeBase64(base64){
  const binary=atob(base64);
  const bytes=new Uint8Array(binary.length);
  for(let i=0;i<binary.length;i++) bytes[i]=binary.charCodeAt(i);
  return bytes;
}

function webp(...chunks){
  const base64=chunks.join('');
  if(!hasObjectUrl) return `data:image/webp;base64,${base64}`;
  const url=URL.createObjectURL(new Blob([decodeBase64(base64)],{type:'image/webp'}));
  runtimeUrls.add(url);
  return url;
}

export const RUNTIME_ENGRAVING_ARTWORK=Object.freeze({
  landscape:webp(landscape0),
  joglo:webp(joglo0,joglo1,joglo2),
  floralBottom:webp(floral0,floral1,floral2,floral3)
});

export const RUNTIME_ENGRAVING_META=Object.freeze({
  landscape:{source:'stage-9.9.2-generated',width:300,height:533,format:'webp',transparent:false,quality:'runtime-preview',optimized:true,transport:hasObjectUrl?'blob-url':'data-url-fallback'},
  joglo:{source:'stage-9.9.2-generated',width:330,height:412,format:'webp',transparent:true,quality:'runtime-preview',optimized:true,alphaCleanup:'edge-safe',transport:hasObjectUrl?'blob-url':'data-url-fallback'},
  floralBottom:{source:'stage-9.9.2-generated',width:380,height:285,format:'webp',transparent:true,quality:'runtime-preview',optimized:true,alphaCleanup:'edge-safe',transport:hasObjectUrl?'blob-url':'data-url-fallback'}
});

export async function warmRuntimeEngravingArtwork(){
  const sources=Object.values(RUNTIME_ENGRAVING_ARTWORK);
  await Promise.all(sources.map(src=>new Promise(resolve=>{
    const image=new Image();
    image.decoding='async';
    image.onload=image.onerror=()=>resolve();
    image.src=src;
    image.decode?.().then(resolve).catch(()=>{});
  })));
  return sources.length;
}

export function releaseRuntimeEngravingArtwork(){
  if(typeof URL==='undefined' || typeof URL.revokeObjectURL!=='function') return;
  for(const url of runtimeUrls) URL.revokeObjectURL(url);
  runtimeUrls.clear();
}

if(typeof window!=='undefined') window.addEventListener('pagehide',releaseRuntimeEngravingArtwork,{once:true});
