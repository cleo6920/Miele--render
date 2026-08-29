const fs = require('fs');
const path = require('path');

require('./tris-safe-prestart.js');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const swapScript = `<script id="shop-hero-center-swap">
(function(){
  let swapTimer = null;
  let lockTimers = [];

  function getHeroParts(){
    const hivesStack = document.getElementById('shop-brand-hives-stack');
    const brandWrap = document.querySelector('.shop-brand-wrap');
    if(!hivesStack || !brandWrap) return null;
    const heroParent = brandWrap.parentElement || hivesStack.parentElement;
    const productSearch = Array.from(document.querySelectorAll('input')).find(el =>
      ((el.getAttribute('placeholder') || '').toLowerCase().includes('cerca miele'))
    );
    return {hivesStack, brandWrap, heroParent, productSearch};
  }

  function lockSearchPosition(){
    if(window.innerWidth < 901) return;
    const parts = getHeroParts();
    if(!parts || !parts.heroParent || !parts.productSearch || !parts.productSearch.parentElement) return;

    const searchWrap = parts.productSearch.parentElement;
    if(searchWrap.parentElement !== parts.heroParent){
      parts.heroParent.appendChild(searchWrap);
    }

    searchWrap.id = 'shop-locked-product-search';
    searchWrap.style.setProperty('position','absolute','important');
    searchWrap.style.setProperty('left','auto','important');
    searchWrap.style.setProperty('right','12px','important');
    searchWrap.style.setProperty('top','154px','important');
    searchWrap.style.setProperty('bottom','auto','important');
    searchWrap.style.setProperty('transform','none','important');
    searchWrap.style.setProperty('translate','none','important');
    searchWrap.style.setProperty('margin','0','important');
    searchWrap.style.setProperty('margin-left','0','important');
    searchWrap.style.setProperty('margin-right','0','important');
    searchWrap.style.setProperty('width','min(380px,31vw)','important');
    searchWrap.style.setProperty('min-width','0','important');
    searchWrap.style.setProperty('max-width','380px','important');
    searchWrap.style.setProperty('z-index','29','important');
    searchWrap.style.setProperty('box-sizing','border-box','important');
    searchWrap.style.setProperty('transition','none','important');
    searchWrap.style.setProperty('animation','none','important');
    searchWrap.style.setProperty('will-change','auto','important');
  }

  function hardLockSearch(){
    lockTimers.forEach(clearTimeout);
    lockTimers = [];
    lockSearchPosition();
    [40,120,220,380].forEach(delay => {
      lockTimers.push(setTimeout(lockSearchPosition, delay));
    });
  }

  function applyHeroSwap(){
    if(window.innerWidth < 901) return;

    const parts = getHeroParts();
    if(!parts) return;
    const {hivesStack, brandWrap, heroParent} = parts;

    if(heroParent){
      heroParent.style.setProperty('position','relative','important');
    }

    hivesStack.style.setProperty('position','absolute','important');
    hivesStack.style.setProperty('left','50%','important');
    hivesStack.style.setProperty('right','auto','important');
    hivesStack.style.setProperty('top','43px','important');
    hivesStack.style.setProperty('transform','translateX(-50%)','important');
    hivesStack.style.setProperty('margin','0','important');
    hivesStack.style.setProperty('padding-top','0','important');
    hivesStack.style.setProperty('width','min(420px,34vw)','important');
    hivesStack.style.setProperty('max-width','420px','important');
    hivesStack.style.setProperty('z-index','28','important');
    hivesStack.style.setProperty('align-items','center','important');

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
      oval.style.setProperty('margin','0 auto','important');
    }

    brandWrap.style.setProperty('position','absolute','important');
    brandWrap.style.setProperty('left','auto','important');
    brandWrap.style.setProperty('right','12px','important');
    brandWrap.style.setProperty('top','38px','important');
    brandWrap.style.setProperty('transform','none','important');
    brandWrap.style.setProperty('width','min(380px,31vw)','important');
    brandWrap.style.setProperty('max-width','380px','important');
    brandWrap.style.setProperty('margin','0','important');
    brandWrap.style.setProperty('z-index','30','important');

    hardLockSearch();
  }

  function scheduleSwap(delay){
    clearTimeout(swapTimer);
    swapTimer = setTimeout(applyHeroSwap, delay || 100);
  }

  window.addEventListener('load', function(){ scheduleSwap(180); });
  window.addEventListener('resize', function(){ scheduleSwap(160); });

  ['click','pointerdown','focusin','input','change','keyup'].forEach(evt => {
    document.addEventListener(evt, function(e){
      const target = e.target;
      const isSearch = target && target.matches && target.matches('input[placeholder*="Cerca"], input[placeholder*="cerca"]');
      if(isSearch || evt === 'click' || evt === 'pointerdown') hardLockSearch();
    }, true);
  });

  const observer = new MutationObserver(function(){
    scheduleSwap(80);
    hardLockSearch();
  });
  observer.observe(document.body, {childList:true, subtree:true});
})();
</script>`;

  if (/<script id="shop-hero-center-swap">[\s\S]*?<\/script>/.test(html)) {
    html = html.replace(/<script id="shop-hero-center-swap">[\s\S]*?<\/script>/, swapScript);
  } else {
    html = html.replace('</body>', `${swapScript}\n</body>`);
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Barra ricerca bloccata stabilmente sotto Fabbrica delle Api durante uso e cambi vista.');
} catch (error) {
  console.error('[Miele Artigianale] Errore lock barra ricerca hero:', error);
}
