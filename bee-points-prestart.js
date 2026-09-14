const fs = require('fs');
const path = require('path');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  // Badge Punti Ape nella scheda prodotto.
  // Scala approvata: 1 Ape da €2,90–€3,90, poi crescita per fascia prezzo.
  // Linea Veleno d'Api: +2 Api bonus. Tris: somma Api dei 3 prodotti +3 Api bonus.
  const titleNeedle = '                            <h2 className="text-4xl font-bold text-amber-800">{product.name}</h2>';
  const titleCount = html.split(titleNeedle).length - 1;

  if (!html.includes('data-bee-points-badge="true"')) {
    if (titleCount < 1) throw new Error('Titolo scheda prodotto non trovato per badge Punti Ape');

    const badgeBlock = `${titleNeedle}
                            {(() => {
                                const baseBeePoints = (rawPrice) => {
                                    const price = Number(rawPrice || 0);
                                    if (price <= 0) return 0;
                                    if (price <= 3.90) return 1;
                                    if (price <= 6.90) return 2;
                                    if (price <= 9.90) return 3;
                                    if (price <= 14.90) return 4;
                                    if (price <= 20.00) return 5;
                                    if (price <= 29.90) return 6;
                                    if (price <= 39.90) return 7;
                                    if (price <= 59.90) return 8;
                                    if (price <= 99.90) return 10;
                                    return 15;
                                };

                                const packPrice = Number(selectedPack?.price ?? product.packs?.[0]?.price ?? 0);
                                let beePoints = baseBeePoints(packPrice);
                                let bonusLabel = '';

                                if (product.category === 'veleno-api') {
                                    const isSosDol = product.id === 'unguento-apis';
                                    beePoints = isSosDol ? 10 : beePoints + 2;
                                    bonusLabel = isSosDol ? '8 API + 2 BONUS = 10 API' : '+2 API BONUS LINEA VELENO D’API';
                                }

                                if (product.category === 'tris-alveare') {
                                    const explicitPoints = Number(product.beePoints);
                                    if (Number.isFinite(explicitPoints) && explicitPoints > 0) {
                                        beePoints = explicitPoints;
                                    } else if (String(product.id || '').startsWith('tris-alveare-personalizzato-')) {
                                        const customOptionPoints = {
                                            'favo-integrale': 4,
                                            'polline': 4,
                                            'orsetti': 1,
                                            'pappa-reale': 2,
                                            'bee-energy': 4,
                                            'propol-active': 4,
                                            'propoli-spray': 3,
                                            'propoli-alcolica': 2,
                                            'propoli-analcolica': 2,
                                            'crema-mani': 3,
                                            'burrocacao-propoli-aloe': 2,
                                            'burrocacao-miele-pappa': 2,
                                            'shampoo': 3,
                                            'saponetta-frutti-bosco': 1,
                                            'saponetta-lavanda': 1,
                                            'saponetta-aloe': 1,
                                            'candela-alveare': 2,
                                            'limoncello': 2,
                                            'liquore-caffe': 2,
                                            'castagne-rum': 2
                                        };
                                        let customSum = 0;
                                        let customCount = 0;
                                        Object.entries(customOptionPoints).forEach(([optionId, points]) => {
                                            if (String(product.id).includes(optionId)) {
                                                customSum += points;
                                                customCount += 1;
                                            }
                                        });
                                        beePoints = customCount === 3 ? customSum + 3 : baseBeePoints(packPrice) + 3;
                                    } else {
                                        const componentPrices = [];
                                        const priceRegex = /€\s*(\d+(?:[.,]\d+)?)/g;
                                        const description = String(product.description || '');
                                        let match;
                                        while ((match = priceRegex.exec(description)) && componentPrices.length < 3) {
                                            componentPrices.push(Number(match[1].replace(',', '.')));
                                        }
                                        beePoints = componentPrices.length === 3
                                            ? componentPrices.reduce((sum, price) => sum + baseBeePoints(price), 0) + 3
                                            : baseBeePoints(packPrice) + 3;
                                    }
                                    bonusLabel = '+3 API BONUS TRIS';
                                }

                                if (!beePoints) return null;

                                return (
                                    <div data-bee-points-badge="true" className="inline-flex w-fit max-w-full items-center gap-3 rounded-2xl border-2 border-amber-400 bg-gradient-to-r from-amber-100 via-yellow-50 to-amber-200 px-4 py-3 shadow-lg">
                                        <span aria-hidden="true" className="text-4xl leading-none drop-shadow-sm">🐝</span>
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-baseline gap-x-2">
                                                <span className="text-2xl sm:text-3xl font-black text-amber-900">{beePoints} {beePoints === 1 ? 'APE' : 'API'}</span>
                                                <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-amber-800">Punti Ape con questo acquisto</span>
                                            </div>
                                            {bonusLabel && (
                                                <div className="mt-1 inline-flex rounded-full bg-amber-600 px-2.5 py-1 text-xs font-black uppercase tracking-wide text-white shadow-sm">
                                                    {bonusLabel}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })()}`;

    html = html.replaceAll(titleNeedle, badgeBlock);
  }

  // Nel configuratore del Tris personalizzato mostra subito la somma Api + bonus 3.
  if (html.includes('Scegli il tuo tris personalizzato') && !html.includes('data-custom-tris-bee-points="true"')) {
    const totalNeedle = '                                                        const total = chosen.reduce((sum, option) => sum + option.price, 0);';
    if (!html.includes(totalNeedle)) throw new Error('Calcolo totale Tris personalizzato non trovato');

    const totalReplacement = `${totalNeedle}
                                                        const beeBasePointsForTris = (price) => {
                                                            if (price <= 3.90) return 1;
                                                            if (price <= 6.90) return 2;
                                                            if (price <= 9.90) return 3;
                                                            if (price <= 14.90) return 4;
                                                            if (price <= 20.00) return 5;
                                                            if (price <= 29.90) return 6;
                                                            if (price <= 39.90) return 7;
                                                            if (price <= 59.90) return 8;
                                                            if (price <= 99.90) return 10;
                                                            return 15;
                                                        };
                                                        const beePointsTotal = chosen.reduce((sum, option) => sum + beeBasePointsForTris(option.price), 0) + 3;`;
    html = html.replace(totalNeedle, totalReplacement);

    const totalDisplayNeedle = `                                                                <div className="mt-2 text-xl font-black text-amber-300">
                                                                    Totale tris: €{total.toFixed(2).replace('.', ',')}
                                                                </div>`;
    if (!html.includes(totalDisplayNeedle)) throw new Error('Visualizzazione totale Tris personalizzato non trovata');

    const totalDisplayReplacement = `${totalDisplayNeedle}
                                                                <div data-custom-tris-bee-points="true" className="mt-3 inline-flex items-center gap-2 rounded-xl border border-amber-300/50 bg-amber-100 px-4 py-2 text-amber-950 shadow-sm">
                                                                    <span aria-hidden="true" className="text-2xl">🐝</span>
                                                                    <span className="font-black">{beePointsTotal} Api</span>
                                                                    <span className="rounded-full bg-amber-600 px-2 py-1 text-xs font-black uppercase text-white">+3 Api bonus Tris inclusi</span>
                                                                </div>`;
    html = html.replace(totalDisplayNeedle, totalDisplayReplacement);

    const customProductNeedle = `                                                                            order: 8999,
                                                                            category: 'tris-alveare',
                                                                            inStock: true,
                                                                            stock: 100
                                                                        };`;
    if (!html.includes(customProductNeedle)) throw new Error('Oggetto Tris personalizzato non trovato');

    const customProductReplacement = `                                                                            order: 8999,
                                                                            category: 'tris-alveare',
                                                                            inStock: true,
                                                                            stock: 100,
                                                                            beePoints: beePointsTotal,
                                                                            beeBonus: 3
                                                                        };`;
    html = html.replace(customProductNeedle, customProductReplacement);
  }

  if (!html.includes('data-bee-points-badge="true"')) throw new Error('Badge Punti Ape non applicato');
  if (html.includes('Scegli il tuo tris personalizzato') && !html.includes('data-custom-tris-bee-points="true"')) {
    throw new Error('Punti Ape del Tris personalizzato non applicati');
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Punti Ape attivi: SOS DOL 8 + 2 bonus = 10 Api; altre fasce invariate; Tris = somma dei 3 prodotti +3 bonus.');
} catch (error) {
  console.error('[Miele Artigianale] Errore Punti Ape:', error);
  process.exitCode = 1;
}
