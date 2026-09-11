const fs = require('fs');
const path = require('path');

// Le vecchie card categoria restano nel sorgente come backup, ma non vengono piu
// mostrate nella griglia pubblica. Rimane visibile solo la Bacheca.
try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const newName = 'La Bacheca della Galena delle Api';
  const oldNames = [
    "La Bacheca de L' Italiano",
    'La Bacheca de L’ Italiano',
    "La Bacheca dell' Italiano",
    'La Bacheca dell’ Italiano'
  ];

  for (const oldName of oldNames) {
    html = html.split(oldName).join(newName);
  }

  const styleId = 'legacy-category-backup-only-bacheca';
  if (!html.includes(`id="${styleId}"`)) {
    const css = `<style id="${styleId}">
/* Vecchie categorie conservate come backup: in vetrina resta solo la Bacheca. */
.category-grid > .card {
  display: none !important;
}
.category-grid > .card.category-wide {
  display: block !important;
  grid-column: 1 / -1 !important;
  width: 100% !important;
  min-width: 0 !important;
  max-width: 100% !important;
  margin: 0 !important;
}
</style>`;
    html = html.replace('</head>', `${css}\n</head>`);
  }

  if (!html.includes(newName)) {
    throw new Error('Nuovo nome Bacheca non trovato nel sorgente finale');
  }
  if (!html.includes(styleId)) {
    throw new Error('CSS backup vecchie categorie non inserito');
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Vecchie card categoria mantenute in backup; visibile solo La Bacheca della Galena delle Api.');
} catch (error) {
  console.error('[Miele Artigianale] Errore backup vecchie categorie/Bacheca:', error);
  process.exitCode = 1;
}
