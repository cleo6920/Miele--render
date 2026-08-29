const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.html');
const serverPath = path.join(__dirname, 'server.js');
const ALVEO_HERO_IMAGE = '/images/alveoterapia-casetta-hero.jpg';
const ALVEO_PRODUCTS_HERO_IMAGE = '/images/hero-prodotti-corretta.jpg';
const BUSATELLO_HIVES_IMAGE = '/images/alveari-busatello.jpg';

try {
  let html = fs.readFileSync(indexPath, 'utf8');

  html = html.replaceAll(
    '<header className="relative w-full py-8 sm:py-12 bg-gradient-to-br from-amber-200 to-amber-50 shadow-lg mb-8">',
    '<header className="relative w-full py-3 sm:py-5 bg-gradient-to-br from-amber-200 to-amber-50 shadow-lg mb-8">'
  );

  html = html.replaceAll(
    '<div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between z-10 relative">',
    '<div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-start justify-between gap-6 z-10 relative">'
  );

  html = html.replaceAll(
    '<div className="flex-grow flex flex-col items-start text-center sm:text-left">',
    '<div className="flex-grow flex flex-col items-start text-left self-start pt-0">'
  );

  const oldLeftTitle = '<h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-amber-800 leading-tight flex items-center gap-3"><svg xmlns="http://www.w3.org/2000/svg" aria-label="Bandiera italiana" role="img" width="60" height="40" viewBox="0 0 30 20"><rect x="0" y="0" width="10" height="20" fill="green" /><rect x="10" y="0" width="10" height="20" fill="white" /><rect x="20" y="0" width="10" height="20" fill="red" /></svg> L\' Italiano</h1>';
  const newLeftTitle = '<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-amber-800 leading-tight flex items-center gap-3"><svg xmlns="http://www.w3.org/2000/svg" aria-label="Bandiera italiana" role="img" width="42" height="28" viewBox="0 0 30 20"><rect x="0" y="0" width="10" height="20" fill="green" /><rect x="10" y="0" width="10" height="20" fill="white" /><rect x="20" y="0" width="10" height="20" fill="red" /></svg> L\' Italiano Miele</h1>';
  html = html.replaceAll(oldLeftTitle, newLeftTitle);

  const oldLeftSubtitle = '<p className="text-xl sm:text-2xl text-stone-700 mt-2 max-w-lg">Prodotti esclusivi dei tesori dell\' alveare</p>';
  const newLeftSubtitle = `<p className="text-2xl sm:text-3xl font-extrabold text-amber-700 mt-2">Alveoterapia integrata</p>
                                <div className="mt-4 flex flex-nowrap items-start gap-3 sm:gap-4 ml-0 sm:ml-0 lg:ml-0">
                                    <div className="w-36 h-28 sm:w-40 sm:h-28 lg:w-44 lg:h-32 rounded-[999px] overflow-hidden border-4 border-amber-400 shadow-2xl bg-stone-900 flex-shrink-0">
                                        <img src="${ALVEO_HERO_IMAGE}" alt="Alveoterapia integrata con diffusore" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="w-36 h-28 sm:w-40 sm:h-28 lg:w-44 lg:h-32 rounded-[999px] overflow-hidden border-4 border-amber-300 shadow-2xl bg-stone-900 flex-shrink-0">
                                        <img src="${ALVEO_PRODUCTS_HERO_IMAGE}" alt="Diffusore, capsule e Unguento Apis" className="w-full h-full object-cover" />
                                    </div>
                                </div>`;
  html = html.replaceAll(oldLeftSubtitle, newLeftSubtitle);

  html = html.replaceAll(
    '<div className="flex-shrink-0 flex flex-col items-end mt-8 sm:mt-0 ml-auto text-right">',
    '<div className="flex-shrink-0 flex flex-col items-end mt-5 sm:mt-0 ml-auto text-right self-start">'
  );

  html = html.replaceAll(
    '<h2 className="text-6xl sm:text-7xl lg:text-8xl font-black text-amber-900 flex flex-col items-end gap-2 text-3d-effect">',
    '<h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-amber-900 flex flex-col items-end gap-1 text-3d-effect">'
  );

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Hero Alveoterapia con ovali affiancati.');
} catch (error) {
  console.error('[Miele Artigianale] Errore aggiornamento hero Alveoterapia:', error);
}

