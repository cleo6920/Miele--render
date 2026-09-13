const fs = require('fs');
const path = require('path');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const oldBlock = '<p className="text-sm leading-snug font-semibold text-stone-100">Una selezione di 30 tris composti da tre prodotti della Fabbrica delle Api, già abbinati e pronti da acquistare.</p>';
  const newBlock = `${oldBlock}\n                                <p data-tris-home-slogan="true" className="mt-2 text-sm sm:text-base leading-snug font-extrabold text-amber-300">Vivi un’esperienza a 360° e ottimizza la spedizione con i nostri tris.</p>`;

  const before = html;
  html = html.replace(oldBlock, newBlock);

  if (html === before) throw new Error('Descrizione del box I Tris dell’Alveare non trovata');
  if (!html.includes('data-tris-home-slogan="true"')) throw new Error('Slogan del box tris non inserito');

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Slogan visibile aggiunto direttamente nel box I Tris dell’Alveare.');
} catch (error) {
  console.error('[Miele Artigianale] Errore slogan box I Tris dell’Alveare:', error);
  process.exitCode = 1;
}
