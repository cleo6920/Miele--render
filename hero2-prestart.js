const fs = require('fs');
const path = require('path');

// Ricostruisce le fotografie/immagini usate dalla Hero 2 e dalle nuove linee prima di avviare il server.
try {
  const imageDir = path.join(__dirname, 'images');
  const imageSets = [
    {
      output: 'hero2-marco-oasi.jpg',
      parts: ['hero2-oasi.p01.b64', 'hero2-oasi.p02.b64', 'hero2-oasi.p03.b64', 'hero2-oasi.p04.b64', 'hero2-oasi.p05.b64', 'hero2-oasi.p06.b64']
    },
    {
      output: 'hero2-marco-diffusore.jpg',
      parts: ['hero2-diffusore.p01.b64', 'hero2-diffusore.p02.b64', 'hero2-diffusore.p03.b64', 'hero2-diffusore.p04.b64', 'hero2-diffusore.p05.b64', 'hero2-diffusore.p06.b64', 'hero2-diffusore.p07.b64']
    },
    {
      output: 'linea-benessere-veleno-api.jpg',
      parts: ['linea-benessere-veleno-api.b64']
    }
  ];

  for (const set of imageSets) {
    const encoded = set.parts
      .map((part) => fs.readFileSync(path.join(imageDir, part), 'utf8').trim())
      .join('');
    const image = Buffer.from(encoded, 'base64');
    if (image.length < 1000 || image[0] !== 0xff || image[1] !== 0xd8) {
      throw new Error(`Immagine non valida: ${set.output}`);
    }
    fs.writeFileSync(path.join(imageDir, set.output), image);
  }
  console.log('[Miele Artigianale] Immagini Hero 2 e Linea Benessere Veleno d’Api ricostruite correttamente.');
} catch (error) {
  console.error('[Miele Artigianale] Errore ricostruzione immagini Hero 2/linee:', error);
}

// Mantiene intatta la catena shop approvata; Hero 2 viene applicata per ultima.
require('./sos-dol-prestart.js');

// Mantiene come fallback locale la foto SOS DOL già usata nello stato stabile.
try {
  const indexPath = path.join(__dirname, 'index.html');
  const localHeroImage = '/images/sos-dol-hero-premium.jpg';
  const localHeroPath = path.join(__dirname, 'images', 'sos-dol-hero-premium.jpg');
  let html = fs.readFileSync(indexPath, 'utf8');

  if (!fs.existsSync(localHeroPath)) {
    throw new Error('Asset locale SOS DOL Apifiore non trovato');
  }

  const marker = 'aria-label="Scopri SOS DOL – Unguento Apis – 15 ml"';
  const markerIndex = html.indexOf(marker);
  if (markerIndex === -1) throw new Error('Pulsante SOS DOL Hero 1 non individuato');

  const buttonStart = html.lastIndexOf('<button', markerIndex);
  const buttonEnd = html.indexOf('</button>', markerIndex);
  if (buttonStart === -1 || buttonEnd === -1) throw new Error('Blocco SOS DOL Hero 1 non valido');

  const endExclusive = buttonEnd + '</button>'.length;
  let button = html.slice(buttonStart, endExclusive);
  const imgPattern = /<img\s+src="[^"]+"[^>]*\/>/;
  if (!imgPattern.test(button)) throw new Error('Tag immagine SOS DOL Hero 1 non trovato');

  const img = `<img src="${localHeroImage}" alt="SOS DOL – Unguento Apis 15 ml" className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" />`;
  button = button.replace(imgPattern, img);
  html = html.slice(0, buttonStart) + button + html.slice(endExclusive);

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Hero 1 SOS DOL: fallback locale stabile mantenuto.');
} catch (error) {
  console.error('[Miele Artigianale] Errore ripristino foto SOS DOL Hero 1:', error);
}

require('./hero2-inject.js');

// Prezzo pubblico autoritativo Capsule P+B: €19,90 IVA compresa.
// Aggiorna sia il fallback statico sia il prodotto dopo il merge con Firestore,
// evitando che un eventuale vecchio prezzo a €15,00 torni sul sito.
try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const oldCapsulePack = '{ id: "box5pb", label: "Scatola 5 capsule P+B", jars: 1, price: 15.00 }';
  const newCapsulePack = '{ id: "box5pb", label: "Scatola 5 capsule P+B", jars: 1, price: 19.90 }';
  if (html.includes(oldCapsulePack)) {
    html = html.replaceAll(oldCapsulePack, newCapsulePack);
  }

  const mergeTail = '                        updatedProducts.forEach(fp => {';
  if (html.includes(mergeTail) && !html.includes("const capsulePbIndex = mergedProducts.findIndex(p => p.id === 'capsule-pb')")) {
    const authoritativeCapsulePrice = `                        const capsulePbIndex = mergedProducts.findIndex(p => p.id === 'capsule-pb');\n                        if (capsulePbIndex !== -1) {\n                            mergedProducts[capsulePbIndex] = {\n                                ...mergedProducts[capsulePbIndex],\n                                packs: [{ id: 'box5pb', label: 'Scatola 5 capsule P+B', jars: 1, price: 19.90 }]\n                            };\n                        }\n`;
    html = html.replace(mergeTail, authoritativeCapsulePrice + mergeTail);
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Capsule P+B fissate a €19,90 IVA compresa.');
} catch (error) {
  console.error('[Miele Artigianale] Errore aggiornamento prezzo Capsule P+B:', error);
}

