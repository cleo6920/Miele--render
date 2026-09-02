const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.html');

const TRIS_OFFERS = [
  { n:1, productId:'millefiori', base:'Miele Millefiori', price:30.80, products:['Miele Millefiori','Pane delle Api','Saponetta Lavanda'] },
  { n:2, productId:'fragola', base:'Miele Fragola', price:29.00, products:['Miele Fragola','Bee Energy','Burrocacao Miele/Pappa Reale'] },
  { n:3, productId:'melone', base:'Miele Melone', price:29.00, products:['Miele Melone','Bee Energy','Burrocacao Propoli/Aloe'] },
  { n:4, productId:'pesca', base:'Miele Pesca', price:31.80, products:['Miele Pesca','Pane delle Api','Saponetta Lavanda'] },
  { n:5, productId:'arancia', base:'Miele Arancia', price:31.80, products:['Miele Arancia','Pane delle Api','Saponetta Aloe'] },
  { n:6, productId:'acacia', base:'Miele Acacia 40 g', price:30.40, products:['Acacia 40 g','Pane delle Api','Burrocacao Propoli/Aloe'] },
  { n:7, productId:'castagno', base:'Miele Castagno', price:29.40, products:['Miele Castagno','Spray Gola BIO','Shampoo'] },
  { n:8, productId:'miele-eucalipto-apinfiore', base:'Miele Eucalipto', price:29.40, products:['Miele Eucalipto','Spray Gola BIO','Shampoo'] },
  { n:9, productId:'acacia-zenzero-apinfiore', base:'Miele di Acacia e Zenzero', price:30.40, products:['Miele di Acacia e Zenzero','Propol Active','Shampoo'] },
  { n:10, productId:'balsammiel', base:'Miele Balsamico', price:30.30, products:['Miele Balsamico','Pappa Reale','Crema Mani'] },
  { n:11, productId:'favo-integrale-bio', base:'Miele di Acacia in Favo', price:30.20, products:['Miele di Acacia in Favo','Polline','Crema Mani'] },
  { n:12, productId:'polline-italiano', base:'Polline Italiano', price:30.20, products:['Polline Italiano','Miele Balsamico','Crema Mani'] },
  { n:13, productId:'pappa-reale-italiana-bio', base:'Pappa Reale', price:30.30, products:['Pappa Reale','Miele di Acacia in Favo','Crema Mani'] },
  { n:14, productId:'estratto-propoli-alcolico', base:'Estratto Propoli alcolico', price:27.40, products:['Estratto Propoli alcolico','Miele Balsamico','Shampoo'] },
  { n:15, productId:'estratto-analcolico-bio', base:'Estratto Propoli analcolico', price:27.40, products:['Estratto Propoli analcolico','Miele di Acacia in Favo','Shampoo'] },
  { n:16, productId:'propoli-30-spray', base:'Propoli 30% spray', price:28.40, products:['Propoli 30% spray','Miele Balsamico','Shampoo'] },
  { n:17, productId:'candela-alveare-grande', base:'Candela Alveare Grande', price:27.30, products:['Candela Alveare Grande','Miele Balsamico','Shampoo'] },
  { n:18, productId:'spray-gola-bio', base:'Spray Gola BIO', price:29.30, products:['Spray Gola BIO','Miele di Acacia e Zenzero','Crema Mani'] },
  { n:19, productId:'bee-energy-bio', base:'Bee Energy BIO', price:29.80, products:['Bee Energy BIO','Miele di Acacia e Zenzero','Saponetta Frutti di Bosco'] },
  { n:20, productId:'propol-active-bio', base:'Propol Active BIO', price:28.30, products:['Propol Active BIO','Eucalipto','Crema Mani'] },
  { n:21, productId:'pane-delle-api-bio', base:'Pane delle Api BIO', price:30.40, products:['Pane delle Api BIO','Acacia 40 g','Burrocacao Miele/Pappa Reale'] },
  { n:22, productId:'orsetti-gommosi', base:'Orsetti Gommosi BIO', price:24.90, products:['Orsetti Gommosi BIO','Miele di Acacia in Favo','Shampoo'] },
  { n:23, productId:'crema-mani-aloe-propoli', base:'Crema Mani', price:30.90, products:['Crema Mani','Acacia 40 g','Bee Energy'] },
  { n:24, productId:'burrocacao-propoli-aloe', base:'Burrocacao Propoli + Aloe', price:29.90, products:['Burrocacao Propoli + Aloe','Castagno','Bee Energy'] },
  { n:25, productId:'burrocacao-miele-pappa', base:'Burrocacao Miele + Pappa Reale', price:29.90, products:['Burrocacao Miele + Pappa Reale','Eucalipto','Bee Energy'] },
  { n:26, productId:'saponetta-frutti-rossi', base:'Saponetta Frutti di Bosco', price:30.80, products:['Saponetta Frutti di Bosco','Millefiori','Pane delle Api'] },
  { n:27, productId:'saponetta-lavanda', base:'Saponetta Lavanda', price:29.80, products:['Saponetta Lavanda','Miele di Acacia e Zenzero','Bee Energy'] },
  { n:28, productId:'saponetta-aloe', base:'Saponetta Aloe', price:28.80, products:['Saponetta Aloe','Castagno','Bee Energy'] },
  { n:29, productId:'bagnodoccia-veleno-oro', base:"Bagnodoccia Veleno d'Oro", price:30.80, products:["Bagnodoccia Veleno d'Oro",'Miele di Castagno','Polline Italiano'] },
  { n:30, productId:'shampoo-multivitaminico', base:'Shampoo Multivitaminico', price:29.40, products:['Shampoo Multivitaminico','Castagno','Propol Active'] }
];

