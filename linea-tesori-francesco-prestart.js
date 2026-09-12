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

function replaceArticleById(source, id, replacement) {
  const marker = `id="${id}"`;
  const pos = source.indexOf(marker);
  if (pos === -1) return null;
  const start = source.lastIndexOf('<article', pos);
  const endTag = '</article>';
  const endStart = source.indexOf(endTag, pos);
  if (start === -1 || endStart === -1) return null;
  return source.slice(0, start) + replacement + source.slice(endStart + endTag.length);
}

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const category = 'tesori-francesco';
  const productIds = ['tesori-limoncello', 'tesori-liquore-caffe', 'tesori-castagne-rum'];
  const products = [
    {
      id: 'tesori-limoncello',
      name: 'Limoncello “I Tesori di Francesco”',
      description: 'Limoncello della linea I Tesori di Francesco, dal profilo fresco e intensamente agrumato. Nasce da un’infusione di scorze di limone selezionate per ottenere un gusto pieno, equilibrato e persistente. È piacevole servito ben fresco a fine pasto oppure come piccolo liquore da degustazione. La bottiglia da 250 ml è adatta anche come idea regalo.',
      image: 'https://gcdn.picsart.com/editing-temp/f429f239-7de8-4c42-aa2f-04f65142268c.jpeg',
      packs: [{ id: 'tf-lim-1', label: '1 bottiglia - 250 ml', jars: 1, price: 5.90 }],
      order: 7001, category, inStock: true, stock: 100
    },
    {
      id: 'tesori-liquore-caffe',
      name: 'Liquore di Caffè “I Tesori di Francesco”',
      description: 'Liquore al caffè della linea I Tesori di Francesco, dal gusto intenso e avvolgente. L’aroma del caffè si unisce alla dolcezza del liquore creando un profilo pieno e persistente. Si può servire fresco o a temperatura ambiente, da solo oppure in abbinamento a dessert. Formato da 250 ml, adatto anche come piccolo regalo gastronomico.',
      image: 'https://gcdn.picsart.com/editing-temp/96c84958-6021-4843-bac1-b7306310ca21.jpeg',
      packs: [{ id: 'tf-caf-1', label: '1 bottiglia - 250 ml', jars: 1, price: 5.90 }],
      order: 7002, category, inStock: true, stock: 100
    },
    {
      id: 'tesori-castagne-rum',
      name: 'Castagne al Rum “I Tesori di Francesco”',
      description: 'Castagne al rum della linea I Tesori di Francesco, una specialità dal gusto ricco in cui la dolcezza naturale delle castagne incontra le note aromatiche del rum. Sono pensate come prodotto da degustazione e si prestano bene a essere servite a fine pasto o insieme a dessert. Il formato compatto le rende adatte anche come idea regalo gastronomica.',
      image: 'https://gcdn.picsart.com/editing-temp/fff1598b-570b-4181-be5a-383b4912a569.jpeg',
      packs: [{ id: 'tf-rum-1', label: '1 confezione - 250 ml', jars: 1, price: 5.90 }],
      order: 7003, category, inStock: true, stock: 100
    }
  ];

  for (const product of products) {
    if (!findObjectBounds(html, product.id)) html = insertAfterStaticAnchor(html, product);
  }

  html = html.replace(/const allowedCategoriesForShop = \[([^\]]*)\];/g, (full, inside) => {
    if (/['"]tesori-francesco['"]/.test(inside)) return full;
    const cleaned = inside.trim().replace(/,\s*$/, '');
    return `const allowedCategoriesForShop = [${cleaned}${cleaned ? ', ' : ''}'tesori-francesco'];`;
  });

  html = html.replace(/const currentPublicCatalogIds = new Set\((\[[^;]*?\])\);/g, (full, arrayText) => {
    const idsToAdd = productIds.filter(id => !arrayText.includes(id));
    if (!idsToAdd.length) return full;
    const trimmed = arrayText.trim().replace(/\]$/, '');
    const prefix = trimmed.endsWith('[') ? '' : ',';
    return `const currentPublicCatalogIds = new Set(${trimmed}${prefix}${idsToAdd.map(id => JSON.stringify(id)).join(',')}]);`;
  });

  const overrides = Object.fromEntries(products.map(p => [p.id, {
    name: p.name, description: p.description, image: p.image, packs: p.packs,
    order: p.order, category: p.category, inStock: true, stock: 100
  }]));

  if (!html.includes('const brochureTesoriFrancescoOverrides =')) {
    const needle = '                        const brochureFoodOverrides = ';
    const pos = html.indexOf(needle);
    if (pos === -1) throw new Error('Punto override catalogo non trovato');
    html = html.slice(0, pos) + `                        const brochureTesoriFrancescoOverrides = ${JSON.stringify(overrides)};\n` + html.slice(pos);
  }

  html = html.replace(/const override = ([^;]*brochureCosmesiCeraOverrides\[p\.id\][^;]*);/g, (full, expr) => {
    if (expr.includes('brochureTesoriFrancescoOverrides')) return full;
    return `const override = ${expr} || brochureTesoriFrancescoOverrides[p.id];`;
  });
  if (!html.includes('brochureTesoriFrancescoOverrides[p.id]')) throw new Error('Override Tesori di Francesco non collegato');

  const titleAnchor = "'cosmesi-cera': 'Linea Cosmesi e Tesori in Cera d’Api'";
  if (html.includes(titleAnchor) && !html.includes("'tesori-francesco': 'Linea I Tesori di Francesco'")) {
    html = html.replaceAll(titleAnchor, `${titleAnchor}, 'tesori-francesco': 'Linea I Tesori di Francesco'`);
  }

  if (!html.includes('id="linea-tesori-francesco-home"')) {
    const home = `<article id="linea-tesori-francesco-home" className="overflow-hidden rounded-xl border border-emerald-300/35 bg-[#121212] shadow-lg">
                            <div className="px-3 pt-2 pb-2">
                              <div className="text-[11px] font-black tracking-[0.12em] text-emerald-400 uppercase">Linea I Tesori di Francesco</div>
                              <h2 className="mt-0.5 text-lg sm:text-xl font-black leading-tight text-white">Sapori artigianali, intensi e sorprendenti</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-[210px_minmax(0,1fr)] gap-2.5 px-3 pb-3 items-stretch">
                              <div className="overflow-hidden rounded-lg border border-amber-200/40 bg-[#f4ecdf] shadow-inner">
                                <img src="https://gcdn.picsart.com/editing-temp/f8c22dd6-53b5-4423-aa5d-fe1fb897fdb8.jpeg" alt="Presentazione della Linea I Tesori di Francesco" className="block w-full h-[170px] sm:h-full min-h-[170px] object-cover object-center" />
                              </div>
                              <div className="min-w-0 flex flex-col justify-center">
                                <p className="text-sm leading-snug font-semibold text-stone-100">Una piccola selezione di specialità dal carattere deciso: limoncello, liquore al caffè e castagne al rum, riuniti nella linea I Tesori di Francesco.</p>
                                <button type="button" onClick={() => { setSelectedProductId(null); setSelectedCategory('tesori-francesco'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="mt-3 inline-flex w-fit items-center justify-center rounded-lg bg-amber-500 hover:bg-amber-400 px-4 py-2 text-xs sm:text-sm font-black text-stone-950 shadow-sm transition-colors" aria-label="Scopri la gamma I Tesori di Francesco">Scopri la gamma</button>
                              </div>
                            </div>
                          </article>`;
    const updated = replaceArticleById(html, 'linea-prossima-home', home);
    if (!updated) throw new Error('Placeholder successivo alla Linea Cosmesi non trovato');
    html = updated;
  }

  for (const product of products) {
    const bounds = findObjectBounds(html, product.id);
    if (!bounds) throw new Error(`Prodotto mancante: ${product.id}`);
    const block = html.slice(bounds.start, bounds.end);
    if (!block.includes('tesori-francesco')) throw new Error(`Categoria errata per ${product.id}`);
    if (!block.includes('5.9')) throw new Error(`Prezzo non verificabile per ${product.id}`);
  }
  if (!html.includes("setSelectedCategory('tesori-francesco')")) throw new Error('Pulsante Scopri la gamma non collegato');

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Linea I Tesori di Francesco pronta: descrizioni complete e autoritative, prezzo 5,90 e immagini brochure.');
} catch (error) {
  console.error('[Miele Artigianale] Errore Linea I Tesori di Francesco:', error);
  process.exitCode = 1;
}
