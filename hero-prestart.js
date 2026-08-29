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
  const newLeftTitle = '<h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-amber-800 leading-tight flex items-center gap-3"><svg xmlns="http://www.w3.org/2000/svg" aria-label="Bandiera italiana" role="img" width="48" height="32" viewBox="0 0 30 20"><rect x="0" y="0" width="10" height="20" fill="green" /><rect x="10" y="0" width="10" height="20" fill="white" /><rect x="20" y="0" width="10" height="20" fill="red" /></svg> L\' Italiano Miele</h1>';
  html = html.replaceAll(oldLeftTitle, newLeftTitle);

  const oldLeftSubtitle = '<p className="text-xl sm:text-2xl text-stone-700 mt-2 max-w-lg">Prodotti esclusivi dei tesori dell\' alveare</p>';
  const newLeftSubtitle = `<p className="text-2xl sm:text-3xl font-extrabold text-amber-700 mt-2">Alveoterapia integrata</p>
                                <div id="alveotherapy-hero-ovals" className="mt-4 flex flex-nowrap items-start gap-3 sm:gap-4 ml-16 sm:ml-24 lg:ml-28">
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
    '.shop-brand-wrap{min-width:0!important;width:min(470px,44vw)!important;max-width:min(470px,44vw)!important;margin:0!important;overflow:visible!important;position:relative!important;padding:4px 10px!important;border-radius:18px!important;'
  );

  server = server.replaceAll(
    'font-size:clamp(2.35rem,4.6vw,4.9rem)!important;line-height:.94!important;',
    'font-size:clamp(1.35rem,2.2vw,2.25rem)!important;line-height:.88!important;'
  );

  server = server.replaceAll('gap:14px!important;padding-top:10px!important;', 'gap:5px!important;padding-top:0!important;');
  server = server.replaceAll('.shop-subtitle-spin svg{width:60px;height:40px}', '.shop-subtitle-spin svg{width:36px;height:24px}');

  const oldBrandJs = "const title=headings.find(el=>(el.textContent||'').includes('La Fabbrica delle Api'));if(title){title.classList.add('shop-brand-title');if(title.parentElement)title.parentElement.classList.add('shop-brand-wrap');}";
  const newBrandJs = `const applyPersistentHeroLayout=()=>{try{const liveHeadings=Array.from(document.querySelectorAll('h1,h2,h3'));const liveTitle=liveHeadings.find(el=>(el.textContent||'').includes('La Fabbrica delle Api'));if(!liveTitle||!liveTitle.parentElement)return;const brandWrap=liveTitle.parentElement;brandWrap.classList.add('shop-brand-wrap');brandWrap.style.setProperty('width','min(470px,44vw)','important');brandWrap.style.setProperty('max-width','min(470px,44vw)','important');brandWrap.style.setProperty('padding','4px 10px','important');brandWrap.style.setProperty('border-radius','18px','important');brandWrap.style.setProperty('overflow','visible','important');brandWrap.style.setProperty('margin','0','important');Array.from(brandWrap.children).forEach(ch=>{if(ch.id!=='shop-custom-brand-row')ch.style.setProperty('display','none','important');});let row=document.getElementById('shop-custom-brand-row');if(!row){row=document.createElement('div');row.id='shop-custom-brand-row';row.style.cssText='display:flex;align-items:center;justify-content:center;gap:16px;width:100%;min-height:68px;box-sizing:border-box;white-space:nowrap;';const rotating=document.createElement('div');rotating.id='shop-custom-rotating-brand';rotating.style.cssText='display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;transform-style:preserve-3d;perspective:1000px;animation:rotate3DLinear 20s infinite linear;flex:0 0 auto;';const brandText=document.createElement('div');brandText.textContent='La Fabbrica delle Api';brandText.style.cssText=\"font-family:Georgia,'Times New Roman',serif;font-size:clamp(22px,2.1vw,31px);font-weight:900;line-height:.9;text-transform:uppercase;color:#f2b63d;text-shadow:1px 1px 0 #7c3a00,2px 2px 0 #b85f00;text-align:center;\";const flag=document.createElement('div');flag.innerHTML='<svg aria-label=\"Bandiera italiana\" role=\"img\" width=\"34\" height=\"23\" viewBox=\"0 0 30 20\"><rect x=\"0\" y=\"0\" width=\"10\" height=\"20\" fill=\"green\"/><rect x=\"10\" y=\"0\" width=\"10\" height=\"20\" fill=\"white\"/><rect x=\"20\" y=\"0\" width=\"10\" height=\"20\" fill=\"red\"/></svg>';flag.style.cssText='height:23px;line-height:0;';rotating.appendChild(brandText);rotating.appendChild(flag);const subtitle=document.createElement('div');subtitle.id='shop-custom-brand-subtitle';subtitle.textContent=\"Mieli e prodotti dell'alveare\";subtitle.style.cssText=\"font-family:Arial,sans-serif;font-size:clamp(17px,1.8vw,25px);font-style:italic;font-weight:700;color:#fff6e3;line-height:1.05;text-align:left;flex:0 1 auto;\";row.appendChild(rotating);row.appendChild(subtitle);brandWrap.appendChild(row);}else if(row.parentElement!==brandWrap){brandWrap.appendChild(row);}let stack=document.getElementById('shop-brand-hives-stack');const parent=brandWrap.parentElement;if(!stack&&parent){stack=document.createElement('div');stack.id='shop-brand-hives-stack';stack.style.cssText='display:flex;flex-direction:column;align-items:center;justify-content:flex-start;width:min(470px,44vw);max-width:min(470px,44vw);flex:0 0 auto;margin-left:auto;margin-right:14px;box-sizing:border-box;';parent.insertBefore(stack,brandWrap);stack.appendChild(brandWrap);}else if(stack){stack.style.cssText='display:flex;flex-direction:column;align-items:center;justify-content:flex-start;width:min(470px,44vw);max-width:min(470px,44vw);flex:0 0 auto;margin-left:auto;margin-right:14px;box-sizing:border-box;';if(brandWrap.parentElement!==stack)stack.insertBefore(brandWrap,stack.firstChild);}let oval=document.getElementById('busatello-hives-oval');if(!oval){oval=document.createElement('div');oval.id='busatello-hives-oval';oval.style.cssText='width:min(400px,40vw);height:132px;margin:8px auto 0;border-radius:999px;overflow:hidden;border:4px solid #d4af37;box-shadow:0 12px 28px rgba(0,0,0,.32);background:#111;flex-shrink:0;box-sizing:border-box;';const img=document.createElement('img');img.src='${BUSATELLO_HIVES_IMAGE}';img.alt='Alveari dell Oasi del Busatello';img.style.cssText='width:100%;height:100%;object-fit:cover;object-position:center;display:block;';oval.appendChild(img);}if(stack&&oval.parentElement!==stack)stack.appendChild(oval);const productSearch=Array.from(document.querySelectorAll('input')).find(el=>((el.getAttribute('placeholder')||'').toLowerCase().includes('cerca miele')));if(productSearch&&productSearch.parentElement&&oval){const searchWrap=productSearch.parentElement;searchWrap.style.setProperty('position','relative','important');searchWrap.style.setProperty('z-index','20','important');searchWrap.style.setProperty('margin','0','important');searchWrap.style.setProperty('transform','none','important');if(window.innerWidth>=760){requestAnimationFrame(()=>{const leftImg=Array.from(document.querySelectorAll('img')).find(img=>(img.getAttribute('src')||'').includes('hero-prodotti-corretta'));const leftRect=leftImg&&leftImg.parentElement?leftImg.parentElement.getBoundingClientRect():null;const ovalRect=oval.getBoundingClientRect();const searchRect0=searchWrap.getBoundingClientRect();if(leftRect&&ovalRect.width){const gapLeft=Math.round(leftRect.right+22);const gapRight=Math.round(ovalRect.left-18);const available=Math.max(0,gapRight-gapLeft);if(available>=185){const targetWidth=Math.min(420,available);searchWrap.style.setProperty('width',targetWidth+'px','important');searchWrap.style.setProperty('max-width',targetWidth+'px','important');requestAnimationFrame(()=>{const sr=searchWrap.getBoundingClientRect();const or=oval.getBoundingClientRect();const desiredTop=Math.round(or.top+(or.height-sr.height)/2+10);searchWrap.style.setProperty('transform','translate('+Math.round(gapLeft-sr.left)+'px,'+Math.round(desiredTop-sr.top)+'px)','important');});}else{const targetWidth=Math.min(620,Math.max(320,window.innerWidth-80));searchWrap.style.setProperty('width',targetWidth+'px','important');searchWrap.style.setProperty('max-width',targetWidth+'px','important');requestAnimationFrame(()=>{const sr=searchWrap.getBoundingClientRect();const ovals=document.getElementById('alveotherapy-hero-ovals');const lr=ovals?ovals.getBoundingClientRect():leftRect;const or=oval.getBoundingClientRect();const desiredLeft=Math.max(24,Math.round((window.innerWidth-targetWidth)/2));const desiredTop=Math.round(Math.max(lr.bottom,or.bottom)+18);searchWrap.style.setProperty('transform','translate('+Math.round(desiredLeft-sr.left)+'px,'+Math.round(desiredTop-sr.top)+'px)','important');});}}}});}else if(productSearch&&productSearch.parentElement){const searchWrap=productSearch.parentElement;searchWrap.style.setProperty('width','calc(100% - 32px)','important');searchWrap.style.setProperty('max-width','42rem','important');searchWrap.style.setProperty('margin-left','auto','important');searchWrap.style.setProperty('margin-right','auto','important');searchWrap.style.setProperty('transform','none','important');}}}catch(e){console.error('[Miele Artigianale] Errore layout hero persistente:',e);}};applyPersistentHeroLayout();if(!window.__mielePersistentHeroTimer){window.__mielePersistentHeroTimer=setInterval(applyPersistentHeroLayout,600);}`;

  if (!server.includes(oldBrandJs)) {
    throw new Error('Hook La Fabbrica delle Api non trovato: intervento annullato');
  }
  server = server.replace(oldBrandJs, newBrandJs);

  fs.writeFileSync(serverPath, server, 'utf8');
  console.log('[Miele Artigianale] Layout hero shop reso persistente contro i re-render React.');
} catch (error) {
  console.error('[Miele Artigianale] Errore aggiornamento card Fabbrica delle Api:', error);
}

require('./start.js');
