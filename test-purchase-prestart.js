const fs = require('fs');
const path = require('path');

try {
  const enabled = String(process.env.TEST_PURCHASE_MODE || '').trim().toLowerCase() === 'true';
  if (!enabled) {
    console.log('[Miele Artigianale] Modalità acquisto simulato: DISATTIVA. Stripe reale invariato.');
    return;
  }

  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');
  if (html.includes('data-test-purchase-mode="true"')) {
    console.log('[Miele Artigianale] Modalità acquisto simulato già presente nel frontend.');
    return;
  }

  const injection = `
<style data-test-purchase-mode="true">
#test-purchase-badge{position:fixed;right:14px;bottom:14px;z-index:99999;background:#7c2d12;color:#fff7ed;border:2px solid #fb923c;border-radius:14px;padding:10px 14px;font:900 13px/1.2 system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.35);max-width:280px;text-align:center}
#bee-identity-note{margin:0 0 14px;padding:14px 16px;border-radius:14px;background:#fffbeb;border:2px solid #f59e0b;color:#111827;box-shadow:0 8px 20px rgba(245,158,11,.18);font-family:Arial,Helvetica,sans-serif}
#bee-identity-note strong{display:block;font-size:1.05rem;line-height:1.25;margin-bottom:5px;color:#92400e}
#bee-identity-note span{display:block;font-size:.93rem;line-height:1.4;font-weight:700;color:#1f2937}
</style>
<script data-test-purchase-mode="true">
(function(){
  window.__TEST_PURCHASE_MODE__ = true;
  const originalFetch = window.fetch.bind(window);
  window.fetch = function(resource, options){
    try{
      const url = typeof resource === 'string' ? resource : (resource && resource.url) || '';
      const method = options && String(options.method || 'GET').toUpperCase();
      if (/\\/api\\/create-checkout-session/i.test(url) && method === 'POST' && options && typeof options.body === 'string') {
        const body = JSON.parse(options.body || '{}');
        if (!body.testAction) {
          body.testCart = Array.isArray(window.__cart) ? window.__cart : [];
          body.testClient = true;
          options = Object.assign({}, options, { body: JSON.stringify(body) });
        }
      }
    }catch(e){ console.warn('[TEST PURCHASE] Impossibile arricchire payload:', e); }
    return originalFetch(resource, options);
  };

  const addBeeIdentityNotice = () => {
    if (document.getElementById('bee-identity-note')) return;
    const payBtn = document.getElementById('btnCard');
    if (!payBtn) return;
    let panel = payBtn.parentElement;
    for (let i=0; panel && i<8; i++, panel=panel.parentElement) {
      if (/finalizza il tuo ordine/i.test(String(panel.textContent || ''))) break;
    }
    if (!panel) return;
    const emailInput = panel.querySelector('input[type="email"]');
    if (!emailInput || !emailInput.parentNode) return;
    const note = document.createElement('div');
    note.id = 'bee-identity-note';
    note.setAttribute('role','note');
    note.innerHTML = '<strong>🐝 Saldo Api permanente</strong><span>Usa la stessa email o lo stesso telefono per ritrovare automaticamente il saldo. Se hai Coupon Api ottenuti con altri contatti, potrai aggiungerli manualmente dalla pagina SALDO API. I codici non scadono.</span>';
    emailInput.parentNode.insertBefore(note, emailInput);
  };

  const markButtons = () => {
    document.querySelectorAll('button,a').forEach(el => {
      const text = String(el.textContent || '').trim().toLowerCase();
      if (text.includes('paga con carta') && !el.dataset.testPurchaseButton) {
        el.dataset.testPurchaseButton = 'true';
        el.textContent = '🧪 Simula acquisto (TEST)';
      }
    });
    addBeeIdentityNotice();
    if (!document.getElementById('test-purchase-badge')) {
      const badge = document.createElement('div');
      badge.id = 'test-purchase-badge';
      badge.innerHTML = '🧪 MODALITÀ TEST ACQUISTI<br><span style="font-weight:700">Nessun pagamento reale</span>';
      document.body.appendChild(badge);
    }
  };

  const start = () => {
    markButtons();
    new MutationObserver(markButtons).observe(document.body,{childList:true,subtree:true});
  };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', start, {once:true}) : start();
})();
</script>`;

  html = html.includes('</body>') ? html.replace('</body>', `${injection}\n</body>`) : `${html}\n${injection}`;
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Modalità acquisto simulato: ATTIVA; Coupon Api persistenti nel database.');
} catch (error) {
  console.error('[Miele Artigianale] Errore modalità acquisto simulato frontend:', error);
  process.exitCode = 1;
}
