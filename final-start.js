const fs = require('fs');
const path = require('path');

// Esegue integralmente la catena di startup approvata.
require('./hero2-prestart.js');

// Sezione Linea Alimenti: aggiunge soltanto la vista virtuale della gamma alimentare.
// Non interviene sulla Linea Veleno d'Api né sulle sue immagini.
require('./linea-alimenti-prestart.js');

// Fix immagini Linea Alimenti: rende autoritative le foto brochure per tutte le 14 referenze
// ed elimina la dipendenza dai vecchi URL esterni delle card storiche.
require('./alimenti-images-fix-prestart.js');

// Linea Integratori: aggiunge i 5 prodotti della brochure, il box di presentazione
// e prepara un nuovo box "Linea in allestimento" per la prossima linea.
require('./linea-integratori-prestart.js');

// Su un deploy pulito il prestart Integratori può consumare il placeholder esistente:
// lo ripristiniamo in modo isolato prima di costruire la linea successiva.
require('./linea-placeholder-prestart.js');

// Linea Cosmesi e Tesori in Cera d'Api: aggiunge 8 nuove card, immagini locali,
// trasforma il box successivo agli Integratori e ricrea il placeholder per la prossima linea.
require('./linea-cosmesi-cera-prestart.js');

// Applica la foto di presentazione nitida approvata senza modificare prodotti o prezzi.
require('./linea-cosmesi-hero-image-prestart.js');

// Candela Alveare Grande: sostituisce la vecchia immagine artefatta con il ritaglio
// realistico estratto direttamente dalla brochure ufficiale.
require('./candela-alveare-image-prestart.js');

// Linea I Tesori di Francesco: aggiunge la nuova sezione e le 3 card acquistabili
// usando immagini ricavate dalla brochure e prezzo al pubblico di 5,90 euro.
require('./linea-tesori-francesco-prestart.js');

// Fit immagini applicato direttamente nel renderer ProductCard per le referenze che
// devono essere mostrate interamente, senza dipendere da CSS o URL immagine.
require('./product-card-render-fit-prestart.js');

// Offerte Tris: aggiunge alle 30 referenze vendibili la scelta singola oppure tris,
// con composizioni e totali del PDF commerciale e una sola spedizione per il tris.
require('./tris-offerte-prestart.js');

// Le vecchie card categoria restano nel codice come backup; nella griglia pubblica
// rimane soltanto La Bacheca della Galena delle Api. Il CSS e' limitato alla home.
require('./legacy-category-backup-prestart.js');

// Correzione isolata: usa per la Propoli 30% Spray la foto corretta della brochure.
require('./propoli-spray-image-prestart.js');

// Correzione isolata del formato: "20 ml" deve stare sotto a sinistra e separato dal prezzo.
require('./propoli-spray-format-layout-prestart.js');

// Controllo finale autoritativo: categorie e referenze essenziali devono restare pubbliche
// indipendentemente dall'ordine in cui i prestart precedenti hanno esteso gli array.
try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const mandatoryCategories = ['veleno-api', 'integratori', 'cosmesi-cera', 'tesori-francesco'];

  let allowedDefinitionCount = 0;
  html = html.replace(/const allowedCategoriesForShop = \[([^\]]*)\];/g, (full, inside) => {
    allowedDefinitionCount++;
    const values = inside.split(',').map(v => v.trim()).filter(Boolean);
    const normalized = new Set(values.map(v => v.replace(/^['\"]|['\"]$/g, '')));
    for (const category of mandatoryCategories) {
      if (!normalized.has(category)) {
        values.push(`'${category}'`);
        normalized.add(category);
      }
    }
    return `const allowedCategoriesForShop = [${values.join(', ')}];`;
  });

  if (!allowedDefinitionCount) throw new Error('Nessuna definizione allowedCategoriesForShop trovata');

  const velenoIds = [
    'unguento-apis',
    'apis1-crema-viso-veleno-api',
    'apis2-siero-viso-veleno-api',
    'apis4-crema-corpo-veleno-api-manuka',
    'apis5-gommage-veleno-api-manuka',
    'bagnodoccia-veleno-oro'
  ];

  html = html.replace(/const currentPublicCatalogIds = new Set\((\[[^;]*?\])\);/g, (full, arrayText) => {
    const missing = velenoIds.filter(id => !arrayText.includes(id));
    if (!missing.length) return full;
    const trimmed = arrayText.trim().replace(/\]$/, '');
    const separator = trimmed.endsWith('[') ? '' : ',';
    return `const currentPublicCatalogIds = new Set(${trimmed}${separator}${missing.map(id => JSON.stringify(id)).join(',')}]);`;
  });

  const requiredIds = [
    ...velenoIds,
    'tesori-limoncello',
    'tesori-liquore-caffe',
    'tesori-castagne-rum'
  ];

  for (const id of requiredIds) {
    const present = html.includes(`\"id\": \"${id}\"`) || html.includes(`id: \"${id}\"`) || html.includes(`id: '${id}'`);
    if (!present) throw new Error(`Prodotto mancante dal catalogo finale: ${id}`);
  }

  const allowedDefinitions = html.match(/const allowedCategoriesForShop = \[([^\]]*)\];/g) || [];
  for (const definition of allowedDefinitions) {
    for (const category of mandatoryCategories) {
      if (!definition.includes(`'${category}'`) && !definition.includes(`\"${category}\"`)) {
        throw new Error(`Categoria ${category} assente da una definizione finale allowedCategoriesForShop`);
      }
    }
  }

  if (html.includes('.category-grid > .card {\n  display: none !important;')) {
    throw new Error('CSS globale pericoloso sulle card categoria/prodotto rilevato');
  }
  if (!html.includes('#legacy-category-grid-backup > .card')) {
    throw new Error('CSS backup home non correttamente scoped');
  }
  if (!html.includes('object-contain rounded-xl mb-4 shadow-md bg-white p-2')) {
    throw new Error('Fit renderer ProductCard non presente nel sorgente finale');
  }
  if (!html.includes('/images/candela-alveare-brochure.jpg')) {
    throw new Error('Foto JPEG realistica della Candela Alveare Grande non presente nel catalogo finale');
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Controllo finale PASS: categorie pubbliche stabili, 6 card Veleno preservate, backup home isolato, fit ProductCard attivo e candela JPEG aggiornata.');
} catch (error) {
  console.error('[Miele Artigianale] Errore controllo finale shop:', error);
  process.exitCode = 1;
}

// Guard finale intenzionalmente unico: eventuali future modifiche alla home non devono alterare le griglie prodotto.
