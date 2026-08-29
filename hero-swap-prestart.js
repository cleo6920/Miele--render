const fs = require('fs');
const path = require('path');

require('./tris-safe-prestart.js');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const swapScript = `<script id="shop-hero-center-swap">
(function(){
  let swapTimer = null;

  function applyHeroSwap(){
    if(window.innerWidth < 901) return;

    const hivesStack = document.getElementById('shop-brand-hives-stack');
    const brandWrap = document.querySelector('.shop-brand-wrap');
    if(!hivesStack || !brandWrap) return;

    const heroParent = brandWrap.parentElement || hivesStack.parentElement;
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
    brandWrap.style.setProperty('right','18px','important');
    brandWrap.style.setProperty('top','10px','important');
    brandWrap.style.setProperty('transform','none','important');
    brandWrap.style.setProperty('width','min(330px,28vw)','important');
    brandWrap.style.setProperty('max-width','330px','important');
    brandWrap.style.setProperty('margin','0','important');
    brandWrap.style.setProperty('z-index','30','important');

    const productSearch = Array.from(document.querySelectorAll('input')).find(el =>
      ((el.getAttribute('placeholder') || '').toLowerCase().includes('cerca miele'))
    );
    if(productSearch && productSearch.parentElement && heroParent){
      const searchWrap = productSearch.parentElement;
      if(searchWrap.parentElement !== heroParent){
        heroParent.appendChild(searchWrap);
      }
      searchWrap.style.setProperty('position','absolute','important');
      searchWrap.style.setProperty('left','auto','important');
      searchWrap.style.setProperty('right','18px','important');
      searchWrap.style.setProperty('top','124px','important');
      searchWrap.style.setProperty('transform','none','important');
      searchWrap.style.setProperty('margin','0','important');
      searchWrap.style.setProperty('width','min(330px,28vw)','important');
      searchWrap.style.setProperty('max-width','330px','important');
      searchWrap.style.setProperty('z-index','29','important');
      searchWrap.style.setProperty('box-sizing','border-box','important');
    }
  }

  function scheduleSwap(delay){
    clearTimeout(swapTimer);
    swapTimer = setTimeout(applyHeroSwap, delay || 100);
  }

  window.addEventListener('load', function(){ scheduleSwap(180); });
  window.addEventListener('resize', function(){ scheduleSwap(160); });
  document.addEventListener('click', function(){ scheduleSwap(120); }, true);

  const observer = new MutationObserver(function(){ scheduleSwap(100); });
  observer.observe(document.body, {childList:true, subtree:true});
})();
</script>`;

  if (/<script id="shop-hero-center-swap">[\s\S]*?<\/script>/.test(html)) {
    html = html.replace(/<script id="shop-hero-center-swap">[\s\S]*?<\/script>/, swapScript);
  } else {
    html = html.replace('</body>', `${swapScript}\n</body>`);
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Alveari abbassati e barra ricerca posizionata sotto Fabbrica delle Api.');
} catch (error) {
  console.error('[Miele Artigianale] Errore regolazione hero:', error);
}
