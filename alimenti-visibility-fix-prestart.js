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

  const filterNeedle = '                        const filtered = brochureReadyProducts.filter(p => allowedCategoriesForShop.includes(p.category));';
  const fixedFilter = `                        const filtered = brochureReadyProducts.filter(p => allowedCategoriesForShop.includes(p.category) || ${JSON.stringify(foodIds)}.includes(p.id));`;

  const occurrences = html.split(filterNeedle).length - 1;
  if (occurrences !== 1) {
    throw new Error(`Filtro finale catalogo atteso una volta, trovato ${occurrences}`);
  }

  html = html.replace(filterNeedle, fixedFilter);

  if (!html.includes("selectedCategory === 'alimenti' ?")) {
    throw new Error('Renderer virtuale Linea Alimenti non presente');
  }

  for (const id of foodIds) {
    if (!html.includes(id)) throw new Error(`Referenza Alimenti mancante dal sorgente finale: ${id}`);
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Linea Alimenti: 14 referenze preservate nel catalogo finale e nuovamente visibili.');
} catch (error) {
  console.error('[Miele Artigianale] Errore visibilità Linea Alimenti:', error);
  process.exitCode = 1;
}