function findMatchingBracket(text, openIndex) {
  let depth = 0, quote = null, escaped = false;
  for (let i = openIndex; i < text.length; i++) {
    const ch = text[i];
    if (quote) { if (escaped) escaped = false; else if (ch === '\\') escaped = true; else if (ch === quote) quote = null; continue; }
    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
    if (ch === '[') depth++;
    else if (ch === ']' && --depth === 0) return i;
  }
  return -1;
}
function makeTrisPack(offer) {
  const id = `tris-offerta-${offer.n}`;
  return `{ id: ${JSON.stringify(id)}, label: ${JSON.stringify(`Offerta Tris - ${offer.base}`)}, jars: 1, price: ${offer.price.toFixed(2)}, isTris: true, trisBadge: "SCELTA TRIS", trisProducts: ${JSON.stringify(offer.products)}, trisShipping: "1 sola spedizione", trisImage: "" }`;
}
function injectOfferIntoProduct(source, offer) {
  const markers = [`id: "${offer.productId}"`, `id: '${offer.productId}'`];
  let cursor = 0, changed = 0;
  while (cursor < source.length) {
    let idPos = -1;
    for (const marker of markers) { const p = source.indexOf(marker, cursor); if (p !== -1 && (idPos === -1 || p < idPos)) idPos = p; }
    if (idPos === -1) break;
    const nextIdDouble = source.indexOf('id: "', idPos + 5), nextIdSingle = source.indexOf("id: '", idPos + 5);
    let nextId = nextIdDouble !== -1 && nextIdSingle !== -1 ? Math.min(nextIdDouble,nextIdSingle) : Math.max(nextIdDouble,nextIdSingle);
    const packsPos = source.indexOf('packs:', idPos);
    if (packsPos === -1 || (nextId !== -1 && packsPos > nextId)) { cursor = idPos + 5; continue; }
    const open = source.indexOf('[', packsPos);
    if (open === -1 || (nextId !== -1 && open > nextId)) { cursor = idPos + 5; continue; }
    const close = findMatchingBracket(source, open); if (close === -1) break;
    let inside = source.slice(open + 1, close).replace(/\s*\{[^{}]*\bisTris\s*:\s*true[^{}]*\}\s*,?/g, '');
    if (offer.productId === 'millefiori') inside = inside.replace(/\s*\{[^{}]*\bid\s*:\s*["']p12["'][^{}]*\}\s*,?/g, '');
    let trimmed = inside.trimEnd(); if (trimmed.trim() && !trimmed.trim().endsWith(',')) trimmed += ',';
    const indentMatch = inside.match(/\n(\s*)\{/), indent = indentMatch ? indentMatch[1] : '                        ';
    const replacement = `${trimmed}\n${indent}${makeTrisPack(offer)},\n${indent.slice(0, Math.max(0, indent.length - 4))}`;
    source = source.slice(0, open + 1) + replacement + source.slice(close);
    changed++; cursor = open + 1 + replacement.length;
  }
  return { source, changed };
}

try {
  let html = fs.readFileSync(indexPath, 'utf8'), totalInjected = 0;
  for (const offer of TRIS_OFFERS) {
    const result = injectOfferIntoProduct(html, offer); html = result.source; totalInjected += result.changed;
    if (!result.changed) console.warn(`[Miele Artigianale] Referenza tris non trovata: ${offer.productId}`);
  }
  const protectedIds = JSON.stringify(TRIS_OFFERS.map(o => o.productId));
  const mergeNeedle = `? { ...staticProduct, ...firestoreProductsMap.get(staticProduct.id) }\n                                : staticProduct;`;
  const mergeReplacement = `? { ...staticProduct, ...firestoreProductsMap.get(staticProduct.id), image: staticProduct.image, ...(${protectedIds}.includes(staticProduct.id) ? { packs: staticProduct.packs, shippingHints: staticProduct.shippingHints } : {}) }\n                                : staticProduct;`;
  if (html.includes(mergeNeedle)) html = html.replaceAll(mergeNeedle, mergeReplacement);
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log(`[Miele Artigianale] Offerte tris applicate: ${totalInjected} definizione/i su ${TRIS_OFFERS.length} referenze base.`);
} catch (error) { console.error('[Miele Artigianale] Errore applicazione offerte tris:', error); }

require('./hero-swap-prestart.js');
