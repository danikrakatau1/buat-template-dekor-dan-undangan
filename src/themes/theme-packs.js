import '../stage9-6.js';
import { resolveThemeVariation } from './preset-rules.js';
import { createJawaFidelityProject } from '../art-direction/jawa-composition-variants.js';

const commonTimeline=[
  {at:120,target:'hero-decor',action:'reveal'},
  {at:900,target:'hero-ambient',action:'start'},
  {at:1450,target:'cover-title',action:'reveal'},
  {at:1900,target:'couple-name',action:'reveal'},
  {at:2350,target:'open-button',action:'reveal'}
];

const emptyScenes=[['couple','couple'],['event','event'],['story','story'],['gallery','gallery'],['rsvp','rsvp'],['closing','closing']]
  .map(([id,type])=>({id,type,layers:[]}));

function layer(id,generator,role,transform={},motion={}){
  return {id,kind:'decor',role,asset:{type:'procedural',generator,seed:motion.seed||id,variant:motion.variant||'soft',count:motion.count},transform,
    motion:{preset:motion.preset||'fade-in',delayMs:motion.delayMs||0,durationMs:motion.durationMs||1100,parallax:motion.parallax??transform.depth??0,decorMotion:motion.decorMotion||'float',decorDurationMs:motion.decorDurationMs||7600}};
}

function textLayers(variation,title='The Wedding Of',names='Anif & Dini'){
  return [
    {id:'cover-title',kind:'text',role:'content',content:title,motion:{preset:variation.motion.title,delayMs:1450,durationMs:850,easing:'premium',once:true}},
    {id:'couple-name',kind:'text',role:'content',content:names,motion:{preset:variation.motion.names,delayMs:1900,durationMs:1000,easing:'premium',once:true}},
    {id:'open-button',kind:'button',role:'interaction',content:'Buka Undangan',motion:{preset:'zoom-soft',delayMs:2350,durationMs:780,easing:'premium',once:true}}
  ];
}

function baseCover({preset,background,atmosphere,decor,variation,title,names}){
  return {id:'cover',type:'cover',preset,variation:{seed:variation.seed,layout:variation.layout,heroVariant:variation.heroVariant,backgroundMotion:variation.backgroundMotion},
    background:{...background,kenBurns:variation.backgroundMotion},atmosphere:{...atmosphere,effects:variation.atmosphere},timeline:commonTimeline,
    layers:[...decor,...textLayers(variation,title,names)],responsive:{desktop:{particleMultiplier:1,parallaxMultiplier:1},tablet:{particleMultiplier:.72,parallaxMultiplier:.7},mobile:{particleMultiplier:.48,parallaxMultiplier:.4}}};
}

function jawaCover(variation){
  const x=variation.decorX,y=variation.decorY;
  const frontGenerator=variation.frontDecor==='mist'?'mist':'ornament-frame';
  const backGenerator=variation.backDecor==='glow'?'glow':'batik';
  return baseCover({preset:'jawa-cinematic',variation,background:{type:'procedural',transition:'cinematic-crossfade',durationMs:6000,transitionMs:1200},atmosphere:{intensity:.62},decor:[
    layer('jawa-back',backGenerator,'decor-back',{x:50,y:50,width:'110%',depth:.03,opacity:.54},{preset:'fade-in',decorMotion:'drift',decorDurationMs:16000,seed:`${variation.seed}-back`}),
    layer('hero-decor','gunungan','decor-main',{x,y,width:`${Math.round(74*variation.decorScale)}%`,depth:variation.parallax,opacity:variation.decorIntensity},{preset:variation.motion.hero,parallax:variation.parallax,decorMotion:variation.motion.decorMotion,variant:variation.heroVariant,seed:`${variation.seed}-hero`}),
    layer('jawa-front',frontGenerator,'decor-front',{x:50,y:50,width:'92%',depth:.2,opacity:.72},{preset:'fade-in',parallax:.08,decorMotion:'sway',decorDurationMs:11000,seed:`${variation.seed}-front`}),
    layer('hero-ambient','mist','ambient',{x:50,y:55,width:'120%',depth:.05,opacity:variation.ambientOpacity},{preset:'fade-in',decorMotion:'drift',decorDurationMs:13000,seed:`${variation.seed}-ambient`})]});
}

