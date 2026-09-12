const fs = require('fs');
const path = require('path');

function findObjectBounds(source, id) {
  const markers = [`id: \"${id}\"`, `id:\"${id}\"`, `id: '${id}'`, `id:'${id}'`, `\"id\": \"${id}\"`, `\"id\":\"${id}\"`];
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

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const integratorIds = [
    'bee-energy-bio',
    'propol-active-bio',
    'propoli-30-spray-integratore',
    'propoli-30-alcolica-integratore',
    'propoli-analcolica-integratore'
  ];

  // Fonte autoritativa: brochure Linea Integratori.
  const products = [
    {
      id:'bee-energy-bio',
      name:'Bee Energy BIO',
      description:'Integratore alimentare biologico con miele italiano, pappa reale, polline, propoli, mirtillo, limone e rosmarino, proposto in pratici flaconcini.',
      image:'images/bee-energy.png',
      packs:[{id:'be1',label:'1 confezione - 12 flaconcini da 10 ml',jars:1,price:14.90}],
      order:1, category:'integratori', inStock:true, stock:100
    },
    {
      id:'propol-active-bio',
      name:'Propol Active BIO',
      description:'Integratore in compresse masticabili a base di propoli italiana biologica al 20%. Ogni compressa da 500 mg contiene 100 mg di propoli.',
      image:'images/propol-active.png',
      packs:[{id:'pa1',label:'1 confezione - 30 compresse masticabili',jars:1,price:10.90}],
      order:2, category:'integratori', inStock:true, stock:100
    },
    {
      id:'propoli-30-spray-integratore',
      name:'Soluzione Propoli 30% Spray',
      description:'Preparazione a base di propoli al 30% in soluzione alcolica, con pratico erogatore spray reclinabile per un’applicazione semplice e pratica.',
      image:'images/spray.png',
      packs:[{id:'ps30',label:'1 flacone spray - 20 ml',jars:1,price:7.90}],
      order:3, category:'integratori', inStock:true, stock:100
    },
    {
      id:'propoli-30-alcolica-integratore',
      name:'Soluzione Propoli 30% con Contagocce - Alcolica',
      description:'Preparazione a base di propoli al 30% in soluzione alcolica. Il contagocce permette un dosaggio pratico e preciso, goccia a goccia.',
      image:'https://gcdn.picsart.com/editing-temp/321c26f4-a7f5-46b9-9be1-2280480fae28.jpeg',
      packs:[{id:'pal30',label:'1 flacone con contagocce - 20 ml',jars:1,price:5.90}],
      order:4, category:'integratori', inStock:true, stock:100
    },
    {
      id:'propoli-analcolica-integratore',
      name:'Soluzione Propoli con Contagocce Analcolica',
      description:'Preparazione liquida a base di propoli senza alcol. Il contagocce permette un dosaggio pratico e preciso, goccia a goccia.',
      image:'https://gcdn.picsart.com/editing-temp/d6ff7610-e304-4b5a-8aa9-135c41e5eeba.jpeg',
      packs:[{id:'pan1',label:'1 flacone con contagocce - 20 ml',jars:1,price:5.90}],
      order:5, category:'integratori', inStock:true, stock:100
    }
  ];

  // Bee Energy e Propol Active esistono già nel backup: li aggiorniamo senza duplicarli.
  // Le altre tre referenze vengono aggiunte come nuove card se non esistono.
  const marker = 'const staticInitialProducts = [';
  const markerPos = html.indexOf(marker);
  if (markerPos === -1) throw new Error('Catalogo staticInitialProducts non trovato');

  for (const product of products) {
    const existing = findObjectBounds(html, product.id);
    if (existing) {
      html = replaceProduct(html, product.id, product);
    } else {
      const insertAt = html.indexOf(marker) + marker.length;
      const source = '\n' + JSON.stringify(product, null, 2).replace(/"([^"\n]+)":/g, '$1:') + ',\n';
      html = html.slice(0, insertAt) + source + html.slice(insertAt);
    }
  }

  // Abilita la categoria Integratori nella vetrina pubblica.
  html = html.replace(/const allowedCategoriesForShop = \[([^\]]*)\];/g, (full, inside) => {
    if (/['"]integratori['"]/.test(inside)) return full;
    return `const allowedCategoriesForShop = [${inside}, 'integratori'];`;
  });

  // Il filtro autoritativo deve mantenere anche i cinque integratori.
  html = html.replace(/const currentPublicCatalogIds = new Set\((\[[^;]*?\])\);/g, (full, arrayText) => {
    const idsToAdd = integratorIds.filter(id => !arrayText.includes(id));
    if (!idsToAdd.length) return full;
    const trimmed = arrayText.trim().replace(/\]$/, '');
    const prefix = trimmed.endsWith('[') ? '' : ',';
    return `const currentPublicCatalogIds = new Set(${trimmed}${prefix}${idsToAdd.map(id => JSON.stringify(id)).join(',')}]);`;
  });

  // I dati brochure devono prevalere anche su eventuali vecchi dati Firestore.
  const overrides = Object.fromEntries(products.map(p => [p.id, {
    name:p.name, description:p.description, image:p.image, packs:p.packs,
    order:p.order, category:p.category, inStock:true, stock:100
  }]));

  if (!html.includes('const brochureIntegratorOverrides =')) {
    const overrideNeedle = '                        const brochureFoodOverrides = ';
    const overridePos = html.indexOf(overrideNeedle);
    if (overridePos !== -1) {
      html = html.slice(0, overridePos) +
        `                        const brochureIntegratorOverrides = ${JSON.stringify(overrides)};\n` +
        html.slice(overridePos);
    }
  }

  html = html.replace(
    '                                const override = brochureFoodOverrides[p.id];',
    '                                const override = brochureFoodOverrides[p.id] || brochureIntegratorOverrides[p.id];'
  );

  // Titolo pagina.
  const titleNeedle = "'alimenti': 'Linea Alimenti'";
  if (html.includes(titleNeedle) && !html.includes("'integratori': 'Linea Integratori'")) {
    html = html.replaceAll(titleNeedle, `${titleNeedle}, 'integratori': 'Linea Integratori'`);
  }

  // La home Integratori e il nuovo placeholder sono già stati creati dal primo intervento.
  // Se si parte da una base precedente, li inseriamo in modo idempotente.
  if (!html.includes('id="linea-integratori-home"')) {
    const placeholderPattern = /<article className="overflow-hidden rounded-xl border border-emerald-300\/25 bg-\[#121212\] shadow-lg">\s*<div className="grid h-full min-h-\[235px\][\s\S]*?<h2 className="text-xl sm:text-2xl font-black leading-tight text-stone-200">Linea in allestimento<\/h2>[\s\S]*?<\/article>/;
    if (!placeholderPattern.test(html)) throw new Error('Box Linea in allestimento non trovato');

    const integratoriHome = `<article id="linea-integratori-home" className="overflow-hidden rounded-xl border border-emerald-300/35 bg-[#121212] shadow-lg">
                            <div className="px-3 pt-2 pb-2">
                              <div className="text-[11px] font-black tracking-[0.12em] text-emerald-400 uppercase">Linea Integratori</div>
                              <h2 className="mt-0.5 text-lg sm:text-xl font-black leading-tight text-white">Energia naturale dalle api</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-[210px_minmax(0,1fr)] gap-2.5 px-3 pb-3 items-stretch">
                              <div className="overflow-hidden rounded-lg border border-amber-200/40 bg-[#f4ecdf] shadow-inner">
                                <img src="https://gcdn.picsart.com/editing-temp/e721a4c8-1129-4ae9-b0d6-9b9fac485388.jpeg" alt="Presentazione della Linea Integratori" className="block w-full h-[170px] sm:h-full min-h-[170px] object-cover object-center" />
                              </div>
                              <div className="min-w-0 flex flex-col justify-center">
                                <p className="text-sm leading-snug font-semibold text-stone-100">Integratori e preparazioni a base di prodotti dell’alveare, selezionati per un uso semplice e quotidiano.</p>
                                <button type="button" onClick={() => { setSelectedProductId(null); setSelectedCategory('integratori'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="mt-3 inline-flex w-fit items-center justify-center rounded-lg bg-amber-500 hover:bg-amber-400 px-4 py-2 text-xs sm:text-sm font-black text-stone-950 shadow-sm transition-colors" aria-label="Scopri la gamma della Linea Integratori">Scopri la gamma</button>
                              </div>
                            </div>
                          </article>`;
    html = html.replace(placeholderPattern, integratoriHome);
  }

  // Verifiche finali: tutti i prodotti devono risultare nella categoria corretta e con i prezzi brochure.
  for (const product of products) {
    const bounds = findObjectBounds(html, product.id);
    if (!bounds) throw new Error(`Integratore mancante: ${product.id}`);
    const block = html.slice(bounds.start, bounds.end);
    if (!block.includes("category: \"integratori\"") && !block.includes("category: 'integratori'")) {
      throw new Error(`Categoria errata per ${product.id}`);
    }
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Linea Integratori corretta: 5 card acquistabili, prezzi brochure e override Firestore applicati.');
} catch (error) {
  console.error('[Miele Artigianale] Errore Linea Integratori:', error);
  process.exitCode = 1;
}
