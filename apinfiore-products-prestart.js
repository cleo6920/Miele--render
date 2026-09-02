const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.html');
const CANDLE_IMAGE = 'data:image/webp;base64,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';

function findObjectBounds(source, id) {
  const markers = [`id: "${id}"`, `id: '${id}'`];
  let p = -1;
  for (const m of markers) { const q = source.indexOf(m); if (q !== -1 && (p === -1 || q < p)) p = q; }
  if (p < 0) return null;
  let start = source.lastIndexOf('{', p), depth = 0, quote = null, escaped = false;
  if (start < 0) return null;
  for (let i = start; i < source.length; i++) {
    const ch = source[i];
    if (quote) { if (escaped) escaped = false; else if (ch === '\\') escaped = true; else if (ch === quote) quote = null; continue; }
    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
    if (ch === '{') depth++;
    else if (ch === '}' && --depth === 0) return { start, end: i + 1 };
  }
  return null;
}
function replaceProduct(source, id, objectText) {
  const b = findObjectBounds(source, id); if (!b) return source;
  return source.slice(0, b.start) + objectText + source.slice(b.end);
}
function obj(p) { return JSON.stringify(p, null, 2).replace(/"([^"\n]+)":/g, '$1:'); }

const common = { inStock: true, stock: 100 };
const existing = {
  acacia: { ...common, id:'acacia', name:'Miele di Acacia', description:'Miele italiano di Acacia. Disponibile anche nel formato 40 g previsto dalle offerte tris.', image:'https://b2b.apinfiore.com/wp-content/uploads/2019/09/miele-italiano-di-acacia-250g-1-300x300.jpg', packs:[{id:'a40',label:'1 vasetto (40 g)',jars:1,price:3.50},{id:'a1',label:'1 vasetto (250g)',jars:1,price:7.00},{id:'a12',label:'12 vasetti (250g cad.)',jars:12,price:80.00,originalPrice:84.00}], order:2, category:'prelibati' },
  'favo-integrale-bio': { ...common, id:'favo-integrale-bio', name:'Miele di Acacia in Favo', description:'Miele italiano di Acacia con favo edibile, nella confezione da 200 g.', image:'https://b2b.apinfiore.com/wp-content/uploads/2019/09/miele-italiano-di-acacia-in-favo-astuccio-da-200g-1-300x300.jpg', packs:[{id:'favo200',label:'1 confezione (200 g)',jars:1,price:10.90}], order:4, category:'tesori' },
  'spray-gola-bio': { ...common, id:'spray-gola-bio', name:'Spray Gola BIO', description:'Spray gola con propoli ed estratti vegetali per il benessere delle prime vie respiratorie.', image:'https://b2b.apinfiore.com/wp-content/uploads/2019/09/Apis_inverno-spray-gola-B-300x300-1-300x300.jpg', packs:[{id:'sgb1',label:'1 flacone (25 ml)',jars:1,price:12.00}], order:2, category:'terapia' }
};

