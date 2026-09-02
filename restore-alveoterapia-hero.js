const fs = require('fs');
const path = require('path');

// Applica prima catalogo + tris + layout prodotto. Gli observer hero legacy vengono
// rimossi nella catena prima di arrivare qui.
require('./apinfiore-products-prestart.js');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  // Rimuovi definitivamente i vecchi gestori runtime della hero se presenti in una
  // copia di index.html proveniente da un avvio precedente.
  html = html.replace(/<script id="shop-hero-center-swap">[\s\S]*?<\/script>\s*/g, '');
  html = html.replace(/<script id="shop-search-hero-gap-restore">[\s\S]*?<\/script>\s*/g, '');
  html = html.replace(/<script id="shop-admin-hero-mover">[\s\S]*?<\/script>\s*/g, '');
  html = html.replace(/<style id="alveoterapia-hero-spacing-v2">[\s\S]*?<\/style>\s*/g, '');
  html = html.replace(/<script id="shop-hero-stable-controller">[\s\S]*?<\/script>\s*/g, '');
  html = html.replace(/<style id="shop-hero-stable-css">[\s\S]*?<\/style>\s*/g, '');

  // Bridge React unico per i due prodotti cliccabili della hero.
  const stateMarker = `            const [selectedProductId, setSelectedProductId] = useState(null);\n            const [selectedCategory, setSelectedCategory] = useState(null);`;
  const stateWithBridge = `            const [selectedProductId, setSelectedProductId] = useState(null);\n            const [selectedCategory, setSelectedCategory] = useState(null);\n\n            // Bridge unico per link esterni alla griglia prodotti (hero Alveoterapia).\n            useEffect(() => {\n                const openHeroProduct = (event) => {\n                    const detail = event?.detail || {};\n                    if (!detail.productId) return;\n                    if (detail.category) setSelectedCategory(detail.category);\n                    setSelectedProductId(detail.productId);\n                    setHasNavigatedAway(true);\n                    setTimeout(() => {\n                        const el = document.getElementById('product-detail-section');\n                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });\n                    }, 120);\n                };\n                document.addEventListener('shop:open-product', openHeroProduct);\n                return () => document.removeEventListener('shop:open-product', openHeroProduct);\n            }, []);`;
  if (!html.includes("document.addEventListener('shop:open-product'")) {
    if (!html.includes(stateMarker)) throw new Error('Stati navigazione prodotto non trovati');
    html = html.replace(stateMarker, stateWithBridge);
  }

  // Sostituisci sempre l'intero blocco hero sinistro, mai affiancarlo a versioni vecchie.
  const oldBlock = `<div className="mt-4 flex flex-nowrap items-start gap-3 sm:gap-4 ml-0 sm:ml-0 lg:ml-0">\n                                    <div className="w-36 h-28 sm:w-40 sm:h-28 lg:w-44 lg:h-32 rounded-[999px] overflow-hidden border-4 border-amber-400 shadow-2xl bg-stone-900 flex-shrink-0">\n                                        <img src="/images/alveoterapia-casetta-hero.jpg" alt="Alveoterapia integrata con diffusore" className="w-full h-full object-cover" />\n                                    </div>\n                                    <div className="w-36 h-28 sm:w-40 sm:h-28 lg:w-44 lg:h-32 rounded-[999px] overflow-hidden border-4 border-amber-300 shadow-2xl bg-stone-900 flex-shrink-0">\n                                        <img src="/images/hero-prodotti-corretta.jpg" alt="Diffusore, capsule e Unguento Apis" className="w-full h-full object-cover" />\n                                    </div>\n                                </div>`;

  const newBlock = `<div id="alveoterapia-hero-actions" className="mt-4 flex flex-nowrap items-start gap-3 sm:gap-5 ml-0 sm:ml-0 lg:ml-0 pb-1">\n                                    <button type="button" aria-label="Scopri PropolTerapy Professional" onClick={() => document.dispatchEvent(new CustomEvent('shop:open-product', { detail: { productId: 'propolterapy-professional', category: 'alveoterapia' } }))} className="group flex-shrink-0 w-36 sm:w-40 lg:w-44 flex flex-col items-center text-center cursor-pointer focus:outline-none">\n                                        <div className="w-36 h-28 sm:w-40 sm:h-28 lg:w-44 lg:h-32 rounded-[999px] overflow-hidden border-4 border-amber-300 shadow-2xl bg-stone-900">\n                                            <img src="/images/hero-prodotti-corretta.jpg" alt="PropolTerapy Professional" className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" />\n                                        </div>\n                                        <div className="mt-2 text-[11px] sm:text-[12px] lg:text-[13px] font-extrabold leading-none text-amber-300 whitespace-nowrap">PropolTerapy Professional</div>\n                                        <div className="mt-1 inline-flex items-center justify-center rounded-full bg-black/70 border border-amber-300 px-3 py-1 text-[11px] sm:text-xs font-extrabold text-amber-300 group-hover:bg-black/90">Scopri di più</div>\n                                    </button>\n                                    <button type="button" aria-label="Scopri Unguento Apis" onClick={() => document.dispatchEvent(new CustomEvent('shop:open-product', { detail: { productId: 'unguento-apis', category: 'cosmesi' } }))} className="group flex-shrink-0 w-36 sm:w-40 lg:w-44 flex flex-col items-center text-center cursor-pointer focus:outline-none">\n                                        <div className="w-36 h-28 sm:w-40 sm:h-28 lg:w-44 lg:h-32 rounded-[999px] overflow-hidden border-4 border-amber-400 shadow-2xl bg-stone-900">\n                                            <img src="images/unguento-apis.png" alt="Unguento Apis" className="w-full h-full object-contain bg-white transition-transform duration-200 group-hover:scale-105" />\n                                        </div>\n                                        <div className="mt-2 text-[13px] sm:text-sm font-extrabold leading-tight text-amber-300">Unguento Apis</div>\n                                        <div className="mt-1 inline-flex items-center justify-center rounded-full bg-black/70 border border-amber-300 px-3 py-1 text-[11px] sm:text-xs font-extrabold text-amber-300 group-hover:bg-black/90">Scopri di più</div>\n                                    </button>\n                                </div>`;

  if (html.includes(oldBlock)) {
    html = html.replace(oldBlock, newBlock);
  } else {
    const start = html.indexOf('<div id="alveoterapia-hero-actions"');
    const nextAdmin = html.indexOf('{isAuthReady && (', start);
    if (start >= 0 && nextAdmin > start) {
      html = html.slice(0, start) + newBlock + '\n                                ' + html.slice(nextAdmin);
    } else {
      throw new Error('Blocco hero Alveoterapia non trovato');
    }
  }

  // Admin: classato direttamente nel JSX, senza MutationObserver e senza spostare nodi.
  const adminNeedle = `{isAuthReady && (\n                                    <div className="mt-4">`;
  const adminReplacement = `{isAuthReady && (\n                                    <div className="mt-4 shop-admin-static">`;
  if (html.includes(adminNeedle)) html = html.replace(adminNeedle, adminReplacement);

  // Riduci strutturalmente lo spazio sotto la hero; niente translateY negativi sulle categorie.
  html = html.replace(
    'className="relative w-full py-3 sm:py-5 bg-gradient-to-br from-amber-200 to-amber-50 shadow-lg mb-8"',
    'className="relative w-full py-3 sm:py-4 bg-gradient-to-br from-amber-200 to-amber-50 shadow-lg mb-2"'
  );

  const stableCss = `<style id="shop-hero-stable-css">
#alveoterapia-hero-actions{position:relative!important;z-index:12!important;}
.wrap{transform:none!important;margin-top:0!important;margin-bottom:0!important;position:relative!important;z-index:1!important;}
.category-grid{transform:none!important;position:relative!important;z-index:1!important;}
.shop-admin-static{position:absolute!important;left:46px!important;top:102px!important;z-index:45!important;margin:0!important;width:auto!important;}
.shop-admin-static button,.shop-admin-static a{margin:0!important;padding:2px 7px!important;font-size:11px!important;line-height:1.1!important;white-space:nowrap!important;}
@media (min-width:901px){
  #busatello-hives-oval{height:170px!important;}
}
@media (max-width:900px){
  .shop-admin-static{left:18px!important;top:100px!important;}
}
@media (max-width:640px){
  .shop-admin-static{position:relative!important;left:auto!important;top:auto!important;margin-top:6px!important;align-self:flex-start!important;}
}
</style>`;
  html = html.replace('</head>', `${stableCss}\n</head>`);

  // UNICO controller runtime della hero. È idempotente e non usa appendChild/reparenting
  // sui nodi React: applica soltanto stile ai nodi correnti dopo un rerender.
  const stableController = `<script id="shop-hero-stable-controller">
(function(){
  let timer = null;
  function qSearch(){
    return Array.from(document.querySelectorAll('input')).find(el => ((el.getAttribute('placeholder') || '').toLowerCase().includes('cerca miele')));
  }
  function apply(){
    if(window.innerWidth < 901) return;
    const hives = document.getElementById('shop-brand-hives-stack');
    const brand = document.querySelector('.shop-brand-wrap');
    const search = qSearch();
    if(!hives || !brand) return;
    const hero = brand.parentElement || hives.parentElement;
    if(!hero) return;
    hero.style.setProperty('position','relative','important');

    hives.style.setProperty('position','absolute','important');
    hives.style.setProperty('left','50%','important');
    hives.style.setProperty('right','auto','important');
    hives.style.setProperty('top','43px','important');
    hives.style.setProperty('transform','translateX(-50%)','important');
    hives.style.setProperty('margin','0','important');
    hives.style.setProperty('padding-top','0','important');
    hives.style.setProperty('width','min(420px,34vw)','important');
    hives.style.setProperty('max-width','420px','important');
    hives.style.setProperty('z-index','28','important');
    hives.style.setProperty('align-items','center','important');

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
      oval.style.setProperty('height','170px','important');
      oval.style.setProperty('margin','0 auto','important');
    }

    brand.style.setProperty('position','absolute','important');
    brand.style.setProperty('left','auto','important');
    brand.style.setProperty('right','12px','important');
    brand.style.setProperty('top','38px','important');
    brand.style.setProperty('transform','none','important');
    brand.style.setProperty('width','min(380px,31vw)','important');
    brand.style.setProperty('max-width','380px','important');
    brand.style.setProperty('margin','0','important');
    brand.style.setProperty('z-index','30','important');

    // La ricerca RESTA nel parent React originale. Viene solo traslata visivamente.
    if(search && search.parentElement){
      const wrap = search.parentElement;
      wrap.removeAttribute('id');
      wrap.style.setProperty('position','relative','important');
      wrap.style.setProperty('z-index','29','important');
      wrap.style.setProperty('width','min(380px,31vw)','important');
      wrap.style.setProperty('max-width','380px','important');
      wrap.style.setProperty('margin','0','important');
      wrap.style.setProperty('transition','none','important');
      requestAnimationFrame(function(){
        const r = wrap.getBoundingClientRect();
        const br = brand.getBoundingClientRect();
        const desiredLeft = br.left;
        const desiredTop = br.bottom + 18;
        wrap.style.setProperty('transform','translate(' + Math.round(desiredLeft-r.left) + 'px,' + Math.round(desiredTop-r.top) + 'px)','important');
      });
    }
  }
  function schedule(delay){ clearTimeout(timer); timer=setTimeout(apply, delay || 70); }
  window.addEventListener('load', function(){ schedule(100); });
  window.addEventListener('resize', function(){ schedule(120); });
  document.addEventListener('click', function(){ schedule(80); }, true);
  const observer = new MutationObserver(function(ms){
    if(ms.some(m => m.type === 'childList')) schedule(60);
  });
  observer.observe(document.body,{childList:true,subtree:true});
  schedule(30);
})();
</script>`;
  html = html.replace('</body>', `${stableController}\n</body>`);

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Hero consolidata: un solo controller, nessun reparenting React, categorie in flusso normale.');
} catch (error) {
  console.error('[Miele Artigianale] Errore consolidamento hero:', error);
}
