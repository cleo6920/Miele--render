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

// Linea I Tesori di Francesco: aggiunge la nuova sezione e le 3 card acquistabili
// usando immagini ricavate dalla brochure e prezzo al pubblico di 5,90 euro.
require('./linea-tesori-francesco-prestart.js');

// Offerte Tris: aggiunge alle 30 referenze vendibili la scelta singola oppure tris,
// con composizioni e totali del PDF commerciale e una sola spedizione per il tris.
require('./tris-offerte-prestart.js');

// Le vecchie card categoria restano nel codice come backup; nella griglia pubblica
// rimane soltanto La Bacheca della Galena delle Api.
require('./legacy-category-backup-prestart.js');

// Correzione isolata: usa per la Propoli 30% Spray la foto corretta della brochure.
require('./propoli-spray-image-prestart.js');

// Correzione isolata del formato: "20 ml" deve stare sotto a sinistra e separato dal prezzo.
require('./propoli-spray-format-layout-prestart.js');

// Ultimo controllo delle categorie pubbliche e delle referenze principali.
try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const oldAllowed = "const allowedCategoriesForShop = ['busatello','prelibati','tesori','leccornie','terapia','cosmesi', 'alveoterapia'];";
  const newAllowed = "const allowedCategoriesForShop = ['busatello','prelibati','tesori','leccornie','terapia','cosmesi', 'alveoterapia', 'veleno-api'];";

  if (html.includes(oldAllowed)) {
    html = html.replaceAll(oldAllowed, newAllowed);
  }

  if (!html.includes("'veleno-api'") || !html.includes("'integratori'") || !html.includes("'cosmesi-cera'") || !html.includes("'tesori-francesco'")) {
    throw new Error("Categorie veleno-api/integratori/cosmesi-cera/tesori-francesco non presenti tra le categorie pubbliche dello shop");
  }

  const requiredIds = [
    'unguento-apis',
    'apis1-crema-viso-veleno-api',
    'apis2-siero-viso-veleno-api',
    'apis4-crema-corpo-veleno-api-manuka',
    'apis5-gommage-veleno-api-manuka',
    'bagnodoccia-veleno-oro',
    'tesori-limoncello',
    'tesori-liquore-caffe',
    'tesori-castagne-rum'
  ];

  for (const id of requiredIds) {
    const present = html.includes(`\"id\": \"${id}\"`) || html.includes(`id: \"${id}\"`) || html.includes(`id: '${id}'`);
    if (!present) throw new Error(`Prodotto mancante dal catalogo finale: ${id}`);
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Linee Veleno d’Api, Integratori, Cosmesi/Cera e I Tesori di Francesco abilitate e verificate.');
} catch (error) {
  console.error('[Miele Artigianale] Errore visibilità finale linee:', error);
  process.exitCode = 1;
}
