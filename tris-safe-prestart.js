const fs = require('fs');
const path = require('path');

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
    for(let i = 0; i < 10 && panel; i++){
      const text = (panel.textContent || '').toLowerCase();
      const r = panel.getBoundingClientRect();
      if(text.includes('scelta tris') && text.includes('totale tris') && r.width > 420 && r.height > 180){
        break;
      }
      panel = panel.parentElement;
    }
    if(!panel) return;

    panel.style.setProperty('width','390px','important');
    panel.style.setProperty('max-width','390px','important');
    panel.style.setProperty('min-width','390px','important');
    panel.style.setProperty('height','auto','important');
    panel.style.setProperty('min-height','0','important');
    panel.style.setProperty('padding','10px 12px','important');
    panel.style.setProperty('border-radius','14px','important');
    panel.style.setProperty('box-sizing','border-box','important');
    panel.style.setProperty('gap','10px','important');
    panel.style.setProperty('margin-top','8px','important');
    panel.style.setProperty('margin-bottom','10px','important');

    const placeholder = Array.from(panel.querySelectorAll('div')).find(el => {
      const t = (el.textContent || '').toLowerCase();
      const r = el.getBoundingClientRect();
      return t.includes('immagine tris') && r.height > 90;
    });
    if(placeholder){
      placeholder.style.setProperty('width','78px','important');
      placeholder.style.setProperty('min-width','78px','important');
      placeholder.style.setProperty('max-width','78px','important');
      placeholder.style.setProperty('height','118px','important');
      placeholder.style.setProperty('min-height','118px','important');
      placeholder.style.setProperty('max-height','118px','important');
      placeholder.style.setProperty('border-radius','10px','important');
    }

    Array.from(panel.querySelectorAll('h1,h2,h3,h4,div,span,p')).forEach(el => {
      const t = (el.textContent || '').trim().toLowerCase();
      if(!t) return;

      if(t === 'tris dolce risveglio'){
        el.style.setProperty('font-size','18px','important');
        el.style.setProperty('line-height','1.05','important');
        el.style.setProperty('margin','0 0 5px 0','important');
      }
      if(t === 'scelta tris'){
        el.style.setProperty('font-size','9px','important');
        el.style.setProperty('padding','3px 7px','important');
        el.style.setProperty('line-height','1','important');
      }
      if(t.includes('miele millefiori') || t.includes('bee energy bio') || t.includes('polline italiano')){
        el.style.setProperty('font-size','11px','important');
        el.style.setProperty('line-height','1.15','important');
      }
      if(t.includes('1 sola spedizione')){
        el.style.setProperty('font-size','10px','important');
        el.style.setProperty('padding','3px 8px','important');
      }
      if(t === '3 prodotti'){
        el.style.setProperty('font-size','9px','important');
        el.style.setProperty('padding','3px 7px','important');
      }
      if(t === 'totale tris'){
        el.style.setProperty('font-size','9px','important');
      }
      if(t === '€ 30,00' || t === '€30,00'){
        el.style.setProperty('font-size','24px','important');
        el.style.setProperty('line-height','1','important');
      }
    });
  }

  function schedule(delay){
    clearTimeout(timer);
    timer = setTimeout(compactTris, delay || 80);
  }

  window.addEventListener('load', function(){ schedule(160); });
  window.addEventListener('resize', function(){ schedule(160); });
  document.addEventListener('click', function(){ schedule(100); }, true);

  const observer = new MutationObserver(function(){ schedule(90); });
  observer.observe(document.body, {childList:true, subtree:true});
})();
</script>`;

  if (/<script id="shop-tris-card-compact-safe">[\s\S]*?<\/script>/.test(html)) {
    html = html.replace(/<script id="shop-tris-card-compact-safe">[\s\S]*?<\/script>/, trisSafeScript);
  } else {
    html = html.replace('</body>', `${trisSafeScript}\n</body>`);
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Card tris ridotta a 390px senza zoom o scale.');
} catch (error) {
  console.error('[Miele Artigianale] Errore compattazione tris:', error);
}
