const fs = require('fs');
const path = require('path');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  // Elimina i tentativi runtime precedenti: questa versione lavora direttamente sul JSX
  // prima che il server venga avviato, così React renderizza già la home corretta.
  html = html.replace(/<script id="shop-home-layout-final">[\s\S]*?<\/script>\s*/g, '');
  html = html.replace(/<style id="shop-home-header-authoritative">[\s\S]*?<\/style>\s*/g, '');

  // Identifica in modo stabile la struttura superiore della home.
  html = html.replace(
    '<header className="relative w-full py-8 sm:py-12 bg-gradient-to-br from-amber-200 to-amber-50 shadow-lg mb-8">',
    '<header id="shop-home-header" className="relative w-full py-3 sm:py-4 bg-gradient-to-br from-amber-200 to-amber-50 shadow-lg mb-2">'
  );
  html = html.replace(
    '<div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between z-10 relative">',
    '<div id="shop-home-inner" className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-start justify-between z-10 relative">'
  );
  html = html.replace(
    '<div className="flex-grow flex flex-col items-start text-center sm:text-left">',
    '<div id="shop-home-left" className="flex-grow flex flex-col items-start text-left">'
  );
  html = html.replace(
    '<div className="flex-shrink-0 flex flex-col items-end mt-8 sm:mt-0 ml-auto text-right">',
    '<div id="shop-home-brand" className="flex-shrink-0 flex flex-col items-center mt-0 ml-0 text-center">'
  );

  // Titolo sinistro e blocco Alveoterapia.
  html = html.replace(" L' Italiano</h1>", " L' Italiano Miele</h1>");
  html = html.replace(
    /<p className="text-xl sm:text-2xl text-stone-700 mt-2 max-w-lg">Prodotti esclusivi dei tesori dell' alveare<\/p>/,
    `<p id="shop-home-alveo-title" className="text-2xl sm:text-3xl font-extrabold text-amber-700 mt-2">Alveoterapia integrata</p>\n                                <div id="shop-home-alveo-images" className="mt-4 flex flex-nowrap items-start gap-4">\n                                    <div className="w-40 h-28 lg:w-44 lg:h-32 rounded-[999px] overflow-hidden border-4 border-amber-400 shadow-2xl bg-stone-900 flex-shrink-0"><img src="/images/alveoterapia-casetta-hero.jpg" alt="Alveoterapia integrata" className="w-full h-full object-cover" /></div>\n                                    <div className="w-40 h-28 lg:w-44 lg:h-32 rounded-[999px] overflow-hidden border-4 border-amber-300 shadow-2xl bg-stone-900 flex-shrink-0"><img src="/images/hero-prodotti-corretta.jpg" alt="Prodotti per alveoterapia" className="w-full h-full object-cover" /></div>\n                                </div>`
  );

  // Il blocco destro originario diventa il box centrale della Fabbrica delle Api.
  html = html.replace(/\bL'Italiano\b/g, 'LA FABBRICA DELLE API');

  // Inserisce la sezione alveari come terzo elemento della hero, se non esiste già.
  if (!html.includes('id="shop-home-hives"')) {
    html = html.replace(
      /(<p className="text-2xl sm:text-3xl text-stone-800 italic mt-2">I Mieli Artigianali<\/p>\s*<\/div>)(\s*<\/div>\s*<\/header>)/,
      `$1\n                            <div id="shop-home-hives">\n                                <div id="shop-home-hives-title">Mieli e prodotti dell'alveare</div>\n                                <div id="shop-home-hives-oval"><img src="/images/alveari-busatello.jpg" alt="Alveari dell'Oasi del Busatello" /></div>\n                            </div>$2`
    );
  }

  const css = `<style id="shop-home-header-authoritative">
@media (min-width:901px){
  #shop-home-header{height:315px!important;min-height:315px!important;padding:0!important;margin-bottom:2px!important;overflow:visible!important;}
  #shop-home-inner{height:315px!important;min-height:315px!important;max-width:1280px!important;position:relative!important;display:block!important;padding:0 18px!important;}
  #shop-home-left{position:absolute!important;left:18px!important;top:24px!important;width:390px!important;max-width:36vw!important;margin:0!important;align-items:flex-start!important;text-align:left!important;z-index:40!important;}
  #shop-home-left h1{font-size:clamp(30px,3.2vw,46px)!important;line-height:1!important;white-space:nowrap!important;margin:0!important;}
  #shop-home-alveo-title{font-size:clamp(22px,2.4vw,31px)!important;line-height:1.05!important;margin:8px 0 10px!important;color:#d96b16!important;}
  #shop-home-alveo-images{margin-top:8px!important;gap:18px!important;}
  #shop-home-brand{position:absolute!important;left:50%!important;right:auto!important;top:20px!important;transform:translateX(-50%)!important;width:340px!important;max-width:31vw!important;height:100px!important;min-height:100px!important;margin:0!important;padding:8px 14px 10px!important;border-radius:20px!important;overflow:hidden!important;align-items:center!important;justify-content:center!important;text-align:center!important;z-index:41!important;background:linear-gradient(135deg,rgba(7,55,43,.72),rgba(5,18,14,.25))!important;border:1px solid rgba(212,175,55,.45)!important;}
  #shop-home-brand.shop-brand-wrap{width:340px!important;max-width:31vw!important;margin:0!important;padding:8px 14px 10px!important;position:absolute!important;overflow:hidden!important;}
  #shop-home-brand h2,#shop-home-brand .shop-brand-title{font-size:clamp(20px,1.9vw,28px)!important;line-height:.95!important;white-space:nowrap!important;margin:0!important;text-align:center!important;animation:none!important;transform:none!important;}
  #shop-home-brand p{display:none!important;}
  #shop-home-hives{position:absolute!important;right:18px!important;top:74px!important;width:340px!important;max-width:32vw!important;margin:0!important;padding:0!important;display:flex!important;flex-direction:column!important;align-items:center!important;z-index:39!important;}
  #shop-home-hives-title{width:100%!important;text-align:center!important;font-family:Arial,sans-serif!important;font-size:clamp(18px,2vw,27px)!important;font-style:italic!important;font-weight:700!important;color:#fff6e3!important;line-height:1.05!important;white-space:nowrap!important;margin:0 0 6px!important;}
  #shop-home-hives-oval{width:100%!important;height:136px!important;border-radius:999px!important;overflow:hidden!important;border:4px solid #d4af37!important;box-shadow:0 12px 28px rgba(0,0,0,.32)!important;background:#111!important;}
  #shop-home-hives-oval img{width:100%!important;height:100%!important;object-fit:cover!important;object-position:center!important;display:block!important;}
  #shop-home-header + div{position:relative!important;z-index:50!important;}
}
@media (max-width:900px){
  #shop-home-hives{display:none!important;}
  #shop-home-brand{position:relative!important;left:auto!important;top:auto!important;transform:none!important;width:calc(100% - 32px)!important;max-width:calc(100% - 32px)!important;margin:12px auto!important;}
}
</style>`;
  html = html.replace('</head>', `${css}\n</head>`);

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Home alta ricostruita staticamente nel JSX: sinistra Alveoterapia, centro Fabbrica, destra alveari.');
} catch (error) {
  console.error('[Miele Artigianale] Errore ricostruzione statica home alta:', error);
  process.exitCode = 1;
}
