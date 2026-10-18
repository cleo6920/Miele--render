const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const root = __dirname;
const dist = path.join(root, 'dist');

const VELENI_PUBLIC = false; // Product sales remain disabled.
const VELENI_INFORMATION = `<section id="conoscere-veleni" aria-labelledby="veleni-info-title" style="padding:64px 24px;background:#fffaf1;color:#173329;scroll-margin-top:120px">
<div style="max-width:1000px;margin:auto"><span id="linea-veleni"></span><span id="veleni-prodotti"></span>
<p style="font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#956817">Conoscere il mondo dell’alveare</p>
<h2 id="veleni-info-title" style="font-family:Georgia,serif;font-size:clamp(32px,5vw,54px);line-height:1.1">Linea Veleni d’Api · Conoscere prima di scegliere</h2>
<p style="font-size:19px;line-height:1.7">Un elemento sorprendente dell’alveare, un percorso da approfondire insieme. Questa sezione è dedicata alla conoscenza della Linea Veleni d’Api e al dialogo con chi desidera saperne di più.</p>
<h3>Una storia che parte dalle api</h3>
<p style="font-size:17px;line-height:1.7">Il veleno d’api appartiene al sistema naturale di difesa dell’ape. La Linea Veleni d’Api ci offre l’occasione di raccontare questo aspetto dell’alveare e il suo impiego nel mondo della cosmesi e del massaggio.</p>
<h3>Ne parliamo insieme?</h3>
<p style="font-size:17px;line-height:1.7">Vuoi conoscere meglio la linea, la sua filosofia e gli ambiti cosmetici a cui si rivolge? Contattaci: ti accompagneremo con informazioni e chiarimenti dedicati.</p>
<div style="display:flex;flex-wrap:wrap;gap:12px;margin:24px 0">
<a href="tel:+393348476020" style="padding:14px 20px;border-radius:28px;background:#173329;color:white;font-weight:800">Chiama · 334 847 6020</a>
<a href="https://wa.me/393348476020?text=Buongiorno%2C%20vorrei%20maggiori%20informazioni%20sulla%20Linea%20Veleni%20d%27Api." target="_blank" rel="noopener" style="padding:14px 20px;border-radius:28px;background:#173329;color:white;font-weight:800">Scrivici su WhatsApp</a>
<a href="mailto:althea12830@gmail.com?subject=Informazioni%20Linea%20Veleni%20d%27Api" style="padding:14px 20px;border-radius:28px;background:#dda52e;color:#173329;font-weight:800">Richiedi informazioni via email</a>
</div><p style="font-size:14px;color:#596b61">Un percorso informativo dedicato alla cosmesi e al massaggio, senza promesse di cura.</p></div></section>`;

