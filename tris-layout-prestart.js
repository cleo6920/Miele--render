const fs = require('fs');
const path = require('path');

// Mantiene tutte le regolazioni già approvate e il server esistente.
require('./category-layout-prestart.js');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const trisCompactScript = `<script id="shop-tris-card-compact">
(function(){
  let trisTimer = null;

  function compactTris(){
    if(window.innerWidth < 901) return;

    const marker = Array.from(document.querySelectorAll('div,span,p,h2,h3,h4')).find(el => {
      const t = (el.textContent || '').trim().toLowerCase();
      return t === 'scelta tris' || t.includes('tris dolce risveglio');
    });
    if(!marker) return;

    let panel = marker;
    for(let i = 0; i < 7 && panel; i++){
      const r = panel.getBoundingClientRect();
      if(r.width > 430 && r.height > 220) break;
      panel = panel.parentElement;
    }
    if(!panel) return;

    panel.style.setProperty('zoom','0.78','important');
    panel.style.setProperty('transform-origin','top left','important');
    panel.style.setProperty('margin-top','10px','important');
    panel.style.setProperty('margin-bottom','14px','important');
    panel.style.setProperty('max-width','700px','important');

    const imgBox = Array.from(panel.querySelectorAll('div')).find(el => {
      const t = (el.textContent || '').toLowerCase();
      const r = el.getBoundingClientRect();
      return t.includes('immagine tris') && r.width > 80 && r.height > 120;
    });
    if(imgBox){
      imgBox.style.setProperty('max-height','220px','important');
      imgBox.style.setProperty('min-height','0','important');
    }
  }

  function scheduleTris(delay){
    clearTimeout(trisTimer);
    trisTimer = setTimeout(compactTris, delay || 80);
  }

  window.addEventListener('load', function(){ scheduleTris(140); });
  window.addEventListener('resize', function(){ scheduleTris(160); });
  document.addEventListener('click', function(){ scheduleTris(100); }, true);

  const observer = new MutationObserver(function(mutations){
    if(mutations.some(m => m.type === 'childList')) scheduleTris(90);
  });
  observer.observe(document.body, {childList:true, subtree:true});
})();
</script>`;

  if (/<script id="shop-tris-card-compact">[\s\S]*?<\/script>/.test(html)) {
    html = html.replace(/<script id="shop-tris-card-compact">[\s\S]*?<\/script>/, trisCompactScript);
  } else {
    html = html.replace('</body>', `${trisCompactScript}\n</body>`);
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Box tris compattato su desktop senza alterare contenuti o logica.');
} catch (error) {
  console.error('[Miele Artigianale] Errore compattazione box tris:', error);
}
