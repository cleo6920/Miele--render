const fs = require('fs');
const path = require('path');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  html = html.replace(/<script id="shop-home-layout-final">[\s\S]*?<\/script>\s*/g, '');

  const script = `<script id="shop-home-layout-final">
(function(){
  let timer=null;

  const hasBack=()=>Array.from(document.querySelectorAll('button,a')).some(el=>/torna alle categor|torna indietro/i.test((el.textContent||'').trim()));
  const isHome=()=>!hasBack() && /\/shop\/?$/i.test(location.pathname);
  const findSearch=()=>Array.from(document.querySelectorAll('input')).find(el=>((el.getAttribute('placeholder')||'').toLowerCase().includes('cerca miele')));
  const findTitle=()=>Array.from(document.querySelectorAll('h1,h2')).find(el=>/L['’]\s*Italiano/i.test(el.textContent||''));
  const findBrand=()=>document.querySelector('.shop-brand-wrap') || Array.from(document.querySelectorAll('div')).find(el=>/La Fabbrica delle Api/i.test((el.textContent||'').trim()) && el.children.length>0);

  function commonAncestor(a,b){
    if(!a||!b)return null;
    let n=a;
    while(n){ if(n.contains(b)) return n; n=n.parentElement; }
    return null;
  }

  function styleTitle(title){
    if(!title)return;
    title.innerHTML='<svg aria-label="Bandiera italiana" role="img" width="44" height="30" viewBox="0 0 30 20" style="flex:none"><rect x="0" y="0" width="10" height="20" fill="green"></rect><rect x="10" y="0" width="10" height="20" fill="white"></rect><rect x="20" y="0" width="10" height="20" fill="red"></rect></svg><span>L\' Italiano Miele</span>';
    title.style.setProperty('font-size','clamp(30px,3.2vw,46px)','important');
    title.style.setProperty('line-height','1','important');
    title.style.setProperty('white-space','nowrap','important');
    title.style.setProperty('display','flex','important');
    title.style.setProperty('align-items','center','important');
    title.style.setProperty('gap','10px','important');
    title.style.setProperty('margin','0','important');
  }

  function ensureLeft(left,title){
    if(!left||!title)return;
    styleTitle(title);
    let subtitle=Array.from(left.querySelectorAll('p')).find(el=>/Prodotti esclusivi dei tesori|Alveoterapia integrata/i.test(el.textContent||''));
    if(!subtitle){ subtitle=document.createElement('p'); title.insertAdjacentElement('afterend',subtitle); }
    subtitle.textContent='Alveoterapia integrata';
    subtitle.style.cssText='font-size:clamp(22px,2.5vw,32px)!important;font-weight:800!important;color:#d96b16!important;margin:8px 0 12px!important;line-height:1.05!important;';

    let row=document.getElementById('home-alveo-actions-final');
    if(!row){
      row=document.createElement('div');
      row.id='home-alveo-actions-final';
      row.innerHTML='<div style="width:172px;height:126px;border-radius:999px;overflow:hidden;border:4px solid #f3b51b;background:#111"><img src="/images/alveoterapia-casetta-hero.jpg" alt="Alveoterapia integrata" style="width:100%;height:100%;object-fit:cover;display:block"></div><div style="width:172px;height:126px;border-radius:999px;overflow:hidden;border:4px solid #f3b51b;background:#111"><img src="/images/hero-prodotti-corretta.jpg" alt="Prodotti per alveoterapia" style="width:100%;height:100%;object-fit:cover;display:block"></div>';
      subtitle.insertAdjacentElement('afterend',row);
    }
    row.style.cssText='display:flex!important;gap:18px!important;align-items:flex-start!important;justify-content:flex-start!important;margin:0!important;';
  }

  function ensureBrand(brand){
    if(!brand)return;
    Array.from(brand.children).forEach(ch=>{ if(ch.id!=='shop-custom-brand-center-final') ch.style.setProperty('display','none','important'); });
    let center=document.getElementById('shop-custom-brand-center-final');
    if(!center){
      center=document.createElement('div');
      center.id='shop-custom-brand-center-final';
      center.innerHTML='<div style="font-family:Georgia,Times New Roman,serif;font-size:clamp(21px,2vw,28px);font-weight:900;line-height:.95;text-transform:uppercase;color:#f2b63d;text-shadow:1px 1px 0 #7c3a00,2px 2px 0 #b85f00;text-align:center;white-space:nowrap">LA FABBRICA DELLE API</div><svg aria-label="Bandiera italiana" role="img" width="34" height="23" viewBox="0 0 30 20" style="display:block;margin:5px auto 0"><rect x="0" y="0" width="10" height="20" fill="green"></rect><rect x="10" y="0" width="10" height="20" fill="white"></rect><rect x="20" y="0" width="10" height="20" fill="red"></rect></svg>';
      brand.appendChild(center);
    }
    center.style.cssText='display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;width:100%!important;height:78px!important;min-height:78px!important;';
  }

  function ensureHives(hero){
    let hives=document.getElementById('shop-brand-hives-stack');
    if(!hives){
      hives=document.createElement('div');
      hives.id='shop-brand-hives-stack';
      hives.innerHTML='<div id="shop-hives-subtitle">Mieli e prodotti dell\'alveare</div><div id="busatello-hives-oval"><img src="/images/alveari-busatello.jpg" alt="Alveari dell Oasi del Busatello" style="width:100%;height:100%;object-fit:cover;object-position:center;display:block"></div>';
      hero.appendChild(hives);
    }
    return hives;
  }

  function apply(){
    if(!isHome()||window.innerWidth<901)return;
    const title=findTitle();
    const brand=findBrand();
    const search=findSearch();
    if(!title||!brand)return;

    const left=title.parentElement;
    let hero=commonAncestor(left,brand) || brand.parentElement || left.parentElement;
    if(!hero)return;

    hero.style.setProperty('position','relative','important');
    hero.style.setProperty('height','315px','important');
    hero.style.setProperty('min-height','315px','important');
    hero.style.setProperty('overflow','visible','important');

    left.style.setProperty('position','absolute','important');
    left.style.setProperty('left','18px','important');
    left.style.setProperty('top','24px','important');
    left.style.setProperty('width','370px','important');
    left.style.setProperty('max-width','36vw','important');
    left.style.setProperty('margin','0','important');
    left.style.setProperty('z-index','40','important');
    ensureLeft(left,title);

    ensureBrand(brand);
    brand.style.setProperty('position','absolute','important');
    brand.style.setProperty('left','50%','important');
    brand.style.setProperty('right','auto','important');
    brand.style.setProperty('top','22px','important');
    brand.style.setProperty('transform','translateX(-50%)','important');
    brand.style.setProperty('width','360px','important');
    brand.style.setProperty('max-width','31vw','important');
    brand.style.setProperty('height','100px','important');
    brand.style.setProperty('min-height','100px','important');
    brand.style.setProperty('padding','8px 14px 10px','important');
    brand.style.setProperty('margin','0','important');
    brand.style.setProperty('overflow','hidden','important');
    brand.style.setProperty('z-index','41','important');

    const hives=ensureHives(hero);
    hives.style.setProperty('position','absolute','important');
    hives.style.setProperty('left','auto','important');
    hives.style.setProperty('right','18px','important');
    hives.style.setProperty('top','74px','important');
    hives.style.setProperty('transform','none','important');
    hives.style.setProperty('width','340px','important');
    hives.style.setProperty('max-width','32vw','important');
    hives.style.setProperty('margin','0','important');
    hives.style.setProperty('padding','0','important');
    hives.style.setProperty('z-index','39','important');
    hives.style.setProperty('display','flex','important');
    hives.style.setProperty('flex-direction','column','important');
    hives.style.setProperty('align-items','center','important');

    const hs=document.getElementById('shop-hives-subtitle');
    if(hs) hs.style.cssText='width:100%!important;text-align:center!important;font-family:Arial,sans-serif!important;font-size:clamp(18px,2vw,27px)!important;font-style:italic!important;font-weight:700!important;color:#fff6e3!important;line-height:1.05!important;white-space:nowrap!important;margin:0 0 6px!important;padding:0!important;';
    const oval=document.getElementById('busatello-hives-oval');
    if(oval) oval.style.cssText='width:100%!important;max-width:340px!important;height:136px!important;margin:0!important;border-radius:999px!important;overflow:hidden!important;border:4px solid #d4af37!important;box-shadow:0 12px 28px rgba(0,0,0,.32)!important;background:#111!important;';

    if(search&&search.parentElement){
      const wrap=search.parentElement;
      const r=wrap.getBoundingClientRect();
      const targetLeft=(window.innerWidth-460)/2;
      const heroRect=hero.getBoundingClientRect();
      const targetTop=heroRect.top+218;
      wrap.style.setProperty('position','relative','important');
      wrap.style.setProperty('width','460px','important');
      wrap.style.setProperty('max-width','46vw','important');
      wrap.style.setProperty('margin','0','important');
      wrap.style.setProperty('z-index','45','important');
      wrap.style.setProperty('transition','none','important');
      wrap.style.setProperty('transform','translate('+Math.round(targetLeft-r.left)+'px,'+Math.round(targetTop-r.top)+'px)','important');
    }
  }

  function schedule(d){clearTimeout(timer);timer=setTimeout(apply,d||60);}
  window.addEventListener('load',()=>[20,80,180,350,700].forEach(d=>setTimeout(apply,d)));
  window.addEventListener('resize',()=>schedule(100));
  document.addEventListener('click',()=>schedule(80),true);
  new MutationObserver(ms=>{if(ms.some(m=>m.type==='childList'))schedule(60);}).observe(document.body,{childList:true,subtree:true});
  schedule(20);
})();
</script>`;

  html = html.replace('</body>', `${script}\n</body>`);
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Layout alto HOME autoritativo applicato.');
} catch (error) {
  console.error('[Miele Artigianale] Errore layout alto HOME:', error);
}
