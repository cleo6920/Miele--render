const fs = require('fs');
const path = require('path');

function findObjectBounds(source, id) {
  const markers = [`id: "${id}"`, `id:"${id}"`, `id: '${id}'`, `id:'${id}'`, `"id": "${id}"`, `"id":"${id}"`];
  let p = -1;
  for (const marker of markers) {
    const q = source.indexOf(marker);
    if (q !== -1 && (p === -1 || q < p)) p = q;
  }
  if (p < 0) return null;
  const start = source.lastIndexOf('{', p);
  if (start < 0) return null;
  let depth = 0, quote = null, escaped = false;
  for (let i = start; i < source.length; i++) {
    const ch = source[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
    if (ch === '{') depth++;
    else if (ch === '}' && --depth === 0) return { start, end: i + 1 };
  }
  return null;
}

function insertAfterStaticAnchor(source, product) {
  const marker = 'const staticInitialProducts = [';
  const markerPos = source.indexOf(marker);
  if (markerPos === -1) throw new Error('Catalogo staticInitialProducts non trovato');
  const insertAt = markerPos + marker.length;
  const text = '\n' + JSON.stringify(product, null, 2).replace(/"([^"\n]+)":/g, '$1:') + ',\n';
  return source.slice(0, insertAt) + text + source.slice(insertAt);
}

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const category = 'tris-alveare';
  const offers = [
    {
      "slug": "millefiori",
      "price": 23.7,
      "items": [
        "Millefiori €4,90",
        "Castagno €6,90",
        "Acacia in Favo €11,90"
      ]
    },
    {
      "slug": "melone",
      "price": 23.7,
      "items": [
        "Melone €4,90",
        "Polline Italiano €10,90",
        "Propoli Spray alcolica 30% €7,90"
      ]
    },
    {
      "slug": "fragola",
      "price": 23.7,
      "items": [
        "Fragola €4,90",
        "Acacia e Zenzero €7,90",
        "Polline Italiano €10,90"
      ]
    },
    {
      "slug": "pesca",
      "price": 23.7,
      "items": [
        "Pesca €4,90",
        "Polline Italiano €10,90",
        "Propoli Spray alcolica 30% €7,90"
      ]
    },
    {
      "slug": "arancia",
      "price": 24.7,
      "items": [
        "Arancia €4,90",
        "Crema Mani €9,90",
        "Shampoo €9,90"
      ]
    },
    {
      "slug": "castagno",
      "price": 23.7,
      "items": [
        "Castagno €6,90",
        "Acacia in Favo €11,90",
        "Burrocacao Miele e Pappa Reale €4,90"
      ]
    },
    {
      "slug": "acacia-zenzero",
      "price": 23.7,
      "items": [
        "Acacia e Zenzero €7,90",
        "Balsamico Italiano €11,90",
        "Saponetta Frutti di Bosco €3,90"
      ]
    },
    {
      "slug": "eucalipto",
      "price": 23.7,
      "items": [
        "Eucalipto €6,90",
        "Acacia in Favo €11,90",
        "Burrocacao Propoli e Aloe €4,90"
      ]
    },
    {
      "slug": "balsammiel",
      "price": 23.7,
      "items": [
        "Balsamico Italiano €11,90",
        "Propoli Spray alcolica 30% €7,90",
        "Saponetta Aloe Vera €3,90"
      ]
    },
    {
      "slug": "acacia-40g",
      "price": 23.7,
      "items": [
        "Acacia 40 g €2,90",
        "Polline Italiano €10,90",
        "Crema Mani €9,90"
      ]
    },
    {
      "slug": "favo-integrale",
      "price": 23.7,
      "items": [
        "Acacia in Favo €11,90",
        "Acacia e Zenzero €7,90",
        "Saponetta Frutti di Bosco €3,90"
      ]
    },
    {
      "slug": "polline",
      "price": 23.7,
      "items": [
        "Polline Italiano €10,90",
        "Propoli Spray alcolica 30% €7,90",
        "Burrocacao Miele e Pappa Reale €4,90"
      ]
    },
    {
      "slug": "orsetti",
      "price": 23.7,
      "items": [
        "Orsetti Gommosi BIO €3,90",
        "Acacia e Zenzero €7,90",
        "Balsamico Italiano €11,90"
      ]
    },
    {
      "slug": "pappa-reale",
      "price": 23.7,
      "items": [
        "Pappa Reale €6,90",
        "Acacia in Favo €11,90",
        "Burrocacao Propoli e Aloe €4,90"
      ]
    },
    {
      "slug": "propoli-spray",
      "price": 23.7,
      "items": [
        "Propoli Spray alcolica 30% €7,90",
        "Acacia in Favo €11,90",
        "Saponetta Lavanda €3,90"
      ]
    },
    {
      "slug": "propoli-alcolica",
      "price": 23.7,
      "items": [
        "Propoli in pipetta alcolica €5,90",
        "Acacia in Favo €11,90",
        "Candela Alveare €5,90"
      ]
    },
    {
      "slug": "propoli-analcolica",
      "price": 23.7,
      "items": [
        "Propoli in pipetta analcolica €5,90",
        "Acacia e Zenzero €7,90",
        "Shampoo €9,90"
      ]
    },
    {
      "slug": "crema-mani",
      "price": 24.7,
      "items": [
        "Crema Mani €9,90",
        "Acacia 40 g €2,90",
        "Balsamico Italiano €11,90"
      ]
    },
    {
      "slug": "burrocacao-propoli-aloe",
      "price": 21.7,
      "items": [
        "Burrocacao Propoli e Aloe €4,90",
        "Polline Italiano €10,90",
        "Propoli in pipetta alcolica €5,90"
      ]
    },
    {
      "slug": "burrocacao-miele-pappa",
      "price": 23.7,
      "items": [
        "Burrocacao Miele e Pappa Reale €4,90",
        "Eucalipto €6,90",
        "Balsamico Italiano €11,90"
      ]
    },
    {
      "slug": "shampoo",
      "price": 23.7,
      "items": [
        "Shampoo €9,90",
        "Crema Mani €9,90",
        "Saponetta Aloe Vera €3,90"
      ]
    },
    {
      "slug": "saponetta-frutti-bosco",
      "price": 23.7,
      "items": [
        "Saponetta Frutti di Bosco €3,90",
        "Crema Mani €9,90",
        "Shampoo €9,90"
      ]
    },
    {
      "slug": "saponetta-lavanda",
      "price": 23.7,
      "items": [
        "Saponetta Lavanda €3,90",
        "Crema Mani €9,90",
        "Shampoo €9,90"
      ]
    },
    {
      "slug": "saponetta-aloe",
      "price": 23.7,
      "items": [
        "Saponetta Aloe Vera €3,90",
        "Acacia e Zenzero €7,90",
        "Balsamico Italiano €11,90"
      ]
    },
    {
      "slug": "candela-alveare",
      "price": 24.7,
      "items": [
        "Candela Alveare €5,90",
        "Eucalipto €6,90",
        "Balsamico Italiano €11,90"
      ]
    },
    {
      "slug": "limoncello",
      "price": 23.7,
      "items": [
        "Limoncello €5,90",
        "Acacia e Zenzero €7,90",
        "Shampoo €9,90"
      ]
    },
    {
      "slug": "liquore-caffe",
      "price": 21.7,
      "items": [
        "Liquore al Caffè €5,90",
        "Propoli in pipetta analcolica €5,90",
        "Crema Mani €9,90"
      ]
    },
    {
      "slug": "castagne-rum",
      "price": 23.7,
      "items": [
        "Castagne al Rum €5,90",
        "Balsamico Italiano €11,90",
        "Candela Alveare €5,90"
      ]
    }
  ];

  // Valore autoritativo unico per card e scheda: somma Api dei 3 prodotti + 3 bonus.
  const beePointsBySlug = {
    'millefiori': 11,
    'melone': 12,
    'fragola': 12,
    'pesca': 12,
    'arancia': 11,
    'castagno': 11,
    'acacia-zenzero': 11,
    'eucalipto': 11,
    'balsammiel': 11,
    'acacia-40g': 11,
    'favo-integrale': 11,
    'polline': 12,
    'orsetti': 11,
    'pappa-reale': 11,
    'propoli-spray': 11,
    'propoli-alcolica': 11,
    'propoli-analcolica': 11,
    'crema-mani': 11,
    'burrocacao-propoli-aloe': 11,
    'burrocacao-miele-pappa': 11,
    'shampoo': 10,
    'saponetta-frutti-bosco': 10,
    'saponetta-lavanda': 10,
    'saponetta-aloe': 11,
    'candela-alveare': 11,
    'limoncello': 11,
    'liquore-caffe': 10,
    'castagne-rum': 11
  };

  const products = offers.map((offer, index) => ({
    id: `tris-alveare-${offer.slug}`,
    name: `Tris dell’Alveare – ${offer.items[0].replace(/\s+€\d+[,.]\d+$/, '')}`,
    description: `Tre prodotti selezionati insieme: ${offer.items.join(' + ')}. Una proposta pronta da acquistare della linea I Tris dell’Alveare.`,
    image: offer.slug === 'millefiori'
      ? '/images/tris-alveare-millefiori.jpg'
      : '/images/hero-prodotti-corretta.jpg',
    packs: [
      { id: `tris-alveare-pack-${index + 1}`, label: 'Confezione spedizione / da viaggio - 3 prodotti', jars: 3, price: offer.price },
      { id: `tris-alveare-pack-${index + 1}-regalo`, label: 'Con espositore confezione regalo - 3 prodotti (+ €5,00)', jars: 3, price: Number((offer.price + 5).toFixed(2)) }
    ],
    order: 8001 + index,
    category,
    inStock: true,
    stock: 100,
    beePoints: beePointsBySlug[offer.slug],
    beeBonus: 3
  }));

  for (const product of products) {
    if (!findObjectBounds(html, product.id)) html = insertAfterStaticAnchor(html, product);
  }

  html = html.replace(/const allowedCategoriesForShop = \[([^\]]*)\];/g, (full, inside) => {
    if (/['"]tris-alveare['"]/.test(inside)) return full;
    const cleaned = inside.trim().replace(/,\s*$/, '');
    return `const allowedCategoriesForShop = [${cleaned}${cleaned ? ', ' : ''}'tris-alveare'];`;
  });

  html = html.replace(/const currentPublicCatalogIds = new Set\((\[[^;]*?\])\);/g, (full, arrayText) => {
    const idsToAdd = products.map(p => p.id).filter(id => !arrayText.includes(id));
    if (!idsToAdd.length) return full;
    const trimmed = arrayText.trim().replace(/\]$/, '');
    const prefix = trimmed.endsWith('[') ? '' : ',';
    return `const currentPublicCatalogIds = new Set(${trimmed}${prefix}${idsToAdd.map(id => JSON.stringify(id)).join(',')}]);`;
  });

  const titleAnchor = "'tesori-francesco': 'Linea I Tesori di Francesco'";
  if (html.includes(titleAnchor) && !html.includes("'tris-alveare': 'I Tris dell’Alveare'")) {
    html = html.replaceAll(titleAnchor, `${titleAnchor}, 'tris-alveare': 'I Tris dell’Alveare'`);
  }

  if (!html.includes('id="linea-tris-alveare-home"')) {
    const anchorId = 'linea-tesori-francesco-home';
    const marker = `id="${anchorId}"`;
    const pos = html.indexOf(marker);
    if (pos === -1) throw new Error('Linea I Tesori di Francesco non trovata come punto di inserimento');
    const start = html.lastIndexOf('<article', pos);
    const endStart = html.indexOf('</article>', pos);
    if (start === -1 || endStart === -1) throw new Error('Blocco Tesori di Francesco non delimitato');
    const end = endStart + '</article>'.length;
    const home = `<article id="linea-tris-alveare-home" className="overflow-hidden rounded-xl border border-amber-300/40 bg-[#121212] shadow-lg">
                            <div className="px-3 pt-2 pb-2">
                              <div className="text-[11px] font-black tracking-[0.12em] text-amber-400 uppercase">I Tris dell’Alveare</div>
                              <h2 className="mt-0.5 text-lg sm:text-xl font-black leading-tight text-white">Tre prodotti, una proposta già pronta</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-[210px_minmax(0,1fr)] gap-2.5 px-3 pb-3 items-stretch">
                              <div className="overflow-hidden rounded-lg border border-amber-200/40 bg-[#f4ecdf] shadow-inner">
                                <img src="/images/hero-prodotti-corretta.jpg" alt="Presentazione I Tris dell’Alveare" className="block w-full h-[170px] sm:h-full min-h-[170px] object-cover object-center" />
                              </div>
                              <div className="min-w-0 flex flex-col justify-center">
                                <p className="text-sm leading-snug font-semibold text-stone-100">Una selezione di 28 tris composti da tre prodotti della Fabbrica delle Api, già abbinati e disponibili in confezione spedizione/da viaggio oppure con espositore confezione regalo.</p>
                                <button type="button" onClick={() => { setSelectedProductId(null); setSelectedCategory('tris-alveare'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="mt-3 inline-flex w-fit items-center justify-center rounded-lg bg-amber-500 hover:bg-amber-400 px-4 py-2 text-xs sm:text-sm font-black text-stone-950 shadow-sm transition-colors" aria-label="Scopri I Tris dell’Alveare">Scopri la gamma</button>
                              </div>
                            </div>
                          </article>`;
    html = html.slice(0, end) + '\n' + home + html.slice(end);
  }

  if (products.length !== 28) throw new Error(`Numero tris non valido: ${products.length}`);
  for (const offer of offers) {
    const itemTotal = offer.items.reduce((sum, item) => {
      const match = item.match(/€(\d+),(\d{2})$/);
      if (!match) throw new Error(`Prezzo prodotto non leggibile nel Tris ${offer.slug}: ${item}`);
      return sum + Number(`${match[1]}.${match[2]}`);
    }, 0);
    if (Math.abs(itemTotal - offer.price) > 0.001) {
      throw new Error(`Prezzo base Tris non uguale alla somma dei 3 prodotti: ${offer.slug} (${itemTotal.toFixed(2)} != ${offer.price.toFixed(2)})`);
    }
  }
  if (products.some(product => product.packs.length !== 2 || Math.abs((product.packs[1].price - product.packs[0].price) - 5) > 0.001)) {
    throw new Error('Opzione regalo Tris non valida: ogni Tris deve avere 2 formati con differenza esatta di €5,00');
  }
  for (const product of products) {
    if (!findObjectBounds(html, product.id)) throw new Error(`Tris mancante: ${product.id}`);
    if (!Number.isFinite(product.beePoints) || product.beePoints <= 0) throw new Error(`Punti Api mancanti: ${product.id}`);
  }
  if (!html.includes("setSelectedCategory('tris-alveare')")) throw new Error('Pulsante I Tris dell’Alveare non collegato');

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] I Tris dell’Alveare pronti: 28 offerte allineate alla brochure, con opzione viaggio e regalo + €5,00.');
} catch (error) {
  console.error('[Miele Artigianale] Errore linea I Tris dell’Alveare:', error);
  process.exitCode = 1;
}
