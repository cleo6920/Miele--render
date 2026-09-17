const fs = require('fs');
const path = require('path');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  // Mantiene le tre immagini locali già funzionanti e cambia solo la versione URL
  // per evitare cache vecchie sul browser.
  html = html.replaceAll('/images/alveo-colazioni-cover.jpg?v=preview1', '/images/alveo-colazioni-cover.jpg?v=preview6');
  html = html.replaceAll('/images/alveo-colazioni-preview-ricetta.jpg?v=preview1', '/images/alveo-colazioni-preview-ricetta.jpg?v=preview6');
  html = html.replaceAll('/images/alveo-colazioni-preview-extra.jpg?v=preview1', '/images/alveo-colazioni-preview-extra.jpg?v=preview6');

  const oldStaticBuy = '<button type="button" data-alveo-demo="colazioni" className="mt-3 rounded-lg bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-sm font-black text-stone-950">Guarda esempio</button>';
  const newStaticBuy = '<button type="button" data-alveo-buy="colazioni" className="mt-3 rounded-lg bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-sm font-black text-stone-950">Acquista PDF</button>';
  if (html.includes(oldStaticBuy)) html = html.replace(oldStaticBuy, newStaticBuy);

  html = html.replace("String(btn.textContent||'').trim()==='Acquista prova'", "String(btn.textContent||'').trim()==='Acquista PDF'");
  html = html.replace("btn.textContent='Acquista prova';", "btn.textContent='Acquista PDF';");
  html = html.replace("btn.setAttribute('aria-label','Simula acquisto di 10 Colazioni dell’Alveare');", "btn.setAttribute('aria-label','Acquista PDF 10 Colazioni dell’Alveare - simulazione Render');");

  if (!html.includes('/images/alveo-colazioni-preview-ricetta.jpg?v=preview6')) {
    throw new Error('Immagini locali dell anteprima non trovate');
  }
  if (!html.includes('Acquista PDF')) throw new Error('Pulsante Acquista PDF non applicato');

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Alveo Digitale: anteprima ripristinata con tre immagini locali, senza sprite e senza Drive.');
} catch (error) {
  console.error('[Miele Artigianale] Errore ripristino anteprima Alveo Digitale:', error);
  process.exitCode = 1;
}
