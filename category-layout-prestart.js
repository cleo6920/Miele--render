const fs = require('fs');
const path = require('path');

// Esegue prima tutte le regolazioni hero già approvate e avvia il server.
require('./hero-prestart.js');

// Poi rifinisce soltanto la griglia categorie generata dal prestart.
try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  html = html.replace(
    '.category-grid{grid-template-columns:repeat(3,minmax(0,190px))!important;gap:14px!important;justify-content:start!important;align-items:start!important;}',
    '.category-grid{grid-template-columns:repeat(4,minmax(0,190px))!important;gap:10px!important;justify-content:start!important;align-items:start!important;}'
  );

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Griglia categorie desktop impostata a 4 card per riga.');
} catch (error) {
  console.error('[Miele Artigianale] Errore regolazione griglia categorie:', error);
}
