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
  const foodLiteral = JSON.stringify(foodIds);

  // 1) Corregge tutti i percorsi reali che alimentano setProducts:
  // Firebase assente, auth fallback, STOCK_MODE statico e merge Firestore.
  let productFilterCount = 0;
  html = html.replace(
    /const filtered = (staticInitialProducts|mergedProducts|brochureReadyProducts)\.filter\(p => allowedCategoriesForShop\.includes\(p\.category\)(?: \|\| \[[^\n;]*?\]\.includes\(p\.id\))?\);/g,
    (full, sourceName) => {
      productFilterCount++;
      return `const filtered = ${sourceName}.filter(p => allowedCategoriesForShop.includes(p.category) || ${foodLiteral}.includes(p.id));`;
    }
  );
  if (!productFilterCount) throw new Error('Nessun filtro setProducts riconosciuto');

  // 2) Evita che gli stessi 14 prodotti siano contemporaneamente classificati come archiviati.
  html = html.replace(
    /window\.archivedProducts = (staticInitialProducts|mergedProducts|brochureReadyProducts)\.filter\(p => !allowedCategoriesForShop\.includes\(p\.category\)\);/g,
    (full, sourceName) => `window.archivedProducts = ${sourceName}.filter(p => !allowedCategoriesForShop.includes(p.category) && !${foodLiteral}.includes(p.id));`
  );

  // 3) Rende "alimenti" una categoria pubblica esplicita.
  let allowedCount = 0;
  html = html.replace(/const allowedCategoriesForShop = \[([^\]]*)\];/g, (full, inside) => {
    allowedCount++;
    if (/['\"]alimenti['\"]/.test(inside)) return full;
    const cleaned = inside.trim().replace(/,\s*$/, '');
    return `const allowedCategoriesForShop = [${cleaned}${cleaned ? ', ' : ''}'alimenti'];`;
  });
  if (!allowedCount) throw new Error('allowedCategoriesForShop non trovato');

  // 4) Forza soltanto la card home Linea Alimenti ad aprire la categoria virtuale corretta.
  const articleMarker = 'id="linea-alimenti-home"';
  const markerPos = html.indexOf(articleMarker);
  if (markerPos !== -1) {
    const articleStart = html.lastIndexOf('<article', markerPos);
    const articleEndStart = html.indexOf('</article>', markerPos);
    if (articleStart !== -1 && articleEndStart !== -1) {
      const articleEnd = articleEndStart + '</article>'.length;
      let article = html.slice(articleStart, articleEnd);
      article = article.replace(/setSelectedCategory\(\s*['\"][^'\"]+['\"]\s*\)/g, "setSelectedCategory('alimenti')");
      article = article.replace(/onSelectCategory\(\s*['\"][^'\"]+['\"]\s*\)/g, "onSelectCategory('alimenti')");
      html = html.slice(0, articleStart) + article + html.slice(articleEnd);
    }
  }

  // 5) Inserisce il ramo Alimenti direttamente nel renderer ProductCard finale,
  // preservando integralmente gli eventuali rami speciali già presenti (es. Veleno d'Api).
  const rendererPrefix = '{products.filter(p =>';
  const rendererTail = ').sort((a,b) => a.order - b.order).map(product => (';
  const rendererStart = html.indexOf(rendererPrefix);
  if (rendererStart === -1) throw new Error('Renderer products.filter non trovato');
  const tailPos = html.indexOf(rendererTail, rendererStart);
  if (tailPos === -1) throw new Error('Coda renderer ProductCard non trovata');

  const exprStart = rendererStart + rendererPrefix.length;
  const currentExpr = html.slice(exprStart, tailPos).trim();
  if (!currentExpr.includes("selectedCategory === 'alimenti'")) {
    const alimentoExpr = ` selectedCategory === 'alimenti' ? ${foodLiteral}.includes(p.id) : (${currentExpr})`;
    html = html.slice(0, exprStart) + alimentoExpr + html.slice(tailPos);
  }

  // 6) Titolo pagina coerente se la mappa finale non contiene ancora Alimenti.
  const titleObjectNeedle = "'veleno-api': 'Linea Benessere Veleno d’Api'";
  if (html.includes(titleObjectNeedle) && !html.includes("'alimenti': 'Linea Alimenti'")) {
    html = html.replaceAll(titleObjectNeedle, `${titleObjectNeedle}, 'alimenti': 'Linea Alimenti'`);
  }

  // 7) Verifiche finali mirate.
  if (!html.includes("selectedCategory === 'alimenti' ?")) {
    throw new Error('Renderer virtuale Linea Alimenti non inserito');
  }
  for (const id of foodIds) {
    if (!html.includes(id)) throw new Error(`Referenza Alimenti mancante dal sorgente finale: ${id}`);
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log(`[Miele Artigianale] Linea Alimenti PASS: ${foodIds.length} referenze incluse in ${productFilterCount} percorsi setProducts e renderer dedicato attivo.`);
} catch (error) {
  console.error('[Miele Artigianale] Errore visibilità Linea Alimenti:', error);
  process.exitCode = 1;
}
