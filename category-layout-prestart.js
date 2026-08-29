const fs = require('fs');
const path = require('path');

// Esegue prima tutte le regolazioni hero già approvate e avvia il server.
require('./hero-prestart.js');

// Poi rifinisce soltanto la griglia categorie generata dal prestart.
try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const compactGridCss = `<style id="shop-category-grid-compact-final">
@media (min-width: 901px){
  .category-grid{
    grid-template-columns:repeat(4,minmax(0,155px))!important;
    gap:8px!important;
    justify-content:start!important;
    align-items:start!important;
    grid-auto-flow:row!important;
  }
  .category-grid > .card{
    grid-column:auto!important;
    grid-row:auto!important;
    width:155px!important;
    min-width:155px!important;
    max-width:155px!important;
    height:194px!important;
    min-height:194px!important;
    max-height:194px!important;
    aspect-ratio:auto!important;
    margin:0!important;
    border-radius:14px!important;
  }
  .category-grid > .card h3{
    font-size:13px!important;
    left:8px!important;
    right:8px!important;
    bottom:8px!important;
    line-height:1.08!important;
  }
}
</style>`;

  if (!html.includes('shop-category-grid-compact-final')) {
    html = html.replace('</head>', `${compactGridCss}\n</head>`);
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Griglia categorie: 4 card compatte senza span vuoti.');
} catch (error) {
  console.error('[Miele Artigianale] Errore regolazione griglia categorie:', error);
}