// ProductDetailPage null-safe: evita il crash React se il prodotto è temporaneamente
// non disponibile durante un aggiornamento asincrono di Firestore/stato.
try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const selectedPackNeedle = '            const [selectedPack, setSelectedPack] = useState(product.packs?.[0]);';
  const selectedPackReplacement = `            const safeProduct = product || { packs: [], stock: 0, inStock: false };\n            const [selectedPack, setSelectedPack] = useState(safeProduct.packs?.[0] || null);`;
  if (html.includes(selectedPackNeedle)) html = html.replace(selectedPackNeedle, selectedPackReplacement);

  const stockInitNeedle = '            const [manualStockInput, setManualStockInput] = useState(product.stock);';
  if (html.includes(stockInitNeedle)) html = html.replace(stockInitNeedle, '            const [manualStockInput, setManualStockInput] = useState(safeProduct.stock);');

  const stockEffectNeedle = '                setManualStockInput(product.stock);';
  if (html.includes(stockEffectNeedle)) html = html.replace(stockEffectNeedle, '                setManualStockInput(safeProduct.stock);');

  const memoStartNeedle = `            const isAddToCartDisabled = useMemo(() => {\n                if (!product.inStock || !selectedPack) {`;
  const memoStartReplacement = `            const isAddToCartDisabled = useMemo(() => {\n                if (!product || !safeProduct.inStock || !selectedPack) {`;
  if (html.includes(memoStartNeedle)) html = html.replace(memoStartNeedle, memoStartReplacement);

  const memoTailNeedle = `                const totalJarsRequested = quantity * selectedPack.jars;\n                return totalJarsRequested <= 0 || product.stock < totalJarsRequested;\n            }, [product.inStock, product.stock, selectedPack, quantity]);`;
  const memoTailReplacement = `                const totalJarsRequested = quantity * selectedPack.jars;\n                return totalJarsRequested <= 0 || safeProduct.stock < totalJarsRequested;\n            }, [product, safeProduct.inStock, safeProduct.stock, selectedPack, quantity]);`;
  if (html.includes(memoTailNeedle)) html = html.replace(memoTailNeedle, memoTailReplacement);

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] ProductDetailPage protetta da product undefined temporaneo.');
} catch (error) {
  console.error('[Miele Artigianale] Errore hardening ProductDetailPage:', error);
}

// Solo lato browser sostituisce l'immagine del secondo pulsante Hero 1 con la foto
// ufficiale del prodotto SOS DOL. Non modifica nessun'altra immagine o asset locale.
try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');
  const runtimeId = 'sos-dol-hero-product-only';

  if (!html.includes(`id="${runtimeId}"`)) {
    const runtimeScript = `<script id="${runtimeId}">(()=>{const productImage='https://www.apinfiore.com/wp-content/uploads/2023/03/SOS-Doll_web-5.jpg.webp';const apply=()=>{const button=document.querySelector('button[aria-label="Scopri SOS DOL – Unguento Apis – 15 ml"]');if(!button)return;const img=button.querySelector('img');if(!img||img.dataset.sosDolProductOnly==='1')return;img.dataset.sosDolProductOnly='1';img.referrerPolicy='no-referrer';img.src=productImage;img.style.objectFit='contain';img.style.objectPosition='center';img.style.backgroundColor='#e6d8ef';img.style.padding='2px';img.style.transform='scale(1.12)';};const start=()=>{apply();new MutationObserver(apply).observe(document.body,{childList:true,subtree:true});};document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();})();</script>`;
    html = html.replace('</body>', `${runtimeScript}</body>`);
    fs.writeFileSync(indexPath, html, 'utf8');
    console.log('[Miele Artigianale] Hero 1 SOS DOL: override browser isolato applicato.');
  }
} catch (error) {
  console.error('[Miele Artigianale] Errore override browser SOS DOL Hero 1:', error);
}
