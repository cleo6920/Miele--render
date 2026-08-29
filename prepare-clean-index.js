const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'index.html');
const out = path.join(__dirname, 'index-clean.html');
let html = fs.readFileSync(src, 'utf8');

const removeById = (tag, id) => {
  const re = new RegExp(`<${tag}\\s+id=["']${id}["'][^>]*>[\\s\\S]*?<\\/${tag}>`, 'gi');
  html = html.replace(re, '');
};

// Rimuove soltanto i blocchi legacy che causano i due conflitti verificati:
// 1) ricerca che viene riposizionata dopo click/focus
// 2) scheda prodotto che viene traslata verso l'alto
[
  'shop-product-search-restore',
  'shop-hero-center-swap',
  'shop-product-details-safe-compact'
].forEach(id => removeById('script', id));

// Elimina il vecchio override iniziale palesemente contraddittorio sulle card.
removeById('style', 'card-force-small');

if (!html.includes('/clean-layout.css')) {
  html = html.replace('</head>', '  <link rel="stylesheet" href="/clean-layout.css?v=1">\n</head>');
}
if (!html.includes('/clean-layout.js')) {
  html = html.replace('</body>', '  <script src="/clean-layout.js?v=1" defer></script>\n</body>');
}

fs.writeFileSync(out, html, 'utf8');
console.log('[Miele Clean] index-clean.html preparato: conflitti legacy rimossi.');
