const fs = require('fs');
const path = require('path');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const cardId = 'linea-alveo-digitale-home';
  if (!html.includes(`id="${cardId}"`)) {
    const marker = 'id="linea-tris-alveare-home"';
    const pos = html.indexOf(marker);
    if (pos === -1) throw new Error('Card I Tris dell’Alveare non trovata come punto di inserimento');

    const endStart = html.indexOf('</article>', pos);
    if (endStart === -1) throw new Error('Fine card I Tris dell’Alveare non trovata');
    const end = endStart + '</article>'.length;

    const card = `<article id="${cardId}" className="overflow-hidden rounded-xl border border-amber-300/40 bg-[#121212] shadow-lg">
                            <div className="px-3 pt-2 pb-2">
                              <div className="text-[11px] font-black tracking-[0.12em] text-amber-400 uppercase">ALVEO DIGITALE</div>
                              <h2 className="mt-0.5 text-lg sm:text-xl font-black leading-tight text-white">Ricette, video e idee regalo da usare subito</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-[210px_minmax(0,1fr)] gap-2.5 px-3 pb-3 items-stretch">
                              <div className="min-h-[170px] rounded-lg border border-amber-200/40 bg-gradient-to-br from-amber-100 via-yellow-50 to-stone-100 shadow-inner flex flex-col items-center justify-center text-center px-4">
                                <div className="text-4xl sm:text-5xl leading-none">📖 🎬 🎁</div>
                                <div className="mt-3 text-xs font-black tracking-[0.08em] uppercase text-amber-800">Digitale · semplice · immediato</div>
                              </div>
                              <div className="min-w-0 flex flex-col justify-center">
                                <p className="text-sm leading-snug font-semibold text-stone-100">Scegli un contenuto digitale, guarda l’anteprima e scopri come funzionerà. Nessuna spedizione e nessun passaggio complicato.</p>
                                <a href="/alveo-digitale.html" className="mt-3 inline-flex w-fit items-center justify-center rounded-lg bg-amber-500 hover:bg-amber-400 px-4 py-2 text-xs sm:text-sm font-black text-stone-950 shadow-sm transition-colors" aria-label="Scopri Alveo Digitale">Scopri Alveo Digitale</a>
                              </div>
                            </div>
                          </article>`;

    html = html.slice(0, end) + '\n' + card + html.slice(end);
  }

  const oldDetector = '/^linea-(alimenti|integratori|cosmesi-cera|tesori-francesco|tris-alveare|benessere-veleno-api|veleno-api)-home$/i';
  const newDetector = '/^linea-(alimenti|integratori|cosmesi-cera|tesori-francesco|tris-alveare|alveo-digitale|benessere-veleno-api|veleno-api)-home$/i';
  if (html.includes(oldDetector)) html = html.replaceAll(oldDetector, newDetector);
  if (!html.includes(newDetector)) throw new Error('Riconoscimento Alveo Digitale nella vista linee non applicato');

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Base Alveo Digitale inserita solo su Render: card linea + pagina anteprima.');
} catch (error) {
  console.error('[Miele Artigianale] Errore base Alveo Digitale:', error);
  process.exitCode = 1;
}
