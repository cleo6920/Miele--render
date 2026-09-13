const fs = require('fs');
const path = require('path');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  // Elimina solo una precedente copia di questo intervento finale, se presente.
  html = html.replace(/<script id="shop-home-layout-final">[\s\S]*?<\/script>\s*/g, '');

  const script = `<script id="shop-home-layout-final">
(function(){
  let timer=null;
  const isHome=()=>{
    const hasBack=Array.from(document.querySelectorAll('button,a')).some(el=>/torna alle categor|torna indietro/i.test((el.textContent||'').trim()));
    return !hasBack && !!document.querySelector('.category-grid');
  };
  const findSearch=()=>Array.from(document.querySelectorAll('input')).find(el=>((el.getAttribute('placeholder')||'').toLowerCase().includes('cerca miele')));
  function ensureFlagTitle(title){
    if(!title)return;
    if(!/L['’]\s*Italiano/i.test(title.textContent||''))return;
    if(!/Miele/i.test(title.textContent||'')){
      title.innerHTML='<svg aria-label="Bandiera italiana" role="img" width="44" height="30" viewBox="0 0 30 20" style="flex:none"><rect x="0" y="0" width="10" height="20" fill="green"></rect><rect x="10" y="0" width="10" height="20" fill="white"></rect><rect x="20" y="0" width="10" height="20" fill="red"></rect></svg><span>L\' Italiano Miele</span>';
    }
    title.style.setProperty('font-size','clamp(30px,3.2vw,46px)','important');
    title.style.setProperty('line-height','1','important');
    title.style.setProperty('white-space','nowrap','important');
    title.style.setProperty('display','flex','important');
    title.style.setProperty('align-items','center','important');
    title.style.setProperty('gap','10px','important');
  }
  function ensureAlveoVisual(left, subtitle){
    if(!left||!subtitle)return;
    subtitle.textContent='Alveoterapia integrata';
    subtitle.style.setProperty('font-size','clamp(22px,2.5vw,32px)','important');
    subtitle.style.setProperty('font-weight','800','important');
    subtitle.style.setProperty('color','#d96b16','important');
    subtitle.style.setProperty('margin','8px 0 12px','important');
    let row=document.getElementById('home-alveo-actions-final');
    if(!row){
      row=document.createElement('div'); row.id='home-alveo-actions-final';
      row.innerHTML='<div style="width:172px;height:126px;border-radius:999px;overflow:hidden;border:4px solid #f3b51b;background:#111"><img src="/images/alveoterapia-casetta-hero.jpg" alt="Alveoterapia integrata" style="width:100%;height:100%;object-fit:cover;display:block"></div><div style="width:172px;height:126px;border-radius:999px;overflow:hidden;border:4px solid #f3b51b;background:#111"><img src="/images/hero-prodotti-corretta.jpg" alt="Prodotti per alveoterapia" style="width:100%;height:100%;object-fit:cover;display:block"></div>';
      subtitle.insertAdjacentElement('afterend',row);
    }
    row.style.cssText='display:flex;gap:18px;align-items:flex-start;justify-content:flex-start;margin:0;';
  }
  function apply(){
    if(!isHome()||window.innerWidth<901)return;
    const brand=document.querySelector('.shop-brand-wrap');
    const hives=document.getElementById('shop-brand-hives-stack');
    const search=findSearch();
    const title=Array.from(document.querySelectorAll('h1')).find(el=>/L['’]\s*Italiano/i.test(el.textContent||''));
    if(!brand||!title)return;
    const left=title.parentElement;
    const hero=brand.parentElement||left.parentElement;
    if(!hero||!left)return;
    hero.style.setProperty('position','relative','important');
    hero.style.setProperty('min-height','315px','important');
    hero.style.setProperty('height','315px','important');
    hero.style.setProperty('align-items','flex-start','important');
    hero.style.setProperty('overflow','visible','important');

    left.style.setProperty('position','absolute','important');
    left.style.setProperty('left','0','important');
    left.style.setProperty('top','24px','important');
    left.style.setProperty('width','360px','important');
    left.style.setProperty('max-width','36vw','important');
    left.style.setProperty('margin','0','important');
    left.style.setProperty('z-index','34','important');
    ensureFlagTitle(title);
    const subtitle=Array.from(left.querySelectorAll('p')).find(el=>/Prodotti esclusivi dei tesori|Alveoterapia integrata/i.test(el.textContent||''));
    if(subtitle)ensureAlveoVisual(left,subtitle);

    brand.style.setProperty('position','absolute','important');
    brand.style.setProperty('left','50%','important');
    brand.style.setProperty('right','auto','important');
    brand.style.setProperty('top','22px','important');
    brand.style.setProperty('transform','translateX(-50%)','important');
    brand.style.setProperty('width','360px','important');
    brand.style.setProperty('max-width','36vw','important');
    brand.style.setProperty('height','100px','important');
    brand.style.setProperty('min-height','100px','important');
    brand.style.setProperty('padding','8px 14px 10px','important');
    brand.style.setProperty('margin','0','important');
    brand.style.setProperty('overflow','hidden','important');
    brand.style.setProperty('z-index','35','important');
    const center=document.getElementById('shop-custom-brand-center');
    if(center){center.style.setProperty('min-height','78px','important');center.style.setProperty('height','78px','important');}

    if(hives){
      hives.style.setProperty('position','absolute','important');
      hives.style.setProperty('left','auto','important');
      hives.style.setProperty('right','0','important');
      hives.style.setProperty('top','78px','important');
      hives.style.setProperty('transform','none','important');
      hives.style.setProperty('width','340px','important');
      hives.style.setProperty('max-width','34vw','important');
      hives.style.setProperty('margin','0','important');
      hives.style.setProperty('padding','0','important');
      hives.style.setProperty('z-index','32','important');
      const hs=document.getElementById('shop-hives-subtitle');
      if(hs){hs.style.setProperty('width','100%','important');hs.style.setProperty('text-align','center','important');hs.style.setProperty('font-size','clamp(18px,2vw,27px)','important');hs.style.setProperty('margin','0 0 6px','important');hs.style.setProperty('padding','0','important');}
      const oval=document.getElementById('busatello-hives-oval');
      if(oval){oval.style.setProperty('width','100%','important');oval.style.setProperty('max-width','340px','important');oval.style.setProperty('height','136px','important');oval.style.setProperty('margin','0','important');}
    }

    if(search&&search.parentElement){
      const wrap=search.parentElement;
      wrap.style.setProperty('position','absolute','important');
      wrap.style.setProperty('left','50%','important');
      wrap.style.setProperty('right','auto','important');
      wrap.style.setProperty('top','222px','important');
      wrap.style.setProperty('transform','translateX(-50%)','important');
      wrap.style.setProperty('width','460px','important');
      wrap.style.setProperty('max-width','46vw','important');
      wrap.style.setProperty('margin','0','important');
      wrap.style.setProperty('z-index','36','important');
      wrap.style.setProperty('transition','none','important');
    }
  }
  function schedule(d){clearTimeout(timer);timer=setTimeout(apply,d||60);}
  window.addEventListener('load',()=>[40,120,260,500].forEach(d=>setTimeout(apply,d)));
  window.addEventListener('resize',()=>schedule(100));
  document.addEventListener('click',()=>schedule(90),true);
  new MutationObserver(ms=>{if(ms.some(m=>m.type==='childList'))schedule(70);}).observe(document.body,{childList:true,subtree:true});
  schedule(30);
})();
</script>`;

  html = html.replace('</body>', `${script}\n</body>`);
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Layout finale HOME applicato senza modificare viste prodotto/categoria.');
} catch (error) {
  console.error('[Miele Artigianale] Errore layout finale HOME:', error);
}
