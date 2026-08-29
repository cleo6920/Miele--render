const fs = require('fs');
const path = require('path');

require('./category-layout-prestart.js');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const trisSafeScript = `<script id="shop-tris-card-compact-safe">
(function(){
  let timer = null;

  function findBackControl(){
    return Array.from(document.querySelectorAll('button,a')).find(el =>
      /torna indietro/i.test((el.textContent || '').trim())
    );
  }

  function findTrisPanel(){
    const badge = Array.from(document.querySelectorAll('div,span,p,h2,h3,h4')).find(el =>
      (el.textContent || '').trim().toLowerCase() === 'scelta tris'
    );
    if(!badge) return null;

    let panel = badge;
    for(let i = 0; i < 10 && panel; i++){
      const text = (panel.textContent || '').toLowerCase();
      const r = panel.getBoundingClientRect();
      if(text.includes('scelta tris') && text.includes('totale tris') && r.width > 150 && r.height > 100){
        return panel;
      }
      panel = panel.parentElement;
    }
    return null;
  }

  function findProductRoot(){
    const backControl = findBackControl();
    if(!backControl) return null;

    let root = backControl.parentElement;
    for(let i = 0; i < 7 && root; i++){
      const r = root.getBoundingClientRect();
      const text = (root.textContent || '').toLowerCase();
      if(r.width >= 650 && r.width <= 950 && r.height >= 350 && text.includes('scegli il formato')){
        return root;
      }
      root = root.parentElement;
    }
    return null;
  }

  function findProductImage(){
    const backControl = findBackControl();
    if(!backControl) return null;

    let root = backControl.parentElement;
    for(let i = 0; i < 7 && root; i++){
      const images = Array.from(root.querySelectorAll('img')).filter(img => {
        const r = img.getBoundingClientRect();
        return r.width >= 120 && r.height >= 120;
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

  function compactProductDetails(productRoot){
    if(!productRoot) return;

    productRoot.style.setProperty('margin-top','-42px','important');
    productRoot.style.setProperty('max-width','760px','important');
    productRoot.style.setProperty('width','100%','important');
    productRoot.style.setProperty('padding','16px','important');
    productRoot.style.setProperty('box-sizing','border-box','important');
    productRoot.style.setProperty('border-radius','18px','important');

    const headings = Array.from(productRoot.querySelectorAll('h1,h2,h3,h4'));
    const title = headings.find(el => {
      const t = (el.textContent || '').trim().toLowerCase();
      return t && !t.includes('scegli il formato') && !t.includes('scelta tris') && !t.includes('totale tris');
    });
    if(title){
      title.style.setProperty('font-size','32px','important');
      title.style.setProperty('line-height','1.05','important');
      title.style.setProperty('margin-bottom','14px','important');
    }

    const formatLabel = headings.find(el => /scegli il formato/i.test((el.textContent || '').trim()));
    if(formatLabel){
      formatLabel.style.setProperty('font-size','18px','important');
      formatLabel.style.setProperty('line-height','1.1','important');
      formatLabel.style.setProperty('margin-top','14px','important');
      formatLabel.style.setProperty('margin-bottom','10px','important');
    }

    const description = Array.from(productRoot.querySelectorAll('p')).find(el => {
      const t = (el.textContent || '').trim();
      const r = el.getBoundingClientRect();
      return t.length > 100 && r.width > 280 && r.height < 320;
    });
    if(description){
      description.style.setProperty('font-size','16px','important');
      description.style.setProperty('line-height','1.42','important');
      description.style.setProperty('margin-bottom','12px','important');
      description.style.setProperty('max-width','500px','important');
    }

    const optionLeaf = Array.from(productRoot.querySelectorAll('div,span,label,p')).find(el => {
      const t = (el.textContent || '').trim().toLowerCase();
      return /^1 vasetto\s*\(250g\)/i.test(t);
    });
    if(optionLeaf){
      let optionBox = optionLeaf;
      for(let i = 0; i < 6 && optionBox; i++){
        const r = optionBox.getBoundingClientRect();
        if(r.width > 300 && r.height >= 45 && r.height <= 120) break;
        optionBox = optionBox.parentElement;
      }
      if(optionBox && optionBox !== productRoot){
        optionBox.style.setProperty('width','100%','important');
        optionBox.style.setProperty('max-width','480px','important');
        optionBox.style.setProperty('min-height','0','important');
        optionBox.style.setProperty('height','58px','important');
        optionBox.style.setProperty('padding','6px 10px','important');
        optionBox.style.setProperty('box-sizing','border-box','important');
        optionBox.style.setProperty('border-radius','14px','important');
      }
    }

    Array.from(productRoot.querySelectorAll('button')).forEach(btn => {
      const t = (btn.textContent || '').trim().toLowerCase();
      if(t.includes('torna indietro')) return;
      if(t.includes('aggiungi') || t.includes('acquista') || t.includes('carrello')){
        btn.style.setProperty('width','100%','important');
        btn.style.setProperty('max-width','480px','important');
        btn.style.setProperty('min-height','0','important');
        btn.style.setProperty('height','52px','important');
        btn.style.setProperty('padding','8px 14px','important');
        btn.style.setProperty('font-size','17px','important');
        btn.style.setProperty('border-radius','14px','important');
      }
    });

    Array.from(productRoot.querySelectorAll('input[type="number"]')).forEach(input => {
      input.style.setProperty('width','90px','important');
      input.style.setProperty('height','42px','important');
      input.style.setProperty('padding','6px 8px','important');
      input.style.setProperty('font-size','16px','important');
    });

    Array.from(productRoot.querySelectorAll('span,strong,b')).forEach(el => {
      const t = (el.textContent || '').trim();
      if(/^€\s*5,00$/i.test(t)){
        el.style.setProperty('font-size','24px','important');
        el.style.setProperty('line-height','1','important');
      }
    });
  }

  function compactAndPlaceTris(){
    if(window.innerWidth < 901) return;

    const panel = findTrisPanel();
    const productImage = findProductImage();
    const productRoot = findProductRoot();
    if(!panel || !productImage) return;

    compactProductDetails(productRoot);

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
      leftCol.style.setProperty('gap','10px','important');
      leftCol.style.setProperty('width','170px','important');
      leftCol.style.setProperty('min-width','170px','important');
      leftCol.style.setProperty('max-width','170px','important');
      leftCol.style.setProperty('align-self','start','important');

      layoutParent.insertBefore(leftCol, imageWrap);
      leftCol.appendChild(imageWrap);
    } else if(imageWrap.parentElement !== leftCol){
      leftCol.insertBefore(imageWrap, leftCol.firstChild);
    }

    leftCol.style.setProperty('width','170px','important');
    leftCol.style.setProperty('min-width','170px','important');
    leftCol.style.setProperty('max-width','170px','important');
    leftCol.style.setProperty('gap','10px','important');

    if(panel.parentElement !== leftCol){
      leftCol.appendChild(panel);
    }

    imageWrap.style.setProperty('width','170px','important');
    imageWrap.style.setProperty('min-width','170px','important');
    imageWrap.style.setProperty('max-width','170px','important');
    imageWrap.style.setProperty('height','150px','important');
    imageWrap.style.setProperty('max-height','150px','important');
    imageWrap.style.setProperty('overflow','hidden','important');
    imageWrap.style.setProperty('border-radius','11px','important');

    productImage.style.setProperty('width','100%','important');
    productImage.style.setProperty('height','100%','important');
    productImage.style.setProperty('max-width','170px','important');
    productImage.style.setProperty('max-height','150px','important');
    productImage.style.setProperty('object-fit','contain','important');
    productImage.style.setProperty('display','block','important');

    panel.style.setProperty('width','170px','important');
    panel.style.setProperty('min-width','170px','important');
    panel.style.setProperty('max-width','170px','important');
    panel.style.setProperty('height','auto','important');
    panel.style.setProperty('min-height','0','important');
    panel.style.setProperty('padding','8px','important');
    panel.style.setProperty('border-radius','12px','important');
    panel.style.setProperty('box-sizing','border-box','important');
    panel.style.setProperty('margin','0','important');
    panel.style.setProperty('display','grid','important');
    panel.style.setProperty('grid-template-columns','1fr','important');
    panel.style.setProperty('gap','6px','important');
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
      placeholder.style.setProperty('height','62px','important');
      placeholder.style.setProperty('min-height','62px','important');
      placeholder.style.setProperty('max-height','62px','important');
      placeholder.style.setProperty('border-radius','9px','important');
    }

    Array.from(panel.querySelectorAll('h1,h2,h3,h4,div,span,p')).forEach(el => {
      const t = (el.textContent || '').trim().toLowerCase();
      if(!t) return;

      if(t === 'tris dolce risveglio'){
        el.style.setProperty('font-size','14px','important');
        el.style.setProperty('line-height','1.04','important');
        el.style.setProperty('margin','0 0 3px 0','important');
      }
      if(t === 'scelta tris'){
        el.style.setProperty('font-size','7px','important');
        el.style.setProperty('padding','2px 5px','important');
        el.style.setProperty('line-height','1','important');
      }
      if(t.includes('miele millefiori') || t.includes('bee energy bio') || t.includes('polline italiano')){
        el.style.setProperty('font-size','9px','important');
        el.style.setProperty('line-height','1.1','important');
      }
      if(t.includes('1 sola spedizione')){
        el.style.setProperty('font-size','8px','important');
        el.style.setProperty('padding','2px 5px','important');
      }
      if(t === '3 prodotti'){
        el.style.setProperty('font-size','7px','important');
        el.style.setProperty('padding','2px 5px','important');
      }
      if(t === 'totale tris'){
        el.style.setProperty('font-size','7px','important');
      }
      if(t === '€ 30,00' || t === '€30,00'){
        el.style.setProperty('font-size','20px','important');
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
  console.log('[Miele Artigianale] Scheda prodotto singolo alzata e dettagli/acquisto compattati in modo locale.');
} catch (error) {
  console.error('[Miele Artigianale] Errore compattazione scheda prodotto:', error);
}
