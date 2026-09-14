const fs = require('fs');
const path = require('path');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  if (!html.includes('data-bee-points-card="true"')) {
    const cardImageNeedle = `                    <img\n                        src={product.image}`;
    const cardImageCount = html.split(cardImageNeedle).length - 1;
    if (cardImageCount !== 1) {
      throw new Error(`ProductCard non individuata in modo univoco: ${cardImageCount}`);
    }

    const cardBadge = `                    {(() => {
                        const baseBeePointsCard = (rawPrice) => {
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

                        const packPriceCard = Number(product.packs?.[0]?.price ?? 0);
                        let beePointsCard = baseBeePointsCard(packPriceCard);
                        let beeBonusCard = 0;

                        if (product.category === 'veleno-api') {
                            beePointsCard = product.id === 'unguento-apis' ? 10 : beePointsCard + 2;
                            beeBonusCard = 2;
                        }

                        if (product.category === 'tris-alveare') {
                            const explicitPointsCard = Number(product.beePoints);
                            if (Number.isFinite(explicitPointsCard) && explicitPointsCard > 0) {
                                beePointsCard = explicitPointsCard;
                            } else {
                                const componentPricesCard = [];
                                const priceRegexCard = /€\\s*(\\d+(?:[.,]\\d+)?)/g;
                                const descriptionCard = String(product.description || '');
                                let matchCard;
                                while ((matchCard = priceRegexCard.exec(descriptionCard)) && componentPricesCard.length < 3) {
                                    componentPricesCard.push(Number(matchCard[1].replace(',', '.')));
                                }
                                beePointsCard = componentPricesCard.length === 3
                                    ? componentPricesCard.reduce((sum, price) => sum + baseBeePointsCard(price), 0) + 3
                                    : baseBeePointsCard(packPriceCard) + 3;
                            }
                            beeBonusCard = 3;
                        }

                        if (product.category === 'veleno-api' || product.category === 'tris-alveare') return null;
                        if (!beePointsCard) return null;

                        return (
                            <div
                                data-bee-points-card="true"
                                className={'absolute z-20 inline-flex items-center gap-1.5 rounded-full border-2 border-white/80 bg-amber-400 px-2.5 py-1.5 text-stone-950 shadow-xl ' + ((!product.inStock || product.stock <= 0) ? 'right-3 top-12' : 'right-3 top-3')}
                                title={beeBonusCard ? beePointsCard + ' Punti Ape, inclusi +' + beeBonusCard + ' Api bonus' : beePointsCard + ' Punti Ape'}
                            >
                                <span aria-hidden="true" className="text-lg leading-none">🐝</span>
                                <span className="text-sm sm:text-base font-black leading-none">{beePointsCard} {beePointsCard === 1 ? 'APE' : 'API'}</span>
                                {beeBonusCard > 0 && (
                                    <span className="rounded-full bg-stone-950 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-amber-300">+{beeBonusCard} bonus</span>
                                )}
                            </div>
                        );
                    })()}
                    <img
                        src={product.image}`;

    html = html.replace(cardImageNeedle, cardBadge);

    const cardTitleNeedle = '                    <h3 className="text-2xl font-bold text-amber-700">{product.name}</h3>';
    const cardTitleCount = html.split(cardTitleNeedle).length - 1;
    if (cardTitleCount !== 1) {
      throw new Error(`Titolo ProductCard non individuato in modo univoco: ${cardTitleCount}`);
    }

    const bonusBadgesAfterImage = `                    {product.category === 'veleno-api' && (() => {
                        const baseBeePointsVenom = (rawPrice) => {
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
                        const packPriceVenom = Number(product.packs?.[0]?.price ?? 0);
                        const isSosDolVenom = product.id === 'unguento-apis';
                        const beePointsVenom = isSosDolVenom ? 10 : baseBeePointsVenom(packPriceVenom) + 2;
                        if (!beePointsVenom) return null;
                        return (
                            <div
                                data-bee-points-venom-card="true"
                                className="mb-3 inline-flex items-center gap-1.5 rounded-full border-2 border-white/80 bg-amber-400 px-3 py-2 text-stone-950 shadow-xl"
                                title={isSosDolVenom ? '8 Api + 2 bonus = 10 Api' : beePointsVenom + ' Punti Ape, inclusi +2 Api bonus'}
                            >
                                <span aria-hidden="true" className="text-lg leading-none">🐝</span>
                                <span className="text-sm sm:text-base font-black leading-none">{isSosDolVenom ? '8 API + 2 BONUS = 10 API' : (beePointsVenom + ' ' + (beePointsVenom === 1 ? 'APE' : 'API'))}</span>
                                {!isSosDolVenom && (
                                    <span className="rounded-full bg-stone-950 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-amber-300">+2 bonus</span>
                                )}
                            </div>
                        );
                    })()}
                    {product.category === 'tris-alveare' && (() => {
                        const baseBeePointsTris = (rawPrice) => {
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
                        let beePointsTris = Number(product.beePoints);
                        if (!Number.isFinite(beePointsTris) || beePointsTris <= 0) {
                            const componentPricesTris = [];
                            const priceRegexTris = /€\\s*(\\d+(?:[.,]\\d+)?)/g;
                            const descriptionTris = String(product.description || '');
                            let matchTris;
                            while ((matchTris = priceRegexTris.exec(descriptionTris)) && componentPricesTris.length < 3) {
                                componentPricesTris.push(Number(matchTris[1].replace(',', '.')));
                            }
                            const packPriceTris = Number(product.packs?.[0]?.price ?? 0);
                            beePointsTris = componentPricesTris.length === 3
                                ? componentPricesTris.reduce((sum, price) => sum + baseBeePointsTris(price), 0) + 3
                                : baseBeePointsTris(packPriceTris) + 3;
                        }
                        if (!beePointsTris) return null;
                        return (
                            <div
                                data-bee-points-tris-card="true"
                                className="mb-3 inline-flex max-w-full items-center gap-1 rounded-xl border-2 border-white/80 bg-amber-400 px-2.5 py-2 text-stone-950 shadow-lg"
                                title={(beePointsTris - 3) + ' Api + 3 bonus = ' + beePointsTris + ' Api'}
                            >
                                <span aria-hidden="true" className="text-base leading-none">🐝</span>
                                <span className="text-xs sm:text-sm font-black leading-tight">{(beePointsTris - 3) + ' API + 3 BONUS = ' + beePointsTris + ' API'}</span>
                            </div>
                        );
                    })()}
${cardTitleNeedle}`;

    html = html.replace(cardTitleNeedle, bonusBadgesAfterImage);
  }

  if (!html.includes('data-bee-points-card="true"')) {
    throw new Error('Badge Punti Ape sulle card non applicato');
  }
  if (!html.includes('data-bee-points-venom-card="true"')) {
    throw new Error('Badge Punti Ape Linea Veleno fuori dalla foto non applicato');
  }
  if (!html.includes('data-bee-points-tris-card="true"')) {
    throw new Error('Badge Punti Ape Tris fuori dalla foto non applicato');
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Badge Punti Ape: Veleno e Tris fuori dalla foto; calcoli invariati.');
} catch (error) {
  console.error('[Miele Artigianale] Errore badge Punti Ape sulle card:', error);
  process.exitCode = 1;
}
