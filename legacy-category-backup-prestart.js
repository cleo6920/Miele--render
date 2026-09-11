const fs = require('fs');
const path = require('path');

// Le vecchie card categoria restano nel sorgente come backup, ma non vengono piu
// mostrate nella sola griglia categorie storica della home. Le griglie prodotto
// NON devono essere coinvolte da questo CSS.
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

  // Identifica in modo univoco SOLO la vecchia griglia CategorySelection della home.
  const legacyGridId = 'legacy-category-grid-backup';
  const legacyGridNeedle = '<div className="grid category-grid">';
  const legacyGridTagged = `<div id="${legacyGridId}" className="grid category-grid">`;

  if (!html.includes(legacyGridTagged)) {
    const first = html.indexOf(legacyGridNeedle);
    if (first === -1) throw new Error('Griglia categorie storica non trovata');
    html = html.slice(0, first) + legacyGridTagged + html.slice(first + legacyGridNeedle.length);
  }

  const styleId = 'legacy-category-backup-only-bacheca';
  const css = `<style id="${styleId}">
/* SOLO la vecchia griglia categorie della home: tutto in backup tranne la Bacheca. */
#${legacyGridId} > .card {
  display: none !important;
}
#${legacyGridId} > .card.category-wide {
  display: block !important;
  grid-column: 1 / -1 !important;
  width: 100% !important;
  min-width: 0 !important;
  max-width: 100% !important;
  margin: 0 !important;
}
</style>`;

  const existingStyle = new RegExp(`<style id="${styleId}">[\\s\\S]*?<\\/style>`, 'g');
  if (existingStyle.test(html)) {
    html = html.replace(existingStyle, css);
  } else {
    html = html.replace('</head>', `${css}\n</head>`);
  }

  if (!html.includes(newName)) {
    throw new Error('Nuovo nome Bacheca non trovato nel sorgente finale');
  }
  if (!html.includes(`id="${legacyGridId}"`)) {
    throw new Error('ID griglia storica non inserito');
  }
  if (!html.includes(`#${legacyGridId} > .card`)) {
    throw new Error('CSS Bacheca non correttamente limitato alla griglia storica');
  }
  // Guardia anti-regressione: questa patch non deve mai nascondere le card prodotto globalmente.
  if (html.includes(`${styleId}\">\n/* Vecchie categorie`) || html.includes('.category-grid > .card {\n  display: none !important;')) {
    throw new Error('Rilevata regola globale pericolosa sulle card prodotto');
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Vecchie categorie in backup SOLO nella home; griglie prodotto lasciate intatte.');
} catch (error) {
  console.error('[Miele Artigianale] Errore backup vecchie categorie/Bacheca:', error);
  process.exitCode = 1;
}
