import { getArtJawaCoklat3ReferenceMap } from './art-jawa-coklat-3-reference-map.js';

export const ART_JAWA_COKLAT_3_REBUILD_VERSION='11.7.0';

export const ART_JAWA_COKLAT_3_VISUAL_DNA=Object.freeze({
  palette:{paper:'#efe4cf',paperSoft:'#f7efdf',ink:'#5c4029',inkSoft:'#80684f',accent:'#8b643c',deep:'#49311f'},
  typography:{display:'Cormorant Infant, Cormorant, Georgia, serif',script:'Pinyon Script, Cormorant Infant, cursive',body:'Poppins, Inter, system-ui, sans-serif'},
  spacing:{sectionPadding:'10%',copyWidth:'78%',cardWidth:'82%',verticalRhythm:7},
  artwork:{mode:'single-plate-reuse',density:'edge-rich / center-readable',treatment:'warm engraving stationery',generatedDecor:false},
  motion:{image:'zoom-soft',heading:'fade-up',editorialRight:'fade-right',editorialLeft:'fade-left',cta:'cta-bounce-in',openingDurationMs:1500},
  surface:{radius:24,border:'rgba(92,64,41,.18)',shadow:'0 18px 42px rgba(73,49,31,.12)'}
});

const DEFAULT_DATA=Object.freeze({
  couple:{names:'Anif & Dini',bride:'Dini',groom:'Anif',intro:'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.'},
  guest:{name:'Tamu Undangan',location:'Di Tempat'},
  event:{date:'Sabtu, 18 April 2026',akad:'08.00 WIB',reception:'11.00 WIB',venue:'Kediaman Mempelai',address:'Kertoharjo Gang 10'},
  quote:'Dengan memohon rahmat dan ridho Allah SWT, kami mengundang Bapak/Ibu/Saudara/i untuk hadir di hari bahagia kami.',
  story:['Pertemuan','Lamaran','Hari Bahagia'],
  closing:'Merupakan suatu kehormatan bagi kami atas kehadiran dan doa restu yang diberikan.'
});

const clone=v=>globalThis.structuredClone?structuredClone(v):JSON.parse(JSON.stringify(v));
const text=(id,content,x,y,width='78%',motion='fade-up',role='content',extra={})=>({id,kind:'text',role,content,transform:{x,y,width,opacity:1},motion:{preset:motion,durationMs:760},...extra});
const button=(id,content,x,y,width='160px')=>({id,kind:'button',role:'interaction',content,transform:{x,y,width,opacity:1},motion:{preset:'zoom-soft',durationMs:760}});
const image=(id,src,x=50,y=50,width='100%',opacity=1,role='background')=>({id,kind:'image',role,src,asset:{src,resolvedSrc:src},transform:{x,y,width,opacity,scale:1,depth:0},motion:{preset:'zoom-soft',durationMs:1100,parallax:0}});
const field=(id,placeholder,x,y,width='76%',kind='field')=>({id,kind,role:'content',content:placeholder,transform:{x,y,width,opacity:1},motion:{preset:'fade-up',durationMs:620}});

function findArtwork(project){
  for(const scene of project?.scenes||[]){
    const candidate=(scene.layers||[]).find(layer=>layer?.id==='ai-transformed-base'||(layer?.kind==='image'&&layer?.role==='background'));
    const src=candidate?.asset?.resolvedSrc||candidate?.asset?.src||candidate?.src;
    if(src)return src;
  }
  return '';
}

function scene(id,type,layers,{tone='paper',minHeight='100%',sourceId=''}={}){
  return {id,type,preset:'art-jawa-coklat-3-native',referenceSourceId:sourceId,referenceNative:true,referenceTone:tone,minHeight,background:null,atmosphere:{effects:[]},layers,timeline:[],responsive:{desktop:{parallaxMultiplier:.16},tablet:{parallaxMultiplier:.1},mobile:{parallaxMultiplier:.05}}};
}

