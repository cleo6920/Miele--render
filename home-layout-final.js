const fs = require('fs');
const path = require('path');

// HOME/HERO AUTORITATIVA.
// Baseline ricavata dal layout approvato del 29/08 (commit b4018af9):
// Fabbrica piccola centrata, alveari a destra, ricerca nel varco a sinistra degli alveari.
// Questo file viene eseguito per ultimo e neutralizza visivamente i vecchi blocchi hero.
try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  html = html.replace(/<script id="shop-home-layout-final">[\s\S]*?<\/script>\s*/g, '');
  html = html.replace(/<style id="shop-home-header-authoritative">[\s\S]*?<\/style>\s*/g, '');

  const css = `<style id="shop-home-header-authoritative">
@media (min-width:901px){
  .shop-brand-wrap{overflow:hidden!important;box-sizing:border-box!important;}
  #shop-authoritative-brand{display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;width:100%!important;min-height:78px!important;}
  #shop-authoritative-brand .brand-name{font-family:Georgia,'Times New Roman',serif!important;font-size:clamp(20px,1.8vw,27px)!important;font-weight:900!important;line-height:.9!important;text-transform:uppercase!important;color:#f2b63d!important;text-shadow:1px 1px 0 #7c3a00,2px 2px 0 #b85f00!important;text-align:center!important;white-space:nowrap!important;}
  #shop-authoritative-brand .brand-flag{height:23px!important;line-height:0!important;margin:4px auto 0!important;}
}
</style>`;
  html = html.replace('</head>', `${css}\n</head>`);

  const controller = `<script id="shop-home-layout-final">
(function(){
  let timer=null;
  function findSearch(){return Array.from(document.querySelectorAll('input')).find(function(el){return ((el.getAttribute('placeholder')||'').toLowerCase().includes('cerca miele'));});}
  function ensureBrand(brand){
    Array.from(brand.children).forEach(function(ch){if(ch.id!=='shop-authoritative-brand')ch.style.setProperty('display','none','important');});
    let box=document.getElementById('shop-authoritative-brand');
    if(!box){
      box=document.createElement('div'); box.id='shop-authoritative-brand';
      box.innerHTML='<div class="brand-name">La Fabbrica delle Api</div><div class="brand-flag"><svg aria-label="Bandiera italiana" role="img" width="34" height="23" viewBox="0 0 30 20"><rect x="0" y="0" width="10" height="20" fill="green"/><rect x="10" y="0" width="10" height="20" fill="white"/><rect x="20" y="0" width="10" height="20" fill="red"/></svg></div>';
      brand.appendChild(box);
    }
    box.style.setProperty('display','flex','important');
  }
  function apply(){
    if(window.innerWidth<901)return;
    const brand=document.querySelector('.shop-brand-wrap');
    const hives=document.getElementById('shop-brand-hives-stack');
    const oval=document.getElementById('busatello-hives-oval');
    const subtitle=document.getElementById('shop-hives-subtitle');
    const search=findSearch();
    if(!brand||!hives||!oval)return;
    const hero=brand.parentElement||hives.parentElement; if(!hero)return;
    hero.style.setProperty('position','relative','important');

    // Fabbrica: box piccolo e centrato, come nella versione approvata.
    ensureBrand(brand);
    brand.style.setProperty('position','absolute','important');
    brand.style.setProperty('left','50%','important');
    brand.style.setProperty('right','auto','important');
    brand.style.setProperty('top','10px','important');
    brand.style.setProperty('transform','translateX(-50%)','important');
    brand.style.setProperty('width','min(360px,30vw)','important');
    brand.style.setProperty('min-width','0','important');
    brand.style.setProperty('max-width','360px','important');
    brand.style.setProperty('height','auto','important');
    brand.style.setProperty('min-height','0','important');
    brand.style.setProperty('margin','0','important');
    brand.style.setProperty('padding','8px 14px 10px','important');
    brand.style.setProperty('border-radius','20px','important');
    brand.style.setProperty('z-index','30','important');

    // Alveari: colonna a destra, titolo sopra l'ovale.
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
    if(subtitle){subtitle.style.setProperty('width','100%','important');subtitle.style.setProperty('text-align','left','important');subtitle.style.setProperty('padding-left','8px','important');subtitle.style.setProperty('margin','10px 0 5px','important');subtitle.style.setProperty('white-space','nowrap','important');}
    oval.style.setProperty('width','100%','important'); oval.style.setProperty('max-width','420px','important'); oval.style.setProperty('height','145px','important'); oval.style.setProperty('margin','0 auto','important');

    // Barra ricerca: nel varco a sinistra dell'ovale e circa 35px più bassa del centro.
    if(search&&search.parentElement){
      const wrap=search.parentElement;
      wrap.style.setProperty('position','relative','important'); wrap.style.setProperty('z-index','29','important'); wrap.style.setProperty('margin','0','important'); wrap.style.setProperty('transition','none','important'); wrap.style.setProperty('animation','none','important'); wrap.style.setProperty('transform','none','important');
      requestAnimationFrame(function(){
        const or=oval.getBoundingClientRect(); const w=Math.min(460,Math.max(300,or.left-60));
        wrap.style.setProperty('width',w+'px','important'); wrap.style.setProperty('max-width',w+'px','important'); wrap.style.setProperty('margin-left','0','important'); wrap.style.setProperty('margin-right','0','important');
        requestAnimationFrame(function(){
          const sr=wrap.getBoundingClientRect(); const cr=oval.getBoundingClientRect();
          const left=Math.max(44,cr.left-2-sr.width); const top=cr.top+((cr.height-sr.height)/2)+35;
          wrap.style.setProperty('transform','translate('+Math.round(left-sr.left)+'px,'+Math.round(top-sr.top)+'px)','important');
        });
      });
    }

    // Titolo sinistro ridotto, senza invadere il box centrale.
    const leftTitle=Array.from(document.querySelectorAll('h1')).find(function(el){return /L['’]\\s*Italiano Miele/i.test(el.textContent||'');});
    if(leftTitle){leftTitle.style.setProperty('font-size','clamp(24px,3vw,36px)','important');leftTitle.style.setProperty('line-height','1','important');leftTitle.style.setProperty('white-space','nowrap','important');leftTitle.style.setProperty('max-width','410px','important');}
  }
  function schedule(d){clearTimeout(timer);timer=setTimeout(apply,d||70);}
  window.addEventListener('load',function(){[40,140,320,650].forEach(function(d){setTimeout(apply,d);});});
  window.addEventListener('resize',function(){schedule(100);});
  document.addEventListener('click',function(){[40,140,300].forEach(function(d){setTimeout(apply,d);});},true);
  new MutationObserver(function(ms){if(ms.some(function(m){return m.type==='childList';}))schedule(70);}).observe(document.body,{childList:true,subtree:true});
  schedule(20);
})();
</script>`;

  html = html.replace('</body>', `${controller}\n</body>`);
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Home autoritativa applicata dalla baseline b4018af9: Fabbrica piccola centrata, alveari a destra, ricerca nel varco.');
} catch (error) {
  console.error('[Miele Artigianale] Errore baseline home autoritativa:', error);
  process.exitCode=1;
}
