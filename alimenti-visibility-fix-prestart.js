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

  // 1) Normalizza in modo robusto il filtro finale del catalogo, qualunque sia
  // la variante prodotta dalle patch precedenti.
  const filterRegex = /(^[ \t]*)const filtered = brochureReadyProducts\.filter\(p => [^;\n]+\);/gm;
  let filterCount = 0;
  html = html.replace(filterRegex, (full, indent) => {
    filterCount++;
    return `${indent}const filtered = brochureReadyProducts.filter(p => allowedCategoriesForShop.includes(p.category) || ${JSON.stringify(foodIds)}.includes(p.id));`;
  });
  if (!filterCount) throw new Error('Filtro brochureReadyProducts non trovato nel catalogo finale');

  // 2) Rende "alimenti" una categoria pubblica esplicita in ogni definizione disponibile.
  let allowedCount = 0;
  html = html.replace(/const allowedCategoriesForShop = \[([^\]]*)\];/g, (full, inside) => {
    allowedCount++;
    if (/['\"]alimenti['\"]/.test(inside)) return full;
    const cleaned = inside.trim().replace(/,\s*$/, '');
    return `const allowedCategoriesForShop = [${cleaned}${cleaned ? ', ' : ''}'alimenti'];`;
  });
  if (!allowedCount) throw new Error('allowedCategoriesForShop non trovato');

  // 3) Forza solo la card home Linea Alimenti ad aprire la categoria corretta.
  const articleMarker = 'id="linea-alimenti-home"';
  const markerPos = html.indexOf(articleMarker);
  if (markerPos === -1) throw new Error('Card home Linea Alimenti non trovata');

  const articleStart = html.lastIndexOf('<article', markerPos);
  const articleEndStart = html.indexOf('</article>', markerPos);
  if (articleStart === -1 || articleEndStart === -1) throw new Error('Confini card Linea Alimenti non trovati');

  const articleEnd = articleEndStart + '</article>'.length;
  let article = html.slice(articleStart, articleEnd);
  article = article.replace(/setSelectedCategory\(\s*['\"][^'\"]+['\"]\s*\)/g, "setSelectedCategory('alimenti')");
  article = article.replace(/onSelectCategory\(\s*['\"][^'\"]+['\"]\s*\)/g, "onSelectCategory('alimenti')");
  if (!article.includes("'alimenti'")) throw new Error('Pulsante Linea Alimenti non instradato su alimenti');

  html = html.slice(0, articleStart) + article + html.slice(articleEnd);

  // 4) Verifiche finali mirate.
  if (!html.includes("selectedCategory === 'alimenti' ?")) {
    throw new Error('Renderer virtuale Linea Alimenti non presente');
  }
  for (const id of foodIds) {
    if (!html.includes(id)) throw new Error(`Referenza Alimenti mancante dal sorgente finale: ${id}`);
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log(`[Miele Artigianale] Linea Alimenti PASS: ${foodIds.length} referenze mantenute, filtro finale corretto e pulsante instradato su alimenti.`);
} catch (error) {
  console.error('[Miele Artigianale] Errore visibilità Linea Alimenti:', error);
  process.exitCode = 1;
}
