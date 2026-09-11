const fs = require('fs');
const path = require('path');

try {
  const indexPath = path.join(__dirname, 'index.html');
  const imageDir = path.join(__dirname, 'images');
  const imagePath = path.join(imageDir, 'candela-alveare-brochure.jpg');
  const b64Path = path.join(imageDir, 'candela-alveare-brochure.b64');

  if (!fs.existsSync(b64Path)) throw new Error('Asset base64 candela mancante');
  fs.mkdirSync(imageDir, { recursive: true });

  const imageBuffer = Buffer.from(fs.readFileSync(b64Path, 'utf8').trim(), 'base64');
  if (imageBuffer.length < 1000 || imageBuffer[0] !== 0xFF || imageBuffer[1] !== 0xD8) {
    throw new Error('Asset candela decodificato non e un JPEG valido');
  }
  fs.writeFileSync(imagePath, imageBuffer);

  let html = fs.readFileSync(indexPath, 'utf8');
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
  obj = obj.replace(/image\s*:\s*(['"])[^'"]*\1/, "image: '/images/candela-alveare-brochure.jpg'");
  if (obj === before) throw new Error('Campo image candela non trovato');

  html = html.slice(0, start) + obj + html.slice(end);
  if (!html.includes("/images/candela-alveare-brochure.jpg")) {
    throw new Error('Percorso JPEG candela non inserito');
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Candela Alveare Grande: JPEG reale della brochure applicato.');
} catch (error) {
  console.error('[Miele Artigianale] Errore fix immagine candela:', error);
  process.exitCode = 1;
}
