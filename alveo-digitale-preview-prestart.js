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
                                <p className="text-sm leading-snug font-semibold text-stone-100">Scegli un contenuto, guardalo e acquistalo in modo semplice. Nessuna spedizione: quando sarà attivo lo riceverai subito dopo il pagamento.</p>
                                <button type="button" data-open-alveo-digitale className="mt-3 inline-flex w-fit items-center justify-center rounded-lg bg-amber-500 hover:bg-amber-400 px-4 py-2 text-xs sm:text-sm font-black text-stone-950 shadow-sm transition-colors" aria-label="Scopri Alveo Digitale">Scopri Alveo Digitale</button>
                              </div>
                            </div>
                          </article>
                          <section id="alveo-digitale-inline-panel" className="hidden col-span-full rounded-2xl border border-amber-300/40 bg-[#111] p-4 sm:p-6 shadow-xl" aria-label="Presentazione Alveo Digitale">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
                              <div>
                                <div className="text-xs font-black tracking-[0.14em] uppercase text-amber-400">ALVEO DIGITALE</div>
                                <h2 className="mt-1 text-2xl sm:text-3xl font-black text-white">Ricette, video e regali digitali</h2>
                                <p className="mt-2 text-sm sm:text-base font-semibold text-stone-200 max-w-3xl">Scegli quello che ti piace. Guarda un esempio. Quando l’acquisto sarà attivo, dopo il pagamento potrai aprire subito il contenuto. Nessun pacco da aspettare.</p>
                              </div>
                              <button type="button" data-close-alveo-digitale className="shrink-0 rounded-lg border border-amber-300/50 px-4 py-2 text-sm font-black text-amber-300 hover:bg-stone-800">← Torna alle linee</button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <article className="rounded-xl border border-amber-200/30 bg-stone-900 p-4 flex flex-col">
                                <div className="text-4xl">📖</div>
                                <div className="mt-3 text-[11px] font-black uppercase tracking-[0.1em] text-amber-400">Ricetta digitale</div>
                                <h3 className="mt-1 text-xl font-black text-white">10 Colazioni dell’Alveare</h3>
                                <p className="mt-2 text-sm font-semibold text-stone-300">Dieci idee semplici con i nostri mieli, da aprire e leggere subito.</p>
                                <div className="mt-4 text-2xl font-black text-amber-300">€2,90</div>
                                <button type="button" data-alveo-demo="colazioni" className="mt-3 rounded-lg bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-sm font-black text-stone-950">Guarda esempio</button>
                              </article>

                              <article className="rounded-xl border border-amber-200/30 bg-stone-900 p-4 flex flex-col">
                                <div className="text-4xl">🎬</div>
                                <div className="mt-3 text-[11px] font-black uppercase tracking-[0.1em] text-amber-400">Video narrato</div>
                                <h3 className="mt-1 text-xl font-black text-white">Un Momento nell’Alveare</h3>
                                <p className="mt-2 text-sm font-semibold text-stone-300">Un breve racconto visivo e narrato. Durata di prova: circa 30 secondi.</p>
                                <div className="mt-4 text-2xl font-black text-amber-300">€2,90</div>
                                <button type="button" data-alveo-demo="video" className="mt-3 rounded-lg bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-sm font-black text-stone-950">Guarda esempio</button>
                              </article>

                              <article className="rounded-xl border border-amber-200/30 bg-stone-900 p-4 flex flex-col">
                                <div className="text-4xl">🎁</div>
                                <div className="mt-3 text-[11px] font-black uppercase tracking-[0.1em] text-amber-400">Regalo digitale</div>
                                <h3 className="mt-1 text-xl font-black text-white">Regala l’Alveare</h3>
                                <p className="mt-2 text-sm font-semibold text-stone-300">Una dedica e un piccolo contenuto digitale da inviare a chi vuoi.</p>
                                <div className="mt-4 text-2xl font-black text-amber-300">€2,90</div>
                                <button type="button" data-alveo-demo="regalo" className="mt-3 rounded-lg bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-sm font-black text-stone-950">Guarda esempio</button>
                              </article>
                            </div>

                            <div id="alveo-digitale-demo-box" className="hidden mt-5 rounded-xl border border-amber-300/40 bg-amber-50 p-4 text-stone-900">
                              <div className="text-[11px] font-black uppercase tracking-[0.1em] text-amber-800">Esempio</div>
                              <h3 id="alveo-digitale-demo-title" className="mt-1 text-xl font-black"></h3>
                              <p id="alveo-digitale-demo-text" className="mt-2 text-sm sm:text-base font-semibold leading-relaxed"></p>
                              <p className="mt-3 text-xs font-bold text-stone-600">Questa è solo una prova grafica su Render: l’acquisto non è ancora attivo.</p>
                            </div>

                            <div className="mt-5 rounded-xl bg-emerald-950/60 border border-emerald-700/50 p-4 text-center">
                              <div className="text-sm sm:text-base font-black text-white">Come funziona</div>
                              <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm font-bold text-emerald-50">
                                <div>1. Scegli</div><div>2. Acquista</div><div>3. Apri subito</div>
                              </div>
                              <div className="mt-2 text-xs font-bold text-emerald-200">Prodotto digitale · nessuna spedizione</div>
                            </div>
                          </section>`;

    html = html.slice(0, end) + '\n' + card + html.slice(end);
  }

  const oldDetector = '/^linea-(alimenti|integratori|cosmesi-cera|tesori-francesco|tris-alveare|benessere-veleno-api|veleno-api)-home$/i';
  const newDetector = '/^linea-(alimenti|integratori|cosmesi-cera|tesori-francesco|tris-alveare|alveo-digitale|benessere-veleno-api|veleno-api)-home$/i';
  if (html.includes(oldDetector)) html = html.replaceAll(oldDetector, newDetector);
  if (!html.includes(newDetector)) throw new Error('Riconoscimento Alveo Digitale nella vista linee non applicato');

  const runtimeId = 'alveo-digitale-inline-runtime';
  if (!html.includes(`id="${runtimeId}"`)) {
    const runtime = `<script id="${runtimeId}">
