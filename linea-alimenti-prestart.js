const fs = require('fs');
const path = require('path');

// Linea Alimenti - fonte autoritativa: brochure/referenze scelte dall'utente.
// Mantiene nel sorgente i prodotti storici come backup, ma la vetrina pubblica
// espone soltanto le linee gia pronte: Alveoterapia, Alimenti e Veleno d'Api.
try {
  const indexPath = path.join(__dirname, 'index.html');
  const imagePath = path.join(__dirname, 'images', 'linea-alimenti-home.jpg');
  if (!fs.existsSync(imagePath)) throw new Error('Immagine locale Linea Alimenti non trovata');

  let html = fs.readFileSync(indexPath, 'utf8');

  const foodIds = [
    'millefiori', 'melone', 'fragola', 'pesca', 'arancia',
    'castagno', 'acacia-zenzero-apinfiore', 'miele-eucalipto-apinfiore',
    'balsammiel', 'acacia', 'favo-integrale-bio', 'polline-italiano',
    'pappa-reale-italiana-bio', 'orsetti-gommosi'
  ];
  const alveoterapiaIds = ['propolterapy-professional', 'capsule-pb', 'capsule-propolit'];
  const velenoIds = [
    'unguento-apis', 'apis1-crema-viso-veleno-api', 'apis2-siero-viso-veleno-api',
    'apis4-crema-corpo-veleno-api-manuka', 'apis5-gommage-veleno-api-manuka',
    'bagnodoccia-veleno-oro'
  ];
  const currentPublicIds = [...alveoterapiaIds, ...foodIds, ...velenoIds];

  // Per le referenze gia esistenti manteniamo fotografie e testi correnti.
  // Sovrascriviamo soltanto prezzo/formato/ordine quando la brochure lo richiede.
  // Balsamico e Acacia 40 g richiedono anche il nome/formato pubblico corretto.
  const foodOverrides = {
    millefiori: {
      packs: [{ id: 'p1', label: '1 vasetto (250 g)', jars: 1, price: 4.90 }], order: 1
    },
    melone: {
      packs: [{ id: 'me1', label: '1 vasetto (250 g)', jars: 1, price: 4.90 }], order: 2
    },
    fragola: {
      packs: [{ id: 'fr1', label: '1 vasetto (250 g)', jars: 1, price: 4.90 }], order: 3
    },
    pesca: {
      packs: [{ id: 'pe1', label: '1 vasetto (250 g)', jars: 1, price: 4.90 }], order: 4
    },
    arancia: {
      packs: [{ id: 'ar1', label: '1 vasetto (250 g)', jars: 1, price: 4.90 }], order: 5
    },
    castagno: {
      packs: [{ id: 'c1', label: '1 vasetto (250 g)', jars: 1, price: 6.90 }], order: 6
    },
    'acacia-zenzero-apinfiore': {
      packs: [{ id: 'az1', label: '1 vasetto (200 g)', jars: 1, price: 7.90 }], order: 7
    },
    'miele-eucalipto-apinfiore': {
      packs: [{ id: 'euca1', label: '1 vasetto (250 g)', jars: 1, price: 6.90 }], order: 8
    },
    balsammiel: {
      name: 'Balsamico Italiano - 200 g',
      description: 'Preparazione alimentare a base di miele di Eucalipto, Pino Mugo e Menta, dal sapore intenso, fresco e caratteristico.',
      image: '/images/balsam-miel-final.jpg',
      packs: [{ id: 'ba1', label: '1 vasetto (200 g)', jars: 1, price: 11.90 }], order: 9
    },
    acacia: {
      name: 'Miele Italiano di Acacia - 40 g',
      packs: [{ id: 'a40', label: '1 vasetto (40 g)', jars: 1, price: 2.90 }], order: 10
    },
    'favo-integrale-bio': {
      name: 'Miele Italiano di Acacia in Favo - 200 g',
      packs: [{ id: 'favo200', label: '1 confezione (200 g)', jars: 1, price: 11.90 }], order: 11
    },
    'polline-italiano': {
      name: 'Polline Italiano - 125 g',
      packs: [{ id: 'pol1', label: '1 confezione (125 g)', jars: 1, price: 10.90 }], order: 12
    },
    'pappa-reale-italiana-bio': {
      name: 'Pappa Reale - 10 g',
      packs: [{ id: 'pr1', label: '1 confezione (10 g)', jars: 1, price: 6.90 }], order: 13
    },
    'orsetti-gommosi': {
      packs: [{ id: 'ors-gom-1', label: '1 confezione (80 g)', jars: 1, price: 3.90 }], order: 14
    }
  };

  for (const id of foodIds) {
    const present = [
      `id: \"${id}\"`, `id:\"${id}\"`, `id: '${id}'`, `id:'${id}'`,
      `\"id\": \"${id}\"`, `\"id\":\"${id}\"`
    ].some(marker => html.includes(marker));
    if (!present) throw new Error(`Referenza Linea Alimenti non trovata nel catalogo: ${id}`);
  }

  // Prezzi/formati della brochure prevalgono anche su eventuali dati Firestore vecchi.
  // Il filtro viene applicato DOPO il merge Firestore: le referenze storiche restano
  // nel codice/backup, ma non possono riapparire nella vetrina pubblica.
  const filteredNeedle = '                        const filtered = mergedProducts.filter(p => allowedCategoriesForShop.includes(p.category));';
  if (!html.includes('const brochureFoodOverrides =')) {
    if (!html.includes(filteredNeedle)) throw new Error('Punto filtro catalogo finale non trovato');
    const runtimeOverride = `                        const brochureFoodOverrides = ${JSON.stringify(foodOverrides)};\n                        const currentPublicCatalogIds = new Set(${JSON.stringify(currentPublicIds)});\n                        const brochureReadyProducts = mergedProducts\n                            .filter(p => currentPublicCatalogIds.has(p.id))\n                            .map(p => {\n                                const override = brochureFoodOverrides[p.id];\n                                if (!override) return p;\n                                return {\n                                    ...p,\n                                    ...override,\n                                    image: override.image || p.image,\n                                    stock: Number.isFinite(p.stock) ? p.stock : 0,\n                                    inStock: typeof p.inStock === 'boolean' ? p.inStock : true\n                                };\n                            });\n                        const filtered = brochureReadyProducts.filter(p => allowedCategoriesForShop.includes(p.category));`;
    html = html.replace(filteredNeedle, runtimeOverride);
  }

  // Categoria virtuale Linea Alimenti: usa esclusivamente i 14 ID della brochure,
  // senza riconoscimenti fragili basati su parole nel nome.
  const foodIdsLiteral = JSON.stringify(foodIds).replace(/\"/g, "'");
  const rendererNeedle = "{products.filter(p => selectedCategory === 'veleno-api' ?";
  if (html.includes(rendererNeedle) && !html.includes("selectedCategory === 'alimenti' ?")) {
    html = html.replaceAll(
      rendererNeedle,
      `{products.filter(p => selectedCategory === 'alimenti' ? ${foodIdsLiteral}.includes(p.id) : selectedCategory === 'veleno-api' ?`
    );
  }
  if (!html.includes("selectedCategory === 'alimenti' ?")) {
    throw new Error('Renderer Linea Alimenti non aggiornabile in sicurezza');
  }

  const titleMapNeedle = "'veleno-api': 'Linea Benessere Veleno d’Api'";
  if (html.includes(titleMapNeedle) && !html.includes("'alimenti': 'Linea Alimenti'")) {
    html = html.replaceAll(titleMapNeedle, `${titleMapNeedle}, 'alimenti': 'Linea Alimenti'`);
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Linea Alimenti: 14 referenze brochure, prezzi autoritativi e backup esclusi dalla vetrina pubblica.');
} catch (error) {
  console.error('[Miele Artigianale] Errore Linea Alimenti:', error);
  process.exitCode = 1;
}
