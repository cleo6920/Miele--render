const fs = require('fs');
const path = require('path');

// Esegue integralmente la catena di startup approvata.
require('./hero2-prestart.js');

// Ultimo controllo: la Linea Benessere Veleno d'Api deve restare pubblica
// e deve mantenere le foto locali definitive senza riscrivere gli oggetti prodotto.
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

  // APIS1 è volutamente escluso: la sua foto era già corretta e non viene toccata.
  const finalImageMap = {
    'unguento-apis': '/images/veleno-sos-dol.jpg',
    'apis2-siero-viso-veleno-api': '/images/veleno-apis2.jpg',
    'apis4-crema-corpo-veleno-api-manuka': '/images/veleno-apis4.jpg',
    'apis5-gommage-veleno-api-manuka': '/images/veleno-apis5.jpg',
    'bagnodoccia-veleno-oro': '/images/veleno-apis7.jpg'
  };

  function validateJpeg(relativeUrl) {
    const imagePath = path.join(__dirname, relativeUrl.replace(/^\//, ''));
    if (!fs.existsSync(imagePath)) throw new Error(`Foto prodotto non trovata: ${relativeUrl}`);
    const image = fs.readFileSync(imagePath);
    if (image.length < 1000 || image[0] !== 0xff || image[1] !== 0xd8 || image[image.length - 2] !== 0xff || image[image.length - 1] !== 0xd9) {
      throw new Error(`Foto JPEG non valida o incompleta: ${relativeUrl}`);
    }
  }

  function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function replaceImageForId(source, id, newImage) {
    validateJpeg(newImage);
    const safeId = escapeRegex(id);
    let replacements = 0;

    const doubleQuoted = new RegExp(`((?:\"id\"|id)\\s*:\\s*\"${safeId}\"[\\s\\S]{0,6000}?(?:\"image\"|image)\\s*:\\s*)\"[^\"]*\"`, 'g');
    source = source.replace(doubleQuoted, (match, prefix) => {
      replacements++;
      return `${prefix}\"${newImage}\"`;
    });

    const singleQuoted = new RegExp(`((?:'id'|id)\\s*:\\s*'${safeId}'[\\s\\S]{0,6000}?(?:'image'|image)\\s*:\\s*)'[^']*'`, 'g');
    source = source.replace(singleQuoted, (match, prefix) => {
      replacements++;
      return `${prefix}'${newImage}'`;
    });

    if (replacements < 1) {
      throw new Error(`Campo immagine non aggiornato per ${id}`);
    }
    return { source, replacements };
  }

  const replacementCounts = {};
  for (const [id, imageUrl] of Object.entries(finalImageMap)) {
    const result = replaceImageForId(html, id, imageUrl);
    html = result.source;
    replacementCounts[id] = result.replacements;
  }

  const apis1Image = 'https://www.apinfiore.com/wp-content/uploads/2023/03/Crema-Viso-al-Veleno-dApi_web-41.jpg.webp';
  if (!html.includes(apis1Image)) {
    throw new Error('Foto APIS1 approvata non presente: nessuna modifica viene salvata');
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Linea Veleno d’Api: categoria pubblica abilitata e 6 prodotti verificati.');
  console.log('[Miele Artigianale] Foto locali applicate con sostituzione mirata, senza riscrivere gli oggetti prodotto:', replacementCounts);
} catch (error) {
  console.error('[Miele Artigianale] Errore controllo finale Linea Veleno d’Api:', error);
  process.exitCode = 1;
}
