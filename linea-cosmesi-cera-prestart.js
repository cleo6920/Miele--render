const fs = require('fs');
const path = require('path');

function findObjectBounds(source, id) {
  const markers = [
    `id: "${id}"`, `id:"${id}"`, `id: '${id}'`, `id:'${id}'`,
    `"id": "${id}"`, `"id":"${id}"`
  ];
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

function replaceProduct(source, id, product) {
  const bounds = findObjectBounds(source, id);
  if (!bounds) return source;
  const text = JSON.stringify(product, null, 2).replace(/"([^"\n]+)":/g, '$1:');
  return source.slice(0, bounds.start) + text + source.slice(bounds.end);
}

function insertAfterStaticAnchor(source, product) {
  const marker = 'const staticInitialProducts = [';
  const markerPos = source.indexOf(marker);
  if (markerPos === -1) throw new Error('Catalogo staticInitialProducts non trovato');
  const insertAt = markerPos + marker.length;
  const text = '\n' + JSON.stringify(product, null, 2).replace(/"([^"\n]+)":/g, '$1:') + ',\n';
  return source.slice(0, insertAt) + text + source.slice(insertAt);
}

function replaceLinePlaceholder(source, replacement) {
  const needle = '>Linea in allestimento</h2>';
  const pos = source.indexOf(needle);
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

  const category = 'cosmesi-cera';
  const productIds = [
    'cosmesi-crema-mani',
    'cosmesi-burrocacao-propoli-aloe',
    'cosmesi-burrocacao-miele-pappa-reale',
    'cosmesi-shampoo-multivitaminico',
    'cosmesi-saponetta-frutti-bosco',
    'cosmesi-saponetta-lavanda',
    'cosmesi-saponetta-aloe-vera',
    'cosmesi-candela-alveare-cera-api'
  ];

  // Fonte autoritativa: brochure Linea Cosmesi e Tesori in Cera d'Api, pagine 7-8.
  const products = [
    {
      id: 'cosmesi-crema-mani',
      name: 'Crema Mani',
      description: 'Crema formulata con propoli, cera d’api ed echinacea, pensata per mani secche o fragili. Nutre e protegge la pelle, aiutando a mantenerla morbida e curata.',
      image: '/images/cosmesi-crema-mani.jpg',
      packs: [{ id: 'cm1', label: '1 confezione - 100 ml', jars: 1, price: 9.90 }],
      order: 6001, category, inStock: true, stock: 100
    },
    {
      id: 'cosmesi-burrocacao-propoli-aloe',
      name: 'Burrocacao Propoli e Aloe Vera',
      description: 'Burrocacao cremoso formulato con propoli e aloe vera, pensato per proteggere e mantenere le labbra morbide e idratate. Aiuta a contrastare secchezza e screpolature, lasciando una piacevole sensazione di comfort.',
      image: '/images/cosmesi-burrocacao-propoli-aloe.jpg',
      packs: [{ id: 'bpa1', label: '1 stick - 5 ml', jars: 1, price: 4.90 }],
      order: 6002, category, inStock: true, stock: 100
    },
    {
      id: 'cosmesi-burrocacao-miele-pappa-reale',
      name: 'Burrocacao Miele e Pappa Reale',
      description: 'Burrocacao cremoso formulato con miele e pappa reale, pensato per nutrire e proteggere le labbra. Aiuta a contrastare secchezza e screpolature, mantenendo le labbra morbide, elastiche e confortevoli.',
      image: '/images/cosmesi-burrocacao-miele-pappa-reale.jpg',
      packs: [{ id: 'bmp1', label: '1 stick - 5 ml', jars: 1, price: 4.90 }],
      order: 6003, category, inStock: true, stock: 100
    },
    {
      id: 'cosmesi-shampoo-multivitaminico',
      name: 'Shampoo Multivitaminico Stimolante',
      description: 'Shampoo formulato con proteine del frumento, rosmarino e pappa reale, pensato per capelli danneggiati o tendenti alla caduta. Aiuta a nutrire e rinforzare la fibra capillare, lasciando i capelli più curati e vitali.',
      image: '/images/cosmesi-shampoo-multivitaminico.jpg',
      packs: [{ id: 'shm1', label: '1 flacone - 250 ml', jars: 1, price: 9.90 }],
      order: 6004, category, inStock: true, stock: 100
    },
    {
      id: 'cosmesi-saponetta-frutti-bosco',
      name: 'Saponetta Miele e Frutti di Bosco',
      description: 'Sapone vegetale formulato con miele e frutti di bosco, adatto alla detersione quotidiana della pelle. Deterge delicatamente e aiuta a mantenere la pelle morbida, lasciando una piacevole profumazione fruttata.',
      image: '/images/cosmesi-saponetta-frutti-bosco.jpg',
      packs: [{ id: 'sfb1', label: '1 saponetta - 100 g', jars: 1, price: 3.90 }],
      order: 6005, category, inStock: true, stock: 100
    },
    {
      id: 'cosmesi-saponetta-lavanda',
      name: 'Saponetta Miele e Lavanda',
      description: 'Sapone vegetale formulato con miele e lavanda, adatto alla detersione quotidiana della pelle. Deterge delicatamente e lascia una piacevole sensazione di freschezza, con la caratteristica profumazione della lavanda.',
      image: '/images/cosmesi-saponetta-lavanda.jpg',
      packs: [{ id: 'sl1', label: '1 saponetta - 100 g', jars: 1, price: 3.90 }],
      order: 6006, category, inStock: true, stock: 100
    },
    {
      id: 'cosmesi-saponetta-aloe-vera',
      name: 'Saponetta Miele e Aloe Vera',
      description: 'Sapone vegetale formulato con miele e aloe vera, pensato per una detersione delicata della pelle. Aiuta a mantenere la pelle morbida e idratata, lasciando una piacevole sensazione di comfort.',
      image: '/images/cosmesi-saponetta-aloe-vera.jpg',
      packs: [{ id: 'sav1', label: '1 saponetta - 100 g', jars: 1, price: 3.90 }],
      order: 6007, category, inStock: true, stock: 100
    },
    {
      id: 'cosmesi-candela-alveare-cera-api',
      name: 'Candela Alveare Grande in Cera d’Api',
      description: 'Candela artigianale realizzata in cera d’api, modellata nella caratteristica forma dell’alveare. La cera d’api è una sostanza naturale prodotta dalle api e utilizzata nell’alveare per costruire le celle dei favi.',
      image: '/images/cosmesi-candela-alveare.jpg',
      packs: [{ id: 'ca1', label: '1 candela - cera d’api', jars: 1, price: 5.90 }],
      order: 6008, category, inStock: true, stock: 100
    }
  ];

  // Immagini locali obbligatorie per la nuova linea.
  const requiredImages = [
    'linea-cosmesi-cera-home.jpg',
    'cosmesi-crema-mani.jpg',
    'cosmesi-burrocacao-propoli-aloe.jpg',
    'cosmesi-burrocacao-miele-pappa-reale.jpg',
    'cosmesi-shampoo-multivitaminico.jpg',
    'cosmesi-saponetta-frutti-bosco.jpg',
    'cosmesi-saponetta-lavanda.jpg',
    'cosmesi-saponetta-aloe-vera.jpg',
    'cosmesi-candela-alveare.jpg'
  ];
  for (const image of requiredImages) {
    if (!fs.existsSync(path.join(__dirname, 'images', image))) {
      throw new Error(`Immagine locale mancante: ${image}`);
    }
  }

  // Tutte le referenze sono nuove: le inseriamo senza toccare le altre linee.
  // Il comportamento resta idempotente in caso di riavvio del servizio.
  for (const product of products) {
    const existing = findObjectBounds(html, product.id);
    html = existing ? replaceProduct(html, product.id, product) : insertAfterStaticAnchor(html, product);
  }

  // Rende la nuova categoria pubblica nello shop.
  html = html.replace(/const allowedCategoriesForShop = \[([^\]]*)\];/g, (full, inside) => {
    if (/['"]cosmesi-cera['"]/.test(inside)) return full;
    const cleaned = inside.trim().replace(/,\s*$/, '');
    return `const allowedCategoriesForShop = [${cleaned}${cleaned ? ', ' : ''}'cosmesi-cera'];`;
  });

  // Il filtro autoritativo deve mantenere anche le otto nuove referenze.
  html = html.replace(/const currentPublicCatalogIds = new Set\((\[[^;]*?\])\);/g, (full, arrayText) => {
    const idsToAdd = productIds.filter(id => !arrayText.includes(id));
    if (!idsToAdd.length) return full;
    const trimmed = arrayText.trim().replace(/\]$/, '');
    const prefix = trimmed.endsWith('[') ? '' : ',';
    return `const currentPublicCatalogIds = new Set(${trimmed}${prefix}${idsToAdd.map(id => JSON.stringify(id)).join(',')}]);`;
  });

  // I dati della brochure prevalgono anche su eventuali dati Firestore vecchi.
  const overrides = Object.fromEntries(products.map(p => [p.id, {
    name: p.name,
    description: p.description,
    image: p.image,
    packs: p.packs,
    order: p.order,
    category: p.category,
    inStock: true,
    stock: 100
  }]));

  if (!html.includes('const brochureCosmesiCeraOverrides =')) {
    const overrideNeedle = '                        const brochureFoodOverrides = ';
    const overridePos = html.indexOf(overrideNeedle);
    if (overridePos === -1) throw new Error('Punto override catalogo non trovato');
    html = html.slice(0, overridePos) +
      `                        const brochureCosmesiCeraOverrides = ${JSON.stringify(overrides)};\n` +
      html.slice(overridePos);
  }

  const overrideOld = '                                const override = brochureFoodOverrides[p.id] || brochureIntegratorOverrides[p.id];';
  const overrideNew = '                                const override = brochureFoodOverrides[p.id] || brochureIntegratorOverrides[p.id] || brochureCosmesiCeraOverrides[p.id];';
  if (html.includes(overrideOld)) html = html.replaceAll(overrideOld, overrideNew);
  if (!html.includes('brochureCosmesiCeraOverrides[p.id]')) {
    throw new Error('Override Linea Cosmesi e Cera non collegato al catalogo finale');
  }

  // Titolo della pagina gamma.
  const titleNeedle = "'integratori': 'Linea Integratori'";
  if (html.includes(titleNeedle) && !html.includes("'cosmesi-cera': 'Linea Cosmesi e Tesori in Cera d’Api'")) {
    html = html.replaceAll(titleNeedle, `${titleNeedle}, 'cosmesi-cera': 'Linea Cosmesi e Tesori in Cera d’Api'`);
  }

  // Trasforma il box successivo agli Integratori nella nuova linea e ricrea il placeholder seguente.
  if (!html.includes('id="linea-cosmesi-cera-home"')) {
    if (!html.includes('id="linea-integratori-home"')) {
      throw new Error('Box Linea Integratori non trovato: intervento interrotto per sicurezza');
    }

    const cosmesiHome = `<article id="linea-cosmesi-cera-home" className="overflow-hidden rounded-xl border border-emerald-300/35 bg-[#121212] shadow-lg">
                            <div className="px-3 pt-2 pb-2">
                              <div className="text-[11px] font-black tracking-[0.12em] text-emerald-400 uppercase">Linea Cosmesi e Tesori in Cera d’Api</div>
                              <h2 className="mt-0.5 text-lg sm:text-xl font-black leading-tight text-white">Cura quotidiana e creazioni in cera d’api</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-[210px_minmax(0,1fr)] gap-2.5 px-3 pb-3 items-stretch">
                              <div className="overflow-hidden rounded-lg border border-amber-200/40 bg-[#f4ecdf] shadow-inner">
                                <img src="/images/linea-cosmesi-cera-home.jpg" alt="Presentazione della Linea Cosmesi e Tesori in Cera d’Api" className="block w-full h-[170px] sm:h-full min-h-[170px] object-cover object-center" />
                              </div>
                              <div className="min-w-0 flex flex-col justify-center">
                                <p className="text-sm leading-snug font-semibold text-stone-100">Cosmesi con ingredienti dell’alveare, saponette per la cura quotidiana e creazioni artigianali in cera d’api.</p>
                                <button type="button" onClick={() => { setSelectedProductId(null); setSelectedCategory('cosmesi-cera'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="mt-3 inline-flex w-fit items-center justify-center rounded-lg bg-amber-500 hover:bg-amber-400 px-4 py-2 text-xs sm:text-sm font-black text-stone-950 shadow-sm transition-colors" aria-label="Scopri la gamma della Linea Cosmesi e Tesori in Cera d’Api">Scopri la gamma</button>
                              </div>
                            </div>
                          </article>`;

    const nextPlaceholder = `<article id="linea-prossima-home" className="overflow-hidden rounded-xl border border-emerald-300/25 bg-[#121212] shadow-lg">
                            <div className="grid h-full min-h-[235px] place-items-center px-5 py-8 text-center">
                              <div className="max-w-md">
                                <div className="text-[11px] font-black tracking-[0.12em] text-amber-400 uppercase">Prossima linea</div>
                                <h2 className="mt-2 text-xl sm:text-2xl font-black leading-tight text-stone-200">Linea in allestimento</h2>
                                <p className="mt-2 text-sm leading-snug font-semibold text-stone-400">Stiamo preparando una nuova selezione della Fabbrica delle Api.</p>
                              </div>
                            </div>
                          </article>`;

    const replacement = `${cosmesiHome}\n${nextPlaceholder}`;
    const updated = replaceLinePlaceholder(html, replacement);
    if (!updated) throw new Error('Box Linea in allestimento non trovato');
    html = updated;
  }

  // Verifiche finali circoscritte alla nuova linea.
  for (const product of products) {
    const bounds = findObjectBounds(html, product.id);
    if (!bounds) throw new Error(`Prodotto Cosmesi/Cera mancante: ${product.id}`);
    const block = html.slice(bounds.start, bounds.end);
    if (!block.includes('cosmesi-cera')) throw new Error(`Categoria errata per ${product.id}`);
    const expectedPrice = product.packs[0].price.toFixed(2);
    if (!block.includes(String(product.packs[0].price)) && !block.includes(expectedPrice)) {
      throw new Error(`Prezzo non verificabile per ${product.id}`);
    }
  }

  if (!html.includes("setSelectedCategory('cosmesi-cera')")) {
    throw new Error('Pulsante Scopri la gamma non collegato alla nuova categoria');
  }
  if (!html.includes('id="linea-prossima-home"')) {
    throw new Error('Nuovo box Linea in allestimento mancante');
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Linea Cosmesi e Tesori in Cera d’Api pronta: 8 card, prezzi brochure, immagini locali e nuovo placeholder.');
} catch (error) {
  console.error('[Miele Artigianale] Errore Linea Cosmesi e Tesori in Cera d’Api:', error);
  process.exitCode = 1;
}