const newProducts = [
 { ...common, id:'miele-eucalipto-apinfiore', name:'Miele Eucalipto', description:'Miele italiano di Eucalipto 250 g, aromatico e balsamico.', image:'https://b2b.apinfiore.com/wp-content/uploads/2019/09/miele-italiano-di-eucalipto-250g-1-300x300.jpg', packs:[{id:'euca1',label:'1 vasetto (250 g)',jars:1,price:6.90}], order:30, category:'prelibati' },
 { ...common, id:'acacia-zenzero-apinfiore', name:'Miele di Acacia e Zenzero', description:'Specialità alimentare a base di miele italiano di Acacia e zenzero, 200 g.', image:'https://b2b.apinfiore.com/wp-content/uploads/2020/04/c5cca5d5-miele-acacia-e-zenzero--300x300.jpg', packs:[{id:'az1',label:'1 vasetto (200 g)',jars:1,price:7.90}], order:31, category:'prelibati' },
 { ...common, id:'estratto-propoli-alcolico', name:'Estratto Propoli alcolico', description:'Estratto di Propoli 30% alcolico, formato 20 ml.', image:'https://b2b.apinfiore.com/wp-content/uploads/2019/09/propoli-italiana-alcolica-30ml-1-300x300.jpg', packs:[{id:'epa1',label:'1 flacone (20 ml)',jars:1,price:6.00}], order:20, category:'terapia' },
 { ...common, id:'propoli-30-spray', name:'Propoli 30% spray', description:'Estratto Propoli 30% alcolico spray reclinabile, formato 20 ml.', image:'https://b2b.apinfiore.com/wp-content/uploads/2020/04/08c9faf1-propolis-30ml-spray-alcolico-30ml-300x300.jpg', packs:[{id:'ps1',label:'1 spray (20 ml)',jars:1,price:7.00}], order:21, category:'terapia' },
 { ...common, id:'candela-alveare-grande', name:'Candela Alveare Grande', description:'Candela artigianale in pura cera d’api, forma alveare grande, 58 g.', image:CANDLE_IMAGE, packs:[{id:'cag1',label:'1 candela',jars:1,price:5.90}], order:20, category:'tesori' },
 { ...common, id:'burrocacao-propoli-aloe', name:'Burrocacao Propoli + Aloe', description:'Burro cacao Apinfiore con Propoli e Aloe Vera, formato 5 ml.', image:'https://www.apinfiore.com/app/uploads/2023/03/Burro-di-Cacao-Aloe-Vera-e-Propoli_web-17.jpg', packs:[{id:'bpa1',label:'1 stick (5 ml)',jars:1,price:5.00}], order:20, category:'cosmesi' },
 { ...common, id:'burrocacao-miele-pappa', name:'Burrocacao Miele + Pappa Reale', description:'Burro cacao Apinfiore con Miele e Pappa Reale, formato 5 ml.', image:'https://www.apinfiore.com/app/uploads/2023/03/Burro-Cacao-Miele-e-Pappa-Reale_web-1.jpg', packs:[{id:'bmp1',label:'1 stick (5 ml)',jars:1,price:5.00}], order:21, category:'cosmesi' },
 { ...common, id:'saponetta-frutti-rossi', name:'Saponetta Frutti di Bosco', description:'Sapone vegetale Apinfiore con Miele e Frutti Rossi, codice 233, formato 100 g.', image:'https://www.apinfiore.com/wp-content/uploads/2023/03/Saponetta-Esagonale-Frutti-Rossi_web-5.jpg.webp', packs:[{id:'sfr1',label:'1 saponetta (100 g)',jars:1,price:3.90}], order:22, category:'cosmesi' },
 { ...common, id:'saponetta-lavanda', name:'Saponetta Lavanda', description:'Sapone vegetale Apinfiore con Miele e Lavanda, formato 100 g.', image:'https://www.apinfiore.com/wp-content/uploads/2023/03/Saponetta-Esagonale-al-Miele-e-Lavandai_web-1.jpg.webp', packs:[{id:'sl1',label:'1 saponetta (100 g)',jars:1,price:3.90}], order:23, category:'cosmesi' },
 { ...common, id:'saponetta-aloe', name:'Saponetta Aloe', description:'Sapone vegetale Apinfiore con Miele e Aloe Vera, formato 100 g.', image:'https://www.apinfiore.com/wp-content/uploads/2023/03/Saponetta-Esagonale-al-Miele-e-Aloe-Vera_web-15.jpg.webp', packs:[{id:'sa1',label:'1 saponetta (100 g)',jars:1,price:3.90}], order:24, category:'cosmesi' },
 { ...common, id:'bagnodoccia-veleno-oro', name:"Bagnodoccia Veleno d'Oro", description:'Bagnodoccia Apinfiore con Veleno d’Api ed estratto di Miele, formato 250 ml.', image:'images/bagno-doccia-propoli.png', packs:[{id:'bvo1',label:'1 confezione (250 ml)',jars:1,price:14.00}], order:25, category:'cosmesi' },
 { ...common, id:'shampoo-multivitaminico', name:'Shampoo Multivitaminico', description:'Shampoo Multivitaminico Stimolante Apinfiore, formato 250 ml.', image:'https://www.apinfiore.com/app/uploads/2023/09/Shampoo-Multivitaminico-Stimolante_web-6-1.jpg', packs:[{id:'sm1',label:'1 confezione (250 ml)',jars:1,price:10.50}], order:26, category:'cosmesi' }
];

try {
  let html = fs.readFileSync(indexPath, 'utf8');
  for (const [id, p] of Object.entries(existing)) html = replaceProduct(html, id, obj(p));
  const marker = 'const staticInitialProducts = [';
  const toInsert = newProducts.filter(p => !html.includes(`id: "${p.id}"`) && !html.includes(`id: '${p.id}'`));
  if (toInsert.length) {
    const pos = html.indexOf(marker);
    if (pos < 0) throw new Error('staticInitialProducts marker missing');
    const insertion = '\n' + toInsert.map(p => obj(p)).join(',\n') + ',\n';
    html = html.slice(0, pos + marker.length) + insertion + html.slice(pos + marker.length);
  }
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log(`[Miele Artigianale] Catalogo Apinfiore aggiornato: ${Object.keys(existing).length} schede aggiornate, ${toInsert.length} nuove schede.`);
} catch (error) {
  console.error('[Miele Artigianale] Errore aggiornamento prodotti Apinfiore:', error);
}

require('./tris-catalog-prestart.js');
