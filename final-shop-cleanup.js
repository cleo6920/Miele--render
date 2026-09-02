const fs = require('fs');
const path = require('path');

require('./restore-alveoterapia-hero.js');

const indexPath = path.join(__dirname, 'index.html');

function findObjectBoundsAround(source, pos, minStart, maxEnd) {
  let start = source.lastIndexOf('{', pos);
  while (start >= minStart) {
    let depth = 0, quote = null, escaped = false;
    for (let i = start; i < maxEnd; i++) {
      const ch = source[i];
      if (quote) {
        if (escaped) escaped = false;
        else if (ch === '\\') escaped = true;
        else if (ch === quote) quote = null;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
      if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth === 0) {
          if (i >= pos) return { start, end: i + 1 };
          break;
        }
      }
    }
    start = source.lastIndexOf('{', start - 1);
  }
  return null;
}

function shouldRemoveLegacyName(name) {
  const n = String(name || '').trim();
  return n === 'Burro Cacao Naturale' ||
    n === 'Saponette Artigianali' ||
    /^Bagno Doccia.*Propoli/i.test(n) ||
    /^Shampoo.*Propoli.*Aloe/i.test(n) ||
    /^Shampoo.*Aloe.*Pappa Reale/i.test(n);
}

try {
  let html = fs.readFileSync(indexPath, 'utf8');
  const arrayMarker = 'const staticInitialProducts = [';
  const arrayStart = html.indexOf(arrayMarker);
  if (arrayStart < 0) throw new Error('staticInitialProducts non trovato');
  const openBracket = html.indexOf('[', arrayStart);

  // Individua la chiusura reale dell'array prodotti.
  let depth = 0, quote = null, escaped = false, arrayEnd = -1;
  for (let i = openBracket; i < html.length; i++) {
    const ch = html[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
    if (ch === '[') depth++;
    else if (ch === ']' && --depth === 0) { arrayEnd = i; break; }
  }
  if (arrayEnd < 0) throw new Error('fine staticInitialProducts non trovata');

  const nameRe = /\bname\s*:\s*(["'])(.*?)\1/g;
  let segment = html.slice(openBracket + 1, arrayEnd);
  const removals = [];
  let m;
  while ((m = nameRe.exec(segment))) {
    if (!shouldRemoveLegacyName(m[2])) continue;
    const absolutePos = openBracket + 1 + m.index;
    const bounds = findObjectBoundsAround(html, absolutePos, openBracket + 1, arrayEnd);
    if (bounds && !removals.some(r => r.start === bounds.start)) removals.push({ ...bounds, name: m[2] });
  }

  removals.sort((a,b) => b.start - a.start);
  for (const r of removals) {
    let start = r.start, end = r.end;
    while (end < html.length && /\s/.test(html[end])) end++;
    if (html[end] === ',') end++;
    else {
      let p = start - 1;
      while (p > openBracket && /\s/.test(html[p])) p--;
      if (html[p] === ',') start = p;
    }
    html = html.slice(0, start) + html.slice(end);
  }

  // Impedisce a eventuali vecchie copie Firestore di rientrare nel catalogo.
  const legacyRuntimeExpr = `!((p.name||'')==='Burro Cacao Naturale'||(p.name||'')==='Saponette Artigianali'||/^Bagno Doccia.*Propoli/i.test(p.name||'')||/^Shampoo.*Propoli.*Aloe/i.test(p.name||'')||/^Shampoo.*Aloe.*Pappa Reale/i.test(p.name||''))`;
  html = html.replaceAll(
    'mergedProducts.filter(p => allowedCategoriesForShop.includes(p.category))',
    `mergedProducts.filter(p => allowedCategoriesForShop.includes(p.category) && ${legacyRuntimeExpr})`
  );
  html = html.replaceAll(
    'staticInitialProducts.filter(p => allowedCategoriesForShop.includes(p.category))',
    `staticInitialProducts.filter(p => allowedCategoriesForShop.includes(p.category) && ${legacyRuntimeExpr})`
  );

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Vecchi blocchi sostituiti eliminati:', removals.map(r => r.name).join(', ') || 'nessuno trovato');
} catch (error) {
  console.error('[Miele Artigianale] Errore pulizia blocchi prodotto sostituiti:', error);
}
