const fs = require('fs');
const path = require('path');
const express = require('express');
const nodemailer = require('nodemailer');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const { parsePhoneNumberFromString } = require('libphonenumber-js');
const createCheckoutSession = require('./api/create-checkout-session');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const IMAGE_VERSION = '20260827-13';
const ORDER_COUNTRIES={
  AL:{name:"Albania",nominatim:"al"},
  AD:{name:"Andorra",nominatim:"ad"},
  AM:{name:"Armenia",nominatim:"am"},
  AT:{name:"Austria",nominatim:"at"},
  AZ:{name:"Azerbaigian",nominatim:"az"},
  BY:{name:"Bielorussia",nominatim:"by"},
  BE:{name:"Belgio",nominatim:"be"},
  BA:{name:"Bosnia ed Erzegovina",nominatim:"ba"},
  BG:{name:"Bulgaria",nominatim:"bg"},
  HR:{name:"Croazia",nominatim:"hr"},
  CY:{name:"Cipro",nominatim:"cy"},
  CZ:{name:"Cechia",nominatim:"cz"},
  DK:{name:"Danimarca",nominatim:"dk"},
  EE:{name:"Estonia",nominatim:"ee"},
  FI:{name:"Finlandia",nominatim:"fi"},
  FR:{name:"Francia",nominatim:"fr"},
  GE:{name:"Georgia",nominatim:"ge"},
  DE:{name:"Germania",nominatim:"de"},
  GR:{name:"Grecia",nominatim:"gr"},
  HU:{name:"Ungheria",nominatim:"hu"},
  IS:{name:"Islanda",nominatim:"is"},
  IE:{name:"Irlanda",nominatim:"ie"},
  IT:{name:"Italia",nominatim:"it"},
  XK:{name:"Kosovo",nominatim:"xk"},
  LV:{name:"Lettonia",nominatim:"lv"},
  LI:{name:"Liechtenstein",nominatim:"li"},
  LT:{name:"Lituania",nominatim:"lt"},
  LU:{name:"Lussemburgo",nominatim:"lu"},
  MT:{name:"Malta",nominatim:"mt"},
  MD:{name:"Moldova",nominatim:"md"},
  MC:{name:"Monaco",nominatim:"mc"},
  ME:{name:"Montenegro",nominatim:"me"},
  NL:{name:"Paesi Bassi",nominatim:"nl"},
  MK:{name:"Macedonia del Nord",nominatim:"mk"},
  NO:{name:"Norvegia",nominatim:"no"},
  PL:{name:"Polonia",nominatim:"pl"},
  PT:{name:"Portogallo",nominatim:"pt"},
  RO:{name:"Romania",nominatim:"ro"},
  RU:{name:"Russia",nominatim:"ru"},
  SM:{name:"San Marino",nominatim:"sm"},
  RS:{name:"Serbia",nominatim:"rs"},
  SK:{name:"Slovacchia",nominatim:"sk"},
  SI:{name:"Slovenia",nominatim:"si"},
  ES:{name:"Spagna",nominatim:"es"},
  SE:{name:"Svezia",nominatim:"se"},
  CH:{name:"Svizzera",nominatim:"ch"},
  TR:{name:"Turchia",nominatim:"tr"},
  UA:{name:"Ucraina",nominatim:"ua"},
  GB:{name:"Regno Unito",nominatim:"gb"},
  VA:{name:"Città del Vaticano",nominatim:"va"},
  AX:{name:"Isole Åland",nominatim:"ax"},
  FO:{name:"Isole Faroe",nominatim:"fo"},
  GI:{name:"Gibilterra",nominatim:"gi"},
  GG:{name:"Guernsey",nominatim:"gg"},
  IM:{name:"Isola di Man",nominatim:"im"},
  JE:{name:"Jersey",nominatim:"je"},
  SJ:{name:"Svalbard e Jan Mayen",nominatim:"sj"}
};

/*
 * Pesi di spedizione stimati (grammi): prodotto + confezione primaria.
 * Il peso del pacco aggiunge poi scatola e materiale protettivo.
 * Tariffe Poste: Poste Delivery Web nazionale e Poste Delivery International
 * Standard "prezzi speciali" (pre-accettazione web), listino Poste maggio 2026.
 */
const ORDER_SHIP_WEIGHT_G={
  'millefiori':430,'melone':430,'fragola':430,'pesca':430,'arancia':430,
  'propolterapy-professional':1500,'capsule-pb':120,'capsule-propolit':120,
  'castagno':430,'acacia-zenzero-apinfiore':370,'miele-eucalipto-apinfiore':430,'balsammiel':370,
  'acacia':110,'favo-integrale-bio':300,'polline-italiano':220,'pappa-reale-italiana-bio':80,'orsetti-gommosi':125,
  'bee-energy-bio':360,'propol-active-bio':90,'propoli-30-spray-integratore':85,'propoli-30-alcolica-integratore':85,'propoli-analcolica-integratore':85,
  'cosmesi-crema-mani':145,'cosmesi-burrocacao-propoli-aloe':25,'cosmesi-burrocacao-miele-pappa-reale':25,
  'cosmesi-shampoo-multivitaminico':320,'cosmesi-saponetta-frutti-bosco':125,'cosmesi-saponetta-lavanda':125,'cosmesi-saponetta-aloe-vera':125,
  'cosmesi-candela-alveare-cera-api':180,'cosmesi-travel-kit-benessere':330,
  'unguento-apis':80,'sos-dol-50ml':150,'apis1-crema-viso-veleno-api':160,'apis2-siero-viso-veleno-api':130,
  'apis4-crema-corpo-veleno-api-manuka':340,'apis5-gommage-veleno-api-manuka':340,'bagnodoccia-veleno-oro':320,
  'tesori-limoncello':500,'tesori-liquore-caffe':500,'tesori-castagne-rum':500
};
const POSTE_ZONE_BY_COUNTRY={
  AT:'1',BE:'1',BA:'1',HR:'1',DK:'1',EE:'1',FI:'1',FR:'1',DE:'1',GR:'1',IE:'1',XK:'1',LV:'1',LI:'1',LT:'1',LU:'1',MT:'1',NL:'1',PL:'1',PT:'1',CZ:'1',RO:'1',SK:'1',SI:'1',ES:'1',SE:'1',CH:'1',HU:'1',
  BG:'2',CY:'2',RS:'2',TR:'2',
  AL:'3',IS:'3',NO:'3',UA:'3',
  AZ:'4',MK:'4',MD:'4',ME:'4',
  BY:'7',GB:'8',AM:'4TRIS',GE:'4QUATER',RU:'4QUATER'
};
const POSTE_INTL_2026={
  '1':[24.75,29.60,32.80,43.00,47.85,58.10],
  '2':[26.35,32.80,37.65,53.25,63.45,79.55],
  '3':[28.50,34.95,43.00,55.40,69.35,84.95],
  '4':[30.65,36.55,46.25,61.30,76.90,91.95],
  '5':[34.95,43.00,52.15,72.60,104.30,125.85],
  '6':[43.00,47.85,57.00,93.05,129.60,176.90],
  '7':[28.50,34.95,43.00,56.45,71.50,88.70],
  '8':[24.75,27.40,32.80,46.80,51.05,63.45],
  '3BIS':[31.20,38.15,60.75,80.65,103.80,126.90],
  '4BIS':[32.80,41.90,64.55,88.70,112.90,137.65],
  '4TRIS':[31.20,38.15,50.00,67.75,86.00,106.45],
  '4QUATER':[31.20,38.15,48.40,72.05,91.95,114.00]
};
const POSTE_INTL_LIMITS_KG=[1,3,5,10,15,20];
const POSTE_ITALY_2026=[
  [1,5.65],[2,5.90],[3,6.70],[5,7.30],[10,10.40],[15,11.70],[20,12.30],[25,14.80],[30,14.80],[40,28.30],[50,32.30],[70,39.70]
];

function estimateParcelWeight(items){
  let productGrams=0;
  for(const item of items){
    const unit=Number(ORDER_SHIP_WEIGHT_G[item.id]||250);
    productGrams+=unit*Math.max(1,Number(item.qty||1));
  }
  const packing=Math.min(1200,Math.max(180,Math.round(120+productGrams*0.10)));
  const totalGrams=productGrams+packing;
  return {productGrams,packingGrams:packing,totalGrams,kg:Math.ceil(totalGrams/10)/100};
}
function calcPosteShipping(country,items){
  const weight=estimateParcelWeight(items);
  if(country==='IT'){
    const band=POSTE_ITALY_2026.find(([maxKg])=>weight.kg<=maxKg);
    if(!band) return {ok:true,pending:true,weightKg:weight.kg,reasonCode:'overweight',carrier:'Poste Italiane'};
    return {ok:true,pending:false,cost:band[1],weightKg:weight.kg,bandKg:band[0],carrier:'Poste Italiane',service:'Poste Delivery Web'};
  }
  const zone=POSTE_ZONE_BY_COUNTRY[country];
  if(!zone) return {ok:true,pending:true,weightKg:weight.kg,reasonCode:'no-zone',carrier:'Poste Italiane'};
  const idx=POSTE_INTL_LIMITS_KG.findIndex(max=>weight.kg<=max);
  if(idx<0) return {ok:true,pending:true,weightKg:weight.kg,zone,reasonCode:'overweight',carrier:'Poste Italiane',service:'Poste Delivery International Standard'};
  return {ok:true,pending:false,cost:POSTE_INTL_2026[zone][idx],weightKg:weight.kg,bandKg:POSTE_INTL_LIMITS_KG[idx],zone,carrier:'Poste Italiane',service:'Poste Delivery International Standard'};
}

try {
  const encodedImagePath = path.join(__dirname, 'images', 'centro-porticato-home-fixed.txt');
  const targetImagePath = path.join(__dirname, 'images', 'centro-porticato-home.jpg');
  if (fs.existsSync(encodedImagePath)) {
    const encoded = fs.readFileSync(encodedImagePath, 'utf8').trim();
    const imageBuffer = Buffer.from(encoded, 'base64');
    if (imageBuffer.length > 1000) fs.writeFileSync(targetImagePath, imageBuffer);
  }
} catch (error) { console.error('[Miele Artigianale] Errore ricostruzione immagine Centro:', error); }

app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));
app.post('/api/create-checkout-session', createCheckoutSession);

const SITE_TRANSLATE_LANGS = new Set(['en','de','fr','es']);
const siteTranslateCache = new Map();

async function siteTranslateOne(text,target){
  const clean=String(text||'').trim();
  if(!clean || !SITE_TRANSLATE_LANGS.has(target)) return clean;
  const key=target+'\n'+clean;
  if(siteTranslateCache.has(key)) return siteTranslateCache.get(key);
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),8000);
  try{
    const url='https://translate.googleapis.com/translate_a/single?client=gtx&sl=it&tl='+encodeURIComponent(target)+'&dt=t&q='+encodeURIComponent(clean);
    const response=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0'},signal:controller.signal});
    if(!response.ok) throw new Error('translate '+response.status);
    const data=await response.json();
    const out=Array.isArray(data?.[0])?data[0].map(x=>Array.isArray(x)?(x[0]||''):'').join(''):clean;
    const value=String(out||clean).trim()||clean;
    siteTranslateCache.set(key,value);
    if(siteTranslateCache.size>5000){
      const first=siteTranslateCache.keys().next().value;
      siteTranslateCache.delete(first);
    }
    return value;
  }catch(_){
    return clean;
  }finally{
    clearTimeout(timer);
  }
}

