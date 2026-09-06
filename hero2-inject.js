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

  // Linea Alveoterapia: gli altri diffusori restano nel codice come backup,
  // ma sul sito pubblico sono visibili solo Professional e le sue capsule P+B dedicate.
  const visibleAlveoterapiaIds = "['propolterapy-professional','capsule-pb']";

  const gridNeedle = "{products.filter(p => p.category === selectedCategory).sort((a,b) => a.order - b.order).map(product => (";
  const gridReplacement = `{products.filter(p => p.category === selectedCategory && (selectedCategory !== 'alveoterapia' || ${visibleAlveoterapiaIds}.includes(p.id))).sort((a,b) => a.order - b.order).map(product => (`;
  if (html.includes(gridNeedle)) {
    html = html.replaceAll(gridNeedle, gridReplacement);
    console.log('[Miele Artigianale] Catalogo Alveoterapia pubblico limitato a Professional + capsule P+B.');
  } else if (!html.includes("selectedCategory !== 'alveoterapia' || ['propolterapy-professional','capsule-pb'].includes(p.id)")) {
    console.warn('[Miele Artigianale] Renderer catalogo Alveoterapia non trovato: filtro pubblico non applicato.');
  }

  const searchNeedle = '<GlobalProductSearch allProducts={products} onProductSelect={handleProductSearchSelect} />';
  const searchReplacement = `<GlobalProductSearch allProducts={products.filter(p => p.category !== 'alveoterapia' || ${visibleAlveoterapiaIds}.includes(p.id))} onProductSelect={handleProductSearchSelect} />`;
  if (html.includes(searchNeedle)) {
    html = html.replaceAll(searchNeedle, searchReplacement);
    console.log('[Miele Artigianale] Ricerca globale: diffusori di backup esclusi dai risultati pubblici.');
  } else if (!html.includes("allProducts={products.filter(p => p.category !== 'alveoterapia' || ['propolterapy-professional','capsule-pb'].includes(p.id))}")) {
    console.warn('[Miele Artigianale] Ricerca globale non trovata: filtro Alveoterapia non applicato.');
  }

  fs.writeFileSync(indexPath, html, 'utf8');
} catch (error) {
  console.error('[Miele Artigianale] Errore Hero 2 Alveoterapia Integrata:', error);
}
