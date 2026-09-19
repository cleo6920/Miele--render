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
          <img src="/images/alveo-digitale-card-originale.png?v=alveo-official-1" alt="Ricette, video e idee regalo della linea Alveo Digitale" className="block w-full h-auto object-contain object-center" />
        </div>
        <div className="mt-2.5 min-w-0">
          <p className="text-sm xl:text-[13px] leading-snug font-semibold text-stone-100">Una nuova area digitale dedicata a ricette, video narrati e idee regalo. I primi contenuti saranno disponibili a breve.</p>
          <button type="button" data-open-alveo-comingsoon className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-amber-500 hover:bg-amber-400 px-4 py-2 text-xs sm:text-sm xl:text-xs font-black text-stone-950 shadow-sm transition-colors" aria-label="Scopri Alveo Digitale">Scopri Alveo Digitale</button>
        </div>
      </div>
    </article>`;

    const pair = `<div data-alveo-official-pair="true" className="mx-auto grid w-full max-w-[1248px] grid-cols-1 xl:grid-cols-[minmax(0,820px)_minmax(0,408px)] gap-3 xl:gap-5 items-stretch">
${velenoCard}
${alveoCard}
</div>`;

    section = section.slice(0, articleStart) + pair + section.slice(articleEnd);
    html = html.slice(0, sectionStart) + section + html.slice(sectionEnd);
  }

  // 3) Messaggio ufficiale: nessun acquisto digitale finché i contenuti non sono pronti.
  if (!html.includes('id="alveo-comingsoon-overlay"')) {
    const runtime = `
<style data-alveo-comingsoon="true">
#alveo-comingsoon-overlay{position:fixed;inset:0;z-index:99999;display:none;align-items:center;justify-content:center;padding:18px;background:rgba(0,0,0,.78);backdrop-filter:blur(4px)}
#alveo-comingsoon-overlay.open{display:flex}
#alveo-comingsoon-box{width:min(560px,96vw);border:1px solid rgba(245,158,11,.55);border-radius:18px;background:#111;color:#fff;box-shadow:0 24px 70px rgba(0,0,0,.55);overflow:hidden}
#alveo-comingsoon-head{padding:18px 20px;background:#073c2e;border-bottom:1px solid rgba(245,158,11,.35)}
#alveo-comingsoon-badge{display:inline-flex;border-radius:999px;background:#f59e0b;color:#111827;padding:5px 10px;font-size:11px;font-weight:950;letter-spacing:.11em;text-transform:uppercase}
#alveo-comingsoon-head h3{margin:10px 0 0;font-family:Georgia,"Times New Roman",serif;font-size:28px;line-height:1.08;font-weight:900}
#alveo-comingsoon-body{padding:20px}
#alveo-comingsoon-body p{margin:0;color:#f5f5f4;font-size:16px;line-height:1.5;font-weight:650}
#alveo-comingsoon-body strong{display:block;margin-top:12px;color:#fde68a;font-size:17px}
#alveo-comingsoon-close{margin-top:18px;width:100%;border:0;border-radius:11px;background:#f59e0b;color:#111827;padding:12px 16px;font-size:14px;font-weight:950;cursor:pointer}
</style>
<div id="alveo-comingsoon-overlay" aria-hidden="true">
  <div id="alveo-comingsoon-box" role="dialog" aria-modal="true" aria-labelledby="alveo-comingsoon-title">
    <div id="alveo-comingsoon-head">
      <span id="alveo-comingsoon-badge">In preparazione</span>
      <h3 id="alveo-comingsoon-title">Alveo Digitale sta arrivando</h3>
    </div>
    <div id="alveo-comingsoon-body">
      <p>Stiamo preparando i primi contenuti: ricette da sfogliare, brevi video narrati e idee regalo digitali.</p>
      <strong>I primi contenuti saranno disponibili a breve direttamente sul sito.</strong>
      <button type="button" id="alveo-comingsoon-close">Torna alle linee</button>
    </div>
  </div>
</div>
<script data-alveo-comingsoon="true">
(function(){
  function overlay(){return document.getElementById('alveo-comingsoon-overlay');}
  function open(){
    var el=overlay();
    if(!el)return;
    el.classList.add('open');
    el.setAttribute('aria-hidden','false');
  }
  function close(){
    var el=overlay();
    if(!el)return;
    el.classList.remove('open');
    el.setAttribute('aria-hidden','true');
  }
  document.addEventListener('click',function(event){
    if(event.target&&event.target.closest&&event.target.closest('[data-open-alveo-comingsoon]')){event.preventDefault();open();return;}
    if(event.target&&event.target.id==='alveo-comingsoon-close'){event.preventDefault();close();return;}
    var el=overlay();
    if(el&&event.target===el)close();
  },true);
  document.addEventListener('keydown',function(event){if(event.key==='Escape')close();});
})();
</script>`;
    html = html.replace('</body>', runtime + '\n</body>');
  }

  if (!html.includes('/images/alveo-digitale-card-originale.png?v=alveo-official-1')) throw new Error('Immagine Alveo Digitale ufficiale non applicata');
  if (!html.includes('I primi contenuti saranno disponibili a breve direttamente sul sito.')) throw new Error('Messaggio Alveo Digitale in preparazione non applicato');

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Cloudflare test] Linea Veleno aggiornata e Alveo Digitale aggiunta in modalità "contenuti in arrivo", senza acquisto digitale.');
} catch (error) {
  console.error('[Cloudflare test] Errore aggiornamento ufficiale Veleno + Alveo Digitale:', error);
  process.exitCode = 1;
}
