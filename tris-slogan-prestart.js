const fs = require('fs');
const path = require('path');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const script = `<script id="tris-alveare-category-slogan">
(function(){
  const sloganText = 'Vivi un’esperienza a 360° e ottimizza la spedizione con i nostri tris.';

  function applyTrisSlogan(){
    if (document.querySelector('[data-tris-category-slogan="true"]')) return;

    const allTextNodes = Array.from(document.querySelectorAll('h1,h2,h3,h4,p,span,div,button,a'));
    const hasTrisProducts = allTextNodes.some(el => {
      if (el.closest('#linea-tris-alveare-home')) return false;
      const text = (el.textContent || '').trim();
      return text.includes('Tris dell’Alveare –');
    });
    if (!hasTrisProducts) return;

    const backControl = Array.from(document.querySelectorAll('button,a')).find(el =>
      /torna alle categor/i.test((el.textContent || '').trim())
    );
    if (!backControl || !backControl.parentElement) return;

    const p = document.createElement('p');
    p.setAttribute('data-tris-category-slogan', 'true');
    p.textContent = sloganText;
    p.style.marginTop = '10px';
    p.style.marginBottom = '16px';
    p.style.fontWeight = '800';
    p.style.fontSize = '18px';
    p.style.lineHeight = '1.35';
    p.style.color = '#f59e0b';

    backControl.insertAdjacentElement('afterend', p);
  }

  function schedule(){ setTimeout(applyTrisSlogan, 80); }
  window.addEventListener('load', schedule);
  document.addEventListener('click', schedule, true);
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
})();
</script>`;

  html = html.replace(/<script id="tris-alveare-category-slogan">[\s\S]*?<\/script>/, script);
  if (!html.includes('id="tris-alveare-category-slogan"')) {
    html = html.replace('</body>', `${script}\n</body>`);
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Slogan I Tris dell’Alveare agganciato alla vista reale della categoria.');
} catch (error) {
  console.error('[Miele Artigianale] Errore slogan I Tris dell’Alveare:', error);
  process.exitCode = 1;
}
