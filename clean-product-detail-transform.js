const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index-clean.html');
let html = fs.readFileSync(indexPath, 'utf8');

const removeScriptById = (id) => {
  const re = new RegExp(`<script\\s+id=["']${id}["'][^>]*>[\\s\\S]*?<\\/script>`, 'gi');
  html = html.replace(re, '');
};

// Questi vecchi interventi non devono convivere con il dettaglio prodotto pulito.
[
  'shop-single-product-compact',
  'shop-tris-card-compact-safe',
  'shop-single-product-right-compact'
].forEach(removeScriptById);

// Porta il Tris Dolce Risveglio direttamente nei dati statici del Millefiori.
// Il vecchio pacco 12 vasetti viene realmente sostituito, non affiancato.
const oldMillefioriPromo = '{ id: "p12", label: "12 vasetti (250g cad.)", jars: 12, price: 55.00, originalPrice: 12 * 5.00 },';
const trisPack = '{ id: "p-tris-dolce-risveglio", label: "Tris Dolce Risveglio", jars: 1, price: 30.00, isTris: true, trisBadge: "SCELTA TRIS", trisProducts: ["Miele Millefiori", "Bee Energy BIO", "Polline Italiano"], trisShipping: "1 sola spedizione", trisImage: "" },';

if (!html.includes(oldMillefioriPromo)) {
  throw new Error('[Miele Clean] Vecchio pacco Millefiori 12 vasetti non trovato: migrazione dettaglio annullata.');
}
html = html.replaceAll(oldMillefioriPromo, trisPack);

const trisPackEnd = `${trisPack}\n                    ],`;
const trisPackWithHint = `${trisPack}\n                    ],\n                    shippingHints: [\n                        { packId: "p-tris-dolce-risveglio", label: "3 prodotti · 1 sola spedizione" }\n                    ],`;
if (!html.includes(trisPackEnd)) {
  throw new Error('[Miele Clean] Punto shipping Tris non trovato: migrazione dettaglio annullata.');
}
html = html.replaceAll(trisPackEnd, trisPackWithHint);

// Firestore non deve poter ripristinare il vecchio pacco 12 vasetti del Millefiori.
const mergeNeedle = `? { ...staticProduct, ...firestoreProductsMap.get(staticProduct.id) }\n                                : staticProduct;`;
const mergeReplacement = `? { ...staticProduct, ...firestoreProductsMap.get(staticProduct.id), image: staticProduct.image, ...(staticProduct.id === 'millefiori' ? { packs: staticProduct.packs, shippingHints: staticProduct.shippingHints } : {}) }\n                                : staticProduct;`;
if (!html.includes(mergeNeedle)) {
  throw new Error('[Miele Clean] Merge prodotti legacy non trovato: migrazione dettaglio annullata.');
}
html = html.replaceAll(mergeNeedle, mergeReplacement);

