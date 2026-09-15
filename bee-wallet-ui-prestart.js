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
#bee-wallet-access{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;padding:8px 12px;border-radius:12px;background:#f59e0b;color:#111827;border:2px solid #78350f;font-family:system-ui,sans-serif;text-decoration:none;box-shadow:0 5px 16px rgba(0,0,0,.22);white-space:normal;text-align:center;width:100%;box-sizing:border-box}
#bee-wallet-access .bee-wallet-title{font-size:13px;line-height:1;font-weight:900}
#bee-wallet-access .bee-wallet-copy{font-size:11px;line-height:1.25;font-weight:750}
#bee-wallet-anchor{position:relative!important}
#bee-wallet-access.search-position{position:absolute;left:0;top:calc(100% + 10px);z-index:35}
#bee-wallet-access.fallback{position:fixed;right:14px;top:74px;z-index:99990;max-width:min(520px,calc(100vw - 28px))}
@media(max-width:640px){#bee-wallet-access{padding:7px 10px}#bee-wallet-access .bee-wallet-title{font-size:12px}#bee-wallet-access .bee-wallet-copy{font-size:10.5px}}
</style>
<script data-bee-wallet-access="true">
(function(){
  const add=()=>{
    if(document.getElementById('bee-wallet-access'))return;
    const a=document.createElement('a');a.id='bee-wallet-access';a.href='/saldo-api.html';
    a.innerHTML='<span class="bee-wallet-title">🐝 SALDO API</span><span class="bee-wallet-copy">Ogni acquisto ti regala Punti Api. A 100 Punti Api ricevi il Cesto delle Api in omaggio. Clicca qui per vedere il tuo saldo.</span>';

    const inputs=Array.from(document.querySelectorAll('input[type="search"],input[placeholder],input'));
    const search=inputs.find(el=>/cerca miele|cerca/i.test(String(el.getAttribute('placeholder')||'')));
    if(search){
      let anchor=search.parentElement;
      if(anchor && anchor.parentElement && anchor.getBoundingClientRect().width < 220) anchor=anchor.parentElement;
      if(anchor){
        anchor.id='bee-wallet-anchor';
        a.classList.add('search-position');
        anchor.appendChild(a);
        return;
      }
    }

    a.classList.add('fallback');
    document.body.appendChild(a);
  };
  const start=()=>{add();new MutationObserver(add).observe(document.body,{childList:true,subtree:true})};
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();
</script>`;

  html = html.includes('</body>') ? html.replace('</body>', `${injection}\n</body>`) : `${html}\n${injection}`;
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Saldo Api spostato sotto la ricerca senza aumentare altezza Hero.');
} catch (error) {
  console.error('[Miele Artigianale] Errore accesso Saldo Api:', error);
  process.exitCode = 1;
}
