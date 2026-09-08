const fs = require('fs');
const path = require('path');

// Compatibilità tra Linea Integratori e la linea successiva.
// Su un deploy pulito il prestart Integratori può sostituire il placeholder esistente
// senza ricrearne uno nuovo. Qui lo ripristiniamo subito dopo gli Integratori,
// senza modificare prodotti, prezzi o logica delle linee già funzionanti.
try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const integratoriId = 'id="linea-integratori-home"';
  const placeholderNeedle = '>Linea in allestimento</h2>';

  if (!html.includes(integratoriId)) {
    throw new Error('Box Linea Integratori non trovato');
  }

  if (!html.includes(placeholderNeedle)) {
    const idPos = html.indexOf(integratoriId);
    const articleEnd = html.indexOf('</article>', idPos);
    if (articleEnd === -1) throw new Error('Chiusura box Linea Integratori non trovata');

    const insertAt = articleEnd + '</article>'.length;
    const placeholder = `<article id="linea-prossima-home" className="overflow-hidden rounded-xl border border-emerald-300/25 bg-[#121212] shadow-lg">
                            <div className="grid h-full min-h-[235px] place-items-center px-5 py-8 text-center">
                              <div className="max-w-md">
                                <div className="text-[11px] font-black tracking-[0.12em] text-amber-400 uppercase">Prossima linea</div>
                                <h2 className="mt-2 text-xl sm:text-2xl font-black leading-tight text-stone-200">Linea in allestimento</h2>
                                <p className="mt-2 text-sm leading-snug font-semibold text-stone-400">Stiamo preparando una nuova selezione della Fabbrica delle Api.</p>
                              </div>
                            </div>
                          </article>`;

    html = html.slice(0, insertAt) + '\n' + placeholder + html.slice(insertAt);
    fs.writeFileSync(indexPath, html, 'utf8');
    console.log('[Miele Artigianale] Placeholder per la linea successiva ripristinato dopo Integratori.');
  }
} catch (error) {
  console.error('[Miele Artigianale] Errore ripristino placeholder dopo Integratori:', error);
  process.exitCode = 1;
}
