const fs = require('fs');
const path = require('path');

// Esegue catalogo, tris e trasformazioni statiche già approvate.
require('./restore-alveoterapia-hero.js');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  // Elimina i vecchi controller runtime che continuavano ad agire dopo click/rerender.
  const obsoleteScriptIds = [
    'shop-hero-center-swap',
    'shop-search-hero-gap-restore',
    'shop-admin-hero-mover',
    'shop-product-view-compact',
    'shop-single-product-compact',
    'shop-hero-stable-controller',
    'shop-final-layout-controller'
  ];
  for (const id of obsoleteScriptIds) {
    const re = new RegExp(`<script id="${id}">[\\s\\S]*?<\\/script>\\s*`, 'g');
    html = html.replace(re, '');
  }
  html = html.replace(/<style id="shop-final-layout-css">[\s\S]*?<\/style>\s*/g, '');

  const css = `<style id="shop-final-layout-css">
/* Unica geometria finale della home e delle viste categoria. */
.wrap{transform:none!important;margin-top:4px!important;margin-bottom:0!important;position:relative!important;z-index:1!important;}
.category-grid{transform:none!important;position:relative!important;z-index:1!important;}
#alveoterapia-hero-actions{position:relative!important;z-index:12!important;}
.shop-category-view-stable{position:relative!important;margin-top:0!important;padding-top:0!important;}
.shop-category-title-stable{position:absolute!important;top:2px!important;left:190px!important;right:0!important;margin:0!important;text-align:center!important;line-height:1.05!important;z-index:4!important;}
.shop-category-back-stable{position:absolute!important;top:0!important;left:0!important;margin:0!important;z-index:5!important;}
.shop-category-products-stable{margin-top:58px!important;}
@media (min-width:901px){
  #busatello-hives-oval{height:170px!important;}
}
@media (max-width:900px){
  .shop-category-title-stable{position:relative!important;top:auto!important;left:auto!important;right:auto!important;margin:10px 0 12px!important;text-align:center!important;}
  .shop-category-back-stable{position:relative!important;top:auto!important;left:auto!important;display:inline-flex!important;}
  .shop-category-products-stable{margin-top:0!important;}
}
</style>`;
  html = html.replace('</head>', `${css}\n</head>`);

  const controller = `<script id="shop-final-layout-controller">
(function(){
  let timer = null;
  let observer = null;

  function findSearch(){
    return Array.from(document.querySelectorAll('input')).find(function(el){
      return ((el.getAttribute('placeholder') || '').toLowerCase().includes('cerca miele'));
    });
  }

  function resetProductRuntimeOffsets(){
    // Le vecchie patch prodotto impostavano translateY/margin negativi inline.
    const back = Array.from(document.querySelectorAll('button,a')).find(function(el){
      return /torna alle categor|torna indietro/i.test((el.textContent || '').trim());
    });
    if(!back) return;
    let node = back.parentElement;
    for(let i=0; i<7 && node; i++, node=node.parentElement){
      if(node.style){
        if((node.style.transform || '').includes('translateY')) node.style.removeProperty('transform');
        if((node.style.marginBottom || '').startsWith('-')) node.style.removeProperty('margin-bottom');
      }
    }
  }

  function applyCategoryView(){
    const back = Array.from(document.querySelectorAll('button,a')).find(function(el){
      return /torna alle categor/i.test((el.textContent || '').trim());
    });
    if(!back) return;

    let root = back.parentElement;
    let grid = null;
    let title = null;

    for(let i=0; i<7 && root; i++, root=root.parentElement){
      const grids = Array.from(root.querySelectorAll('.grid')).filter(function(g){
        return !g.classList.contains('category-grid') && g.children && g.children.length >= 1;
      });
      const headings = Array.from(root.querySelectorAll('h1,h2,h3')).filter(function(h){
        const t = (h.textContent || '').trim();
        return t && !/torna alle categor/i.test(t);
      });
      if(grids.length && headings.length){
        grid = grids[0];
        // Preferisci il titolo visivamente più vicino al pulsante indietro.
        const br = back.getBoundingClientRect();
        title = headings.sort(function(a,b){
          return Math.abs(a.getBoundingClientRect().top - br.top) - Math.abs(b.getBoundingClientRect().top - br.top);
        })[0];
        break;
      }
    }

    if(!root || !grid || !title) return;

    root.classList.add('shop-category-view-stable');
    back.classList.add('shop-category-back-stable');
    title.classList.add('shop-category-title-stable');
    grid.classList.add('shop-category-products-stable');

    // Elimina residui inline delle vecchie patch senza introdurre offset negativi.
    root.style.removeProperty('transform');
    root.style.removeProperty('margin-bottom');
    grid.style.removeProperty('transform');
    grid.style.removeProperty('margin-bottom');
  }

  function applyHome(){
    if(window.innerWidth < 901) return;

    const hives = document.getElementById('shop-brand-hives-stack');
    const brand = document.querySelector('.shop-brand-wrap');
    const search = findSearch();
    if(!hives || !brand) return;

    const hero = brand.parentElement || hives.parentElement;
    if(!hero) return;
    hero.style.setProperty('position','relative','important');

    // Centro: titolo + alveari.
    hives.style.setProperty('position','absolute','important');
    hives.style.setProperty('left','50%','important');
    hives.style.setProperty('right','auto','important');
    hives.style.setProperty('top','43px','important');
    hives.style.setProperty('transform','translateX(-50%)','important');
    hives.style.setProperty('margin','0','important');
    hives.style.setProperty('padding-top','0','important');
    hives.style.setProperty('width','min(420px,34vw)','important');
    hives.style.setProperty('max-width','420px','important');
    hives.style.setProperty('z-index','28','important');
    hives.style.setProperty('align-items','center','important');

    const subtitle = document.getElementById('shop-hives-subtitle');
    if(subtitle){
      subtitle.style.setProperty('width','100%','important');
      subtitle.style.setProperty('text-align','center','important');
      subtitle.style.setProperty('padding-left','0','important');
      subtitle.style.setProperty('margin','4px 0 5px','important');
    }
    const oval = document.getElementById('busatello-hives-oval');
    if(oval){
      oval.style.setProperty('width','100%','important');
      oval.style.setProperty('max-width','420px','important');
      oval.style.setProperty('height','170px','important');
      oval.style.setProperty('margin','0 auto','important');
    }

    // Destra: Fabbrica delle Api.
    brand.style.setProperty('position','absolute','important');
    brand.style.setProperty('left','auto','important');
    brand.style.setProperty('right','12px','important');
    brand.style.setProperty('top','38px','important');
    brand.style.setProperty('transform','none','important');
    brand.style.setProperty('width','min(380px,31vw)','important');
    brand.style.setProperty('max-width','380px','important');
    brand.style.setProperty('margin','0','important');
    brand.style.setProperty('z-index','30','important');

    // Barra ricerca: resta figlia del nodo React originale, ma viene tolta dal flusso.
    if(search && search.parentElement){
      const wrap = search.parentElement;
      wrap.style.setProperty('position','absolute','important');
      wrap.style.setProperty('z-index','29','important');
      wrap.style.setProperty('width','min(380px,31vw)','important');
      wrap.style.setProperty('max-width','380px','important');
      wrap.style.setProperty('margin','0','important');
      wrap.style.setProperty('transform','none','important');
      wrap.style.setProperty('transition','none','important');
      wrap.style.setProperty('animation','none','important');

      requestAnimationFrame(function(){
        const offsetParent = wrap.offsetParent || document.documentElement;
        const parentRect = offsetParent.getBoundingClientRect();
        const brandRect = brand.getBoundingClientRect();
        const left = brandRect.left - parentRect.left;
        const top = brandRect.bottom + 18 - parentRect.top;
        wrap.style.setProperty('left', Math.round(left) + 'px','important');
        wrap.style.setProperty('right','auto','important');
        wrap.style.setProperty('top', Math.round(top) + 'px','important');
        wrap.style.setProperty('bottom','auto','important');
      });
    }
  }

  function apply(){
    resetProductRuntimeOffsets();
    applyHome();
    applyCategoryView();
  }

  function schedule(delay){
    clearTimeout(timer);
    timer = setTimeout(apply, delay || 70);
  }

  window.addEventListener('load', function(){
    [40,140,320,650].forEach(function(d){ setTimeout(apply,d); });
  });
  window.addEventListener('resize', function(){ schedule(100); });
  document.addEventListener('click', function(){
    [40,140,300].forEach(function(d){ setTimeout(apply,d); });
  }, true);

  observer = new MutationObserver(function(ms){
    if(ms.some(function(m){ return m.type === 'childList'; })) schedule(70);
  });
  observer.observe(document.body,{childList:true,subtree:true});
  schedule(20);
})();
</script>`;

  html = html.replace('</body>', `${controller}\n</body>`);
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Layout stabile aggiornato: titolo categoria centrato e prodotti più in alto, senza controller concorrenti.');
} catch (error) {
  console.error('[Miele Artigianale] Errore stabilizzazione finale shop:', error);
}
