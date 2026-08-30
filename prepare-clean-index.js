const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'index.html');
const out = path.join(__dirname, 'index-clean.html');
let html = fs.readFileSync(src, 'utf8');

// Asset approvati: Acacia viene incorporata direttamente, Balsam usa il file finale.
// Nessun alias ricostruito o copiato a runtime dal server.
const cleanAcaciaBase64 = fs.readFileSync(path.join(__dirname, 'images', 'acacia-tiny-valid.b64'), 'utf8').replace(/\s+/g, '');
const cleanAcaciaImage = `data:image/jpeg;base64,${cleanAcaciaBase64}`;
const cleanBalsamImage = '/images/balsam-miel-final.jpg?v=approved-20260829';

const removeById = (tag, id) => {
  const re = new RegExp(`<${tag}\\s+id=["']${id}["'][^>]*>[\\s\\S]*?<\\/${tag}>`, 'gi');
  html = html.replace(re, '');
};

// Rimuove i blocchi legacy già verificati come instabili.
[
  'shop-product-search-restore',
  'shop-hero-center-swap',
  'shop-product-details-safe-compact',
  'shop-product-view-compact'
].forEach(id => removeById('script', id));

// La vecchia implementazione categorie non deve convivere con quella nuova.
[
  'card-force-small',
  'grid-inline-fix',
  'shop-category-grid-compact-final',
  'shop-category-layout-tuning',
  'category-wide-css',
  'category-wide-fullrow',
  'lift-mieli-transform-css',
  'titles-stroke-all',
  'category-title-colors-override'
].forEach(id => removeById('style', id));

// SOSTITUZIONE REALE DELL'HERO.
const legacyHero = /<header className="relative w-full py-8 sm:py-12 bg-gradient-to-br from-amber-200 to-amber-50 shadow-lg mb-8">[\s\S]*?<\/header>\s*<div className="max-w-7xl mx-auto w-full px-4 mb-4">\s*<GlobalProductSearch allProducts=\{products\} onProductSelect=\{handleProductSearchSelect\} \/>\s*<\/div>/;

const cleanHero = `
                    <header id="clean-shop-hero">
                        <a id="center-home-link" href="/" aria-label="Torna alla Home del Centro">← Home Centro</a>
                        <div className="clean-hero-grid">
                            <div className="clean-hero-left">
                                <h1 className="clean-hero-left-title">
                                    <svg className="clean-hero-flag" aria-label="Bandiera italiana" role="img" viewBox="0 0 30 20">
                                        <rect x="0" y="0" width="10" height="20" fill="green" />
                                        <rect x="10" y="0" width="10" height="20" fill="white" />
                                        <rect x="20" y="0" width="10" height="20" fill="red" />
                                    </svg>
                                    <span>L' Italiano Miele</span>
                                </h1>
                                <div className="clean-hero-left-subtitle">Alveoterapia integrata</div>
                                <div className="clean-hero-photo-row">
                                    <button
                                        type="button"
                                        className="clean-hero-product-link"
                                        onClick={() => handleProductSearchSelect('propolterapy-professional')}
                                        aria-label="Scopri PropolTerapy Professional"
                                    >
                                        <span className="clean-hero-photo">
                                            <img src="/images/hero-prodotti-corretta.jpg" alt="Diffusore PropolTerapy Professional" />
                                        </span>
                                        <span className="clean-hero-photo-cta">
                                            <strong>PropolTerapy Professional</strong>
                                            <small>Scopri di più</small>
                                        </span>
                                    </button>
                                    <button
                                        type="button"
                                        className="clean-hero-product-link"
                                        onClick={() => handleProductSearchSelect('unguento-apis')}
                                        aria-label="Scopri Unguento Apis"
                                    >
                                        <span className="clean-hero-photo">
                                            <img src="/images/unguento-apis.png" alt="Unguento Apis" />
                                        </span>
                                        <span className="clean-hero-photo-cta">
                                            <strong>Unguento Apis</strong>
                                            <small>Scopri di più</small>
                                        </span>
                                    </button>
                                </div>
                                {isAuthReady && (
                                    <div className="mt-3">
                                        {isAdmin ? (
                                            <button
                                                onClick={async () => {
                                                    await window.firebase.signOut(firebaseAuth);
                                                    showNotification("Disconnessione Admin effettuata.", "success");
                                                }}
                                                className="text-sm text-amber-700 hover:text-amber-900 font-semibold"
                                            >
                                                Esci (Admin)
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => setShowAdminLoginModal(true)}
                                                className="text-sm text-amber-700 hover:text-amber-900 font-semibold"
                                            >
                                                Accedi come Admin
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="clean-hero-center">
                                <div className="clean-hero-center-title">Mieli e prodotti dell'alveare</div>
                                <div className="clean-hero-hives-oval">
                                    <img src="/images/alveari-busatello.jpg" alt="Alveari dell'Oasi del Busatello" />
                                </div>
                            </div>

                            <div className="clean-hero-right">
                                <div className="clean-hero-brand">
                                    <div className="clean-hero-brand-title">La Fabbrica delle Api</div>
                                    <div className="clean-hero-brand-flag">
                                        <svg aria-label="Bandiera italiana" role="img" width="34" height="23" viewBox="0 0 30 20">
                                            <rect x="0" y="0" width="10" height="20" fill="green" />
                                            <rect x="10" y="0" width="10" height="20" fill="white" />
                                            <rect x="20" y="0" width="10" height="20" fill="red" />
                                        </svg>
                                    </div>
                                </div>
                                <div id="clean-shop-search-slot">
                                    <GlobalProductSearch allProducts={products} onProductSelect={handleProductSearchSelect} />
                                </div>
                            </div>
                        </div>
                    </header>`;

