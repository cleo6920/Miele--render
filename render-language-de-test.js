(function(){
'use strict';

const KEY='fda-site-language';
const SUPPORTED=['it','en','de','fr','es'];
const NAMES={
  it:'🇮🇹 Italiano',
  en:'🇬🇧 English',
  de:'🇩🇪 Deutsch',
  fr:'🇫🇷 Français',
  es:'🇪🇸 Español'
};
let lang='it';
let translating=false;
let observer=null;
const originals=new WeakMap();
const attrOriginals=new WeakMap();
const pending=new Map();

const CORE={
  en:{
    "Home":"Home",
    "Alveoterapia":"Alveotherapy",
    "Alveoterapia Integrata":"Integrated Alveotherapy",
    "ALVEOTERAPIA INTEGRATA":"INTEGRATED ALVEOTHERAPY",
    "Chi siamo":"About us",
    "Bacheca":"News",
    "Contatti":"Contact",
    "Prodotti & Shop":"Products & Shop",
    "Parliamone":"Let's talk",
    "Linea Veleni":"Bee Venom Line",
    "LINEA VELENI":"BEE VENOM LINE",
    "Il Centro":"The Centre",
    "Galena delle Api":"Galena delle Api",
    "Oasi del Busatello":"Busatello Oasis",
    "Primavera · Estate":"Spring · Summer",
    "Autunno · Inverno":"Autumn · Winter",
    "Carrello":"Cart",
    "Il tuo carrello":"Your cart",
    "Selezione":"Selection",
    "Tutte le linee":"All collections",
    "Linea Alimenti":"Food Collection",
    "Linea Integratori":"Supplements Collection",
    "Linea Cosmesi e Tesori in Cera d’Api":"Cosmetics & Beeswax Treasures",
    "Linea Cosmetica al Veleno d’Api":"Bee Venom Cosmetic Line",
    "Pagamento":"Payment",
    "Spedizione":"Shipping",
    "Totale da pagare":"Total to pay"
  },
  de:{
    "Home":"Startseite",
    "Alveoterapia":"Alveotherapie",
    "Alveoterapia Integrata":"Integrierte Alveotherapie",
    "ALVEOTERAPIA INTEGRATA":"INTEGRIERTE ALVEOTHERAPIE",
    "Chi siamo":"Über uns",
    "Bacheca":"Aktuelles",
    "Contatti":"Kontakt",
    "Prodotti & Shop":"Produkte & Shop",
    "Parliamone":"Sprechen wir darüber",
    "Linea Veleni":"Bienengift-Linie",
    "LINEA VELENI":"BIENENGIFT-LINIE",
    "Il Centro":"Das Zentrum",
    "Galena delle Api":"Galena delle Api",
    "Oasi del Busatello":"Oase Busatello",
    "Primavera · Estate":"Frühling · Sommer",
    "Autunno · Inverno":"Herbst · Winter",
    "Carrello":"Warenkorb",
    "Il tuo carrello":"Dein Warenkorb",
    "Selezione":"Auswahl",
    "Tutte le linee":"Alle Linien",
    "Linea Alimenti":"Lebensmittel-Linie",
    "Linea Integratori":"Nahrungsergänzungsmittel",
    "Linea Cosmesi e Tesori in Cera d’Api":"Kosmetik & Schätze aus Bienenwachs",
    "Linea Cosmetica al Veleno d’Api":"Kosmetiklinie mit Bienengift",
    "Pagamento":"Zahlung",
    "Spedizione":"Versand",
    "Totale da pagare":"Gesamtbetrag"
  },
  fr:{
    "Home":"Accueil",
    "Alveoterapia":"Alvéothérapie",
    "Alveoterapia Integrata":"Alvéothérapie Intégrée",
    "ALVEOTERAPIA INTEGRATA":"ALVÉOTHÉRAPIE INTÉGRÉE",
    "Chi siamo":"Qui sommes-nous",
    "Bacheca":"Actualités",
    "Contatti":"Contact",
    "Prodotti & Shop":"Produits & Boutique",
    "Parliamone":"Parlons-en",
    "Linea Veleni":"Ligne Venin d'Abeille",
    "LINEA VELENI":"LIGNE VENIN D'ABEILLE",
    "Il Centro":"Le Centre",
    "Galena delle Api":"Galena delle Api",
    "Oasi del Busatello":"Oasis du Busatello",
    "Primavera · Estate":"Printemps · Été",
    "Autunno · Inverno":"Automne · Hiver",
    "Carrello":"Panier",
    "Il tuo carrello":"Votre panier",
    "Selezione":"Sélection",
    "Tutte le linee":"Toutes les gammes",
    "Linea Alimenti":"Gamme Alimentaire",
    "Linea Integratori":"Gamme Compléments",
    "Linea Cosmesi e Tesori in Cera d’Api":"Cosmétiques & Trésors en Cire d'Abeille",
    "Linea Cosmetica al Veleno d’Api":"Gamme Cosmétique au Venin d'Abeille",
    "Pagamento":"Paiement",
    "Spedizione":"Livraison",
    "Totale da pagare":"Total à payer"
  },
  es:{
    "Home":"Inicio",
    "Alveoterapia":"Alveoterapia",
    "Alveoterapia Integrata":"Alveoterapia Integrada",
    "ALVEOTERAPIA INTEGRATA":"ALVEOTERAPIA INTEGRADA",
    "Chi siamo":"Quiénes somos",
    "Bacheca":"Novedades",
    "Contatti":"Contacto",
    "Prodotti & Shop":"Productos & Tienda",
    "Parliamone":"Hablemos",
    "Linea Veleni":"Línea Veneno de Abeja",
    "LINEA VELENI":"LÍNEA VENENO DE ABEJA",
    "Il Centro":"El Centro",
    "Galena delle Api":"Galena delle Api",
    "Oasi del Busatello":"Oasis del Busatello",
    "Primavera · Estate":"Primavera · Verano",
    "Autunno · Inverno":"Otoño · Invierno",
    "Carrello":"Carrito",
    "Il tuo carrello":"Tu carrito",
    "Selezione":"Selección",
    "Tutte le linee":"Todas las líneas",
    "Linea Alimenti":"Línea Alimentación",
    "Linea Integratori":"Línea Complementos",
    "Linea Cosmesi e Tesori in Cera d’Api":"Cosmética & Tesoros de Cera de Abeja",
    "Linea Cosmetica al Veleno d’Api":"Línea Cosmética con Veneno de Abeja",
    "Pagamento":"Pago",
    "Spedizione":"Envío",
    "Totale da pagare":"Total a pagar"
  }
};

const ATTRS=['title','aria-label','placeholder','alt'];

function cacheKeyFor(l){return 'fda-translation-cache-v2-'+l;}
function loadCache(l){
  try{return JSON.parse(localStorage.getItem(cacheKeyFor(l))||'{}')||{};}catch(_){return {};}
}
let cache={};
function saveCache(){
  if(lang==='it')return;
  try{localStorage.setItem(cacheKeyFor(lang),JSON.stringify(cache));}catch(_){}
}

function style(){
  if(document.getElementById('fda-language-style'))return;
  const s=document.createElement('style');
  s.id='fda-language-style';
  s.textContent='#fda-language-test{display:flex;align-items:center;gap:9px;color:#fff;font:800 12px/1.1 Arial,sans-serif;border:1px solid rgba(255,255,255,.32);border-radius:999px;padding:5px 6px 5px 10px;background:rgba(0,0,0,.18);white-space:nowrap}#fda-language-test span{font-weight:800}#fda-language-select{border:0;border-radius:999px;background:#f2b83f;color:#171717;padding:8px 10px;font-weight:900;outline:none;cursor:pointer}#fda-language-test.fallback{position:fixed;right:12px;top:12px;z-index:99999;box-shadow:0 5px 20px rgba(0,0,0,.3)}@media(max-width:900px){#fda-language-test{font-size:11px;padding-left:8px}#fda-language-test span{display:none}#fda-language-select{max-width:150px}}';
  document.head.appendChild(s);
}

function selector(){
  style();
  let box=document.getElementById('fda-language-test');
  if(!box){
    box=document.createElement('div');
    box.id='fda-language-test';
    const opts=SUPPORTED.map(v=>'<option value="'+v+'">'+NAMES[v]+'</option>').join('');
    box.innerHTML='<span>🌐 Lingua / Language</span><select id="fda-language-select" aria-label="Lingua / Language">'+opts+'</select>';
    const target=document.getElementById('center-home-bar')||document.querySelector('header nav')||document.querySelector('header .nav')||document.querySelector('header');
    if(target)target.appendChild(box);else{box.classList.add('fallback');document.body.appendChild(box);}
    box.querySelector('select').addEventListener('change',e=>setLang(e.target.value));
  }
  const sel=document.getElementById('fda-language-select');
  if(sel)sel.value=lang;
}

function cleanText(v){return String(v||'').replace(/\s+/g,' ').trim();}
function shouldTranslate(x){
  if(!x||x.length<2)return false;
  if(/^[-+€$£%\d\s.,:/()]+$/.test(x))return false;
  if(/^(APIS\d+|BIO|INCI|PDF|QR|URL)$/i.test(x))return false;
  if(/^https?:\/\//i.test(x))return false;
  return /[A-Za-zÀ-ÿ]/.test(x);
}

async function remoteTranslate(text){
  if(lang==='it')return text;
  const fixed=(CORE[lang]||{})[text];
  if(fixed)return fixed;
  if(cache[text])return cache[text];
  const k=lang+'\n'+text;
  if(pending.has(k))return pending.get(k);
  const job=(async()=>{
    try{
      const url='https://translate.googleapis.com/translate_a/single?client=gtx&sl=it&tl='+encodeURIComponent(lang)+'&dt=t&q='+encodeURIComponent(text);
      const res=await fetch(url,{method:'GET',credentials:'omit',referrerPolicy:'no-referrer'});
      if(!res.ok)throw new Error('translate '+res.status);
      const data=await res.json();
      const out=Array.isArray(data&&data[0])?data[0].map(x=>Array.isArray(x)?(x[0]||''):'').join(''):text;
      if(out&&out!==text){cache[text]=out;saveCache();return out;}
    }catch(_){}
    return text;
  })();
  pending.set(k,job);
  try{return await job;}finally{pending.delete(k);}
}

async function translateTextNode(node){
  if(lang==='it'||!node||node.nodeType!==3)return;
  const p=node.parentElement;
  if(!p||/^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA|OPTION)$/i.test(p.tagName))return;
  if(p.closest && p.closest('#apeChatPanel'))return;
  const raw=node.nodeValue||'', x=cleanText(raw);
  if(!shouldTranslate(x))return;
  if(!originals.has(node))originals.set(node,raw);
  const out=await remoteTranslate(x);
  if(lang==='it'||!out||out===x)return;
  const leading=(raw.match(/^\s*/)||[''])[0];
  const trailing=(raw.match(/\s*$/)||[''])[0];
  node.nodeValue=leading+out+trailing;
}

async function translateElementAttrs(el){
  if(lang==='it'||!el||el.nodeType!==1)return;
  if(el.closest && el.closest('#apeChatPanel'))return;
  let map=attrOriginals.get(el);
  if(!map){map={};attrOriginals.set(el,map);}
  for(const a of ATTRS){
    if(!el.hasAttribute(a))continue;
    const raw=el.getAttribute(a)||'', x=cleanText(raw);
    if(!shouldTranslate(x))continue;
    if(!(a in map))map[a]=raw;
    const out=await remoteTranslate(x);
    if(lang!=='it'&&out&&out!==x)el.setAttribute(a,out);
  }
}

function collect(root){
  const texts=[],els=[];
  if(!root)return {texts,els};
  if(root.nodeType===3)texts.push(root);
  if(root.nodeType===1)els.push(root);
  const w=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);
  let n;
  while((n=w.nextNode())){if(n.nodeType===3)texts.push(n);else els.push(n);}
  return {texts,els};
}

async function translateRoot(root){
  if(lang==='it'||translating)return;
  translating=true;
  try{
    const {texts,els}=collect(root||document.body);
    const queue=texts.filter(n=>shouldTranslate(cleanText(n.nodeValue||'')));
    for(const el of els)await translateElementAttrs(el);
    const workers=Array.from({length:5},async()=>{
      while(queue.length&&lang!=='it'){
        const n=queue.shift();
        await translateTextNode(n);
      }
    });
    await Promise.all(workers);
    if(document.title){
      const title=cleanText(document.title);
      const out=await remoteTranslate(title);
      if(lang!=='it'&&out)document.title=out;
    }
    document.documentElement.lang=lang;
  }finally{
    translating=false;
  }
}

function setLang(v){
  const next=SUPPORTED.includes(v)?v:'it';
  try{localStorage.setItem(KEY,next);}catch(_){}
  if(next===lang)return;
  lang=next;
  location.reload();
}

function startObserver(){
  if(observer)observer.disconnect();
  observer=new MutationObserver(ms=>{
    if(lang==='it'||translating)return;
    const roots=[];
    ms.forEach(m=>m.addedNodes&&m.addedNodes.forEach(n=>{
      if(n.nodeType===1||n.nodeType===3)roots.push(n.nodeType===3?n.parentNode:n);
    }));
    roots.forEach(r=>translateRoot(r));
  });
  observer.observe(document.body,{childList:true,subtree:true});
}

async function start(){
  let saved='';
  try{saved=localStorage.getItem(KEY)||'';}catch(_){}
  lang=SUPPORTED.includes(saved)?saved:'it';
  cache=loadCache(lang);
  selector();
  const sel=document.getElementById('fda-language-select');
  if(sel)sel.value=lang;
  if(lang!=='it')await translateRoot(document.body);
  else document.documentElement.lang='it';
  startObserver();
}

document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();