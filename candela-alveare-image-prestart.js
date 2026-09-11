const fs = require('fs');
const path = require('path');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  // Versione 4x ripulita della foto reale estratta dalla brochure.
  // La fonte brochure resta il riferimento visivo del prodotto; l'enhancement elimina
  // la forte sgranatura visibile nelle card e nella scheda acquisto.
  const enhancedImageUrl = 'https://gcdn.picsart.com/cloud-storage/847c91a5-74e2-4658-acde-a86ba813dfee.png';
  const id = 'cosmesi-candela-alveare-cera-api';
  const markers = [`id: '${id}'`, `id: "${id}"`, `"id": "${id}"`];

  let p = -1;
  for (const marker of markers) {
    const q = html.indexOf(marker);
    if (q >= 0 && (p < 0 || q < p)) p = q;
  }
  if (p < 0) throw new Error('Referenza candela non trovata');

  const start = html.lastIndexOf('{', p);
  if (start < 0) throw new Error('Inizio oggetto candela non trovato');

  let depth = 0, quote = null, escaped = false, end = -1;
  for (let i = start; i < html.length; i++) {
    const ch = html[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
    if (ch === '{') depth++;
    else if (ch === '}' && --depth === 0) { end = i + 1; break; }
  }
  if (end < 0) throw new Error('Fine oggetto candela non trovata');

  let obj = html.slice(start, end);
  const before = obj;
  obj = obj.replace(/image\s*:\s*(['"])[^'"]*\1/, `image: '${enhancedImageUrl}'`);
  if (obj === before) throw new Error('Campo image candela non trovato');

  html = html.slice(0, start) + obj + html.slice(end);
  if (!html.includes(enhancedImageUrl)) {
    throw new Error('URL immagine candela migliorata non inserito');
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Candela Alveare Grande: foto brochure migliorata 4x applicata.');
} catch (error) {
  console.error('[Miele Artigianale] Errore fix immagine candela:', error);
  process.exitCode = 1;
}
