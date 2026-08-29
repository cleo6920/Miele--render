const fs = require('fs');
const path = require('path');

require('./tris-safe-prestart.js');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const rightCompactScript = `<script id="shop-single-product-right-compact">
(function(){
  let timer = null;

  function findBackControl(){
    return Array.from(document.querySelectorAll('button,a')).find(el =>
      /torna indietro/i.test((el.textContent || '').trim())
    );
  }

  function findProductRoot(){
    const backControl = findBackControl();
    if(!backControl) return null;

    let root = backControl.parentElement;
    for(let i = 0; i < 8 && root; i++){
      const r = root.getBoundingClientRect();
      const text = (root.textContent || '').toLowerCase();
      if(r.width >= 650 && text.includes('scegli il formato')) return root;
      root = root.parentElement;
    }
    return null;
  }

  function compactRightSide(){
    if(window.innerWidth < 901) return;

    const root = findProductRoot();
    if(!root) return;

    const leftCol = document.getElementById('shop-product-left-column');

    root.style.setProperty('max-width','720px','important');
    root.style.setProperty('padding','14px 16px','important');
    root.style.setProperty('border-radius','16px','important');

    const title = Array.from(root.querySelectorAll('h1,h2,h3')).find(el => {
      if(leftCol && leftCol.contains(el)) return false;
      const t = (el.textContent || '').trim();
      return /^miele\b/i.test(t) || /^propol/i.test(t) || /^balsam/i.test(t) || /^euca/i.test(t);
    });
    if(title){
      title.style.setProperty('font-size','30px','important');
      title.style.setProperty('line-height','1.05','important');
      title.style.setProperty('margin-bottom','10px','important');
    }

    const formatLabel = Array.from(root.querySelectorAll('h2,h3,h4,p,div')).find(el => {
      if(leftCol && leftCol.contains(el)) return false;
      return (el.textContent || '').trim().toLowerCase() === 'scegli il formato:';
    });
    if(formatLabel){
      formatLabel.style.setProperty('font-size','20px','important');
      formatLabel.style.setProperty('line-height','1.1','important');
      formatLabel.style.setProperty('margin','14px 0 10px','important');
    }

    const candidates = Array.from(root.querySelectorAll('p,div')).filter(el => {
      if(leftCol && leftCol.contains(el)) return false;
      const t = (el.textContent || '').trim();
      return t.length > 140 && !/scegli il formato/i.test(t) && !/1 vasetto/i.test(t);
    });
    candidates.sort((a,b) => (a.textContent || '').length - (b.textContent || '').length);
    const description = candidates[0];
    if(description){
      description.style.setProperty('font-size','15px','important');
      description.style.setProperty('line-height','1.42','important');
      description.style.setProperty('margin-bottom','10px','important');
      description.style.setProperty('max-width','510px','important');
    }

    const optionText = Array.from(root.querySelectorAll('div,span,p,label')).find(el => {
      if(leftCol && leftCol.contains(el)) return false;
      const t = (el.textContent || '').trim().toLowerCase();
      return t.includes('1 vasetto') && t.includes('250g');
    });

    if(optionText){
      let optionCard = optionText;
      for(let i = 0; i < 6 && optionCard; i++){
        const r = optionCard.getBoundingClientRect();
        if(r.width >= 350 && r.height >= 55 && r.height <= 130) break;
        optionCard = optionCard.parentElement;
      }
      if(optionCard){
        optionCard.style.setProperty('max-width','500px','important');
        optionCard.style.setProperty('min-height','54px','important');
        optionCard.style.setProperty('height','auto','important');
        optionCard.style.setProperty('padding','7px 10px','important');
        optionCard.style.setProperty('border-radius','14px','important');
        optionCard.style.setProperty('margin-bottom','10px','important');

        Array.from(optionCard.querySelectorAll('div,span,p,label,strong')).forEach(el => {
          const t = (el.textContent || '').trim();
          if(/1 vasetto/i.test(t) || /€\s*5,00/i.test(t)){
            el.style.setProperty('font-size','18px','important');
            el.style.setProperty('line-height','1.1','important');
          }
        });
      }
    }

    const purchaseButtons = Array.from(root.querySelectorAll('button,a')).filter(el => {
      if(leftCol && leftCol.contains(el)) return false;
      const t = (el.textContent || '').trim().toLowerCase();
      const r = el.getBoundingClientRect();
      return r.width >= 300 && (t.includes('aggiungi') || t.includes('acquista') || t.includes('carrello') || (r.height >= 45 && r.height <= 90));
    });
    purchaseButtons.forEach(btn => {
      btn.style.setProperty('max-width','500px','important');
      btn.style.setProperty('height','48px','important');
      btn.style.setProperty('min-height','48px','important');
      btn.style.setProperty('padding','8px 14px','important');
      btn.style.setProperty('border-radius','14px','important');
      btn.style.setProperty('font-size','17px','important');
      btn.style.setProperty('margin-top','8px','important');
    });

    Array.from(root.children).forEach(child => {
      if(child === leftCol) return;
      const r = child.getBoundingClientRect();
      if(r.width > 500){
        child.style.setProperty('max-width','520px','important');
      }
    });
  }

  function schedule(delay){
    clearTimeout(timer);
    timer = setTimeout(compactRightSide, delay || 100);
  }

  window.addEventListener('load', function(){ schedule(200); });
  window.addEventListener('resize', function(){ schedule(180); });
  document.addEventListener('click', function(){ schedule(120); }, true);

  const observer = new MutationObserver(function(){ schedule(110); });
  observer.observe(document.body, {childList:true, subtree:true});
})();
</script>`;

  if (/<script id="shop-single-product-right-compact">[\s\S]*?<\/script>/.test(html)) {
    html = html.replace(/<script id="shop-single-product-right-compact">[\s\S]*?<\/script>/, rightCompactScript);
  } else {
    html = html.replace('</body>', `${rightCompactScript}\n</body>`);
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Colonna destra prodotto singolo compattata; immagini a sinistra invariate.');
} catch (error) {
  console.error('[Miele Artigianale] Errore compattazione colonna destra:', error);
}