export function buildArtJawaCoklat3NativeProject(sourceProject,{data={}}={}){
  const map=getArtJawaCoklat3ReferenceMap();
  const project=clone(sourceProject||{}),d={...DEFAULT_DATA,...data,couple:{...DEFAULT_DATA.couple,...data.couple},guest:{...DEFAULT_DATA.guest,...data.guest},event:{...DEFAULT_DATA.event,...data.event}};
  const art=findArtwork(project);
  if(!art)throw new Error('Reference rebuild membutuhkan generated artwork plate.');

  const scenes=[
    scene('cover','cover',[
      image('reference-cover-art',art),
      text('cover-title','THE WEDDING OF',50,17,'72%','fade-up','content',{style:{tone:'eyebrow'}}),
      text('cover-names',d.couple.names,50,25,'82%','fade-up','content',{style:{tone:'display'}}),
      text('cover-guest-label','Kepada Bapak/Ibu/Saudara/i',50,40,'72%','fade-up'),
      text('cover-guest',d.guest.name,50,45,'72%','fade-up','content',{style:{tone:'guest'}}),
      text('cover-location',d.guest.location,50,49,'60%','fade-up'),
      button('cover-open','Buka Undangan',50,57,'154px')
    ],{sourceId:'cover'}),

    scene('opening-motion','opening-motion',[
      image('opening-art',art,50,50,'108%',1),
      text('opening-eyebrow','THE WEDDING OF',50,29,'70%','zoom-soft'),
      text('opening-names',d.couple.names,50,38,'84%','fade-up','content',{style:{tone:'display'}}),
      text('opening-date',d.event.date,50,49,'72%','fade-up')
    ],{tone:'cinematic',sourceId:'buka'}),

    scene('couple','couple',[
      image('couple-art',art,50,25,'92%',.30),
      text('couple-kicker','WE ARE',50,18,'60%','fade-right'),
      text('couple-title','Getting Married!',50,25,'82%','fade-up','content',{style:{tone:'display'}}),
      text('couple-intro',d.couple.intro,50,39,'78%','fade-up'),
      text('bride-name',d.couple.bride,32,62,'38%','fade-right','content',{style:{tone:'person'}}),
      text('bride-meta','Putri tercinta dari keluarga mempelai wanita',32,69,'38%','fade-up'),
      text('groom-name',d.couple.groom,68,62,'38%','fade-left','content',{style:{tone:'person'}}),
      text('groom-meta','Putra tercinta dari keluarga mempelai pria',68,69,'38%','fade-up')
    ],{sourceId:'6089310'}),

    scene('save-date','save-date',[
      image('save-art',art,50,50,'106%',.18),
      text('save-kicker','SAVE',50,18,'66%','fade-right'),
      text('save-title','The Date',50,26,'78%','fade-up','content',{style:{tone:'display'}}),
      text('save-quote',d.quote,50,43,'76%','fade-up'),
      text('save-date-value',d.event.date,50,61,'76%','zoom-soft','content',{style:{tone:'date'}}),
      text('save-countdown','00  HARI   00  JAM   00  MENIT',50,72,'78%','fade-up')
    ],{sourceId:'634b519'}),

    scene('event','event',[
      image('event-art',art,50,50,'108%',.16),
      text('event-kicker','WEDDING',50,12,'62%','fade-left'),
      text('event-title','Event',50,19,'76%','fade-up','content',{style:{tone:'display'}}),
      text('event-intro','Tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami.',50,29,'80%','fade-up'),
      text('event-akad-title','Akad Nikah',50,44,'68%','fade-up','content',{style:{tone:'card-title'}}),
      text('event-akad-detail',`${d.event.date} · ${d.event.akad}\n${d.event.venue}\n${d.event.address}`,50,53,'74%','fade-up','content',{style:{tone:'card'}}),
      text('event-reception-title','Resepsi',50,67,'68%','fade-up','content',{style:{tone:'card-title'}}),
      text('event-reception-detail',`${d.event.date} · ${d.event.reception}\n${d.event.venue}\n${d.event.address}`,50,76,'74%','fade-up','content',{style:{tone:'card'}}),
      button('event-map','Buka Google Maps',50,89,'170px')
    ],{sourceId:'b63e3f5'}),

    scene('livestream','livestream',[
      image('live-art',art,50,50,'106%',.20),
      text('live-kicker','LIVE',50,22,'60%','zoom-soft'),
      text('live-title','Streaming',50,31,'76%','fade-up','content',{style:{tone:'display'}}),
      text('live-copy','Saksikan momen bahagia kami secara daring apabila belum dapat hadir secara langsung.',50,48,'76%','fade-up'),
      button('live-open','Buka Live Streaming',50,64,'180px')
    ],{sourceId:'8c3c753'}),

    scene('gallery','gallery',[
      text('gallery-kicker','GALERI',50,10,'60%','fade-right'),
      text('gallery-title','Foto',50,17,'70%','fade-up','content',{style:{tone:'display'}}),
      image('gallery-1',art,28,43,'43%',1,'media'),image('gallery-2',art,72,43,'43%',1,'media'),image('gallery-3',art,50,76,'64%',1,'media')
    ],{sourceId:'bc0eeaf'}),

    scene('story','story',[
      image('story-art',art,50,50,'106%',.14),
      text('story-title','LOVE STORY',50,14,'72%','fade-up','content',{style:{tone:'eyebrow'}}),
      text('story-1',`01 · ${d.story[0]}\nKisah kami dimulai dan tumbuh melalui waktu yang kami jalani bersama.`,50,34,'76%','fade-up','content',{style:{tone:'story-card'}}),
      text('story-2',`02 · ${d.story[1]}\nSebuah langkah baru membawa dua keluarga menuju hari yang dinantikan.`,50,55,'76%','fade-up','content',{style:{tone:'story-card'}}),
      text('story-3',`03 · ${d.story[2]}\nDengan doa dan restu, kami memulai perjalanan sebagai keluarga.`,50,76,'76%','fade-up','content',{style:{tone:'story-card'}})
    ],{sourceId:'d41a1a2'}),

    scene('gift','gift',[
      image('gift-art',art,50,50,'107%',.16),
      text('gift-kicker','WEDDING',50,13,'64%','fade-right'),
      text('gift-title','Gift',50,21,'72%','fade-up','content',{style:{tone:'display'}}),
      text('gift-copy','Doa restu merupakan hadiah terindah bagi kami. Apabila ingin mengirim tanda kasih, informasi dapat ditampilkan di sini.',50,36,'78%','fade-up'),
      text('gift-bank','BANK / E-WALLET\n0000 0000 0000\nANIF & DINI',50,55,'72%','fade-up','content',{style:{tone:'gift-card'}}),
      text('gift-address',`Kirim Hadiah\n${d.event.address}`,50,72,'72%','fade-up','content',{style:{tone:'gift-card'}}),
      button('gift-confirm','Konfirmasi Gift',50,87,'165px')
    ],{sourceId:'7e9a230'}),

    scene('rsvp','rsvp',[
      image('rsvp-art',art,50,50,'106%',.12),
      text('rsvp-title','RSVP',50,15,'70%','fade-up','content',{style:{tone:'display'}}),
      text('rsvp-copy','Mohon konfirmasi kehadiran Anda melalui formulir berikut.',50,27,'76%','fade-up'),
      field('rsvp-name','Nama',50,43),field('rsvp-status','Konfirmasi Kehadiran',50,53),field('rsvp-guests','Jumlah Tamu',50,63),
      button('rsvp-submit','Kirim Konfirmasi',50,78,'170px')
    ],{sourceId:'11baac1d'}),

    scene('wishes','wishes',[
      image('wishes-art',art,50,50,'106%',.12),
      text('wishes-kicker','UCAPAN',50,12,'62%','fade-up'),
      text('wishes-title','& Doa',50,20,'72%','zoom-soft','content',{style:{tone:'display'}}),
      field('wish-name','Nama',50,36),field('wish-message','Tulis ucapan dan doa...',50,49,'76%','textarea'),button('wish-submit','Kirim Ucapan',50,63,'160px'),
      text('wish-sample','“Semoga menjadi keluarga yang sakinah, mawaddah, warahmah.”',50,79,'76%','fade-up','content',{style:{tone:'wish-card'}})
    ],{sourceId:'a6858f7'}),

    scene('closing','closing',[
      image('closing-art',art,50,50,'108%',.34),
      text('closing-title','Terima Kasih',50,27,'76%','fade-up','content',{style:{tone:'display'}}),
      text('closing-copy',d.closing,50,42,'76%','fade-up'),
      text('closing-names',d.couple.names,50,62,'82%','fade-up','content',{style:{tone:'display'}})
    ],{sourceId:'43063afc'})
  ];

  project.project={...(project.project||{}),name:'ART JAWA COKLAT 3 · Native Reference Rebuild',preset:'art-jawa-coklat-3-native',version:2};
  project.theme={id:'art-jawa-coklat-3-native',palette:{background:ART_JAWA_COKLAT_3_VISUAL_DNA.palette.paper,text:ART_JAWA_COKLAT_3_VISUAL_DNA.palette.ink,accent:ART_JAWA_COKLAT_3_VISUAL_DNA.palette.accent,surface:ART_JAWA_COKLAT_3_VISUAL_DNA.palette.paperSoft}};
  project.generator={...(project.generator||{}),mode:'reference-native-rebuild',referenceNativeRebuild:true,referenceVersion:ART_JAWA_COKLAT_3_REBUILD_VERSION,sourceMapVersion:map.version,generatedGenericPostCover:false,visualDNA:true,dataBinding:true,motionMatch:true,fidelityQA:true,disableEditorOverlay:true};
  project.reference={source:map.source,contract:map.contract,visualDNA:ART_JAWA_COKLAT_3_VISUAL_DNA,data:d};
  project.scenes=scenes;
  project.referenceQA=runReferenceFidelityQA(project);
  return project;
}

export function runReferenceFidelityQA(project){
  const required=['cover','opening-motion','couple','save-date','event','livestream','gallery','story','gift','rsvp','wishes','closing'];
  const ids=new Set((project?.scenes||[]).map(s=>s.id));
  const missing=required.filter(id=>!ids.has(id));
  const empty=(project?.scenes||[]).filter(s=>!(s.layers||[]).length).map(s=>s.id);
  const generic=(project?.scenes||[]).filter(s=>(s.layers||[]).some(l=>/placeholder/i.test(String(l.id||'')))).map(s=>s.id);
  let score=100-missing.length*8-empty.length*6-generic.length*4;
  const cover=project?.scenes?.find(s=>s.id==='cover');
  if(!cover?.layers?.some(l=>l.id==='reference-cover-art'))score-=12;
  if(!cover?.layers?.some(l=>l.id==='cover-open'))score-=8;
  score=Math.max(0,score);
  return {score,status:score>=96?'locked':score>=84?'pass-with-warning':'review',missing,empty,generic,sceneCount:project?.scenes?.length||0};
}
