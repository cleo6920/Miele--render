const fs = require('fs');
const path = require('path');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const script = `<script id="tris-alveare-category-slogan">
(function(){
  const sloganText = 'Vivi un’esperienza a 360° e ottimizza la spedizione con i nostri tris.';

  function applyTrisSlogan(){
    const headings = Array.from(document.querySelectorAll('h1,h2,h3'));
    const title = headings.find(el => {
      const text = (el.textContent || '').trim();
      return text === 'I Tris dell’Alveare' && !el.closest('#linea-tris-alveare-home');
    });
    if (!title) return;
    if (title.parentElement && title.parentElement.querySelector('[data-tris-category-slogan="true"]')) return;

    const p = document.createElement('p');
    p.setAttribute('data-tris-category-slogan', 'true');
    p.textContent = sloganText;
    p.style.marginTop = '6px';
    p.style.marginBottom = '14px';
    p.style.fontWeight = '700';
    p.style.lineHeight = '1.35';
    p.style.color = '#f59e0b';
    title.insertAdjacentElement('afterend', p);
  }

  window.addEventListener('load', applyTrisSlogan);
  document.addEventListener('click', () => setTimeout(applyTrisSlogan, 60), true);
  new MutationObserver(applyTrisSlogan).observe(document.body, { childList: true, subtree: true });
})();
</script>`;

  html = html.replace(/<script id="tris-alveare-category-slogan">[\s\S]*?<\/script>/, script);
  if (!html.includes('id="tris-alveare-category-slogan"')) {
    html = html.replace('</body>', `${script}\n</body>`);
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Slogan I Tris dell’Alveare aggiunto solo alla pagina categoria.');
} catch (error) {
  console.error('[Miele Artigianale] Errore slogan I Tris dell’Alveare:', error);
  process.exitCode = 1;
}
