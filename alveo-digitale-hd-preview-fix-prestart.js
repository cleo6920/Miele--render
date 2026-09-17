const fs = require('fs');
const path = require('path');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  // Mantiene le tre immagini locali e forza una nuova versione URL.
  html = html.replaceAll('/images/alveo-colazioni-cover.jpg?v=preview1', '/images/alveo-colazioni-cover.jpg?v=preview7');
  html = html.replaceAll('/images/alveo-colazioni-preview-ricetta.jpg?v=preview1', '/images/alveo-colazioni-preview-ricetta.jpg?v=preview7');
  html = html.replaceAll('/images/alveo-colazioni-preview-extra.jpg?v=preview1', '/images/alveo-colazioni-preview-extra.jpg?v=preview7');

  const oldStaticBuy = '<button type="button" data-alveo-demo="colazioni" className="mt-3 rounded-lg bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-sm font-black text-stone-950">Guarda esempio</button>';
  const newStaticBuy = '<button type="button" data-alveo-buy="colazioni" className="mt-3 rounded-lg bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-sm font-black text-stone-950">Acquista PDF</button>';
  if (html.includes(oldStaticBuy)) html = html.replace(oldStaticBuy, newStaticBuy);

  html = html.replace("String(btn.textContent||'').trim()==='Acquista prova'", "String(btn.textContent||'').trim()==='Acquista PDF'");
  html = html.replace("btn.textContent='Acquista prova';", "btn.textContent='Acquista PDF';");
  html = html.replace("btn.setAttribute('aria-label','Simula acquisto di 10 Colazioni dell’Alveare');", "btn.setAttribute('aria-label','Acquista PDF 10 Colazioni dell’Alveare - simulazione Render');");

  const marker = 'data-alveo-large-preview="true"';
  if (!html.includes(marker)) {
    const enhancement = `
<style ${marker}>
#alveo-preview-overlay{padding:10px!important}
#alveo-preview-modal{width:min(1180px,97vw)!important;height:96vh!important;max-height:96vh!important;overflow:hidden!important;display:flex!important;flex-direction:column!important}
#alveo-preview-head{flex:0 0 auto;padding:12px 16px!important}
#alveo-preview-intro{flex:0 0 auto;padding:10px 16px 6px!important}
#alveo-preview-pages{flex:1 1 auto!important;min-height:0!important;display:block!important;overflow:hidden!important;padding:8px 14px 6px!important}
.alveo-preview-page{display:none!important;width:min(860px,100%)!important;height:100%!important;min-width:0!important;margin:0 auto!important;padding:8px!important;overflow:hidden!important;align-items:center!important;justify-content:center!important;flex-direction:column!important;background:#f6f0e5!important}
.alveo-preview-page.alveo-active-page{display:flex!important}
.alveo-preview-page img{display:block!important;width:auto!important;max-width:100%!important;height:auto!important;max-height:calc(96vh - 245px)!important;object-fit:contain!important;margin:0 auto!important;border-radius:8px!important;transition:transform .14s ease!important;cursor:zoom-in!important;transform-origin:center center!important;will-change:transform!important}
.alveo-preview-page span{flex:0 0 auto!important;margin-top:6px!important;font-size:13px!important}
#alveo-preview-nav{flex:0 0 auto;display:flex;align-items:center;justify-content:center;gap:12px;padding:6px 14px 8px}
#alveo-preview-nav button{border:1px solid #d99a12;border-radius:10px;background:#f0ad22;color:#151515;padding:10px 16px;font-weight:950;cursor:pointer;min-width:120px}
#alveo-preview-nav button:disabled{opacity:.35;cursor:default}
#alveo-preview-counter{min-width:64px;text-align:center;color:#f8e5ad;font-weight:900}
#alveo-preview-zoom-hint{flex:0 0 auto;text-align:center;color:#d7d7d7;font-size:12px;font-weight:700;padding:0 12px 5px}
#alveo-preview-note{flex:0 0 auto!important;padding:3px 16px 10px!important}
@media(max-width:700px){
  #alveo-preview-overlay{padding:4px!important}
  #alveo-preview-modal{width:99vw!important;height:97vh!important;max-height:97vh!important;border-radius:14px!important}
  #alveo-preview-head strong{font-size:16px!important}
  #alveo-preview-intro{font-size:13px!important}
  #alveo-preview-pages{padding:6px!important}
  .alveo-preview-page{width:100%!important;padding:5px!important}
  .alveo-preview-page img{max-height:calc(97vh - 255px)!important;max-width:100%!important;cursor:default!important}
  #alveo-preview-nav{gap:8px;padding:5px 8px 7px}
  #alveo-preview-nav button{min-width:0;flex:1;padding:10px 8px}
  #alveo-preview-zoom-hint{display:none}
}
</style>
<script ${marker}>
(function(){
  var pageIndex=0;
  function pages(){return Array.from(document.querySelectorAll('#alveo-preview-pages .alveo-preview-page'));}
  function ensureNav(){
    var container=document.getElementById('alveo-preview-pages');
    if(!container || document.getElementById('alveo-preview-nav')) return;
    var nav=document.createElement('div');
    nav.id='alveo-preview-nav';
    nav.innerHTML='<button type="button" id="alveo-preview-prev">← Indietro</button><div id="alveo-preview-counter">1 / 3</div><button type="button" id="alveo-preview-next">Avanti →</button>';
    container.insertAdjacentElement('afterend',nav);
    var hint=document.createElement('div');
    hint.id='alveo-preview-zoom-hint';
    hint.textContent='Su PC passa il mouse sulla pagina per ingrandire il punto che stai leggendo.';
    nav.insertAdjacentElement('afterend',hint);
  }
  function show(index){
    var all=pages();
    if(!all.length) return;
    pageIndex=Math.max(0,Math.min(index,all.length-1));
    all.forEach(function(p,i){p.classList.toggle('alveo-active-page',i===pageIndex);var img=p.querySelector('img');if(img){img.style.transform='scale(1)';img.style.transformOrigin='center center';}});
    var counter=document.getElementById('alveo-preview-counter');if(counter)counter.textContent=(pageIndex+1)+' / '+all.length;
    var prev=document.getElementById('alveo-preview-prev');if(prev)prev.disabled=pageIndex===0;
    var next=document.getElementById('alveo-preview-next');if(next)next.disabled=pageIndex===all.length-1;
  }
  function setupZoom(){
    pages().forEach(function(page){
      var img=page.querySelector('img');
      if(!img || img.dataset.alveoZoomReady==='1') return;
      img.dataset.alveoZoomReady='1';
      img.addEventListener('mousemove',function(ev){
        if(window.matchMedia && !window.matchMedia('(pointer:fine)').matches) return;
        var r=img.getBoundingClientRect();
        var x=((ev.clientX-r.left)/r.width)*100;
        var y=((ev.clientY-r.top)/r.height)*100;
        img.style.transformOrigin=x+'% '+y+'%';
        img.style.transform='scale(1.65)';
      });
      img.addEventListener('mouseleave',function(){img.style.transform='scale(1)';img.style.transformOrigin='center center';});
    });
  }
  function init(){ensureNav();setupZoom();show(0);}
  document.addEventListener('click',function(ev){
    if(ev.target && ev.target.id==='alveo-preview-prev'){ev.preventDefault();show(pageIndex-1);return;}
    if(ev.target && ev.target.id==='alveo-preview-next'){ev.preventDefault();show(pageIndex+1);return;}
    var open=ev.target&&ev.target.closest?ev.target.closest('[data-alveo-preview-open]'):null;
    if(open)setTimeout(init,0);
  },true);
  document.addEventListener('keydown',function(ev){
    var overlay=document.getElementById('alveo-preview-overlay');
    if(!overlay || !overlay.classList.contains('open'))return;
    if(ev.key==='ArrowLeft')show(pageIndex-1);
    if(ev.key==='ArrowRight')show(pageIndex+1);
  });
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init,{once:true}):init();
})();
</script>`;
    html = html.includes('</body>') ? html.replace('</body>', `${enhancement}\n</body>`) : `${html}\n${enhancement}`;
  }

  if (!html.includes('/images/alveo-colazioni-preview-ricetta.jpg?v=preview7')) throw new Error('Immagini locali anteprima non trovate');
  if (!html.includes('alveo-preview-next')) throw new Error('Navigazione anteprima grande non applicata');
  if (!html.includes('Acquista PDF')) throw new Error('Pulsante Acquista PDF non applicato');

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Alveo Digitale: anteprima grande una pagina alla volta con zoom mouse attiva solo su Render.');
} catch (error) {
  console.error('[Miele Artigianale] Errore anteprima grande Alveo Digitale:', error);
  process.exitCode = 1;
}
