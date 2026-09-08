const fs = require('fs');
const path = require('path');

// Ricostruisce come JPEG locale l'immagine approvata della Linea Alimenti.
try {
  const imageDir = path.join(__dirname, 'images');
  const imageSets = [
    {
      output: 'linea-alimenti-home.jpg',
      parts: ['linea-alimenti-home.p01.b64', 'linea-alimenti-home.p02.b64', 'linea-alimenti-home.p03.b64', 'linea-alimenti-home.p04.b64', 'linea-alimenti-home.p05.b64']
    }
  ];

  for (const set of imageSets) {
    const encoded = set.parts
      .map(part => fs.readFileSync(path.join(imageDir, part), 'utf8').trim())
      .join('');
    const image = Buffer.from(encoded, 'base64');
    if (image.length < 1000 || image[0] !== 0xff || image[1] !== 0xd8) {
      throw new Error(`Immagine Linea Alimenti non valida: ${set.output}`);
    }
    fs.writeFileSync(path.join(imageDir, set.output), image);
  }
  console.log('[Miele Artigianale] Immagine presentazione Linea Alimenti ricostruita in alta qualità.');
} catch (error) {
  console.error('[Miele Artigianale] Errore ricostruzione immagini Linea Alimenti:', error);
  process.exitCode = 1;
}

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

  // Per le referenze gia esistenti manteniamo testi correnti e prezzi della brochure.
  // Castagno, Polline 125 g e Pappa Reale 10 g usano immagini locali del repository,
  // cosi restano stabili, nitide e senza dipendenze da URL esterni.
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
      image: '/images/castagno.png',
      packs: [{ id: 'c1', label: '1 vasetto (250 g)', jars: 1, price: 6.90 }], order: 6
    },
    'acacia-zenzero-apinfiore': {
      image: '/images/acacia-zenzero-premium.jpg',
      packs: [{ id: 'az1', label: '1 vasetto (200 g)', jars: 1, price: 7.90 }], order: 7
    },
    'miele-eucalipto-apinfiore': {
      image: '/images/eucalipto-premium.jpg',
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
      image: '/images/polline-stable.svg',
      packs: [{ id: 'pol1', label: '1 confezione (125 g)', jars: 1, price: 10.90 }], order: 12
    },
    'pappa-reale-italiana-bio': {
      name: 'Pappa Reale - 10 g',
      image: '/images/pappa-reale-stable.svg',
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

  // Prezzi/formati/foto della brochure prevalgono anche su eventuali dati Firestore vecchi.
  // Il filtro viene applicato DOPO il merge Firestore: le referenze storiche restano
  // nel codice/backup, ma non possono riapparire nella vetrina pubblica.
  const filteredNeedle = '                        const filtered = mergedProducts.filter(p => allowedCategoriesForShop.includes(p.category));';
  if (!html.includes('const brochureFoodOverrides =')) {
    if (!html.includes(filteredNeedle)) throw new Error('Punto filtro catalogo finale non trovato');
    const runtimeOverride = `                        const brochureFoodOverrides = ${JSON.stringify(foodOverrides)};\n                        const currentPublicCatalogIds = new Set(${JSON.stringify(currentPublicIds)});\n                        const brochureReadyProducts = mergedProducts\n                            .filter(p => currentPublicCatalogIds.has(p.id))\n                            .map(p => {\n                                const override = brochureFoodOverrides[p.id];\n                                if (!override) return p;\n                                return {\n                                    ...p,\n                                    ...override,\n                                    image: override.image || p.image,\n                                    stock: Number.isFinite(p.stock) ? p.stock : 0,\n                                    inStock: typeof p.inStock === 'boolean' ? p.inStock : true\n                                };\n                            });\n                        const filtered = brochureReadyProducts.filter(p => allowedCategoriesForShop.includes(p.category));`;
    html = html.replace(filteredNeedle, runtimeOverride);
  }

  // Categoria virtuale Linea Alimenti: usa esclusivamente i 14 ID della brochure.
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
  console.log('[Miele Artigianale] Linea Alimenti: 14 referenze brochure, prezzi e foto autoritativi, backup esclusi dalla vetrina pubblica.');
} catch (error) {
  console.error('[Miele Artigianale] Errore Linea Alimenti:', error);
  process.exitCode = 1;
}
