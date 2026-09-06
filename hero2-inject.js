const fs = require('fs');
const path = require('path');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');
  const hero2Id = 'alveoterapia-integrata-hero2';
  const mainAnchor = '<main className="max-w-7xl mx-auto px-4 pb-16 w-full flex-grow flex flex-col lg:flex-row gap-8">';
  const hero2 = ['hero2-section.p01.txt', 'hero2-section.p02.txt']
    .map((part) => fs.readFileSync(path.join(__dirname, part), 'utf8'))
    .join('');

  if (!html.includes(`id="${hero2Id}"`)) {
    const anchorIndex = html.indexOf(mainAnchor);
    if (anchorIndex === -1) throw new Error('Punto di inserimento Hero 2 non trovato');

    html = html.slice(0, anchorIndex) + hero2 + html.slice(anchorIndex);
    console.log('[Miele Artigianale] Hero 2 Alveoterapia Integrata inserita tra ricerca e categorie.');
  } else {
    // Sostituisce sempre la versione già presente con quella corrente dei file Hero 2.
    // Evita che vecchi testi/layout restino nel sito dopo i deploy successivi.
    const sectionStart = html.indexOf(`<section id="${hero2Id}"`);
    const conditionalStart = html.lastIndexOf('{!selectedCategory && !selectedProductId && (', sectionStart);
    const sectionEnd = html.indexOf('</section>', sectionStart);
    const conditionalEnd = sectionEnd === -1 ? -1 : html.indexOf(')}', sectionEnd);

    if (sectionStart === -1 || conditionalStart === -1 || sectionEnd === -1 || conditionalEnd === -1) {
      throw new Error('Hero 2 presente ma blocco esistente non sostituibile in sicurezza');
    }

    const endExclusive = conditionalEnd + 2;
    html = html.slice(0, conditionalStart) + hero2.trimStart() + html.slice(endExclusive);
    console.log('[Miele Artigianale] Hero 2 aggiornata in modo autoritativo alla versione corrente.');
  }

  fs.writeFileSync(indexPath, html, 'utf8');
} catch (error) {
  console.error('[Miele Artigianale] Errore Hero 2 Alveoterapia Integrata:', error);
}
