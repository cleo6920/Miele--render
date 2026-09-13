const fs = require('fs');
const path = require('path');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const oldBlock = '<p className="text-sm leading-snug font-semibold text-stone-100">Una selezione di 30 tris composti da tre prodotti della Fabbrica delle Api, già abbinati e pronti da acquistare.</p>';
  const newBlock = `${oldBlock}\n                                <p data-tris-home-slogan="true" className="mt-2 text-sm sm:text-base leading-snug font-extrabold text-amber-300">Vivi un’esperienza a 360° e ottimizza la spedizione con i nostri tris.</p>`;

  const before = html;
  html = html.replace(oldBlock, newBlock);

  if (html === before) throw new Error('Descrizione del box I Tris dell’Alveare non trovata');
  if (!html.includes('data-tris-home-slogan="true"')) throw new Error('Slogan del box tris non inserito');

  const trisImages = {
    'tris-alveare-melone': '/images/tris-alveare-melone.webp',
    'tris-alveare-fragola': '/images/tris-alveare-fragola.webp',
    'tris-alveare-pesca': '/images/tris-alveare-pesca.webp',
    'tris-alveare-arancia': '/images/tris-alveare-arancia.webp',
    'tris-alveare-castagno': '/images/tris-alveare-castagno.webp',
    'tris-alveare-acacia-zenzero': '/images/tris-alveare-acacia-zenzero.webp',
    'tris-alveare-eucalipto': '/images/tris-alveare-eucalipto.webp',
    'tris-alveare-balsammiel': '/images/tris-alveare-balsamico-italiano.webp',
    'tris-alveare-acacia-40g': '/images/tris-alveare-acacia-40g.webp'
  };

  for (const [productId, imagePath] of Object.entries(trisImages)) {
    const idMarker = `id: "${productId}"`;
    const idPos = html.indexOf(idMarker);
    if (idPos === -1) throw new Error(`Tris non trovato per immagine dedicata: ${productId}`);

    const imageKeyPos = html.indexOf('image:', idPos);
    const packsPos = html.indexOf('packs:', idPos);
    if (imageKeyPos === -1 || packsPos === -1 || imageKeyPos > packsPos) {
      throw new Error(`Campo immagine non trovato nel tris: ${productId}`);
    }

    const quoteStart = html.indexOf('"', imageKeyPos);
    const quoteEnd = quoteStart === -1 ? -1 : html.indexOf('"', quoteStart + 1);
    if (quoteStart === -1 || quoteEnd === -1 || quoteEnd > packsPos) {
      throw new Error(`Valore immagine non valido nel tris: ${productId}`);
    }

    const currentImage = html.slice(quoteStart + 1, quoteEnd);
    if (currentImage !== '/images/hero-prodotti-corretta.jpg') {
      throw new Error(`Immagine inattesa nel tris ${productId}: ${currentImage}`);
    }

    html = html.slice(0, quoteStart + 1) + imagePath + html.slice(quoteEnd);
  }

  for (const imagePath of Object.values(trisImages)) {
    if (!html.includes(`image: "${imagePath}"`)) throw new Error(`Mapping immagine non applicato: ${imagePath}`);
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Slogan visibile aggiunto direttamente nel box I Tris dell’Alveare.');
} catch (error) {
  console.error('[Miele Artigianale] Errore slogan box I Tris dell’Alveare:', error);
  process.exitCode = 1;
}
