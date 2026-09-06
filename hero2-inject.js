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

  // Prima composizione della nuova Linea Benessere Veleno d’Api.
  // Per ora raccoglie i prodotti al veleno già realmente presenti nel catalogo del sito.
  const visibleVelenoIds = "['unguento-apis','bagnodoccia-veleno-oro']";

  const gridNeedle = "{products.filter(p => p.category === selectedCategory).sort((a,b) => a.order - b.order).map(product => (";
  const gridReplacement = `{products.filter(p => selectedCategory === 'veleno-api' ? ${visibleVelenoIds}.includes(p.id) : (p.category === selectedCategory && (selectedCategory !== 'alveoterapia' || ${visibleAlveoterapiaIds}.includes(p.id)))).sort((a,b) => a.order - b.order).map(product => (`;
  if (html.includes(gridNeedle)) {
    html = html.replaceAll(gridNeedle, gridReplacement);
    console.log('[Miele Artigianale] Cataloghi Linea Alveoterapia e Linea Benessere Veleno d’Api instradati correttamente.');
  } else if (!html.includes("selectedCategory === 'veleno-api' ? ['unguento-apis','bagnodoccia-veleno-oro'].includes(p.id)")) {
    console.warn('[Miele Artigianale] Renderer catalogo linee non trovato: filtro pubblico non applicato.');
  }

  const searchNeedle = '<GlobalProductSearch allProducts={products} onProductSelect={handleProductSearchSelect} />';
  const searchReplacement = `<GlobalProductSearch allProducts={products.filter(p => p.category !== 'alveoterapia' || ${visibleAlveoterapiaIds}.includes(p.id))} onProductSelect={handleProductSearchSelect} />`;
  if (html.includes(searchNeedle)) {
    html = html.replaceAll(searchNeedle, searchReplacement);
    console.log('[Miele Artigianale] Ricerca globale: diffusori di backup esclusi dai risultati pubblici.');
  } else if (!html.includes("allProducts={products.filter(p => p.category !== 'alveoterapia' || ['propolterapy-professional','capsule-pb'].includes(p.id))}")) {
    console.warn('[Miele Artigianale] Ricerca globale non trovata: filtro Alveoterapia non applicato.');
  }

  // Offerta pubblica autoritativa del PropolTerapy Professional.
  // Il prezzo e le 5 capsule comprese vengono mantenuti anche se Firestore contiene ancora dati precedenti.
  const professionalDescription = "Diffusore professionale per alveoterapia con doppia funzione: PROGRAMMA AMBIENTE e PROGRAMMA MASCHERA AEROSOL. Il sistema è dotato di ionizzatore e ventola con copertura fino a 60 m². In dotazione: maschera adulti, mascherina pediatrica e tubo di raccordo. Pacchetto Alveoterapia: 5 capsule BIO P+B comprese gratuitamente. Prezzo al pubblico €180,00 IVA compresa.";
  const oldProfessionalDescription = "Diffusore professionale per alveoterapia con doppia funzione: PROGRAMMA AMBIENTE per la sanificazione degli ambienti con frazioni volatili di propoli, e PROGRAMMA MASCHERA AEROSOL per la respirazione diretta della propoli italiana di alta qualità. Il sistema è dotato di ionizzatore e ventola con copertura fino a 60 m². In dotazione: maschera adulti, mascherina pediatrica e tubo di raccordo. Confezione iniziale con 5 capsule P+B incluse (Propoli italiana 95% e Boswellia Serrata 5%, sinergia naturale che potenzia le proprietà della propoli e favorisce il benessere respiratorio).";
  const oldProfessionalPack = '{ id: "pp1", label: "Professional", jars: 1, price: 170.00 }';
  const newProfessionalPack = '{ id: "pp1", label: "Pacchetto Alveoterapia – Professional + 5 capsule BIO comprese", jars: 1, price: 180.00 }';

  if (html.includes(oldProfessionalDescription)) {
    html = html.replace(oldProfessionalDescription, professionalDescription);
  }
  if (html.includes(oldProfessionalPack)) {
    html = html.replace(oldProfessionalPack, newProfessionalPack);
  }

  const mergeNeedle = `const mergedProducts = staticInitialProducts.map(staticProduct => {
                            return firestoreProductsMap.has(staticProduct.id)
                                ? { ...staticProduct, ...firestoreProductsMap.get(staticProduct.id) }
                                : staticProduct;
                        });`;
  const mergeReplacement = `const mergedProducts = staticInitialProducts.map(staticProduct => {
                            const mergedProduct = firestoreProductsMap.has(staticProduct.id)
                                ? { ...staticProduct, ...firestoreProductsMap.get(staticProduct.id) }
                                : staticProduct;
                            return mergedProduct.id === 'propolterapy-professional'
                                ? {
                                    ...mergedProduct,
                                    description: ${JSON.stringify(professionalDescription)},
                                    packs: [{ id: 'pp1', label: 'Pacchetto Alveoterapia – Professional + 5 capsule BIO comprese', jars: 1, price: 180.00 }]
                                  }
                                : mergedProduct;
                        });`;

  if (html.includes(mergeNeedle)) {
    html = html.replace(mergeNeedle, mergeReplacement);
    console.log('[Miele Artigianale] Offerta Professional fissata a €180 IVA compresa con 5 capsule BIO incluse.');
  } else if (!html.includes("Pacchetto Alveoterapia – Professional + 5 capsule BIO comprese")) {
    console.warn('[Miele Artigianale] Merge Firestore Professional non trovato: override autoritativo non applicato.');
  }

  // Pagina dedicata, compatta e responsive della Linea Alveoterapia.
  // La stessa area gestisce anche la nuova pagina dedicata della Linea Benessere Veleno d’Api.
  if (!html.includes('id="linea-alveoterapia-page"')) {
    const categoryIntroPattern = /\{selectedCategory === 'alveoterapia' && \([\s\S]*?<\/p>\s*\)\}\s*<h2 className="text-3xl font-bold text-stone-800">[\s\S]*?<\/h2>/;
    const dedicatedPage = `{selectedCategory === 'alveoterapia' ? (
                                          <section id="linea-alveoterapia-page" className="w-full overflow-hidden rounded-xl border border-amber-400/25 bg-stone-950 shadow-lg">
                                            <div className="px-3 py-3 sm:px-4 sm:py-3 border-b border-white/10">
                                              <h2 className="text-xl sm:text-2xl font-black leading-tight text-white uppercase tracking-wide">
                                                Linea Alveoterapia
                                              </h2>
                                              <div className="mt-0.5 text-sm sm:text-base font-extrabold text-amber-400">Alveoterapia con diffusori</div>
                                              <p className="mt-1 max-w-3xl text-xs sm:text-sm leading-snug font-semibold text-stone-300">
                                                L'esperienza dell'alveare in un ambiente dedicato, con PropolTerapy Professional e capsule P+B.
                                              </p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-[170px_minmax(0,1fr)] gap-3 p-3 sm:p-4 items-start">
                                              <div className="overflow-hidden rounded-lg border border-amber-300/30 bg-stone-900">
                                                <img
                                                  src="/images/hero2-marco-diffusore.jpg"
                                                  alt="Alveoterapia con diffusore nel Centro di Alveoterapia Integrata"
                                                  className="block w-full aspect-square object-cover"
                                                />
                                              </div>

                                              <div className="min-w-0 space-y-2.5">
                                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-2.5">
                                                  <div className="rounded-lg border border-emerald-500/25 bg-emerald-950/25 p-3">
                                                    <h3 className="text-sm sm:text-base font-black text-emerald-300">Come funziona</h3>
                                                    <p className="mt-1 text-xs sm:text-sm leading-snug text-stone-200">
                                                      Il diffusore utilizza capsule P+B dedicate con propoli italiana e Boswellia per un'esperienza pratica in ambiente attrezzato.
                                                    </p>
                                                  </div>

                                                  <div className="rounded-lg border border-amber-400/25 bg-amber-950/15 p-3">
                                                    <h3 className="text-sm sm:text-base font-black text-amber-300">In continuità con la natura</h3>
                                                    <p className="mt-1 text-xs sm:text-sm leading-snug text-stone-200">
                                                      Completa l'esperienza naturale con le api, rendendola disponibile anche nel nostro Centro con diffusore e capsule dedicate.
                                                    </p>
                                                  </div>
                                                </div>

                                                <div className="rounded-lg border border-white/15 bg-white/5 p-3">
                                                  <div className="text-[10px] font-black tracking-[0.10em] text-amber-400 uppercase">Dove trovarci</div>
                                                  <div className="mt-0.5 text-xs sm:text-sm font-black text-white">Centro di Alveoterapia Integrata – Farmacia delle Api</div>
                                                  <div className="text-xs sm:text-sm font-semibold text-stone-300">Via XX Settembre 20/A – 46033 Castel d'Ario (MN)</div>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                  <button
                                                    type="button"
                                                    onClick={() => { setSelectedProductId('propolterapy-professional'); setTimeout(() => document.getElementById('product-detail-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60); }}
                                                    className="inline-flex min-h-[42px] items-center justify-center rounded-lg bg-amber-500 hover:bg-amber-400 px-3 py-2 text-sm font-black text-stone-950 transition-colors"
                                                  >
                                                    Scopri PropolTherapy Professional
                                                  </button>
                                                  <button
                                                    type="button"
                                                    onClick={() => { setSelectedProductId('capsule-pb'); setTimeout(() => document.getElementById('product-detail-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60); }}
                                                    className="inline-flex min-h-[42px] items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-2 text-sm font-black text-white transition-colors"
                                                  >
                                                    Scopri come ottenere le Capsule P+B
                                                  </button>
                                                </div>
                                              </div>
                                            </div>
                                          </section>
                                        ) : selectedCategory === 'veleno-api' ? (
                                          <section id="linea-benessere-veleno-api-page" className="w-full overflow-hidden rounded-xl border border-amber-400/30 bg-stone-950 shadow-lg">
                                            <div className="grid grid-cols-1 md:grid-cols-[190px_minmax(0,1fr)] items-stretch">
                                              <div className="overflow-hidden bg-black">
                                                <img
                                                  src="/images/linea-benessere-veleno-api.jpg"
                                                  alt="Linea Benessere Veleno d'Api"
                                                  className="block w-full aspect-square md:h-full md:aspect-auto object-cover"
                                                />
                                              </div>
                                              <div className="p-3 sm:p-4 flex flex-col justify-center">
                                                <div className="inline-flex w-fit rounded-full bg-amber-500 px-3 py-1 text-[10px] sm:text-xs font-black tracking-[0.12em] text-stone-950 uppercase">Esclusiva</div>
                                                <h2 className="mt-2 text-xl sm:text-2xl font-black leading-tight text-white uppercase tracking-wide">Linea Benessere Veleno d’Api</h2>
                                                <p className="mt-1.5 max-w-3xl text-xs sm:text-sm leading-snug font-semibold text-stone-300">
                                                  Una linea distintiva dedicata al veleno d’api. Qui trovi i prodotti della linea già presenti nel catalogo, con accesso diretto alle rispettive schede prodotto.
                                                </p>
                                              </div>
                                            </div>
                                          </section>
                                        ) : (
                                          <h2 className="text-3xl font-bold text-stone-800">
                                            {({ busatello: 'Mieli del Busatello', prelibati: 'Mieli Prelibati', tesori: "I tesori dell' alveare", leccornie: 'Le leccornie', terapia: 'La terapia', cosmesi: 'La cosmesi', 'veleno-api': 'Linea Benessere Veleno d’Api' })[selectedCategory] || 'Selezione'}
                                          </h2>
                                        )}`;

    if (categoryIntroPattern.test(html)) {
      html = html.replace(categoryIntroPattern, dedicatedPage);
      console.log('[Miele Artigianale] Pagine dedicate Linea Alveoterapia e Linea Benessere Veleno d’Api inserite.');
    } else {
      console.warn('[Miele Artigianale] Blocco introduttivo categorie dedicate non trovato.');
    }
  }

  fs.writeFileSync(indexPath, html, 'utf8');
} catch (error) {
  console.error('[Miele Artigianale] Errore Hero 2 Alveoterapia Integrata:', error);
}
