const fs = require('fs');
const path = require('path');

require('./category-layout-prestart.js');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const trisSafeScript = `<script id="shop-tris-card-compact-safe">
(function(){
  let timer = null;

  function findTrisPanel(){
    const badge = Array.from(document.querySelectorAll('div,span,p,h2,h3,h4')).find(el =>
      (el.textContent || '').trim().toLowerCase() === 'scelta tris'
    );
    if(!badge) return null;

    let panel = badge;
    for(let i = 0; i < 10 && panel; i++){
      const text = (panel.textContent || '').toLowerCase();
      const r = panel.getBoundingClientRect();
      if(text.includes('scelta tris') && text.includes('totale tris') && r.width > 300 && r.height > 120){
        return panel;
      }
      panel = panel.parentElement;
    }
    return null;
  }

  function findProductImage(){
    const backControl = Array.from(document.querySelectorAll('button,a')).find(el =>
      /torna indietro/i.test((el.textContent || '').trim())
    );
    if(!backControl) return null;

    let root = backControl.parentElement;
    for(let i = 0; i < 7 && root; i++){
      const images = Array.from(root.querySelectorAll('img')).filter(img => {
        const r = img.getBoundingClientRect();
        return r.width >= 140 && r.height >= 140;
      });
      if(images.length){
        images.sort((a,b) => {
          const ar = a.getBoundingClientRect();
          const br = b.getBoundingClientRect();
          return (br.width * br.height) - (ar.width * ar.height);
        });
        return images[0];
      }
      root = root.parentElement;
    }
    return null;
  }

  function compactAndPlaceTris(){
    if(window.innerWidth < 901) return;

    const panel = findTrisPanel();
    const productImage = findProductImage();
    if(!panel || !productImage) return;

    const imageWrap = productImage.parentElement;
    const layoutParent = imageWrap && imageWrap.parentElement;
    if(!imageWrap || !layoutParent || panel.contains(imageWrap)) return;

    let leftCol = document.getElementById('shop-product-left-column');
    if(!leftCol){
      leftCol = document.createElement('div');
      leftCol.id = 'shop-product-left-column';
      leftCol.style.setProperty('display','flex','important');
      leftCol.style.setProperty('flex-direction','column','important');
      leftCol.style.setProperty('align-items','stretch','important');
      leftCol.style.setProperty('gap','12px','important');
      leftCol.style.setProperty('width','190px','important');
      leftCol.style.setProperty('min-width','190px','important');
      leftCol.style.setProperty('max-width','190px','important');
      leftCol.style.setProperty('align-self','start','important');

      layoutParent.insertBefore(leftCol, imageWrap);
      leftCol.appendChild(imageWrap);
    } else if(imageWrap.parentElement !== leftCol){
      leftCol.insertBefore(imageWrap, leftCol.firstChild);
    }

    if(panel.parentElement !== leftCol){
      leftCol.appendChild(panel);
    }

    imageWrap.style.setProperty('width','190px','important');
    imageWrap.style.setProperty('min-width','190px','important');
    imageWrap.style.setProperty('max-width','190px','important');
    imageWrap.style.setProperty('height','170px','important');
    imageWrap.style.setProperty('max-height','170px','important');
    imageWrap.style.setProperty('overflow','hidden','important');
    imageWrap.style.setProperty('border-radius','12px','important');

    productImage.style.setProperty('width','100%','important');
    productImage.style.setProperty('height','100%','important');
    productImage.style.setProperty('max-width','190px','important');
    productImage.style.setProperty('max-height','170px','important');
    productImage.style.setProperty('object-fit','contain','important');
    productImage.style.setProperty('display','block','important');

    panel.style.setProperty('width','190px','important');
    panel.style.setProperty('min-width','190px','important');
    panel.style.setProperty('max-width','190px','important');
    panel.style.setProperty('height','auto','important');
    panel.style.setProperty('min-height','0','important');
    panel.style.setProperty('padding','10px','important');
    panel.style.setProperty('border-radius','14px','important');
    panel.style.setProperty('box-sizing','border-box','important');
    panel.style.setProperty('margin','0','important');
    panel.style.setProperty('display','grid','important');
    panel.style.setProperty('grid-template-columns','1fr','important');
    panel.style.setProperty('gap','8px','important');
    panel.style.setProperty('align-items','start','important');

    Array.from(panel.children).forEach(child => {
      child.style.setProperty('width','100%','important');
      child.style.setProperty('min-width','0','important');
      child.style.setProperty('max-width','100%','important');
      child.style.setProperty('border-left','0','important');
      child.style.setProperty('padding-left','0','important');
      child.style.setProperty('margin-left','0','important');
    });

    const placeholder = Array.from(panel.querySelectorAll('div')).find(el => {
      const t = (el.textContent || '').toLowerCase();
      return t.includes('immagine tris');
    });
    if(placeholder){
      placeholder.style.setProperty('width','100%','important');
      placeholder.style.setProperty('min-width','0','important');
      placeholder.style.setProperty('max-width','100%','important');
      placeholder.style.setProperty('height','72px','important');
      placeholder.style.setProperty('min-height','72px','important');
      placeholder.style.setProperty('max-height','72px','important');
      placeholder.style.setProperty('border-radius','10px','important');
    }

    Array.from(panel.querySelectorAll('h1,h2,h3,h4,div,span,p')).forEach(el => {
      const t = (el.textContent || '').trim().toLowerCase();
      if(!t) return;

      if(t === 'tris dolce risveglio'){
        el.style.setProperty('font-size','15px','important');
        el.style.setProperty('line-height','1.05','important');
        el.style.setProperty('margin','0 0 4px 0','important');
      }
      if(t === 'scelta tris'){
        el.style.setProperty('font-size','8px','important');
        el.style.setProperty('padding','3px 6px','important');
        el.style.setProperty('line-height','1','important');
      }
      if(t.includes('miele millefiori') || t.includes('bee energy bio') || t.includes('polline italiano')){
        el.style.setProperty('font-size','10px','important');
        el.style.setProperty('line-height','1.12','important');
      }
      if(t.includes('1 sola spedizione')){
        el.style.setProperty('font-size','9px','important');
        el.style.setProperty('padding','3px 6px','important');
      }
      if(t === '3 prodotti'){
        el.style.setProperty('font-size','8px','important');
        el.style.setProperty('padding','3px 6px','important');
      }
      if(t === 'totale tris'){
        el.style.setProperty('font-size','8px','important');
      }
      if(t === '€ 30,00' || t === '€30,00'){
        el.style.setProperty('font-size','22px','important');
        el.style.setProperty('line-height','1','important');
      }
    });
  }

  function schedule(delay){
    clearTimeout(timer);
    timer = setTimeout(compactAndPlaceTris, delay || 90);
  }

  window.addEventListener('load', function(){ schedule(180); });
  window.addEventListener('resize', function(){ schedule(180); });
  document.addEventListener('click', function(){ schedule(120); }, true);

  const observer = new MutationObserver(function(){ schedule(100); });
  observer.observe(document.body, {childList:true, subtree:true});
})();
</script>`;

  if (/<script id="shop-tris-card-compact-safe">[\s\S]*?<\/script>/.test(html)) {
    html = html.replace(/<script id="shop-tris-card-compact-safe">[\s\S]*?<\/script>/, trisSafeScript);
  } else {
    html = html.replace('</body>', `${trisSafeScript}\n</body>`);
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Card tris spostata sotto la foto prodotto in una colonna sinistra dedicata.');
} catch (error) {
  console.error('[Miele Artigianale] Errore layout tris sotto foto:', error);
}
