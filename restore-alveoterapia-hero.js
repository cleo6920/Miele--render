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

  const newBlock = `<div id="alveoterapia-hero-actions" className="mt-4 flex flex-nowrap items-start gap-3 sm:gap-4 ml-0 sm:ml-0 lg:ml-0">
                                    <button type="button" aria-label="Scopri PropolTerapy Professional" onClick={() => document.dispatchEvent(new CustomEvent('shop:open-product', { detail: { productId: 'propolterapy-professional', category: 'alveoterapia' } }))} className="group flex-shrink-0 text-left cursor-pointer focus:outline-none">
                                        <div className="relative w-36 h-28 sm:w-40 sm:h-28 lg:w-44 lg:h-32 rounded-[999px] overflow-hidden border-4 border-amber-300 shadow-2xl bg-stone-900">
                                            <img src="/images/hero-prodotti-corretta.jpg" alt="Diffusore PropolTerapy Professional" className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" />
                                            <span className="absolute left-1/2 bottom-2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/75 px-3 py-1 text-xs sm:text-sm font-extrabold text-amber-300 border border-amber-300">Scopri di più</span>
                                        </div>
                                    </button>
                                    <button type="button" aria-label="Scopri Unguento Apis" onClick={() => document.dispatchEvent(new CustomEvent('shop:open-product', { detail: { productId: 'unguento-apis', category: 'cosmesi' } }))} className="group flex-shrink-0 text-left cursor-pointer focus:outline-none">
                                        <div className="relative w-36 h-28 sm:w-40 sm:h-28 lg:w-44 lg:h-32 rounded-[999px] overflow-hidden border-4 border-amber-400 shadow-2xl bg-stone-900">
                                            <img src="images/unguento-apis.png" alt="Unguento Apis" className="w-full h-full object-contain bg-white transition-transform duration-200 group-hover:scale-105" />
                                            <span className="absolute left-1/2 bottom-2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/75 px-3 py-1 text-xs sm:text-sm font-extrabold text-amber-300 border border-amber-300">Scopri di più</span>
                                        </div>
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

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Hero: navigazione diretta via stato React verso PropolTerapy e Unguento Apis.');
} catch (error) {
  console.error('[Miele Artigianale] Errore hero Alveoterapia:', error);
}