function oceanCover(variation){
  const frontGenerator=variation.frontDecor==='mist'?'mist':'wave';
  const backGenerator=variation.backDecor==='mist'?'mist':'glow';
  return baseCover({preset:'ocean-dream',variation,background:{type:'procedural',transition:'crossfade',durationMs:7000,transitionMs:1500},atmosphere:{intensity:.55},decor:[
    layer('ocean-back',backGenerator,'decor-back',{x:50,y:34,width:'114%',depth:.02,opacity:.8},{preset:'fade-in',decorMotion:'breathe',decorDurationMs:9000,seed:`${variation.seed}-back`}),
    layer('hero-ambient','mist','ambient',{x:50,y:37,width:'126%',depth:.05,opacity:variation.ambientOpacity},{preset:'fade-in',decorMotion:'drift',decorDurationMs:14000,seed:`${variation.seed}-ambient`}),
    layer('hero-decor','wave','decor-main',{x:variation.decorX,y:68,width:`${Math.round(132*variation.decorScale)}%`,depth:variation.parallax,opacity:.9},{preset:variation.motion.hero,parallax:variation.parallax,decorMotion:variation.motion.decorMotion,decorDurationMs:8200,variant:variation.heroVariant,seed:`${variation.seed}-hero`}),
    layer('ocean-front',frontGenerator,'decor-front',{x:50,y:79,width:'146%',depth:.28,opacity:.44},{preset:'fade-up',parallax:.22,decorMotion:'sway',decorDurationMs:10500,variant:'soft',seed:`${variation.seed}-front`})]});
}

function celestialCover(variation){
  const frontGenerator=variation.frontDecor,backGenerator=variation.backDecor;
  return baseCover({preset:'celestial-dream',variation,background:{type:'procedural',transition:'cosmic-dissolve',durationMs:8000,transitionMs:1800},atmosphere:{intensity:.58},decor:[
    layer('cosmic-back',backGenerator,'decor-back',{x:50,y:36,width:'118%',depth:.02,opacity:.78},{preset:'fade-in',decorMotion:'breathe',decorDurationMs:10000,count:variation.particleDensity,seed:`${variation.seed}-back`}),
    layer('hero-ambient','stars','ambient',{x:50,y:50,width:'116%',depth:.12,opacity:.88},{preset:'fade-in',parallax:.1,decorMotion:'drift',decorDurationMs:18000,count:variation.particleDensity,seed:`${variation.seed}-stars`}),
    layer('hero-decor','ornament-frame','decor-main',{x:variation.decorX,y:50,width:`${Math.round(76*variation.decorScale)}%`,depth:variation.parallax,opacity:.5},{preset:variation.motion.hero,parallax:variation.parallax,decorMotion:variation.motion.decorMotion,decorDurationMs:15000,seed:`${variation.seed}-hero`}),
    layer('celestial-front',frontGenerator,'decor-front',{x:50,y:72,width:'132%',depth:.24,opacity:.52},{preset:'fade-up',parallax:.18,decorMotion:'drift',decorDurationMs:12000,seed:`${variation.seed}-front`})]});
}

export const THEME_PACKS=Object.freeze({
  'jawa-luxury':{id:'jawa-luxury',label:'Jawa Luxury · HD Heritage',seedPrefix:'JL',palette:{background:'#efe3c9',surface:'#f8f0df',text:'#75542f',accent:'#a77a42',muted:'#9c7d59'},tokens:{radius:26,motionIntensity:.62,decorIntensity:.88},createCover:jawaCover,fidelityComposer:'jawa-fidelity-variants'},
  'ocean-romantic':{id:'ocean-romantic',label:'Ocean Romantic',seedPrefix:'OR',palette:{background:'#071a24',surface:'#0d3440',text:'#effcff',accent:'#8ee7e3',muted:'#8eb8c3'},tokens:{radius:28,motionIntensity:.72,decorIntensity:.7},createCover:oceanCover},
  'celestial-night':{id:'celestial-night',label:'Celestial Night',seedPrefix:'CN',palette:{background:'#060817',surface:'#11142d',text:'#f5f2ff',accent:'#b8a7ff',muted:'#9c9abd'},tokens:{radius:26,motionIntensity:.84,decorIntensity:.76},createCover:celestialCover}
});

export function createThemeProject(themeId='jawa-luxury',seed){
  const pack=THEME_PACKS[themeId]||THEME_PACKS['jawa-luxury'];
  const resolvedSeed=seed||`${pack.seedPrefix}-DEMO-001`;
  if(pack.fidelityComposer==='jawa-fidelity-variants'){
    const project=createJawaFidelityProject({seed:resolvedSeed});
    project.project.preset=pack.id;
    project.theme.id=pack.id;
    project.scenes=[...project.scenes,...emptyScenes.map(scene=>({...scene}))];
    return project;
  }
  const variation=resolveThemeVariation(pack.id,resolvedSeed);
  return {project:{id:`demo-${pack.id}`,name:`${pack.label} Demo`,version:1,preset:pack.id,seed:resolvedSeed},theme:{id:pack.id,palette:pack.palette,tokens:{...pack.tokens,motionIntensity:variation.motionIntensity,decorIntensity:variation.decorIntensity}},variation,audio:{src:'',autoplayAfterOpen:true,loop:true,volume:.75,fadeInMs:1200},scenes:[pack.createCover(variation),...emptyScenes.map(scene=>({...scene}))]};
}

export function getThemePackOptions(){return Object.values(THEME_PACKS).map(({id,label})=>({id,label}));}
export function getThemeSeedPrefix(themeId){return (THEME_PACKS[themeId]||THEME_PACKS['jawa-luxury']).seedPrefix;}
