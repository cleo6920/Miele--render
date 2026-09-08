const fs = require('fs');
const path = require('path');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');
  const correctImage = 'https://gcdn.picsart.com/editing-temp/40853f8d-0883-4ffd-9ffb-f5c338b33c1c.jpeg';

  const idPos = html.indexOf('propoli-30-spray-integratore');
  if (idPos === -1) throw new Error('Prodotto Propoli 30% Spray non trovato');

  const blockStart = html.lastIndexOf('{', idPos);
  const blockEnd = html.indexOf('},', idPos);
  if (blockStart === -1 || blockEnd === -1) throw new Error('Card Propoli 30% Spray non delimitata');

  let block = html.slice(blockStart, blockEnd + 1);
  block = block.replace(/image\s*:\s*['"][^'"]+['"]/, `image:'${correctImage}'`);
  html = html.slice(0, blockStart) + block + html.slice(blockEnd + 1);

  // Anche l'override brochure/Firestore deve usare la stessa immagine.
  html = html.replace(/("propoli-30-spray-integratore"\s*:\s*\{[^}]*?"image"\s*:\s*)"[^"]+"/s, `$1"${correctImage}"`);

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Foto Propoli 30% Spray corretta dalla brochure.');
} catch (error) {
  console.error('[Miele Artigianale] Errore foto Propoli 30% Spray:', error);
  process.exitCode = 1;
}
