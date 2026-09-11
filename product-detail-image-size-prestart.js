const fs = require('fs');
const path = require('path');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const oldClass = 'className="w-full h-auto max-w-lg object-cover rounded-xl shadow-lg"';
  const newClass = 'className="w-full max-w-xs h-auto max-h-[380px] object-contain rounded-xl shadow-lg bg-white p-2"';

  if (html.includes(oldClass)) {
    html = html.replace(oldClass, newClass);
  } else if (!html.includes(newClass)) {
    throw new Error('Renderer immagine ProductDetailPage non trovato');
  }

  if (!html.includes(newClass)) {
    throw new Error('Ridimensionamento immagine ProductDetailPage non applicato');
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Scheda prodotto: immagine limitata a 320px, altezza massima 380px e object-contain.');
} catch (error) {
  console.error('[Miele Artigianale] Errore dimensione immagine scheda prodotto:', error);
  process.exitCode = 1;
}
