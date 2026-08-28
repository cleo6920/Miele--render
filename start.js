const fs = require('fs');
const path = require('path');

const BALSAM_IMAGE = '/images/balsam-miel-final.jpg';
const BALSAM_PLACEHOLDER = 'https://placehold.co/400x400/A52A2A/FFFFFF?text=Balsammiel';
const ACACIA_PLACEHOLDER = 'https://placehold.co/400x400/ADD8E6/00008B?text=Miele%20Acacia';
const ACACIA_BASE64_FILE = path.join(__dirname, 'images', 'acacia-tiny-valid.b64');

const MILLEFIORI_OLD_PROMO = '{ id: "p12", label: "12 vasetti (250g cad.)", jars: 12, price: 55.00, originalPrice: 12 * 5.00 },';
const MILLEFIORI_TRIS = '{ id: "p-tris-dolce-risveglio", label: "Tris Dolce Risveglio", jars: 1, price: 30.00, isTris: true, trisBadge: "SCELTA TRIS", trisProducts: ["Miele Millefiori", "Bee Energy BIO", "Polline Italiano"], trisShipping: "1 sola spedizione", trisImage: "" },';
const MILLEFIORI_TRIS_HINT = '3 prodotti · 1 sola spedizione';

let ACACIA_IMAGE = '/images/acacia-shop-v2.jpg';
try {
  const base64 = fs.readFileSync(ACACIA_BASE64_FILE, 'utf8').replace(/\s+/g, '');
  const jpegBuffer = Buffer.from(base64, 'base64');
  const validJpeg = jpegBuffer.length > 1000 && jpegBuffer[0] === 0xff && jpegBuffer[1] === 0xd8 && jpegBuffer[jpegBuffer.length - 2] === 0xff && jpegBuffer[jpegBuffer.length - 1] === 0xd9;
  if (!validJpeg) throw new Error('Acacia JPEG validation failed');
  ACACIA_IMAGE = `data:image/jpeg;base64,${base64}`;
} catch (error) {
  console.error('[Miele Artigianale] Errore preparazione immagine Acacia valida:', error);
}

const indexPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
html = html.replaceAll(BALSAM_PLACEHOLDER, BALSAM_IMAGE);
html = html.replaceAll(ACACIA_PLACEHOLDER, ACACIA_IMAGE);
html = html.replaceAll('/images/acacia-shop-v2.jpg', ACACIA_IMAGE);

// Pilot bundle: replace only the old 12-jar Millefiori promo with the 3-product tris.
const millefioriPromoCount = html.split(MILLEFIORI_OLD_PROMO).length - 1;
if (millefioriPromoCount > 0) {
  html = html.replaceAll(MILLEFIORI_OLD_PROMO, MILLEFIORI_TRIS);
  const trisPackEnd = `${MILLEFIORI_TRIS}\n                    ],`;
  const trisPackWithHint = `${MILLEFIORI_TRIS}\n                    ],\n                    shippingHints: [\n                        { packId: "p-tris-dolce-risveglio", label: "${MILLEFIORI_TRIS_HINT}" }\n                    ],`;
  html = html.replaceAll(trisPackEnd, trisPackWithHint);
  console.log(`[Miele Artigianale] Tris Millefiori attivato in ${millefioriPromoCount} definizione/i.`);
} else {
  console.warn('[Miele Artigianale] Promo Millefiori 12 vasetti non trovata: nessuna modifica bundle applicata.');
}

// Make tris cards visually distinct while keeping the existing generic pack renderer for all other packs.
const packClassNeedle = 'className={`w-full rounded-xl border p-4 text-left transition-all duration-200 flex justify-between items-center button-press-effect pack-option ${';
const packClassReplacement = 'className={`w-full rounded-xl border p-4 text-left transition-all duration-200 flex justify-between items-center button-press-effect pack-option ${pack.isTris ? "border-2 border-amber-400 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 shadow-lg p-5" : ""} ${';
if (html.includes(packClassNeedle)) {
  html = html.replaceAll(packClassNeedle, packClassReplacement);
}

const packContentNeedle = `                                            <div>
                                                <div className="font-semibold text-xl">{pack.label}</div>
                                                {product.shippingHints && product.shippingHints.find(h => h.packId === pack.id) && (
                                                    <div className="text-xs text-stone-500 mt-0.5">{product.shippingHints.find(h => h.packId === pack.id).label}</div>
                                                )}
                                                {pack.originalPrice && pack.originalPrice > pack.price && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-stone-500 line-through text-sm">€ {fmt(pack.originalPrice)}</span>
                                                        <span className="text-red-600 font-bold text-sm bg-red-100 px-2 py-0.5 rounded-full">
                                                            -{fmt(((pack.originalPrice - pack.price) / pack.originalPrice) * 100)}%
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-2xl font-bold text-amber-800">€ {fmt(pack.price)}</div>`;

