const fs = require('fs');
const path = require('path');

const BALSAM_IMAGE = '/images/balsam-miel-final.jpg';
const BALSAM_PLACEHOLDER = 'https://placehold.co/400x400/A52A2A/FFFFFF?text=Balsammiel';
const ACACIA_IMAGE = '/images/acacia-shop-v2.jpg';
const ACACIA_PLACEHOLDER = 'https://placehold.co/400x400/ADD8E6/00008B?text=Miele%20Acacia';

const indexPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
html = html.replaceAll(BALSAM_PLACEHOLDER, BALSAM_IMAGE);
html = html.replaceAll(ACACIA_PLACEHOLDER, ACACIA_IMAGE);

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

console.log('[Miele Artigianale] Immagini locali verificate:', { balsam: BALSAM_IMAGE, acacia: ACACIA_IMAGE });
require('./server.js');
