const fs = require('fs');
const path = require('path');

const BALSAM_IMAGE = '/images/balsam-miel-final.jpg';
const BALSAM_PLACEHOLDER = 'https://placehold.co/400x400/A52A2A/FFFFFF?text=Balsammiel';
const ACACIA_PLACEHOLDER = 'https://placehold.co/400x400/ADD8E6/00008B?text=Miele%20Acacia';
const ACACIA_SOURCE_FILE = path.join(__dirname, 'images', 'acacia-shop-v2.jpg');

let ACACIA_IMAGE = '/images/acacia-shop-v2.jpg';
try {
  const raw = fs.readFileSync(ACACIA_SOURCE_FILE);
  let jpegBuffer = raw;

  // Robust fallback: if the repository file ever contains base64 text instead of binary JPEG,
  // decode it before embedding it in the page.
  if (!(raw[0] === 0xff && raw[1] === 0xd8)) {
    const maybeBase64 = raw.toString('utf8').trim();
    if (maybeBase64.startsWith('/9j/')) jpegBuffer = Buffer.from(maybeBase64, 'base64');
  }

  if (jpegBuffer.length > 1000 && jpegBuffer[0] === 0xff && jpegBuffer[1] === 0xd8) {
    ACACIA_IMAGE = `data:image/jpeg;base64,${jpegBuffer.toString('base64')}`;
  }
} catch (error) {
  console.error('[Miele Artigianale] Errore preparazione immagine Acacia inline:', error);
}

const indexPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
html = html.replaceAll(BALSAM_PLACEHOLDER, BALSAM_IMAGE);
html = html.replaceAll(ACACIA_PLACEHOLDER, ACACIA_IMAGE);
html = html.replaceAll('/images/acacia-shop-v2.jpg', ACACIA_IMAGE);

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

console.log('[Miele Artigianale] Immagini pronte:', { balsam: BALSAM_IMAGE, acacia: ACACIA_IMAGE.startsWith('data:image/') ? 'inline-data-uri' : ACACIA_IMAGE });
require('./server.js');
