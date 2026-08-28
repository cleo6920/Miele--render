const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.html');
const serverPath = path.join(__dirname, 'server.js');
const ALVEO_HERO_IMAGE = '/images/alveoterapia-donna.jpg';

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
  const newLeftSubtitle = `<p className="text-2xl sm:text-3xl font-extrabold text-amber-700 mt-2">Alveoterapia integrata</p>\n                                <div className="mt-4 w-44 h-44 sm:w-52 sm:h-52 lg:w-56 lg:h-56 rounded-full overflow-hidden border-4 border-amber-400 shadow-2xl bg-stone-900 flex-shrink-0">\n                                    <img src="${ALVEO_HERO_IMAGE}" alt="Alveoterapia integrata con diffusore" className="w-full h-full object-cover" />\n                                </div>`;
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
  console.log('[Miele Artigianale] Hero Alveoterapia applicato.');
} catch (error) {
  console.error('[Miele Artigianale] Errore aggiornamento hero Alveoterapia:', error);
}

try {
  let server = fs.readFileSync(serverPath, 'utf8');

  server = server.replaceAll(
    '.shop-brand-wrap{min-width:0!important;width:min(760px,calc(100vw - 360px))!important;max-width:min(760px,calc(100vw - 360px))!important;margin-left:auto!important;margin-right:24px!important;overflow:hidden!important;position:relative!important;padding:22px 28px 26px!important;border-radius:28px!important;',
    '.shop-brand-wrap{min-width:0!important;width:min(520px,calc(100vw - 480px))!important;max-width:min(520px,calc(100vw - 480px))!important;margin-left:auto!important;margin-right:24px!important;overflow:hidden!important;position:relative!important;padding:14px 20px 16px!important;border-radius:22px!important;'
  );

  server = server.replaceAll(
    'font-size:clamp(2.35rem,4.6vw,4.9rem)!important;line-height:.94!important;',
    'font-size:clamp(1.9rem,3.2vw,3.4rem)!important;line-height:.96!important;'
  );

  if (!server.includes('.shop-brand-wrap p{font-size:clamp(1rem,1.8vw,1.35rem)!important;')) {
    server = server.replace(
      '.shop-subtitle-spin{display:flex!important;',
      '.shop-brand-wrap p{font-size:clamp(1rem,1.8vw,1.35rem)!important;line-height:1.2!important;margin-top:8px!important;}\n.shop-subtitle-spin{display:flex!important;'
    );
  }

  fs.writeFileSync(serverPath, server, 'utf8');
  console.log('[Miele Artigianale] Card Fabbrica delle Api resa più compatta.');
} catch (error) {
  console.error('[Miele Artigianale] Errore ridimensionamento card Fabbrica delle Api:', error);
}

require('./start.js');