if (!legacyHero.test(html)) {
  throw new Error('[Miele Clean] Vecchio hero non trovato: sostituzione annullata per sicurezza.');
}
html = html.replace(legacyHero, cleanHero);

// SOSTITUZIONE DELLA GRIGLIA CATEGORIE NELLO STESSO COMPONENTE REACT.
const legacyCategoryStart = '<div className="wrap">\n      <div className="grid category-grid">';
if (!html.includes(legacyCategoryStart)) {
  throw new Error('[Miele Clean] Vecchia griglia categorie non trovata: sostituzione annullata per sicurezza.');
}
html = html.replace(legacyCategoryStart, '<div className="clean-category-wrap">\n      <div className="clean-category-grid">');

// Elimina davvero la seconda vecchia card mieli: la selezione mieli è ora una sola categoria.
html = html.replace(/\s*<a className="card" href="#" onClick=\{\(e\) => \{ e\.preventDefault\(\); onSelectCategory\('prelibati'\); \}\}>[\s\S]*?<\/a>/, '');

const categoryClassReplacements = [
  ["onSelectCategory('busatello')", 'clean-category-card clean-cat-honey'],
  ["onSelectCategory('tesori')", 'clean-category-card clean-cat-tesori'],
  ["onSelectCategory('leccornie')", 'clean-category-card clean-cat-leccornie'],
  ["onSelectCategory('terapia')", 'clean-category-card clean-cat-terapia'],
  ["onSelectCategory('cosmesi')", 'clean-category-card clean-cat-cosmesi'],
  ["onSelectCategory('7')", 'clean-category-card clean-cat-francesco'],
  ["onSelectCategory('alveoterapia')", 'clean-category-card clean-cat-alveoterapia']
];
for (const [handler, cls] of categoryClassReplacements) {
  const re = new RegExp(`<a className="card" href="#" onClick=\\{\\(e\\) => \\{ e\\.preventDefault\\(\\); ${handler.replace(/[()']/g, m => '\\' + m)}; \\}\\}>`);
  html = html.replace(re, `<a className="${cls}" href="#" onClick={(e) => { e.preventDefault(); ${handler}; }}>`);
}

html = html.replace(
  '<a className="card category-wide" style={{gridColumn:\'1 / -1\'}} href="#" onClick={(e) => { e.preventDefault(); onSelectCategory(\'bacheca\'); }}>',
  '<a className="clean-category-card clean-cat-bacheca" href="#" onClick={(e) => { e.preventDefault(); onSelectCategory(\'bacheca\'); }}>'
);

