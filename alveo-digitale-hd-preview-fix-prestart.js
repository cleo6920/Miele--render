const fs = require('fs');
const path = require('path');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  // Anteprima definitiva: tre immagini WebP generate dalle pagine reali del PDF.
  // Niente PDF.js, niente canvas, niente lente e niente download del PDF per mostrare l'anteprima.
  const replacements = [
    [
      '<img src="/images/alveo-colazioni-cover.jpg?v=preview1" alt="Copertina della raccolta">',
      '<img class="alveo-preview-static-image" src="/images/alveo-preview-presentazione.webp?v=preview-static-1" alt="Presentazione della raccolta">'
    ],
    [
      '<img src="/images/alveo-colazioni-preview-ricetta.jpg?v=preview1" alt="Pagina ricetta di esempio">',
      '<img class="alveo-preview-static-image" src="/images/alveo-preview-ricetta.webp?v=preview-static-1" alt="Ricetta completa di esempio">'
    ],
    [
      '<img src="/images/alveo-colazioni-preview-extra.jpg?v=preview1" alt="Pagina extra di esempio">',
      '<img class="alveo-preview-static-image" src="/images/alveo-preview-extra.webp?v=preview-static-1" alt="Pagina extra di esempio">'
    ]
  ];

  replacements.forEach(([from, to]) => {
    if (!html.includes(from)) throw new Error(`Elemento anteprima non trovato: ${from}`);
    html = html.replace(from, to);
  });

  html = html.replace('<span>Copertina</span>', '<span>Presentazione</span>');

  const oldStaticBuy = '<button type="button" data-alveo-demo="colazioni" className="mt-3 rounded-lg bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-sm font-black text-stone-950">Guarda esempio</button>';
  const newStaticBuy = '<button type="button" data-alveo-buy="colazioni" className="mt-3 rounded-lg bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-sm font-black text-stone-950">Acquista PDF</button>';
  if (html.includes(oldStaticBuy)) html = html.replace(oldStaticBuy, newStaticBuy);

  html = html.replace("String(btn.textContent||'').trim()==='Acquista prova'", "String(btn.textContent||'').trim()==='Acquista PDF'");
  html = html.replace("btn.textContent='Acquista prova';", "btn.textContent='Acquista PDF';");
  html = html.replace("btn.setAttribute('aria-label','Simula acquisto di 10 Colazioni dell’Alveare');", "btn.setAttribute('aria-label','Acquista PDF 10 Colazioni dell’Alveare - simulazione Render');");

  const enhancement = `
<style data-alveo-static-preview="true">
#alveo-preview-overlay{padding:6px!important}
#alveo-preview-modal{width:min(1100px,98vw)!important;height:97vh!important;max-height:97vh!important;overflow:hidden!important;display:flex!important;flex-direction:column!important}
#alveo-preview-head{flex:0 0 auto;padding:10px 14px!important}
#alveo-preview-intro{flex:0 0 auto;padding:9px 14px 5px!important}
#alveo-preview-pages{flex:1 1 auto!important;min-height:0!important;display:block!important;overflow:auto!important;padding:8px 12px!important;background:#171717!important}
.alveo-preview-page{display:none!important;width:min(900px,100%)!important;min-width:0!important;height:auto!important;margin:0 auto!important;padding:8px!important;overflow:visible!important;background:#f6f0e5!important;border-radius:14px!important;text-align:center!important}
.alveo-preview-page.alveo-active-page{display:block!important}
.alveo-preview-static-image{display:block!important;width:100%!important;height:auto!important;margin:0 auto!important;border-radius:8px!important;box-shadow:0 4px 18px rgba(0,0,0,.18)!important}
.alveo-preview-page span{display:block!important;margin-top:7px!important;font-size:13px!important;font-weight:900!important}
#alveo-preview-nav{flex:0 0 auto;display:flex;align-items:center;justify-content:center;gap:12px;padding:7px 14px 8px;background:#111}
#alveo-preview-nav button{border:1px solid #d99a12;border-radius:10px;background:#f0ad22;color:#151515;padding:10px 16px;font-weight:950;cursor:pointer;min-width:120px}
#alveo-preview-nav button:disabled{opacity:.35;cursor:default}
#alveo-preview-counter{min-width:64px;text-align:center;color:#f8e5ad;font-weight:900}
#alveo-preview-note{flex:0 0 auto!important;padding:3px 14px 9px!important;background:#111!important}
@media(max-width:700px){
  #alveo-preview-overlay{padding:2px!important}
  #alveo-preview-modal{width:99.5vw!important;height:98vh!important;max-height:98vh!important;border-radius:12px!important}
  #alveo-preview-head strong{font-size:16px!important}
  #alveo-preview-intro{font-size:13px!important}
  #alveo-preview-pages{padding:5px!important}
  .alveo-preview-page{width:100%!important;padding:4px!important}
  #alveo-preview-nav{gap:7px;padding:6px}
  #alveo-preview-nav button{min-width:0;flex:1;padding:10px 7px}
}
</style>
<script data-alveo-static-preview="true">
(function(){
  var pageIndex=0;

  function pages(){
    return Array.from(document.querySelectorAll('#alveo-preview-pages .alveo-preview-page'));
  }

  function ensureUi(){
    var container=document.getElementById('alveo-preview-pages');
    if(!container)return;
    if(!document.getElementById('alveo-preview-nav')){
      var nav=document.createElement('div');
      nav.id='alveo-preview-nav';
      nav.innerHTML='<button type="button" id="alveo-preview-prev">← Indietro</button><div id="alveo-preview-counter">1 / 3</div><button type="button" id="alveo-preview-next">Avanti →</button>';
      container.insertAdjacentElement('afterend',nav);
    }
  }

  function showPage(index){
    ensureUi();
    var all=pages();
    if(!all.length)return;
    pageIndex=Math.max(0,Math.min(index,all.length-1));
    all.forEach(function(page,i){
      page.classList.toggle('alveo-active-page',i===pageIndex);
    });
    var counter=document.getElementById('alveo-preview-counter');
    if(counter)counter.textContent=(pageIndex+1)+' / '+all.length;
    var prev=document.getElementById('alveo-preview-prev');
    var next=document.getElementById('alveo-preview-next');
    if(prev)prev.disabled=pageIndex===0;
    if(next)next.disabled=pageIndex===all.length-1;
    var container=document.getElementById('alveo-preview-pages');
    if(container)container.scrollTop=0;
  }

  document.addEventListener('click',function(event){
    if(event.target&&event.target.id==='alveo-preview-prev'){
      event.preventDefault();showPage(pageIndex-1);return;
    }
    if(event.target&&event.target.id==='alveo-preview-next'){
      event.preventDefault();showPage(pageIndex+1);return;
    }
    var open=event.target&&event.target.closest?event.target.closest('[data-alveo-preview-open]'):null;
    if(open)setTimeout(function(){showPage(0);},40);
  },true);

  document.addEventListener('keydown',function(event){
    var overlay=document.getElementById('alveo-preview-overlay');
    if(!overlay||!overlay.classList.contains('open'))return;
    if(event.key==='ArrowLeft')showPage(pageIndex-1);
    if(event.key==='ArrowRight')showPage(pageIndex+1);
  });

  function start(){ensureUi();showPage(0);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
</script>`;

  html = html.includes('</body>') ? html.replace('</body>', `${enhancement}\n</body>`) : `${html}\n${enhancement}`;

  if (!html.includes('/images/alveo-preview-presentazione.webp?v=preview-static-1')) throw new Error('Presentazione WebP non applicata');
  if (!html.includes('/images/alveo-preview-ricetta.webp?v=preview-static-1')) throw new Error('Ricetta WebP non applicata');
  if (!html.includes('/images/alveo-preview-extra.webp?v=preview-static-1')) throw new Error('Pagina extra WebP non applicata');
  if (!html.includes('alveo-preview-next')) throw new Error('Navigazione anteprima non applicata');
  if (!html.includes('Acquista PDF')) throw new Error('Pulsante Acquista PDF non applicato');
  if (html.includes('pdf.min.js') || html.includes('/api/alveo-preview-pdf')) throw new Error('Vecchia anteprima PDF.js ancora presente');

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Alveo Digitale: anteprima statica WebP nitida, veloce e senza lente attiva solo su Render.');
} catch (error) {
  console.error('[Miele Artigianale] Errore anteprima statica Alveo Digitale:', error);
  process.exitCode = 1;
}
