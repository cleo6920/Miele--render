const fs = require('fs');
const path = require('path');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  // Fonte autoritativa: PDF "OFFERTE TRIS - PRODOTTI DELLA FABBRICA DELLE API".
  // Ogni referenza vendibile ha una proposta dedicata composta da tre prodotti.
  // L'offerta non applica sconti ai prodotti: il vantaggio commerciale e' sfruttare
  // un'unica spedizione per tre articoli dello stesso ordine.
  const trisOffers = {
    'millefiori': { price: 25.70, items: ['Millefiori €4,90', 'Castagne al rum €5,90', 'Bee Energy €14,90'] },
    'melone': { price: 25.70, items: ['Melone €4,90', 'Propol Active €10,90', 'Shampoo €9,90'] },
    'fragola': { price: 25.70, items: ['Fragola €4,90', 'Propol Active €10,90', 'Crema Mani €9,90'] },
    'pesca': { price: 25.70, items: ['Pesca €4,90', 'Bee Energy €14,90', 'Candela Alveare €5,90'] },
    'arancia': { price: 29.70, items: ['Arancia €4,90', 'Bee Energy €14,90', 'Crema Mani €9,90'] },
    'castagno': { price: 27.70, items: ['Castagno €6,90', 'Propol Active €10,90', 'Shampoo €9,90'] },
    'acacia-zenzero-apinfiore': { price: 25.70, items: ['Acacia e Zenzero €7,90', 'Propoli spray €7,90', 'Crema Mani €9,90'] },
    'miele-eucalipto-apinfiore': { price: 25.70, items: ['Eucalipto €6,90', 'Bee Energy €14,90', 'Saponetta Aloe €3,90'] },
    'balsammiel': { price: 27.70, items: ['Balsamico Italiano €11,90', 'Propoli analcolica €5,90', 'Shampoo €9,90'] },
    'acacia': { price: 27.70, items: ['Acacia 40 g €2,90', 'Bee Energy €14,90', 'Crema Mani €9,90'] },
    'favo-integrale-bio': { price: 27.70, items: ['Acacia in Favo €11,90', 'Propoli analcolica €5,90', 'Shampoo €9,90'] },
    'polline-italiano': { price: 26.70, items: ['Polline €10,90', 'Propoli alcolica contagocce €5,90', 'Crema Mani €9,90'] },
    'orsetti-gommosi': { price: 28.70, items: ['Orsetti €3,90', 'Bee Energy €14,90', 'Crema Mani €9,90'] },
    'pappa-reale-italiana-bio': { price: 26.70, items: ['Pappa Reale €6,90', 'Bee Energy €14,90', 'Burrocacao Miele/Pappa Reale €4,90'] },

    'bee-energy-bio': { price: 27.70, items: ['Bee Energy €14,90', 'Castagno €6,90', 'Candela Alveare €5,90'] },
    'propol-active-bio': { price: 26.70, items: ['Propol Active €10,90', 'Polline €10,90', 'Burrocacao Miele/Pappa Reale €4,90'] },
    'propoli-30-spray-integratore': { price: 28.70, items: ['Propoli spray €7,90', 'Polline €10,90', 'Crema Mani €9,90'] },
    'propoli-30-alcolica-integratore': { price: 27.70, items: ['Propoli alcolica contagocce €5,90', 'Balsamico Italiano €11,90', 'Shampoo €9,90'] },
    'propoli-analcolica-integratore': { price: 26.70, items: ['Propoli analcolica €5,90', 'Polline €10,90', 'Shampoo €9,90'] },

    'cosmesi-crema-mani': { price: 27.70, items: ['Crema Mani €9,90', 'Acacia in Favo €11,90', 'Propoli analcolica €5,90'] },
    'cosmesi-burrocacao-propoli-aloe': { price: 27.70, items: ['Burrocacao Propoli + Aloe €4,90', 'Balsamico Italiano €11,90', 'Propol Active €10,90'] },
    'cosmesi-burrocacao-miele-pappa-reale': { price: 27.70, items: ['Burrocacao Miele + Pappa Reale €4,90', 'Acacia in Favo €11,90', 'Propol Active €10,90'] },
    'cosmesi-shampoo-multivitaminico': { price: 27.70, items: ['Shampoo €9,90', 'Acacia in Favo €11,90', 'Propoli alcolica contagocce €5,90'] },
    'cosmesi-saponetta-frutti-bosco': { price: 25.70, items: ['Saponetta Frutti di Bosco €3,90', 'Polline €10,90', 'Propol Active €10,90'] },
    'cosmesi-saponetta-lavanda': { price: 25.70, items: ['Saponetta Lavanda €3,90', 'Castagno €6,90', 'Bee Energy €14,90'] },
    'cosmesi-saponetta-aloe-vera': { price: 26.70, items: ['Saponetta Aloe €3,90', 'Acacia in Favo €11,90', 'Propol Active €10,90'] },
    'cosmesi-candela-alveare-cera-api': { price: 25.70, items: ['Candela Alveare €5,90', 'Balsamico Italiano €11,90', 'Propoli spray €7,90'] },

    'tesori-limoncello': { price: 27.70, items: ['Limoncello €5,90', 'Acacia in Favo €11,90', 'Shampoo €9,90'] },
    'tesori-liquore-caffe': { price: 27.70, items: ['Liquore al Caffè €5,90', 'Balsamico Italiano €11,90', 'Crema Mani €9,90'] },
    'tesori-castagne-rum': { price: 25.70, items: ['Castagne al Rum €5,90', 'Balsamico Italiano €11,90', 'Propoli spray €7,90'] }
  };

  if (Object.keys(trisOffers).length !== 30) {
    throw new Error(`Numero offerte tris non valido: ${Object.keys(trisOffers).length}`);
  }

  const brochureTrisOffers = Object.fromEntries(
    Object.entries(trisOffers).map(([productId, offer]) => [productId, {
      id: `tris-${productId}`,
      label: 'OFFERTA TRIS',
      marketingLabel: '3 prodotti, un’unica spedizione',
      trisSummary: offer.items.join(' + '),
      jars: 1,
      shippingUnits: 3,
      stockUnits: 1,
      price: offer.price,
      isTris: true
    }])
  );

  // Applica i tris DOPO tutti gli override brochure gia' esistenti, cosi' nessuna linea
  // puo' cancellare la seconda scelta di acquisto.
  if (!html.includes('const brochureTrisOffers =')) {
    const filteredRegex = /const filtered = brochureReadyProducts\.filter\(p => allowedCategoriesForShop\.includes\(p\.category\)\);/;
    if (!filteredRegex.test(html)) {
      throw new Error('Punto filtro catalogo brochureReadyProducts non trovato');
    }

    const injection = `const brochureTrisOffers = ${JSON.stringify(brochureTrisOffers)};\n                        const trisReadyProducts = brochureReadyProducts.map(p => {\n                            const trisOffer = brochureTrisOffers[p.id];\n                            if (!trisOffer) return p;\n                            const normalPacks = Array.isArray(p.packs) ? p.packs.filter(pack => !pack.isTris) : [];\n                            return { ...p, packs: [...normalPacks, trisOffer] };\n                        });\n                        const filtered = trisReadyProducts.filter(p => allowedCategoriesForShop.includes(p.category));`;

    html = html.replace(filteredRegex, injection);
  }

  // Per il tris le 3 unita' servono alla logica di spedizione, mentre lo stock della
  // referenza principale deve scalare come una sola confezione del pack.
  html = html.replaceAll(
    'const totalJarsRequested = quantity * selectedPack.jars;',
    'const totalJarsRequested = quantity * (selectedPack.stockUnits || selectedPack.jars);'
  );
  html = html.replaceAll(
    'jarsInCartAlreadyEquivalent = existingCartItem.quantity * existingPack.jars;',
    'jarsInCartAlreadyEquivalent = existingCartItem.quantity * (existingPack.stockUnits || existingPack.jars);'
  );
  html = html.replaceAll(
    'const totalJarsRequestedEquivalent = newQuantity * selectedPack.jars;',
    'const totalJarsRequestedEquivalent = newQuantity * (selectedPack.stockUnits || selectedPack.jars);'
  );

  // La spedizione deve leggere 3 prodotti per ogni OFFERTA TRIS.
  html = html.replaceAll(
    'totalItemJars: item.quantity * pack.jars, currentStock: product.stock',
    'totalItemJars: item.quantity * (pack.shippingUnits || pack.jars), currentStock: product.stock'
  );

  // Nel carrello/checkout il pack mantiene anche la composizione completa del tris,
  // utile per preparare correttamente l'ordine.
  html = html.replaceAll(
    'quantity: item.quantity, productName: product.name, packLabel: pack.label,',
    "quantity: item.quantity, productName: product.name, packLabel: pack.isTris ? `${pack.label} - ${pack.trisSummary}` : pack.label,"
  );

  // Badge compatto direttamente sulla card prodotto.
  const cardNameNeedle = '<h3 className="text-2xl font-bold text-amber-700">{product.name}</h3>';
  if (html.includes(cardNameNeedle) && !html.includes('OFFERTA TRIS DISPONIBILE')) {
    html = html.replaceAll(
      cardNameNeedle,
      `${cardNameNeedle}\n                    {product.packs?.some(pack => pack.isTris) && (\n                        <div className="mt-3 rounded-full border border-amber-400 bg-amber-100 px-3 py-1.5 text-xs font-black tracking-wide text-amber-900">\n                            OFFERTA TRIS DISPONIBILE · 3 prodotti, un’unica spedizione\n                        </div>\n                    )}`
    );
  }

  // Dentro la scheda dettaglio, sotto "OFFERTA TRIS", mostra esattamente i tre prodotti.
  const packLabelNeedle = '<div className="font-semibold text-xl">{pack.label}</div>';
  if (html.includes(packLabelNeedle) && !html.includes('{pack.trisSummary}')) {
    html = html.replaceAll(
      packLabelNeedle,
      `${packLabelNeedle}\n                                                {pack.isTris && (\n                                                    <div className="mt-2">\n                                                        <div className="text-sm font-bold text-amber-800">3 prodotti, un’unica spedizione</div>\n                                                        <div className="mt-1 text-sm leading-snug text-stone-700">{pack.trisSummary}</div>\n                                                    </div>\n                                                )}`
    );
  }

  // Verifiche circoscritte: 30 offerte presenti, badge UI presente, spedizione pack=3.
  for (const productId of Object.keys(trisOffers)) {
    if (!html.includes(`\"${productId}\":{\"id\":\"tris-${productId}\"`) &&
        !html.includes(`\"${productId}\": {\"id\":\"tris-${productId}\"`)) {
      // JSON.stringify non inserisce spazi: questo controllo intercetta regressioni nel mapping.
      if (!html.includes(`tris-${productId}`)) throw new Error(`Offerta tris mancante per ${productId}`);
    }
  }
  if (!html.includes('OFFERTA TRIS DISPONIBILE')) throw new Error('Badge Offerta Tris non inserito nelle card');
  if (!html.includes('pack.shippingUnits || pack.jars')) throw new Error('Logica spedizione Offerta Tris non collegata');

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] OFFERTE TRIS pronte: 30 referenze, scelta singola + tris, composizioni PDF e spedizione unica.');
} catch (error) {
  console.error('[Miele Artigianale] Errore OFFERTE TRIS:', error);
  process.exitCode = 1;
}
