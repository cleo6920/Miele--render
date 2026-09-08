const fs = require('fs');
const path = require('path');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  if (!html.includes('propoli-spray-format-layout-fix')) {
    const patch = `
<script id="propoli-spray-format-layout-fix">
(() => {
  const normalize = (s) => (s || '').replace(/\\s+/g, ' ').trim();

  function isSprayDetailOpen() {
    return Array.from(document.querySelectorAll('h1,h2,h3')).some(el =>
      normalize(el.textContent).includes('Soluzione Propoli 30% Spray')
    );
  }

  function applyFix() {
    if (!isSprayDetailOpen()) return;

    const wanted = '1 flacone spray - 20 ml';
    const candidates = Array.from(document.querySelectorAll('span,div,p,label'))
      .filter(el => !el.dataset.propoliFormatFixed && normalize(el.textContent) === wanted)
      .filter(el => !Array.from(el.children).some(ch => normalize(ch.textContent) === wanted));

    for (const el of candidates) {
      el.dataset.propoliFormatFixed = '1';
      el.textContent = '';
      el.style.display = 'flex';
      el.style.flexDirection = 'column';
      el.style.alignItems = 'flex-start';
      el.style.justifyContent = 'center';
      el.style.lineHeight = '1.15';
      el.style.gap = '5px';

      const top = document.createElement('span');
      top.textContent = '1 flacone spray';
      top.style.display = 'block';

      const bottom = document.createElement('span');
      bottom.textContent = '20 ml';
      bottom.style.display = 'block';
      bottom.style.fontSize = '0.9em';
      bottom.style.fontWeight = '700';

      el.appendChild(top);
      el.appendChild(bottom);
    }
  }

  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      applyFix();
    });
  };

  const observer = new MutationObserver(schedule);
  const start = () => {
    schedule();
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
</script>`;

    html = html.replace('</body>', patch + '\n</body>');
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Propoli Spray: formato 20 ml separato dal prezzo e posizionato sotto a sinistra.');
} catch (error) {
  console.error('[Miele Artigianale] Errore layout formato Propoli Spray:', error);
  process.exitCode = 1;
}
