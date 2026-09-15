const fs = require('fs');
const path = require('path');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');
  if (html.includes('data-bee-wallet-access="true"')) {
    console.log('[Miele Artigianale] Accesso Saldo Api già presente.');
    return;
  }

  const injection = `
<style data-bee-wallet-access="true">
#bee-wallet-access{display:inline-flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:9px 14px;border-radius:12px;background:#f59e0b;color:#111827;border:2px solid #78350f;font-family:system-ui,sans-serif;text-decoration:none;box-shadow:0 5px 16px rgba(0,0,0,.22);white-space:normal;text-align:center;max-width:620px}
#bee-wallet-access .bee-wallet-title{font-size:14px;line-height:1;font-weight:900}
#bee-wallet-access .bee-wallet-copy{font-size:12px;line-height:1.28;font-weight:750}
#bee-wallet-access.fallback{position:fixed;right:14px;top:74px;z-index:99990;max-width:min(620px,calc(100vw - 28px))}
@media(max-width:640px){#bee-wallet-access{max-width:calc(100vw - 24px);padding:8px 11px}#bee-wallet-access .bee-wallet-copy{font-size:11px}}
</style>
<script data-bee-wallet-access="true">
(function(){
  const add=()=>{
    if(document.getElementById('bee-wallet-access'))return;
    const a=document.createElement('a');a.id='bee-wallet-access';a.href='/saldo-api.html';
    a.innerHTML='<span class="bee-wallet-title">🐝 SALDO API</span><span class="bee-wallet-copy">Ogni acquisto ti regala Punti Api. Raggiungi 100 Punti Api e ricevi in omaggio il Cesto delle Api. Clicca qui per vedere quante api hai e quante te ne mancano.</span>';
    const candidates=Array.from(document.querySelectorAll('button,a,[aria-label],[title]'));
    const cart=candidates.find(el=>/carrello|cart/i.test(String(el.textContent||'')+' '+String(el.getAttribute('aria-label')||'')+' '+String(el.getAttribute('title')||'')));
    if(cart&&cart.parentElement){cart.insertAdjacentElement('afterend',a)}else{a.classList.add('fallback');document.body.appendChild(a)}
  };
  const start=()=>{add();new MutationObserver(add).observe(document.body,{childList:true,subtree:true})};
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();
</script>`;

  html = html.includes('</body>') ? html.replace('</body>', `${injection}\n</body>`) : `${html}\n${injection}`;
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Pulsante SALDO API con spiegazione premio aggiunto vicino al carrello.');
} catch (error) {
  console.error('[Miele Artigianale] Errore accesso Saldo Api:', error);
  process.exitCode = 1;
}
