const fs = require('fs');
const path = require('path');

require('./apinfiore-products-prestart.js');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  // Collega la hero direttamente allo stato React dello shop. Nessun click simulato.
  const stateMarker = `            const [selectedProductId, setSelectedProductId] = useState(null);\n            const [selectedCategory, setSelectedCategory] = useState(null);`;
  const stateWithBridge = `            const [selectedProductId, setSelectedProductId] = useState(null);\n            const [selectedCategory, setSelectedCategory] = useState(null);\n\n            // Bridge unico per link esterni alla griglia prodotti (es. hero Alveoterapia).\n            useEffect(() => {\n                const openHeroProduct = (event) => {\n                    const detail = event?.detail || {};\n                    if (!detail.productId) return;\n                    if (detail.category) setSelectedCategory(detail.category);\n                    setSelectedProductId(detail.productId);\n                    setHasNavigatedAway(true);\n                    setTimeout(() => {\n                        const el = document.getElementById('product-detail-section');\n                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });\n                    }, 120);\n                };\n                document.addEventListener('shop:open-product', openHeroProduct);\n                return () => document.removeEventListener('shop:open-product', openHeroProduct);\n            }, []);`;

  if (!html.includes("document.addEventListener('shop:open-product'")) {
    if (!html.includes(stateMarker)) throw new Error('Stati di navigazione prodotto non trovati');
    html = html.replace(stateMarker, stateWithBridge);
  }

  const oldBlock = `<div className="mt-4 flex flex-nowrap items-start gap-3 sm:gap-4 ml-0 sm:ml-0 lg:ml-0">
                                    <div className="w-36 h-28 sm:w-40 sm:h-28 lg:w-44 lg:h-32 rounded-[999px] overflow-hidden border-4 border-amber-400 shadow-2xl bg-stone-900 flex-shrink-0">
                                        <img src="/images/alveoterapia-casetta-hero.jpg" alt="Alveoterapia integrata con diffusore" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="w-36 h-28 sm:w-40 sm:h-28 lg:w-44 lg:h-32 rounded-[999px] overflow-hidden border-4 border-amber-300 shadow-2xl bg-stone-900 flex-shrink-0">
                                        <img src="/images/hero-prodotti-corretta.jpg" alt="Diffusore, capsule e Unguento Apis" className="w-full h-full object-cover" />
                                    </div>
                                </div>`;

  const newBlock = `<div id="alveoterapia-hero-actions" className="mt-4 flex flex-nowrap items-start gap-3 sm:gap-5 ml-0 sm:ml-0 lg:ml-0 pb-1">
                                    <button type="button" aria-label="Scopri PropolTerapy Professional" onClick={() => document.dispatchEvent(new CustomEvent('shop:open-product', { detail: { productId: 'propolterapy-professional', category: 'alveoterapia' } }))} className="group flex-shrink-0 w-36 sm:w-40 lg:w-44 flex flex-col items-center text-center cursor-pointer focus:outline-none">
                                        <div className="w-36 h-28 sm:w-40 sm:h-28 lg:w-44 lg:h-32 rounded-[999px] overflow-hidden border-4 border-amber-300 shadow-2xl bg-stone-900">
                                            <img src="/images/hero-prodotti-corretta.jpg" alt="PropolTerapy Professional" className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" />
                                        </div>
                                        <div className="mt-2 text-[11px] sm:text-[12px] lg:text-[13px] font-extrabold leading-none text-amber-300 whitespace-nowrap">PropolTerapy Professional</div>
                                        <div className="mt-1 inline-flex items-center justify-center rounded-full bg-black/70 border border-amber-300 px-3 py-1 text-[11px] sm:text-xs font-extrabold text-amber-300 group-hover:bg-black/90">Scopri di più</div>
                                    </button>
                                    <button type="button" aria-label="Scopri Unguento Apis" onClick={() => document.dispatchEvent(new CustomEvent('shop:open-product', { detail: { productId: 'unguento-apis', category: 'cosmesi' } }))} className="group flex-shrink-0 w-36 sm:w-40 lg:w-44 flex flex-col items-center text-center cursor-pointer focus:outline-none">
                                        <div className="w-36 h-28 sm:w-40 sm:h-28 lg:w-44 lg:h-32 rounded-[999px] overflow-hidden border-4 border-amber-400 shadow-2xl bg-stone-900">
                                            <img src="images/unguento-apis.png" alt="Unguento Apis" className="w-full h-full object-contain bg-white transition-transform duration-200 group-hover:scale-105" />
                                        </div>
                                        <div className="mt-2 text-[13px] sm:text-sm font-extrabold leading-tight text-amber-300">Unguento Apis</div>
                                        <div className="mt-1 inline-flex items-center justify-center rounded-full bg-black/70 border border-amber-300 px-3 py-1 text-[11px] sm:text-xs font-extrabold text-amber-300 group-hover:bg-black/90">Scopri di più</div>
                                    </button>
                                </div>`;

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

  // Hero compatta: ovale alveari più alto verso il basso e categorie ancora più vicine.
  const spacingCss = `<style id="alveoterapia-hero-spacing-v2">
#alveoterapia-hero-actions{position:relative!important;z-index:12!important;}
.wrap{transform:none!important;margin-top:0!important;margin-bottom:0!important;position:relative!important;z-index:1!important;}
.category-grid{transform:none!important;position:relative!important;z-index:1!important;}
.shop-admin-hero-shortcut{position:absolute!important;left:44px!important;top:76px!important;z-index:45!important;margin:0!important;padding:0!important;width:auto!important;height:auto!important;}
.shop-admin-hero-shortcut button,.shop-admin-hero-shortcut a{margin:0!important;padding:3px 8px!important;font-size:11px!important;line-height:1.1!important;white-space:nowrap!important;}
@media (min-width:901px){
  #busatello-hives-oval{height:170px!important;}
}
@media (max-width:900px){
  .shop-admin-hero-shortcut{left:18px!important;top:72px!important;}
}
@media (max-width:640px){
  #alveoterapia-hero-actions{padding-bottom:0!important;}
  .wrap{margin-top:2px!important;}
  .shop-admin-hero-shortcut{position:relative!important;left:auto!important;top:auto!important;margin-top:6px!important;align-self:flex-start!important;}
}
</style>`;

  if (/<style id="alveoterapia-hero-spacing-v2">[\s\S]*?<\/style>/.test(html)) {
    html = html.replace(/<style id="alveoterapia-hero-spacing-v2">[\s\S]*?<\/style>/, spacingCss);
  } else {
    html = html.replace('</head>', `${spacingCss}\n</head>`);
  }

  const adminMover = `<script id="shop-admin-hero-mover">
(function(){
  let timer=null;
  function moveAdmin(){
    const candidates=Array.from(document.querySelectorAll('button,a,div,span'));
    const admin=candidates.find(el=>((el.textContent||'').trim()==='Accedi come Admin'));
    if(!admin) return;
    let box=admin;
    if(admin.parentElement && ((admin.parentElement.textContent||'').trim()==='Accedi come Admin')) box=admin.parentElement;
    box.classList.add('shop-admin-hero-shortcut');
    const heroActions=document.getElementById('alveoterapia-hero-actions');
    if(heroActions){
      const heroRoot=heroActions.closest('header') || heroActions.parentElement?.parentElement || heroActions.parentElement;
      if(heroRoot) heroRoot.style.setProperty('position','relative','important');
    }
  }
  function schedule(){clearTimeout(timer);timer=setTimeout(moveAdmin,80);}
  window.addEventListener('load',schedule);
  window.addEventListener('resize',schedule);
  document.addEventListener('click',schedule,true);
  const obs=new MutationObserver(schedule);
  obs.observe(document.body,{childList:true,subtree:true});
  schedule();
})();
</script>`;

  if (/<script id="shop-admin-hero-mover">[\s\S]*?<\/script>/.test(html)) {
    html = html.replace(/<script id="shop-admin-hero-mover">[\s\S]*?<\/script>/, adminMover);
  } else {
    html = html.replace('</body>', `${adminMover}\n</body>`);
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Ovale alveari più alto e categorie ancora più vicine alla hero.');
} catch (error) {
  console.error('[Miele Artigianale] Errore hero Alveoterapia:', error);
}