try {
  let server = fs.readFileSync(serverPath, 'utf8');

  server = server.replaceAll(
    '.shop-brand-wrap{min-width:0!important;width:min(760px,calc(100vw - 360px))!important;max-width:min(760px,calc(100vw - 360px))!important;margin-left:auto!important;margin-right:24px!important;overflow:hidden!important;position:relative!important;padding:22px 28px 26px!important;border-radius:28px!important;',
    '.shop-brand-wrap{min-width:0!important;width:min(520px,calc(100vw - 480px))!important;max-width:min(520px,calc(100vw - 480px))!important;margin-left:auto!important;margin-right:24px!important;overflow:hidden!important;position:relative!important;padding:3px 14px 4px!important;border-radius:20px!important;'
  );

  server = server.replaceAll(
    'font-size:clamp(2.35rem,4.6vw,4.9rem)!important;line-height:.94!important;',
    'font-size:clamp(1.4rem,2.45vw,2.45rem)!important;line-height:.84!important;'
  );

  server = server.replaceAll('gap:14px!important;padding-top:10px!important;', 'gap:5px!important;padding-top:0!important;');
  server = server.replaceAll('.shop-subtitle-spin svg{width:60px;height:40px}', '.shop-subtitle-spin svg{width:40px;height:27px}');

  const oldBrandJs = "const title=headings.find(el=>(el.textContent||'').includes('La Fabbrica delle Api'));if(title){title.classList.add('shop-brand-title');if(title.parentElement)title.parentElement.classList.add('shop-brand-wrap');}";
  const newBrandJs = `const title=headings.find(el=>(el.textContent||'').includes('La Fabbrica delle Api'));if(title&&title.parentElement){const brandWrap=title.parentElement;const heroParent=brandWrap.parentElement;brandWrap.classList.add('shop-brand-wrap');brandWrap.style.setProperty('position','absolute','important');brandWrap.style.setProperty('left','50%','important');brandWrap.style.setProperty('top','10px','important');brandWrap.style.setProperty('transform','translateX(-50%)','important');brandWrap.style.setProperty('width','min(360px,30vw)','important');brandWrap.style.setProperty('max-width','min(360px,30vw)','important');brandWrap.style.setProperty('margin','0','important');brandWrap.style.setProperty('z-index','30','important');brandWrap.style.setProperty('padding','8px 14px 10px','important');brandWrap.style.setProperty('border-radius','20px','important');Array.from(brandWrap.children).forEach(ch=>{if(ch.id!=='shop-custom-brand-center')ch.style.setProperty('display','none','important');});let brandCenter=document.getElementById('shop-custom-brand-center');if(!brandCenter){brandCenter=document.createElement('div');brandCenter.id='shop-custom-brand-center';brandCenter.style.cssText='display:flex;align-items:center;justify-content:center;width:100%;min-height:78px;box-sizing:border-box;position:relative;overflow:visible;';const rotating=document.createElement('div');rotating.id='shop-custom-rotating-brand';rotating.style.cssText='display:inline-flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;width:max-content;max-width:100%;margin:0 auto;transform-origin:50% 50%;transform-style:preserve-3d;perspective:1000px;animation:rotate3DLinear 20s infinite linear;';const brandText=document.createElement('div');brandText.textContent='La Fabbrica delle Api';brandText.style.cssText=\"font-family:Georgia,'Times New Roman',serif;font-size:clamp(20px,1.8vw,27px);font-weight:900;line-height:.9;text-transform:uppercase;color:#f2b63d;text-shadow:1px 1px 0 #7c3a00,2px 2px 0 #b85f00;text-align:center;white-space:nowrap;width:auto;display:block;\";const flag=document.createElement('div');flag.innerHTML='<svg aria-label=\"Bandiera italiana\" role=\"img\" width=\"34\" height=\"23\" viewBox=\"0 0 30 20\"><rect x=\"0\" y=\"0\" width=\"10\" height=\"20\" fill=\"green\"/><rect x=\"10\" y=\"0\" width=\"10\" height=\"20\" fill=\"white\"/><rect x=\"20\" y=\"0\" width=\"10\" height=\"20\" fill=\"red\"/></svg>';flag.style.cssText='height:23px;line-height:0;margin:0 auto;';rotating.appendChild(brandText);rotating.appendChild(flag);brandCenter.appendChild(rotating);brandWrap.appendChild(brandCenter);}let stack=document.getElementById('shop-brand-hives-stack');if(!stack&&heroParent){stack=document.createElement('div');stack.id='shop-brand-hives-stack';stack.style.cssText='display:flex;flex-direction:column;align-items:center;flex-shrink:0;margin-left:auto;margin-right:0px;padding-top:48px;';heroParent.appendChild(stack);}else if(stack){stack.style.paddingTop='48px';}let subtitle=document.getElementById('shop-hives-subtitle');if(!subtitle){subtitle=document.createElement('div');subtitle.id='shop-hives-subtitle';subtitle.textContent=\"Mieli e prodotti dell'alveare\";subtitle.style.cssText=\"width:min(420px,calc(100vw - 48px));box-sizing:border-box;text-align:left;margin:10px 0 5px;padding-left:8px;font-family:Arial,sans-serif;font-size:clamp(17px,1.8vw,25px);font-style:italic;font-weight:700;color:#fff6e3;line-height:1.05;white-space:nowrap;\";}let oval=document.getElementById('busatello-hives-oval');if(!oval){oval=document.createElement('div');oval.id='busatello-hives-oval';oval.style.cssText='width:min(420px,calc(100vw - 48px));height:145px;margin:0 auto;border-radius:999px;overflow:hidden;border:4px solid #d4af37;box-shadow:0 12px 28px rgba(0,0,0,.32);background:#111;flex-shrink:0;';const img=document.createElement('img');img.src='${BUSATELLO_HIVES_IMAGE}';img.alt='Alveari dell Oasi del Busatello';img.style.cssText='width:100%;height:100%;object-fit:cover;object-position:center;display:block;';oval.appendChild(img);}if(stack){if(subtitle.parentElement!==stack)stack.appendChild(subtitle);if(oval.parentElement!==stack)stack.appendChild(oval);if(subtitle.nextSibling!==oval)stack.insertBefore(subtitle,oval);}}const productSearch=Array.from(document.querySelectorAll('input')).find(el=>((el.getAttribute('placeholder')||'').toLowerCase().includes('cerca miele')));const hivesOval=document.getElementById('busatello-hives-oval');if(productSearch&&productSearch.parentElement&&hivesOval){const searchWrap=productSearch.parentElement;searchWrap.style.setProperty('position','relative','important');searchWrap.style.setProperty('z-index','20','important');searchWrap.style.setProperty('margin-top','0','important');searchWrap.style.setProperty('transform','none','important');if(window.innerWidth>=760){requestAnimationFrame(()=>{const ovalRect=hivesOval.getBoundingClientRect();const targetWidth=Math.min(460,Math.max(300,ovalRect.left-60));searchWrap.style.setProperty('width',targetWidth+'px','important');searchWrap.style.setProperty('max-width',targetWidth+'px','important');searchWrap.style.setProperty('margin-left','0','important');searchWrap.style.setProperty('margin-right','0','important');requestAnimationFrame(()=>{const searchRect=searchWrap.getBoundingClientRect();const currentOval=hivesOval.getBoundingClientRect();const desiredLeft=Math.max(44,currentOval.left-2-searchRect.width);const desiredTop=currentOval.top+((currentOval.height-searchRect.height)/2)+35;const dx=desiredLeft-searchRect.left;const dy=desiredTop-searchRect.top;searchWrap.style.setProperty('transform','translate('+Math.round(dx)+'px,'+Math.round(dy)+'px)','important');});});}else{searchWrap.style.setProperty('width','calc(100% - 32px)','important');searchWrap.style.setProperty('max-width','42rem','important');searchWrap.style.setProperty('margin-left','auto','important');searchWrap.style.setProperty('margin-right','auto','important');searchWrap.style.setProperty('transform','none','important');}}`;

  if (!server.includes(oldBrandJs)) {
    throw new Error('Hook La Fabbrica delle Api non trovato: intervento annullato');
  }
  server = server.replace(oldBrandJs, newBrandJs);

  fs.writeFileSync(serverPath, server, 'utf8');
  console.log('[Miele Artigianale] Barra ricerca rifinita; box Fabbrica delle Api abbassato.');
} catch (error) {
  console.error('[Miele Artigianale] Errore aggiornamento card Fabbrica delle Api:', error);
}

require('./start.js');
