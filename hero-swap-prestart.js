const fs = require('fs');
const path = require('path');

// Mantiene la catena dati/layout prodotto già esistente.
require('./tris-safe-prestart.js');

// La vecchia hero-swap spostava fisicamente la barra di ricerca fuori dal DOM React
// e rilanciava più timer/observer ad ogni click. Questo causava regressioni quando
// si entrava in una categoria e si tornava alla home. La gestione hero è ora unica
// e viene applicata in restore-alveoterapia-hero.js senza reparenting dei nodi React.
try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');
  html = html.replace(/<script id="shop-hero-center-swap">[\s\S]*?<\/script>\s*/g, '');
  html = html.replace(/<script id="shop-search-hero-gap-restore">[\s\S]*?<\/script>\s*/g, '');
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Observer hero/search legacy rimossi.');
} catch (error) {
  console.error('[Miele Artigianale] Errore rimozione observer hero legacy:', error);
}
