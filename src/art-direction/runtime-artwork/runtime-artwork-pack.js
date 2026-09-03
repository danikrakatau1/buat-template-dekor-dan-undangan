import landscape0 from './chunks/landscape-0.js';
import joglo0 from './chunks/joglo-0.js';
import joglo1 from './chunks/joglo-1.js';
import joglo2 from './chunks/joglo-2.js';
import floral0 from './chunks/floral-0.js';
import floral1 from './chunks/floral-1.js';
import floral2 from './chunks/floral-2.js';
import floral3 from './chunks/floral-3.js';

const webp=(...chunks)=>`data:image/webp;base64,${chunks.join('')}`;

export const RUNTIME_ENGRAVING_ARTWORK=Object.freeze({
  landscape:webp(landscape0),
  joglo:webp(joglo0,joglo1,joglo2),
  floralBottom:webp(floral0,floral1,floral2,floral3)
});

export const RUNTIME_ENGRAVING_META=Object.freeze({
  landscape:{source:'stage-9.9.2-generated',width:300,height:533,format:'webp',transparent:false,quality:'runtime-preview'},
  joglo:{source:'stage-9.9.2-generated',width:330,height:412,format:'webp',transparent:true,quality:'runtime-preview'},
  floralBottom:{source:'stage-9.9.2-generated',width:380,height:285,format:'webp',transparent:true,quality:'runtime-preview'}
});