// Testi e immagini categorie: usa asset locali, non il vecchio hosting Vercel.
html = html.replaceAll('alt="I mieli del Busatello"', 'alt="La selezione di mieli della Fabbrica delle Api"');
html = html.replaceAll('>I mieli del Busatello</h3>', '>La selezione di mieli della Fabbrica delle Api</h3>');
html = html.replaceAll('https://miele-backend-omega.vercel.app/images/tesori.png', '/images/tesori.png');
html = html.replaceAll('https://miele-backend-omega.vercel.app/images/leccornie.png', '/images/leccornie.png');
html = html.replaceAll('https://miele-backend-omega.vercel.app/images/terapia.png', '/images/terapia.png');
html = html.replaceAll('https://miele-backend-omega.vercel.app/images/cosmesi.png', '/images/cosmesi.png');
html = html.replaceAll('src="images/francesco.png"', 'src="/images/francesco.png"');
html = html.replaceAll('src="images/alveoterapia.png"', 'src="/images/alveoterapia.png"');
html = html.replaceAll('src="images/bacheca.png"', 'src="/images/bacheca.png"');

// SOSTITUZIONE REALE DELL'ASSORTIMENTO MIELI.
// La versione pulita non usa il vecchio filtro DOM di server.js: l'elenco viene normalizzato
// prima di entrare nello stato React, quindi i mieli dismessi non fanno parte della pagina attiva.
const honeyHelper = `
            const applyCleanHoneySelection = (list) => {
                const approvedIds = ['millefiori','fragola','melone','pesca','arancia','acacia','castagno','eucamiel','balsammiel'];
                const orderById = {
                    millefiori: 1,
                    fragola: 2,
                    melone: 3,
                    pesca: 4,
                    arancia: 5,
                    acacia: 101,
                    castagno: 102,
                    eucamiel: 105,
                    balsammiel: 107
                };
                const nameById = {
                    millefiori: 'Miele del Busatello Millefiori',
                    fragola: 'Miele del Busatello alla Fragola',
                    melone: 'Miele del Busatello al Melone',
                    pesca: 'Miele del Busatello alla Pesca',
                    arancia: "Miele del Busatello all’Arancia",
                    acacia: 'Miele di Acacia',
                    castagno: 'Miele di Castagno',
                    eucamiel: 'Euca Miel',
                    balsammiel: 'Balsam Miel'
                };
                return list
                    .map(product => product.category === 'prelibati' ? { ...product, category: 'busatello' } : product)
                    .filter(product => product.category !== 'busatello' || approvedIds.includes(product.id))
                    .map(product => {
                        if (product.category !== 'busatello') return product;
                        let normalized = {
                            ...product,
                            name: nameById[product.id] || product.name,
                            order: orderById[product.id] || product.order
                        };
                        if (product.id === 'balsammiel') normalized = { ...normalized, image: ${JSON.stringify(cleanBalsamImage)} };
                        if (product.id === 'acacia') normalized = { ...normalized, image: ${JSON.stringify(cleanAcaciaImage)} };
                        return normalized;
                    });
            };
`;

if (!html.includes('// === STOCK MODE TOGGLE ===')) {
  throw new Error('[Miele Clean] Punto inserimento assortimento mieli non trovato: sostituzione annullata.');
}
html = html.replace('// === STOCK MODE TOGGLE ===', `${honeyHelper}\n            // === STOCK MODE TOGGLE ===`);
html = html.replaceAll(
  'staticInitialProducts.filter(p => allowedCategoriesForShop.includes(p.category))',
  'applyCleanHoneySelection(staticInitialProducts).filter(p => allowedCategoriesForShop.includes(p.category))'
);
html = html.replace(
  'const filtered = mergedProducts.filter(p => allowedCategoriesForShop.includes(p.category));',
  'const filtered = applyCleanHoneySelection(mergedProducts).filter(p => allowedCategoriesForShop.includes(p.category));'
);