async function siteTranslateBatchAI(texts,target){
  const apiKey=String(process.env.GROQ_API_KEY||'').trim();
  if(!apiKey||!Array.isArray(texts)||!texts.length) return {};
  const language={en:'English',de:'German',fr:'French',es:'Spanish'}[target];
  if(!language) return {};
  const payload=texts.map((text,index)=>({index,text:String(text||'')}));
  const prompt=[
    'Translate each Italian website UI string into '+language+'.',
    'Return ONLY valid JSON: an array of objects with exactly {"index":number,"translation":string}.',
    'Keep brand names unchanged: LA FABBRICA DELLE API, ALTHEA 12830, La Galena delle Api, Oasi del Busatello, Alveo Digitale, Ape Pelù.',
    'Keep product codes, numbers, prices, units and URLs unchanged.',
    'Translate all ordinary headings, descriptions, buttons and labels naturally and completely.',
    'Do not add explanations.',
    JSON.stringify(payload)
  ].join('\n');
  try{
    const aiResponse=await fetch('https://api.groq.com/openai/v1/chat/completions',{
      method:'POST',
      headers:{'Authorization':'Bearer '+apiKey,'Content-Type':'application/json'},
      body:JSON.stringify({
        model:String(process.env.GROQ_MODEL||'openai/gpt-oss-20b'),
        messages:[{role:'user',content:prompt}],
        max_tokens:2200,
        reasoning_effort:'low',
        reasoning_format:'hidden',
        temperature:0.05
      })
    });
    const data=await aiResponse.json().catch(()=>null);
    if(!aiResponse.ok) throw new Error('Groq '+aiResponse.status+' '+String(data?.error?.message||''));
    let raw=String(data?.choices?.[0]?.message?.content||'').trim();
    raw=raw.replace(/^\`\`\`(?:json)?\s*/i,'').replace(/\s*\`\`\`$/,'');
    const parsed=JSON.parse(raw);
    const out={};
    if(Array.isArray(parsed)){
      for(const item of parsed){
        const i=Number(item?.index);
        const tr=String(item?.translation||'').trim();
        if(Number.isInteger(i)&&i>=0&&i<texts.length&&tr) out[i]=tr;
      }
    }
    return out;
  }catch(error){
    console.error('[Site Translate Groq]',error);
    return {};
  }
}

app.post('/api/site-translate', async (req,res)=>{
  res.setHeader('Cache-Control','private, max-age=3600');
  const target=String(req.body?.target||'').toLowerCase().slice(0,2);
  const raw=Array.isArray(req.body?.texts)?req.body.texts:[];
  if(!SITE_TRANSLATE_LANGS.has(target)) return res.status(400).json({ok:false,error:'Lingua non supportata.'});
  if(!raw.length || raw.length>60) return res.status(400).json({ok:false,error:'Richiesta traduzione non valida.'});
  const texts=raw.map(x=>String(x||'').replace(/\s+/g,' ').trim().slice(0,1200));
  if(texts.reduce((n,x)=>n+x.length,0)>30000) return res.status(413).json({ok:false,error:'Testo troppo lungo.'});

  const results=new Array(texts.length);
  let cursor=0;
  const workers=Array.from({length:6},async()=>{
    while(cursor<texts.length){
      const i=cursor++;
      results[i]=await siteTranslateOne(texts[i],target);
    }
  });
  await Promise.all(workers);

  const unresolvedIndexes=[];
  for(let i=0;i<texts.length;i++){
    if(!results[i] || String(results[i]).trim()===String(texts[i]).trim()) unresolvedIndexes.push(i);
  }
  if(unresolvedIndexes.length){
    const unresolvedTexts=unresolvedIndexes.map(i=>texts[i]);
    const ai=await siteTranslateBatchAI(unresolvedTexts,target);
    unresolvedIndexes.forEach((originalIndex,localIndex)=>{
      const candidate=String(ai[localIndex]||'').trim();
      if(candidate && candidate!==texts[originalIndex]){
        results[originalIndex]=candidate;
        siteTranslateCache.set(target+'\n'+texts[originalIndex],candidate);
      }
    });
  }
  return res.json({ok:true,target,translations:results});
});

async function magazineTranslateOne(text,target){
  const apiKey=String(process.env.GROQ_API_KEY||'').trim();
  if(!apiKey) throw new Error('GROQ_API_KEY assente');
  const language={en:'English',de:'German',fr:'French',es:'Spanish'}[target];
  const prompt=[
    'Translate the following Italian magazine page completely into '+language+'.',
    'Translate EVERY Italian heading, label, recipe title, footer phrase and body sentence. Do not leave Italian words untranslated unless they are one of the protected brand or proper names listed below.',
    'Return ONLY the translated page text, no notes and no markdown fences.',
    'Preserve the original line-break structure as closely as possible.',
    'Preserve all numbers, quantities, temperatures, page numbers and list numbering.',
    'Keep ONLY these protected names unchanged: ALTHEA 12830, La Fabbrica delle Api, La Galena delle Api, Oasi del Busatello. Product title "10 Colazioni dell’Alveare" must be translated naturally into the target language.',
    'Translate natural editorial headings and recipe text fluently, not literally.',
    'Honey variety names may be translated naturally when appropriate, but keep product identity clear.',
    'Do not add health claims or information not present in the source.',
    '',
    String(text||'')
  ].join('\n');
  let lastError=null;
  for(let attempt=0;attempt<4;attempt++){
    const aiResponse=await fetch('https://api.groq.com/openai/v1/chat/completions',{
      method:'POST',
      headers:{'Authorization':'Bearer '+apiKey,'Content-Type':'application/json'},
      body:JSON.stringify({
        model:'openai/gpt-oss-20b',
        messages:[{role:'user',content:prompt}],
        max_tokens:650,
        reasoning_effort:'low',
        reasoning_format:'hidden',
        temperature:0.1
      })
    });
    const data=await aiResponse.json().catch(()=>null);
    if(aiResponse.ok){
      const out=String(data?.choices?.[0]?.message?.content||'').trim();
      if(out) return out;
      lastError=new Error('Traduzione Groq vuota');
    }else{
      lastError=new Error('Groq translate '+aiResponse.status+' '+String(data?.error?.message||''));
      if(aiResponse.status!==429) break;
    }
    if(attempt<3) await new Promise(resolve=>setTimeout(resolve,16000));
  }
  throw lastError||new Error('Traduzione non disponibile');
}



app.get('/api/magazine-translate-all', async (req,res)=>{
  res.setHeader('Cache-Control','no-store');
  const target=String(req.query?.target||'').toLowerCase().slice(0,2);
  if(!['en','de','fr','es'].includes(target)) return res.status(400).json({ok:false,error:'Lingua non supportata.'});
  try{
    const src=require('./translations/10-colazioni-it-source.json');
    const pages=Array.isArray(src.pages)?src.pages:[];
    const translations=await Promise.all(pages.map(t=>magazineTranslateOne(String(t||''),target)));
    return res.json({ok:true,target,total:translations.length,translations});
  }catch(error){
    console.error('[Magazine Translate All]',error);
    return res.status(502).json({ok:false,error:'Traduzione completa non disponibile.'});
  }
});

app.get('/api/magazine-translate-pages', async (req,res)=>{
  res.setHeader('Cache-Control','no-store');
  const target=String(req.query?.target||'').toLowerCase().slice(0,2);
  const start=Math.max(1,Math.floor(Number(req.query?.start||1)));
  const count=Math.max(1,Math.min(5,Math.floor(Number(req.query?.count||1))));
  if(!['en','de','fr','es'].includes(target)) return res.status(400).json({ok:false,error:'Lingua non supportata.'});
  try{
    const src=require('./translations/10-colazioni-it-source.json');
    const selected=(src.pages||[]).slice(start-1,start-1+count);
    if(!selected.length) return res.status(404).json({ok:false,error:'Pagine non trovate.'});
    const translations=await Promise.all(selected.map(t=>magazineTranslateOne(String(t||''),target)));
    return res.json({ok:true,target,start,count:translations.length,total:Number(src.pageCount||src.pages?.length||0),translations});
  }catch(error){
    console.error('[Magazine Translate Pages]',error);
    return res.status(502).json({ok:false,error:'Traduzione non disponibile.'});
  }
});

app.get('/api/magazine-translate-get', async (req,res)=>{
  res.setHeader('Cache-Control','no-store');
  const target=String(req.query?.target||'').toLowerCase().slice(0,2);
  if(!SITE_TRANSLATE_LANGS.has(target)) return res.status(400).json({ok:false,error:'Lingua non supportata.'});
  let texts=[];
  try{ texts=JSON.parse(String(req.query?.q||'')); }
  catch(_){ return res.status(400).json({ok:false,error:'Testo non valido.'}); }
  if(!Array.isArray(texts)||!texts.length||texts.length>5) return res.status(400).json({ok:false,error:'Richiesta non valida.'});
  if(texts.reduce((n,x)=>n+String(x||'').length,0)>9000) return res.status(413).json({ok:false,error:'Testo troppo lungo.'});
  try{
    const translations=[];
    for(const t of texts) translations.push(await magazineTranslateOne(String(t||''),target));
    return res.json({ok:true,target,translations});
  }catch(error){
    console.error('[Magazine Translate]',error);
    return res.status(502).json({ok:false,error:'Traduzione non disponibile.'});
  }
});
app.get('/api/site-translate-get', async (req,res)=>{
  res.setHeader('Cache-Control','no-store');
  const target=String(req.query?.target||'').toLowerCase().slice(0,2);
  if(!SITE_TRANSLATE_LANGS.has(target)) return res.status(400).json({ok:false,error:'Lingua non supportata.'});
  let texts=[];
  try{
    const raw=String(req.query?.q||'');
    try{ texts=JSON.parse(raw); }
    catch(_){ texts=JSON.parse(Buffer.from(raw,'base64url').toString('utf8')); }
  }catch(_){
    return res.status(400).json({ok:false,error:'Testo non valido.'});
  }
  if(!Array.isArray(texts) || !texts.length || texts.length>20) return res.status(400).json({ok:false,error:'Richiesta non valida.'});
  const clean=texts.map(x=>String(x||'').slice(0,5000));
  if(clean.reduce((n,x)=>n+x.length,0)>18000) return res.status(413).json({ok:false,error:'Testo troppo lungo.'});
  const translations=await Promise.all(clean.map(x=>siteTranslateOne(x,target)));
  return res.json({ok:true,target,translations});
});


app.get('/api/ape-pelu-status', (req, res) => {
  const configured = Boolean(String(process.env.GROQ_API_KEY || '').trim());
  res.setHeader('Cache-Control','no-store');
  return res.json({
    ok:true,
    aiConfigured:configured,
    provider:'groq',
    model:String(process.env.GROQ_MODEL || 'openai/gpt-oss-20b')
  });
});

const APE_V2_OFFICIAL_PRODUCTS = [{"id":"propolterapy-professional","section":"alveoterapia-prodotti","name":"PropolTerapy Professional","size":"Diffusore + 5 capsule BIO","price":180,"desc":"Diffusore professionale per l’esperienza di alveoterapia negli ambienti, con accessori dedicati e confezione iniziale di 5 capsule BIO."},{"id":"capsule-pb","section":"alveoterapia-prodotti","name":"Capsule Propoli P+B (5 pz)","size":"Scatola da 5 capsule","price":19.9,"desc":"Capsule monouso P+B dedicate ai diffusori compatibili, con propoli italiana e Boswellia Serrata."},{"id":"capsule-propolit","section":"alveoterapia-prodotti","name":"Capsule PROPOLIT (5 pz)","size":"Scatola da 5 capsule","price":19.9,"desc":"Capsule monouso di propoli per diffusori PROPOLAIR/PROPOLIT compatibili."},{"id":"castagno","section":"alveare","name":"Miele di Castagno","size":"250 g","price":6.9,"desc":"Miele dal profumo deciso e dal gusto intenso, poco dolce e con una caratteristica nota leggermente amarognola."},{"id":"acacia-zenzero-apinfiore","section":"alveare","name":"Miele di Acacia e Zenzero","size":"200 g","price":7.9,"desc":"Specialità alimentare a base di miele italiano di acacia e zenzero, dal profilo dolce e delicatamente speziato."},{"id":"miele-eucalipto-apinfiore","section":"alveare","name":"Miele Eucalipto","size":"250 g","price":6.9,"desc":"Miele italiano di eucalipto dal profumo intenso e dal gusto aromatico, con caratteristiche note fresche e balsamiche."},{"id":"balsammiel","section":"alveare","name":"Balsamico Italiano","size":"200 g","price":11.9,"desc":"Specialità alimentare dal gusto fresco e intensamente balsamico, preparata con miele di eucalipto e ingredienti aromatici."},{"id":"acacia","section":"alveare","name":"Miele Italiano di Acacia","size":"40 g","price":2.9,"desc":"Miele italiano di acacia dal colore chiaro e dal gusto dolce e delicato, nel pratico formato da 40 g."},{"id":"favo-integrale-bio","section":"alveare","name":"Miele Italiano di Acacia in Favo","size":"200 g","price":11.9,"desc":"Miele di acacia presentato direttamente nel favo, per una degustazione molto vicina al prodotto così come viene conservato dalle api."},{"id":"polline-italiano","section":"alveare","name":"Polline Italiano","size":"125 g","price":10.9,"desc":"Polline italiano raccolto dalle api e selezionato come prodotto dell’alveare."},{"id":"pappa-reale-italiana-bio","section":"alveare","name":"Pappa Reale","size":"10 g","price":6.9,"desc":"Pappa reale in formato da 10 g, uno dei prodotti più particolari dell’alveare."},{"id":"orsetti-gommosi","section":"alveare","name":"Orsetti Gommosi BIO con Propoli e Miele","size":"80 g","price":3.9,"desc":"Orsetti gommosi biologici con propoli e miele, in confezione da 80 g."},{"id":"bee-energy-bio","section":"propoli","name":"Bee Energy BIO","size":"12 flaconcini da 10 ml","price":14.9,"desc":"Integratore alimentare biologico con ingredienti dell’alveare, proposto in pratici flaconcini."},{"id":"propol-active-bio","section":"propoli","name":"Propol Active BIO","size":"30 compresse masticabili","price":10.9,"desc":"Integratore in compresse masticabili a base di propoli italiana biologica."},{"id":"propoli-30-spray-integratore","section":"propoli","name":"Soluzione Propoli 30% Spray","size":"20 ml","price":7.9,"desc":"Soluzione di propoli al 30% con pratico erogatore spray reclinabile."},{"id":"propoli-30-alcolica-integratore","section":"propoli","name":"Soluzione Propoli 30% con Contagocce - Alcolica","size":"20 ml","price":5.9,"desc":"Soluzione alcolica di propoli al 30% con contagocce, formato da 20 ml."},{"id":"propoli-analcolica-integratore","section":"propoli","name":"Soluzione Propoli con Contagocce Analcolica","size":"20 ml","price":5.9,"desc":"Soluzione analcolica di propoli con contagocce, formato da 20 ml."},{"id":"cosmesi-crema-mani","section":"cosmesi","name":"Crema Mani","size":"100 ml","price":9.9,"desc":"Crema mani formulata con ingredienti dell’alveare, pensata per un gesto cosmetico quotidiano."},{"id":"cosmesi-burrocacao-propoli-aloe","section":"cosmesi","name":"Burrocacao Propoli e Aloe Vera","size":"5 ml","price":4.9,"desc":"Stick labbra con propoli e aloe vera, pensato per mantenere le labbra morbide e protette."},{"id":"cosmesi-burrocacao-miele-pappa-reale","section":"cosmesi","name":"Burrocacao Miele e Pappa Reale","size":"5 ml","price":4.9,"desc":"Stick labbra con miele e pappa reale, per un gesto cosmetico quotidiano."},{"id":"cosmesi-shampoo-multivitaminico","section":"cosmesi","name":"Shampoo Multivitaminico","size":"250 ml","price":9.9,"desc":"Shampoo multivitaminico per la detersione quotidiana dei capelli."},{"id":"cosmesi-saponetta-frutti-bosco","section":"cosmesi","name":"Saponetta Miele e Frutti di Bosco","size":"100 g","price":3.9,"desc":"Sapone vegetale con miele e frutti di bosco, per la detersione quotidiana."},{"id":"cosmesi-saponetta-lavanda","section":"cosmesi","name":"Saponetta Miele e Lavanda","size":"100 g","price":3.9,"desc":"Sapone vegetale con miele e lavanda, per la detersione quotidiana."},{"id":"cosmesi-saponetta-aloe-vera","section":"cosmesi","name":"Saponetta Miele e Aloe Vera","size":"100 g","price":3.9,"desc":"Sapone vegetale con miele e aloe vera, per la detersione quotidiana."},{"id":"cosmesi-candela-alveare-cera-api","section":"cosmesi","name":"Candela Alveare Grande in Cera d’Api","size":"1 candela","price":5.9,"desc":"Candela artigianale in cera d’api, modellata nella caratteristica forma dell’alveare."},{"id":"cosmesi-travel-kit-benessere","section":"cosmesi","name":"Kit da Viaggio Benessere dell’Alveare","size":"4 x 50 ml + pochette","price":17.9,"desc":"Quattro formati da viaggio raccolti in una pochette riutilizzabile, pensati per corpo e capelli."},{"id":"unguento-apis","section":"linea-veleni","name":"SOS DOL – Unguento al Veleno d’Api","size":"15 ml","price":29.9,"desc":"Unguento cosmetico da massaggio formulato con veleno d’api e ingredienti cosmetici selezionati."},{"id":"sos-dol-50ml","section":"linea-veleni","name":"SOS DOL – Unguento al Veleno d’Api","size":"50 ml","price":39.9,"desc":"Formato da 50 ml dell’unguento cosmetico da massaggio SOS DOL, formulato con veleno d’api, cera d’api e oli essenziali di Tea Tree, timo ed eucalipto."},{"id":"apis1-crema-viso-veleno-api","section":"linea-veleni","name":"Crema Viso al Veleno d’Api – APIS1","size":"50 ml","price":39.9,"desc":"Crema viso cosmetica formulata con veleno d’api, pensata per viso, collo e décolleté."},{"id":"apis2-siero-viso-veleno-api","section":"linea-veleni","name":"Siero Viso al Veleno d’Api – APIS2","size":"30 ml","price":34.9,"desc":"Siero viso cosmetico formulato con veleno d’api e altri ingredienti dell’alveare."},{"id":"apis4-crema-corpo-veleno-api-manuka","section":"linea-veleni","name":"Crema Corpo Veleno d’Api e Miele di Manuka – APIS4","size":"250 ml","price":31.9,"desc":"Crema corpo cosmetica formulata con veleno d’api e miele di Manuka."},{"id":"apis5-gommage-veleno-api-manuka","section":"linea-veleni","name":"Gommage Viso e Corpo Veleno d’Api e Miele di Manuka – APIS5","size":"250 ml","price":34.9,"desc":"Gommage cosmetico per viso e corpo formulato con veleno d’api e miele di Manuka."},{"id":"bagnodoccia-veleno-oro","section":"linea-veleni","name":"Bagnodoccia Veleno d’Oro – APIS7","size":"250 ml","price":14.9,"desc":"Bagnodoccia cosmetico formulato con veleno d’api e miele di Manuka."},{"id":"tesori-limoncello","section":"tesori-francesco","name":"Limoncello “I Tesori di Francesco”","size":"250 ml","price":5.9,"desc":"Limoncello della linea I Tesori di Francesco, dal profilo fresco e agrumato."},{"id":"tesori-liquore-caffe","section":"tesori-francesco","name":"Liquore di Caffè “I Tesori di Francesco”","size":"250 ml","price":5.9,"desc":"Liquore al caffè della linea I Tesori di Francesco, dal gusto intenso e avvolgente."},{"id":"tesori-castagne-rum","section":"tesori-francesco","name":"Castagne al Rum “I Tesori di Francesco”","size":"250 ml","price":5.9,"desc":"Castagne al rum della linea I Tesori di Francesco, una piccola specialità da degustazione."},{"id":"alveo-digitale-10-colazioni","section":"alveo-digitale","name":"10 Colazioni dell’Alveare – Edizione Premium","size":"Contenuto digitale","price":5.9,"desc":"Magazine digitale illustrato con 10 ricette complete, 20 idee lampo, planner, lista della spesa, quiz e degustazione dei mieli. Nessuna spedizione fisica."}];

const ORDER_PRODUCT_POINTS = {
  "millefiori": 2,
  "melone": 2,
  "fragola": 2,
  "pesca": 2,
  "arancia": 2,
  "propolterapy-professional": 15,
  "capsule-pb": 5,
  "capsule-propolit": 5,
  "castagno": 2,
  "acacia-zenzero-apinfiore": 3,
  "miele-eucalipto-apinfiore": 2,
  "balsammiel": 4,
  "acacia": 1,
  "favo-integrale-bio": 4,
  "polline-italiano": 4,
  "pappa-reale-italiana-bio": 2,
  "orsetti-gommosi": 1,
  "bee-energy-bio": 4,
  "propol-active-bio": 4,
  "propoli-30-spray-integratore": 3,
  "propoli-30-alcolica-integratore": 2,
  "propoli-analcolica-integratore": 2,
  "cosmesi-crema-mani": 3,
  "cosmesi-burrocacao-propoli-aloe": 2,
  "cosmesi-burrocacao-miele-pappa-reale": 2,
  "cosmesi-shampoo-multivitaminico": 3,
  "cosmesi-saponetta-frutti-bosco": 1,
  "cosmesi-saponetta-lavanda": 1,
  "cosmesi-saponetta-aloe-vera": 1,
  "cosmesi-candela-alveare-cera-api": 2,
  "cosmesi-travel-kit-benessere": 5,
  "unguento-apis": 10,
  "sos-dol-50ml": 10,
  "apis1-crema-viso-veleno-api": 9,
  "apis2-siero-viso-veleno-api": 9,
  "apis4-crema-corpo-veleno-api-manuka": 9,
  "apis5-gommage-veleno-api-manuka": 9,
  "bagnodoccia-veleno-oro": 6,
  "tesori-limoncello": 2,
  "tesori-liquore-caffe": 2,
  "tesori-castagne-rum": 2
};
const ORDER_BUSATELLO_PRODUCTS = [
  {id:'millefiori',name:'Miele Millefiori',size:'250 g',price:4.90},
  {id:'melone',name:'Miele al Melone',size:'250 g',price:4.90},
  {id:'fragola',name:'Miele alla Fragola',size:'250 g',price:4.90},
  {id:'pesca',name:'Miele alla Pesca',size:'250 g',price:4.90},
  {id:'arancia',name:"Miele all'Arancia",size:'250 g',price:4.90}
];
const ORDER_CATALOG = new Map([
  ...ORDER_BUSATELLO_PRODUCTS,
  ...APE_V2_OFFICIAL_PRODUCTS
].map(p=>[p.id,{...p,points:Number(ORDER_PRODUCT_POINTS[p.id]||0)}]));

const orderMailRate = new Map();
const recentOrderRefs = new Map();

function cleanOrderText(value,max=300){
  return String(value||'').replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim().slice(0,max);
}
function escapeOrderHtml(value){
  return String(value||'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}
function euroOrder(value){
  return new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR'}).format(Number(value||0));
}
function orderMailConfigured(){
  return Boolean(
    String(process.env.RESEND_API_KEY||'').trim() ||
    (String(process.env.ORDER_EMAIL_USER||'').trim() && String(process.env.ORDER_EMAIL_APP_PASSWORD||'').trim())
  );
}
function orderMailMode(){
  if(String(process.env.RESEND_API_KEY||'').trim()) return 'resend';
  if(String(process.env.ORDER_EMAIL_USER||'').trim() && String(process.env.ORDER_EMAIL_APP_PASSWORD||'').trim()) return 'smtp';
  return 'none';
}
function orderTransporter(){
  if(!orderMailConfigured()) return null;
  const user=String(process.env.ORDER_EMAIL_USER||'').trim();
  const pass=String(process.env.ORDER_EMAIL_APP_PASSWORD||'').trim();
  const host=String(process.env.ORDER_SMTP_HOST||'').trim();
  if(host){
    const port=Number(process.env.ORDER_SMTP_PORT||587);
    const secure=String(process.env.ORDER_SMTP_SECURE||'').toLowerCase()==='true' || port===465;
    return nodemailer.createTransport({
      host,port,secure,auth:{user,pass},
      connectionTimeout:8000,greetingTimeout:8000,socketTimeout:12000
    });
  }
  return nodemailer.createTransport({
    service:'gmail',
    auth:{user,pass},
    connectionTimeout:8000,greetingTimeout:8000,socketTimeout:12000
  });
}
function allowOrderMail(req){
  const key=String(req.ip||req.socket?.remoteAddress||'unknown');
  const now=Date.now(), windowMs=10*60*1000, max=6;
  const arr=(orderMailRate.get(key)||[]).filter(ts=>now-ts<windowMs);
  if(arr.length>=max){orderMailRate.set(key,arr);return false;}
  arr.push(now);orderMailRate.set(key,arr);
  return true;
}
function parseOrderPayload(body){
  const customer=body?.customer||{};
  const country=cleanOrderText(customer.country,2).toUpperCase();
  if(!ORDER_COUNTRIES[country]) throw new Error('Paese di consegna non supportato.');
  const parsedCustomer={
    name:cleanOrderText(customer.name,120),
    email:cleanOrderText(customer.email,180).toLowerCase(),
    phone:cleanOrderText(customer.phone,80),
    city:normalizeEuropeanText(cleanOrderText(customer.city,120)),
    address:normalizeEuropeanText(cleanOrderText(customer.address,180)),
    cap:normalizeEuropeanPostal(cleanOrderText(customer.cap,12)),
    province:normalizeEuropeanText(cleanOrderText(customer.province,80)),
    country,
    countryName:ORDER_COUNTRIES[country].name
  };
  if(country==='IT') parsedCustomer.province=parsedCustomer.province.toUpperCase();
  if(!parsedCustomer.name || !parsedCustomer.phone || !parsedCustomer.city || !parsedCustomer.address || !parsedCustomer.cap || (country==='IT'&&!parsedCustomer.province)){
    throw new Error('Dati cliente incompleti.');
  }
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parsedCustomer.email)) throw new Error('Email cliente non valida.');
  if(!validEuropeanPostal(parsedCustomer.cap,country)) throw new Error('Codice postale non valido.');
  const phoneObj=parsePhoneNumberFromString(parsedCustomer.phone,country);
  if(!phoneObj || !phoneObj.isValid()) throw new Error('Numero di telefono non valido per il Paese selezionato.');
  parsedCustomer.phone=phoneObj.number;

  const rawItems=Array.isArray(body?.items)?body.items:[];
  if(!rawItems.length || rawItems.length>40) throw new Error('Prodotti ordine non validi.');
  const items=[];
  for(const raw of rawItems){
    const id=cleanOrderText(raw?.id,100);
    const catalog=ORDER_CATALOG.get(id);
    if(!catalog) throw new Error('Prodotto non riconosciuto: '+id);
    const qty=Math.max(1,Math.min(50,Math.floor(Number(raw?.qty||1))));
    items.push({
      id,
      name:catalog.name,
      size:catalog.size,
      unitPrice:Number(catalog.price),
      qty,
      points:Number(catalog.points||0),
      subtotal:Number(catalog.price)*qty
    });
  }

  const goodsTotal=items.reduce((sum,item)=>sum+item.subtotal,0);
  const points=items.reduce((sum,item)=>sum+(item.points*item.qty),0);
  const requestedDelivery=body?.delivery==='pickup'?'pickup':'courier';
  const delivery=(country==='IT' && requestedDelivery==='pickup')?'pickup':'courier';
  const clientShipping=Number(body?.shipping);
  const clientReason=cleanOrderText(body?.shippingReason,220);
  const explicitFreeItaly=country==='IT' && delivery==='courier' && clientShipping===0 && clientReason.toLowerCase().includes('gratuit');
  const poste=delivery==='pickup'?{pending:false,cost:0,weightKg:estimateParcelWeight(items).kg}:{...calcPosteShipping(country,items)};
  const shippingPending=delivery==='pickup'?false:Boolean(poste.pending);
  let shipping=delivery==='pickup'?0:Number(poste.cost||0);
  if(explicitFreeItaly) shipping=0;
  shipping=Math.round(shipping*100)/100;
  const shippingWeightKg=Number(poste.weightKg||0);
  const shippingZone=poste.zone||'';
  let shippingReason='';
  if(delivery==='pickup'){
    shippingReason='Ritiro / accordo diretto';
  }else if(explicitFreeItaly){
    shippingReason=clientReason||'Consegna locale gratuita';
  }else if(shippingPending){
    shippingReason='Poste Italiane · peso stimato '+shippingWeightKg.toFixed(2)+' kg · tariffa da confermare';
  }else if(country==='IT'){
    shippingReason='Poste Delivery Web · peso stimato '+shippingWeightKg.toFixed(2)+' kg';
  }else{
    shippingReason='Poste Delivery International Standard · peso stimato '+shippingWeightKg.toFixed(2)+' kg'+(shippingZone?' · Zona '+shippingZone:'');
  }
  const notes=cleanOrderText(body?.notes,1200);
  const language=['it','en','de','fr','es'].includes(String(body?.language||'').toLowerCase())?String(body.language).toLowerCase():'it';
  const clientReference=/^API-\d{8}-\d{5,8}$/.test(String(body?.id||''))?String(body.id):'API-'+Date.now();
  return {
    id:clientReference,
    createdAt:new Date().toISOString(),
    customer:parsedCustomer,
    delivery,
    notes,
    items,
    goodsTotal,
    shipping,
    shippingPending,
    shippingWeightKg,
    shippingZone,
    shippingReason,
    language,
    total:goodsTotal+shipping,
    points
  };
}
function orderLanguageLabel(code){
  return ({it:'Italiano',en:'English',de:'Deutsch',fr:'Français',es:'Español'})[code]||code||'Italiano';
}
function buildOrderMail(order){
  const deliveryLabel=order.delivery==='pickup'?'Ritiro / accordo diretto':'Corriere';
  const itemRows=order.items.map(item=>`
    <tr>
      <td style="padding:10px;border-bottom:1px solid #e6e0d4"><strong>${escapeOrderHtml(item.name)}</strong><br><span style="color:#6b746f;font-size:12px">${escapeOrderHtml(item.size)}</span></td>
      <td style="padding:10px;text-align:center;border-bottom:1px solid #e6e0d4">${item.qty}</td>
      <td style="padding:10px;text-align:right;border-bottom:1px solid #e6e0d4">${euroOrder(item.unitPrice)}</td>
      <td style="padding:10px;text-align:right;border-bottom:1px solid #e6e0d4"><strong>${euroOrder(item.subtotal)}</strong></td>
    </tr>`).join('');

  const html=`
  <div style="font-family:Arial,Helvetica,sans-serif;background:#f6f1e7;padding:28px;color:#17251f">
    <div style="max-width:760px;margin:auto;background:#fff;border-radius:20px;overflow:hidden;border:1px solid #ded5c5">
      <div style="background:#10392c;color:#fff;padding:24px 28px">
        <div style="font-size:12px;font-weight:800;letter-spacing:.12em;color:#f0bd4d">LA FABBRICA DELLE API</div>
        <h1 style="margin:8px 0 0;font-size:26px">Nuovo ordine ricevuto</h1>
        <div style="margin-top:8px;font-size:14px">Codice: <strong>${escapeOrderHtml(order.id)}</strong></div>
      </div>
      <div style="padding:26px 28px">
        <h2 style="font-size:18px;margin:0 0 12px">Dati acquirente</h2>
        <p style="line-height:1.65;margin:0 0 22px">
          <strong>${escapeOrderHtml(order.customer.name)}</strong><br>
          Email: <a href="mailto:${escapeOrderHtml(order.customer.email)}">${escapeOrderHtml(order.customer.email)}</a><br>
          Telefono: ${escapeOrderHtml(order.customer.phone)}<br>
          Paese: <strong>${escapeOrderHtml(order.customer.countryName)}</strong><br>
          Lingua cliente: <strong>${escapeOrderHtml(orderLanguageLabel(order.language))}</strong><br>
          Indirizzo: ${escapeOrderHtml(order.customer.address)}, ${escapeOrderHtml(order.customer.cap)} ${escapeOrderHtml(order.customer.city)}${order.customer.province?' ('+escapeOrderHtml(order.customer.province)+')':''}, ${escapeOrderHtml(order.customer.countryName)}
        </p>

        <h2 style="font-size:18px;margin:0 0 12px">Prodotti</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <thead><tr style="background:#f5eddf"><th style="padding:9px;text-align:left">Prodotto</th><th style="padding:9px">Q.tà</th><th style="padding:9px;text-align:right">Prezzo</th><th style="padding:9px;text-align:right">Subtotale</th></tr></thead>
          <tbody>${itemRows}</tbody>
        </table>

        <div style="margin-top:20px;padding:16px;background:#faf6ee;border-radius:14px;line-height:1.65">
          <div><strong>Consegna:</strong> ${escapeOrderHtml(deliveryLabel)}</div>
          <div><strong>Dettaglio spedizione:</strong> ${escapeOrderHtml(order.shippingReason||'—')}</div>
          ${order.shippingWeightKg?'<div><strong>Peso spedizione stimato:</strong> '+escapeOrderHtml(Number(order.shippingWeightKg).toFixed(2))+' kg</div>':''}
          ${order.shippingZone?'<div><strong>Zona Poste:</strong> '+escapeOrderHtml(order.shippingZone)+'</div>':''}
          <div><strong>Note cliente:</strong> ${escapeOrderHtml(order.notes||'Nessuna nota')}</div>
        </div>

        <div style="margin-top:20px;font-size:15px;line-height:1.8;text-align:right">
          Prodotti: <strong>${euroOrder(order.goodsTotal)}</strong><br>
          Spedizione: <strong>${order.shippingPending?'DA CONFERMARE':euroOrder(order.shipping)}</strong><br>
          <span style="font-size:20px">${order.shippingPending?'Totale prodotti':'Totale'}: <strong>${euroOrder(order.total)}</strong></span><br>
          <span style="color:#7a5a0a">🐝 Punti Ape: <strong>${order.points}</strong></span>
        </div>
      </div>
    </div>
  </div>`;

  const text=[
    'LA FABBRICA DELLE API - NUOVO ORDINE',
    'Codice: '+order.id,
    '',
    'ACQUIRENTE',
    order.customer.name,
    order.customer.email,
    order.customer.phone,
    'Paese: '+order.customer.countryName,
    'Lingua cliente: '+orderLanguageLabel(order.language),
    order.customer.address+', '+order.customer.cap+' '+order.customer.city+(order.customer.province?' ('+order.customer.province+')':'')+', '+order.customer.countryName,
    '',
    'PRODOTTI',
    ...order.items.map(i=>'- '+i.name+' | '+i.size+' | q.tà '+i.qty+' | '+euroOrder(i.subtotal)),
    '',
    'Consegna: '+deliveryLabel,
    'Dettaglio spedizione: '+(order.shippingReason||'—'),
    ...(order.shippingWeightKg?['Peso spedizione stimato: '+Number(order.shippingWeightKg).toFixed(2)+' kg']:[]),
    ...(order.shippingZone?['Zona Poste: '+order.shippingZone]:[]),
    'Note: '+(order.notes||'Nessuna nota'),
    'Prodotti: '+euroOrder(order.goodsTotal),
    'Spedizione: '+(order.shippingPending?'DA CONFERMARE':euroOrder(order.shipping)),
    (order.shippingPending?'Totale prodotti: ':'Totale: ')+euroOrder(order.total),
    'Punti Ape: '+order.points
  ].join('\n');
  return {html,text};
}

app.post('/api/shipping-estimate',(req,res)=>{
  try{
    const country=String(req.body?.country||'').trim().toUpperCase();
    if(!ORDER_COUNTRIES[country]) return res.status(400).json({ok:false,error:'Paese non supportato.'});
    const raw=Array.isArray(req.body?.items)?req.body.items:[];
    if(!raw.length||raw.length>40) return res.status(400).json({ok:false,error:'Carrello non valido.'});
    const items=raw.map(x=>({
      id:cleanOrderText(x?.id,100),
      qty:Math.max(1,Math.min(50,Math.floor(Number(x?.qty||1))))
    })).filter(x=>ORDER_CATALOG.has(x.id));
    if(items.length!==raw.length) return res.status(400).json({ok:false,error:'Prodotto non riconosciuto.'});
    return res.json(calcPosteShipping(country,items));
  }catch(error){
    return res.status(500).json({ok:false,error:'Impossibile calcolare la spedizione.'});
  }
});

app.get('/api/phone-normalize',(req,res)=>{
  let prefix=String(req.query.prefix||'').trim().replace(/[\s().-]/g,'');
  let national=String(req.query.phone||'').trim().replace(/[\s().-]/g,'');
  if(prefix.startsWith('00'))prefix='+'+prefix.slice(2);
  if(!prefix.startsWith('+'))prefix='+'+prefix.replace(/\D/g,'');
  national=national.replace(/^\+/, '').replace(/\D/g,'');
  if(!/^\+\d{1,4}$/.test(prefix) || !/^\d{4,14}$/.test(national)){
    return res.status(422).json({ok:false,error:'Prefisso o numero non valido.'});
  }
  const full=prefix+national;
  const phone=parsePhoneNumberFromString(full);
  if(!phone || !phone.isValid()){
    return res.status(422).json({ok:false,error:'La combinazione prefisso + numero non risulta valida.'});
  }
  const callingCode='+'+phone.countryCallingCode;
  if(callingCode!==prefix){
    return res.status(422).json({ok:false,error:'Il numero non è compatibile con il prefisso indicato.'});
  }
  return res.json({
    ok:true,
    e164:phone.number,
    international:phone.formatInternational(),
    callingCode,
    national:phone.nationalNumber,
    phoneCountry:phone.country||''
  });
});

app.get('/api/order-email-status', (_req,res)=>{
  res.setHeader('Cache-Control','no-store');
  return res.json({ok:true,configured:orderMailConfigured(),mode:orderMailMode()});
});

app.post('/api/free-edition-notification', async (req,res)=>{
  if(!allowOrderMail(req)) return res.status(429).json({ok:false,error:'Troppe richieste. Riprova tra qualche minuto.'});
  try{
    const body=req.body||{};
    const editionId=cleanOrderText(body.editionId,100);
    if(editionId!=='api-oggi-01') return res.status(400).json({ok:false,error:'Edizione non riconosciuta.'});
    const language=['it','en','de','fr','es'].includes(String(body.language||'').toLowerCase())?String(body.language).toLowerCase():'it';
    const customer=body.customer||{};
    const contact={
      name:cleanOrderText(customer.name,120),
      email:cleanOrderText(customer.email,180).toLowerCase(),
      phone:cleanOrderText(customer.phone,80)
    };
    if(contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)){
      return res.status(422).json({ok:false,error:'Email non valida.'});
    }
    if(!contact.name && !contact.email && !contact.phone){
      return res.json({ok:true,skipped:true});
    }
    if(!orderMailConfigured()){
      console.warn('[Edizioni Aperte] Notifica contatto non configurata.');
      return res.status(503).json({ok:false,error:'Servizio email non configurato.'});
    }
    const to=String(process.env.ORDER_EMAIL_TO||'althea12830@gmail.com').trim();
    const orderId=cleanOrderText(body.orderId,180)||('FREE-'+Date.now());
    const subject='Download gratuito · Il mondo delle api oggi · Numero 01';
    const text=[
      'LA FABBRICA DELLE API - EDIZIONI APERTE',
      '',
      'Download: Il mondo delle api oggi · Numero 01',
      'Codice: '+orderId,
      'Lingua: '+orderLanguageLabel(language),
      '',
      'CONTATTI LASCIATI VOLONTARIAMENTE',
      'Nome: '+(contact.name||'—'),
      'Email: '+(contact.email||'—'),
      'Telefono: '+(contact.phone||'—'),
      '',
      'Il download resta gratuito anche senza lasciare dati.'
    ].join('\n');
    const html=`<div style="font-family:Arial,Helvetica,sans-serif;background:#f6f1e7;padding:28px;color:#17251f">
      <div style="max-width:680px;margin:auto;background:#fff;border-radius:20px;overflow:hidden;border:1px solid #ded5c5">
        <div style="background:#10392c;color:#fff;padding:24px 28px">
          <div style="font-size:12px;font-weight:800;letter-spacing:.12em;color:#f0bd4d">ALVEO DIGITALE · EDIZIONI APERTE</div>
          <h1 style="margin:8px 0 0;font-size:25px">Nuovo download gratuito</h1>
        </div>
        <div style="padding:26px 28px;line-height:1.7">
          <p><strong>Il mondo delle api oggi · Numero 01</strong><br>Lingua: ${escapeOrderHtml(orderLanguageLabel(language))}</p>
          <h2 style="font-size:17px">Contatti lasciati volontariamente</h2>
          <p>Nome: <strong>${escapeOrderHtml(contact.name||'—')}</strong><br>
          Email: ${contact.email?'<a href="mailto:'+escapeOrderHtml(contact.email)+'">'+escapeOrderHtml(contact.email)+'</a>':'—'}<br>
          Telefono: ${escapeOrderHtml(contact.phone||'—')}</p>
          <p style="font-size:12px;color:#6f7973">Il contenuto è scaricabile gratuitamente anche senza lasciare dati.</p>
        </div>
      </div>
    </div>`;
    if(orderMailMode()==='resend'){
      const key=String(process.env.RESEND_API_KEY||'').trim();
      const from=String(process.env.ORDER_EMAIL_FROM||'La Fabbrica delle Api <onboarding@resend.dev>').trim();
      const payload={from,to:[to],subject,text,html};
      if(contact.email) payload.reply_to=contact.email;
      const response=await fetch('https://api.resend.com/emails',{
        method:'POST',
        headers:{'Authorization':'Bearer '+key,'Content-Type':'application/json','Idempotency-Key':'free-edition-'+orderId},
        body:JSON.stringify(payload)
      });
      const data=await response.json().catch(()=>null);
      if(!response.ok) throw new Error('Resend: '+(data?.message||data?.error||('HTTP '+response.status)));
    }else{
      const transporter=orderTransporter();
      const user=String(process.env.ORDER_EMAIL_USER||'').trim();
      const mail={from:'"La Fabbrica delle Api" <'+user+'>',to,subject,text,html};
      if(contact.email) mail.replyTo=contact.email;
      await transporter.sendMail(mail);
    }
    console.log('[Edizioni Aperte] Contatto download inviato:',orderId);
    return res.json({ok:true,orderId});
  }catch(error){
    console.error('[Edizioni Aperte] Errore notifica:',error?.message||error);
    return res.status(500).json({ok:false,error:'Notifica non inviata.'});
  }
});

app.post('/api/cesto-notification', async (req,res)=>{
  if(!allowOrderMail(req)) return res.status(429).json({ok:false,error:'Troppe richieste. Riprova tra qualche minuto.'});
  if(!orderMailConfigured()) return res.status(503).json({ok:false,error:'Servizio email non configurato.'});
  try{
    const body=req.body||{};
    const orderNumber=cleanOrderText(body.orderNumber,100);
    const code=cleanOrderText(body.code,100);
    const shipping=body.shipping||{};
    const customer={
      name:cleanOrderText(shipping.name,120),
      email:cleanOrderText(shipping.email,180).toLowerCase(),
      phone:cleanOrderText(shipping.phone,80),
      address:cleanOrderText(shipping.address,180),
      postalCode:cleanOrderText(shipping.postalCode,20),
      city:cleanOrderText(shipping.city,100),
      state:cleanOrderText(shipping.state,60).toUpperCase(),
      country:cleanOrderText(shipping.country||'Italia',80),
      notes:cleanOrderText(shipping.notes,500)
    };
    const gifts=Array.isArray(body.giftProducts)?body.giftProducts.slice(0,5).map(x=>({
      id:cleanOrderText(x?.id,100),
      name:cleanOrderText(x?.name,160)
    })):[];
    if(!orderNumber||!customer.name||!customer.email||!customer.phone||!customer.address||!customer.postalCode||!customer.city||!customer.state||gifts.length!==5){
      return res.status(422).json({ok:false,error:'Dati ordine Cesto incompleti.'});
    }
    const to=String(process.env.ORDER_EMAIL_TO||'althea12830@gmail.com').trim();
    const subject=(body.testMode?'TEST · ':'')+'Cesto Punti Ape '+orderNumber+' · '+customer.name;
    const productsText=gifts.map((g,i)=>(i+1)+'. '+g.name).join('\n');
    const text=[
      'LA FABBRICA DELLE API',
      body.testMode?'ORDINE CESTO PUNTI APE - MODALITA TEST':'ORDINE CESTO PUNTI APE',
      '',
      'Ordine: '+orderNumber,
      'Codice: '+(code||'—'),
      'Punti utilizzati: '+Number(body.pointsSpent||100),
      'Stato: DA PREPARARE',
      '',
      'CLIENTE E SPEDIZIONE',
      'Nome: '+customer.name,
      'Email: '+customer.email,
      'Telefono: '+customer.phone,
      'Indirizzo: '+customer.address,
      'CAP: '+customer.postalCode,
      'Comune: '+customer.city,
      'Provincia: '+customer.state,
      'Paese: '+customer.country,
      'Note: '+(customer.notes||'—'),
      '',
      '5 PRODOTTI SCELTI',
      productsText,
      '',
      'Pagamento: 100 Punti Ape',
      'Spedizione: GRATUITA',
      'Totale da pagare: €0,00'
    ].join('\n');
    const itemsHtml=gifts.map((g,i)=>'<li style="margin:6px 0"><strong>'+(i+1)+'.</strong> '+escapeOrderHtml(g.name)+'</li>').join('');
    const html='<div style="font-family:Arial,Helvetica,sans-serif;background:#f6f1e7;padding:28px;color:#17251f">'+
      '<div style="max-width:720px;margin:auto;background:#fff;border-radius:20px;overflow:hidden;border:1px solid #ded5c5">'+
      '<div style="background:#10392c;color:#fff;padding:24px 28px">'+
      '<div style="font-size:12px;font-weight:800;letter-spacing:.12em;color:#f0bd4d">LA FABBRICA DELLE API · PUNTI APE</div>'+
      '<h1 style="margin:8px 0 0;font-size:25px">'+(body.testMode?'TEST · ':'')+'Nuovo Cesto ottenuto</h1></div>'+
      '<div style="padding:26px 28px;line-height:1.65">'+
      '<p><strong>Ordine:</strong> '+escapeOrderHtml(orderNumber)+'<br><strong>Codice:</strong> '+escapeOrderHtml(code||'—')+'<br><strong>Punti:</strong> 100<br><strong>Totale:</strong> €0,00</p>'+
      '<h2 style="font-size:18px">Cliente e spedizione</h2>'+
      '<p><strong>'+escapeOrderHtml(customer.name)+'</strong><br>'+escapeOrderHtml(customer.address)+'<br>'+escapeOrderHtml(customer.postalCode)+' '+escapeOrderHtml(customer.city)+' ('+escapeOrderHtml(customer.state)+') · '+escapeOrderHtml(customer.country)+'<br>'+escapeOrderHtml(customer.email)+' · '+escapeOrderHtml(customer.phone)+'</p>'+
      (customer.notes?'<p><strong>Note:</strong> '+escapeOrderHtml(customer.notes)+'</p>':'')+
      '<h2 style="font-size:18px">5 prodotti scelti</h2><ol>'+itemsHtml+'</ol>'+
      '<p style="padding:12px 14px;background:#edf5f0;border-radius:12px"><strong>Spedizione gratuita · Totale da pagare €0,00</strong></p>'+
      '</div></div></div>';
    if(orderMailMode()==='resend'){
      const key=String(process.env.RESEND_API_KEY||'').trim();
      const from=String(process.env.ORDER_EMAIL_FROM||'La Fabbrica delle Api <onboarding@resend.dev>').trim();
      const response=await fetch('https://api.resend.com/emails',{
        method:'POST',
        headers:{'Authorization':'Bearer '+key,'Content-Type':'application/json','Idempotency-Key':'cesto-'+orderNumber},
        body:JSON.stringify({from,to:[to],reply_to:customer.email,subject,text,html})
      });
      const payload=await response.json().catch(()=>null);
      if(!response.ok) throw new Error('Resend: '+(payload?.message||payload?.error||('HTTP '+response.status)));
    }else{
      const transporter=orderTransporter();
      const user=String(process.env.ORDER_EMAIL_USER||'').trim();
      await transporter.sendMail({from:'"La Fabbrica delle Api" <'+user+'>',to,replyTo:customer.email,subject,text,html});
    }
    console.log('[Cesto Punti Ape] Notifica inviata:',orderNumber);
    return res.json({ok:true,orderNumber,emailSent:true});
  }catch(error){
    console.error('[Cesto Punti Ape] Errore notifica:',error?.message||error);
    return res.status(500).json({ok:false,error:'Non è stato possibile inviare la notifica del Cesto.'});
  }
});

app.post('/api/order-notification', async (req,res)=>{
  if(!allowOrderMail(req)) return res.status(429).json({ok:false,error:'Troppe richieste. Riprova tra qualche minuto.'});
  if(!orderMailConfigured()){
    console.warn('[Ordini] Notifica email non configurata.');
    return res.status(503).json({ok:false,error:'Il servizio di invio ordini non è ancora configurato.'});
  }
  try{
    const order=parseOrderPayload(req.body);
    const cached=recentOrderRefs.get(order.id);
    if(cached && Date.now()-cached.time<30*60*1000){
      return res.json({ok:true,orderId:order.id,duplicate:true,order:cached.order||order});
    }

    const to=String(process.env.ORDER_EMAIL_TO||'althea12830@gmail.com').trim();
    const mail=buildOrderMail(order);
    const subject='Nuovo ordine '+order.id+' · '+order.customer.name+' · '+euroOrder(order.total);

    if(orderMailMode()==='resend'){
      const key=String(process.env.RESEND_API_KEY||'').trim();
      const from=String(process.env.ORDER_EMAIL_FROM||'La Fabbrica delle Api <onboarding@resend.dev>').trim();
      const controller=new AbortController();
      const timer=setTimeout(()=>controller.abort(),15000);
      let response;
      try{
        response=await fetch('https://api.resend.com/emails',{
          method:'POST',
          headers:{
            'Authorization':'Bearer '+key,
            'Content-Type':'application/json',
            'Idempotency-Key':'order-'+order.id
          },
          body:JSON.stringify({
            from,
            to:[to],
            reply_to:order.customer.email,
            subject,
            text:mail.text,
            html:mail.html
          }),
          signal:controller.signal
        });
      }finally{
        clearTimeout(timer);
      }
      const payload=await response.json().catch(()=>null);
      if(!response.ok){
        throw new Error('Resend: '+(payload?.message||payload?.error||('HTTP '+response.status)));
      }
    }else{
      const transporter=orderTransporter();
      const user=String(process.env.ORDER_EMAIL_USER||'').trim();
      await transporter.sendMail({
        from:'"La Fabbrica delle Api" <'+user+'>',
        to,
        replyTo:order.customer.email,
        subject,
        text:mail.text,
        html:mail.html
      });
    }
    recentOrderRefs.set(order.id,{time:Date.now(),order});
    for(const [key,val] of recentOrderRefs){if(Date.now()-val.time>30*60*1000)recentOrderRefs.delete(key);}
    console.log('[Ordini] Notifica inviata:',order.id);
    return res.json({ok:true,orderId:order.id,order});
  }catch(error){
    console.error('[Ordini] Errore invio notifica:',error?.message||error);
    return res.status(500).json({ok:false,error:'Non è stato possibile inviare l’ordine. Riprova tra poco.'});
  }
});

const APE_V2_PRODUCT_ALIASES = {"propolterapy-professional":["propolterapy professional","propolterapy","diffusore professional"],"capsule-pb":["capsule p+b","capsule propoli p+b","p+b"],"capsule-propolit":["capsule propolit","propolit"],"acacia-zenzero-apinfiore":["acacia e zenzero","acacia zenzero"],"miele-eucalipto-apinfiore":["miele di eucalipto"],"balsammiel":["balsammiel","balsam miel"],"acacia":["acacia 40 g","acacia 40g"],"favo-integrale-bio":["acacia in favo","miele in favo","favo integrale"],"orsetti-gommosi":["orsetti gommosi"],"bee-energy-bio":["bee energy"],"propol-active-bio":["propol active"],"propoli-30-spray-integratore":["propoli 30% spray","propoli spray"],"propoli-30-alcolica-integratore":["propoli 30% alcolica","propoli alcolica"],"propoli-analcolica-integratore":["propoli analcolica"],"cosmesi-burrocacao-propoli-aloe":["burrocacao propoli aloe"],"cosmesi-burrocacao-miele-pappa-reale":["burrocacao miele pappa reale"],"cosmesi-shampoo-multivitaminico":["shampoo multivitaminico"],"cosmesi-saponetta-frutti-bosco":["saponetta frutti di bosco"],"cosmesi-saponetta-lavanda":["saponetta lavanda"],"cosmesi-saponetta-aloe-vera":["saponetta aloe vera"],"cosmesi-candela-alveare-cera-api":["candela alveare","candela in cera d api"],"cosmesi-travel-kit-benessere":["kit da viaggio","travel kit apinfiore","travel kit"],"unguento-apis":["sos dol"],"apis1-crema-viso-veleno-api":["apis1"],"apis2-siero-viso-veleno-api":["apis2"],"apis4-crema-corpo-veleno-api-manuka":["apis4"],"apis5-gommage-veleno-api-manuka":["apis5"],"bagnodoccia-veleno-oro":["apis7"],"tesori-limoncello":["tesori limoncello"],"tesori-liquore-caffe":["tesori liquore caffe","liquore al caffe"],"tesori-castagne-rum":["tesori castagne rum","castagne al rum"]};
function apeProductNormalize(value){
  return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’‘]/g,"'").replace(/\s+/g,' ').trim();
}
function findApeV2ProductContext(value){
  const hay=apeProductNormalize(value);
  let best=null;
  for(const product of APE_V2_OFFICIAL_PRODUCTS){
    const candidates=[product.name,...(APE_V2_PRODUCT_ALIASES[product.id]||[])];
    for(const candidateRaw of candidates){
      const candidate=apeProductNormalize(candidateRaw);
      if(candidate.length<4 || !hay.includes(candidate)) continue;
      if(!best || candidate.length>best.length) best={product,length:candidate.length};
    }
  }
  return best?.product||null;
}

function findApeV2ProductsContext(value){
  const hay=apeProductNormalize(value);
  const found=[];
  for(const product of APE_V2_OFFICIAL_PRODUCTS){
    const candidates=[product.name,...(APE_V2_PRODUCT_ALIASES[product.id]||[])];
    if(candidates.some(candidateRaw=>{
      const candidate=apeProductNormalize(candidateRaw);
      return candidate.length>=4 && hay.includes(candidate);
    })) found.push(product);
  }
  return found;
}

function findPrimaryApeV2ProductContext(reply){
  const raw=String(reply||'');
  const firstBlock=raw.split(/\n\s*\n/)[0].slice(0,900);
  const hay=apeProductNormalize(firstBlock);
  let best=null;
  for(const product of APE_V2_OFFICIAL_PRODUCTS){
    const candidates=[product.name,...(APE_V2_PRODUCT_ALIASES[product.id]||[])];
    for(const rawCandidate of candidates){
      const candidate=apeProductNormalize(rawCandidate);
      if(candidate.length<4)continue;
      const pos=hay.indexOf(candidate);
      if(pos<0)continue;
      if(!best || pos<best.pos || (pos===best.pos && candidate.length>best.length)) best={product,pos,length:candidate.length};
    }
  }
  return best?.product||null;
}

function getApeContextAction(message, reply, lang='it') {
  const normalize=(v)=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const messageText=normalize(message);
  const replyText=normalize(reply);
  const labels={
    it:{millefiori:'Vai al Miele Millefiori',melone:'Vai al Miele al Melone',fragola:'Vai al Miele alla Fragola',pesca:'Vai al Miele alla Pesca',arancia:"Vai al Miele all'Arancia",mieli:'Scopri i Mieli del Busatello',punti:'Vai ai Punti Ape',oasi:"Scopri l'Oasi del Busatello",galena:'Scopri la Galena delle Api',alveo:'Scopri Alveo Digitale',bacheca:'Vai alla Bacheca',veleni:'Scopri la Linea Veleni',alveoterapia:"Scopri l'Alveoterapia Integrata"},
    en:{millefiori:'Go to Millefiori Honey',melone:'Go to Melon Honey',fragola:'Go to Strawberry Honey',pesca:'Go to Peach Honey',arancia:'Go to Orange Honey',mieli:'Discover Busatello Honeys',punti:'Go to Bee Points',oasi:'Discover Busatello Oasis',galena:'Discover Galena delle Api',alveo:'Discover Alveo Digitale',bacheca:'Go to News',veleni:'Discover the Bee Venom Line',alveoterapia:'Discover Integrated Alveotherapy'},
    de:{millefiori:'Zum Millefiori-Honig',melone:'Zum Melonenhonig',fragola:'Zum Erdbeerhonig',pesca:'Zum Pfirsichhonig',arancia:'Zum Orangenhonig',mieli:'Busatello-Honige entdecken',punti:'Zu den Bienenpunkten',oasi:'Oase Busatello entdecken',galena:'Galena delle Api entdecken',alveo:'Alveo Digitale entdecken',bacheca:'Zu den Neuigkeiten',veleni:'Bienengift-Linie entdecken',alveoterapia:'Integrierte Alveotherapie entdecken'},
    fr:{millefiori:'Voir le Miel Millefiori',melone:'Voir le Miel au Melon',fragola:'Voir le Miel à la Fraise',pesca:'Voir le Miel à la Pêche',arancia:"Voir le Miel à l'Orange",mieli:'Découvrir les Miels du Busatello',punti:'Voir les Points Abeille',oasi:"Découvrir l'Oasis du Busatello",galena:'Découvrir Galena delle Api',alveo:'Découvrir Alveo Digitale',bacheca:'Voir les Actualités',veleni:"Découvrir la Ligne Venin d'Abeille",alveoterapia:"Découvrir l'Alvéothérapie Intégrée"},
    es:{millefiori:'Ir a la Miel Millefiori',melone:'Ir a la Miel al Melón',fragola:'Ir a la Miel a la Fresa',pesca:'Ir a la Miel al Melocotón',arancia:'Ir a la Miel a la Naranja',mieli:'Descubrir las Mieles del Busatello',punti:'Ir a los Puntos Abeja',oasi:'Descubrir el Oasis del Busatello',galena:'Descubrir Galena delle Api',alveo:'Descubrir Alveo Digitale',bacheca:'Ir a Novedades',veleni:'Descubrir la Línea Veneno de Abeja',alveoterapia:'Descubrir la Alveoterapia Integrada'}
  };
  const L=labels[lang]||labels.it;
  const hasMsg=(...xs)=>xs.some(x=>messageText.includes(x));
  const promotionIntent=/(^|\s)(offerta|offerte|promozione|promozioni|sconto|sconti)(\s|$)|\b(on sale|discounts?|promotions?|deals?|angebot|angebote|rabatt|rabatte|promo|promos|remise|remises|oferta|ofertas|descuento|descuentos)\b/i.test(messageText);

  // Se l'utente chiede genericamente offerte/promozioni, non scegliere mai
  // un prodotto solo perché il modello lo ha citato dentro una lista.
  if(promotionIntent) return null;

  const productInMessage=findApeV2ProductContext(messageText);
  if(productInMessage){
    const prefix={it:'Scopri',en:'Discover',de:'Entdecke',fr:'Découvrir',es:'Descubrir'}[lang]||'Scopri';
    return {href:'/shop#prodotto-'+productInMessage.id,label:prefix+' '+productInMessage.name};
  }

  if(hasMsg('millefiori')) return {href:'/shop#miele-millefiori',label:L.millefiori};
  if(hasMsg('miele al melone','miele melone','miel al melon','melon honey','melonenhonig')) return {href:'/shop#miele-melone',label:L.melone};
  if(hasMsg('miele alla fragola','miele fragola','miel al la fresa','miel a la fresa','strawberry honey','erdbeerhonig')) return {href:'/shop#miele-fragola',label:L.fragola};
  if(hasMsg('miele alla pesca','miele pesca','miel al melocoton','peach honey','pfirsichhonig')) return {href:'/shop#miele-pesca',label:L.pesca};
  if(hasMsg("miele all'arancia",'miele arancia','miel a la naranja','orange honey','orangenhonig')) return {href:'/shop#miele-arancia',label:L.arancia};

  // Se la risposta individua un prodotto principale nelle prime righe,
  // il pulsante porta esattamente a quella scheda anche se poi cita alternative.
  const primaryReplyProduct=findPrimaryApeV2ProductContext(reply);
  if(primaryReplyProduct){
    const prefix={it:'Scopri',en:'Discover',de:'Entdecke',fr:'Découvrir',es:'Descubrir'}[lang]||'Scopri';
    return {href:'/shop#prodotto-'+primaryReplyProduct.id,label:prefix+' '+primaryReplyProduct.name};
  }

  // Se la risposta suggerisce UNA sola referenza, il pulsante è utile.
  // Se ne cita più di una, nessuna viene scelta arbitrariamente.
  const replyProducts=findApeV2ProductsContext(replyText);
  if(replyProducts.length===1){
    const product=replyProducts[0];
    const prefix={it:'Scopri',en:'Discover',de:'Entdecke',fr:'Découvrir',es:'Descubrir'}[lang]||'Scopri';
    return {href:'/shop#prodotto-'+product.id,label:prefix+' '+product.name};
  }

  if(hasMsg('punti ape','bee points','bienenpunkte','points abeille','puntos abeja')) return {href:'/shop#punti-ape',label:L.punti};
  if(hasMsg('oasi del busatello','oasis del busatello','busatello oasis','oase busatello','oasis du busatello')) return {href:'/alveoterapia',label:L.oasi};
  if(hasMsg('galena delle api')) return {href:'/centro',label:L.galena};
  if(hasMsg('alveo digitale')) return {href:'/alveo-digitale',label:L.alveo};
  if(hasMsg('bacheca','news','novedades','actualites','aktuelles')) return {href:'/bacheca',label:L.bacheca};
  if(hasMsg('linea veleni','bee venom line','bienengift-linie',"ligne venin d'abeille",'linea veneno de abeja')) return {href:'/shop#linea-veleni',label:L.veleni};
  if(hasMsg('alveoterapia integrata','integrated alveotherapy','integrierte alveotherapie','alveotherapie integree','alveoterapia integrada')) return {href:'/alveoterapia',label:L.alveoterapia};
  if(replyProducts.length===0 && hasMsg('miele','mieli','honey','honeys','honig','miel','miels')) return {href:'/shop#mieli',label:L.mieli};
  return null;
}

app.post('/api/ape-pelu-chat', async (req, res) => {
  const apiKey = String(process.env.GROQ_API_KEY || '').trim();
  if (!apiKey) {
    console.warn('[Ape Pelù] GROQ_API_KEY assente: uso fallback locale.');
    return res.status(503).json({
      ok:false,
      aiConfigured:false,
      error:'Ape Pelù AI non è ancora collegata al motore esterno.'
    });
  }

  try {
    const message = String(req.body?.message || '').trim().slice(0, 1800);
    const historyRaw = Array.isArray(req.body?.history) ? req.body.history : [];
    const requestedLanguage = ['it','en','de','fr','es'].includes(String(req.body?.language || '').toLowerCase())
      ? String(req.body.language).toLowerCase()
      : 'it';
    const languageName = {it:'Italiano',en:'English',de:'Deutsch',fr:'Français',es:'Español'}[requestedLanguage];

    if (!message) {
      return res.status(400).json({ok:false,error:'Scrivi una domanda per Ape Pelù.'});
    }

    const digitalIntent=/\b(prodotto digitale|prodotti digitali|digitale|ebook|e-book|ricettario digitale|alveo digitale|digital product|digital products)\b/i.test(message);
    if(digitalIntent){
      const digitalReply={
        it:'Sì 🐝 Nella Bottega è disponibile **10 Colazioni dell’Alveare – Edizione Premium** a **€5,90**. È un magazine digitale illustrato con 10 ricette complete, 20 idee lampo, planner, lista della spesa, quiz e degustazione dei mieli. Vale **2 Punti Ape** e non ha costi di spedizione. Puoi trovarlo nella sezione **Alveo Digitale**.',
        en:'Yes 🐝 The shop includes **10 Colazioni dell’Alveare – Premium Edition** for **€5.90**. It is a digital illustrated magazine with recipes, quick ideas, a planner, shopping list, quiz and honey tasting content. It earns **2 Bee Points** and has no shipping cost.',
        de:'Ja 🐝 Im Shop ist **10 Colazioni dell’Alveare – Premium Edition** für **5,90 €** erhältlich. Es ist ein digitales illustriertes Magazin mit Rezepten, schnellen Ideen, Planer, Einkaufsliste, Quiz und Honigverkostung. Es bringt **2 Bienenpunkte** und hat keine Versandkosten.',
        fr:'Oui 🐝 La boutique propose **10 Colazioni dell’Alveare – Édition Premium** à **5,90 €**. C’est un magazine numérique illustré avec recettes, idées rapides, planner, liste de courses, quiz et dégustation des miels. Il rapporte **2 Points Abeille** et n’a pas de frais de livraison.',
        es:'Sí 🐝 En la tienda está disponible **10 Colazioni dell’Alveare – Edición Premium** por **5,90 €**. Es una revista digital ilustrada con recetas, ideas rápidas, planificador, lista de la compra, quiz y degustación de mieles. Suma **2 Puntos Abeja** y no tiene gastos de envío.'
      }[requestedLanguage];
      return res.status(200).json({
        ok:true,
        aiConfigured:true,
        reply:digitalReply,
        action:{href:'/shop#prodotto-alveo-digitale-10-colazioni',label:'Scopri 10 Colazioni dell’Alveare →'}
      });
    }

    const promotionIntent=/(^|\s)(offerta|offerte|promozione|promozioni|sconto|sconti)(\s|$)|\b(on sale|discounts?|promotions?|deals?|angebot|angebote|rabatt|rabatte|promo|promos|remise|remises|oferta|ofertas|descuento|descuentos)\b/i.test(message);
    if(promotionIntent){
      const promoReply={
        it:'Al momento **non risultano offerte, sconti o promozioni attive**. I prezzi che vedi sono i prezzi correnti del catalogo.\n\nSe vuoi, posso invece dirti **qual è il prodotto che costa meno**, mostrarti i prodotti sotto una certa cifra oppure confrontare i prezzi di due prodotti.',
        en:'At the moment, **there are no active sales, discounts or promotions**. The prices shown are the current catalog prices.\n\nIf you want, I can tell you **which product costs the least**, show products under a certain price, or compare two products.',
        de:'Derzeit sind **keine Angebote, Rabatte oder Aktionen aktiv**. Die angezeigten Preise sind die aktuellen Katalogpreise.\n\nIch kann dir aber sagen, **welches Produkt am günstigsten ist**, Produkte unter einem bestimmten Preis zeigen oder zwei Preise vergleichen.',
        fr:'Actuellement, **aucune offre, remise ou promotion n’est active**. Les prix affichés sont les prix actuels du catalogue.\n\nJe peux toutefois vous dire **quel produit coûte le moins cher**, afficher les produits sous un certain prix ou comparer deux produits.',
        es:'Actualmente **no hay ofertas, descuentos ni promociones activas**. Los precios mostrados son los precios actuales del catálogo.\n\nSi quieres, puedo decirte **qué producto cuesta menos**, mostrar productos por debajo de un precio o comparar dos productos.'
      };
      return res.json({ok:true,reply:promoReply[requestedLanguage],action:null,suppressAction:true});
    }

    const q = message.toLowerCase();
    const asksDose = /(quante volte|quanto ne devo|quanto devo|dose|dosaggio|per quanto tempo|applicazioni al giorno|how often|how much|dosage|for how long|times? a day|wie oft|wie viel|dosierung|wie lange|combien de fois|quelle quantité|dosage|pendant combien de temps|cu[aá]ntas veces|cu[aá]nto debo|dosis|durante cu[aá]nto tiempo)/i.test(message);
    const asksDrugChange = /((smett|sospend|interromp).*(farmac|antinfiamm)|posso smettere.*(farmac|antinfiamm)|stop|quit|discontinue|suspend|absetzen|aufh[oö]ren|arr[eê]ter|suspendre|dejar|suspender).*(medic|drug|medicine|farmac|antinfiamm|entz[uü]nd|m[eé]dicament|medicamento)/i.test(message);
    const asksMedicalOutcome = /(cura|curare|artrosi|dolore|riduce il dolore|circolazione|antinfiammatorio|analgesico|patologia|sintomo|cure|treat|arthritis|pain|inflammation|anti-inflammatory|analgesic|disease|symptom|heil|arthrose|schmerz|entz[uü]nd|krankheit|symptom|gu[eé]rir|soigner|arthrose|douleur|inflammation|maladie|sympt[oô]me|curar|artrosis|dolor|inflamaci[oó]n|enfermedad|s[ií]ntoma)/i.test(message);
    const productContext = /(veleno|linea veleni|bee venom|bienengift|venin d['’]abeille|veneno de abeja|sos dol|apis\s*[12457]|prodotto|product|produkt|produit|producto|crema|cream|cr[eè]me|unguento|ointment|salbe|pommade|pomada|gommage|bagnodoccia)/i.test(message);

    if (productContext && (asksDose || asksDrugChange || asksMedicalOutcome)) {
      console.log('[Ape Pelù] Guardia non-medica attivata.');
      return res.json({
        ok:true,
        guarded:true,
        reply:({
          it:'Posso spiegarti la **Linea Veleni** solo dal punto di vista cosmetico e da massaggio. Non posso indicarti quantità, frequenza, durata d’uso per un problema fisico, né dirti di modificare o sospendere farmaci. Inoltre non presento il veleno d’api come cura per artrosi, dolore o altri problemi di salute.\n\nSe vuoi, posso invece spiegarti **quali prodotti della Linea Veleni sono realmente disponibili** e a quale uso cosmetico o da massaggio sono destinati, senza entrare in ambito medico.',
          en:'I can explain the **Bee Venom Line** only from a cosmetic and massage-use perspective. I cannot tell you amounts, frequency or duration of use for a physical problem, nor advise you to change or stop medicines. I also do not present bee venom as a cure for arthritis, pain or other health problems.\n\nIf you want, I can instead explain **which Bee Venom Line products are actually available** and what cosmetic or massage use they are intended for, without entering the medical field.',
          de:'Ich kann dir die **Bienengift-Linie** nur aus kosmetischer Sicht und für Massageanwendungen erklären. Ich kann keine Mengen, Häufigkeit oder Anwendungsdauer für körperliche Beschwerden angeben und auch nicht empfehlen, Medikamente zu ändern oder abzusetzen. Bienengift stelle ich außerdem nicht als Heilmittel gegen Arthrose, Schmerzen oder andere Gesundheitsprobleme dar.\n\nWenn du möchtest, kann ich dir stattdessen erklären, **welche Produkte der Bienengift-Linie tatsächlich verfügbar sind** und für welchen kosmetischen oder Massagegebrauch sie gedacht sind.',
          fr:'Je peux vous expliquer la **Ligne Venin d’Abeille** uniquement du point de vue cosmétique et de l’usage en massage. Je ne peux pas indiquer de quantité, de fréquence ou de durée d’utilisation pour un problème physique, ni conseiller de modifier ou d’arrêter des médicaments. Je ne présente pas non plus le venin d’abeille comme un remède contre l’arthrose, la douleur ou d’autres problèmes de santé.\n\nSi vous le souhaitez, je peux plutôt vous expliquer **quels produits de la Ligne Venin d’Abeille sont réellement disponibles** et à quel usage cosmétique ou de massage ils sont destinés.',
          es:'Puedo explicarte la **Línea Veneno de Abeja** únicamente desde el punto de vista cosmético y de uso en masaje. No puedo indicarte cantidades, frecuencia o duración de uso para un problema físico, ni decirte que cambies o suspendas medicamentos. Tampoco presento el veneno de abeja como una cura para la artrosis, el dolor u otros problemas de salud.\n\nSi quieres, puedo explicarte **qué productos de la Línea Veneno de Abeja están realmente disponibles** y para qué uso cosmético o de masaje están destinados, sin entrar en el ámbito médico.'
        })[requestedLanguage],
        action:getApeContextAction(message,'Linea Veleni',requestedLanguage)
      });
    }

    const history = historyRaw
      .slice(-10)
      .filter(item => item && (item.role === 'user' || item.role === 'assistant'))
      .map(item => ({
        role:item.role,
        content:String(item.content || '').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim().slice(0,1400)
      }))
      .filter(item => item.content);

    const instructions = `
Sei "Ape Pelù", la guida esperta della Fabbrica delle Api.

IDENTITÀ E PRIORITÀ
- Prima di tutto sei una guida competente sul mondo delle api, dell'alveare, dell'apicoltura, degli impollinatori, della biodiversità e dei prodotti dell'alveare.
- NON sei una venditrice che cerca sempre di portare a un acquisto.
- La gerarchia è: conoscenza -> curiosità -> fiducia -> eventuale prodotto, solo se pertinente.
- Lingua del sito attiva: ${languageName}. Rispondi SEMPRE in questa lingua, salvo che l'utente chieda esplicitamente di usare un'altra lingua.
- Non cambiare lingua solo perché l'utente inserisce una singola parola straniera o un nome proprio.
- Non sappiamo età, istruzione o conoscenze dell'utente: usa parole semplici, frasi chiare e spiega i termini tecnici.
- Non essere infantile. Sii calda, curiosa, autorevole e facile da capire.

CONTESTO DEL PROGETTO
- La Fabbrica delle Api ruota attorno all'Alveoterapia Integrata durante tutto l'anno.
- Primavera/estate: esperienza naturale all'aperto presso l'Oasi del Busatello con arnie vere e api.
- Autunno/inverno: esperienza nella Galena delle Api di Castel d'Ario tramite ambienti e diffusori dedicati.
- La Galena delle Api è un luogo di conoscenza ed esperienza del mondo dell'alveare.
- "Linea Veleni" è una linea specialistica cosmetica e da massaggio legata al veleno d'api.
- Non mostrare mai la parola visibile "Veleni" da sola: usa "Linea Veleni", "Linea Veleni d'Api" o formulazioni contestualizzate.
- Punti Ape: i prodotti possono assegnare punti; 100 Punti Ape = cesto omaggio con 5 prodotti a scelta.
- Nel catalogo attuale i Mieli del Busatello da 250 g sono: Miele Millefiori, Miele al Melone, Miele alla Fragola, Miele alla Pesca, Miele all'Arancia, ciascuno a €4,90 e 2 Punti Ape.
- Usa SEMPRE questi nomi ufficiali esatti in italiano: "Miele Millefiori", "Miele al Melone", "Miele alla Fragola", "Miele alla Pesca", "Miele all'Arancia". Non trasformarli in "Miele di Melone", "Miele di Fragola", "Miele di Pesca" o "Miele di Arancia".
- Non inventare prezzi, disponibilità, formati o condizioni commerciali non presenti in queste informazioni.
- CATALOGO ATTUALE VINCOLANTE: oltre ai 5 Mieli del Busatello sopra indicati, i soli prodotti presenti sono:\n${APE_V2_OFFICIAL_PRODUCTS.map(p=>'- '+p.name+' | '+p.size+' | €'+Number(p.price).toFixed(2).replace('.',',')+' | '+p.desc).join('\n')}
- Quando parli di uno di questi prodotti, usa almeno una volta il nome esatto riportato nel catalogo: serve anche a collegare correttamente il pulsante diretto al prodotto.
- Quando l'utente chiede informazioni su un prodotto dello shop, attieniti a nome, formato, prezzo e descrizione riportati in questo catalogo. Non dedurre benefici ulteriori dal nome del prodotto o dagli ingredienti.
- Non proporre prodotti che non compaiono in questo elenco o nei 5 Mieli del Busatello.

PRINCIPIO DI APPARTENENZA SEMANTICA
- Decidi se una domanda appartiene al tuo mondo considerando il SIGNIFICATO DELL'INTERA FRASE, il contesto della conversazione e il contesto del sito. Non classificare mai una domanda in base a una singola parola isolata.
- Le parole generiche come "prodotto", "articolo", "prezzo", "quello", "questo", "esperienza", "centro", "linea" o "argomento" vanno ricondotte naturalmente alla Fabbrica delle Api quando nella frase non compare un soggetto esterno che le qualifichi diversamente.
- Esempio: "qual è il prodotto che costa meno?" significa "tra i prodotti del nostro catalogo, qual è quello con il prezzo più basso?". Non è una domanda fuori tema.
- Esempio: "quale scarpa costa meno?" è fuori tema, perché "scarpa" identifica chiaramente un oggetto che non appartiene al nostro catalogo.
- Esempio: "in un'arnia quante api vivono?" appartiene pienamente al tuo mondo anche se non parla di acquisti: rispondi come guida esperta di api e apicoltura.
- Esempio: "chi è il Presidente della Repubblica?" è fuori tema perché il soggetto della domanda appartiene chiaramente a un altro ambito.
- Se la frase può essere interpretata in modo sensato dentro il tuo mondo e non contiene un soggetto esplicitamente esterno, preferisci l'interpretazione interna.
- Usa anche la conversazione immediatamente precedente: pronomi, confronti e formule come "quello", "il più economico", "e questo?", "quale dei due?" ereditano il contesto già stabilito.
- Il tuo mondo comprende: api, alveari, arnie, apicoltura, impollinazione, biodiversità, prodotti dell'alveare, catalogo e prezzi della Fabbrica delle Api, Alveoterapia Integrata, Oasi del Busatello, Galena delle Api, Linea Veleni, Punti Ape, ordini e spedizioni.
- Dichiara una domanda fuori tema solo quando il significato complessivo è chiaramente esterno; non perché manca una parola chiave prevista.
- Interpreta "offerta", "sconto" e "promozione" nel loro significato commerciale: NON significano "prodotti disponibili". Non dichiarare mai un prodotto in offerta se nel contesto certo non è indicato uno sconto o una promozione.
- Se una domanda è generale e la risposta cita più prodotti, non scegliere arbitrariamente una singola referenza come se fosse la risposta principale.
- Parole come "migliore", "più pregiato", "più buono", "più adatto" o simili NON hanno automaticamente un vincitore oggettivo. Chiarisci il criterio oppure, se proponi una scelta, dichiara esplicitamente il criterio usato.
- Se la risposta individua chiaramente UN prodotto come scelta principale, nominalo nelle prime righe con il nome esatto del catalogo. Il collegamento contestuale deve portare a QUEL prodotto, non a una categoria generica.
- Se non emerge un prodotto o una sezione realmente principale, è meglio non proporre alcun collegamento piuttosto che mostrarne uno generico o poco pertinente.
- Nelle comparazioni tra api di ambienti diversi, per esempio montagna e pianura, non trasformare differenze ambientali in caratteristiche fisse delle api. Distingui clima, fioriture, genetica delle colonie e gestione apistica; usa formulazioni prudenti per ciò che varia localmente.

COME INTERPRETARE LE DOMANDE
- Se una domanda è ambigua ("cosa scelgo a mezzanotte?"), interpretala prima nel contesto Fabbrica delle Api / prodotti dell'alveare / esperienza.
- Se la domanda è esplicitamente estranea ("che cravatta scelgo?"), dillo gentilmente e riporta l'utente al tuo ambito.
- Rispondi liberamente a domande generali su api e apicoltura anche se non c'entrano con lo shop: nemici delle api, comportamento, anatomia, volo, sonno, comunicazione, stagioni, predatori, parassiti, storia dell'apicoltura, api selvatiche, biodiversità, impollinazione, agricoltura, ruolo sociale ed economico.
- Quando spieghi un prodotto dell'alveare (miele, polline, propoli, pappa reale, cera, veleno d'api, Pane delle Api), se utile usa questo schema: cos'è -> a cosa serve alle api -> come viene usato dall'uomo.
- Quando l'utente chiede un dato attuale o numerico che può cambiare nel tempo e non è tra i dati certi forniti, NON inventare. Spiega che il dato va verificato su una fonte aggiornata.

BASE SCIENTIFICA VINCOLANTE SU ORIENTAMENTO E DANZA
- Le api da miele usano principalmente il sole, la luce polarizzata del cielo e punti di riferimento visivi per orientarsi.
- Non presentare vibrazioni o odori come principali strumenti di navigazione durante il volo.
- La danza di orientamento viene eseguita sul favo.
- La danza a otto contiene una corsa centrale vibrata (waggle run).
- Su un favo verticale, l'angolo della corsa vibrata rispetto alla verticale codifica la direzione della risorsa rispetto alla direzione del sole.
- La distanza della risorsa è collegata soprattutto alla durata della corsa vibrata: più dura, più lontana è la risorsa.
- Le api che ricevono l'informazione nella colonia percepiscono movimenti, vibrazioni, contatti e anche odori associati alla fonte.
- Gli odori possono aiutare a riconoscere il tipo di risorsa, ma non dire che una feromone "segna la strada" o mantiene una rotta fino al fiore.
- Evita formule antropomorfiche come "mappa della colonia" se non strettamente necessarie.
- Se hai un dubbio su un dettaglio di biologia delle api, preferisci una formulazione più prudente anziché completare con un dettaglio plausibile ma non certo.

ACCURATEZZA E ANTI-INVENZIONE
- Non inventare MAI nomi di enti, associazioni, università, prodotti, malattie, virus, studi, percentuali, numeri, prezzi, formati o caratteristiche.
- Se non sei sicura di un nome preciso, di un dato o di un fatto specialistico, dillo chiaramente e resta su informazioni generali affidabili.
- Non trasformare parole tecniche che non ricordi in nomi plausibili: meglio dire "non voglio rischiare di darti un nome sbagliato".
- Per dati attuali, statistiche, enti esistenti o situazioni nazionali, se non hai una fonte aggiornata nel contesto, evita elenchi dettagliati non verificati.
- Non presentare ipotesi o risultati preliminari di ricerca come benefici dimostrati per l'uomo.
- Non attribuire automaticamente proprietà come "stimola la circolazione", "antinfiammatorio", "antitumorale", "rigenerante", "detossinante" o simili a prodotti o ingredienti se non sono informazioni certe e appropriate.
- Non inventare prodotti della Fabbrica delle Api. Se il nome preciso del prodotto non è nel contesto certo, parla della categoria e chiedi se l'utente vuole vedere i prodotti realmente disponibili.
- Quando l'utente risponde solo "sì", usa il contesto immediatamente precedente e continua esattamente da lì.
- Per biologia, comportamento e apicoltura, privilegia formulazioni scientificamente corrette ma semplici. Non trasformare semplificazioni divulgative in fatti certi.
- Sulla danza delle api: descrivila come una danza a otto con una corsa centrale vibrata (waggle run), non come una "W".
- Non dire che le api "guardano" la danza come farebbe una persona: dentro l'alveare percepiscono movimenti, vibrazioni, contatti e odori.
- Per l'orientamento, presenta sole, luce polarizzata e punti di riferimento visivi come riferimenti principali; non mettere il vento sullo stesso piano se non è necessario.
- Evita frasi antropomorfiche forti come "la colonia costruisce una mappa interna" se non sono necessarie.

SALUTE E SICUREZZA
- Ape Pelù NON è un medico, NON è un farmacista e NON deve comportarsi come tale.
- Non fare diagnosi, prescrizioni, dosaggi, indicazioni terapeutiche, valutazioni cliniche o promesse di cura.
- Non usare linguaggio medico o farmaceutico come tono abituale. Evita parole e formule come: terapia, trattamento, analgesico, antinfiammatorio, efficacia clinica, stimola la circolazione, prescrizione, dosaggio, patologia, sintomo, guarigione, cura.
- Questi termini possono comparire solo se servono per spiegare chiaramente che NON è il campo di Ape Pelù o per distinguere un uso cosmetico da uno medico.
- Non presentare alveoterapia, veleno d'api, SOS DOL o altri prodotti come cure o trattamenti medici.
- Per cosmetica e Linea Veleni usa parole semplici e non mediche: uso cosmetico, massaggio, pelle, gesto quotidiano, texture, profumo, sensazione, comfort.
- Se l'utente chiede una cura o un consiglio medico, rispondi con una frase breve e naturale che chiarisca il limite e poi torna su informazioni educative, naturalistiche o cosmetiche non mediche.
- Segnala con prudenza rischi evidenti come allergie a punture o prodotti dell'alveare quando pertinenti, senza trasformare la risposta in un consulto sanitario.
- Per domande cosmetiche come rughe o pelle, evita piani salutistici generici non richiesti. Rispondi nel perimetro cosmetico e, se parli dei nostri prodotti, usa solo quelli realmente noti.
- Non dare consigli personalizzati su idratazione, sonno, dieta o altri comportamenti sanitari se non sono necessari alla domanda.
- Se l'utente chiede "cosa mi consigli" su un problema di salute, non indicare prodotti come soluzione. Puoi invece spiegare quali prodotti esistono, come si presentano e a quale uso cosmetico/non medico sono destinati.

STILE DI RISPOSTA
- Rispondi prima alla domanda: niente premesse evasive.
- Per domande semplici: 2-5 brevi paragrafi.
- Usa elenchi solo quando rendono davvero più chiaro.
- Fai esempi e paragoni facili da visualizzare quando aiutano.
- Non ripetere continuamente il nome del progetto o fare pubblicità.
- Non dire "questa prima versione", "quando collegheremo l'AI" o dettagli tecnici del chatbot.
- Se non sai qualcosa, dillo chiaramente invece di inventare.

CONVERSAZIONE
- Quasi sempre termina con UNA domanda breve e pertinente che inviti l'utente ad approfondire l'argomento.
- La domanda finale deve nascere DIRETTAMENTE dal tema appena discusso, non cambiare argomento.
- Se hai parlato di orientamento, continua con orientamento, danza, distanza di volo o ritorno all'alveare; non saltare a predatori, prodotti o altri temi.
- Non usare una frase generica ripetitiva.
- Non forzare un prodotto nella domanda finale se l'argomento è educativo.

ESEMPI DI COMPORTAMENTO
Utente: "Le api hanno dei nemici?"
Risposta attesa: spiega in modo semplice predatori, parassiti e minacce; distingui per esempio calabroni/vespe, varroa, predatori naturali e pressioni ambientali. Poi chiedi quale categoria vuole approfondire.

Utente: "A cosa serve il polline?"
Risposta attesa: cos'è, funzione nutritiva per la colonia/covata, uso alimentare umano con prudenza sulle allergie. Poi una curiosità pertinente.

Utente: "Che importanza hanno le api nel mondo sociale?"
Risposta attesa: impollinazione, cibo, agricoltura, lavoro, economia, cultura, educazione e biodiversità. Nessuna vendita forzata.
`.trim();

    const input = [
      ...history,
      {role:'user',content:message}
    ];

    const messages = [
      {role:'system', content:instructions},
      ...input
    ];

    const aiResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method:'POST',
      headers:{
        'Authorization':'Bearer ' + apiKey,
        'Content-Type':'application/json'
      },
      body:JSON.stringify({
        model:String(process.env.GROQ_MODEL || 'openai/gpt-oss-20b'),
        messages,
        max_tokens:650,
        temperature:0.2
      })
    });

    const data = await aiResponse.json().catch(() => null);

    if (!aiResponse.ok) {
      console.error('[Ape Pelù] Groq error:', aiResponse.status, data?.error?.message || 'unknown');
      return res.status(502).json({ok:false,aiConfigured:true,error:'Ape Pelù non riesce a rispondere con il motore AI in questo momento.'});
    }

    const reply = String(data?.choices?.[0]?.message?.content || '').trim();

    if (!reply) {
      return res.status(502).json({ok:false,aiConfigured:true,error:'Risposta AI vuota.'});
    }

    console.log('[Ape Pelù] Groq OK:', String(process.env.GROQ_MODEL || 'openai/gpt-oss-20b'));
    const action=getApeContextAction(message,reply,requestedLanguage);
    return res.json({ok:true,reply,action});
  } catch (error) {
    console.error('[Ape Pelù] Errore chat AI:', error);
    return res.status(500).json({ok:false,aiConfigured:true,error:'Errore temporaneo di Ape Pelù.'});
  }
});

let comuniItaliaCache = null;
let comuniItaliaCacheAt = 0;

async function getComuniItaliaDataset() {
  const maxAge = 24 * 60 * 60 * 1000;
  if (comuniItaliaCache && (Date.now() - comuniItaliaCacheAt) < maxAge) return comuniItaliaCache;

  const url = 'https://cdn.jsdelivr.net/gh/RP92/comuni-italiani@main/data/comuni.json';
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'LaFabbricaDelleApi/1.0 address-validator'
    }
  });
  if (!response.ok) throw new Error('Dataset comuni non disponibile: ' + response.status);
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error('Dataset comuni non valido');

  comuniItaliaCache = data;
  comuniItaliaCacheAt = Date.now();
  return data;
}

function normalizeEuropeanPostal(value){
  return String(value||'')
    .normalize('NFKC')
    .toUpperCase()
    .replace(/[–—]/g,'-')
    .replace(/\s+/g,' ')
    .trim();
}
function validEuropeanPostal(value,country){
  const v=normalizeEuropeanPostal(value);
  if(country==='IT') return /^\d{5}$/.test(v);
  // European postcodes vary widely: digits, letters, spaces and hyphens.
  // Keep validation intentionally permissive to avoid rejecting valid addresses.
  return /^[A-Z0-9][A-Z0-9 -]{1,11}$/.test(v) && /[A-Z0-9]/.test(v);
}
function normalizeEuropeanText(value){
  return String(value||'')
    .normalize('NFKC')
    .replace(/\s+/g,' ')
    .trim();
}

function validateEuropeanAddressShape({address,city,cap,country}){
  const cc=String(country||'').trim().toUpperCase();
  const a=normalizeEuropeanText(address);
  const c=normalizeEuropeanText(city);
  const p=normalizeEuropeanPostal(cap);
  if(!ORDER_COUNTRIES[cc]) return {ok:false,reason:'country'};
  if(!a || !c || !p) return {ok:false,reason:'missing'};
  if(!/\p{L}/u.test(a) || a.length<3) return {ok:false,reason:'address'};
  if(!/\p{L}/u.test(c) || c.length<2) return {ok:false,reason:'city'};
  if(!validEuropeanPostal(p,cc)) return {ok:false,reason:'postal'};
  return {ok:true,address:a,city:c,cap:p,country:cc};
}

function runEuropeanCheckoutSelfTest(){
  const samples=[
    {country:'ES',address:'Calle de Alcalá 120',city:'madrid',cap:'28009'},
    {country:'NL',address:'Damrak 1',city:'AMSTERDAM',cap:'1012 js'},
    {country:'GB',address:'Downing Street 10',city:'London',cap:'sw1a 2aa'},
    {country:'IE',address:"O'Connell Street 1",city:'Dublin',cap:'D01 F5P2'},
    {country:'PL',address:'Nowy Świat 1',city:'warszawa',cap:'00-001'},
    {country:'AL',address:'Rruga e Durrësit 1',city:'Tiranë',cap:'1001'},
    {country:'LI',address:'Städtle 1',city:'Vaduz',cap:'9490'},
    {country:'PT',address:'Rua Augusta 1',city:'Lisboa',cap:'1100-053'},
    {country:'SE',address:'Drottninggatan 1',city:'Stockholm',cap:'111 51'},
    {country:'MD',address:'Strada Ștefan cel Mare 1',city:'Chișinău',cap:'MD-2001'},
    {country:'AD',address:'Avinguda Meritxell 1',city:'Andorra la Vella',cap:'AD500'},
    {country:'GR',address:'Ermou 1',city:'Αθήνα',cap:'105 63'},
    {country:'CZ',address:'Václavské náměstí 1',city:'Praha',cap:'110 00'},
    {country:'FI',address:'Mannerheimintie 1',city:'Helsinki',cap:'00100'},
    {country:'CH',address:'Bahnhofstrasse 1',city:'Zürich',cap:'8001'},
    {country:'AX',address:'Torggatan 1',city:'Mariehamn',cap:'22100'},
    {country:'GI',address:'Main Street 1',city:'Gibraltar',cap:'GX11 1AA'}
  ];
  const failed=samples.filter(x=>!validateEuropeanAddressShape(x).ok);
  if(failed.length) console.error('[Checkout Europe] Self-test FALLITO:',failed);
  else console.log('[Checkout Europe] Self-test OK:',samples.length+'/'+samples.length,'formati indirizzo europei');
}

function normalizePlace(value) {
  return String(value || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

app.get('/api/local-delivery-check', async (req, res) => {
  try {
    const address = normalizeEuropeanText(req.query.address || '');
    const city = normalizeEuropeanText(req.query.city || '');
    const cap = normalizeEuropeanPostal(req.query.cap || '');
    const country = String(req.query.country || 'IT').trim().toUpperCase();
    const provinceRaw = normalizeEuropeanText(req.query.province || '');
    const province = country==='IT' ? provinceRaw.toUpperCase() : provinceRaw;

    if(!ORDER_COUNTRIES[country]){
      return res.status(422).json({ok:false,eligible:false,validFullAddress:false,error:'Paese di consegna non supportato.'});
    }

    if(country!=='IT'){
      const shape=validateEuropeanAddressShape({address,city,cap,country});
      if(!shape.ok){
        const error=shape.reason==='postal'?'Codice postale non valido.':shape.reason==='country'?'Paese non supportato.':'Inserisci un indirizzo e una città validi.';
        return res.status(422).json({ok:false,eligible:false,international:true,validFullAddress:false,error});
      }

      // Per gli ordini esteri il geocodificatore è solo una verifica aggiuntiva:
      // non deve impedire un ordine valido se il provider non trova l'indirizzo.
      let geocoded=false, lat=null, lon=null;
      try{
        const cfg=ORDER_COUNTRIES[country];
        const headers={'Accept':'application/json','User-Agent':'LaFabbricaDelleApi/1.0 international-address-validator'};
        const structured=new URLSearchParams({
          format:'json',addressdetails:'1',limit:'8',countrycodes:cfg.nominatim,
          street:address,city,postalcode:cap
        });
        let geoResponse=await fetch('https://nominatim.openstreetmap.org/search?'+structured.toString(),{headers});
        let results=geoResponse.ok?await geoResponse.json():[];
        if(!Array.isArray(results)||!results.length){
          const fallbackQs=new URLSearchParams({
            format:'json',addressdetails:'1',limit:'8',countrycodes:cfg.nominatim,
            q:[address,cap,city,province].filter(Boolean).join(', ')
          });
          geoResponse=await fetch('https://nominatim.openstreetmap.org/search?'+fallbackQs.toString(),{headers});
          if(geoResponse.ok) results=await geoResponse.json();
        }
        const cityNorm=normalizePlace(city);
        const normPost=v=>String(v||'').toUpperCase().replace(/[\s-]+/g,'');
        const match=(Array.isArray(results)?results:[]).find(item=>{
          const a=item.address||{};
          const display=normalizePlace(item.display_name||'');
          const cities=[a.city,a.town,a.village,a.municipality,a.county,a.state].filter(Boolean).map(normalizePlace);
          const cityOk=cities.some(v=>v===cityNorm||v.includes(cityNorm)||cityNorm.includes(v))||display.includes(cityNorm);
          const postcode=normPost(a.postcode||'');
          const capOk=!postcode||postcode===normPost(cap);
          return cityOk&&capOk;
        });
        if(match){
          geocoded=true; lat=Number(match.lat); lon=Number(match.lon);
        }
      }catch(_){}

      return res.json({
        ok:true,eligible:false,international:true,validAddressPair:true,validFullAddress:true,
        country,countryName:ORDER_COUNTRIES[country].name,geocoded,lat,lon
      });
    }
    if (!address || !city || !cap || !province) {
      return res.status(400).json({
        ok:false,
        eligible:false,
        validAddressPair:false,
        validFullAddress:false,
        error:'Via, numero civico, Comune, CAP e Provincia sono obbligatori.'
      });
    }

    if (!/[A-Za-zÀ-ÿ]/.test(address) || !/\d/.test(address)) {
      return res.status(422).json({
        ok:false,
        eligible:false,
        validAddressPair:false,
        validFullAddress:false,
        error:'Inserisci sia il nome della via sia il numero civico, ad esempio “Via Roma 12”.'
      });
    }

    if (!/^\d{5}$/.test(cap)) {
      return res.status(422).json({
        ok:false,
        eligible:false,
        validAddressPair:false,
        validFullAddress:false,
        error:'Il CAP deve essere composto da 5 cifre.'
      });
    }

    const dataset = await getComuniItaliaDataset();
    const cityNorm = normalizePlace(city);

    const nameMatches = dataset.filter(item => {
      const names = [item.nome, item.nomeAltraLingua].filter(Boolean).map(normalizePlace);
      return names.some(name => name === cityNorm);
    });

    if (!nameMatches.length) {
      return res.status(422).json({
        ok:false,
        eligible:false,
        validAddressPair:false,
        validFullAddress:false,
        error:'Il Comune “'+city+'” non risulta nell’elenco dei comuni italiani.'
      });
    }

    const municipality = nameMatches.find(item => {
      const caps = Array.isArray(item.cap) ? item.cap.map(String) : [];
      const sigla = String(item.sigla || item.provincia?.sigla || '').toUpperCase();
      return caps.includes(cap) && sigla === province;
    });

    if (!municipality) {
      const caps = [...new Set(nameMatches.flatMap(item => Array.isArray(item.cap) ? item.cap : []))];
      const sigle = [...new Set(nameMatches.map(item => item.sigla || item.provincia?.sigla).filter(Boolean))];
      let msg = 'CAP, Comune e Provincia non corrispondono.';
      if (caps.length) msg += ' Per '+city+' risultano: CAP '+caps.join(', ')+'.';
      if (sigle.length) msg += ' Provincia '+sigle.join(', ')+'.';
      return res.status(422).json({
        ok:false,
        eligible:false,
        validAddressPair:false,
        validFullAddress:false,
        error:msg
      });
    }

    const rawAddress = address.trim();
    const hasStreetPrefix = /^(via|viale|piazza|corso|strada|vicolo|localita|località|frazione)\b/i.test(rawAddress);
    const addressVariants = hasStreetPrefix
      ? [rawAddress]
      : [rawAddress, 'Via ' + rawAddress];

    let geoResults = [];
    for (const variant of addressVariants) {
      const freeQuery = [variant, municipality.nome, cap, province, 'Italia'].join(', ');
      const qs = new URLSearchParams({
        format:'json',
        addressdetails:'1',
        limit:'8',
        countrycodes:'it',
        q:freeQuery
      });

      const geoResponse = await fetch('https://nominatim.openstreetmap.org/search?'+qs.toString(), {
        headers:{
          'Accept':'application/json',
          'User-Agent':'LaFabbricaDelleApi/1.0 shipping-address-validator'
        }
      });

      if (geoResponse.ok) {
        const part = await geoResponse.json();
        if (Array.isArray(part)) geoResults.push(...part);
      }
      if (geoResults.length) break;
    }

    const wantedCity = normalizePlace(municipality.nome);
    const wantedNumber = (rawAddress.match(/\b(\d+[A-Za-z\/]*)\b/) || [,''])[1];
    const streetOnly = rawAddress
      .replace(/^(via|viale|piazza|corso|strada|vicolo|localita|località|frazione)\s+/i,'')
      .replace(/\b\d+[A-Za-z\/]*\b/g,'')
      .trim();
    const streetWords = normalizePlace(streetOnly);

    const matchesAddress = (item, requireNumberMatch) => {
      const a = item.address || {};
      const resultCap = String(a.postcode || '');
      const resultProvince = String(a.ISO3166_2_lvl6 || a.province || a.county || '');
      const resultCities = [a.city, a.town, a.village, a.municipality, a.hamlet, a.suburb, item.display_name]
        .filter(Boolean)
        .map(normalizePlace);
      const roadName = normalizePlace(a.road || a.pedestrian || a.residential || a.path || a.place || '');
      const house = String(a.house_number || '').trim();

      const cityOk = resultCities.some(name =>
        name === wantedCity ||
        name.includes(wantedCity) ||
        wantedCity.includes(name) ||
        normalizePlace(item.display_name || '').includes(wantedCity)
      );
      const capOk = !resultCap || resultCap === cap;
      const provinceOk = !resultProvince || resultProvince.toUpperCase().includes(province);
      const fullDisplay = normalizePlace(item.display_name || '');
      const roadOk = !streetWords ||
        roadName.includes(streetWords) ||
        fullDisplay.includes(streetWords);

      const numberOk = !requireNumberMatch ||
        !house ||
        normalizePlace(house) === normalizePlace(wantedNumber) ||
        fullDisplay.includes(normalizePlace(wantedNumber));

      return cityOk && capOk && provinceOk && roadOk && numberOk;
    };

    let verified = geoResults.find(item => matchesAddress(item, true));

    // Fallback: molti civici italiani non sono censiti. In quel caso verifichiamo
    // la via nel Comune/CAP corretti e accettiamo il civico scritto dall'utente.
    if (!verified && streetOnly) {
      const streetQueries = [
        [streetOnly, municipality.nome, cap, province, 'Italia'].join(', '),
        ['Via '+streetOnly, municipality.nome, cap, province, 'Italia'].join(', ')
      ];

      for (const query of streetQueries) {
        const qs = new URLSearchParams({
          format:'json',
          addressdetails:'1',
          limit:'10',
          countrycodes:'it',
          q:query
        });

        const geoResponse = await fetch('https://nominatim.openstreetmap.org/search?'+qs.toString(), {
          headers:{
            'Accept':'application/json',
            'User-Agent':'LaFabbricaDelleApi/1.0 street-validator'
          }
        });

        if (geoResponse.ok) {
          const part = await geoResponse.json();
          if (Array.isArray(part)) {
            verified = part.find(item => matchesAddress(item, false));
            if (verified) break;
          }
        }
      }
    }

    // Secondo verificatore indipendente: Photon/Komoot.
    // Serve quando Nominatim non censisce bene una strada o un civico.
    if (!verified) {
      try {
        const photonQuery = [rawAddress, municipality.nome, cap, province, 'Italia'].join(', ');
        const photonUrl = 'https://photon.komoot.io/api/?limit=10&q=' + encodeURIComponent(photonQuery);
        const photonResponse = await fetch(photonUrl, {
          headers:{
            'Accept':'application/json',
            'User-Agent':'LaFabbricaDelleApi/1.0 address-validator'
          }
        });

        if (photonResponse.ok) {
          const photonData = await photonResponse.json();
          const features = Array.isArray(photonData?.features) ? photonData.features : [];

          const photonMatch = features.find(feature => {
            const p = feature.properties || {};
            const coords = feature.geometry?.coordinates || [];
            const photonStreet = normalizePlace(p.street || p.name || '');
            const photonHouse = normalizePlace(p.housenumber || '');
            const photonCityValues = [p.city, p.locality, p.district, p.county]
              .filter(Boolean)
              .map(normalizePlace);
            const photonPostcode = String(p.postcode || '');
            const photonState = normalizePlace(p.state || '');
            const wantedNumberNorm = normalizePlace(wantedNumber);

            const cityOk = photonCityValues.some(name =>
              name === wantedCity ||
              name.includes(wantedCity) ||
              wantedCity.includes(name)
            );
            const capOk = !photonPostcode || photonPostcode === cap;
            const provinceOk = true; // Comune+CAP+sigla sono già stati validati sul dataset dei comuni italiani.
            const streetOk = !streetWords ||
              photonStreet.includes(streetWords) ||
              streetWords.includes(photonStreet);
            const numberOk = !wantedNumberNorm ||
              !photonHouse ||
              photonHouse === wantedNumberNorm;

            return cityOk && capOk && provinceOk && streetOk && numberOk &&
              Array.isArray(coords) && coords.length >= 2;
          });

          if (photonMatch) {
            const coords = photonMatch.geometry.coordinates;
            verified = {
              lat:String(coords[1]),
              lon:String(coords[0]),
              display_name:[
                photonMatch.properties?.street || photonMatch.properties?.name || streetOnly,
                photonMatch.properties?.housenumber || wantedNumber,
                municipality.nome,
                cap,
                province
              ].filter(Boolean).join(', ')
            };
          }
        }
      } catch (error) {
        console.warn('[Shop V2] Fallback Photon non disponibile:', error.message);
      }
    }

    if (!verified) {
      return res.status(422).json({
        ok:false,
        eligible:false,
        validAddressPair:true,
        validFullAddress:false,
        error:'Non riesco a verificare questa via nel Comune indicato. Controlla il nome della strada, il Comune e il CAP.'
      });
    }

    const lat = Number(verified.lat);
    const lon = Number(verified.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return res.status(422).json({
        ok:false,
        eligible:false,
        validAddressPair:true,
        validFullAddress:false,
        error:'Indirizzo trovato, ma coordinate non disponibili. Controlla i dati inseriti.'
      });
    }

    const centerLat = 45.187, centerLon = 10.974;
    const toRad = v => v * Math.PI / 180;
    const dLat = toRad(lat - centerLat), dLon = toRad(lon - centerLon);
    const a = Math.sin(dLat/2) ** 2 + Math.cos(toRad(centerLat)) * Math.cos(toRad(lat)) * Math.sin(dLon/2) ** 2;
    const km = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return res.json({
      ok:true,
      eligible:km <= 50,
      validAddressPair:true,
      validFullAddress:true,
      distanceKm:Math.round(km * 10) / 10,
      municipality:municipality.nome,
      cap,
      province,
      verifiedAddress:verified.display_name || [address, municipality.nome, cap, province].join(', ')
    });

  } catch (error) {
    console.error('[Shop V2] Errore verifica indirizzo completo:', error);
    return res.status(503).json({
      ok:false,
      eligible:false,
      validAddressPair:null,
      validFullAddress:false,
      error:'Non riesco a verificare l’indirizzo in questo momento. Riprova tra poco.'
    });
  }
});
app.use('/images', express.static(path.join(__dirname, 'images'), { etag:true,lastModified:true,maxAge:0,setHeaders:(res)=>{res.setHeader('Cache-Control','no-cache, no-store, must-revalidate');res.setHeader('Pragma','no-cache');res.setHeader('Expires','0');} }));

const cacheBustScript = `<script>(()=>{const version=${JSON.stringify('20260827-13')};const addVersion=(img)=>{if(!img||!img.getAttribute)return;const raw=img.getAttribute('src');if(!raw||!/^(?:\\/?images\\/)/i.test(raw))return;try{const url=new URL(raw,window.location.href);if(url.searchParams.get('v')!==version){url.searchParams.set('v',version);img.src=url.pathname+url.search+url.hash;}}catch(_){}};const scan=(root)=>{if(!root)return;if(root.tagName==='IMG')addVersion(root);if(root.querySelectorAll)root.querySelectorAll('img[src]').forEach(addVersion);};const start=()=>{scan(document);const observer=new MutationObserver(ms=>{for(const m of ms){m.addedNodes.forEach(scan);if(m.type==='attributes'&&m.target.tagName==='IMG')addVersion(m.target);}});observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['src']});};document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();})();</script>`;

const shopBridgeScript = `<style>
html,body{max-width:100%;overflow-x:hidden!important}
#center-home-bar{width:100%;box-sizing:border-box;display:flex;align-items:center;justify-content:flex-start;padding:9px 18px;background:#07372b;border-bottom:1px solid rgba(212,175,55,.55);position:relative;z-index:40}
#center-home-link{display:inline-flex;align-items:center;gap:8px;padding:9px 15px;border-radius:999px;border:1px solid rgba(212,175,55,.9);background:rgba(255,255,255,.04);color:#fff;text-decoration:none;font:700 14px/1.1 system-ui,sans-serif}
.shop-brand-wrap{min-width:0!important;width:min(760px,calc(100vw - 360px))!important;max-width:min(760px,calc(100vw - 360px))!important;margin-left:auto!important;margin-right:24px!important;overflow:hidden!important;position:relative!important;padding:22px 28px 26px!important;border-radius:28px!important;background:linear-gradient(135deg,rgba(7,55,43,.72),rgba(5,18,14,.25))!important;border:1px solid rgba(212,175,55,.45)!important}
.shop-brand-title{display:block!important;width:100%!important;margin:0 auto!important;white-space:normal!important;font-family:Georgia,'Times New Roman',serif!important;font-size:clamp(2.35rem,4.6vw,4.9rem)!important;line-height:.94!important;text-align:center!important;text-transform:uppercase!important;background:linear-gradient(180deg,#fff0a8 0%,#f3c651 42%,#c88716 100%)!important;-webkit-background-clip:text!important;background-clip:text!important;-webkit-text-fill-color:transparent!important}
.shop-subtitle-spin{display:flex!important;width:fit-content!important;margin:0 auto!important;align-items:center!important;justify-content:center!important;gap:14px!important;padding-top:10px!important;font-weight:700!important;color:#fff6d8!important;transform-style:preserve-3d;perspective:1000px;animation:rotate3DLinear 20s infinite linear}
.shop-subtitle-spin svg{width:60px;height:40px}
.honey-selection-card{grid-column:span 2!important;width:100%!important;max-width:540px!important;aspect-ratio:8/5!important}
.honey-selection-card h3{font-size:clamp(17px,2.4vw,24px)!important;color:#f6c85f!important}
.selected-honey-divider{grid-column:1/-1!important;width:100%;margin:30px 0 8px;padding:20px 22px;border-radius:18px;border:1px solid rgba(212,175,55,.45);background:linear-gradient(135deg,rgba(7,55,43,.78),rgba(22,31,27,.68));box-shadow:0 10px 26px rgba(0,0,0,.22)}
.selected-honey-divider h2{margin:0;font:700 clamp(1.55rem,3vw,2.35rem)/1.05 Georgia,'Times New Roman',serif;color:#f4c85b}
.selected-honey-divider p{margin:7px 0 0;color:#e7e5e4;font:500 15px/1.45 system-ui,sans-serif}
.pending-honey-card{min-height:260px!important;padding:24px!important;border-radius:22px!important;border:1px solid rgba(212,175,55,.42)!important;background:linear-gradient(145deg,#30291f,#1f1b17)!important;display:flex!important;flex-direction:column!important;justify-content:center!important;align-items:center!important;text-align:center!important;box-shadow:0 12px 28px rgba(0,0,0,.28)!important}
.pending-honey-card .pending-honey-icon{font-size:58px;line-height:1;margin-bottom:14px}
.pending-honey-card h3{margin:0 0 9px!important;color:#f5c75d!important;font:800 22px/1.15 Georgia,'Times New Roman',serif!important}
.pending-honey-card p{margin:0!important;color:#e7e5e4!important;font:500 14px/1.45 system-ui,sans-serif!important}
.pending-honey-card .pending-label{margin-top:15px!important;display:inline-block!important;padding:7px 11px!important;border-radius:999px!important;border:1px solid rgba(212,175,55,.42)!important;color:#ffe49a!important;font-size:12px!important;font-weight:800!important;text-transform:uppercase!important;letter-spacing:.04em!important}
@media(max-width:900px){.shop-brand-wrap{width:calc(100vw - 32px)!important;max-width:calc(100vw - 32px)!important;margin:12px auto!important}}
@media(max-width:760px){.honey-selection-card{grid-column:span 1!important;max-width:100%!important;aspect-ratio:4/3!important}.shop-brand-title{font-size:clamp(1.9rem,10vw,3.25rem)!important}}
</style><script>(()=>{
const approvedHoneyTokens=['millefiori','fragola','melone','pesca','arancia','acacia','castagno','rucas','eucalipto','eucamiel','euca miel','propol miel','propolmiel','balsam miel','balsammiel'];
const selectedHoneyNames=['Miele di Acacia','Miele di Castagno','Millefiori di Rucas','Alta Montagna','Miele di Eucalipto','Eucamiel','Euca Miel','Propol Miel','Propolmiel','Balsam Miel','Balsammiel'];
const missingHoney=[
  {id:'pending-rucas',name:'Millefiori di Rucas – Alta Montagna'},
  {id:'pending-eucalipto',name:'Miele di Eucalipto'},
  {id:'pending-propol-miel',name:'Propol Miel'}
];
const normalize=(value)=>String(value||'').normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toLowerCase();
const findProductCard=(node)=>{let current=node;for(let i=0;current&&i<7;i+=1,current=current.parentElement){if(current.querySelector&&current.querySelector('img')&&current.parentElement&&current.parentElement.children.length>1)return current;}return null;};
const findHoneyGrid=()=>{const nodes=Array.from(document.querySelectorAll('h2,h3,h4,p,span,div'));const known=nodes.find(el=>{const t=normalize((el.textContent||'').trim());return t.length<100&&(t.includes('miele millefiori')||t.includes("miele con essenze all'arancia"));});if(!known)return null;const card=findProductCard(known);return card&&card.parentElement?card.parentElement:null;};
const filterVisibleHoneys=()=>{const title=Array.from(document.querySelectorAll('h1,h2,h3')).find(el=>/Mieli del Busatello/i.test(el.textContent||''));if(!title)return;const grid=findHoneyGrid();if(!grid)return;Array.from(grid.children).forEach(child=>{if(!child||child.id==='selected-honey-divider'||(child.classList&&child.classList.contains('pending-honey-card')))return;const text=normalize(child.textContent||'');if(!text)return;const looksLikeProduct=!!(child.querySelector&&child.querySelector('img'));if(!looksLikeProduct)return;const approved=approvedHoneyTokens.some(token=>text.includes(normalize(token)));child.style.display=approved?'':'none';});};
const addSelectedHoneyDivider=()=>{if(document.getElementById('selected-honey-divider'))return;const busatelloTitle=Array.from(document.querySelectorAll('h1,h2,h3')).find(el=>/Mieli del Busatello/i.test(el.textContent||''));if(!busatelloTitle)return;const nodes=Array.from(document.querySelectorAll('h2,h3,h4,p,span,div'));const nameNode=nodes.find(el=>{const text=(el.textContent||'').trim();return text.length<120&&selectedHoneyNames.some(name=>normalize(text).includes(normalize(name)));});if(!nameNode)return;const card=findProductCard(nameNode);if(!card||!card.parentElement)return;const divider=document.createElement('div');divider.id='selected-honey-divider';divider.className='selected-honey-divider';divider.innerHTML='<h2>Selezionati per voi</h2><p>Una selezione speciale di mieli scelti dalla Fabbrica delle Api.</p>';card.parentElement.insertBefore(divider,card);};
const addMissingHoneyCards=()=>{const title=Array.from(document.querySelectorAll('h1,h2,h3')).find(el=>/Mieli del Busatello/i.test(el.textContent||''));if(!title)return;const grid=findHoneyGrid();if(!grid)return;missingHoney.forEach(item=>{if(document.getElementById(item.id))return;const existingText=normalize(grid.textContent||'');if(existingText.includes(normalize(item.name)))return;const card=document.createElement('div');card.id=item.id;card.className='pending-honey-card';card.innerHTML='<div class="pending-honey-icon">🍯</div><h3>'+item.name+'</h3><p>Scheda prodotto in aggiornamento. Foto e prezzo verranno inseriti appena definitivi.</p><span class="pending-label">Prossimamente disponibile</span>';grid.appendChild(card);});};
const forceBalsamImage=()=>{const nodes=Array.from(document.querySelectorAll('h1,h2,h3,h4,p,span,div'));const nameNode=nodes.find(el=>{const text=normalize((el.textContent||'').trim());return text.length<140&&(text.includes('balsammiel miele balsamico')||text.includes('balsam miel'));});if(!nameNode)return;const card=findProductCard(nameNode);if(!card)return;const img=card.querySelector('img');if(img&&!(img.getAttribute('src')||'').includes('/images/balsam-miel.jpg'))img.src='/images/balsam-miel.jpg';};
const enhanceShop=()=>{if(!document.getElementById('center-home-bar')){const bar=document.createElement('div');bar.id='center-home-bar';const link=document.createElement('a');link.id='center-home-link';link.href='/';link.textContent='← Home Centro';bar.appendChild(link);document.body.insertBefore(bar,document.body.firstElementChild);}const headings=Array.from(document.querySelectorAll('h1,h2,h3'));const title=headings.find(el=>(el.textContent||'').includes('La Fabbrica delle Api'));if(title){title.classList.add('shop-brand-title');if(title.parentElement)title.parentElement.classList.add('shop-brand-wrap');}const honeyHeading=headings.find(el=>(el.textContent||'').includes('La selezione di mieli della Fabbrica delle Api'));if(honeyHeading&&honeyHeading.parentElement)honeyHeading.parentElement.classList.add('honey-selection-card');filterVisibleHoneys();addSelectedHoneyDivider();addMissingHoneyCards();forceBalsamImage();};
const start=()=>{enhanceShop();new MutationObserver(enhanceShop).observe(document.body,{childList:true,subtree:true});};document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();})();</script>`;

const sendShop = (_req,res)=>{try{const indexPath=path.join(__dirname,'index.html');let html=fs.readFileSync(indexPath,'utf8');html=html.replaceAll("L'Italiano",'La Fabbrica delle Api');html=html.replaceAll('I Mieli Artigianali',"Mieli e prodotti dell'alveare");html=html.replaceAll("category: 'prelibati'","category: 'busatello'");html=html.replaceAll('alt="I mieli del Busatello"','alt="La selezione di mieli della Fabbrica delle Api"');html=html.replaceAll('>I mieli del Busatello</h3>','>La selezione di mieli della Fabbrica delle Api</h3>');html=html.replaceAll('https://placehold.co/400x400/A52A2A/FFFFFF?text=Balsammiel','/images/balsam-miel.jpg');html=html.replace(/<a className="card" href="#" onClick=\{\(e\) => \{ e\.preventDefault\(\); onSelectCategory\('prelibati'\); \}\}>[\s\S]*?<h3 className="rose">I mieli prelibati<\/h3>\s*<\/a>/,'');html=html.replace(/^\s*\{\s*id:\s*["'][^"']*12["'][^\n]*jars:\s*12[^\n]*\},?\s*$/gm,'');
const honeyAvailabilityHelper=`
            const applyHoneyAvailability = (list) => {
                const busatelloOrder = ['millefiori','fragola','melone','pesca','arancia'];
                const selectedOrder = ['acacia','castagno','rucas','eucalipto','eucamiel','euca miel','propol miel','propolmiel','balsam miel','balsammiel'];
                const allowedHoneyTokens = [...busatelloOrder, ...selectedOrder];
                const normalize = (value) => String(value || '').normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').toLowerCase();
                const mapped = list.map((product, originalIndex) => {
                    let normalizedProduct = product.category === 'prelibati' ? { ...product, category: 'busatello' } : product;
                    if (normalizedProduct.id === 'balsammiel') normalizedProduct = { ...normalizedProduct, image: '/images/balsam-miel.jpg' };
                    if (normalizedProduct.category !== 'busatello') return normalizedProduct;
                    const name = normalize(normalizedProduct.name);
                    const busIndex = busatelloOrder.findIndex(token => name.includes(token));
                    const selectedIndex = selectedOrder.findIndex(token => name.includes(token));
                    const isAllowed = allowedHoneyTokens.some(token => name.includes(token));
                    let forcedOrder = 900 + originalIndex;
                    if (busIndex >= 0) forcedOrder = 1 + busIndex;
                    else if (selectedIndex >= 0) forcedOrder = 101 + selectedIndex;
                    const availableProduct = isAllowed ? normalizedProduct : { ...normalizedProduct, inStock: true, stock: 0 };
                    return { ...availableProduct, order: forcedOrder };
                });
                return mapped;
            };
`;
html=html.replace('// === STOCK MODE TOGGLE ===',`${honeyAvailabilityHelper}\n            // === STOCK MODE TOGGLE ===`);html=html.replaceAll('staticInitialProducts.filter(p => allowedCategoriesForShop.includes(p.category))','applyHoneyAvailability(staticInitialProducts).filter(p => allowedCategoriesForShop.includes(p.category))');html=html.replace('const filtered = mergedProducts.filter(p => allowedCategoriesForShop.includes(p.category));','const filtered = applyHoneyAvailability(mergedProducts).filter(p => allowedCategoriesForShop.includes(p.category));');html=html.replace('className="text-6xl sm:text-7xl lg:text-8xl font-black text-amber-900 flex flex-col items-end gap-2 text-3d-effect"','className="text-6xl sm:text-7xl lg:text-8xl font-black text-amber-900 flex flex-col items-end gap-2"');const injected=`${cacheBustScript}\n${shopBridgeScript}`;html=html.includes('</head>')?html.replace('</head>',`${injected}\n</head>`):`${injected}\n${html}`;res.setHeader('Cache-Control','no-cache, no-store, must-revalidate');res.setHeader('Pragma','no-cache');res.setHeader('Expires','0');return res.type('html').send(html);}catch(error){console.error('[Miele Artigianale] Errore caricamento shop:',error);return res.status(500).send('Errore caricamento pagina.');}};
const ALVEO_PDF_LANGS={
  it:{file:'translations/10-colazioni-it-source.json',label:'Italiano',title:"10 COLAZIONI DELL'ALVEARE",subtitle:'DIECI MATTINE. DIECI PICCOLI MOMENTI DI BONTÀ.'},
  en:{file:'translations/10-colazioni-en.json',label:'English',title:'10 BREAKFASTS FROM THE HIVE',subtitle:'TEN MORNINGS. TEN SMALL MOMENTS OF GOODNESS.'},
  de:{file:'translations/10-colazioni-de.json',label:'Deutsch',title:'10 FRÜHSTÜCKE AUS DEM BIENENSTOCK',subtitle:'ZEHN MORGEN. ZEHN KLEINE GENUSSMOMENTE.'},
  fr:{file:'translations/10-colazioni-fr.json',label:'Français',title:'10 PETITS-DÉJEUNERS DE LA RUCHE',subtitle:'DIX MATINS. DIX PETITS MOMENTS DE GOURMANDISE.'},
  es:{file:'translations/10-colazioni-es.json',label:'Español',title:'10 DESAYUNOS DE LA COLMENA',subtitle:'DIEZ MAÑANAS. DIEZ PEQUEÑOS MOMENTOS DE SABOR.'}
};

function alveoPdfSafeText(value){
  return String(value||'').normalize('NFKC')
    .replace(/[“”]/g,'"').replace(/[‘’]/g,"'")
    .replace(/[‐‑‒–—―]/g,'-').replace(/…/g,'...')
    .replace(/[★☆]/g,'*').replace(/→/g,'>')
    .replace(/•/g,'-').replace(/[\u00a0\u202f\u2007]/g,' ').replace(/[\u200b\u2060\ufeff]/g,'');
}
function alveoPdfWrap(text,font,size,maxWidth){
  const words=alveoPdfSafeText(text).split(/\s+/).filter(Boolean);
  const lines=[]; let line='';
  for(const word of words){
    const trial=line?line+' '+word:word;
    if(font.widthOfTextAtSize(trial,size)<=maxWidth){line=trial;}
    else{
      if(line) lines.push(line);
      if(font.widthOfTextAtSize(word,size)<=maxWidth){line=word;}
      else{
        let part='';
        for(const ch of word){
          const t=part+ch;
          if(font.widthOfTextAtSize(t,size)<=maxWidth) part=t;
          else{ if(part) lines.push(part); part=ch; }
        }
        line=part;
      }
    }
  }
  if(line) lines.push(line);
  return lines;
}
function alveoPdfIsHeading(line){
  const t=String(line||'').trim();
  if(!t || t.length>72) return false;
  const letters=t.replace(/[^A-Za-zÀ-ÿÄÖÜäöüßÑñÇç]/g,'');
  if(!letters) return false;
  return t===t.toUpperCase() || /^(BREAKFAST|FRÜHSTÜCK|PETIT|DESAYUNO|COLAZIONE|RECETTE|REZEPT|RICETTA|RECIPE|IDEAS?|IDEE|ORGAN|DISCOVER|ENTDECK|DÉCOUV|DESCUBR|QUIZ|PLANNER|PLANIFIC|MIEL|HONIG|HONEY|MIELE)/i.test(t);
}
async function buildAlveoMagazinePdf(lang){
  const cfg=ALVEO_PDF_LANGS[lang]||ALVEO_PDF_LANGS.it;
  const source=JSON.parse(fs.readFileSync(path.join(__dirname,cfg.file),'utf8'));
  const pagesText=Array.isArray(source.pages)?source.pages:[];
  if(!pagesText.length) throw new Error('Contenuto magazine non disponibile: '+lang);
  const pdf=await PDFDocument.create();
  const regular=await pdf.embedFont(StandardFonts.Helvetica);
  const bold=await pdf.embedFont(StandardFonts.HelveticaBold);
  const serif=await pdf.embedFont(StandardFonts.TimesRomanBold);
  const W=595.28,H=841.89;
  const cream=rgb(0.985,0.963,0.91), green=rgb(0.055,0.22,0.165), green2=rgb(0.08,0.30,0.22);
  const gold=rgb(0.86,0.62,0.16), ink=rgb(0.09,0.14,0.11), muted=rgb(0.35,0.41,0.37), pale=rgb(0.96,0.91,0.76);
  for(let pi=0;pi<pagesText.length;pi++){
    const page=pdf.addPage([W,H]);
    page.drawRectangle({x:0,y:0,width:W,height:H,color:cream});
    const pageNo=pi+1;
    if(pi===0){
      page.drawRectangle({x:0,y:0,width:W,height:H,color:green});
      page.drawRectangle({x:0,y:H-225,width:W,height:225,color:green2});
      page.drawCircle({x:500,y:735,size:66,color:gold,opacity:0.92});
      page.drawCircle({x:465,y:690,size:22,color:pale,opacity:0.88});
      page.drawText('LA FABBRICA DELLE API',{x:42,y:780,size:10,font:bold,color:pale});
      const titleLines=alveoPdfWrap(cfg.title,serif,31,480);
      let y=650;
      for(const line of titleLines){page.drawText(line,{x:42,y,size:31,font:serif,color:rgb(1,1,1)});y-=36;}
      page.drawText(cfg.subtitle,{x:42,y:y-8,size:10,font:bold,color:gold});
      const intro=pagesText[0].split(/\n/).map(x=>x.trim()).filter(Boolean).filter(x=>!x.includes('LA FABBRICA')&&!/\b10\b/.test(x.slice(0,20))).slice(0,8);
      y-=78;
      for(const raw of intro){
        const lines=alveoPdfWrap(raw,regular,10.5,465);
        for(const line of lines){page.drawText(line,{x:42,y,size:10.5,font:regular,color:rgb(0.91,0.95,0.93)});y-=15;}
        y-=3;
      }
      page.drawLine({start:{x:42,y:96},end:{x:553,y:96},thickness:1,color:rgb(0.3,0.48,0.4)});
      page.drawText('ALVEO DIGITALE - PREMIUM EDITION',{x:42,y:72,size:8.5,font:bold,color:gold});
      page.drawText(String(pageNo),{x:540,y:72,size:8,font:regular,color:pale});
      continue;
    }
    if(pi===2 || pi===23 || pi===26 || pi===31){
      page.drawRectangle({x:0,y:0,width:W,height:H,color:green});
      page.drawRectangle({x:30,y:35,width:535,height:771,borderColor:gold,borderWidth:1.2});
      const rawLines=pagesText[pi].split(/\n/).map(x=>x.trim()).filter(Boolean);
      page.drawText('LA FABBRICA DELLE API',{x:42,y:782,size:9,font:bold,color:pale});
      let y=660;
      const main=rawLines.filter(x=>!x.includes('LA FABBRICA')&&!/^\d+$/.test(x)).slice(0,10);
      for(let i=0;i<main.length;i++){
        const isHead=i<3||alveoPdfIsHeading(main[i]);
        const font=isHead?serif:regular,size=isHead?28:13,color=isHead?rgb(1,1,1):pale;
        for(const line of alveoPdfWrap(main[i],font,size,485)){page.drawText(line,{x:42,y,size,font,color});y-=size*1.25;}
        y-=8;
      }
      page.drawText(String(pageNo),{x:535,y:42,size:8,font:regular,color:pale});
      continue;
    }
    page.drawRectangle({x:0,y:H-44,width:W,height:44,color:green});
    page.drawText('LA FABBRICA DELLE API',{x:30,y:H-28,size:8.5,font:bold,color:rgb(1,1,1)});
    page.drawText(cfg.label.toUpperCase(),{x:500,y:H-28,size:7.5,font:bold,color:gold});
    page.drawLine({start:{x:30,y:H-60},end:{x:565,y:H-60},thickness:1,color:gold});
    let lines=pagesText[pi].split(/\n/).map(x=>x.trim()).filter(Boolean);
    lines=lines.filter((x,i)=>!(i===0 && /LA FABBRICA/i.test(x)));
    const dense=lines.join(' ').length>1500;
    const bodySize=dense?8.0:9.2;
    const colGap=22,margin=34,colWidth=(W-margin*2-colGap)/2;
    const useColumns=lines.join(' ').length>900;
    let col=0,x=margin,y=H-82;
    const switchColumn=()=>{if(useColumns&&col===0){col=1;x=margin+colWidth+colGap;y=H-82;return true;}return false;};
    for(const raw of lines){
      const heading=alveoPdfIsHeading(raw),numeric=/^\d{1,2}$/.test(raw);
      let font=heading?bold:regular,size=heading?11.2:bodySize,color=heading?green:ink;
      if(numeric){font=serif;size=21;color=gold;}
      const width=useColumns?colWidth:(W-margin*2);
      if(heading&&y<H-100)y-=4;
      for(const line of alveoPdfWrap(raw,font,size,width)){
        if(y<46&&switchColumn()){}
        if(y<46)break;
        page.drawText(line,{x,y,size,font,color});
        y-=size*1.32;
      }
      y-=heading?5:3;
    }
    page.drawLine({start:{x:30,y:31},end:{x:565,y:31},thickness:0.6,color:rgb(0.83,0.78,0.66)});
    page.drawText('Alveo Digitale - La Fabbrica delle Api',{x:30,y:17,size:6.8,font:regular,color:muted});
    page.drawText(String(pageNo),{x:548,y:17,size:6.8,font:regular,color:muted});
  }
  pdf.setTitle(cfg.title);
  pdf.setAuthor('La Fabbrica delle Api - ALTHEA 12830');
  pdf.setSubject('Alveo Digitale - Edizione Premium');
  return Buffer.from(await pdf.save({useObjectStreams:true}));
}

const ALVEO_PREMIUM_PDF_FILES={
  it:'10-colazioni-it.pdf',
  en:'10-colazioni-en.pdf',
  de:'10-colazioni-de.pdf',
  fr:'10-colazioni-fr.pdf',
  es:'10-colazioni-es.pdf'
};
app.get('/downloads/10-colazioni-:lang.pdf',(req,res)=>{
  const lang=String(req.params.lang||'it').toLowerCase();
  const filename=ALVEO_PREMIUM_PDF_FILES[lang];
  if(!filename || !ALVEO_PDF_LANGS[lang]) return res.status(404).send('Lingua non disponibile.');
  const filePath=path.join(__dirname,'downloads','alveo-premium',filename);
  if(!fs.existsSync(filePath)){
    console.error('[Alveo PDF] File Premium mancante:',filePath);
    return res.status(503).send('PDF temporaneamente non disponibile.');
  }
  res.setHeader('Content-Type','application/pdf');
  res.setHeader('Content-Disposition','inline; filename="10-Colazioni-dell-Alveare-'+lang.toUpperCase()+'-Premium.pdf"');
  res.setHeader('Cache-Control','public, max-age=3600');
  return res.sendFile(filePath);
});
const GLOBAL_TOOLS_MARKUP="<div class=\"site-tools-bar\" id=\"globalToolsBar\" aria-label=\"Strumenti del sito\"><div class=\"site-tools-inner\"><div class=\"site-tools-note\">Trova subito ciò che cerchi</div><button class=\"global-ape-launch\" id=\"apeChatLaunch\" type=\"button\" aria-label=\"Chiedi a Ape Pelù: scopri, chiedi e lasciati guidare nel mondo delle api\"><span class=\"global-ape-icon\">🐝</span><span class=\"global-ape-copy\"><strong>Chiedi a Ape Pelù</strong><small>Scopri, chiedi, lasciati guidare nel mondo delle api.</small></span></button><div class=\"global-site-search\" id=\"globalSiteSearch\"><div class=\"global-site-search-box\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"11\" cy=\"11\" r=\"7\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"m16.5 16.5 4 4\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/></svg><input id=\"globalSiteSearchInput\" type=\"search\" placeholder=\"Cerca nel sito...\" autocomplete=\"off\"><button class=\"global-site-search-go\" id=\"globalSiteSearchGo\" type=\"button\" aria-label=\"Avvia la ricerca\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"11\" cy=\"11\" r=\"7\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"m16.5 16.5 4 4\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/></svg></button></div><div class=\"global-site-search-results\" id=\"globalSiteSearchResults\"></div></div></div></div>";
const sendPage=(filename)=>(_req,res)=>{
  res.setHeader('Cache-Control','no-cache, no-store, must-revalidate');
  if(filename==='shop-v2.html') return res.sendFile(path.join(__dirname,filename));
  try{
    let html=fs.readFileSync(path.join(__dirname,filename),'utf8');
    if(!/name=["']google["'][^>]*content=["']notranslate["']/i.test(html)){
      html=html.includes('<head>')?html.replace('<head>','<head><meta name="google" content="notranslate">'):html;
    }
    html=html.replace(/<html(?![^>]*\btranslate=)([^>]*)>/i,'<html$1 translate="no" class="notranslate">');
    html=html.replace(/<body(?![^>]*\btranslate=)([^>]*)>/i,'<body$1 translate="no" class="notranslate">');
    if(!html.includes('id="globalToolsBar"')){
      html=html.includes('</header>')?html.replace('</header>','</header>'+GLOBAL_TOOLS_MARKUP):GLOBAL_TOOLS_MARKUP+html;
    }
    if(!html.includes('/global-tools-v2.js')){
      html=html.includes('</body>')?html.replace('</body>','<script src="/global-tools-v2.js?v=20260922-2"></script></body>'):html+'<script src="/global-tools-v2.js?v=20260922-2"></script>';
    }
    return res.type('html').send(html);
  }catch(error){
    console.error('[Miele Artigianale] Errore caricamento pagina:',filename,error);
    return res.status(500).send('Errore caricamento pagina.');
  }
};
app.get('/',sendPage('home.html'));app.get('/home',sendPage('home.html'));app.get('/centro',sendPage('centro.html'));app.get('/alveoterapia',sendPage('alveoterapia.html'));app.get('/bacheca',sendPage('bacheca.html'));app.get('/chi-siamo',sendPage('chi-siamo.html'));app.get('/contatti',sendPage('contatti.html'));app.get('/alveo-digitale',sendPage('alveo-digitale.html'));app.get('/shop',sendPage('shop-v2.html'));app.get('/shop-v2',sendPage('shop-v2.html'));app.get('/shop.html',sendPage('shop-v2.html'));app.get('/index.html',sendPage('shop-v2.html'));app.get('/shop-legacy',(_req,res)=>res.status(410).type('text').send('Archivio shop legacy interno: accesso pubblico disattivato.'));app.use(express.static(__dirname));runEuropeanCheckoutSelfTest();app.listen(PORT,'0.0.0.0',()=>console.log(`[Miele Artigianale] Server avviato sulla porta ${PORT}.`));