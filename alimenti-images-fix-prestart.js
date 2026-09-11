const fs = require('fs');
const path = require('path');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  // Foto autoritative ricavate dalla brochure approvata (pagine 4-5).
  // Completa gli override della Linea Alimenti cosi nessuna card dipende piu
  // dai vecchi URL esterni presenti nel catalogo storico.
  const imageOverrides = {
    'millefiori': 'https://gcdn.picsart.com/editing-temp/23444fe3-04b6-4f26-8d7d-a7738bdc17ce.jpeg',
    'melone': 'https://gcdn.picsart.com/editing-temp/1073f240-bae1-4993-95e4-fbf6a633bd45.jpeg',
    'fragola': 'https://gcdn.picsart.com/editing-temp/e88d2cf4-3cfb-447b-946a-5dc0834972f2.jpeg',
    'pesca': 'https://gcdn.picsart.com/editing-temp/ff9fd7f5-6d68-4a3b-9b69-c9bdef1d7b64.jpeg',
    'arancia': 'https://gcdn.picsart.com/editing-temp/a7865e63-8d1a-45bc-8de1-3e57d0ab4886.jpeg',
    'acacia': 'https://gcdn.picsart.com/editing-temp/b4aaabf6-1ed4-4b64-b23c-9e4b715cc702.jpeg',
    'favo-integrale-bio': 'https://gcdn.picsart.com/editing-temp/a3e80352-4fc0-46cc-aaf8-417548ba00ff.jpeg',
    'orsetti-gommosi': 'https://gcdn.picsart.com/editing-temp/fce1cfd3-3d55-4cc1-a941-e5c72bbe2b88.jpeg'
  };

  const marker = 'const brochureFoodOverrides = ';
  const start = html.indexOf(marker);
  if (start === -1) throw new Error('brochureFoodOverrides non trovato');
  const jsonStart = start + marker.length;
  const end = html.indexOf(';', jsonStart);
  if (end === -1) throw new Error('Fine brochureFoodOverrides non trovata');

  const current = JSON.parse(html.slice(jsonStart, end));
  for (const [id, image] of Object.entries(imageOverrides)) {
    if (!current[id]) throw new Error(`Override alimentare mancante: ${id}`);
    current[id].image = image;
  }

  // Verifica che tutte le 14 referenze abbiano ormai una immagine autoritativa.
  const required = [
    'millefiori','melone','fragola','pesca','arancia','castagno',
    'acacia-zenzero-apinfiore','miele-eucalipto-apinfiore','balsammiel',
    'acacia','favo-integrale-bio','polline-italiano','pappa-reale-italiana-bio','orsetti-gommosi'
  ];
  for (const id of required) {
    if (!current[id] || !current[id].image) {
      throw new Error(`Immagine autoritativa mancante per ${id}`);
    }
  }

  html = html.slice(0, jsonStart) + JSON.stringify(current) + html.slice(end);
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Linea Alimenti: immagini card autoritative e stabili per tutte le 14 referenze.');
} catch (error) {
  console.error('[Miele Artigianale] Errore fix immagini Linea Alimenti:', error);
  process.exitCode = 1;
}
