const fs = require('fs');
const path = require('path');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const replaceRequired = (search, replacement, label) => {
    if (!html.includes(search)) {
      throw new Error(`Formula bonus non trovata: ${label}`);
    }
    html = html.replace(search, replacement);
  };

  // Scheda prodotto: tutti i prodotti Veleno mostrano BASE + 2 BONUS = TOTALE.
  replaceRequired(
    "                                    bonusLabel = isSosDol ? '8 API + 2 BONUS = 10 API' : '+2 API BONUS LINEA VELENO D’API';",
    "                                    bonusLabel = (beePoints - 2) + ' API + 2 BONUS = ' + beePoints + ' API';",
    'scheda Linea Veleno'
  );

  // Scheda prodotto: tutti i Tris mostrano BASE + 3 BONUS = TOTALE.
  replaceRequired(
    "                                    bonusLabel = '+3 API BONUS TRIS';",
    "                                    bonusLabel = (beePoints - 3) + ' API + 3 BONUS = ' + beePoints + ' API';",
    'scheda Tris'
  );

  // Configuratore Tris personalizzato: stessa formula, senza far sembrare il bonus aggiuntivo al totale.
  replaceRequired(
    `                                                                    <span className="font-black">{beePointsTotal} Api</span>\n                                                                    <span className="rounded-full bg-amber-600 px-2 py-1 text-xs font-black uppercase text-white">+3 Api bonus Tris inclusi</span>`,
    `                                                                    <span className="font-black">{beePointsTotal - 3} API + 3 BONUS = {beePointsTotal} API</span>`,
    'configuratore Tris'
  );

  // Card Tris e altri eventuali prodotti con bonus gestiti dal badge generico.
  replaceRequired(
    "                                title={beeBonusCard ? beePointsCard + ' Punti Ape, inclusi +' + beeBonusCard + ' Api bonus' : beePointsCard + ' Punti Ape'}",
    "                                title={beeBonusCard ? (beePointsCard - beeBonusCard) + ' Api + ' + beeBonusCard + ' bonus = ' + beePointsCard + ' Api' : beePointsCard + ' Punti Ape'}",
    'titolo badge generico'
  );
  replaceRequired(
    `                                <span className="text-sm sm:text-base font-black leading-none">{beePointsCard} {beePointsCard === 1 ? 'APE' : 'API'}</span>\n                                {beeBonusCard > 0 && (\n                                    <span className="rounded-full bg-stone-950 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-amber-300">+{beeBonusCard} bonus</span>\n                                )}`,
    `                                <span className="text-sm sm:text-base font-black leading-none">{beeBonusCard > 0 ? ((beePointsCard - beeBonusCard) + ' API + ' + beeBonusCard + ' BONUS = ' + beePointsCard + ' API') : (beePointsCard + ' ' + (beePointsCard === 1 ? 'APE' : 'API'))}</span>`,
    'testo badge generico'
  );

  // Card Linea Veleno: 8 + 2 = 10 per SOS DOL e stessa logica per tutti gli altri prodotti della linea.
  replaceRequired(
    "                                title={isSosDolVenom ? '8 Api + 2 bonus = 10 Api' : beePointsVenom + ' Punti Ape, inclusi +2 Api bonus'}",
    "                                title={(beePointsVenom - 2) + ' Api + 2 bonus = ' + beePointsVenom + ' Api'}",
    'titolo badge Veleno'
  );
  replaceRequired(
    `                                <span className="text-sm sm:text-base font-black leading-none">{isSosDolVenom ? '8 API + 2 BONUS = 10 API' : (beePointsVenom + ' ' + (beePointsVenom === 1 ? 'APE' : 'API'))}</span>\n                                {!isSosDolVenom && (\n                                    <span className="rounded-full bg-stone-950 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-amber-300">+2 bonus</span>\n                                )}`,
    `                                <span className="text-sm sm:text-base font-black leading-none">{(beePointsVenom - 2) + ' API + 2 BONUS = ' + beePointsVenom + ' API'}</span>`,
    'testo badge Veleno'
  );

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Badge bonus uniformati: base + bonus = totale per Veleno d’Api e Tris; calcoli invariati.');
} catch (error) {
  console.error('[Miele Artigianale] Errore formula bonus Punti Ape:', error);
  process.exitCode = 1;
}
