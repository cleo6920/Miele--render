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

  // 1) Mantiene le 14 referenze Alimenti nel catalogo finale, anche se le loro categorie
  // storiche non coincidono con la categoria virtuale "alimenti".
  const originalFilter = '                        const filtered = brochureReadyProducts.filter(p => allowedCategoriesForShop.includes(p.category));';
  const alreadyFixedFilter = `                        const filtered = brochureReadyProducts.filter(p => allowedCategoriesForShop.includes(p.category) || ${JSON.stringify(foodIds)}.includes(p.id));`;

  if (html.includes(originalFilter)) {
    html = html.replace(originalFilter, alreadyFixedFilter);
  } else if (!html.includes(alreadyFixedFilter)) {
    throw new Error('Filtro finale catalogo Linea Alimenti non trovato');
  }

  // 2) Rende "alimenti" una categoria pubblica esplicita in ogni definizione disponibile.
  let allowedCount = 0;
  html = html.replace(/const allowedCategoriesForShop = \[([^\]]*)\];/g, (full, inside) => {
    allowedCount++;
    if (/['\"]alimenti['\"]/.test(inside)) return full;
    const cleaned = inside.trim().replace(/,\s*$/, '');
    return `const allowedCategoriesForShop = [${cleaned}${cleaned ? ', ' : ''}'alimenti'];`;
  });
  if (!allowedCount) throw new Error('allowedCategoriesForShop non trovato');

  // 3) Forza esclusivamente il pulsante della card home Linea Alimenti ad aprire
  // la categoria virtuale corretta. Non modifica i pulsanti delle altre linee.
  const articleMarker = 'id="linea-alimenti-home"';
  const markerPos = html.indexOf(articleMarker);
  if (markerPos === -1) throw new Error('Card home Linea Alimenti non trovata');

  const articleStart = html.lastIndexOf('<article', markerPos);
  const articleEndTag = '</article>';
  const articleEndStart = html.indexOf(articleEndTag, markerPos);
  if (articleStart === -1 || articleEndStart === -1) throw new Error('Confini card Linea Alimenti non trovati');

  const articleEnd = articleEndStart + articleEndTag.length;
  const beforeArticle = html.slice(0, articleStart);
  let article = html.slice(articleStart, articleEnd);
  const afterArticle = html.slice(articleEnd);

  const previousArticle = article;
  article = article.replace(/setSelectedCategory\(\s*['\"][^'\"]+['\"]\s*\)/g, "setSelectedCategory('alimenti')");
  article = article.replace(/onSelectCategory\(\s*['\"][^'\"]+['\"]\s*\)/g, "onSelectCategory('alimenti')");

  if (!article.includes("'alimenti'")) {
    throw new Error('Azione pulsante Linea Alimenti non instradata su alimenti');
  }

  html = beforeArticle + article + afterArticle;

  // 4) Il renderer dedicato deve continuare a usare esattamente i 14 ID approvati.
  if (!html.includes("selectedCategory === 'alimenti' ?")) {
    throw new Error('Renderer virtuale Linea Alimenti non presente');
  }
  for (const id of foodIds) {
    if (!html.includes(id)) throw new Error(`Referenza Alimenti mancante dal sorgente finale: ${id}`);
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log(`[Miele Artigianale] Linea Alimenti ripristinata: 14 referenze preservate; pulsante home instradato su alimenti${article === previousArticle ? ' (era già corretto)' : ''}.`);
} catch (error) {
  console.error('[Miele Artigianale] Errore visibilità Linea Alimenti:', error);
  process.exitCode = 1;
}
