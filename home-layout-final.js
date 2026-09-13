const fs = require('fs');
const path = require('path');

// Ripristino mirato della geometria hero PRE-SWAP.
// Riferimento: commit 3858dd23194dd0ef732a79058d75255c79de79f5
// (prima del commit 2a51dec0 che spostò alveari al centro e Fabbrica a destra).
try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  html = html.replace(/<script id="shop-home-layout-final">[\s\S]*?<\/script>\s*/g, '');
  html = html.replace(/<style id="shop-home-header-authoritative">[\s\S]*?<\/style>\s*/g, '');

  const controller = `<script id="shop-home-layout-final">
(function(){
  let timer = null;

  function findSearch(){
    return Array.from(document.querySelectorAll('input')).find(function(el){
      return ((el.getAttribute('placeholder') || '').toLowerCase().includes('cerca miele'));
    });
  }

  function apply(){
    if(window.innerWidth < 901) return;

    const brand = document.querySelector('.shop-brand-wrap');
    const hives = document.getElementById('shop-brand-hives-stack');
    const oval = document.getElementById('busatello-hives-oval');
    const subtitle = document.getElementById('shop-hives-subtitle');
    const search = findSearch();
    if(!brand || !hives || !oval) return;

    const hero = brand.parentElement || hives.parentElement;
    if(!hero) return;
    hero.style.setProperty('position','relative','important');

    // Geometria approvata prima dello swap del 29 agosto: Fabbrica al centro.
    brand.style.setProperty('position','absolute','important');
    brand.style.setProperty('left','50%','important');
    brand.style.setProperty('right','auto','important');
    brand.style.setProperty('top','10px','important');
    brand.style.setProperty('transform','translateX(-50%)','important');
    brand.style.setProperty('width','min(360px,30vw)','important');
    brand.style.setProperty('max-width','min(360px,30vw)','important');
    brand.style.setProperty('margin','0','important');
    brand.style.setProperty('padding','8px 14px 10px','important');
    brand.style.setProperty('border-radius','20px','important');
    brand.style.setProperty('z-index','30','important');

    // Alveari a destra.
    hives.style.setProperty('position','absolute','important');
    hives.style.setProperty('left','auto','important');
    hives.style.setProperty('right','18px','important');
    hives.style.setProperty('top','48px','important');
    hives.style.setProperty('transform','none','important');
    hives.style.setProperty('width','min(420px,34vw)','important');
    hives.style.setProperty('max-width','420px','important');
    hives.style.setProperty('margin','0','important');
    hives.style.setProperty('padding','0','important');
    hives.style.setProperty('z-index','28','important');
    hives.style.setProperty('display','flex','important');
    hives.style.setProperty('flex-direction','column','important');
    hives.style.setProperty('align-items','center','important');

    if(subtitle){
      subtitle.style.setProperty('width','100%','important');
      subtitle.style.setProperty('text-align','left','important');
      subtitle.style.setProperty('padding-left','8px','important');
      subtitle.style.setProperty('margin','10px 0 5px','important');
      subtitle.style.setProperty('white-space','nowrap','important');
    }

    oval.style.setProperty('width','100%','important');
    oval.style.setProperty('max-width','420px','important');
    oval.style.setProperty('height','145px','important');
    oval.style.setProperty('margin','0 auto','important');

    // Barra ricerca nel varco a sinistra dell'ovale alveari, come nel commit stabile.
    if(search && search.parentElement){
      const wrap = search.parentElement;
      wrap.style.setProperty('position','relative','important');
      wrap.style.setProperty('z-index','29','important');
      wrap.style.setProperty('margin','0','important');
      wrap.style.setProperty('transition','none','important');
      wrap.style.setProperty('animation','none','important');
      wrap.style.setProperty('transform','none','important');

      requestAnimationFrame(function(){
        const ovalRect = oval.getBoundingClientRect();
        const targetWidth = Math.min(460, Math.max(380, ovalRect.left - 390));
        wrap.style.setProperty('width', targetWidth + 'px','important');
        wrap.style.setProperty('max-width', targetWidth + 'px','important');
        wrap.style.setProperty('margin-left','0','important');
        wrap.style.setProperty('margin-right','0','important');
        requestAnimationFrame(function(){
          const searchRect = wrap.getBoundingClientRect();
          const currentOval = oval.getBoundingClientRect();
          const desiredLeft = Math.max(372, currentOval.left - 6 - searchRect.width);
          const desiredTop = currentOval.top + ((currentOval.height - searchRect.height) / 2) + 34;
          const dx = desiredLeft - searchRect.left;
          const dy = desiredTop - searchRect.top;
          wrap.style.setProperty('transform','translate(' + Math.round(dx) + 'px,' + Math.round(dy) + 'px)','important');
        });
      });
    }

    // Titolo sinistro nella dimensione del layout pre-swap.
    const leftTitle = Array.from(document.querySelectorAll('h1')).find(function(el){
      return /L['’]\s*Italiano Miele/i.test(el.textContent || '');
    });
    if(leftTitle){
      leftTitle.style.setProperty('font-size','clamp(24px,3vw,36px)','important');
      leftTitle.style.setProperty('line-height','1','important');
      leftTitle.style.setProperty('white-space','nowrap','important');
    }
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

  new MutationObserver(function(ms){
    if(ms.some(function(m){ return m.type === 'childList'; })) schedule(70);
  }).observe(document.body,{childList:true,subtree:true});

  schedule(20);
})();
</script>`;

  html = html.replace('</body>', `${controller}\n</body>`);
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Hero ripristinata dalla geometria pre-swap del commit 3858dd: Fabbrica al centro, alveari a destra, ricerca nel varco.');
} catch (error) {
  console.error('[Miele Artigianale] Errore ripristino geometria hero pre-swap:', error);
  process.exitCode = 1;
}
