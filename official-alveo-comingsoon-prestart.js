const fs = require('fs');
const path = require('path');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  // 1) Linea Veleno: stessa impostazione approvata su Render.
  const oldDescription = "Una selezione esclusiva dedicata al veleno d’api, con trattamenti per viso, corpo e massaggio scelti per rappresentare una delle linee più distintive della Fabbrica delle Api.";
  const newDescription = "Una selezione esclusiva dedicata al veleno d’api, con cosmetici per viso, corpo e massaggio scelti per rappresentare una delle linee più distintive della Fabbrica delle Api. La gamma riunisce 6 referenze: crema e siero viso, prodotti per il corpo, gommage, bagnodoccia e unguento da massaggio. In alcune formulazioni il veleno d’api è abbinato ad altri ingredienti dell’alveare, come miele, polline e cera d’api. Scopri ogni prodotto e consulta la scheda completa con caratteristiche, formato e prezzo.";
  if (html.includes(oldDescription)) html = html.replace(oldDescription, newDescription);

  const oldImageClass = 'className="block w-full h-[190px] sm:h-[210px] md:h-[220px] lg:h-[225px] object-cover object-center"';
  const newImageClass = 'className="block w-full h-[210px] sm:h-[230px] md:h-full md:min-h-[330px] lg:min-h-[345px] object-cover object-center"';
  if (html.includes(oldImageClass)) html = html.replace(oldImageClass, newImageClass);

  const oldContentClass = 'className="flex flex-col justify-center p-3 sm:p-3 lg:p-4 bg-gradient-to-br from-[#17120a] via-[#111111] to-[#0d0d0d]"';
  const newContentClass = 'className="flex flex-col justify-start p-3 sm:p-3 lg:p-4 bg-gradient-to-br from-[#17120a] via-[#111111] to-[#0d0d0d]"';
  if (html.includes(oldContentClass)) html = html.replace(oldContentClass, newContentClass);

  const buttonNeedle = `                              <button
                                type="button"
                                onClick={() => { setSelectedProductId(null); setSelectedCategory('veleno-api'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}`;

  if (!html.includes('La linea in breve') && html.includes(buttonNeedle)) {
    const summaryBlock = `                              <div className="mt-3 rounded-xl border border-amber-400/25 bg-amber-950/20 px-3 py-2.5">
                                <div className="text-[10px] sm:text-[11px] font-black tracking-[0.12em] text-amber-300 uppercase">La linea in breve</div>
                                <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-[11px] sm:text-xs font-bold text-stone-100">
                                  <div><span className="text-amber-300">Viso</span> · crema e siero</div>
                                  <div><span className="text-amber-300">Corpo</span> · crema, gommage e bagnodoccia</div>
                                  <div><span className="text-amber-300">Massaggio</span> · SOS DOL</div>
                                </div>
                              </div>
${buttonNeedle}`;
    html = html.replace(buttonNeedle, summaryBlock);
  }

  // 2) Alveo Digitale: card affiancata alla Linea Veleno, ma senza prodotti acquistabili.
  if (!html.includes('id="linea-alveo-digitale-home"')) {
    const velenoMarker = 'id="linea-benessere-veleno-api-home"';
    const velenoPos = html.indexOf(velenoMarker);
    if (velenoPos === -1) throw new Error('Sezione Linea Veleno non trovata');

    const sectionStart = html.lastIndexOf('<section', velenoPos);
    const sectionEndStart = html.indexOf('</section>', velenoPos);
    if (sectionStart === -1 || sectionEndStart === -1) throw new Error('Limiti sezione Linea Veleno non trovati');
    const sectionEnd = sectionEndStart + '</section>'.length;
    let section = html.slice(sectionStart, sectionEnd);

    const articleStart = section.indexOf('<article');
    const articleEndStart = section.indexOf('</article>', articleStart);
    if (articleStart === -1 || articleEndStart === -1) throw new Error('Card Linea Veleno non trovata');
    const articleEnd = articleEndStart + '</article>'.length;
    const velenoCard = section.slice(articleStart, articleEnd);

    const alveoCard = `<article id="linea-alveo-digitale-home" className="mx-auto w-full overflow-hidden rounded-xl border border-amber-300/45 bg-[#121212] shadow-lg">
      <div className="px-3 pt-2.5 pb-2">
        <div className="text-[11px] font-black tracking-[0.14em] text-amber-400 uppercase">ALVEO DIGITALE</div>
        <h2 className="mt-1 text-xl xl:text-[20px] font-black leading-tight text-white">Ricette, video e idee regalo da usare subito</h2>
      </div>
      <div className="px-3 pb-3">
        <div className="overflow-hidden rounded-lg border border-amber-200/40 bg-[#f4ecdf] shadow-inner">
          <img src="/images/alveo-digitale-card-originale.png?v=alveo-official-2" alt="Ricette, video e idee regalo della linea Alveo Digitale" className="block w-full h-auto object-contain object-center" />
        </div>
        <div className="mt-2.5 min-w-0">
          <p className="text-sm xl:text-[13px] leading-snug font-semibold text-stone-100">Una nuova area digitale dedicata a ricette, video narrati e idee regalo. I primi contenuti saranno disponibili a breve.</p>
          <button type="button" data-open-alveo-comingsoon className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-amber-500 hover:bg-amber-400 px-4 py-2 text-xs sm:text-sm xl:text-xs font-black text-stone-950 shadow-sm transition-colors" aria-label="Entra in Alveo Digitale">Entra in Alveo Digitale</button>
        </div>
      </div>
    </article>`;

    const comingSoonPanel = `<section id="alveo-digitale-comingsoon-panel" className="hidden col-span-full mt-3 rounded-2xl border border-amber-300/40 bg-[#111] p-4 sm:p-6 shadow-xl" aria-label="Alveo Digitale in preparazione">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <div className="text-xs font-black tracking-[0.14em] uppercase text-amber-400">ALVEO DIGITALE</div>
          <div className="mt-2 inline-flex rounded-full bg-amber-500 px-3 py-1 text-[11px] font-black tracking-[0.12em] text-stone-950 uppercase">Contenuti in preparazione</div>
          <h2 className="mt-3 text-2xl sm:text-3xl font-black text-white">Alveo Digitale sta arrivando</h2>
          <p className="mt-3 max-w-3xl text-sm sm:text-base font-semibold leading-relaxed text-stone-200">Stiamo preparando i primi contenuti digitali della Fabbrica delle Api: ricette da sfogliare, brevi video narrati e idee regalo semplici da acquistare e utilizzare subito.</p>
          <p className="mt-3 text-base sm:text-lg font-black text-amber-200">I primi contenuti saranno disponibili a breve.</p>
        </div>
        <button type="button" data-close-alveo-comingsoon className="shrink-0 rounded-lg border border-amber-300/50 px-4 py-2 text-sm font-black text-amber-300 hover:bg-stone-800">← Torna alle linee</button>
      </div>
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-amber-200/25 bg-stone-900 p-4">
          <div className="text-3xl">📖</div>
          <div className="mt-2 text-sm font-black text-white">Ricette digitali</div>
          <div className="mt-1 text-xs font-semibold text-stone-300">Raccolte pratiche e piacevoli da sfogliare.</div>
        </div>
        <div className="rounded-xl border border-amber-200/25 bg-stone-900 p-4">
          <div className="text-3xl">🎬</div>
          <div className="mt-2 text-sm font-black text-white">Video narrati</div>
          <div className="mt-1 text-xs font-semibold text-stone-300">Brevi contenuti visivi dedicati al mondo dell’alveare.</div>
        </div>
        <div className="rounded-xl border border-amber-200/25 bg-stone-900 p-4">
          <div className="text-3xl">🎁</div>
          <div className="mt-2 text-sm font-black text-white">Idee regalo digitali</div>
          <div className="mt-1 text-xs font-semibold text-stone-300">Piccoli contenuti da regalare e condividere.</div>
        </div>
      </div>
    </section>`;

    const pair = `<div data-alveo-official-pair="true" className="mx-auto grid w-full max-w-[1248px] grid-cols-1 xl:grid-cols-[minmax(0,820px)_minmax(0,408px)] gap-3 xl:gap-5 items-stretch">
${velenoCard}
${alveoCard}
</div>`;

    section = section.slice(0, articleStart) + pair + '\n' + comingSoonPanel + section.slice(articleEnd);
    html = html.slice(0, sectionStart) + section + html.slice(sectionEnd);
  }

  // 3) Apertura della vera sezione Alveo Digitale: nessun acquisto finché i contenuti non sono pronti.
  if (!html.includes('data-alveo-comingsoon-inline="true"')) {
    const runtime = `
<script data-alveo-comingsoon-inline="true">
(function(){
  function panel(){return document.getElementById('alveo-digitale-comingsoon-panel');}
  function lineCards(){return Array.from(document.querySelectorAll('[data-pli-product-line="1"]'));}

  function openPanel(){
    var p=panel();
    if(!p)return;
    lineCards().forEach(function(el){el.style.display='none';});
    p.classList.remove('hidden');
    setTimeout(function(){p.scrollIntoView({behavior:'smooth',block:'start'});},40);
  }

  function closePanel(){
    var p=panel();
    if(p)p.classList.add('hidden');
    lineCards().forEach(function(el){el.style.removeProperty('display');});
    var card=document.getElementById('linea-alveo-digitale-home');
    if(card)setTimeout(function(){card.scrollIntoView({behavior:'smooth',block:'center'});},40);
  }

  document.addEventListener('click',function(event){
    var open=event.target&&event.target.closest?event.target.closest('[data-open-alveo-comingsoon]'):null;
    if(open){event.preventDefault();openPanel();return;}

    var close=event.target&&event.target.closest?event.target.closest('[data-close-alveo-comingsoon]'):null;
    if(close){event.preventDefault();closePanel();return;}

    var globalBack=event.target&&event.target.closest?event.target.closest('[data-close-product-lines]'):null;
    if(globalBack){
      var p=panel();
      if(p)p.classList.add('hidden');
      lineCards().forEach(function(el){el.style.removeProperty('display');});
    }
  },true);
})();
</script>`;
    html = html.replace('</body>', runtime + '\n</body>');
  }

  if (!html.includes('/images/alveo-digitale-card-originale.png?v=alveo-official-2')) throw new Error('Immagine Alveo Digitale ufficiale non applicata');
  if (!html.includes('id="alveo-digitale-comingsoon-panel"')) throw new Error('Sezione Alveo Digitale in preparazione non applicata');
  if (!html.includes('I primi contenuti saranno disponibili a breve.')) throw new Error('Messaggio contenuti in arrivo non applicato');

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Cloudflare test] Linea Veleno aggiornata e Alveo Digitale aggiunta in modalità "contenuti in arrivo", senza acquisto digitale.');
} catch (error) {
  console.error('[Cloudflare test] Errore aggiornamento ufficiale Veleno + Alveo Digitale:', error);
  process.exitCode = 1;
}
