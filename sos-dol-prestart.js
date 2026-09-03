const fs = require('fs');
const path = require('path');

// Mantiene tutta la catena stabile già approvata e applica soltanto gli aggiornamenti SOS DOL.
require('./tris-authoritative-prestart.js');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const officialSosDolImage = 'https://www.apinfiore.com/wp-content/uploads/2023/03/SOS-Doll_web-5.jpg.webp';

  // Immagine: stessa referenza ufficiale SOS DOL 15 ml per scheda prodotto e hero.
  const imageMatches = (html.match(/(?:\/)?images\/unguento-apis\.png/g) || []).length;
  if (imageMatches > 0) {
    html = html.replace(/(?:\/)?images\/unguento-apis\.png/g, officialSosDolImage);
  }

  // Nome prodotto concordato.
  html = html.replaceAll('Unguento Apis – 15 ml', 'SOS DOL – Unguento Apis – 15 ml');

  // Descrizione: aderente alla composizione/uso cosmetico Apinfiore, con enfasi su sollievo e comfort,
  // senza formulazioni mediche o farmaceutiche.
  const oldDescription = "Novità assoluta: unguento con veleno d'api, cera d'api, olio di mandorle dolci, burro di karité ed erbe lenitive. Dona sollievo alle zone doloranti come ginocchia, mani e piedi.";
  const newDescription = "Novità assoluta: unguento da massaggio con veleno d'api e cera d'api, arricchito con olio di mandorle dolci, burro di karité e oli essenziali naturali. Dona una piacevole sensazione di sollievo e comfort alle zone più affaticate, ideale per il massaggio di ginocchia, mani e piedi.";
  if (html.includes(oldDescription)) html = html.replaceAll(oldDescription, newDescription);

  // Formato tris: €99,90 rispetto a €120,00 = sconto 16,75%.
  html = html.replaceAll('3 confezioni 15 ml (sconto 11,67%)', '3 confezioni 15 ml (sconto 16,75%)');
  html = html.replaceAll('price: 106.00, originalPrice: 120.00', 'price: 99.90, originalPrice: 120.00');
  html = html.replaceAll('price:106.00,originalPrice:120.00', 'price:99.90,originalPrice:120.00');
  html = html.replaceAll('price: 106, originalPrice: 120', 'price: 99.90, originalPrice: 120');

  // Hero: accessibilità + nome completo su una sola riga.
  html = html.replaceAll('aria-label="Scopri Unguento Apis"', 'aria-label="Scopri SOS DOL – Unguento Apis – 15 ml"');
  html = html.replaceAll('aria-label="Scopri SOS DOL – Unguento Apis"', 'aria-label="Scopri SOS DOL – Unguento Apis – 15 ml"');
  html = html.replaceAll('alt="Unguento Apis"', 'alt="SOS DOL – Unguento Apis 15 ml"');
  html = html.replaceAll('>Unguento Apis</div>', '>SOS DOL – Unguento Apis – 15 ml</div>');
  html = html.replaceAll('>SOS DOL – Unguento Apis</div>', '>SOS DOL – Unguento Apis – 15 ml</div>');

  // Solo la label SOS DOL della hero: più piccola e senza ritorno a capo.
  html = html.replace(
    '<div className="mt-2 text-[13px] sm:text-sm font-extrabold leading-tight text-amber-300">SOS DOL – Unguento Apis – 15 ml</div>',
    '<div className="mt-2 text-[10px] sm:text-[11px] lg:text-[12px] font-extrabold leading-none text-amber-300 whitespace-nowrap">SOS DOL – Unguento Apis – 15 ml</div>'
  );

  // Hero SOS DOL: cornice interna più calda/premium intorno alla foto ufficiale,
  // senza modificare l'immagine della scheda prodotto.
  html = html.replace(
    `<img src="${officialSosDolImage}" alt="SOS DOL – Unguento Apis 15 ml" className="w-full h-full object-contain bg-white transition-transform duration-200 group-hover:scale-105" />`,
    `<div className="w-full h-full p-2 bg-gradient-to-br from-amber-50 via-orange-100 to-amber-200 flex items-center justify-center"><img src="${officialSosDolImage}" alt="SOS DOL – Unguento Apis 15 ml" className="w-full h-full object-contain rounded-[999px] shadow-inner transition-transform duration-200 group-hover:scale-105" /></div>`
  );

  // Controlli finali sui punti concordati.
  if (html.includes('3 confezioni 15 ml (sconto 11,67%)')) {
    throw new Error('Vecchio sconto SOS DOL ancora presente');
  }
  if (html.includes('price: 106.00, originalPrice: 120.00')) {
    throw new Error('Vecchio prezzo tris SOS DOL ancora presente');
  }
  if (html.includes('>SOS DOL – Unguento Apis</div>')) {
    throw new Error('Vecchia label hero SOS DOL ancora presente');
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] SOS DOL aggiornato: descrizione cosmetica, tris €99,90, hero una riga e sfondo caldo.');
} catch (error) {
  console.error('[Miele Artigianale] Errore aggiornamento SOS DOL:', error);
}
