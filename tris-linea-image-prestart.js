const fs = require('fs');
const path = require('path');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const replacement = '<img src="/images/tris-linea-render.jpg?v=render3" alt="Presentazione I Tris dell’Alveare"';
  const candidates = [
    '<img src="/images/hero-prodotti-corretta.jpg" alt="Presentazione I Tris dell’Alveare"',
    '<img src="/images/tris-linea-render.jpg?v=render1" alt="Presentazione I Tris dell’Alveare"',
    '<img src="/images/tris-linea-render.jpg?v=render2" alt="Presentazione I Tris dell’Alveare"',
    replacement
  ];

  for (const candidate of candidates) {
    if (html.includes(candidate)) {
      html = html.replace(candidate, replacement);
      break;
    }
  }

  if (!html.includes(replacement)) {
    throw new Error('Immagine della card I Tris dell’Alveare non trovata o non sostituita');
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Immagine linea I Tris dell’Alveare collegata al file reale su Render.');
} catch (error) {
  console.error('[Miele Artigianale] Errore immagine linea Tris:', error);
  process.exitCode = 1;
}
