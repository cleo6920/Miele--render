const fs = require('fs');
const path = require('path');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const marker = 'data-alveo-purchase-sim="true"';
  if (html.includes(marker)) {
    console.log('[Miele Artigianale] Acquisto digitale simulato Alveo Digitale già presente.');
    return;
  }

  const injection = `
<style ${marker}>
#alveo-sim-overlay{position:fixed;inset:0;z-index:999999;background:rgba(0,0,0,.72);display:none;align-items:center;justify-content:center;padding:16px;font-family:Arial,Helvetica,sans-serif}
#alveo-sim-overlay.open{display:flex}
#alveo-sim-modal{width:min(520px,100%);max-height:92vh;overflow:auto;background:#fffaf0;color:#18231d;border:2px solid #e3b44d;border-radius:20px;box-shadow:0 24px 70px rgba(0,0,0,.45)}
#alveo-sim-head{padding:20px 20px 14px;background:#07372b;color:#fff;border-radius:17px 17px 0 0}
#alveo-sim-head .eyebrow{font-size:11px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:#f6d77d}
#alveo-sim-head h3{margin:5px 0 0;font-size:25px;line-height:1.05;font-weight:900}
#alveo-sim-body{padding:18px 20px 20px}
#alveo-sim-product{border:1px solid #ead8ae;background:#fff;border-radius:14px;padding:14px;margin-bottom:14px}
#alveo-sim-product strong{display:block;font-size:18px;color:#714800}
#alveo-sim-product span{display:block;margin-top:4px;font-size:24px;font-weight:900;color:#9a6710}
#alveo-sim-notice{background:#fff1bf;border:1px solid #e8c75e;border-radius:12px;padding:11px 12px;font-size:13px;font-weight:800;color:#5c4100;margin-bottom:14px}
#alveo-sim-body label{display:block;font-size:13px;font-weight:900;margin:0 0 6px}
#alveo-sim-email{width:100%;border:1px solid #cfc8b8;border-radius:11px;padding:12px 13px;font-size:16px;margin-bottom:12px}
#alveo-sim-card{width:100%;border:0;border-radius:12px;background:#e8b642;color:#1d251f;padding:13px 15px;font-size:16px;font-weight:950;cursor:pointer;box-shadow:0 7px 16px rgba(154,103,16,.18)}
#alveo-sim-card:hover{background:#f1c65d}
#alveo-sim-error{display:none;margin-top:9px;color:#b91c1c;font-size:13px;font-weight:800}
#alveo-sim-success{display:none;text-align:center}
#alveo-sim-success .check{font-size:50px;line-height:1}
#alveo-sim-success h4{margin:8px 0 6px;font-size:23px;color:#07543d}
#alveo-sim-success p{margin:0 0 14px;line-height:1.45;font-weight:700;color:#46534c}
#alveo-sim-download{display:flex;align-items:center;justify-content:center;width:100%;border-radius:12px;background:#0b6b50;color:#fff;text-decoration:none;padding:13px 15px;font-size:16px;font-weight:950}
#alveo-sim-close{width:100%;margin-top:10px;border:1px solid #c8bea8;border-radius:11px;background:#fff;padding:10px 12px;font-weight:850;color:#3f493f;cursor:pointer}
#alveo-sim-processing{display:none;text-align:center;padding:12px 0;font-weight:900;color:#805500}
</style>
<div id="alveo-sim-overlay" ${marker} aria-hidden="true">
  <div id="alveo-sim-modal" role="dialog" aria-modal="true" aria-labelledby="alveo-sim-title">
    <div id="alveo-sim-head">
      <div class="eyebrow">ALVEO DIGITALE · PROVA RENDER</div>
      <h3 id="alveo-sim-title">Simula l'acquisto</h3>
    </div>
    <div id="alveo-sim-body">
      <div id="alveo-sim-checkout">
        <div id="alveo-sim-product">
          <strong>10 Colazioni dell'Alveare</strong>
          <span>€2,90</span>
        </div>
        <div id="alveo-sim-notice">🧪 Questa è una simulazione solo su Render. Nessun importo verrà addebitato e non devi inserire dati reali della carta.</div>
        <label for="alveo-sim-email">Email per la prova</label>
        <input id="alveo-sim-email" type="email" inputmode="email" placeholder="esempio@email.it" autocomplete="email">
        <button id="alveo-sim-card" type="button">💳 Carta · Simula pagamento</button>
        <div id="alveo-sim-error">Inserisci un indirizzo email valido per continuare la simulazione.</div>
        <div id="alveo-sim-processing">Acquisto simulato in corso...</div>
        <button id="alveo-sim-close" type="button">Annulla e torna ai prodotti</button>
      </div>
      <div id="alveo-sim-success">
        <div class="check">✅</div>
        <h4>Acquisto simulato completato</h4>
        <p>Nessun pagamento reale è stato eseguito. Il prodotto digitale è pronto.</p>
        <a id="alveo-sim-download" href="/downloads/10-colazioni-alveare.pdf?v=render1" download="10-Colazioni-dell-Alveare.pdf">⬇ Scarica il prodotto</a>
        <button id="alveo-sim-close-success" type="button" style="width:100%;margin-top:10px;border:1px solid #c8bea8;border-radius:11px;background:#fff;padding:10px 12px;font-weight:850;color:#3f493f;cursor:pointer">Chiudi</button>
      </div>
    </div>
  </div>
</div>
<script ${marker}>
(function(){
  function prepareBuyButton(){
    var btn=document.querySelector('#alveo-digitale-inline-panel [data-alveo-demo="colazioni"], #alveo-digitale-inline-panel [data-alveo-buy="colazioni"]');
    if(!btn)return;
    btn.removeAttribute('data-alveo-demo');
    btn.setAttribute('data-alveo-buy','colazioni');
    btn.textContent='Acquista prova';
    btn.setAttribute('aria-label','Simula acquisto di 10 Colazioni dell’Alveare');
  }

  function overlay(){return document.getElementById('alveo-sim-overlay');}
  function checkout(){return document.getElementById('alveo-sim-checkout');}
  function success(){return document.getElementById('alveo-sim-success');}
  function errorBox(){return document.getElementById('alveo-sim-error');}
  function processing(){return document.getElementById('alveo-sim-processing');}

  function reset(){
    if(checkout()) checkout().style.display='block';
    if(success()) success().style.display='none';
    if(errorBox()) errorBox().style.display='none';
    if(processing()) processing().style.display='none';
    var card=document.getElementById('alveo-sim-card');
    if(card){card.disabled=false;card.textContent='💳 Carta · Simula pagamento';}
  }

  function openCheckout(){
    prepareBuyButton();
    reset();
    var o=overlay();
    if(!o)return;
    o.classList.add('open');
    o.setAttribute('aria-hidden','false');
    setTimeout(function(){var email=document.getElementById('alveo-sim-email');if(email)email.focus();},60);
  }

  function closeCheckout(){
    var o=overlay();
    if(!o)return;
    o.classList.remove('open');
    o.setAttribute('aria-hidden','true');
  }

  function validEmail(value){
    return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(String(value||'').trim());
  }

  function simulatePayment(){
    var email=document.getElementById('alveo-sim-email');
    if(!email || !validEmail(email.value)){
      if(errorBox())errorBox().style.display='block';
      if(email)email.focus();
      return;
    }
    if(errorBox())errorBox().style.display='none';
    var card=document.getElementById('alveo-sim-card');
    if(card){card.disabled=true;card.textContent='Pagamento simulato...';}
    if(processing())processing().style.display='block';
    setTimeout(function(){
      if(processing())processing().style.display='none';
      if(checkout())checkout().style.display='none';
      if(success())success().style.display='block';
    },650);
  }

  document.addEventListener('click',function(event){
    var buy=event.target&&event.target.closest?event.target.closest('[data-alveo-buy="colazioni"]'):null;
    if(buy){
      event.preventDefault();
      event.stopImmediatePropagation();
      openCheckout();
      return;
    }
    if(event.target&&event.target.id==='alveo-sim-card'){
      event.preventDefault();
      simulatePayment();
      return;
    }
    if(event.target&&(['alveo-sim-close','alveo-sim-close-success'].includes(event.target.id))){
      event.preventDefault();
      closeCheckout();
      return;
    }
    if(event.target===overlay()) closeCheckout();
  },true);

  document.addEventListener('keydown',function(event){if(event.key==='Escape')closeCheckout();});

  function start(){
    prepareBuyButton();
    new MutationObserver(prepareBuyButton).observe(document.body,{childList:true,subtree:true});
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();
</script>`;

  html = html.includes('</body>') ? html.replace('</body>', `${injection}\n</body>`) : `${html}\n${injection}`;
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Alveo Digitale: acquisto simulato Carta + download PDF attivi solo su Render.');
} catch (error) {
  console.error('[Miele Artigianale] Errore simulazione acquisto Alveo Digitale:', error);
  process.exitCode = 1;
}
