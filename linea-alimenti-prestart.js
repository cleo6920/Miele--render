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

  // Override autoritativi applicati DOPO il merge Firestore.
  // In questo modo descrizioni, prezzi, formati e foto approvate non vengono sovrascritti da dati storici.
  const foodOverrides = {
    'propolterapy-professional': {
      description: 'Diffusore professionale per alveoterapia con doppia modalità di utilizzo: diffusione nell’ambiente e utilizzo con maschera dedicata. Il sistema è dotato di ionizzatore e ventola con copertura fino a 60 m². In dotazione: maschera adulti, mascherina pediatrica e tubo di raccordo. La confezione iniziale comprende 5 capsule P+B, a base di propoli italiana 95% e Boswellia Serrata 5%.'
    },
    'capsule-pb': {
      description: 'Capsule monouso P+B dedicate ai diffusori per alveoterapia compatibili. La formulazione abbina propoli italiana al 95% e Boswellia Serrata al 5% ed è pensata per essere utilizzata esclusivamente con il dispositivo previsto. Ogni capsula si inserisce nel diffusore secondo le istruzioni dell’apparecchio e va sostituita secondo le indicazioni del produttore. Confezione pratica da 5 capsule, da conservare in luogo asciutto e lontano da fonti di calore.'
    },
    'capsule-propolit': {
      description: 'Capsule monouso di propoli per diffusori PROPOLAIR/PROPOLIT compatibili. Sono pensate per un utilizzo semplice nel diffusore dedicato, senza dover preparare miscele o dosare manualmente il prodotto. La confezione contiene 5 capsule e consente di avere ricambi pronti all’uso. Utilizzare sempre secondo le istruzioni del proprio diffusore.'
    },
    millefiori: {
      description: 'Il Millefiori dell’Oasi del Busatello nasce dalla varietà di fioriture spontanee presenti nell’oasi. Ha un profilo aromatico armonico, con dolcezza equilibrata e profumi che possono variare naturalmente da raccolto a raccolto. È ottimo da gustare al cucchiaio, sul pane, nello yogurt o per dolcificare bevande e preparazioni. La naturale cristallizzazione è una caratteristica tipica del miele e non ne altera la qualità.',
      packs: [{ id: 'p1', label: '1 vasetto (250 g)', jars: 1, price: 4.90 }], order: 1
    },
    melone: {
      description: 'Specialità al miele dal gusto dolce e fruttato, caratterizzata da note di melone piacevoli e immediate. È pensata per chi cerca un sapore originale da gustare al cucchiaio, sul pane, nello yogurt o in abbinamento a dessert e preparazioni fresche. Servita a temperatura ambiente sprigiona al meglio il suo profilo aromatico.',
      packs: [{ id: 'me1', label: '1 vasetto (250 g)', jars: 1, price: 4.90 }], order: 2
    },
    fragola: {
      description: 'Specialità al miele dal gusto morbido e fruttato, con una nota di fragola ben riconoscibile. Si presta bene alla prima colazione, allo yogurt, ai formaggi freschi e alla preparazione di dolci semplici. Il sapore dolce e profumato la rende adatta anche come piccola degustazione al cucchiaio.',
      packs: [{ id: 'fr1', label: '1 vasetto (250 g)', jars: 1, price: 4.90 }], order: 3
    },
    pesca: {
      description: 'Specialità al miele dal profilo delicato e fruttato, con una nota di pesca morbida e piacevole. È ideale da provare su pane e fette biscottate, nello yogurt, con ricotta o formaggi freschi e come accompagnamento a dessert. Il gusto rotondo la rende facile da apprezzare anche da chi preferisce sapori non troppo intensi.',
      packs: [{ id: 'pe1', label: '1 vasetto (250 g)', jars: 1, price: 4.90 }], order: 4
    },
    arancia: {
      description: 'Specialità al miele dal carattere fresco e agrumato, con note di arancia che accompagnano la naturale dolcezza del miele. È piacevole a colazione, nello yogurt, su pane e biscotti oppure in abbinamento a dolci e formaggi freschi. Ottima anche per dare una nota aromatica a bevande tiepide e preparazioni da dessert.',
      packs: [{ id: 'ar1', label: '1 vasetto (250 g)', jars: 1, price: 4.90 }], order: 5
    },
    castagno: {
      description: 'Miele dal colore ambrato scuro, dal profumo deciso e dal gusto intenso, poco dolce e con una caratteristica nota leggermente amarognola. È apprezzato da chi cerca un miele dal sapore forte e persistente. Si abbina molto bene a formaggi stagionati, pane rustico e preparazioni dal gusto marcato. La cristallizzazione, quando presente, è un fenomeno naturale.',
      image: '/images/castagno.png',
      packs: [{ id: 'c1', label: '1 vasetto (250 g)', jars: 1, price: 6.90 }], order: 6
    },
    'acacia-zenzero-apinfiore': {
      description: 'Specialità alimentare a base di miele italiano di acacia e zenzero. Il miele di acacia offre una base dolce e delicata, mentre lo zenzero aggiunge una nota speziata e vivace. È piacevole da gustare al cucchiaio, sul pane, nello yogurt o come ingrediente per bevande e ricette dal profilo aromatico originale. Formato pratico da 200 g.',
      image: '/images/acacia-zenzero-premium.jpg',
      packs: [{ id: 'az1', label: '1 vasetto (200 g)', jars: 1, price: 7.90 }], order: 7
    },
    'miele-eucalipto-apinfiore': {
      description: 'Miele italiano di eucalipto dal profumo intenso e dal gusto aromatico, con caratteristiche note fresche e balsamiche. Ha una personalità più marcata rispetto ai mieli delicati ed è adatto a chi ama sapori decisi. Si può gustare al cucchiaio, sul pane, con formaggi oppure per dolcificare bevande calde senza portarle a temperature troppo elevate.',
      image: '/images/eucalipto-premium.jpg',
      packs: [{ id: 'euca1', label: '1 vasetto (250 g)', jars: 1, price: 6.90 }], order: 8
    },
    balsammiel: {
      name: 'Balsamico Italiano - 200 g',
      description: 'Specialità alimentare dal gusto fresco e intensamente balsamico, preparata con miele di eucalipto e soluzioni idroalcoliche di pino mugo, eucalipto e menta, con eucaliptolo e mentolo. È pensata soprattutto per chi apprezza sapori aromatici e freschi, particolarmente gradevoli nella stagione fredda. Può essere consumata da sola oppure sciolta in un infuso o in una tisana, come indicato dal produttore Apinfiore.',
      image: '/images/balsam-miel-final.jpg',
      packs: [{ id: 'ba1', label: '1 vasetto (200 g)', jars: 1, price: 11.90 }], order: 9
    },
    acacia: {
      name: 'Miele Italiano di Acacia - 40 g',
      description: 'Miele italiano di acacia dal colore molto chiaro, dal profumo delicato e dal gusto dolce e fine. Rimane generalmente liquido a lungo e per questo è particolarmente pratico da versare e dosare. È ideale a colazione, nello yogurt, sulle fette biscottate e per dolcificare bevande senza coprirne il sapore. Il formato da 40 g è comodo anche per assaggio o regalo.',
      packs: [{ id: 'a40', label: '1 vasetto (40 g)', jars: 1, price: 2.90 }], order: 10
    },
    'favo-integrale-bio': {
      name: 'Miele Italiano di Acacia in Favo - 200 g',
      description: 'Miele di acacia presentato direttamente nel favo, per un’esperienza di degustazione molto vicina al prodotto così come viene conservato dalle api. Il favo può essere tagliato in piccoli pezzi e masticato lentamente insieme al miele. È particolarmente adatto a degustazioni, taglieri e abbinamenti con formaggi. Conservare in luogo fresco e asciutto, lontano da fonti di calore.',
      packs: [{ id: 'favo200', label: '1 confezione (200 g)', jars: 1, price: 11.90 }], order: 11
    },
    'polline-italiano': {
      name: 'Polline Italiano - 125 g',
      description: 'Polline italiano raccolto dalle api e selezionato come prodotto dell’alveare. Ha un gusto caratteristico e può essere consumato tal quale oppure aggiunto a yogurt, miele, frutta o altre preparazioni fredde. Per apprezzarne meglio aroma e consistenza è consigliabile iniziare con piccole quantità. Conservare secondo le indicazioni riportate sulla confezione.',
      image: '/images/polline-stable.svg',
      packs: [{ id: 'pol1', label: '1 confezione (125 g)', jars: 1, price: 10.90 }], order: 12
    },
    'pappa-reale-italiana-bio': {
      name: 'Pappa Reale - 10 g',
      description: 'Pappa reale fresca in formato da 10 g, prodotto dell’alveare dalla consistenza cremosa e dal gusto intenso e caratteristico. Si utilizza in piccole quantità, preferibilmente seguendo le indicazioni riportate sull’etichetta del prodotto. Per mantenere al meglio le sue caratteristiche va conservata secondo le indicazioni del produttore, generalmente in frigorifero.',
      image: '/images/pappa-reale-stable.svg',
      packs: [{ id: 'pr1', label: '1 confezione (10 g)', jars: 1, price: 6.90 }], order: 13
    },
    'orsetti-gommosi': {
      description: 'Morbide caramelle gommose dalla forma di orsetto, pensate come piccolo momento goloso. La consistenza morbida e il gusto dolce le rendono pratiche da condividere o portare con sé. Confezione da 80 g, adatta anche come idea regalo insieme ad altri prodotti della Fabbrica delle Api.',
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

  // Prezzi/formati/foto/descrizioni della brochure prevalgono anche su eventuali dati Firestore vecchi.
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
  console.log('[Miele Artigianale] Linea Alimenti: descrizioni, prezzi e foto autoritativi dopo Firestore.');
} catch (error) {
  console.error('[Miele Artigianale] Errore Linea Alimenti:', error);
  process.exitCode = 1;
}
