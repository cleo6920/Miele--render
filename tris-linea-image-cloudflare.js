const fs = require('fs');
const path = require('path');

try {
  const imagePath = path.join(__dirname, 'images', 'tris-linea-render.jpg');
  if (!fs.existsSync(imagePath)) {
    throw new Error('File immagine Tris mancante: images/tris-linea-render.jpg');
  }

  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const replacement = '<img src="/images/tris-linea-render.jpg?v=cloudflare1" alt="Presentazione I Tris dell’Alveare"';
  const candidates = [
    '<img src="/images/hero-prodotti-corretta.jpg" alt="Presentazione I Tris dell’Alveare"',
    '<img src="/images/tris-linea-render.jpg?v=render1" alt="Presentazione I Tris dell’Alveare"',
    '<img src="/images/tris-linea-render.jpg?v=render2" alt="Presentazione I Tris dell’Alveare"',
    '<img src="/images/tris-linea-render.jpg?v=render3" alt="Presentazione I Tris dell’Alveare"',
    replacement
  ];

  let matched = false;
  for (const candidate of candidates) {
    if (html.includes(candidate)) {
      html = html.replace(candidate, replacement);
      matched = true;
      break;
    }
  }

  if (!matched || !html.includes(replacement)) {
    throw new Error('Card I Tris dell’Alveare non trovata: build interrotto per evitare una pubblicazione errata');
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Cloudflare test] Immagine I Tris dell’Alveare aggiornata con file verificato.');
} catch (error) {
  console.error('[Cloudflare test] Errore immagine linea Tris:', error);
  process.exitCode = 1;
}
