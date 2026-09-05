const fs = require('fs');
const path = require('path');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');
  const hero2Id = 'alveoterapia-integrata-hero2';

  if (!html.includes(`id="${hero2Id}"`)) {
    const mainAnchor = '<main className="max-w-7xl mx-auto px-4 pb-16 w-full flex-grow flex flex-col lg:flex-row gap-8">';
    const anchorIndex = html.indexOf(mainAnchor);
    if (anchorIndex === -1) throw new Error('Punto di inserimento Hero 2 non trovato');

    const hero2 = ['hero2-section.p01.txt', 'hero2-section.p02.txt']
      .map((part) => fs.readFileSync(path.join(__dirname, part), 'utf8'))
      .join('');

    html = html.slice(0, anchorIndex) + hero2 + html.slice(anchorIndex);
    fs.writeFileSync(indexPath, html, 'utf8');
    console.log('[Miele Artigianale] Hero 2 Alveoterapia Integrata inserita tra ricerca e categorie.');
  } else {
    console.log('[Miele Artigianale] Hero 2 già presente: nessuna duplicazione.');
  }
} catch (error) {
  console.error('[Miele Artigianale] Errore Hero 2 Alveoterapia Integrata:', error);
}
