const fs = require('fs');
const path = require('path');
const express = require('express');
const createCheckoutSession = require('./api/create-checkout-session');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const IMAGE_VERSION = '20260827-10';

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
app.use('/images', express.static(path.join(__dirname, 'images'), { etag:true,lastModified:true,maxAge:0,setHeaders:(res)=>{res.setHeader('Cache-Control','no-cache, no-store, must-revalidate');res.setHeader('Pragma','no-cache');res.setHeader('Expires','0');} }));

const cacheBustScript = `<script>(()=>{const version=${JSON.stringify('20260827-10')};const addVersion=(img)=>{if(!img||!img.getAttribute)return;const raw=img.getAttribute('src');if(!raw||!/^(?:\\/?images\\/)/i.test(raw))return;try{const url=new URL(raw,window.location.href);if(url.searchParams.get('v')!==version){url.searchParams.set('v',version);img.src=url.pathname+url.search+url.hash;}}catch(_){}};const scan=(root)=>{if(!root)return;if(root.tagName==='IMG')addVersion(root);if(root.querySelectorAll)root.querySelectorAll('img[src]').forEach(addVersion);};const start=()=>{scan(document);const observer=new MutationObserver(ms=>{for(const m of ms){m.addedNodes.forEach(scan);if(m.type==='attributes'&&m.target.tagName==='IMG')addVersion(m.target);}});observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['src']});};document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();})();</script>`;

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
const enhanceShop=()=>{if(!document.getElementById('center-home-bar')){const bar=document.createElement('div');bar.id='center-home-bar';const link=document.createElement('a');link.id='center-home-link';link.href='/';link.textContent='← Home Centro';bar.appendChild(link);document.body.insertBefore(bar,document.body.firstElementChild);}const headings=Array.from(document.querySelectorAll('h1,h2,h3'));const title=headings.find(el=>(el.textContent||'').includes('La Fabbrica delle Api'));if(title){title.classList.add('shop-brand-title');if(title.parentElement)title.parentElement.classList.add('shop-brand-wrap');}const honeyHeading=headings.find(el=>(el.textContent||'').includes('La selezione di mieli della Fabbrica delle Api'));if(honeyHeading&&honeyHeading.parentElement)honeyHeading.parentElement.classList.add('honey-selection-card');filterVisibleHoneys();addSelectedHoneyDivider();addMissingHoneyCards();};
const start=()=>{enhanceShop();new MutationObserver(enhanceShop).observe(document.body,{childList:true,subtree:true});};document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();})();</script>`;

const sendShop = (_req,res)=>{try{const indexPath=path.join(__dirname,'index.html');let html=fs.readFileSync(indexPath,'utf8');html=html.replaceAll("L'Italiano",'La Fabbrica delle Api');html=html.replaceAll('I Mieli Artigianali',"Mieli e prodotti dell'alveare");html=html.replaceAll("category: 'prelibati'","category: 'busatello'");html=html.replaceAll('alt="I mieli del Busatello"','alt="La selezione di mieli della Fabbrica delle Api"');html=html.replaceAll('>I mieli del Busatello</h3>','>La selezione di mieli della Fabbrica delle Api</h3>');html=html.replace(/<a className="card" href="#" onClick=\{\(e\) => \{ e\.preventDefault\(\); onSelectCategory\('prelibati'\); \}\}>[\s\S]*?<h3 className="rose">I mieli prelibati<\/h3>\s*<\/a>/,'');html=html.replace(/^\s*\{\s*id:\s*["'][^"']*12["'][^\n]*jars:\s*12[^\n]*\},?\s*$/gm,'');
const honeyAvailabilityHelper=`
            const applyHoneyAvailability = (list) => {
                const busatelloOrder = ['millefiori','fragola','melone','pesca','arancia'];
                const selectedOrder = ['acacia','castagno','rucas','eucalipto','eucamiel','euca miel','propol miel','propolmiel','balsam miel','balsammiel'];
                const allowedHoneyTokens = [...busatelloOrder, ...selectedOrder];
                const normalize = (value) => String(value || '').normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').toLowerCase();
                const mapped = list.map((product, originalIndex) => {
                    const normalizedProduct = product.category === 'prelibati' ? { ...product, category: 'busatello' } : product;
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
const sendPage=(filename)=>(_req,res)=>{res.setHeader('Cache-Control','no-cache, no-store, must-revalidate');return res.sendFile(path.join(__dirname,filename));};
app.get('/',sendPage('home.html'));app.get('/home',sendPage('home.html'));app.get('/centro',sendPage('centro.html'));app.get('/alveoterapia',sendPage('alveoterapia.html'));app.get('/bacheca',sendPage('bacheca.html'));app.get('/chi-siamo',sendPage('chi-siamo.html'));app.get('/contatti',sendPage('contatti.html'));app.get('/shop',sendShop);app.get('/shop.html',sendShop);app.get('/index.html',sendShop);app.use(express.static(__dirname));app.listen(PORT,'0.0.0.0',()=>console.log(`[Miele Artigianale] Server avviato sulla porta ${PORT}.`));
