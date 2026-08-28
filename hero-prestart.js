const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.html');
const serverPath = path.join(__dirname, 'server.js');
const ALVEO_HERO_IMAGE = '/images/alveoterapia-donna-hd.jpg';
const ALVEO_PRODUCTS_HERO_IMAGE = '/images/hero-prodotti-corretta.jpg';

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
                                <div className="mt-4 flex flex-wrap items-start gap-4 sm:gap-5">
                                    <div className="w-44 h-32 sm:w-52 sm:h-36 lg:w-60 lg:h-40 rounded-[999px] overflow-hidden border-4 border-amber-400 shadow-2xl bg-stone-900 flex-shrink-0">
                                        <img src="${ALVEO_HERO_IMAGE}" alt="Alveoterapia integrata con diffusore" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="w-52 h-32 sm:w-60 sm:h-36 lg:w-72 lg:h-40 rounded-[999px] overflow-hidden border-4 border-amber-300 shadow-2xl bg-stone-900 flex-shrink-0">
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
  console.log('[Miele Artigianale] Hero Alveoterapia applicato con doppio ovale.');
} catch (error) {
  console.error('[Miele Artigianale] Errore aggiornamento hero Alveoterapia:', error);
}

try {
  let server = fs.readFileSync(serverPath, 'utf8');

  server = server.replaceAll(
    '.shop-brand-wrap{min-width:0!important;width:min(760px,calc(100vw - 360px))!important;max-width:min(760px,calc(100vw - 360px))!important;margin-left:auto!important;margin-right:24px!important;overflow:hidden!important;position:relative!important;padding:22px 28px 26px!important;border-radius:28px!important;',
    '.shop-brand-wrap{min-width:0!important;width:min(520px,calc(100vw - 480px))!important;max-width:min(520px,calc(100vw - 480px))!important;margin-left:auto!important;margin-right:24px!important;overflow:hidden!important;position:relative!important;padding:8px 16px 10px!important;border-radius:20px!important;'
  );

  server = server.replaceAll(
    'font-size:clamp(2.35rem,4.6vw,4.9rem)!important;line-height:.94!important;',
    'font-size:clamp(1.55rem,2.8vw,2.8rem)!important;line-height:.9!important;'
  );

  server = server.replaceAll('gap:14px!important;padding-top:10px!important;', 'gap:8px!important;padding-top:4px!important;');
  server = server.replaceAll('.shop-subtitle-spin svg{width:60px;height:40px}', '.shop-subtitle-spin svg{width:44px;height:29px}');

  if (!server.includes('.shop-brand-wrap p{font-size:clamp(.85rem,1.4vw,1.05rem)!important;')) {
    server = server.replace(
      '.shop-subtitle-spin{display:flex!important;',
      '.shop-brand-wrap p{font-size:clamp(.85rem,1.4vw,1.05rem)!important;line-height:1.1!important;margin-top:4px!important;}\n.shop-subtitle-spin{display:flex!important;'
    );
  }

  if (!server.includes('#busatello-hives-oval{')) {
    server = server.replace(
      '.honey-selection-card{',
      '#busatello-hives-oval{width:min(420px,100%)!important;height:145px!important;margin:10px 24px 0 auto!important;border-radius:999px!important;overflow:hidden!important;border:4px solid #d4af37!important;box-shadow:0 12px 28px rgba(0,0,0,.32)!important;background:#111!important;flex-shrink:0!important}\\n#busatello-hives-oval img{width:100%!important;height:100%!important;object-fit:cover!important;object-position:center!important;display:block!important}\\n.honey-selection-card{'
    );
    server = server.replace(
      '@media(max-width:900px){.shop-brand-wrap{width:calc(100vw - 32px)!important;max-width:calc(100vw - 32px)!important;margin:12px auto!important}}',
      '@media(max-width:900px){.shop-brand-wrap{width:calc(100vw - 32px)!important;max-width:calc(100vw - 32px)!important;margin:10px auto!important}#busatello-hives-oval{width:min(360px,calc(100vw - 48px))!important;height:135px!important;margin:10px auto 0!important}}'
    );
  }

  const oldBrandJs = "const title=headings.find(el=>(el.textContent||'').includes('La Fabbrica delle Api'));if(title){title.classList.add('shop-brand-title');if(title.parentElement)title.parentElement.classList.add('shop-brand-wrap');}";
  const newBrandJs = "const title=headings.find(el=>(el.textContent||'').includes('La Fabbrica delle Api'));if(title){title.classList.add('shop-brand-title');if(title.parentElement){const brandWrap=title.parentElement;brandWrap.classList.add('shop-brand-wrap');if(!document.getElementById('busatello-hives-oval')){const oval=document.createElement('div');oval.id='busatello-hives-oval';oval.innerHTML='<img src=\"/images/alveari-busatello.jpg\" alt=\"Alveari dell\\\'Oasi del Busatello\">';brandWrap.insertAdjacentElement('afterend',oval);}}}";
  server = server.replace(oldBrandJs, newBrandJs);

  fs.writeFileSync(serverPath, server, 'utf8');
  console.log('[Miele Artigianale] Card Fabbrica delle Api più bassa e ovale alveari Busatello predisposto.');
} catch (error) {
  console.error('[Miele Artigianale] Errore aggiornamento card Fabbrica delle Api:', error);
}

require('./start.js');
