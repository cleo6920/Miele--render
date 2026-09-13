const fs = require('fs');
const path = require('path');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  // Elimina eventuali vecchi script DOM usati nei tentativi precedenti.
  html = html.replace(/\s*<script id="tris-alveare-category-slogan">[\s\S]*?<\/script>\s*/g, '\n');

  const gridNeedle = '<div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">';
  const sloganJsx = `{selectedCategory === 'tris-alveare' && (\n                                            <div data-tris-category-slogan="true" className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-amber-300 font-extrabold text-lg leading-snug">\n                                                Vivi un’esperienza a 360° e ottimizza la spedizione con i nostri tris.\n                                            </div>\n                                        )}\n\n                                        ${gridNeedle}`;

  let replaced = 0;
  html = html.replaceAll(gridNeedle, () => {
    replaced++;
    return sloganJsx;
  });

  if (replaced === 0) throw new Error('Griglia prodotti categoria non trovata');
  if (!html.includes("selectedCategory === 'tris-alveare'")) throw new Error('Condizione categoria tris non inserita');
  if (!html.includes('Vivi un’esperienza a 360° e ottimizza la spedizione con i nostri tris.')) throw new Error('Testo slogan non inserito');

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log(`[Miele Artigianale] Slogan I Tris dell’Alveare inserito direttamente nel renderer categoria (${replaced} punti aggiornati).`);
} catch (error) {
  console.error('[Miele Artigianale] Errore slogan I Tris dell’Alveare:', error);
  process.exitCode = 1;
}
