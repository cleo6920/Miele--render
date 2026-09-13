const fs = require('fs');
const path = require('path');

// Mantiene il catalogo approvato e ricostruisce la Hero 1 in modo indipendente
// dai vecchi blocchi tris rimossi.
require('./apinfiore-products-prestart.js');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  // Elimina controller hero legacy eventualmente rimasti nel sorgente.
  const obsoleteIds = [
    'shop-hero-center-swap',
    'shop-search-hero-gap-restore',
    'shop-admin-hero-mover',
    'shop-hero-stable-controller'
  ];
  for (const id of obsoleteIds) {
    html = html.replace(new RegExp(`<script id="${id}">[\\s\\S]*?<\\/script>\\s*`, 'g'), '');
  }
  html = html.replace(/<style id="alveoterapia-hero-spacing-v2">[\s\S]*?<\/style>\s*/g, '');
  html = html.replace(/<style id="shop-hero-stable-css">[\s\S]*?<\/style>\s*/g, '');

  // Bridge React per aprire i due prodotti della hero.
  const stateMarker = `            const [selectedProductId, setSelectedProductId] = useState(null);\n            const [selectedCategory, setSelectedCategory] = useState(null);`;
  const stateWithBridge = `            const [selectedProductId, setSelectedProductId] = useState(null);\n            const [selectedCategory, setSelectedCategory] = useState(null);\n\n            useEffect(() => {\n                const openHeroProduct = (event) => {\n                    const detail = event?.detail || {};\n                    if (!detail.productId) return;\n                    if (detail.category) setSelectedCategory(detail.category);\n                    setSelectedProductId(detail.productId);\n                    setHasNavigatedAway(true);\n                    setTimeout(() => {\n                        const el = document.getElementById('product-detail-section');\n                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });\n                    }, 120);\n                };\n                document.addEventListener('shop:open-product', openHeroProduct);\n                return () => document.removeEventListener('shop:open-product', openHeroProduct);\n            }, []);`;
  if (!html.includes("document.addEventListener('shop:open-product'")) {
    if (!html.includes(stateMarker)) throw new Error('Stati navigazione prodotto non trovati');
    html = html.replace(stateMarker, stateWithBridge);
  }

  const heroActions = `<div id="alveoterapia-hero-actions" className="mt-4 flex flex-nowrap items-start gap-3 sm:gap-5 ml-0 pb-1">\n                                    <button type="button" aria-label="Scopri PropolTerapy Professional" onClick={() => document.dispatchEvent(new CustomEvent('shop:open-product', { detail: { productId: 'propolterapy-professional', category: 'alveoterapia' } }))} className="group flex-shrink-0 w-36 sm:w-40 lg:w-44 flex flex-col items-center text-center cursor-pointer focus:outline-none">\n                                        <div className="w-36 h-28 sm:w-40 sm:h-28 lg:w-44 lg:h-32 rounded-[999px] overflow-hidden border-4 border-amber-300 shadow-2xl bg-stone-900">\n                                            <img src="/images/hero-prodotti-corretta.jpg" alt="PropolTerapy Professional" className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" />\n                                        </div>\n                                        <div className="mt-2 text-[11px] sm:text-[12px] lg:text-[13px] font-extrabold leading-none text-amber-300 whitespace-nowrap">PropolTerapy Professional</div>\n                                        <div className="mt-1 inline-flex items-center justify-center rounded-full bg-black/70 border border-amber-300 px-3 py-1 text-[11px] sm:text-xs font-extrabold text-amber-300 group-hover:bg-black/90">Scopri di più</div>\n                                    </button>\n                                    <button type="button" aria-label="Scopri Unguento Apis" onClick={() => document.dispatchEvent(new CustomEvent('shop:open-product', { detail: { productId: 'unguento-apis', category: 'cosmesi' } }))} className="group flex-shrink-0 w-36 sm:w-40 lg:w-44 flex flex-col items-center text-center cursor-pointer focus:outline-none">\n                                        <div className="w-36 h-28 sm:w-40 sm:h-28 lg:w-44 lg:h-32 rounded-[999px] overflow-hidden border-4 border-amber-400 shadow-2xl bg-stone-900">\n                                            <img src="images/unguento-apis.png" alt="Unguento Apis" className="w-full h-full object-contain bg-white transition-transform duration-200 group-hover:scale-105" />\n                                        </div>\n                                        <div className="mt-2 text-[13px] sm:text-sm font-extrabold leading-tight text-amber-300">Unguento Apis</div>\n                                        <div className="mt-1 inline-flex items-center justify-center rounded-full bg-black/70 border border-amber-300 px-3 py-1 text-[11px] sm:text-xs font-extrabold text-amber-300 group-hover:bg-black/90">Scopri di più</div>\n                                    </button>\n                                </div>`;

  // Titolo e sottotitolo sinistro come nello stato approvato.
  html = html.replace(" L' Italiano</h1>", " L' Italiano Miele</h1>");
  html = html.replace(" L’ Italiano</h1>", " L’ Italiano Miele</h1>");

  if (!html.includes('id="alveoterapia-hero-actions"')) {
    const oldParagraph = `<p className="text-xl sm:text-2xl text-stone-700 mt-2 max-w-lg">Prodotti esclusivi dei tesori dell' alveare</p>`;
    const replacement = `<p className="text-2xl sm:text-3xl font-extrabold text-amber-700 mt-2">Alveoterapia integrata</p>\n                                ${heroActions}`;
    if (!html.includes(oldParagraph)) throw new Error('Sottotitolo hero sinistro non trovato');
    html = html.replace(oldParagraph, replacement);
  }

  // Se il blocco esiste già da una precedente trasformazione, lo riallinea alla versione corrente.
  const existingStart = html.indexOf('<div id="alveoterapia-hero-actions"');
  if (existingStart >= 0) {
    const nextAdmin = html.indexOf('{isAuthReady && (', existingStart);
    if (nextAdmin > existingStart) {
      html = html.slice(0, existingStart) + heroActions + '\n                                ' + html.slice(nextAdmin);
    }
  }

  // Ricrea il blocco alveari che la geometria stabile posiziona al centro.
  if (!html.includes('id="shop-brand-hives-stack"')) {
    const rightTail = `<p className="text-2xl sm:text-3xl text-stone-800 italic mt-2">I Mieli Artigianali</p>\n                            </div>\n                        </div>\n                    </header>`;
    const rightTailReplacement = `<p className="text-2xl sm:text-3xl text-stone-800 italic mt-2">I Mieli Artigianali</p>\n                            </div>\n                            <div id="shop-brand-hives-stack" className="flex flex-col items-center">\n                                <div id="shop-hives-subtitle" className="text-xl sm:text-2xl font-bold italic text-stone-100">Mieli e prodotti dell'alveare</div>\n                                <div id="busatello-hives-oval" className="overflow-hidden rounded-[999px] border-4 border-amber-400 shadow-2xl bg-stone-900">\n                                    <img src="/images/alveari-busatello.jpg" alt="Alveari dell'Oasi del Busatello" className="w-full h-full object-cover" />\n                                </div>\n                            </div>\n                        </div>\n                    </header>`;
    if (!html.includes(rightTail)) throw new Error('Chiusura hero per blocco alveari non trovata');
    html = html.replace(rightTail, rightTailReplacement);
  }

  // Admin compatto sulla sinistra.
  const adminNeedle = `{isAuthReady && (\n                                    <div className="mt-4">`;
  const adminReplacement = `{isAuthReady && (\n                                    <div className="mt-4 shop-admin-static">`;
  if (html.includes(adminNeedle)) html = html.replace(adminNeedle, adminReplacement);

  const stableCss = `<style id="shop-hero-stable-css">
#alveoterapia-hero-actions{position:relative!important;z-index:12!important;}
.wrap{transform:none!important;margin-top:0!important;margin-bottom:0!important;position:relative!important;z-index:1!important;}
.category-grid{transform:none!important;position:relative!important;z-index:1!important;}
.shop-admin-static{position:absolute!important;left:46px!important;top:102px!important;z-index:45!important;margin:0!important;width:auto!important;}
.shop-admin-static button,.shop-admin-static a{margin:0!important;padding:2px 7px!important;font-size:11px!important;line-height:1.1!important;white-space:nowrap!important;}
@media (min-width:901px){#busatello-hives-oval{height:170px!important;}}
@media (max-width:900px){.shop-admin-static{left:18px!important;top:100px!important;}}
@media (max-width:640px){.shop-admin-static{position:relative!important;left:auto!important;top:auto!important;margin-top:6px!important;align-self:flex-start!important;}}
</style>`;
  html = html.replace('</head>', `${stableCss}\n</head>`);

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Hero 1 ricostruita: Alveoterapia a sinistra e blocco alveari ripristinato.');
} catch (error) {
  console.error('[Miele Artigianale] Errore ricostruzione Hero 1:', error);
}