const packContentReplacement = `                                            {pack.isTris ? (
                                                <div className="w-full flex flex-col sm:flex-row gap-4 items-stretch">
                                                    <div className="w-full sm:w-32 min-h-[112px] rounded-xl border border-amber-300 bg-white/80 shadow-inner flex items-center justify-center overflow-hidden flex-shrink-0">
                                                        {pack.trisImage ? (
                                                            <img
                                                                src={pack.trisImage}
                                                                alt={pack.label}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                            />
                                                        ) : (
                                                            <div className="text-center px-3 py-4">
                                                                <div className="text-4xl leading-none">🍯</div>
                                                                <div className="mt-2 text-xs font-bold uppercase tracking-wide text-amber-700">Immagine tris</div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex-1 min-w-0 text-left">
                                                        <div className="inline-flex items-center rounded-full bg-amber-600 text-white text-xs font-extrabold tracking-wide px-3 py-1 shadow-sm">
                                                            {pack.trisBadge || 'SCELTA TRIS'}
                                                        </div>
                                                        <div className="mt-2 text-2xl font-extrabold text-amber-900 leading-tight">{pack.label}</div>
                                                        <div className="mt-2 space-y-1 text-sm font-medium text-stone-700">
                                                            {(pack.trisProducts || []).map((item, idx) => (
                                                                <div key={idx} className="flex items-start gap-2">
                                                                    <span className="text-amber-600 font-black">+</span>
                                                                    <span>{item}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="mt-3 flex flex-wrap gap-2">
                                                            <span className="inline-flex items-center rounded-full bg-white border border-amber-300 text-amber-900 text-xs font-bold px-3 py-1">3 prodotti</span>
                                                            <span className="inline-flex items-center rounded-full bg-green-50 border border-green-300 text-green-800 text-xs font-bold px-3 py-1">🚚 {pack.trisShipping || '1 sola spedizione'}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 sm:min-w-[112px] border-t sm:border-t-0 sm:border-l border-amber-200 pt-3 sm:pt-0 sm:pl-4">
                                                        <span className="text-xs uppercase tracking-wide font-bold text-stone-500">Totale tris</span>
                                                        <span className="text-3xl font-extrabold text-amber-800">€ {fmt(pack.price)}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div>
                                                        <div className="font-semibold text-xl">{pack.label}</div>
                                                        {product.shippingHints && product.shippingHints.find(h => h.packId === pack.id) && (
                                                            <div className="text-xs text-stone-500 mt-0.5">{product.shippingHints.find(h => h.packId === pack.id).label}</div>
                                                        )}
                                                        {pack.originalPrice && pack.originalPrice > pack.price && (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-stone-500 line-through text-sm">€ {fmt(pack.originalPrice)}</span>
                                                                <span className="text-red-600 font-bold text-sm bg-red-100 px-2 py-0.5 rounded-full">
                                                                    -{fmt(((pack.originalPrice - pack.price) / pack.originalPrice) * 100)}%
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-2xl font-bold text-amber-800">€ {fmt(pack.price)}</div>
                                                </>
                                            )}`;

const trisUiCount = html.split(packContentNeedle).length - 1;
if (trisUiCount > 0) {
  html = html.replaceAll(packContentNeedle, packContentReplacement);
  console.log(`[Miele Artigianale] Layout SCELTA TRIS predisposto in ${trisUiCount} renderer.`);
} else {
  console.warn('[Miele Artigianale] Renderer pacchetti non trovato: layout tris non applicato.');
}

// Keep static product images authoritative. For Millefiori only, also keep the new tris packs
// and its shipping message authoritative so Firestore cannot restore the old 12-jar promotion.
const mergeNeedle = `? { ...staticProduct, ...firestoreProductsMap.get(staticProduct.id) }\n                                : staticProduct;`;
const mergeReplacement = `? { ...staticProduct, ...firestoreProductsMap.get(staticProduct.id), image: staticProduct.image, ...(staticProduct.id === 'millefiori' ? { packs: staticProduct.packs, shippingHints: staticProduct.shippingHints } : {}) }\n                                : staticProduct;`;
if (html.includes(mergeNeedle)) {
  html = html.replaceAll(mergeNeedle, mergeReplacement);
}
fs.writeFileSync(indexPath, html, 'utf8');

// Point every legacy Balsam fallback to the verified local image.
const serverPath = path.join(__dirname, 'server.js');
let server = fs.readFileSync(serverPath, 'utf8');
server = server
  .replaceAll("includes('/images/balsam-miel.jpg')", `includes('${BALSAM_IMAGE}')`)
  .replaceAll("img.src='/images/balsam-miel.jpg'", `img.src='${BALSAM_IMAGE}'`)
  .replaceAll("html.replaceAll('https://placehold.co/400x400/A52A2A/FFFFFF?text=Balsammiel','/images/balsam-miel.jpg')", `html.replaceAll('https://placehold.co/400x400/A52A2A/FFFFFF?text=Balsammiel','${BALSAM_IMAGE}')`)
  .replaceAll("image: '/images/balsam-miel.jpg'", `image: '${BALSAM_IMAGE}'`);
fs.writeFileSync(serverPath, server, 'utf8');

console.log('[Miele Artigianale] Immagini pronte:', { balsam: BALSAM_IMAGE, acacia: ACACIA_IMAGE.startsWith('data:image/') ? 'inline-valid-jpeg' : ACACIA_IMAGE });
require('./server.js');
