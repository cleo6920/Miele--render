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
    'cosmesi-candela-alveare-cera-api',
    'cosmesi-travel-kit-benessere'
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
      name: 'Shampoo Multivitaminico',
      description: 'Shampoo formulato con proteine del frumento, rosmarino e pappa reale, pensato per capelli fragili, stressati o spenti. Aiuta a nutrire e rinforzare la fibra capillare, lasciando i capelli più curati e vitali.',
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
    },
    {
      id: 'cosmesi-travel-kit-benessere',
      name: 'Travel Kit Benessere dell’Alveare',
      description: 'Quattro essenziali. Una sola custodia. Sempre con te. Il Travel Kit Benessere dell’Alveare riunisce quattro formati da 50 ml pensati per accompagnare la cura quotidiana anche fuori casa: shampoo idratante lenitivo con calendula, miele e camomilla; balsamo intensivo multivitaminico con miele, polline, pappa reale, olio di lino ed estratto di ortica; crema corpo con miele, burro di karité, oli di riso e oliva ed estratti di lavanda, timo e iperico; bagnodoccia delicato con miele ed estratti di lavanda, iperico e timo, completato da note di muschio bianco e vetiver. Una combinazione pratica per corpo e capelli, adatta a uomo e donna e pensata per tutti i tipi di pelle e capelli. I quattro flaconi sono raccolti nella loro pochette trasparente riutilizzabile, comoda da tenere in valigia, nel beauty case o nel bagaglio a mano. Il tuo benessere non resta a casa.',
      image: 'data:image/webp;base64,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',
      packs: [{ id: 'tkb1', label: 'Kit completo - 4 x 50 ml + pochette riutilizzabile', jars: 1, price: 17.90 }],
      order: 6009, category, inStock: true, stock: 100
    },
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

  // Il filtro autoritativo deve mantenere anche le nove nuove referenze.
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
                              <h2 className="mt-0.5 text-lg sm:text-xl font-black leading-tight text-white">Bellezza e trattamento quotidiano per il corpo e creazioni in cera d’api</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-[210px_minmax(0,1fr)] gap-2.5 px-3 pb-3 items-stretch">
                              <div className="overflow-hidden rounded-lg border border-amber-200/40 bg-[#f4ecdf] shadow-inner">
                                <img src="/images/linea-cosmesi-cera-home.jpg" alt="Presentazione della Linea Cosmesi e Tesori in Cera d’Api" className="block w-full h-[170px] sm:h-full min-h-[170px] object-cover object-center" />
                              </div>
                              <div className="min-w-0 flex flex-col justify-center">
                                <p className="text-sm leading-snug font-semibold text-stone-100">Cosmesi con ingredienti dell’alveare, saponette per la detersione quotidiana e creazioni artigianali in cera d’api.</p>
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
  console.log('[Miele Artigianale] Linea Cosmesi e Tesori in Cera d’Api pronta: 9 card, prezzi brochure, immagini locali e nuovo placeholder.');
} catch (error) {
  console.error('[Miele Artigianale] Errore Linea Cosmesi e Tesori in Cera d’Api:', error);
  process.exitCode = 1;
}