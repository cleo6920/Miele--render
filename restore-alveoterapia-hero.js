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

  const newBlock = `<div id="alveoterapia-hero-actions" className="mt-4 flex flex-nowrap items-start gap-3 sm:gap-5 ml-0 sm:ml-0 lg:ml-0 pb-3">
                                    <button type="button" aria-label="Scopri PropolTerapy Professional" onClick={() => document.dispatchEvent(new CustomEvent('shop:open-product', { detail: { productId: 'propolterapy-professional', category: 'alveoterapia' } }))} className="group flex-shrink-0 w-36 sm:w-40 lg:w-44 flex flex-col items-center text-center cursor-pointer focus:outline-none">
                                        <div className="w-36 h-28 sm:w-40 sm:h-28 lg:w-44 lg:h-32 rounded-[999px] overflow-hidden border-4 border-amber-300 shadow-2xl bg-stone-900">
                                            <img src="/images/hero-prodotti-corretta.jpg" alt="PropolTerapy Professional" className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" />
                                        </div>
                                        <div className="mt-2 text-[13px] sm:text-sm font-extrabold leading-tight text-amber-300">PropolTerapy Professional</div>
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

  // La sorgente Git contiene il blocco vecchio: lo rimpiazziamo, non lo affianchiamo.
  if (html.includes(oldBlock)) {
    html = html.replace(oldBlock, newBlock);
  } else {
    // Se un precedente prestart ha già creato il blocco custom, sostituisci l'intero blocco tramite confini noti.
    const start = html.indexOf('<div id="alveoterapia-hero-actions"');
    const nextAdmin = html.indexOf('{isAuthReady && (', start);
    if (start >= 0 && nextAdmin > start) {
      html = html.slice(0, start) + newBlock + '\n                                ' + html.slice(nextAdmin);
    } else {
      throw new Error('Blocco hero Alveoterapia non trovato');
    }
  }

  // Spazio strutturale stabile: le card categorie devono iniziare sotto tutto il contenuto hero,
  // compresi nome prodotto e CTA. Nessun translate negativo o sovrapposizione.
  const spacingCss = `<style id="alveoterapia-hero-spacing-v2">
#alveoterapia-hero-actions{position:relative!important;z-index:12!important;}
.wrap{transform:none!important;margin-top:28px!important;margin-bottom:0!important;position:relative!important;z-index:1!important;}
.category-grid{transform:none!important;position:relative!important;z-index:1!important;}
@media (max-width:640px){
  #alveoterapia-hero-actions{padding-bottom:10px!important;}
  .wrap{margin-top:22px!important;}
}
</style>`;

  if (/<style id="alveoterapia-hero-spacing-v2">[\s\S]*?<\/style>/.test(html)) {
    html = html.replace(/<style id="alveoterapia-hero-spacing-v2">[\s\S]*?<\/style>/, spacingCss);
  } else {
    html = html.replace('</head>', `${spacingCss}\n</head>`);
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Hero: nomi prodotti + Scopri di più ripristinati; categorie separate dalla hero.');
} catch (error) {
  console.error('[Miele Artigianale] Errore hero Alveoterapia:', error);
}
