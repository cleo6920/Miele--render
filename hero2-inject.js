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

  // Pagina editoriale dedicata alla Linea Alveoterapia.
  // Nessun posizionamento assoluto: la struttura usa solo grid/flex responsive per evitare sovrapposizioni.
  if (!html.includes('id="linea-alveoterapia-page"')) {
    const categoryIntroPattern = /\{selectedCategory === 'alveoterapia' && \([\s\S]*?<\/p>\s*\)\}\s*<h2 className="text-3xl font-bold text-stone-800">[\s\S]*?<\/h2>/;
    const dedicatedPage = `{selectedCategory === 'alveoterapia' ? (
                                          <section id="linea-alveoterapia-page" className="w-full overflow-hidden rounded-2xl border border-amber-400/30 bg-gradient-to-b from-stone-900 via-stone-950 to-black shadow-xl">
                                            <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-white/10">
                                              <div className="inline-flex rounded-full bg-amber-500 px-3 py-1 text-[11px] sm:text-xs font-black tracking-[0.12em] text-stone-950 uppercase">
                                                Linea Alveoterapia
                                              </div>
                                              <h2 className="mt-2 text-3xl sm:text-4xl font-black leading-tight text-white">
                                                Alveoterapia con diffusori
                                              </h2>
                                              <p className="mt-2 max-w-3xl text-sm sm:text-base leading-relaxed font-semibold text-stone-200">
                                                Un percorso dedicato che porta l'esperienza dell'alveare in un ambiente attrezzato, attraverso PropolTerapy Professional e le capsule P+B dedicate.
                                              </p>
                                            </div>

                                            <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-5 p-4 sm:p-6 items-start">
                                              <div className="overflow-hidden rounded-2xl border border-amber-300/40 bg-stone-900">
                                                <img
                                                  src="/images/hero2-marco-diffusore.jpg"
                                                  alt="Alveoterapia con diffusore nel Centro di Alveoterapia Integrata"
                                                  className="block w-full aspect-square object-cover"
                                                />
                                              </div>

                                              <div className="min-w-0 space-y-4">
                                                <div className="rounded-xl border border-emerald-500/25 bg-emerald-950/30 p-4">
                                                  <h3 className="text-lg font-black text-emerald-300">Come funziona</h3>
                                                  <p className="mt-1 text-sm sm:text-base leading-relaxed text-stone-200">
                                                    Il diffusore professionale utilizza capsule P+B dedicate con propoli italiana e Boswellia. Il sistema consente di vivere l'esperienza dell'alveare in un ambiente dedicato e confortevole.
                                                  </p>
                                                </div>

                                                <div className="rounded-xl border border-amber-400/25 bg-amber-950/20 p-4">
                                                  <h3 className="text-lg font-black text-amber-300">Complementare all'Alveoterapia naturale</h3>
                                                  <p className="mt-1 text-sm sm:text-base leading-relaxed text-stone-200">
                                                    Nell'Alveoterapia naturale l'esperienza avviene vicino agli alveari e con le api; con i diffusori può proseguire nel nostro Centro attraverso il dispositivo e le capsule dedicate.
                                                  </p>
                                                </div>

                                                <div className="rounded-xl border border-white/15 bg-white/5 p-4">
                                                  <div className="text-[11px] font-black tracking-[0.12em] text-amber-400 uppercase">Dove trovarci</div>
                                                  <div className="mt-1 text-base font-black text-white">Centro di Alveoterapia Integrata – Farmacia delle Api</div>
                                                  <div className="mt-1 text-sm font-semibold text-stone-200">Via XX Settembre 20/A – 46033 Castel d'Ario (MN)</div>
                                                </div>
                                              </div>
                                            </div>

                                            <div className="px-4 pb-5 sm:px-6 sm:pb-6">
                                              <div className="rounded-xl bg-amber-50 px-4 py-3 text-stone-900">
                                                <h3 className="text-xl font-black">Prodotti della Linea Alveoterapia</h3>
                                                <p className="mt-1 text-sm font-semibold leading-relaxed">
                                                  Qui sotto trovi il PropolTerapy Professional e le capsule P+B dedicate. Le relative schede di acquisto restano disponibili e saranno aggiornate con prezzi e contenuti definitivi.
                                                </p>
                                              </div>
                                            </div>
                                          </section>
                                        ) : (
                                          <h2 className="text-3xl font-bold text-stone-800">
                                            {({ busatello: 'Mieli del Busatello', prelibati: 'Mieli Prelibati', tesori: "I tesori dell' alveare", leccornie: 'Le leccornie', terapia: 'La terapia', cosmesi: 'La cosmesi' })[selectedCategory] || 'Selezione'}
                                          </h2>
                                        )}`;

    if (categoryIntroPattern.test(html)) {
      html = html.replace(categoryIntroPattern, dedicatedPage);
      console.log('[Miele Artigianale] Pagina dedicata Linea Alveoterapia inserita senza layout sovrapposti.');
    } else {
      console.warn('[Miele Artigianale] Blocco introduttivo categoria Alveoterapia non trovato: pagina dedicata non inserita.');
    }
  }

  fs.writeFileSync(indexPath, html, 'utf8');
} catch (error) {
  console.error('[Miele Artigianale] Errore Hero 2 Alveoterapia Integrata:', error);
}
