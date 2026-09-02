const fs = require('fs');
const path = require('path');

// Esegue prima la catena stabile corrente.
require('./stable-shop-prestart.js');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  // Legge la stessa fonte dati usata per costruire i 30 tris.
  const catalogSource = fs.readFileSync(path.join(__dirname, 'tris-catalog-prestart.js'), 'utf8');
  const start = catalogSource.indexOf('const TRIS_OFFERS = [');
  if (start < 0) throw new Error('TRIS_OFFERS non trovato');
  const open = catalogSource.indexOf('[', start);
  let depth = 0, quote = null, escaped = false, close = -1;
  for (let i = open; i < catalogSource.length; i++) {
    const ch = catalogSource[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
    if (ch === '[') depth++;
    else if (ch === ']' && --depth === 0) { close = i; break; }
  }
  if (close < 0) throw new Error('TRIS_OFFERS non chiuso');
  const offers = Function(`"use strict"; return (${catalogSource.slice(open, close + 1)});`)();
  const trisByBase = Object.fromEntries(offers.map(o => [String(o.base).trim().toLowerCase(), o.products]));
  const mapJson = JSON.stringify(trisByBase).replace(/</g, '\\u003c');

  const oldLine = `      cta.innerHTML = '<div style="font-weight:900;font-size:17px;line-height:1.05;">🔥 SCEGLI IL TRIS — PORTA A CASA DI PIÙ</div><div style="font-weight:700;font-size:12px;line-height:1.2;margin-top:4px;">3 prodotti selezionati · 1 sola spedizione</div>';`;

  const replacement = `      const trisMap = ${mapJson};\n      let productTitle = '';\n      if(productRoot){\n        const titleNode = Array.from(productRoot.querySelectorAll('h1,h2,h3,h4')).find(el => {\n          const t = (el.textContent || '').trim();\n          return t && !/scegli il formato|scelta tris|totale tris/i.test(t);\n        });\n        productTitle = titleNode ? (titleNode.textContent || '').trim().toLowerCase() : '';\n      }\n      const trisNames = trisMap[productTitle] || [];\n      const trisLine = trisNames.length ? trisNames.join(' · ') : '';\n      cta.innerHTML = '<div style="font-weight:900;font-size:17px;line-height:1.05;">🔥 SCEGLI IL TRIS — 3 PRODOTTI, STESSO COSTO DI SPEDIZIONE</div>' + (trisLine ? '<div style="font-weight:700;font-size:12px;line-height:1.25;margin-top:6px;">' + trisLine + '</div>' : '');`;

  const count = html.split(oldLine).length - 1;
  if (count !== 1) throw new Error('CTA legacy atteso una sola volta, trovato: ' + count);

  html = html.replace(oldLine, replacement);

  if (html.includes('PORTA A CASA DI PIÙ') || html.includes('3 prodotti selezionati · 1 sola spedizione')) {
    throw new Error('Testo CTA legacy ancora presente dopo la sostituzione');
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] CTA tris autoritativa: slogan definitivo + nomi dalla fonte TRIS_OFFERS.');
} catch (error) {
  console.error('[Miele Artigianale] Errore CTA tris autoritativa:', error);
}
