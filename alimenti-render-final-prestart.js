const fs = require('fs');
const path = require('path');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const foodIds = [
    'millefiori', 'melone', 'fragola', 'pesca', 'arancia',
    'castagno', 'acacia-zenzero-apinfiore', 'miele-eucalipto-apinfiore',
    'balsammiel', 'acacia', 'favo-integrale-bio', 'polline-italiano',
    'pappa-reale-italiana-bio', 'orsetti-gommosi'
  ];

  const rendererRegex = /\{products\.filter\(p => p\.category === selectedCategory\)\.sort\(\(a,b\) => a\.order - b\.order\)\.map\(product => \(/g;
  const matches = html.match(rendererRegex) || [];
  if (matches.length !== 1) {
    throw new Error(`Renderer generico prodotti atteso una volta, trovato ${matches.length}`);
  }

  const foodIdsLiteral = JSON.stringify(foodIds);
  const replacement = `{products.filter(p => selectedCategory === 'alimenti' ? ${foodIdsLiteral}.includes(p.id) : p.category === selectedCategory).sort((a,b) => a.order - b.order).map(product => (`;
  html = html.replace(rendererRegex, replacement);

  if (!html.includes("selectedCategory === 'alimenti' ?")) {
    throw new Error('Ramo finale Linea Alimenti non applicato');
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Linea Alimenti finale: renderer dedicato attivo per 14 referenze, senza modificare filtri o altre linee.');
} catch (error) {
  console.error('[Miele Artigianale] Errore renderer finale Linea Alimenti:', error);
  process.exitCode = 1;
}
