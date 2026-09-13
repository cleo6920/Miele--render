const fs = require('fs');
const path = require('path');

// Ricostruisce la foto pulita della pagina introduttiva alle linee prodotto.
// Il file JPEG nel repository era danneggiato: questa copia viene rigenerata
// a ogni avvio prima che la pagina introduttiva venga preparata.
try {
  const imageDir = path.join(__dirname, 'images');
  const imagePath = path.join(imageDir, 'intro-prodotti-coupon-api.jpg');
  const parts = [
    'intro-prodotti-coupon-api.p01.b64',
    'intro-prodotti-coupon-api.p02.b64',
    'intro-prodotti-coupon-api.p03a.b64',
    'intro-prodotti-coupon-api.p03b.b64',
    'intro-prodotti-coupon-api.p04.b64'
  ];

  const encoded = parts
    .map((part) => fs.readFileSync(path.join(imageDir, part), 'utf8').trim())
    .join('');

  const image = Buffer.from(encoded, 'base64');
  if (image.length < 30000 || image[0] !== 0xff || image[1] !== 0xd8) {
    throw new Error('Foto introduzione prodotti ricostruita non valida');
  }

  fs.writeFileSync(imagePath, image);
  console.log(`[Miele Artigianale] Foto introduzione prodotti ricostruita correttamente (${image.length} byte).`);
} catch (error) {
  console.error('[Miele Artigianale] Errore ricostruzione foto introduzione prodotti:', error);
  process.exitCode = 1;
}