// SOSTITUZIONE REALE DELLE PAGINE ELENCO PRODOTTI.
// Il vecchio shop-product-view-compact è stato rimosso sopra: qui la disposizione approvata
// viene scritta direttamente nel markup React della versione pulita.
const legacyBackClass = 'className="rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold px-4 py-2"';
if (!html.includes(legacyBackClass)) {
  throw new Error('[Miele Clean] Pulsante ritorno categorie non trovato: import elenco prodotti annullato per sicurezza.');
}
html = html.replace(legacyBackClass, 'className="clean-product-back rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold px-4 py-2"');

const legacyProductGrid = '<div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">';
if (!html.includes(legacyProductGrid)) {
  throw new Error('[Miele Clean] Vecchia griglia prodotti non trovata: import elenco prodotti annullato per sicurezza.');
}
html = html.replace(legacyProductGrid, '<div className="clean-product-grid">');

const legacyProductMap = `{products.filter(p => p.category === selectedCategory).sort((a,b) => a.order - b.order).map(product => (
                                                <ProductCard key={product.id} product={product} onProductClick={handleProductSelect} />
                                            ))}`;
const cleanProductMap = `{products.filter(p => p.category === selectedCategory).sort((a,b) => a.order - b.order).map((product, index) => (
                                                <React.Fragment key={product.id}>
                                                    {selectedCategory === 'busatello' && index === 5 && (
                                                        <div className="clean-selected-honey-divider">
                                                            <h2>Selezionati per voi</h2>
                                                            <p>Una selezione speciale di mieli scelti dalla Fabbrica delle Api.</p>
                                                        </div>
                                                    )}
                                                    <ProductCard product={product} onProductClick={handleProductSelect} />
                                                </React.Fragment>
                                            ))}
                                            {selectedCategory === 'busatello' && (
                                                <>
                                                    <div className="clean-pending-honey-card">
                                                        <div className="clean-pending-honey-icon">🍯</div>
                                                        <h3>Millefiori di Rucas – Alta Montagna</h3>
                                                        <p>Scheda prodotto in aggiornamento. Foto e prezzo verranno inseriti appena definitivi.</p>
                                                        <span>Prossimamente disponibile</span>
                                                    </div>
                                                    <div className="clean-pending-honey-card">
                                                        <div className="clean-pending-honey-icon">🍯</div>
                                                        <h3>Miele di Eucalipto</h3>
                                                        <p>Scheda prodotto in aggiornamento. Foto e prezzo verranno inseriti appena definitivi.</p>
                                                        <span>Prossimamente disponibile</span>
                                                    </div>
                                                    <div className="clean-pending-honey-card">
                                                        <div className="clean-pending-honey-icon">🍯</div>
                                                        <h3>Propol Miel</h3>
                                                        <p>Scheda prodotto in aggiornamento. Foto e prezzo verranno inseriti appena definitivi.</p>
                                                        <span>Prossimamente disponibile</span>
                                                    </div>
                                                </>
                                            )}`;
if (!html.includes(legacyProductMap)) {
  throw new Error('[Miele Clean] Vecchia mappa prodotti non trovata: pagina mieli non sostituita.');
}
html = html.replace(legacyProductMap, cleanProductMap);

if (!html.includes('/clean-layout.css')) {
  html = html.replace('</head>', '  <link rel="stylesheet" href="/clean-layout.css?v=1">\n</head>');
}
if (!html.includes('/clean-hero.css')) {
  html = html.replace('</head>', '  <link rel="stylesheet" href="/clean-hero.css?v=9">\n</head>');
}
if (!html.includes('/clean-categories.css')) {
  html = html.replace('</head>', '  <link rel="stylesheet" href="/clean-categories.css?v=1">\n</head>');
}
if (!html.includes('/clean-products.css')) {
  html = html.replace('</head>', '  <link rel="stylesheet" href="/clean-products.css?v=2">\n</head>');
}
if (!html.includes('/clean-layout.js')) {
  html = html.replace('</body>', '  <script src="/clean-layout.js?v=2" defer></script>\n</body>');
}

fs.writeFileSync(out, html, 'utf8');
console.log('[Miele Clean] index-clean.html preparato: hero unico, categorie definitive e assortimento mieli approvato senza vecchi filtri runtime.');