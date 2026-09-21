(function(){
'use strict';

const KEY='fda-site-language';
const IT='it', EN='en';
let lang=IT;
let translating=false;
const cacheKey='fda-en-translation-cache-v1';
let cache={};
try{cache=JSON.parse(localStorage.getItem(cacheKey)||'{}')||{};}catch(_){cache={};}

const STATIC={
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
"Scopri la Linea Veleni":"Discover the Bee Venom Line",
"Vai alla Linea Veleni nello Shop →":"Go to the Bee Venom Line in the Shop →",
"Il Centro":"The Centre",
"Galena delle Api":"Galena delle Api",
"Oasi del Busatello":"Busatello Oasis",
"Primavera · Estate":"Spring · Summer",
"Autunno · Inverno":"Autumn · Winter",
"L’esperienza dell’alveare durante tutto l’anno.":"The beehive experience, all year round.",
"L'esperienza dell'alveare durante tutto l'anno.":"The beehive experience, all year round.",
"Due stagioni, due ambienti, un unico percorso per avvicinarsi all’atmosfera, ai profumi, ai suoni e all’universo dell’alveare.":"Two seasons, two settings, one journey into the atmosphere, scents, sounds and world of the beehive.",
"Alveoterapia tutto l’anno":"Alveotherapy all year round",
"L’esperienza continua.":"The experience continues.",
"Dentro il paesaggio dell’alveare":"Inside the beehive landscape",
"Il calore dell’alveare, al coperto":"The warmth of the beehive, indoors",
"Scopri l’esperienza all’aperto →":"Discover the outdoor experience →",
"Entra nella Galena delle Api →":"Enter the Galena delle Api →",
"Cos’è l’Alveoterapia":"What is Alveotherapy",
"Un incontro sensoriale con il mondo delle api.":"A sensory encounter with the world of bees.",
"Il luogo naturale":"The natural setting",
"Il luogo accogliente":"The welcoming setting",
"Conosci l’esperienza del Busatello →":"Discover the Busatello experience →",
"Scopri la Galena delle Api →":"Discover the Galena delle Api →",
"Come si svolge":"How it works",
"Un’esperienza semplice, guidata e consapevole.":"A simple, guided and mindful experience.",
"Accoglienza":"Welcome",
"Avvicinamento":"Getting closer",
"Esperienza":"Experience",
"Scoperta":"Discovery",
"Il mondo delle api":"The world of bees",
"Piccole protagoniste di un universo immenso.":"Small protagonists of an immense world.",
"Conoscere per rispettare":"Learn to respect",
"Dall’alveare alla tavola":"From the beehive to the table",
"Perché proprio il veleno d’api?":"Why bee venom?",
"Non una promessa di cura.":"Not a promise of treatment.",
"Un modo diverso di scoprire il carattere dell’alveare.":"A different way to discover the character of the beehive.",
"Il massaggio diventa un momento di comfort.":"Massage becomes a moment of comfort.",
"Il suo valore":"Its value",
"Cosa lo distingue":"What makes it different",
"Il momento giusto":"The right moment",
"Avvertenze del produttore":"Manufacturer warnings",
"Dall’esperienza ai prodotti":"From the experience to the products",
"Quello che conosci nell’alveare, puoi continuare a scoprirlo anche a casa.":"What you discover in the beehive can continue with you at home.",
"Mieli del Busatello":"Busatello Honeys",
"Polline e Pane delle Api":"Pollen and Bee Bread",
"Propoli e mondo dell’alveare":"Propolis and the beehive world",
"Entra nello Shop con un’altra prospettiva →":"Enter the Shop with a different perspective →",
"Richiedi informazioni":"Request information",
"Quale stagione vuoi vivere?":"Which season would you like to experience?",
"L'alveare si vive nella natura.":"Experience the beehive in nature.",
"Il luogo naturale":"The natural setting",
"Qui non si entra in una sala: si entra in un ambiente vivo. Il verde, l'acqua, i suoni e la presenza delle api diventano parte dell'esperienza.":"You do not enter a room here: you enter a living environment. Greenery, water, sounds and the presence of bees all become part of the experience.",
"Vicino alle arnie vere":"Close to real beehives",
"Il paesaggio non è lo sfondo dell'esperienza. È una parte dell'esperienza.":"The landscape is not the backdrop to the experience. It is part of the experience.",
"Cosa rende diversa questa esperienza":"What makes this experience different",
"La stagione cambia tutto.":"The season changes everything.",
"Arnie vere":"Real beehives",
"Natura intorno":"Nature all around",
"Stagioni e fioriture":"Seasons and blossoms",
"Alveoterapia Integrata tutto l'anno":"Integrated Alveotherapy all year round",
"Quando arriva il freddo, l'esperienza non finisce.":"When the cold season arrives, the experience does not end.",
"Entra nella Galena delle Api →":"Enter the Galena delle Api →",
"Dal luogo ai prodotti":"From the place to the products",
"I Mieli del Busatello raccontano anche questo paesaggio.":"Busatello Honeys also tell the story of this landscape.",
"Continua nello Shop →":"Continue in the Shop →",
"Il mondo dell'alveare continua anche al coperto.":"The world of the beehive continues indoors.",
"Un luogo che invita a fermarsi.":"A place that invites you to slow down.",
"Entrare in un'atmosfera diversa":"Step into a different atmosphere",
"L'alveare cambia con le stagioni. L'esperienza continua.":"The beehive changes with the seasons. The experience continues.",
"Come si vive":"How it feels",
"Più esperienza, meno tecnica.":"More experience, less technical detail.",
"Atmosfera":"Atmosphere",
"Continuità stagionale":"Seasonal continuity",
"I diffusori fanno parte dell'esperienza, non sono il racconto.":"The diffusers are part of the experience, not the story itself.",
"Un unico percorso":"One continuous journey",
"Dalla natura alla Galena, senza interrompere il filo.":"From nature to the Galena, without breaking the thread.",
"La scoperta continua":"The discovery continues",
"Dall'esperienza ai prodotti dell'alveare.":"From the experience to beehive products.",
"Le linee della Fabbrica delle Api":"La Fabbrica delle Api collections",
"Tutte le linee":"All collections",
"Carrello":"Cart",
"Il tuo carrello":"Your cart",
"← Torna alle Categorie":"← Back to Categories",
"← Torna alle linee":"← Back to collections",
"Selezione":"Selection",
"Scegli il formato:":"Choose size:",
"➕ Aggiungi al carrello":"➕ Add to cart",
"Non Disponibile":"Unavailable",
"Esaurito / Stock Insuff.":"Sold out / Insufficient stock",
"Consegna prevista entro 5–6 giorni • Spedizione gratuita per ordini da €200 in su":"Estimated delivery within 5–6 days • Free shipping on orders over €200",
"Spedizione gratuita":"Free shipping",
"Consegna locale":"Local delivery",
"Corriere":"Courier",
"Linea Alimenti":"Food Collection",
"Linea Integratori":"Supplements Collection",
"Linea Cosmesi e Tesori in Cera d’Api":"Cosmetics & Beeswax Treasures",
"I Tesori di Francesco":"Francesco's Treasures",
"I Tris dell’Alveare":"Beehive Trios",
"Linea Cosmetica al Veleno d’Api":"Bee Venom Cosmetic Line",
"ALVEO DIGITALE":"ALVEO DIGITAL",
"Ricette, video e idee regalo da usare subito":"Recipes, videos and gift ideas ready to use",
"Scopri Alveo Digitale":"Discover Alveo Digital",
"Ricette, video e regali digitali":"Recipes, videos and digital gifts",
"Ricetta digitale":"Digital recipe",
"10 Colazioni dell’Alveare":"10 Beehive Breakfasts",
"👁 Sfoglia anteprima":"👁 Browse preview",
"Acquista PDF":"Buy PDF",
"Video narrato":"Narrated video",
"Guarda esempio":"Watch example",
"Regalo digitale":"Digital gift",
"Come funziona":"How it works",
"1. Scegli":"1. Choose",
"2. Acquista":"2. Buy",
"3. Apri subito":"3. Open instantly",
"Prodotto digitale · nessuna spedizione":"Digital product · no shipping",
"NOVITÀ ASSOLUTA!":"BRAND NEW!",
"Avvertenze:":"Warnings:",
"Solo per uso cosmetico esterno.":"For external cosmetic use only.",
"Privacy Policy":"Privacy Policy",
"Condizioni di vendita":"Terms of sale",
"Resi e recesso":"Returns and withdrawal",
"Venditore":"Seller",
"Pagamento":"Payment",
"Spedizione":"Shipping",
"Totale da pagare":"Total to pay",
"← Torna al negozio":"← Back to shop",
"Nome e cognome *":"Full name *",
"Telefono *":"Phone *",
"Via e numero civico *":"Street and number *",
"CAP *":"Postcode *",
"Comune / Città *":"Town / City *",
"Provincia (es. MN) *":"Province (e.g. MN) *",
"Paese":"Country",
"Note per la consegna (facoltative)":"Delivery notes (optional)",
"Pagamento Completato!":"Payment completed!",
"Grazie per il tuo ordine!":"Thank you for your order!",
"Torna al Negozio":"Back to Shop",
"Pagamento Annullato":"Payment cancelled",
"Informazioni":"Information",
"Invia un messaggio":"Send a message",
"Invia messaggio":"Send message",
"Email":"Email",
"Telefono":"Phone",
"Dove siamo":"Where we are"
};

const ATTRS=['title','aria-label','placeholder','alt'];
const originals=new WeakMap();
const attrOriginals=new WeakMap();
const pending=new Map();
let observer=null;

function style(){
 if(document.getElementById('fda-language-style'))return;
 const s=document.createElement('style');s.id='fda-language-style';
 s.textContent='#fda-language-test{display:flex;align-items:center;gap:9px;color:#fff;font:800 12px/1.1 Arial,sans-serif;border:1px solid rgba(255,255,255,.32);border-radius:999px;padding:5px 6px 5px 10px;background:rgba(0,0,0,.18);white-space:nowrap}#fda-language-test span{font-weight:800}#fda-language-select{border:0;border-radius:999px;background:#f2b83f;color:#171717;padding:8px 10px;font-weight:900;outline:none;cursor:pointer}#fda-language-test.fallback{position:fixed;right:12px;top:12px;z-index:99999;box-shadow:0 5px 20px rgba(0,0,0,.3)}@media(max-width:900px){#fda-language-test{font-size:11px;padding-left:8px}#fda-language-test span{display:none}}';
 document.head.appendChild(s);
}

function selector(){
 style();
 let box=document.getElementById('fda-language-test');
 if(!box){
   box=document.createElement('div');
   box.id='fda-language-test';
   box.innerHTML='<span>🌐 Lingua / Language</span><select id="fda-language-select" aria-label="Lingua / Language"><option value="it">🇮🇹 Italiano</option><option value="en">🇬🇧 English</option></select>';
   const target=document.getElementById('center-home-bar')||document.querySelector('header nav')||document.querySelector('header .nav')||document.querySelector('header');
   if(target)target.appendChild(box);else{box.classList.add('fallback');document.body.appendChild(box);}
   box.querySelector('select').addEventListener('change',e=>setLang(e.target.value));
 }
 const sel=document.getElementById('fda-language-select');if(sel)sel.value=lang;
}

function cleanText(v){return String(v||'').replace(/\s+/g,' ').trim();}
function shouldTranslate(x){
 if(!x||x.length<2)return false;
 if(/^[-+€$£%\d\s.,:/()]+$/.test(x))return false;
 if(/^(APIS\d+|BIO|INCI|PDF|QR|URL)$/i.test(x))return false;
 if(/^https?:\/\//i.test(x))return false;
 return /[A-Za-zÀ-ÿ]/.test(x);
}
function cacheSave(){try{localStorage.setItem(cacheKey,JSON.stringify(cache));}catch(_){}}

async function remoteTranslate(text){
 if(STATIC[text])return STATIC[text];
 if(cache[text])return cache[text];
 if(pending.has(text))return pending.get(text);
 const job=(async()=>{
   try{
     const url='https://translate.googleapis.com/translate_a/single?client=gtx&sl=it&tl=en&dt=t&q='+encodeURIComponent(text);
     const res=await fetch(url,{method:'GET',credentials:'omit',referrerPolicy:'no-referrer'});
     if(!res.ok)throw new Error('translate '+res.status);
     const data=await res.json();
     const out=Array.isArray(data&&data[0])?data[0].map(x=>Array.isArray(x)?(x[0]||''):'').join(''):text;
     if(out&&out!==text){cache[text]=out;cacheSave();return out;}
   }catch(_){}
   return text;
 })();
 pending.set(text,job);
 try{return await job;}finally{pending.delete(text);}
}

function setOriginal(node,val){
 if(!originals.has(node))originals.set(node,val);
}
async function translateTextNode(node){
 if(lang!==EN||!node||node.nodeType!==3)return;
 const p=node.parentElement;
 if(!p||/^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA|OPTION)$/i.test(p.tagName))return;
 const raw=node.nodeValue||'', x=cleanText(raw);
 if(!shouldTranslate(x))return;
 setOriginal(node,raw);
 const out=STATIC[x]||await remoteTranslate(x);
 if(lang!==EN||!out||out===x)return;
 const leading=raw.match(/^\s*/)?.[0]||'';
 const trailing=raw.match(/\s*$/)?.[0]||'';
 node.nodeValue=leading+out+trailing;
}
async function translateElementAttrs(el){
 if(lang!==EN||!el||el.nodeType!==1)return;
 let map=attrOriginals.get(el);
 if(!map){map={};attrOriginals.set(el,map);}
 for(const a of ATTRS){
   if(!el.hasAttribute(a))continue;
   const raw=el.getAttribute(a)||'', x=cleanText(raw);
   if(!shouldTranslate(x))continue;
   if(!(a in map))map[a]=raw;
   const out=STATIC[x]||await remoteTranslate(x);
   if(lang===EN&&out&&out!==x)el.setAttribute(a,out);
 }
}

function collect(root){
 const texts=[], els=[];
 if(!root)return {texts,els};
 if(root.nodeType===3)texts.push(root);
 if(root.nodeType===1)els.push(root);
 const w=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);
 let n; while((n=w.nextNode())){if(n.nodeType===3)texts.push(n);else els.push(n);}
 return {texts,els};
}

async function translateRoot(root){
 if(lang!==EN||translating)return;
 translating=true;
 try{
   const {texts,els}=collect(root||document.body);
   const immediate=[];
   const deferred=[];
   texts.forEach(n=>{
     const x=cleanText(n.nodeValue||'');
     if(!shouldTranslate(x))return;
     if(STATIC[x]||cache[x])immediate.push(n); else deferred.push(n);
   });
   for(const n of immediate)await translateTextNode(n);
   for(const el of els)await translateElementAttrs(el);
   const workers=Array.from({length:4},async()=>{
     while(deferred.length&&lang===EN){
       const n=deferred.shift();
       await translateTextNode(n);
     }
   });
   await Promise.all(workers);
   if(document.title){
     const t=cleanText(document.title);
     const out=STATIC[t]||cache[t]||await remoteTranslate(t);
     if(lang===EN&&out)document.title=out;
   }
   document.documentElement.lang='en';
 }finally{translating=false;}
}

function setLang(v){
 const next=v===EN?EN:IT;
 try{localStorage.setItem(KEY,next);}catch(_){}
 if(next===lang)return;
 lang=next;
 location.reload();
}

function startObserver(){
 if(observer)observer.disconnect();
 observer=new MutationObserver(ms=>{
   if(lang!==EN||translating)return;
   const roots=[];
   ms.forEach(m=>m.addedNodes&&m.addedNodes.forEach(n=>{if(n.nodeType===1||n.nodeType===3)roots.push(n.nodeType===3?n.parentNode:n);}));
   roots.forEach(r=>translateRoot(r));
 });
 observer.observe(document.body,{childList:true,subtree:true});
}

async function start(){
 let s='';
 try{s=localStorage.getItem(KEY)||'';}catch(_){}
 lang=(s===EN)?EN:IT;
 selector();
 const sel=document.getElementById('fda-language-select');if(sel)sel.value=lang;
 if(lang===EN)await translateRoot(document.body);
 else document.documentElement.lang='it';
 startObserver();
}

document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();