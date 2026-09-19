const fs = require('fs');
const path = require('path');

// Attiva il primo prodotto reale di Alveo Digitale sul sito ufficiale.
// Viene eseguito DOPO official-alveo-comingsoon-prestart.js, così la card/layout
// già approvati restano invariati e viene sostituito solo lo stato "in preparazione".
try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const panelMarker = 'id="alveo-digitale-comingsoon-panel"';
  const panelPos = html.indexOf(panelMarker);
  if (panelPos === -1) throw new Error('Pannello Alveo Digitale ufficiale non trovato');

  const sectionStart = html.lastIndexOf('<section', panelPos);
  const sectionEndStart = html.indexOf('</section>', panelPos);
  if (sectionStart === -1 || sectionEndStart === -1) throw new Error('Limiti pannello Alveo Digitale non trovati');
  const sectionEnd = sectionEndStart + '</section>'.length;

  const livePanel = `<section id="alveo-digitale-comingsoon-panel" className="hidden col-span-full mt-3 rounded-2xl border border-amber-300/40 bg-[#111] p-4 sm:p-6 shadow-xl" aria-label="Alveo Digitale">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <div className="text-xs font-black tracking-[0.14em] uppercase text-amber-400">ALVEO DIGITALE</div>
          <div className="mt-2 inline-flex rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-black tracking-[0.12em] text-white uppercase">Primo contenuto disponibile</div>
          <h2 className="mt-3 text-2xl sm:text-3xl font-black text-white">Alveo Digitale è iniziato</h2>
          <p className="mt-3 max-w-3xl text-sm sm:text-base font-semibold leading-relaxed text-stone-200">Puoi già entrare nella raccolta con <strong className="text-white">10 Colazioni dell’Alveare</strong>: una guida digitale completa da sfogliare, usare e scaricare subito dopo il pagamento.</p>
          <p className="mt-2 max-w-3xl text-sm sm:text-base font-black leading-relaxed text-amber-200">Ogni contenuto è completo e indipendente: puoi scegliere quello disponibile oggi senza aspettare le prossime uscite.</p>
        </div>
        <button type="button" data-close-alveo-comingsoon className="shrink-0 rounded-lg border border-amber-300/50 px-4 py-2 text-sm font-black text-amber-300 hover:bg-stone-800">← Torna alle linee</button>
      </div>

      <article className="mt-5 overflow-hidden rounded-2xl border border-amber-300/45 bg-gradient-to-br from-[#173c31] via-[#10251f] to-[#151515] shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,360px)_1fr] gap-0">
          <div className="bg-[#f5eedf] p-3 sm:p-4 flex items-center justify-center">
            <img src="/images/alveo-preview-01.webp?v=alveo-live-1" alt="Copertina di 10 Colazioni dell’Alveare" className="block w-full max-w-[340px] h-auto rounded-xl shadow-lg" />
          </div>
          <div className="p-5 sm:p-6 flex flex-col">
            <div className="text-[11px] font-black tracking-[0.12em] uppercase text-amber-400">PDF DIGITALE · EDIZIONE PREMIUM</div>
            <h3 className="mt-2 text-2xl sm:text-3xl font-black leading-tight text-white">10 Colazioni dell’Alveare</h3>
            <p className="mt-3 text-sm sm:text-base font-semibold leading-relaxed text-stone-200">37 pagine con 10 ricette complete, 20 idee lampo, planner e lista della spesa, quiz e degustazione dei mieli.</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-emerald-400/40 bg-emerald-950/60 px-3 py-1.5 text-xs font-black text-emerald-100">Download immediato</span>
              <span className="rounded-full border border-amber-300/40 bg-amber-950/40 px-3 py-1.5 text-xs font-black text-amber-100">Nessuna spedizione</span>
            </div>
            <div className="mt-5 text-3xl font-black text-amber-300">€3,90</div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button type="button" data-alveo-preview-open className="rounded-xl border-2 border-amber-400 px-4 py-3 text-sm font-black text-amber-200 hover:bg-amber-950/40">Anteprima gratuita · 5 pagine</button>
              <button type="button" data-alveo-buy-live className="rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-3 text-sm font-black text-stone-950 shadow-lg">Acquista PDF · €3,90</button>
            </div>
            <p className="mt-3 text-xs font-semibold text-stone-400">L’anteprima mostra le prime 5 pagine complete: copertina, indice e la prima colazione con varianti.</p>
          </div>
        </div>
      </article>

      <div className="mt-5 rounded-xl border border-stone-700 bg-stone-900/80 p-4">
        <div className="text-sm font-black text-white">La raccolta continua</div>
        <p className="mt-1 text-xs sm:text-sm font-semibold leading-relaxed text-stone-300">Nel tempo Alveo Digitale si arricchirà con nuove guide, video narrati e idee regalo digitali. Ogni uscita sarà completa e acquistabile singolarmente: quello che trovi disponibile oggi è già pronto da usare.</p>
      </div>
    </section>`;

  html = html.slice(0, sectionStart) + livePanel + html.slice(sectionEnd);

  html = html.replaceAll(
    'Una nuova area digitale dedicata a ricette, video narrati e idee regalo. I primi contenuti saranno disponibili a breve.',
    'Alveo Digitale è iniziato: il primo contenuto, 10 Colazioni dell’Alveare, è disponibile ora in formato PDF.'
  );
  html = html.replaceAll('Entra in Alveo Digitale', 'Scopri Alveo Digitale');

  const runtimeMarker = 'data-alveo-live-official="true"';
  if (!html.includes(runtimeMarker)) {
    const runtime = `
<style ${runtimeMarker}>
#alveo-live-preview,#alveo-live-buy{position:fixed;inset:0;z-index:999999;background:rgba(0,0,0,.82);display:none;align-items:center;justify-content:center;padding:6px;font-family:Arial,Helvetica,sans-serif}
#alveo-live-preview.open,#alveo-live-buy.open{display:flex}
#alveo-live-preview-modal{width:min(1100px,99vw);height:97vh;max-height:97vh;display:flex;flex-direction:column;overflow:hidden;background:#111;border:2px solid #d89b20;border-radius:18px;box-shadow:0 24px 80px rgba(0,0,0,.55)}
#alveo-live-preview-head{flex:0 0 auto;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 14px;color:#fff;background:#07372b}
#alveo-live-preview-head strong{font-size:17px}
#alveo-live-preview-close{border:1px solid rgba(255,255,255,.45);border-radius:9px;background:transparent;color:#fff;padding:7px 10px;font-weight:900;cursor:pointer}
#alveo-live-preview-body{flex:1 1 auto;min-height:0;overflow:auto;padding:8px;background:#1a1a1a}
.alveo-live-page{display:none;width:min(900px,100%);margin:0 auto;padding:5px;background:#f5eedf;border-radius:12px;text-align:center}
.alveo-live-page.active{display:block}
.alveo-live-page img{display:block;width:100%;height:auto;border-radius:8px}
.alveo-live-page span{display:block;margin:7px 0 2px;font-size:13px;font-weight:900;color:#2b2b2b}
#alveo-live-preview-nav{flex:0 0 auto;display:flex;align-items:center;justify-content:center;gap:10px;padding:8px 12px;background:#0d0d0d}
#alveo-live-preview-nav button{border:0;border-radius:10px;background:#eeb43d;color:#171717;padding:10px 15px;font-weight:950;cursor:pointer;min-width:120px}
#alveo-live-preview-nav button:disabled{opacity:.35;cursor:default}
#alveo-live-preview-counter{min-width:64px;text-align:center;color:#f8e5ad;font-weight:950}
#alveo-live-buy-modal{width:min(530px,96vw);max-height:94vh;overflow:auto;background:#fffaf0;color:#17211c;border:2px solid #e3b44d;border-radius:20px;box-shadow:0 24px 80px rgba(0,0,0,.55)}
#alveo-live-buy-head{padding:18px 20px 14px;background:#07372b;color:#fff;border-radius:17px 17px 0 0}
#alveo-live-buy-head .eyebrow{font-size:11px;font-weight:950;letter-spacing:.12em;text-transform:uppercase;color:#f6d77d}
#alveo-live-buy-head h3{margin:5px 0 0;font-size:24px;line-height:1.08}
#alveo-live-buy-body{padding:18px 20px 20px}
#alveo-live-buy-product{border:1px solid #e8d6aa;background:#fff;border-radius:13px;padding:13px;margin-bottom:14px}
#alveo-live-buy-product strong{display:block;font-size:17px}
#alveo-live-buy-product span{display:block;margin-top:4px;font-size:25px;font-weight:950;color:#9a6710}
#alveo-live-buy label.main{display:block;font-size:13px;font-weight:900;margin:0 0 6px}
#alveo-live-email{width:100%;border:1px solid #bbb3a3;border-radius:10px;padding:12px 13px;font-size:16px;margin-bottom:13px;background:#fff}
#alveo-live-consent-wrap{display:flex;align-items:flex-start;gap:9px;border:1px solid #e0c875;background:#fff6d4;border-radius:11px;padding:11px;margin-bottom:13px;font-size:12px;font-weight:700;line-height:1.4;color:#493500}
#alveo-live-consent{margin-top:2px;transform:scale(1.15)}
#alveo-live-pay{width:100%;border:0;border-radius:12px;background:#e7ad30;color:#17211c;padding:13px 15px;font-size:16px;font-weight:950;cursor:pointer}
#alveo-live-pay:disabled{opacity:.55;cursor:wait}
#alveo-live-buy-error{display:none;margin-top:10px;color:#b91c1c;font-size:13px;font-weight:850;line-height:1.4}
#alveo-live-buy-close{width:100%;margin-top:10px;border:1px solid #c8bea8;border-radius:11px;background:#fff;padding:10px 12px;font-weight:850;color:#3f493f;cursor:pointer}
#alveo-live-terms{margin-top:10px;text-align:center;font-size:11px;color:#6b665d}
#alveo-live-terms a{color:#07543d;font-weight:900;text-decoration:underline}
@media(max-width:700px){
  #alveo-live-preview{padding:2px}
  #alveo-live-preview-modal{width:99.5vw;height:98vh;max-height:98vh;border-radius:11px}
  #alveo-live-preview-body{padding:4px}
  #alveo-live-preview-nav{gap:6px;padding:6px}
  #alveo-live-preview-nav button{min-width:0;flex:1;padding:10px 6px}
  #alveo-live-preview-head strong{font-size:15px}
}
</style>
<script ${runtimeMarker}>
(function(){
  var previewIndex=0;
  var previewLabels=['Copertina','Indice dei contenuti','Le 10 colazioni','Prima ricetta completa','Varianti e idee'];

  function lock(){document.documentElement.dataset.alveoOverflow=document.documentElement.style.overflow||'';document.documentElement.style.overflow='hidden';}
  function unlock(){var old=document.documentElement.dataset.alveoOverflow||'';document.documentElement.style.overflow=old;delete document.documentElement.dataset.alveoOverflow;}

  function ensurePreview(){
    var o=document.getElementById('alveo-live-preview');
    if(o)return o;
    o=document.createElement('div');
    o.id='alveo-live-preview';
    o.setAttribute('aria-hidden','true');
    var pages='';
    for(var i=1;i<=5;i++){
      var n=String(i).padStart(2,'0');
      pages+='<div class="alveo-live-page" data-alveo-page="'+i+'"><img src="/images/alveo-preview-'+n+'.webp?v=alveo-live-1" alt="'+previewLabels[i-1]+'"><span>'+previewLabels[i-1]+'</span></div>';
    }
    o.innerHTML='<div id="alveo-live-preview-modal" role="dialog" aria-modal="true" aria-label="Anteprima 10 Colazioni dell’Alveare"><div id="alveo-live-preview-head"><strong>Anteprima · 10 Colazioni dell’Alveare</strong><button type="button" id="alveo-live-preview-close">✕ Chiudi</button></div><div id="alveo-live-preview-body">'+pages+'</div><div id="alveo-live-preview-nav"><button type="button" id="alveo-live-prev">← Indietro</button><div id="alveo-live-preview-counter">1 / 5</div><button type="button" id="alveo-live-next">Avanti →</button></div></div>';
    document.body.appendChild(o);
    return o;
  }

  function showPreviewPage(i){
    var o=ensurePreview();
    var pages=Array.from(o.querySelectorAll('.alveo-live-page'));
    previewIndex=Math.max(0,Math.min(i,pages.length-1));
    pages.forEach(function(p,idx){p.classList.toggle('active',idx===previewIndex);});
    var c=document.getElementById('alveo-live-preview-counter');
    if(c)c.textContent=(previewIndex+1)+' / '+pages.length;
    var prev=document.getElementById('alveo-live-prev');
    var next=document.getElementById('alveo-live-next');
    if(prev)prev.disabled=previewIndex===0;
    if(next)next.disabled=previewIndex===pages.length-1;
    var body=document.getElementById('alveo-live-preview-body');
    if(body)body.scrollTop=0;
  }

  function openPreview(){
    var o=ensurePreview();
    showPreviewPage(0);
    o.classList.add('open');
    o.setAttribute('aria-hidden','false');
    lock();
  }
  function closePreview(){
    var o=document.getElementById('alveo-live-preview');
    if(o){o.classList.remove('open');o.setAttribute('aria-hidden','true');}
    unlock();
  }

  function ensureBuy(){
    var o=document.getElementById('alveo-live-buy');
    if(o)return o;
    o=document.createElement('div');
    o.id='alveo-live-buy';
    o.setAttribute('aria-hidden','true');
    o.innerHTML='<div id="alveo-live-buy-modal" role="dialog" aria-modal="true" aria-labelledby="alveo-live-buy-title"><div id="alveo-live-buy-head"><div class="eyebrow">ALVEO DIGITALE · DOWNLOAD IMMEDIATO</div><h3 id="alveo-live-buy-title">Completa l’acquisto</h3></div><div id="alveo-live-buy-body"><div id="alveo-live-buy-product"><strong>10 Colazioni dell’Alveare · Edizione Premium</strong><span>€3,90</span></div><label class="main" for="alveo-live-email">Email</label><input id="alveo-live-email" type="email" inputmode="email" autocomplete="email" placeholder="nome@email.it"><label id="alveo-live-consent-wrap"><input id="alveo-live-consent" type="checkbox"><span>Chiedo che la fornitura del contenuto digitale inizi subito dopo il pagamento e riconosco che, con l’avvio del download, perdo il diritto di recesso previsto per il contenuto digitale fornito immediatamente.</span></label><button id="alveo-live-pay" type="button">Procedi al pagamento · €3,90</button><div id="alveo-live-buy-error"></div><button id="alveo-live-buy-close" type="button">Annulla e torna ad Alveo Digitale</button><div id="alveo-live-terms">Consulta anche <a href="/condizioni-vendita.html" target="_blank" rel="noopener">Condizioni di vendita</a> e <a href="/resi-recesso.html" target="_blank" rel="noopener">Resi e recesso</a>.</div></div></div>';
    document.body.appendChild(o);
    return o;
  }

  function openBuy(){
    var o=ensureBuy();
    var err=document.getElementById('alveo-live-buy-error');
    if(err){err.style.display='none';err.textContent='';}
    var pay=document.getElementById('alveo-live-pay');
    if(pay){pay.disabled=false;pay.textContent='Procedi al pagamento · €3,90';}
    o.classList.add('open');
    o.setAttribute('aria-hidden','false');
    lock();
    setTimeout(function(){var e=document.getElementById('alveo-live-email');if(e)e.focus();},50);
  }
  function closeBuy(){
    var o=document.getElementById('alveo-live-buy');
    if(o){o.classList.remove('open');o.setAttribute('aria-hidden','true');}
    unlock();
  }
  function validEmail(v){return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(String(v||'').trim());}
  function buyError(message){
    var e=document.getElementById('alveo-live-buy-error');
    if(e){e.textContent=message;e.style.display='block';}
  }

  async function startPayment(){
    var email=document.getElementById('alveo-live-email');
    var consent=document.getElementById('alveo-live-consent');
    var pay=document.getElementById('alveo-live-pay');
    var value=email?String(email.value||'').trim():'';
    if(!validEmail(value)){buyError('Inserisci un indirizzo email valido.');if(email)email.focus();return;}
    if(!consent||!consent.checked){buyError('Per il download immediato devi confermare la richiesta di fornitura del contenuto digitale.');return;}
    var err=document.getElementById('alveo-live-buy-error');
    if(err){err.style.display='none';err.textContent='';}
    if(pay){pay.disabled=true;pay.textContent='Apertura pagamento sicuro...';}

    try{
      var payload={
        items:[{name:'10 Colazioni dell’Alveare - PDF digitale',amount:3.90,quantity:1}],
        shippingCostOverride:0,
        customer:{email:value},
        email:value,
        notes:'ALVEO_DIGITALE:10_COLAZIONI',
        xpayCart:[{productId:'alveo-digitale-10-colazioni',productName:'10 Colazioni dell’Alveare - PDF digitale'}]
      };
      var response=await fetch('/api/create-checkout-session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      var data=await response.json().catch(function(){return {};});
      if(!response.ok||!data||!data.url)throw new Error(data&&data.error?data.error:'Impossibile avviare il pagamento.');
      try{localStorage.setItem('alveoDigitalPending',JSON.stringify({product:'10-colazioni',ts:Date.now()}));}catch(_){}
      window.location.assign(data.url);
    }catch(error){
      buyError(error&&error.message?error.message:'Impossibile avviare il pagamento. Riprova tra poco.');
      if(pay){pay.disabled=false;pay.textContent='Procedi al pagamento · €3,90';}
    }
  }

  document.addEventListener('click',function(event){
    var openPreviewBtn=event.target&&event.target.closest?event.target.closest('[data-alveo-preview-open]'):null;
    if(openPreviewBtn){event.preventDefault();event.stopPropagation();openPreview();return;}
    var buyBtn=event.target&&event.target.closest?event.target.closest('[data-alveo-buy-live]'):null;
    if(buyBtn){event.preventDefault();event.stopPropagation();openBuy();return;}

    if(event.target&&event.target.id==='alveo-live-preview-close'){event.preventDefault();closePreview();return;}
    if(event.target&&event.target.id==='alveo-live-prev'){event.preventDefault();showPreviewPage(previewIndex-1);return;}
    if(event.target&&event.target.id==='alveo-live-next'){event.preventDefault();showPreviewPage(previewIndex+1);return;}
    if(event.target&&event.target.id==='alveo-live-buy-close'){event.preventDefault();closeBuy();return;}
    if(event.target&&event.target.id==='alveo-live-pay'){event.preventDefault();startPayment();return;}
    if(event.target===document.getElementById('alveo-live-preview')){closePreview();return;}
    if(event.target===document.getElementById('alveo-live-buy')){closeBuy();return;}
  },true);

  document.addEventListener('keydown',function(event){
    var p=document.getElementById('alveo-live-preview');
    var b=document.getElementById('alveo-live-buy');
    if(event.key==='Escape'){
      if(p&&p.classList.contains('open')){closePreview();return;}
      if(b&&b.classList.contains('open')){closeBuy();return;}
    }
    if(p&&p.classList.contains('open')){
      if(event.key==='ArrowLeft')showPreviewPage(previewIndex-1);
      if(event.key==='ArrowRight')showPreviewPage(previewIndex+1);
    }
  });
})();
</script>`;
    html = html.replace('</body>', runtime + '\n</body>');
  }

  const required = [
    'Alveo Digitale è iniziato',
    '10 Colazioni dell’Alveare',
    'data-alveo-preview-open',
    'data-alveo-buy-live',
    "for(var i=1;i<=5;i++)"
  ];
  required.forEach((needle) => {
    if (!html.includes(needle)) throw new Error('Alveo Digitale LIVE incompleto: ' + needle);
  });
  if (html.includes('I primi contenuti saranno disponibili a breve.')) throw new Error('Vecchio messaggio di attesa ancora visibile');

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Cloudflare test] Alveo Digitale ufficiale LIVE: 10 Colazioni acquistabile a €3,90, preview 5 pagine e download post-pagamento.');
} catch (error) {
  console.error('[Cloudflare test] Errore attivazione Alveo Digitale LIVE:', error);
  process.exitCode = 1;
}
