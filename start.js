const fs = require('fs');
const path = require('path');

const BALSAM_IMAGE = '/images/balsam-miel-final.jpg';
const BALSAM_PLACEHOLDER = 'https://placehold.co/400x400/A52A2A/FFFFFF?text=Balsammiel';
const ACACIA_PLACEHOLDER = 'https://placehold.co/400x400/ADD8E6/00008B?text=Miele%20Acacia';
const ACACIA_BASE64_FILE = path.join(__dirname, 'images', 'acacia-tiny-valid.b64');

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
