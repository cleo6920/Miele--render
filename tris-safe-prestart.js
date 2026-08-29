const fs = require('fs');
const path = require('path');

// Mantiene intatto tutto il layout stabile già approvato.
require('./category-layout-prestart.js');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const trisSafeScript = `<script id="shop-tris-card-compact-safe">
(function(){
  let timer = null;

  function compactTris(){
    if(window.innerWidth < 901) return;

    const badge = Array.from(document.querySelectorAll('div,span,p,h2,h3,h4')).find(el =>
      (el.textContent || '').trim().toLowerCase() === 'scelta tris'
    );
    if(!badge) return;

    let panel = badge;
    for(let i = 0; i < 8 && panel; i++){
      const r = panel.getBoundingClientRect();
      if(r.width >= 500 && r.width <= 760 && r.height >= 220 && r.height <= 420) break;
      panel = panel.parentElement;
    }
    if(!panel) return;

    const pr = panel.getBoundingClientRect();
    if(pr.width < 500 || pr.width > 760 || pr.height < 220 || pr.height > 420) return;

    panel.style.setProperty('width','500px','important');
    panel.style.setProperty('max-width','500px','important');
    panel.style.setProperty('min-width','0','important');
    panel.style.setProperty('min-height','0','important');
    panel.style.setProperty('height','auto','important');
    panel.style.setProperty('padding','14px 16px','important');
    panel.style.setProperty('border-radius','16px','important');
    panel.style.setProperty('box-sizing','border-box','important');
    panel.style.setProperty('gap','14px','important');
    panel.style.setProperty('margin-top','10px','important');
    panel.style.setProperty('margin-bottom','14px','important');

    const placeholder = Array.from(panel.querySelectorAll('div')).find(el => {
      const t = (el.textContent || '').toLowerCase();
      const r = el.getBoundingClientRect();
      return t.includes('immagine tris') && r.width >= 90 && r.height >= 120;
    });
    if(placeholder){
      placeholder.style.setProperty('width','100px','important');
      placeholder.style.setProperty('min-width','100px','important');
      placeholder.style.setProperty('max-width','100px','important');
      placeholder.style.setProperty('height','155px','important');
      placeholder.style.setProperty('min-height','155px','important');
      placeholder.style.setProperty('max-height','155px','important');
      placeholder.style.setProperty('border-radius','12px','important');
    }

    Array.from(panel.querySelectorAll('h1,h2,h3,h4,div,span,p')).forEach(el => {
      const t = (el.textContent || '').trim().toLowerCase();
      if(!t) return;

      if(t === 'tris dolce risveglio'){
        el.style.setProperty('font-size','22px','important');
        el.style.setProperty('line-height','1.08','important');
        el.style.setProperty('margin','0 0 8px 0','important');
      }
      if(t === 'scelta tris'){
        el.style.setProperty('font-size','11px','important');
        el.style.setProperty('padding','4px 9px','important');
        el.style.setProperty('line-height','1','important');
      }
      if(t.includes('miele millefiori') || t.includes('bee energy bio') || t.includes('polline italiano')){
        el.style.setProperty('font-size','13px','important');
        el.style.setProperty('line-height','1.22','important');
      }
      if(t.includes('1 sola spedizione')){
        el.style.setProperty('font-size','12px','important');
        el.style.setProperty('padding','4px 10px','important');
      }
      if(t === '3 prodotti'){
        el.style.setProperty('font-size','11px','important');
        el.style.setProperty('padding','4px 9px','important');
      }
      if(t === 'totale tris'){
        el.style.setProperty('font-size','11px','important');
      }
      if(t === '€ 30,00' || t === '€30,00'){
        el.style.setProperty('font-size','30px','important');
        el.style.setProperty('line-height','1','important');
      }
    });
  }

  function schedule(delay){
    clearTimeout(timer);
    timer = setTimeout(compactTris, delay || 90);
  }

  window.addEventListener('load', function(){ schedule(150); });
  window.addEventListener('resize', function(){ schedule(160); });
  document.addEventListener('click', function(){ schedule(100); }, true);

  const observer = new MutationObserver(function(mutations){
    if(mutations.some(m => m.type === 'childList')) schedule(90);
  });
  observer.observe(document.body, {childList:true, subtree:true});
})();
</script>`;

  if (/<script id="shop-tris-card-compact-safe">[\s\S]*?<\/script>/.test(html)) {
    html = html.replace(/<script id="shop-tris-card-compact-safe">[\s\S]*?<\/script>/, trisSafeScript);
  } else {
    html = html.replace('</body>', `${trisSafeScript}\n</body>`);
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Card tris compattata in sicurezza senza zoom o scale.');
} catch (error) {
  console.error('[Miele Artigianale] Errore compattazione sicura tris:', error);
}
