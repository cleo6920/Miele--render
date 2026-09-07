const fs = require('fs');
const path = require('path');

// Esegue integralmente la catena di startup approvata.
require('./hero2-prestart.js');

// Ultimo controllo autoritativo della Linea Benessere Veleno d'Api.
// Questo blocco viene eseguito DOPO tutti i prestart precedenti: in questo modo
// vecchi override/Firestore non possono ripristinare immagini o categoria obsolete.
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
    const present = html.includes(`\\"id\\": \\"${id}\\"`) || html.includes(`\"id\": \"${id}\"`) || html.includes(`id: \"${id}\"`) || html.includes(`id: '${id}'`);
    if (!present) throw new Error(`Prodotto Veleno d'Api mancante dal catalogo finale: ${id}`);
  }

  // APIS1 è volutamente escluso da questa mappa: la sua fotografia è già corretta
  // e non deve essere modificata.
  const finalImageMap = {
    'unguento-apis': '/images/veleno-sos-dol.jpg',
    'apis2-siero-viso-veleno-api': '/images/veleno-apis2.jpg',
    'apis4-crema-corpo-veleno-api-manuka': '/images/veleno-apis4.jpg',
    'apis5-gommage-veleno-api-manuka': '/images/veleno-apis5.jpg',
    'bagnodoccia-veleno-oro': '/images/veleno-apis7.jpg'
  };

  function validateJpeg(relativeUrl) {
    const relativePath = relativeUrl.replace(/^\//, '');
    const imagePath = path.join(__dirname, relativePath);
    if (!fs.existsSync(imagePath)) throw new Error(`Foto prodotto non trovata: ${relativeUrl}`);
    const image = fs.readFileSync(imagePath);
    if (image.length < 1000 || image[0] !== 0xff || image[1] !== 0xd8 || image[image.length - 2] !== 0xff || image[image.length - 1] !== 0xd9) {
      throw new Error(`Foto JPEG non valida o incompleta: ${relativeUrl}`);
    }
  }

  function findProductObject(source, id, fromIndex = 0) {
    const markers = [
      `\"id\": \"${id}\"`,
      `id: \"${id}\"`,
      `id: '${id}'`,
      `'id': '${id}'`
    ];
    let markerIndex = -1;
    for (const marker of markers) {
      const q = source.indexOf(marker, fromIndex);
      if (q !== -1 && (markerIndex === -1 || q < markerIndex)) markerIndex = q;
    }
    if (markerIndex === -1) return null;

    const start = source.lastIndexOf('{', markerIndex);
    if (start === -1) return null;

    let depth = 0;
    let quote = null;
    let escaped = false;
    for (let i = start; i < source.length; i++) {
      const ch = source[i];
      if (quote) {
        if (escaped) escaped = false;
        else if (ch === '\\') escaped = true;
        else if (ch === quote) quote = null;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === '`') {
        quote = ch;
        continue;
      }
      if (ch === '{') depth++;
      else if (ch === '}' && --depth === 0) return { start, end: i + 1 };
    }
    return null;
  }

  function replaceAllProductImages(source, id, newImage) {
    validateJpeg(newImage);
    let fromIndex = 0;
    let replacements = 0;

    while (true) {
      const bounds = findProductObject(source, id, fromIndex);
      if (!bounds) break;

      const objectText = source.slice(bounds.start, bounds.end);
      const imagePattern = /(["']?image["']?\s*:\s*)(["'])(.*?)\2/;
      if (!imagePattern.test(objectText)) {
        throw new Error(`Campo image non trovato per ${id}`);
      }

      const updatedObject = objectText.replace(imagePattern, `$1\"${newImage}\"`);
      source = source.slice(0, bounds.start) + updatedObject + source.slice(bounds.end);
      fromIndex = bounds.start + updatedObject.length;
      replacements++;
    }

    if (replacements < 1) throw new Error(`Nessuna immagine aggiornata per ${id}`);
    return { source, replacements };
  }

  const replacementCounts = {};
  for (const [id, imageUrl] of Object.entries(finalImageMap)) {
    const result = replaceAllProductImages(html, id, imageUrl);
    html = result.source;
    replacementCounts[id] = result.replacements;
  }

  // Verifica esplicita: APIS1 resta sulla fotografia già approvata.
  const apis1Image = 'https://www.apinfiore.com/wp-content/uploads/2023/03/Crema-Viso-al-Veleno-dApi_web-41.jpg.webp';
  if (!html.includes(apis1Image)) {
    throw new Error('La fotografia approvata di APIS1 non è più presente: arresto per evitare una sovrascrittura involontaria');
  }

  for (const imageUrl of Object.values(finalImageMap)) {
    if (!html.includes(imageUrl)) throw new Error(`Override finale foto non applicato: ${imageUrl}`);
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Linea Veleno d’Api: categoria pubblica e 6 prodotti verificati.');
  console.log('[Miele Artigianale] Foto definitive da catalogo APINFIORE applicate dopo tutti gli override:', replacementCounts);
} catch (error) {
  console.error('[Miele Artigianale] Errore controllo finale Linea Veleno d’Api:', error);
  process.exitCode = 1;
}
