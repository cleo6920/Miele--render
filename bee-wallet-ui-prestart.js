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
#bee-wallet-access{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:9px 13px;border-radius:999px;background:#f59e0b;color:#111827;border:2px solid #78350f;font:900 13px/1 system-ui,sans-serif;text-decoration:none;box-shadow:0 5px 16px rgba(0,0,0,.22);white-space:nowrap}
#bee-wallet-access.fallback{position:fixed;right:14px;top:74px;z-index:99990}
</style>
<script data-bee-wallet-access="true">
(function(){
  const add=()=>{
    if(document.getElementById('bee-wallet-access'))return;
    const a=document.createElement('a');a.id='bee-wallet-access';a.href='/saldo-api.html';a.textContent='🐝 SALDO API';
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
  console.log('[Miele Artigianale] Pulsante SALDO API aggiunto vicino al carrello con fallback fisso.');
} catch (error) {
  console.error('[Miele Artigianale] Errore accesso Saldo Api:', error);
  process.exitCode = 1;
}