(function(){
  function panel(){return document.getElementById('alveo-digitale-inline-panel');}
  function lineCards(){return Array.from(document.querySelectorAll('[data-pli-product-line="1"]'));}
  function showLines(){lineCards().forEach(function(el){el.style.removeProperty('display');});}
  function hidePanel(){var p=panel();if(p)p.classList.add('hidden');showLines();}
  var demos={
    colazioni:{title:'10 Colazioni dell’Alveare',text:'Esempio: yogurt, frutta e miele Millefiori. Nel contenuto completo ogni idea avrà ingredienti, preparazione semplice e il miele consigliato.'},
    video:{title:'Un Momento nell’Alveare',text:'Esempio: un video narrato di circa 30 secondi con immagini dell’alveare, miele e api. Qui inseriremo il player quando prepareremo il primo video reale.'},
    regalo:{title:'Regala l’Alveare',text:'Esempio: scegli una dedica, aggiungi il nome della persona e invia un piccolo contenuto digitale. In seguito potremo abbinarlo anche a un Tris fisico con QR.'}
  };
  document.addEventListener('click',function(event){
    var open=event.target&&event.target.closest?event.target.closest('[data-open-alveo-digitale]'):null;
    if(open){
      event.preventDefault();
      var p=panel();if(!p)return;
      lineCards().forEach(function(el){if(el.id!=='linea-alveo-digitale-home')el.style.display='none';});
      p.classList.remove('hidden');
      setTimeout(function(){p.scrollIntoView({behavior:'smooth',block:'start'});},40);
      return;
    }
    var close=event.target&&event.target.closest?event.target.closest('[data-close-alveo-digitale]'):null;
    if(close){event.preventDefault();hidePanel();var card=document.getElementById('linea-alveo-digitale-home');if(card)setTimeout(function(){card.scrollIntoView({behavior:'smooth',block:'center'});},40);return;}
    var demo=event.target&&event.target.closest?event.target.closest('[data-alveo-demo]'):null;
    if(demo){
      event.preventDefault();
      var data=demos[demo.getAttribute('data-alveo-demo')];
      var box=document.getElementById('alveo-digitale-demo-box');
      if(data&&box){document.getElementById('alveo-digitale-demo-title').textContent=data.title;document.getElementById('alveo-digitale-demo-text').textContent=data.text;box.classList.remove('hidden');setTimeout(function(){box.scrollIntoView({behavior:'smooth',block:'nearest'});},30);}
      return;
    }
    var globalBack=event.target&&event.target.closest?event.target.closest('[data-close-product-lines]'):null;
    if(globalBack)hidePanel();
  },true);
  window.addEventListener('popstate',hidePanel);
})();
</script>`;
    html = html.replace('</body>', `${runtime}\n</body>`);
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Alveo Digitale integrato nello shop completo Render: apertura interna senza pagina separata.');
} catch (error) {
  console.error('[Miele Artigianale] Errore base Alveo Digitale:', error);
  process.exitCode = 1;
}
