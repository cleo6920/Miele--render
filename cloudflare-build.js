const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const root = __dirname;
const dist = path.join(root, 'dist');

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
    if (['.html', '.css', '.svg', '.ico', '.txt', '.webmanifest'].includes(ext)) {
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
      if (!/<html/i.test(html)) throw new Error('[Cloudflare V2] HTML non valido da ' + pathname);

      if (pathname === '/' || pathname === '/home') {
        if (!html.includes('globalToolsBar') || !html.includes('global-tools-v2.js')) {
          throw new Error('[Cloudflare V2] Home senza strumenti globali/Ape Pelù.');
        }
        if (!html.includes('Il mondo delle api oggi')) {
          throw new Error('[Cloudflare V2] Home senza presentazione Edizioni Aperte gratuita.');
        }
      }

      if (pathname === '/shop') {
        const required = ['Ape Pelù','Alveo Digitale','10 Colazioni','Punti Ape','Saldo Api','Il mondo delle api oggi','prodotto-propoli-30-spray-integratore','prodotto-cosmesi-crema-mani','prodotto-apis1-crema-viso-veleno-api','prodotto-tesori-limoncello'];
        const missing = required.filter(value => !html.includes(value));
        if (missing.length) throw new Error('[Cloudflare V2] Shop V2 incompleto: ' + missing.join(', '));
        const cardCount = (html.match(/class="catalog-card product-openable/g) || []).length;
        if (cardCount < 38) throw new Error('[Cloudflare V2] Catalogo prerenderizzato incompleto: ' + cardCount + ' card.');
        const sectionCount = (html.match(/data-official-section=/g) || []).length;
        if (sectionCount < 7) throw new Error('[Cloudflare V2] Sezioni prodotto mancanti: ' + sectionCount + '/7.');
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
    fs.writeFileSync(path.join(dist, 'punti-ape.html'), puntiApeHtml, 'utf8');
    writeRoute('/punti-ape', puntiApeHtml);

    // Bundle the validated shop HTML directly with the Worker.
    // /shop will no longer depend on Cloudflare static-asset HTML routing or stale copies.
    const canonicalShopHtml = fs.readFileSync(path.join(dist, 'shop-v2.html'), 'utf8');
    const canonicalCardCount = (canonicalShopHtml.match(/class="catalog-card product-openable/g) || []).length;
    const canonicalSectionCount = (canonicalShopHtml.match(/data-official-section=/g) || []).length;
    if (canonicalCardCount < 38 || canonicalSectionCount < 7) {
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