function hideVeleniFromPublicHtml(html) {
  if (VELENI_PUBLIC || !html) return html;
  // Replace commercial presentations with an information and contact section.
  html = html.replace(/<section class="venom" id="veleni">[\s\S]*?<\/section>/gi, block => {
    const intro = block.split('<div class="venom-launch">')[0];
    return intro.replace('Sei prodotti, sei esperienze diverse:', 'Un percorso da approfondire insieme:') + '<div class="venom-launch"><a class="btn btn-gold" href="/shop#conoscere-veleni">Scopri la Linea Veleni</a></div></div></section>';
  });
  const catalogMatch = html.match(/const SHOP_OFFICIAL_PRODUCTS=(\[[\s\S]*?\]);/);
  let information = VELENI_INFORMATION;
  if (catalogMatch) {
    const products = JSON.parse(catalogMatch[1]).filter(p => p.section === 'linea-veleni');
    const cards = products.map(p => {
      const question = 'Buongiorno, vorrei maggiori informazioni su ' + p.name + ' (' + p.size + ') della Linea Veleni d’Api.';
      return '<article class="catalog-card product-openable" id="informazioni-' + escHtml(p.id) + '" data-product-id="' + escHtml(p.id) + '" tabindex="0" role="button" aria-label="Scopri di più: ' + escHtml(p.name) + '"><div class="catalog-card-media"><img src="' + escHtml(p.image) + '" alt="' + escHtml(p.name) + '" loading="lazy"></div><div class="catalog-card-body"><small>Linea Veleni d’Api · Informazioni</small><h3>' + escHtml(p.name) + '</h3><p><strong>' + escHtml(p.size) + '</strong></p><p>' + escHtml(p.desc) + '</p><button class="product-detail-link" type="button" data-open-product="' + escHtml(p.id) + '">Scopri di più →</button></div></article>';
    }).join('');
    information = information.replace('</h2>', '</h2><p>Scopri ogni proposta della linea e contattaci per informazioni dedicate.</p><div class="catalog-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:22px;margin:28px 0 44px">' + cards + '</div>');
  }
  html = html.replace(/<section class="catalog-world venom-world" id="linea-veleni">[\s\S]*?<\/section>/gi, information);
  html = html.replace(/<article class="quick-card">[\s\S]*?<\/article>/gi, block => /Linea Veleni|Bee Venom|Bienengift|Venin d['’]Abeille|Veneno de Abeja/i.test(block) ? '<article class="quick-card"><small>Conoscere l’alveare</small><h3>Linea Veleni d’Api</h3><p>Un percorso di conoscenza da approfondire insieme.</p><a href="#conoscere-veleni">Scopri e chiedi informazioni →</a></article>' : block);
  html = html.replace(/<section class="feature-story">[\s\S]*?<\/section>/gi, block => /Linea Veleni|Bee Venom|Bienengift|Venin d['’]Abeille|Veneno de Abeja/i.test(block) ? block.replace('puoi passare direttamente alla scelta del prodotto legato a quel momento.', 'puoi approfondire la linea e richiedere informazioni dedicate.').replace('Scopri e scegli nella Linea Veleni →', 'Scopri la Linea Veleni →').replaceAll('href="#veleni-prodotti"', 'href="#conoscere-veleni"').replace('/images/veleno-apis1-hd.svg', '/images/alveari-busatello.jpg') : block);
  html = html.replace(/<button\b[^>]*data-ape-q=["'][^"']*(?:Linea Veleni|Bee Venom|Bienengift|Venin|Veneno)[^"']*["'][^>]*>[\s\S]*?<\/button>/gi, '');
  html = html.replace(/<a\b[^>]*href=["'][^"']*(?:#linea-veleni|#veleni-prodotti|#veleni|linea=veleni|#prodotto-(?:unguento-apis|sos-dol-50ml|apis1-crema-viso-veleno-api|apis2-siero-viso-veleno-api|apis4-crema-corpo-veleno-api-manuka|apis5-gommage-veleno-api-manuka|bagnodoccia-veleno-oro))[^"']*["'][^>]*>[\s\S]*?<\/a>/gi, '');
  html = html.replace(/<a\b[^>]*>\s*Linea Veleni\s*<\/a>/gi, '');
  if (html.includes('id="conoscere-veleni"')) {
    html = html.replace(/(<div class="nav-links">[\s\S]*?)(<\/div>)/i, '$1<a href="#conoscere-veleni">Linea Veleni · Informazioni</a>$2');
  }
  return html;
}



// Prezzi e pulsanti di acquisto Apinfiore vengono eliminati anche dall'HTML
// prerenderizzato, prima che JavaScript inizializzi il catalogo.
const APINFIORE_INFO_CARD_IDS=["castagno","acacia-zenzero-apinfiore","miele-eucalipto-apinfiore","balsammiel","acacia","favo-integrale-bio","polline-italiano","pappa-reale-italiana-bio","propoli-30-spray-integratore","propoli-30-alcolica-integratore","propoli-analcolica-integratore","cosmesi-crema-mani","cosmesi-burrocacao-propoli-aloe","cosmesi-burrocacao-miele-pappa-reale","cosmesi-shampoo-multivitaminico","cosmesi-saponetta-frutti-bosco","cosmesi-saponetta-lavanda","cosmesi-saponetta-aloe-vera","cosmesi-candela-alveare-cera-api","cosmesi-travel-kit-benessere"];
function hideApinfioreFromPublicCards(html) {
  for (const id of APINFIORE_INFO_CARD_IDS) {
    const re=new RegExp('(<article\\b[^>]*\\bid="prodotto-'+id+'"[^>]*>)([\\s\\S]*?)(<\\/article>)','g');
    let changed=0;
    html=html.replace(re,(full,open,body,close)=>{
      const next=body.replace(/<div class="catalog-buy-row">[\s\S]*?<\/button><\/div>/,
        '<div class="catalog-buy-row"><button class="product-detail-link" type="button" data-open-product="'+id+'">Richiedi informazioni →</button></div>')
        .replace(/<div class="catalog-points">[\s\S]*?<\/div>/,'');
      if(next===body || next.includes('data-price='))throw new Error('[Cloudflare V2] Scheda Apinfiore non protetta: '+id);
      changed++;
      return open+next+close;
    });
    if(changed!==1)throw new Error('[Cloudflare V2] Scheda Apinfiore mancante o duplicata: '+id+' ('+changed+')');
  }
  return html;
}

const GA_MEASUREMENT_ID = 'G-V6HRR5LSL9';
const GA_TAG = `
<!-- Google tag (gtag.js) · La Fabbrica delle Api -->
<style>
  #fda-consent{position:fixed;left:18px;right:18px;bottom:18px;z-index:2147483000;display:none;max-width:760px;margin:auto;background:#fffaf1;color:#173329;border:1px solid #d8c79b;border-radius:18px;box-shadow:0 18px 55px rgba(0,0,0,.28);padding:18px;font-family:Arial,Helvetica,sans-serif}
  #fda-consent strong{display:block;font-size:18px;margin-bottom:6px}
  #fda-consent p{margin:0 0 12px;line-height:1.45;font-size:14px}
  #fda-consent .fda-consent-actions{display:flex;gap:8px;flex-wrap:wrap}
  #fda-consent button{border:0;border-radius:999px;padding:10px 14px;font-weight:800;cursor:pointer}
  #fda-consent-accept{background:#0b3025;color:#fff}
  #fda-consent-reject{background:#eee6d8;color:#173329}
  #fda-consent a{color:#8a6116;font-weight:700}
  #fda-consent-settings{position:fixed;left:14px;bottom:14px;z-index:2147482999;border:1px solid #d8c79b;background:#fffaf1;color:#173329;border-radius:999px;padding:8px 11px;font:700 12px Arial,Helvetica,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.18);cursor:pointer;display:none}
</style>
<script>
(function(){
  var KEY='fda-google-consent-v1';
  var saved=null;
  try{saved=localStorage.getItem(KEY);}catch(_){}
  window.dataLayer=window.dataLayer||[];
  window.gtag=window.gtag||function(){dataLayer.push(arguments);};
  function state(value){
    var granted=value==='all';
    return {
      ad_storage: granted?'granted':'denied',
      analytics_storage: granted?'granted':'denied',
      ad_user_data: granted?'granted':'denied',
      ad_personalization: granted?'granted':'denied'
    };
  }
  gtag('consent','default',Object.assign(state(saved),{wait_for_update:500}));
  gtag('js',new Date());
  gtag('config','${GA_MEASUREMENT_ID}');
  function apply(value){
    try{localStorage.setItem(KEY,value);}catch(_){}
    gtag('consent','update',state(value));
    var box=document.getElementById('fda-consent');
    var settings=document.getElementById('fda-consent-settings');
    if(box)box.style.display='none';
    if(settings)settings.style.display='block';
  }
  document.addEventListener('DOMContentLoaded',function(){
    var box=document.createElement('div');
    box.id='fda-consent';
    box.innerHTML='<strong>Privacy e misurazione</strong><p>Usiamo strumenti di misurazione Google Analytics e, se acconsenti, dati utili anche a misurare le campagne pubblicitarie. Puoi scegliere solo i cookie necessari oppure accettare tutti. <a href="/privacy.html">Privacy</a></p><div class="fda-consent-actions"><button id="fda-consent-accept" type="button">Accetta tutti</button><button id="fda-consent-reject" type="button">Solo necessari</button></div>';
    document.body.appendChild(box);
    var settings=document.createElement('button');
    settings.id='fda-consent-settings';
    settings.type='button';
    settings.textContent='Cookie';
    document.body.appendChild(settings);
    box.querySelector('#fda-consent-accept').onclick=function(){apply('all');};
    box.querySelector('#fda-consent-reject').onclick=function(){apply('necessary');};
    settings.onclick=function(){box.style.display='block';settings.style.display='none';};
    if(saved==='all'||saved==='necessary')settings.style.display='block';
    else box.style.display='block';
  });
})();
</script>
<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"></script>
`;
function injectGoogleAnalytics(html) {
  if (!html || html.includes(GA_MEASUREMENT_ID)) return html;
  if (!/<\/head>/i.test(html)) return html;
  return html.replace(/<\/head>/i, GA_TAG + '\n</head>');
}


function injectBrandSeo(html, pathname) {
  if (!html || (pathname !== '/' && pathname !== '/home')) return html;

  const title = "La Fabbrica delle Api | Alveoterapia Integrata a Castel d’Ario";
  const description = "La Fabbrica delle Api a Castel d’Ario (MN): Alveoterapia Integrata, La Galena delle Api, Oasi del Busatello e prodotti dell’alveare.";
  const canonical = "https://lafabbricadelleapi.it/";

  if (/<title>[\s\S]*?<\/title>/i.test(html)) {
    html = html.replace(/<title>[\s\S]*?<\/title>/i, '<title>' + title + '</title>');
  } else {
    html = html.replace(/<\/head>/i, '<title>' + title + '</title>\n</head>');
  }

  if (/<meta\s+name=["']description["'][^>]*>/i.test(html)) {
    html = html.replace(/<meta\s+name=["']description["'][^>]*>/i, '<meta name="description" content="' + description + '">');
  } else {
    html = html.replace(/<\/head>/i, '<meta name="description" content="' + description + '">\n</head>');
  }

  if (/<link\s+rel=["']canonical["'][^>]*>/i.test(html)) {
    html = html.replace(/<link\s+rel=["']canonical["'][^>]*>/i, '<link rel="canonical" href="' + canonical + '">');
  } else {
    html = html.replace(/<\/head>/i, '<link rel="canonical" href="' + canonical + '">\n</head>');
  }

  html = html.replace(
    /("@type"\s*:\s*"Organization"\s*,)(?!\s*"logo")/g,
    '$1"logo":"https://lafabbricadelleapi.it/favicon.svg",'
  );

  if (!/"@type"\s*:\s*"Organization"/.test(html)) {
    const orgSchema = '<script type="application/ld+json">' + JSON.stringify({
      "@context":"https://schema.org",
      "@type":"Organization",
      "name":"La Fabbrica delle Api",
      "url":"https://lafabbricadelleapi.it/",
      "logo":"https://lafabbricadelleapi.it/favicon.svg"
    }) + '</script>';
    html = html.replace(/<\/head>/i, orgSchema + '\n</head>');
  }

  return html;
}

function injectGoogleAnalyticsIntoDist(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      injectGoogleAnalyticsIntoDist(full);
      continue;
    }
    if (!entry.isFile() || path.extname(entry.name).toLowerCase() !== '.html') continue;
    const html = fs.readFileSync(full, 'utf8');
    const next = injectGoogleAnalytics(html);
    if (next !== html) fs.writeFileSync(full, next, 'utf8');
  }
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

function copyFileIfPresent(file) {
  const src = path.join(root, file);
  if (!fs.existsSync(src)) return;
  const dest = path.join(dist, file);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function copyBrowserAssets() {
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const ext = path.extname(entry.name).toLowerCase();
    if (['.html', '.css', '.svg', '.ico', '.txt', '.xml', '.tsv', '.webmanifest'].includes(ext)) {
      copyFileIfPresent(entry.name);
    }
  }

  const browserScripts = [
    'global-tools-v2.js',
    'shop-purchase-i18n.js',
    'render-language-de-test.js',
    'saldo-api.js',
    'cesto-admin.js',
    'cloudflare-v2-fixes.js',
    'shop-interactions-fix.js'
  ];
  for (const file of browserScripts) {
    if (!fs.existsSync(path.join(root, file))) {
      throw new Error('[Cloudflare V2] Browser asset mancante: ' + file);
    }
    copyFileIfPresent(file);
  }

  copyDir(path.join(root, 'images'), path.join(dist, 'images'));
  copyDir(path.join(root, 'downloads'), path.join(dist, 'downloads'));
}


function escHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}

function hydrateOfficialCatalog(html) {
  const match = html.match(/const SHOP_OFFICIAL_PRODUCTS=(\[[\s\S]*?\]);/);
  if (!match) throw new Error('[Cloudflare V2] Catalogo ufficiale non trovato nello shop.');
  let products;
  try { products = JSON.parse(match[1]); }
  catch (error) { throw new Error('[Cloudflare V2] Catalogo ufficiale non leggibile: ' + error.message); }

  const sections = ['alveoterapia-prodotti','alveare','propoli','cosmesi','linea-veleni','tesori-francesco','alveo-digitale'];
  const category = {
    'alveoterapia-prodotti':'Alveoterapia',
    'alveare':'Linea Alimenti',
    'propoli':'Linea Integratori',
    'cosmesi':'Cosmesi e Cera d’Api',
    'linea-veleni':'Linea Cosmetica al Veleno d’Api',
    'tesori-francesco':'I Tesori di Francesco',
    'alveo-digitale':'Alveo Digitale'
  };
  const points = {
    'propolterapy-professional':15,'capsule-pb':5,'capsule-propolit':5,'castagno':2,'acacia-zenzero-apinfiore':3,
    'miele-eucalipto-apinfiore':2,'balsammiel':4,'acacia':1,'favo-integrale-bio':4,'polline-italiano':4,
    'pappa-reale-italiana-bio':2,'orsetti-gommosi':1,'bee-energy-bio':4,'propol-active-bio':4,
    'propoli-30-spray-integratore':3,'propoli-30-alcolica-integratore':2,'propoli-analcolica-integratore':2,
    'cosmesi-crema-mani':3,'cosmesi-burrocacao-propoli-aloe':2,'cosmesi-burrocacao-miele-pappa-reale':2,
    'cosmesi-shampoo-multivitaminico':3,'cosmesi-saponetta-frutti-bosco':1,'cosmesi-saponetta-lavanda':1,
    'cosmesi-saponetta-aloe-vera':1,'cosmesi-candela-alveare-cera-api':2,'cosmesi-travel-kit-benessere':5,
    'unguento-apis':10,'sos-dol-50ml':10,'apis1-crema-viso-veleno-api':9,'apis2-siero-viso-veleno-api':9,
    'apis4-crema-corpo-veleno-api-manuka':9,'apis5-gommage-veleno-api-manuka':9,'bagnodoccia-veleno-oro':6,
    'tesori-limoncello':2,'tesori-liquore-caffe':2,'tesori-castagne-rum':2,'alveo-digitale-10-colazioni':2,
    'alveo-digitale-api-oggi-01':0
  };

  for (const section of sections) {
    const items = products.filter(p => p.section === section);
    if (!items.length) throw new Error('[Cloudflare V2] Nessun prodotto nella sezione ' + section);
    const cards = items.map(p => {
      const free = p.id === 'alveo-digitale-api-oggi-01';
      const price = free ? 'GRATIS' : new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR'}).format(Number(p.price||0));
      const pts = free ? '🐝 +1 Punto Ape al download' : '🐝 +' + Number(points[p.id]||0) + ' Punti Ape';
      return '<article class="catalog-card product-openable'+(free?' free-open-card':'')+'" id="prodotto-'+escHtml(p.id)+'" data-product-id="'+escHtml(p.id)+'" tabindex="0" role="button" aria-label="Apri la scheda completa di '+escHtml(p.name)+'">'+
        '<div class="catalog-card-media"><img src="'+escHtml(p.image)+'" alt="'+escHtml(p.name)+'" loading="lazy"></div>'+
        '<div class="catalog-card-body"><small>'+escHtml(category[section]||'Bottega')+'</small><h3>'+escHtml(p.name)+'</h3><p>'+escHtml(p.desc)+'</p>'+
        '<div class="catalog-points">'+pts+'</div>'+
        '<button class="product-detail-link" type="button" data-open-product="'+escHtml(p.id)+'">Apri la scheda completa →</button>'+
        '<div class="catalog-buy-row"><div class="catalog-price"><strong>'+price+'</strong><span>'+escHtml(p.size)+'</span></div>'+
        '<button class="add-btn official-add" data-id="'+escHtml(p.id)+'" data-name="'+escHtml(p.name)+'" data-price="'+Number(p.price||0)+'" data-size="'+escHtml(p.size)+'" data-points="'+Number(points[p.id]||0)+'">'+(free?'Aggiungi gratis':'Aggiungi')+'</button></div></div></article>';
    }).join('');

    const re = new RegExp('(<div class="catalog-grid"[^>]*data-official-section="'+section.replace(/[.*+?^$\{\}()|[\]\\]/g,'\\async function fetchReady(origin, pathname) {')+'"[^>]*>)[\\s\\S]*?(<\\/div>)');
    if (!re.test(html)) throw new Error('[Cloudflare V2] Contenitore catalogo mancante: ' + section);
    html = html.replace(re, '$1' + cards + '$2');
  }
  return html;
}

async function fetchReady(origin, pathname) {
  let lastError;
  for (let i = 0; i < 60; i++) {
    try {
      const response = await fetch(origin + pathname, { redirect: 'manual' });
      if (response.ok) return response;
      lastError = new Error(pathname + ' HTTP ' + response.status);
    } catch (error) {
      lastError = error;
    }
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw lastError || new Error('Server locale non disponibile');
}


/* Christmas presentation layer: visual-only; no commerce or navigation handlers. */
function injectChristmasTheme(html, pathname) {
  if (!/<\/head>/i.test(html) || html.includes('id="fda-christmas-theme"')) return html;
  const css = String.raw`
<style id="fda-christmas-theme">
:root{--christmas-red:#a52b35;--christmas-gold:#e9bc59;--christmas-pine:#123e31}
html{scrollbar-color:#bd9345 #f6f0e4}
body{background-color:#faf4e9}
.site-header,.project-bar,header.site-header{background-color:#103b30!important}
.site-header{border-bottom:2px solid #c59a48!important}
.site-header .brand-mark{box-shadow:0 0 0 2px #f5db96,0 0 17px rgba(238,195,93,.28)}
.site-header .nav-links a[aria-current="page"],.site-header .nav-links .shop{color:#ffe09b!important}
a:focus-visible,button:focus-visible,input:focus-visible,select:focus-visible{outline:3px solid #c5484c;outline-offset:3px}
#fda-christmas-corners{position:absolute;top:33px;left:0;right:0;height:0;z-index:1;pointer-events:none}
#fda-christmas-corners .fda-sprig{position:absolute;top:0;width:74px;height:54px;opacity:.85;filter:drop-shadow(0 3px 5px rgba(0,0,0,.18))}
#fda-christmas-corners .fda-sprig.left{left:0}
#fda-christmas-corners .fda-sprig.right{right:0;transform:scaleX(-1)}
#fda-christmas-corners .fda-sprig svg{width:100%;height:100%}
#fda-christmas-ribbon{display:flex;align-items:center;justify-content:center;gap:13px;min-height:33px;padding:5px 24px;background:linear-gradient(100deg,#7b1e29,#a12e39 45%,#79212d);color:#fff4d8;font:700 12px/1.4 Arial,Helvetica,sans-serif;letter-spacing:.08em;text-align:center;border-bottom:2px solid #d9b45d;position:relative;z-index:1}
#fda-christmas-ribbon .star{color:#ffe6a0;font-size:16px}
#fda-christmas-ribbon strong{color:#ffe6a0}
body:before{content:"";position:fixed;inset:0;z-index:-1;pointer-events:none;background:radial-gradient(ellipse at 3% 8%,rgba(220,180,87,.09),transparent 30%),radial-gradient(ellipse at 98% 88%,rgba(135,30,44,.045),transparent 35%)}
@media(max-width:760px){
#fda-christmas-corners .fda-sprig{width:38px;height:30px;opacity:.7}
#fda-christmas-ribbon{font-size:10px;min-height:28px;padding:5px 44px;letter-spacing:.025em;gap:6px}
#fda-christmas-ribbon .star{font-size:12px}
}
@media(prefers-reduced-motion:reduce){#fda-christmas-corners *{animation:none!important;transition:none!important}}

/* Christmas 2: full-page festive editorial palette, not a green-only header. */
:root{--fda-xmas-wine:#811f31;--fda-xmas-red:#a42f3e;--fda-xmas-cream:#fff5e6;--fda-xmas-gold:#edc365}
body{background:#fff8ed!important}
#fda-christmas-ribbon{background:linear-gradient(90deg,#751b2c,#ae3545 48%,#751b2c)}
/* Red wine navigation and burgundy secondary navigation, with preserved readable controls. */
.site-header,header.site-header,.project-bar{background:#681e2d!important}
.project-bar{border-bottom:2px solid #d7a64d!important}
.site-header a,.project-bar a{transition:color .2s ease}
.site-header a:hover,.project-bar a:hover{color:#ffdc8b!important}
/* Festive cards, headings, and alternating content blocks across the public pages. */
main section:not(.shipping-promo):not(.checkout-panel):not(.product-detail-panel):nth-of-type(even){background-color:#fff3df}
main section:not(.shipping-promo):not(.checkout-panel):not(.product-detail-panel):nth-of-type(odd){border-color:#dfc18a}
.section-head h2,.section-head h3,.feature-story h2,.feature-copy h2,.story-flow h2{color:#7f2534}
.catalog-card,.today-card,.quick-card,.guide-card,.story-step,.note-card{border-color:#d6b56f!important;box-shadow:0 7px 24px rgba(94,30,38,.08)}
.catalog-card:hover,.today-card:hover,.quick-card:hover,.guide-card:hover{box-shadow:0 12px 28px rgba(130,36,52,.17)}
.catalog-points,.catalog-intro-tags,.editorial-hook-meta{color:#742537}
.editorial-hook{background:linear-gradient(115deg,#791f31 0%,#982d3c 64%,#632132 100%)!important;border-top:3px solid #e8b95e;border-bottom:3px solid #e8b95e}
.editorial-hook h1,.editorial-hook h2,.editorial-hook h3,.editorial-hook .editorial-hook-copy{color:#fff7e9!important}
.editorial-hook p,.editorial-hook small,.editorial-hook .editorial-hook-meta{color:#ffe8bf!important}
.editorial-hook .editorial-hook-meta span{border-color:#dcb56b!important}
.catalog-intro-card.dark,.feature-copy.dark{background:linear-gradient(135deg,#762538,#a33743)!important;color:#fff7e8!important}
.catalog-intro-card.dark h2,.feature-copy.dark h2,.catalog-intro-card.dark p,.feature-copy.dark p{color:#fff5e4!important}
.catalog-intro-card:not(.dark),.feature-story,.note-card{background-color:#fff3e0}
.footer,footer.footer{background:#581b2b!important;border-top:4px solid #d9a950!important}
.shipping-promo{background:#fff0c9!important}
#fda-christmas-ribbon:after{content:"";position:absolute;left:0;right:0;bottom:-4px;height:2px;background:linear-gradient(90deg,transparent,#ffdc8c,transparent)}
@media(max-width:760px){.editorial-hook{padding-top:25px;padding-bottom:25px}#fda-christmas-ribbon{font-size:10px}}

/* Distinct Christmas art direction for each page. Never restyle checkout forms or product actions. */
body.fda-xmas-about .hero{background:radial-gradient(circle at 85% 20%,rgba(240,198,112,.22),transparent 30%),linear-gradient(118deg,#5b2430 0%,#8d3440 55%,#4f2632 100%)!important;position:relative}
body.fda-xmas-about .hero:after{content:"✦   ✧   ✦";position:absolute;right:6%;top:22%;font:54px Georgia,serif;letter-spacing:14px;color:#e7c47c;opacity:.65;pointer-events:none}
body.fda-xmas-about .hero h1,body.fda-xmas-about .hero p{color:#fff8e8!important}
body.fda-xmas-about .values-grid .value:nth-child(3n+1){background:#fff0d8!important;border-top:4px solid #cfa453}
body.fda-xmas-about .values-grid .value:nth-child(3n+2){background:#f8e7e6!important;border-top:4px solid #9f3844}
body.fda-xmas-about .values-grid .value:nth-child(3n){background:#f0e7d7!important;border-top:4px solid #64765a}
body.fda-xmas-about .story-card.green{background:#70303c!important;color:#fff7e7!important}
body.fda-xmas-about .story-card.brown{background:#a66b43!important;color:#fff7e7!important}
body.fda-xmas-alveoterapia .story-hero{box-shadow:inset 0 0 0 5px rgba(237,200,132,.35)}
body.fda-xmas-alveoterapia .story-hero:after{content:"❄   ✧   ❄";position:absolute;right:6%;bottom:8%;font:32px Georgia,serif;letter-spacing:12px;color:#f5e5ce;pointer-events:none}
body.fda-xmas-alveoterapia .story-quote{border-left:5px solid #a73d4c!important;background:#fff1e4!important;color:#652836!important}
body.fda-xmas-alveoterapia .story-point:nth-child(odd){background:#f7e9e1!important}
body.fda-xmas-alveoterapia .story-point:nth-child(even){background:#f0ebdb!important}
body.fda-xmas-galena .galena-opening{background:radial-gradient(circle at 78% 22%,rgba(255,225,151,.23),transparent 38%),linear-gradient(130deg,#502b3b,#8e493f)!important}
body.fda-xmas-galena .galena-opening h1,body.fda-xmas-galena .galena-opening p{color:#fff6e5!important}
body.fda-xmas-galena .story-photo{border:5px solid #e0bd7e!important;box-shadow:0 12px 28px rgba(99,42,44,.16)}
body.fda-xmas-galena .story-quote{background:#fff0d3!important;border-left:4px solid #d7a24e!important}
body.fda-xmas-home .hero{box-shadow:inset 0 0 0 4px rgba(230,184,96,.3)}
body.fda-xmas-home .hero-kicker{color:#ffe0a3!important}
body.fda-xmas-home .bee-card:nth-child(3n+1){background:#fff0da!important;border-top:4px solid #c79343}
body.fda-xmas-home .bee-card:nth-child(3n+2){background:#f8e6e3!important;border-top:4px solid #a93947}
body.fda-xmas-home .bee-card:nth-child(3n){background:#ece7d9!important;border-top:4px solid #61765e}
body.fda-xmas-shop .hero{box-shadow:inset 0 0 0 4px rgba(255,217,138,.28)}
body.fda-xmas-shop .hero-kicker{color:#ffe2a1!important}
body.fda-xmas-shop .today-card:nth-child(odd),body.fda-xmas-shop .guide-card:nth-child(odd){border-top:4px solid #a53949!important}
body.fda-xmas-shop .today-card:nth-child(even),body.fda-xmas-shop .guide-card:nth-child(even){border-top:4px solid #d9a345!important}
body.fda-xmas-shop .chapter:not(.bottega):nth-of-type(even){background:#fff0e4!important}
body.fda-xmas-shop .chapter:not(.bottega):nth-of-type(odd){background:#fff8ec!important}
body.fda-xmas-shop .catalog-card{background:#fffaf2!important}
body.fda-xmas-shop .catalog-card:nth-child(4n+2){border-top:3px solid #a93c48!important}
body.fda-xmas-shop .catalog-card:nth-child(4n+3){border-top:3px solid #cfa049!important}
body.fda-xmas-digital .hero{background:radial-gradient(circle at 86% 18%,rgba(255,217,139,.24),transparent 36%),linear-gradient(125deg,#632a3a,#9a414a)!important}
body.fda-xmas-digital .hero h1,body.fda-xmas-digital .hero p{color:#fff5e4!important}
body.fda-xmas-digital .alveo-preview-intro{background:#fff0d9!important;border:2px solid #d8af66!important}
body.fda-xmas-board .board-hero{background:linear-gradient(115deg,#7b2637,#ad5146)!important}
body.fda-xmas-board .board-hero h1,body.fda-xmas-board .board-hero p{color:#fff5e5!important}
body.fda-xmas-board .event-card:nth-child(odd){background:#fff1dc!important;border-left:5px solid #ba8a3f}
body.fda-xmas-board .event-card:nth-child(even){background:#f9e7e6!important;border-left:5px solid #9f3544}
body.fda-xmas-points main{background:linear-gradient(180deg,#fff3d6,#fff9ee)!important}
body.fda-xmas-points h1{color:#812c3c}
body.fda-xmas-other main>section:nth-of-type(odd){background:#fff1e3!important}
body.fda-xmas-other main>section:nth-of-type(even){background:#f9e9e7!important}
@media(max-width:760px){body.fda-xmas-about .hero:after{font-size:22px;top:12%;right:4%}body.fda-xmas-alveoterapia .story-hero:after{font-size:18px;letter-spacing:4px}}

/* Christmas 4: cover EVERY content section, not just the hero. Section-by-section variety. */
body[class*="fda-xmas-"] main section:not(.hero):not(.story-hero):not(.board-hero):not(.galena-opening):not(.shipping-promo):not(.checkout-panel):not(.product-detail-panel):not(.catalog-card),
body[class*="fda-xmas-"] main .chapter:not(.bottega){border-top:1px solid rgba(189,139,67,.3)}
body.fda-xmas-home .steps-section{background:linear-gradient(115deg,#682b3a,#9c4350)!important;color:#fff6e9!important}
body.fda-xmas-home .steps-section h1,body.fda-xmas-home .steps-section h2,body.fda-xmas-home .steps-section h3,body.fda-xmas-home .steps-section p,body.fda-xmas-home .steps-section .step{color:#fff7e9!important}
body.fda-xmas-home .steps-section .step{border-color:#f0c36e!important}
body.fda-xmas-home .steps-section .step strong,body.fda-xmas-home .steps-section .step-number{color:#ffd277!important}
body.fda-xmas-home .home-today{background:#fff0d9!important}
body.fda-xmas-home .ape-telu-home{background:#f6e5e2!important}
body.fda-xmas-home .places{background:#f7eee0!important}
body.fda-xmas-home .venom{background:#f4e1e1!important}
body.fda-xmas-home .products{background:#fff2dc!important}
body.fda-xmas-home .conversation{background:linear-gradient(115deg,#63283b,#8f3a48)!important;color:#fff7e7!important}
body.fda-xmas-home .conversation h2,body.fda-xmas-home .conversation p{color:#fff7e7!important}
body.fda-xmas-home main>.section:not(.steps-section):not(.venom):not(.products){background:#fff4e5!important}
body.fda-xmas-home main>.section.alt{background:#f9e8e3!important}
body.fda-xmas-about .section:not(.hero):not(.alt){background:#fff2df!important}
body.fda-xmas-about .section.alt{background:#f6e5e3!important}
body.fda-xmas-about .section.story{background:#fff8ee!important}
body.fda-xmas-about .statement{background:linear-gradient(120deg,#732a39,#a0474a)!important;color:#fff6e6!important}
body.fda-xmas-about .statement h2,body.fda-xmas-about .statement p{color:#fff6e6!important}
body.fda-xmas-about .closing{background:#fff0d6!important}
body.fda-xmas-alveoterapia .section:not(.alt){background:#fff1df!important}
body.fda-xmas-alveoterapia .section.alt{background:#f4e5e3!important}
body.fda-xmas-alveoterapia .story-manifesto{background:linear-gradient(125deg,#702e40,#994c51)!important;color:#fff6e7!important}
body.fda-xmas-alveoterapia .story-manifesto h2,body.fda-xmas-alveoterapia .story-manifesto p{color:#fff6e7!important}
body.fda-xmas-galena .section:not(.alt){background:#fff1da!important}
body.fda-xmas-galena .section.alt{background:#f8e6df!important}
body.fda-xmas-galena .galena-contact{background:#f7dfc4!important}
body.fda-xmas-galena .story-manifesto{background:linear-gradient(110deg,#702d3c,#a15b46)!important;color:#fff5e7!important}
body.fda-xmas-shop .chapter.today{background:#fff0dc!important}
body.fda-xmas-shop .chapter.story-flow{background:#f9e6e3!important}
body.fda-xmas-shop .chapter.pathways{background:#fff5e6!important}
body.fda-xmas-shop .chapter.journal{background:#f4e5df!important}
body.fda-xmas-shop .chapter.bottega{background:#fff7e9!important}
body.fda-xmas-shop .editorial-hook{background:#fff0d7!important}
body.fda-xmas-board .board-wrap{background:#fff3e2!important}
body.fda-xmas-board .event-card{box-shadow:0 7px 24px rgba(116,43,55,.08)}
body.fda-xmas-other main>.section:nth-of-type(3n+1){background:#fff0db!important}
body.fda-xmas-other main>.section:nth-of-type(3n+2){background:#f7e5e3!important}
body.fda-xmas-other main>.section:nth-of-type(3n){background:#f7ebdf!important}
</style>`;
  const sprig = String.raw`<svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M-9 1Q64 12 126 94" stroke="#7a522f" stroke-width="5" fill="none"/><g stroke-linecap="round"><path d="M8 7L68 66M13 12L85 27M27 21L36 79M36 27L111 47M52 39L69 94M67 49L136 65M78 62L98 105" stroke="#1b6245" stroke-width="12"/><path d="M8 7L68 66M13 12L85 27M27 21L36 79M36 27L111 47M52 39L69 94M67 49L136 65M78 62L98 105" stroke="#38805a" stroke-width="5"/></g><g fill="#c53c44"><circle cx="45" cy="30" r="7"/><circle cx="58" cy="31" r="6"/><circle cx="53" cy="43" r="7"/></g><g fill="#f7d57a"><circle cx="96" cy="46" r="4"/><circle cx="115" cy="68" r="4"/></g></svg>`;
  const decor = '<div id="fda-christmas-corners" aria-hidden="true"><div class="fda-sprig left">'+sprig+'</div><div class="fda-sprig right">'+sprig+'</div></div>';
  const ribbon = '<div id="fda-christmas-ribbon" aria-label="Atmosfera natalizia alla Fabbrica delle Api"><span class="star" aria-hidden="true">✦</span><span><strong>Natale alla Fabbrica delle Api</strong> · la magia delle feste incontra il mondo delle api</span><span class="star" aria-hidden="true">✦</span></div>';
  const pageType = pathname === '/chi-siamo' ? 'about' : pathname === '/alveoterapia' ? 'alveoterapia' : pathname === '/centro' ? 'galena' : pathname === '/' || pathname === '/home' ? 'home' : pathname === '/shop' ? 'shop' : pathname === '/alveo-digitale' ? 'digital' : pathname === '/bacheca' ? 'board' : pathname === '/punti-ape' || pathname === '/saldo-api.html' ? 'points' : 'other';
  html=html.replace(/<body([^>]*)>/i, (full,attrs)=>'<body'+(/\bclass\s*=/.test(attrs)?attrs.replace(/\bclass\s*=\s*(["\'])(.*?)\1/i,(m,q,c)=>'class='+q+c+' fda-xmas-'+pageType+q):attrs+' class="fda-xmas-'+pageType+'"')+'>');
  html=html.replace(/<\/head>/i,css+'</head>');
  html=html.replace(/<body([^>]*)>/i, (full, attrs)=>'<body'+attrs+'>'+decor+ribbon);
  return html;
}

function writeRoute(route, html) {
  const clean = route.replace(/^\/+|\/+$/g, '');
  if (!clean) {
    fs.writeFileSync(path.join(dist, 'index.html'), html, 'utf8');
    return;
  }
  const dir = path.join(dist, clean);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf8');
}

async function main() {
  fs.rmSync(dist, { recursive: true, force: true });
  fs.mkdirSync(dist, { recursive: true });

  copyBrowserAssets();

  const port = 39731;
  const origin = 'http://127.0.0.1:' + port;
  const server = spawn(process.execPath, ['server.js'], {
    cwd: root,
    env: { ...process.env, PORT: String(port) },
    stdio: 'inherit'
  });

  try {
    await fetchReady(origin, '/');

    const routes = [
      ['/', 'index.html'],
      ['/home', 'home.html'],
      ['/centro', 'centro.html'],
      ['/alveoterapia', 'alveoterapia.html'],
      ['/bacheca', 'bacheca.html'],
      ['/chi-siamo', 'chi-siamo.html'],
      ['/contatti', 'contatti.html'],
      ['/alveo-digitale', 'alveo-digitale.html'],
      ['/shop', 'shop-v2.html'],
      ['/success.html', 'success.html'],
      ['/cancel.html', 'cancel.html'],
      ['/saldo-api.html', 'saldo-api.html']
    ];

    for (const [pathname, flatFile] of routes) {
      const response = await fetchReady(origin, pathname);
      let html = await response.text();
      html = hideVeleniFromPublicHtml(html);
      if(pathname==='/shop')html=hideApinfioreFromPublicCards(html);
      html = injectBrandSeo(html, pathname);
      html = injectChristmasTheme(html, pathname);
      if (!/<html/i.test(html)) throw new Error('[Cloudflare V2] HTML non valido da ' + pathname);

      if (pathname === '/' || pathname === '/home') {
        if (!html.includes('globalToolsBar') || !html.includes('global-tools-v2.js')) {
          throw new Error('[Cloudflare V2] Home senza strumenti globali/Ape Telù.');
        }
        if (!html.includes('Il mondo delle api oggi')) {
          throw new Error('[Cloudflare V2] Home senza presentazione Edizioni Aperte gratuita.');
        }
      }

      if (pathname === '/shop') {
        const required = ['Ape Telù','Alveo Digitale','10 Colazioni','Punti Ape','Saldo Api','Il mondo delle api oggi','prodotto-propoli-30-spray-integratore','prodotto-cosmesi-crema-mani','prodotto-tesori-limoncello'];
        const missing = required.filter(value => !html.includes(value));
        if (missing.length) throw new Error('[Cloudflare V2] Shop V2 incompleto: ' + missing.join(', '));
        const cardCount = (html.match(/class="catalog-card product-openable/g) || []).length;
        if (cardCount < 30) throw new Error('[Cloudflare V2] Catalogo prerenderizzato incompleto: ' + cardCount + ' card.');
        const sectionCount = (html.match(/data-official-section=/g) || []).length;
        if (sectionCount < 6) throw new Error('[Cloudflare V2] Sezioni prodotto mancanti: ' + sectionCount + '/6.');
      }

      if (pathname === '/alveo-digitale') {
        const required = ['10 Colazioni','Il mondo delle api oggi','Punti Ape'];
        const missing = required.filter(value => !html.includes(value));
        if (missing.length) throw new Error('[Cloudflare V2] Alveo Digitale incompleto: ' + missing.join(', '));
      }

      fs.writeFileSync(path.join(dist, flatFile), html, 'utf8');
      if (!pathname.endsWith('.html')) writeRoute(pathname, html);
    }

    // punti-ape.html belongs to the newer V2 frontend and is not a route
    // known by the legacy Express server used only during the build.
    // Copy it directly and create the clean /punti-ape route.
    const puntiApeHtml = fs.readFileSync(path.join(root, 'punti-ape.html'), 'utf8');
    if (!/<html/i.test(puntiApeHtml) || !puntiApeHtml.includes('Punti Ape')) {
      throw new Error('[Cloudflare V2] punti-ape.html non valido.');
    }
    const christmasPuntiApeHtml = injectChristmasTheme(puntiApeHtml, '/punti-ape');
    fs.writeFileSync(path.join(dist, 'punti-ape.html'), christmasPuntiApeHtml, 'utf8');
    writeRoute('/punti-ape', christmasPuntiApeHtml);

    // Installa GA4 su tutte le pagine HTML generate prima di creare il bundle dello shop.
    injectGoogleAnalyticsIntoDist(dist);

    // Bundle the validated shop HTML directly with the Worker.
    // /shop will no longer depend on Cloudflare static-asset HTML routing or stale copies.
    const canonicalShopHtml = fs.readFileSync(path.join(dist, 'shop-v2.html'), 'utf8');
    const canonicalCardCount = (canonicalShopHtml.match(/class="catalog-card product-openable/g) || []).length;
    const canonicalSectionCount = (canonicalShopHtml.match(/data-official-section=/g) || []).length;
    if (canonicalCardCount < 30 || canonicalSectionCount < 6) {
      throw new Error('[Cloudflare V2] Shop canonico incompleto: '+canonicalCardCount+' card, '+canonicalSectionCount+' sezioni.');
    }
    fs.writeFileSync(
      path.join(root, 'cloudflare-shop-html.js'),
      'export default ' + JSON.stringify(canonicalShopHtml) + ';\n',
      'utf8'
    );

    console.log('[Cloudflare V2] Build PASS: Edizioni Aperte, Alveo Digitale, 10 Colazioni, Punti Ape e Saldo Api presenti.');
  } finally {
    if (server.exitCode === null) server.kill('SIGTERM');
  }
}

main().catch(error => {
  console.error('[Cloudflare V2] Build fallito:', error);
  process.exit(1);
});
