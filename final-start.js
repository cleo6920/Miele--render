const fs = require('fs');
const path = require('path');

// Esegue integralmente la catena di startup approvata.
require('./hero2-prestart.js');

// Sezione Linea Alimenti: aggiunge soltanto la vista virtuale della gamma alimentare.
// Non interviene sulla Linea Veleno d'Api né sulle sue immagini.
require('./linea-alimenti-prestart.js');

// Ultimo controllo: la nuova Linea Benessere Veleno d'Api deve essere una categoria
// pubblica dello shop, altrimenti i suoi prodotti vengono filtrati prima del rendering.
try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const oldAllowed = "const allowedCategoriesForShop = ['busatello','prelibati','tesori','leccornie','terapia','cosmesi', 'alveoterapia'];";
  const newAllowed = "const allowedCategoriesForShop = ['busatello','prelibati','tesori','leccornie','terapia','cosmesi', 'alveoterapia', 'veleno-api'];";

  if (html.includes(oldAllowed)) {
    html = html.replaceAll(oldAllowed, newAllowed);
  }

  if (!html.includes(newAllowed)) {
    throw new Error("Categoria veleno-api non presente tra le categorie pubbliche dello shop");
  }

  const requiredIds = [
    'unguento-apis',
    'apis1-crema-viso-veleno-api',
    'apis2-siero-viso-veleno-api',
    'apis4-crema-corpo-veleno-api-manuka',
    'apis5-gommage-veleno-api-manuka',
    'bagnodoccia-veleno-oro'
  ];

  for (const id of requiredIds) {
    const present = html.includes(`\"id\": \"${id}\"`) || html.includes(`id: \"${id}\"`) || html.includes(`id: '${id}'`);
    if (!present) throw new Error(`Prodotto Veleno d'Api mancante dal catalogo finale: ${id}`);
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Linea Veleno d’Api: categoria pubblica abilitata e 6 prodotti verificati.');
} catch (error) {
  console.error('[Miele Artigianale] Errore visibilità finale Linea Veleno d’Api:', error);
  process.exitCode = 1;
}
