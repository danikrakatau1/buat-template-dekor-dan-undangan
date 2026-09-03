export const ART_JAWA_COKLAT_3_REFERENCE_VERSION='11.1.0';
export const ART_JAWA_COKLAT_3_SOURCE='https://web.galeriundanganofficial.com/art-jawa-coklat-3/';

export const ART_JAWA_COKLAT_3_ASSETS=Object.freeze({
  artworkPlate:'https://web.galeriundanganofficial.com/wp-content/uploads/2026/03/download.png',
  coupleAccent:'https://web.galeriundanganofficial.com/wp-content/uploads/2026/03/download-1.png',
  openingMotion:'https://web.galeriundanganofficial.com/wp-content/uploads/2026/03/JAWA-COKLAT-3-1.mp4',
  footerLogo:'https://web.galeriundanganofficial.com/wp-content/uploads/2026/03/Logokuw.png'
});

const editable=(...fields)=>fields;

export const ART_JAWA_COKLAT_3_SECTION_MAP=Object.freeze([
  {
    order:1,sourceId:'cover',sceneId:'cover',type:'cover',label:'Cover',
    headings:['The Wedding Of','Benny & Indah','Kepada Bapak/Ibu/Saudara/i','Di Tempat'],
    assets:['artworkPlate'],
    motion:['fadeInUp','zoomIn','bounceIn'],
    behavior:{fixed:true,lockScrollBeforeOpen:true,openDurationMs:1500,openExit:'opacity + top -100%',playAudioOnOpen:true,showAllSectionsOnOpen:true},
    editable:editable('couple.names','guest.name','guest.locationLabel','music.src'),
    rebuildRole:'artwork plate + native typography + native CTA'
  },
  {
    order:2,sourceId:'buka',sceneId:'opening-motion',type:'opening-motion',label:'Opening Motion',
    headings:['THE WEDDING OF','Benny & Dinda','Minggu, 30 September 2026'],
    assets:['artworkPlate','openingMotion'],
    motion:['zoomIn','fadeInUp'],
    behavior:{videoStartsAfterCoverOpen:true,textRevealDelayMs:3000,buttonVisibleAfterVideoReady:true},
    editable:editable('couple.names','event.primaryDate','opening.video'),
    rebuildRole:'post-cover cinematic bridge'
  },
  {
    order:3,sourceId:'6089310',sceneId:'couple',type:'couple',label:'Couple Introduction',
    headings:['We Are Getting Married!','Indah','Beny'],
    assets:['artworkPlate','coupleAccent'],
    motion:['zoomIn','fadeInRight','fadeInUp'],
    editable:editable('couple.bride.name','couple.bride.fullName','couple.bride.parents','couple.groom.name','couple.groom.fullName','couple.groom.parents','intro.text'),
    rebuildRole:'paired bride/groom identity section'
  },
  {
    order:4,sourceId:'634b519',sceneId:'save-date',type:'save-date',label:'Save The Date / Quote',
    headings:['Save The Date'],
    assets:[],motion:['zoomIn','fadeInUp'],
    editable:editable('quote.text','quote.source','event.primaryDate','countdown.target'),
    rebuildRole:'quote + date + countdown rhythm section'
  },
  {
    order:5,sourceId:'b63e3f5',sceneId:'event',type:'event',label:'Wedding Event',
    headings:['Wedding','Event','Akad Nikah','Resepsi'],
    assets:['artworkPlate'],motion:['fadeInLeft','fadeInUp','zoomIn'],
    editable:editable('event.intro','event.akad.date','event.akad.time','event.akad.venue','event.akad.address','event.akad.map','event.reception.date','event.reception.time','event.reception.venue','event.reception.address','event.reception.map'),
    rebuildRole:'two event cards with heritage artwork plate'
  },
  {
    order:6,sourceId:'8c3c753',sceneId:'livestream',type:'livestream',label:'Live Streaming',
    headings:['live streaming'],assets:[],motion:['zoomIn','fadeInUp'],
    editable:editable('livestream.enabled','livestream.text','livestream.url','livestream.platform'),
    rebuildRole:'optional streaming CTA section'
  },
  {
    order:7,sourceId:'bc0eeaf',sceneId:'gallery',type:'gallery',label:'Gallery Foto',
    headings:['Galeri','Foto'],assets:[],motion:['zoomIn','fadeInRight','fadeInUp'],
    editable:editable('gallery.images'),
    rebuildRole:'photo gallery with staggered reveals'
  },
  {
    order:8,sourceId:'d41a1a2',sceneId:'story',type:'story',label:'Love Story',
    headings:['LOVE STORY'],assets:[],motion:['fadeInUp'],
    editable:editable('story.items'),
    rebuildRole:'timeline/story content'
  },
  {
    order:9,sourceId:'7e9a230',sceneId:'gift',type:'gift',label:'Wedding Gift',
    headings:['Wedding','Gift','Confirm'],assets:['artworkPlate'],motion:['fadeInRight','fadeInUp'],
    editable:editable('gift.intro','gift.accounts','gift.shippingAddress','gift.confirmationUrl'),
    rebuildRole:'bank/gift information + confirmation CTA'
  },
  {
    order:10,sourceId:'11baac1d',sceneId:'rsvp',type:'rsvp',label:'RSVP',
    headings:['RSVP'],assets:[],motion:['fadeInUp'],
    editable:editable('rsvp.enabled','rsvp.intro','rsvp.form'),
    rebuildRole:'attendance confirmation form'
  },
  {
    order:11,sourceId:'a6858f7',sceneId:'wishes',type:'wishes',label:'Ucapan & Doa',
    headings:['Ucapan','Doa'],assets:[],motion:['fadeInUp','zoomIn'],
    editable:editable('wishes.intro','wishes.entries','wishes.form'),
    rebuildRole:'guestbook / wishes section'
  },
  {
    order:12,sourceId:'43063afc',sceneId:'closing',type:'closing',label:'Closing',
    headings:['Terima Kasih','Benny & Dinda'],assets:[],motion:['fadeInUp'],
    editable:editable('couple.names','closing.text'),
    rebuildRole:'thank-you final invitation section'
  },
  {
    order:13,sourceId:'7cf4c407',sceneId:'credit',type:'credit',label:'Footer Credit',
    headings:['Exclusive Web Invitation Galeri Undangan Official ❤️'],assets:['footerLogo'],motion:['zoomIn'],
    editable:editable('branding.enabled','branding.text','branding.logo'),
    rebuildRole:'optional own-brand footer; source branding must not be copied into production'
  }
]);

export const ART_JAWA_COKLAT_3_MOTION_DICTIONARY=Object.freeze({
  fadeInUp:{studioPreset:'fade-up',intent:'soft vertical reveal'},
  fadeInRight:{studioPreset:'fade-right',intent:'directional editorial reveal'},
  fadeInLeft:{studioPreset:'fade-left',intent:'directional editorial reveal'},
  zoomIn:{studioPreset:'zoom-soft',intent:'ornament/image arrival'},
  bounceIn:{studioPreset:'cta-bounce-in',intent:'cover CTA emphasis'}
});

export function getArtJawaCoklat3ReferenceMap(){
  return {
    version:ART_JAWA_COKLAT_3_REFERENCE_VERSION,
    source:ART_JAWA_COKLAT_3_SOURCE,
    assets:ART_JAWA_COKLAT_3_ASSETS,
    sections:ART_JAWA_COKLAT_3_SECTION_MAP,
    motion:ART_JAWA_COKLAT_3_MOTION_DICTIONARY,
    contract:{
      referenceFirst:true,
      nativeRebuild:true,
      editableContent:true,
      copySourceBranding:false,
      generatedGenericPostCover:false,
      aiRole:'artwork transformation only; never invent page structure'
    }
  };
}
