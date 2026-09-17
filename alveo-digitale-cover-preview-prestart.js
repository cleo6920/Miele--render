const fs = require('fs');
const path = require('path');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const marker = 'data-alveo-cover-preview="true"';
  if (html.includes(marker)) {
    console.log('[Miele Artigianale] Alveo Digitale: copertina e anteprima gia presenti.');
    return;
  }

  const iconTarget = '<div className="text-4xl">📖</div>';
  const coverMarkup = `<button type="button" data-alveo-preview-open className="mb-3 block w-full overflow-hidden rounded-xl border border-amber-200/30 bg-[#f4ecdf] shadow-inner" aria-label="Sfoglia anteprima 10 Colazioni dell’Alveare">
                                  <img src="/images/alveo-colazioni-cover.jpg?v=preview1" alt="Copertina 10 Colazioni dell’Alveare" className="block h-44 w-full object-contain" />
                                </button>`;
  if (!html.includes(iconTarget)) throw new Error('Icona libro della card 10 Colazioni non trovata');
  html = html.replace(iconTarget, coverMarkup);

  const buyTarget = '<button type="button" data-alveo-demo="colazioni" className="mt-3 rounded-lg bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-sm font-black text-stone-950">Guarda esempio</button>';
  const previewAndBuy = `<button type="button" data-alveo-preview-open className="mt-3 rounded-lg border border-amber-400/70 bg-stone-800 hover:bg-stone-700 px-4 py-2.5 text-sm font-black text-amber-300">👁 Sfoglia anteprima</button>
                                ${buyTarget}`;
  if (!html.includes(buyTarget)) throw new Error('Pulsante della card 10 Colazioni non trovato');
  html = html.replace(buyTarget, previewAndBuy);

  const injection = `
<style ${marker}>
#alveo-preview-overlay{position:fixed;inset:0;z-index:999998;background:rgba(0,0,0,.78);display:none;align-items:center;justify-content:center;padding:14px;font-family:Arial,Helvetica,sans-serif}
#alveo-preview-overlay.open{display:flex}
#alveo-preview-modal{width:min(920px,100%);max-height:94vh;overflow:auto;background:#111;color:#fff;border:2px solid #d99a12;border-radius:18px;box-shadow:0 24px 70px rgba(0,0,0,.55)}
#alveo-preview-head{position:sticky;top:0;z-index:2;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;background:#0b2f24;border-bottom:1px solid rgba(217,154,18,.45)}
#alveo-preview-head strong{font-size:18px;line-height:1.15}
#alveo-preview-close{border:1px solid rgba(255,255,255,.35);border-radius:10px;background:#fff;color:#18231d;padding:8px 12px;font-weight:900;cursor:pointer}
#alveo-preview-intro{padding:14px 16px 4px;color:#f8e5ad;font-size:14px;font-weight:800;line-height:1.4}
#alveo-preview-pages{display:grid;grid-template-columns:repeat(3,minmax(220px,1fr));gap:12px;padding:12px 16px 18px;overflow-x:auto}
.alveo-preview-page{min-width:220px;background:#f6f0e5;border-radius:12px;padding:8px;text-align:center;color:#1d251f}
.alveo-preview-page img{display:block;width:100%;height:auto;border-radius:8px}
.alveo-preview-page span{display:block;margin-top:7px;font-size:12px;font-weight:900}
#alveo-preview-note{padding:0 16px 18px;text-align:center;color:#ddd;font-size:12px;font-weight:700}
@media(max-width:700px){#alveo-preview-pages{grid-template-columns:repeat(3,76vw);scroll-snap-type:x mandatory}.alveo-preview-page{scroll-snap-align:start}}
</style>
<div id="alveo-preview-overlay" ${marker} aria-hidden="true">
  <div id="alveo-preview-modal" role="dialog" aria-modal="true" aria-label="Anteprima 10 Colazioni dell’Alveare">
    <div id="alveo-preview-head"><strong>10 Colazioni dell’Alveare · Anteprima</strong><button id="alveo-preview-close" type="button">Chiudi ✕</button></div>
    <div id="alveo-preview-intro">Sfoglia tre pagine di esempio prima di acquistare. La raccolta completa contiene 30 pagine.</div>
    <div id="alveo-preview-pages">
      <div class="alveo-preview-page"><img src="/images/alveo-colazioni-cover.jpg?v=preview1" alt="Copertina della raccolta"><span>Copertina</span></div>
      <div class="alveo-preview-page"><img src="/images/alveo-colazioni-preview-ricetta.jpg?v=preview1" alt="Pagina ricetta di esempio"><span>Una ricetta completa</span></div>
      <div class="alveo-preview-page"><img src="/images/alveo-colazioni-preview-extra.jpg?v=preview1" alt="Pagina extra di esempio"><span>Una pagina extra</span></div>
    </div>
    <div id="alveo-preview-note">Anteprima parziale · il contenuto completo si scarica dopo l’acquisto.</div>
  </div>
</div>
<script ${marker}>
(function(){
  function overlay(){return document.getElementById('alveo-preview-overlay');}
  function openPreview(){var o=overlay();if(!o)return;o.classList.add('open');o.setAttribute('aria-hidden','false');}
  function closePreview(){var o=overlay();if(!o)return;o.classList.remove('open');o.setAttribute('aria-hidden','true');}
  document.addEventListener('click',function(event){
    var open=event.target&&event.target.closest?event.target.closest('[data-alveo-preview-open]'):null;
    if(open){event.preventDefault();event.stopImmediatePropagation();openPreview();return;}
    if(event.target&&event.target.id==='alveo-preview-close'){event.preventDefault();closePreview();return;}
    if(event.target===overlay())closePreview();
  },true);
  document.addEventListener('keydown',function(event){if(event.key==='Escape')closePreview();});
})();
</script>`;

  html = html.includes('</body>') ? html.replace('</body>', `${injection}\n</body>`) : `${html}\n${injection}`;
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Alveo Digitale: copertina reale e anteprima 3 pagine attive solo su Render.');
} catch (error) {
  console.error('[Miele Artigianale] Errore copertina/anteprima Alveo Digitale:', error);
  process.exitCode = 1;
}
