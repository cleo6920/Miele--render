const fs = require('fs');
const path = require('path');

// Non applicare più override concorrenti sulla parte alta della home.
// La geometria approvata è già gestita da restore-alveoterapia-hero.js
// e stable-shop-prestart.js: alveari al centro, Fabbrica delle Api a destra,
// barra di ricerca sotto il box di destra e prodotti/categorie invariati.
try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  // Pulisce soltanto eventuali residui dei tentativi successivi.
  html = html.replace(/<script id="shop-home-layout-final">[\s\S]*?<\/script>\s*/g, '');
  html = html.replace(/<style id="shop-home-header-authoritative">[\s\S]*?<\/style>\s*/g, '');

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Override home rimosso: resta attivo il layout stabile precedente.');
} catch (error) {
  console.error('[Miele Artigianale] Errore pulizia override home:', error);
}