// Sostituisce interamente il vecchio ProductDetailPage con la versione pulita.
// Nessun MutationObserver, nessun riposizionamento DOM dopo il render.
const cleanProductDetail = String.raw`        // Pagina di Dettaglio Prodotto - versione pulita e definitiva
        function ProductDetailPage({ product, onAddToCart, fmt, onManualStockUpdate, onAddStockDelta, isAdmin, onBack }) {
            const [selectedPack, setSelectedPack] = useState(product.packs?.[0]);
            const [quantity, setQuantity] = useState(1);
            const [manualStockDelta, setManualStockDelta] = useState(1);
            const [manualStockInput, setManualStockInput] = useState(product.stock);

            useEffect(() => {
                setManualStockInput(product.stock);
                if (product && product.packs && product.packs.length > 0) {
                    if (!selectedPack || !product.packs.some(p => p.id === selectedPack.id)) {
                        setSelectedPack(product.packs[0]);
                    }
                } else if (product && product.packs && product.packs.length === 0) {
                    setSelectedPack(null);
                }
            }, [product, selectedPack]);

            const isAddToCartDisabled = useMemo(() => {
                if (!product.inStock || !selectedPack) return true;
                const totalJarsRequested = quantity * selectedPack.jars;
                return totalJarsRequested <= 0 || product.stock < totalJarsRequested;
            }, [product.inStock, product.stock, selectedPack, quantity]);

            const trisPack = product && product.packs ? product.packs.find(pack => pack.isTris) : null;
            const standardPacks = product && product.packs ? product.packs.filter(pack => !pack.isTris) : [];

            if (!product) {
                return (
                    <div id="product-detail-root" className="bg-white/70 backdrop-blur-lg rounded-2xl border border-amber-200 shadow-xl p-8 col-span-2 text-center text-red-500">
                        Prodotto non trovato.
                        <button onClick={onBack} className="mt-4 inline-block rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold px-6 py-3 transition-colors button-press-effect">
                            ← Torna Indietro
                        </button>
                    </div>
                );
            }

            return (
                <div id="clean-product-detail-root" className="clean-product-detail bg-white/70 backdrop-blur-lg border border-amber-200 shadow-xl lg:col-span-2">
                    <button
                        onClick={onBack}
                        className="clean-product-detail-back rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold px-4 py-2 transition-colors flex items-center gap-2 button-press-effect"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Torna Indietro
                    </button>

                    <div className="clean-product-detail-layout">
                        <div className="clean-product-left-column">
                            <div className="clean-product-image-wrap">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="clean-product-image"
                                    onError={(e) => {
                                        e.target.src = 'https://placehold.co/600x600/CCCCCC/666666?text=Immagine%20Non%20Trovata';
                                    }}
                                />
                                {!product.inStock && (
                                    <span className="clean-product-stock-badge bg-red-100 text-red-800 font-semibold animate-pulse">Non Disponibile</span>
                                )}
                                {product.inStock && product.stock <= 0 && (
                                    <span className="clean-product-stock-badge bg-red-100 text-red-800 font-semibold animate-pulse">Esaurito</span>
                                )}
                            </div>

                            {trisPack && (
                                <button
                                    type="button"
                                    onClick={() => setSelectedPack(trisPack)}
                                    disabled={!product.inStock}
                                    className={'clean-tris-summary button-press-effect ' + (selectedPack && selectedPack.id === trisPack.id ? 'clean-tris-selected' : '') + (!product.inStock ? ' opacity-50 cursor-not-allowed' : '')}
                                >
                                    <div className="clean-tris-summary-placeholder">
                                        <div className="clean-tris-icon">🍯</div>
                                        <div>Immagine Tris</div>
                                    </div>
                                    <div className="clean-tris-badge">{trisPack.trisBadge || 'SCELTA TRIS'}</div>
                                    <div className="clean-tris-name">{trisPack.label}</div>
                                    <div className="clean-tris-products">
                                        {(trisPack.trisProducts || []).map((item, idx) => (
                                            <div key={idx}><b>+</b> {item}</div>
                                        ))}
                                    </div>
                                    <div className="clean-tris-mini-tags">
                                        <span>3 prodotti</span>
                                        <span>🚚 {trisPack.trisShipping || '1 sola spedizione'}</span>
                                    </div>
                                    <div className="clean-tris-total-label">Totale tris</div>
                                    <div className="clean-tris-total">€ {fmt(trisPack.price)}</div>
                                </button>
                            )}
                        </div>

                        <div className="clean-product-main">
                            <h2 className="clean-product-title text-amber-800">{product.name}</h2>
                            <p className={'clean-product-description ' + (product.id === 'caramelle-incartate-70g' ? 'font-bold text-white' : 'text-stone-700')} dangerouslySetInnerHTML={{ __html: product.description }}></p>

                            {product.id === 'caramelle-incartate-70g' && (
                                <p className="text-3xl text-red-600 font-extrabold">Da 5 buste (anche miste): sconto −13% applicato in carrello.</p>
                            )}
                            {product.id === 'burro-cacao' && (
                                <p className="text-3xl text-red-600 font-extrabold">Da 4 stick (anche assortiti): sconto −8,33% applicato in carrello.</p>
                            )}
                            {product.id === 'saponette-artigianali' && (
                                <p className="text-3xl text-red-600 font-extrabold">Da 6 saponette (anche miste): sconto −8,33% applicato in carrello.</p>
                            )}
                            {product.id === 'unguento-apis' && (
                                <p className="text-4xl text-amber-500 font-extrabold">NOVITÀ ASSOLUTA!</p>
                            )}

                            <div className="clean-format-section">
                                <h4 className="clean-format-title text-stone-800">Scegli il formato:</h4>
                                {standardPacks.length > 0 ? (
                                    standardPacks.map(pack => {
                                        const isSingleJar = /^1 vasetto\s*\(250g\)/i.test(pack.label || '');
                                        const isSelected = selectedPack && selectedPack.id === pack.id;
                                        return (
                                            <button
                                                key={pack.id}
                                                onClick={() => setSelectedPack(pack)}
                                                disabled={!product.inStock}
                                                className={'clean-pack-option ' + (isSingleJar ? 'clean-pack-option-single ' : '') + (isSelected ? 'clean-pack-selected border-amber-600 ring-2 ring-amber-200 bg-amber-50 ' : 'border-stone-200 hover:border-amber-400 ') + (!product.inStock ? 'opacity-50 cursor-not-allowed' : '')}
                                            >
                                                <div className="clean-pack-copy">
                                                    <div className="clean-pack-label">{pack.label}</div>
                                                    {product.shippingHints && product.shippingHints.find(h => h.packId === pack.id) && (
                                                        <div className="clean-pack-shipping">{product.shippingHints.find(h => h.packId === pack.id).label}</div>
                                                    )}
                                                    {pack.originalPrice && pack.originalPrice > pack.price && (
                                                        <div className="clean-pack-discount">
                                                            <span className="line-through">€ {fmt(pack.originalPrice)}</span>
                                                            <span className="clean-pack-discount-badge">-{fmt(((pack.originalPrice - pack.price) / pack.originalPrice) * 100)}%</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="clean-pack-price">€ {fmt(pack.price)}</div>
                                            </button>
                                        );
                                    })
                                ) : !trisPack ? (
                                    <p className="text-sm text-stone-500 italic">Nessun pacchetto disponibile per questo prodotto.</p>
                                ) : null}

                                {trisPack && (
                                    <button
                                        type="button"
                                        onClick={() => setSelectedPack(trisPack)}
                                        disabled={!product.inStock}
                                        className={'clean-tris-cta button-press-effect ' + (selectedPack && selectedPack.id === trisPack.id ? 'clean-tris-selected' : '') + (!product.inStock ? ' opacity-50 cursor-not-allowed' : '')}
                                    >
                                        <div className="clean-tris-cta-title">🔥 SCEGLI IL TRIS — PORTA A CASA DI PIÙ</div>
                                        <div className="clean-tris-cta-sub">3 prodotti selezionati · 1 sola spedizione</div>
                                    </button>
                                )}
                            </div>

                            <div className="clean-purchase-row border-t border-stone-200">
                                <label htmlFor={'detail-qty-' + product.id} className="clean-qty-label">Quantità:</label>
                                <input
                                    id={'detail-qty-' + product.id}
                                    type="number"
                                    min={1}
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value || '1', 10)))}
                                    disabled={!product.inStock || product.stock <= 0 || !selectedPack}
                                    className={'clean-qty-input rounded-xl border border-stone-300 text-center focus:ring-amber-500 focus:border-amber-500 ' + (!product.inStock || product.stock <= 0 || !selectedPack ? 'opacity-50 cursor-not-allowed' : '')}
                                />
                                <button
                                    onClick={() => onAddToCart(product.id, selectedPack.id, quantity)}
                                    disabled={isAddToCartDisabled}
                                    className={'clean-add-cart rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-md transition-all duration-300 button-press-effect ' + (isAddToCartDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg transform hover:-translate-y-0.5')}
                                >
                                    {isAddToCartDisabled && !product.inStock ? 'Non Disponibile' : isAddToCartDisabled ? 'Esaurito / Stock Insuff.' : '➕ Aggiungi al carrello'}
                                </button>
                            </div>

                            {isAdmin && (
                                <div className="clean-admin-stock mt-4 w-full text-sm text-stone-700 bg-stone-50 p-4 rounded-xl border border-stone-200">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-medium">Stock Attuale:</span>
                                        <span className={'font-bold text-lg ' + (product.stock <= 5 && product.stock > 0 ? 'text-orange-500' : product.stock <= 0 ? 'text-red-500' : 'text-green-600')}>
                                            {product.stock} {product.category === 'tesori' ? 'confezioni' : 'vasetti'}
                                        </span>
                                    </div>
                                    <div>
                                        <label htmlFor={'manual-stock-detail-' + product.id} className="block text-xs font-medium text-stone-600 mb-1">Gestisci Stock ({product.category === 'tesori' ? 'confezioni' : 'vasetti'}):</label>
                                        <input
                                            key={product.id + '-stock-input-detail'}
                                            id={'manual-stock-detail-' + product.id}
                                            type="number"
                                            value={manualStockInput}
                                            onChange={(e) => setManualStockInput(parseInt(e.target.value || '0', 10))}
                                            onBlur={() => onManualStockUpdate(product.id, isNaN(manualStockInput) ? 0 : manualStockInput)}
                                            onKeyPress={(e) => { if (e.key === 'Enter') e.target.blur(); }}
                                            className="w-full rounded-xl border border-stone-300 px-3 py-2 text-center text-sm focus:ring-blue-500 focus:border-blue-500 transition"
                                            placeholder="Inserisci quantità"
                                        />
                                    </div>
                                    <div className="mt-3 flex items-center gap-2">
                                        <input
                                            type="number"
                                            min="1"
                                            value={manualStockDelta}
                                            onChange={(e) => setManualStockDelta(Math.max(1, parseInt(e.target.value || '1', 10)))}
                                            className="w-32 rounded-xl border border-stone-300 px-3 py-2 text-sm focus:ring-amber-500 focus:border-amber-500"
                                            placeholder="+ quantità"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => onAddStockDelta(product.id, manualStockDelta)}
                                            className="rounded-xl bg-amber-500 text-white font-semibold px-4 py-2 hover:bg-amber-600 transition button-press-effect"
                                        >
                                            + Aggiungi stock
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        }`;

const detailBlockRe = /        \/\/ Pagina di Dettaglio Prodotto[\s\S]*?\n        \/\/ Componente per visualizzare il contenuto del carrello/;
if (!detailBlockRe.test(html)) {
  throw new Error('[Miele Clean] Vecchio ProductDetailPage non trovato: migrazione dettaglio annullata.');
}
html = html.replace(detailBlockRe, `${cleanProductDetail}\n\n        // Componente per visualizzare il contenuto del carrello`);

if (!html.includes('/clean-product-detail.css')) {
  html = html.replace('</head>', '  <link rel="stylesheet" href="/clean-product-detail.css?v=1">\n</head>');
}

fs.writeFileSync(indexPath, html, 'utf8');
console.log('[Miele Clean] Dettaglio prodotto migrato: Tris nativo, foto e contenuti compatti senza vecchie riscritture DOM.');
