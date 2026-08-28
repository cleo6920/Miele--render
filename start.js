const fs = require('fs');
const path = require('path');

const BALSAM_IMAGE = '/images/balsam-miel-final.jpg';
const BALSAM_PLACEHOLDER = 'https://placehold.co/400x400/A52A2A/FFFFFF?text=Balsammiel';
const ACACIA_PLACEHOLDER = 'https://placehold.co/400x400/ADD8E6/00008B?text=Miele%20Acacia';
const ACACIA_BASE64_FILE = path.join(__dirname, 'images', 'acacia-tiny-valid.b64');

const MILLEFIORI_OLD_PROMO = '{ id: "p12", label: "12 vasetti (250g cad.)", jars: 12, price: 55.00, originalPrice: 12 * 5.00 },';
const MILLEFIORI_TRIS = '{ id: "p-tris-dolce-risveglio", label: "⭐ Tris Dolce Risveglio", jars: 1, price: 30.00 },';
const MILLEFIORI_TRIS_HINT = 'Miele Millefiori + Bee Energy – Tonico BIO + Polline Italiano • Stessa spedizione del singolo prodotto';

let ACACIA_IMAGE = '/images/acacia-shop-v2.jpg';
try {
  const base64 = fs.readFileSync(ACACIA_BASE64_FILE, 'utf8').replace(/\s+/g, '');
  const jpegBuffer = Buffer.from(base64, 'base64');
  const validJpeg = jpegBuffer.length > 1000 && jpegBuffer[0] === 0xff && jpegBuffer[1] === 0xd8 && jpegBuffer[jpegBuffer.length - 2] === 0xff && jpegBuffer[jpegBuffer.length - 1] === 0xd9;
  if (!validJpeg) throw new Error('Acacia JPEG validation failed');
  ACACIA_IMAGE = `data:image/jpeg;base64,${base64}`;
} catch (error) {
  console.error('[Miele Artigianale] Errore preparazione immagine Acacia valida:', error);
}

const indexPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
html = html.replaceAll(BALSAM_PLACEHOLDER, BALSAM_IMAGE);
html = html.replaceAll(ACACIA_PLACEHOLDER, ACACIA_IMAGE);
html = html.replaceAll('/images/acacia-shop-v2.jpg', ACACIA_IMAGE);

// Pilot bundle: replace only the old 12-jar Millefiori promo with the 3-product tris.
const millefioriPromoCount = html.split(MILLEFIORI_OLD_PROMO).length - 1;
if (millefioriPromoCount > 0) {
  html = html.replaceAll(MILLEFIORI_OLD_PROMO, MILLEFIORI_TRIS);
  const trisPackEnd = `${MILLEFIORI_TRIS}\n                    ],`;
  const trisPackWithHint = `${MILLEFIORI_TRIS}\n                    ],\n                    shippingHints: [\n                        { packId: "p-tris-dolce-risveglio", label: "${MILLEFIORI_TRIS_HINT}" }\n                    ],`;
  html = html.replaceAll(trisPackEnd, trisPackWithHint);
  console.log(`[Miele Artigianale] Tris Millefiori attivato in ${millefioriPromoCount} definizione/i.`);
} else {
  console.warn('[Miele Artigianale] Promo Millefiori 12 vasetti non trovata: nessuna modifica bundle applicata.');
}

// Keep static product images authoritative while leaving all other Firestore fields untouched.
const mergeNeedle = `? { ...staticProduct, ...firestoreProductsMap.get(staticProduct.id) }\n                                : staticProduct;`;
const mergeReplacement = `? { ...staticProduct, ...firestoreProductsMap.get(staticProduct.id), image: staticProduct.image }\n                                : staticProduct;`;
if (html.includes(mergeNeedle)) {
  html = html.replaceAll(mergeNeedle, mergeReplacement);
}
fs.writeFileSync(indexPath, html, 'utf8');

// Point every legacy Balsam fallback to the verified local image.
const serverPath = path.join(__dirname, 'server.js');
let server = fs.readFileSync(serverPath, 'utf8');
server = server
  .replaceAll("includes('/images/balsam-miel.jpg')", `includes('${BALSAM_IMAGE}')`)
  .replaceAll("img.src='/images/balsam-miel.jpg'", `img.src='${BALSAM_IMAGE}'`)
  .replaceAll("html.replaceAll('https://placehold.co/400x400/A52A2A/FFFFFF?text=Balsammiel','/images/balsam-miel.jpg')", `html.replaceAll('https://placehold.co/400x400/A52A2A/FFFFFF?text=Balsammiel','${BALSAM_IMAGE}')`)
  .replaceAll("image: '/images/balsam-miel.jpg'", `image: '${BALSAM_IMAGE}'`);
fs.writeFileSync(serverPath, server, 'utf8');

console.log('[Miele Artigianale] Immagini pronte:', { balsam: BALSAM_IMAGE, acacia: ACACIA_IMAGE.startsWith('data:image/') ? 'inline-valid-jpeg' : ACACIA_IMAGE });
require('./server.js');
