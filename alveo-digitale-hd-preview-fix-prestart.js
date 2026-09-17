const fs = require('fs');
const path = require('path');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  // Usa direttamente tre pagine del PDF definitivo: niente miniature compresse e niente lente.
  const replacements = [
    [
      '<img src="/images/alveo-colazioni-cover.jpg?v=preview1" alt="Copertina della raccolta">',
      '<canvas class="alveo-pdf-canvas" data-alveo-pdf-page="1" aria-label="Presentazione della raccolta"></canvas>'
    ],
    [
      '<img src="/images/alveo-colazioni-preview-ricetta.jpg?v=preview1" alt="Pagina ricetta di esempio">',
      '<canvas class="alveo-pdf-canvas" data-alveo-pdf-page="3" aria-label="Ricetta completa di esempio"></canvas>'
    ],
    [
      '<img src="/images/alveo-colazioni-preview-extra.jpg?v=preview1" alt="Pagina extra di esempio">',
      '<canvas class="alveo-pdf-canvas" data-alveo-pdf-page="4" aria-label="Pagina di approfondimento di esempio"></canvas>'
    ]
  ];

  replacements.forEach(([from, to]) => {
    if (!html.includes(from)) throw new Error(`Elemento anteprima non trovato: ${from}`);
    html = html.replace(from, to);
  });

  html = html.replace('<span>Copertina</span>', '<span>Presentazione</span>');
  html = html.replace('<span>Una pagina extra</span>', '<span>Una pagina da scoprire</span>');

  const oldStaticBuy = '<button type="button" data-alveo-demo="colazioni" className="mt-3 rounded-lg bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-sm font-black text-stone-950">Guarda esempio</button>';
  const newStaticBuy = '<button type="button" data-alveo-buy="colazioni" className="mt-3 rounded-lg bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-sm font-black text-stone-950">Acquista PDF</button>';
  if (html.includes(oldStaticBuy)) html = html.replace(oldStaticBuy, newStaticBuy);

  html = html.replace("String(btn.textContent||'').trim()==='Acquista prova'", "String(btn.textContent||'').trim()==='Acquista PDF'");
  html = html.replace("btn.textContent='Acquista prova';", "btn.textContent='Acquista PDF';");
  html = html.replace("btn.setAttribute('aria-label','Simula acquisto di 10 Colazioni dell’Alveare');", "btn.setAttribute('aria-label','Acquista PDF 10 Colazioni dell’Alveare - simulazione Render');");

  const enhancement = `
<style data-alveo-pdf-preview="true">
#alveo-preview-overlay{padding:6px!important}
#alveo-preview-modal{width:min(1180px,98vw)!important;height:97vh!important;max-height:97vh!important;overflow:hidden!important;display:flex!important;flex-direction:column!important}
#alveo-preview-head{flex:0 0 auto;padding:10px 14px!important}
#alveo-preview-intro{flex:0 0 auto;padding:9px 14px 5px!important}
#alveo-preview-pages{flex:1 1 auto!important;min-height:0!important;display:block!important;overflow:auto!important;padding:8px 12px!important;background:#171717!important}
.alveo-preview-page{display:none!important;width:min(980px,100%)!important;min-width:0!important;height:auto!important;margin:0 auto!important;padding:8px!important;overflow:visible!important;background:#f6f0e5!important;border-radius:14px!important;text-align:center!important}
.alveo-preview-page.alveo-active-page{display:block!important}
.alveo-pdf-canvas{display:block!important;width:auto!important;max-width:100%!important;height:auto!important;margin:0 auto!important;background:#fff!important;border-radius:8px!important;box-shadow:0 4px 18px rgba(0,0,0,.18)!important}
.alveo-preview-page span{display:block!important;margin-top:7px!important;font-size:13px!important;font-weight:900!important}
#alveo-preview-nav{flex:0 0 auto;display:flex;align-items:center;justify-content:center;gap:12px;padding:7px 14px 8px;background:#111}
#alveo-preview-nav button{border:1px solid #d99a12;border-radius:10px;background:#f0ad22;color:#151515;padding:10px 16px;font-weight:950;cursor:pointer;min-width:120px}
#alveo-preview-nav button:disabled{opacity:.35;cursor:default}
#alveo-preview-counter{min-width:64px;text-align:center;color:#f8e5ad;font-weight:900}
#alveo-preview-note{flex:0 0 auto!important;padding:3px 14px 9px!important;background:#111!important}
#alveo-preview-loading{display:none;flex:0 0 auto;text-align:center;padding:5px 10px;color:#f8e5ad;font-weight:800;font-size:12px;background:#111}
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
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js" data-alveo-pdfjs="true"></script>
<script data-alveo-pdf-preview="true">
(function(){
  var pageIndex=0;
  var pdfDoc=null;
  var renderToken=0;
  var previewPages=[1,3,4];

  function pages(){return Array.from(document.querySelectorAll('#alveo-preview-pages .alveo-preview-page'));}
  function ensureUi(){
    var container=document.getElementById('alveo-preview-pages');
    if(!container)return;
    if(!document.getElementById('alveo-preview-nav')){
      var nav=document.createElement('div');
      nav.id='alveo-preview-nav';
      nav.innerHTML='<button type="button" id="alveo-preview-prev">← Indietro</button><div id="alveo-preview-counter">1 / 3</div><button type="button" id="alveo-preview-next">Avanti →</button>';
      container.insertAdjacentElement('afterend',nav);
    }
    if(!document.getElementById('alveo-preview-loading')){
      var loading=document.createElement('div');
      loading.id='alveo-preview-loading';
      loading.textContent='Caricamento anteprima nitida...';
      container.insertAdjacentElement('beforebegin',loading);
    }
  }

  async function getPdf(){
    if(pdfDoc)return pdfDoc;
    if(!window.pdfjsLib)throw new Error('PDF.js non disponibile');
    window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    pdfDoc=await window.pdfjsLib.getDocument({url:'/api/alveo-preview-pdf?v=1'}).promise;
    return pdfDoc;
  }

  async function renderPage(index){
    var all=pages();
    if(!all.length)return;
    pageIndex=Math.max(0,Math.min(index,all.length-1));
    all.forEach(function(p,i){p.classList.toggle('alveo-active-page',i===pageIndex);});
    var counter=document.getElementById('alveo-preview-counter');if(counter)counter.textContent=(pageIndex+1)+' / '+all.length;
    var prev=document.getElementById('alveo-preview-prev');if(prev)prev.disabled=pageIndex===0;
    var next=document.getElementById('alveo-preview-next');if(next)next.disabled=pageIndex===all.length-1;

    var active=all[pageIndex];
    var canvas=active&&active.querySelector('canvas[data-alveo-pdf-page]');
    if(!canvas || canvas.dataset.rendered==='1')return;
    var loading=document.getElementById('alveo-preview-loading');if(loading)loading.style.display='block';
    var myToken=++renderToken;
    try{
      var pdf=await getPdf();
      var pageNo=Number(canvas.getAttribute('data-alveo-pdf-page'))||previewPages[pageIndex];
      var page=await pdf.getPage(pageNo);
      if(myToken!==renderToken)return;
      var base=page.getViewport({scale:1});
      var parentWidth=Math.max(280,Math.min(960,(document.getElementById('alveo-preview-pages')||active).clientWidth-28));
      var cssScale=parentWidth/base.width;
      var dpr=Math.min(window.devicePixelRatio||1,2.25);
      var viewport=page.getViewport({scale:cssScale*dpr});
      canvas.width=Math.floor(viewport.width);
      canvas.height=Math.floor(viewport.height);
      canvas.style.width=Math.floor(viewport.width/dpr)+'px';
      canvas.style.height=Math.floor(viewport.height/dpr)+'px';
      var ctx=canvas.getContext('2d',{alpha:false});
      await page.render({canvasContext:ctx,viewport:viewport}).promise;
      canvas.dataset.rendered='1';
    }catch(err){
      console.error('[Alveo Digitale] Anteprima PDF:',err);
      if(canvas){
        var ctx2=canvas.getContext('2d');
        canvas.width=800;canvas.height=300;canvas.style.width='100%';canvas.style.height='auto';
        ctx2.fillStyle='#fffaf0';ctx2.fillRect(0,0,800,300);ctx2.fillStyle='#5c4100';ctx2.font='bold 26px Arial';ctx2.textAlign='center';ctx2.fillText('Anteprima momentaneamente non disponibile',400,145);
      }
    }finally{if(loading)loading.style.display='none';}
  }

  function init(){ensureUi();renderPage(0);}
  document.addEventListener('click',function(ev){
    if(ev.target&&ev.target.id==='alveo-preview-prev'){ev.preventDefault();renderPage(pageIndex-1);return;}
    if(ev.target&&ev.target.id==='alveo-preview-next'){ev.preventDefault();renderPage(pageIndex+1);return;}
    var open=ev.target&&ev.target.closest?ev.target.closest('[data-alveo-preview-open]'):null;
    if(open)setTimeout(init,80);
  },true);
  document.addEventListener('keydown',function(ev){
    var overlay=document.getElementById('alveo-preview-overlay');
    if(!overlay||!overlay.classList.contains('open'))return;
    if(ev.key==='ArrowLeft')renderPage(pageIndex-1);
    if(ev.key==='ArrowRight')renderPage(pageIndex+1);
  });
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',function(){ensureUi();},{once:true}):ensureUi();
})();
</script>`;

  html = html.includes('</body>') ? html.replace('</body>', `${enhancement}\n</body>`) : `${html}\n${enhancement}`;

  // Aggiunge sul server Render un proxy same-origin per il PDF definitivo usato solo dall'anteprima.
  const serverPath = path.join(__dirname, 'server.js');
  let server = fs.readFileSync(serverPath, 'utf8');
  if (!server.includes('ALVEO_PREVIEW_PDF_PROXY')) {
    const routeMarker = "app.post('/api/create-checkout-session', createCheckoutSession);";
    if (!server.includes(routeMarker)) throw new Error('Punto inserimento proxy PDF non trovato in server.js');
    const proxyCode = `\n// ALVEO_PREVIEW_PDF_PROXY\nlet alveoPreviewPdfCache = null;\napp.get('/api/alveo-preview-pdf', async (_req, res) => {\n  try {\n    if (!alveoPreviewPdfCache) {\n      const upstream = await fetch('https://drive.google.com/uc?export=download&id=1di9FWVofJvuC18oGe7cl5r-4dRUX0O3K');\n      if (!upstream.ok) throw new Error('Download PDF non riuscito: ' + upstream.status);\n      const buffer = Buffer.from(await upstream.arrayBuffer());\n      if (buffer.subarray(0, 4).toString() !== '%PDF') throw new Error('Il file ricevuto non e un PDF valido');\n      alveoPreviewPdfCache = buffer;\n    }\n    res.setHeader('Content-Type', 'application/pdf');\n    res.setHeader('Content-Disposition', 'inline; filename=10-colazioni-alveare.pdf');\n    res.setHeader('Cache-Control', 'public, max-age=3600');\n    res.send(alveoPreviewPdfCache);\n  } catch (error) {\n    console.error('[Miele Artigianale] Errore proxy PDF Alveo Digitale:', error);\n    res.status(502).send('Anteprima PDF non disponibile');\n  }\n});\n`;
    server = server.replace(routeMarker, routeMarker + proxyCode);
    fs.writeFileSync(serverPath, server, 'utf8');
  }

  if (!html.includes('data-alveo-pdf-page="3"')) throw new Error('Canvas ricetta anteprima non applicato');
  if (!html.includes('alveo-preview-next')) throw new Error('Navigazione anteprima non applicata');
  if (!html.includes('Acquista PDF')) throw new Error('Pulsante Acquista PDF non applicato');

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Alveo Digitale: anteprima PDF nitida 1-3-4, grande e senza lente, attiva solo su Render.');
} catch (error) {
  console.error('[Miele Artigianale] Errore anteprima PDF nitida Alveo Digitale:', error);
  process.exitCode = 1;
}
