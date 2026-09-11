const fs = require('fs');
const path = require('path');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  // OFFERTA TRIS - implementazione isolata.
  // IMPORTANTE: non modifica prodotti, packs, immagini, prezzi o logica di spedizione.
  // Il pulsante del tris aggiunge al carrello tre prodotti REALI gia' presenti nello shop.
  // In questo modo le card restano identiche a prima e la spedizione viene calcolata
  // naturalmente come ordine di 3 articoli (attualmente 10 euro fuori consegna locale).
  const trisOffers = {
    'millefiori': { total: 25.70, items: [
      { productId:'millefiori', packId:'p1', label:'Millefiori €4,90' },
      { productId:'tesori-castagne-rum', packId:'tf-rum-1', label:'Castagne al rum €5,90' },
      { productId:'bee-energy-bio', packId:'be1', label:'Bee Energy €14,90' }
    ]},
    'melone': { total: 25.70, items: [
      { productId:'melone', packId:'me1', label:'Melone €4,90' },
      { productId:'propol-active-bio', packId:'pa1', label:'Propol Active €10,90' },
      { productId:'cosmesi-shampoo-multivitaminico', packId:'shm1', label:'Shampoo €9,90' }
    ]},
    'fragola': { total: 25.70, items: [
      { productId:'fragola', packId:'fr1', label:'Fragola €4,90' },
      { productId:'propol-active-bio', packId:'pa1', label:'Propol Active €10,90' },
      { productId:'cosmesi-crema-mani', packId:'cm1', label:'Crema Mani €9,90' }
    ]},
    'pesca': { total: 25.70, items: [
      { productId:'pesca', packId:'pe1', label:'Pesca €4,90' },
      { productId:'bee-energy-bio', packId:'be1', label:'Bee Energy €14,90' },
      { productId:'cosmesi-candela-alveare-cera-api', packId:'ca1', label:'Candela Alveare €5,90' }
    ]},
    'arancia': { total: 29.70, items: [
      { productId:'arancia', packId:'ar1', label:'Arancia €4,90' },
      { productId:'bee-energy-bio', packId:'be1', label:'Bee Energy €14,90' },
      { productId:'cosmesi-crema-mani', packId:'cm1', label:'Crema Mani €9,90' }
    ]},
    'castagno': { total: 27.70, items: [
      { productId:'castagno', packId:'c1', label:'Castagno €6,90' },
      { productId:'propol-active-bio', packId:'pa1', label:'Propol Active €10,90' },
      { productId:'cosmesi-shampoo-multivitaminico', packId:'shm1', label:'Shampoo €9,90' }
    ]},
    'acacia-zenzero-apinfiore': { total: 25.70, items: [
      { productId:'acacia-zenzero-apinfiore', packId:'az1', label:'Acacia e Zenzero €7,90' },
      { productId:'propoli-30-spray-integratore', packId:'ps30', label:'Propoli spray €7,90' },
      { productId:'cosmesi-crema-mani', packId:'cm1', label:'Crema Mani €9,90' }
    ]},
    'miele-eucalipto-apinfiore': { total: 25.70, items: [
      { productId:'miele-eucalipto-apinfiore', packId:'euca1', label:'Eucalipto €6,90' },
      { productId:'bee-energy-bio', packId:'be1', label:'Bee Energy €14,90' },
      { productId:'cosmesi-saponetta-aloe-vera', packId:'sav1', label:'Saponetta Aloe €3,90' }
    ]},
    'balsammiel': { total: 27.70, items: [
      { productId:'balsammiel', packId:'ba1', label:'Balsamico Italiano €11,90' },
      { productId:'propoli-analcolica-integratore', packId:'pan1', label:'Propoli analcolica €5,90' },
      { productId:'cosmesi-shampoo-multivitaminico', packId:'shm1', label:'Shampoo €9,90' }
    ]},
    'acacia': { total: 27.70, items: [
      { productId:'acacia', packId:'a40', label:'Acacia 40 g €2,90' },
      { productId:'bee-energy-bio', packId:'be1', label:'Bee Energy €14,90' },
      { productId:'cosmesi-crema-mani', packId:'cm1', label:'Crema Mani €9,90' }
    ]},
    'favo-integrale-bio': { total: 27.70, items: [
      { productId:'favo-integrale-bio', packId:'favo200', label:'Acacia in Favo €11,90' },
      { productId:'propoli-analcolica-integratore', packId:'pan1', label:'Propoli analcolica €5,90' },
      { productId:'cosmesi-shampoo-multivitaminico', packId:'shm1', label:'Shampoo €9,90' }
    ]},
    'polline-italiano': { total: 26.70, items: [
      { productId:'polline-italiano', packId:'pol1', label:'Polline €10,90' },
      { productId:'propoli-30-alcolica-integratore', packId:'pal30', label:'Propoli alcolica contagocce €5,90' },
      { productId:'cosmesi-crema-mani', packId:'cm1', label:'Crema Mani €9,90' }
    ]},
    'orsetti-gommosi': { total: 28.70, items: [
      { productId:'orsetti-gommosi', packId:'ors-gom-1', label:'Orsetti €3,90' },
      { productId:'bee-energy-bio', packId:'be1', label:'Bee Energy €14,90' },
      { productId:'cosmesi-crema-mani', packId:'cm1', label:'Crema Mani €9,90' }
    ]},
    'pappa-reale-italiana-bio': { total: 26.70, items: [
      { productId:'pappa-reale-italiana-bio', packId:'pr1', label:'Pappa Reale €6,90' },
      { productId:'bee-energy-bio', packId:'be1', label:'Bee Energy €14,90' },
      { productId:'cosmesi-burrocacao-miele-pappa-reale', packId:'bmp1', label:'Burrocacao Miele/Pappa Reale €4,90' }
    ]},
    'bee-energy-bio': { total: 27.70, items: [
      { productId:'bee-energy-bio', packId:'be1', label:'Bee Energy €14,90' },
      { productId:'castagno', packId:'c1', label:'Castagno €6,90' },
      { productId:'cosmesi-candela-alveare-cera-api', packId:'ca1', label:'Candela Alveare €5,90' }
    ]},
    'propol-active-bio': { total: 26.70, items: [
      { productId:'propol-active-bio', packId:'pa1', label:'Propol Active €10,90' },
      { productId:'polline-italiano', packId:'pol1', label:'Polline €10,90' },
      { productId:'cosmesi-burrocacao-miele-pappa-reale', packId:'bmp1', label:'Burrocacao Miele/Pappa Reale €4,90' }
    ]},
    'propoli-30-spray-integratore': { total: 28.70, items: [
      { productId:'propoli-30-spray-integratore', packId:'ps30', label:'Propoli spray €7,90' },
      { productId:'polline-italiano', packId:'pol1', label:'Polline €10,90' },
      { productId:'cosmesi-crema-mani', packId:'cm1', label:'Crema Mani €9,90' }
    ]},
    'propoli-30-alcolica-integratore': { total: 27.70, items: [
      { productId:'propoli-30-alcolica-integratore', packId:'pal30', label:'Propoli alcolica contagocce €5,90' },
      { productId:'balsammiel', packId:'ba1', label:'Balsamico Italiano €11,90' },
      { productId:'cosmesi-shampoo-multivitaminico', packId:'shm1', label:'Shampoo €9,90' }
    ]},
    'propoli-analcolica-integratore': { total: 26.70, items: [
      { productId:'propoli-analcolica-integratore', packId:'pan1', label:'Propoli analcolica €5,90' },
      { productId:'polline-italiano', packId:'pol1', label:'Polline €10,90' },
      { productId:'cosmesi-shampoo-multivitaminico', packId:'shm1', label:'Shampoo €9,90' }
    ]},
    'cosmesi-crema-mani': { total: 27.70, items: [
      { productId:'cosmesi-crema-mani', packId:'cm1', label:'Crema Mani €9,90' },
      { productId:'favo-integrale-bio', packId:'favo200', label:'Acacia in Favo €11,90' },
      { productId:'propoli-analcolica-integratore', packId:'pan1', label:'Propoli analcolica €5,90' }
    ]},
    'cosmesi-burrocacao-propoli-aloe': { total: 27.70, items: [
      { productId:'cosmesi-burrocacao-propoli-aloe', packId:'bpa1', label:'Burrocacao Propoli + Aloe €4,90' },
      { productId:'balsammiel', packId:'ba1', label:'Balsamico Italiano €11,90' },
      { productId:'propol-active-bio', packId:'pa1', label:'Propol Active €10,90' }
    ]},
    'cosmesi-burrocacao-miele-pappa-reale': { total: 27.70, items: [
      { productId:'cosmesi-burrocacao-miele-pappa-reale', packId:'bmp1', label:'Burrocacao Miele + Pappa Reale €4,90' },
      { productId:'favo-integrale-bio', packId:'favo200', label:'Acacia in Favo €11,90' },
      { productId:'propol-active-bio', packId:'pa1', label:'Propol Active €10,90' }
    ]},
    'cosmesi-shampoo-multivitaminico': { total: 27.70, items: [
      { productId:'cosmesi-shampoo-multivitaminico', packId:'shm1', label:'Shampoo €9,90' },
      { productId:'favo-integrale-bio', packId:'favo200', label:'Acacia in Favo €11,90' },
      { productId:'propoli-30-alcolica-integratore', packId:'pal30', label:'Propoli alcolica contagocce €5,90' }
    ]},
    'cosmesi-saponetta-frutti-bosco': { total: 25.70, items: [
      { productId:'cosmesi-saponetta-frutti-bosco', packId:'sfb1', label:'Saponetta Frutti di Bosco €3,90' },
      { productId:'polline-italiano', packId:'pol1', label:'Polline €10,90' },
      { productId:'propol-active-bio', packId:'pa1', label:'Propol Active €10,90' }
    ]},
    'cosmesi-saponetta-lavanda': { total: 25.70, items: [
      { productId:'cosmesi-saponetta-lavanda', packId:'sl1', label:'Saponetta Lavanda €3,90' },
      { productId:'castagno', packId:'c1', label:'Castagno €6,90' },
      { productId:'bee-energy-bio', packId:'be1', label:'Bee Energy €14,90' }
    ]},
    'cosmesi-saponetta-aloe-vera': { total: 26.70, items: [
      { productId:'cosmesi-saponetta-aloe-vera', packId:'sav1', label:'Saponetta Aloe €3,90' },
      { productId:'favo-integrale-bio', packId:'favo200', label:'Acacia in Favo €11,90' },
      { productId:'propol-active-bio', packId:'pa1', label:'Propol Active €10,90' }
    ]},
    'cosmesi-candela-alveare-cera-api': { total: 25.70, items: [
      { productId:'cosmesi-candela-alveare-cera-api', packId:'ca1', label:'Candela Alveare €5,90' },
      { productId:'balsammiel', packId:'ba1', label:'Balsamico Italiano €11,90' },
      { productId:'propoli-30-spray-integratore', packId:'ps30', label:'Propoli spray €7,90' }
    ]},
    'tesori-limoncello': { total: 27.70, items: [
      { productId:'tesori-limoncello', packId:'tf-lim-1', label:'Limoncello €5,90' },
      { productId:'favo-integrale-bio', packId:'favo200', label:'Acacia in Favo €11,90' },
      { productId:'cosmesi-shampoo-multivitaminico', packId:'shm1', label:'Shampoo €9,90' }
    ]},
    'tesori-liquore-caffe': { total: 27.70, items: [
      { productId:'tesori-liquore-caffe', packId:'tf-caf-1', label:'Liquore al Caffè €5,90' },
      { productId:'balsammiel', packId:'ba1', label:'Balsamico Italiano €11,90' },
      { productId:'cosmesi-crema-mani', packId:'cm1', label:'Crema Mani €9,90' }
    ]},
    'tesori-castagne-rum': { total: 25.70, items: [
      { productId:'tesori-castagne-rum', packId:'tf-rum-1', label:'Castagne al Rum €5,90' },
      { productId:'balsammiel', packId:'ba1', label:'Balsamico Italiano €11,90' },
      { productId:'propoli-30-spray-integratore', packId:'ps30', label:'Propoli spray €7,90' }
    ]}
  };

  if (Object.keys(trisOffers).length !== 30) throw new Error('Le offerte tris devono essere 30');

  // Costante UI inserita nel medesimo scope React, senza toccare l'array products.
  if (!html.includes('const SHOP_TRIS_OFFERS =')) {
    const marker = '        // Componente per visualizzare una singola carta prodotto (solo nome e immagine)';
    const pos = html.indexOf(marker);
    if (pos === -1) throw new Error('Punto inserimento costante tris non trovato');
    const js = `        const SHOP_TRIS_OFFERS = ${JSON.stringify(trisOffers)};\n\n`;
    html = html.slice(0, pos) + js + html.slice(pos);
  }

  // Badge sulla card: solo visuale, nessun cambiamento a product.image o product.packs.
  const cardNameNeedle = '<h3 className="text-2xl font-bold text-amber-700">{product.name}</h3>';
  if (html.includes(cardNameNeedle) && !html.includes('OFFERTA TRIS DISPONIBILE')) {
    html = html.replaceAll(cardNameNeedle,
      `${cardNameNeedle}\n                    {SHOP_TRIS_OFFERS[product.id] && (\n                        <div className="mt-3 rounded-full border border-amber-400 bg-amber-100 px-3 py-1.5 text-xs font-black tracking-wide text-amber-900">\n                            OFFERTA TRIS DISPONIBILE · 3 prodotti, un’unica spedizione\n                        </div>\n                    )}`
    );
  }

  // Box Offerta Tris nella scheda dettaglio. Il click aggiunge i tre prodotti reali,
  // quindi carrello, stock, checkout e spedizione continuano a usare la logica esistente.
  const addButtonBlock = `                                <button\n                                    onClick={() => onAddToCart(product.id, selectedPack.id, quantity)}\n                                    disabled={isAddToCartDisabled}\n                                    className={\`flex-grow rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 py-3 shadow-md transition-all duration-300 button-press-effect pack-option \${isAddToCartDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg transform hover:-translate-y-0.5'}\`}\n                                >\n                                    {isAddToCartDisabled && !product.inStock ? \"Non Disponibile\" : isAddToCartDisabled ? \"Esaurito / Stock Insuff.\" : \"➕ Aggiungi al carrello\"}\n                                </button>\n                            </div>`;

  if (html.includes(addButtonBlock) && !html.includes('Aggiungi il tris al carrello')) {
    const trisBox = `${addButtonBlock}\n\n                            {SHOP_TRIS_OFFERS[product.id] && (\n                                <div className="rounded-2xl border-2 border-amber-400 bg-amber-50 p-4 shadow-md">\n                                    <div className="text-lg font-black text-amber-900">OFFERTA TRIS</div>\n                                    <div className="mt-1 text-sm font-bold text-amber-800">3 prodotti, un’unica spedizione</div>\n                                    <div className="mt-2 space-y-1 text-sm text-stone-700">\n                                        {SHOP_TRIS_OFFERS[product.id].items.map((item, idx) => (\n                                            <div key={item.productId + '-' + idx}>• {item.label}</div>\n                                        ))}\n                                    </div>\n                                    <div className="mt-3 flex items-center justify-between gap-3">\n                                        <div className="text-xl font-black text-amber-900">€ {fmt(SHOP_TRIS_OFFERS[product.id].total)}</div>\n                                        <button\n                                            type="button"\n                                            onClick={() => {\n                                                SHOP_TRIS_OFFERS[product.id].items.forEach(item => onAddToCart(item.productId, item.packId, 1));\n                                            }}\n                                            className="rounded-xl bg-amber-600 hover:bg-amber-700 px-4 py-3 text-sm font-black text-white shadow-md button-press-effect"\n                                        >\n                                            Aggiungi il tris al carrello\n                                        </button>\n                                    </div>\n                                </div>\n                            )}`;
    html = html.replaceAll(addButtonBlock, trisBox);
  }

  if (!html.includes('SHOP_TRIS_OFFERS[product.id]')) throw new Error('UI tris non collegata');
  if (!html.includes('Aggiungi il tris al carrello')) throw new Error('Pulsante tris non inserito');

  // Guardia di sicurezza: questa patch NON deve mai modificare le immagini o i packs.
  if (html.includes('trisReadyProducts') || html.includes('shippingUnits') || html.includes('stockUnits')) {
    throw new Error('Rilevata vecchia implementazione invasiva del tris');
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] OFFERTE TRIS isolate: card/immagini/packs originali invariati; tris aggiunge 3 prodotti reali al carrello.');
} catch (error) {
  console.error('[Miele Artigianale] Errore OFFERTE TRIS:', error);
  process.exitCode = 1;
}
