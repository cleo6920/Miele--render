const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'index.html');
const out = path.join(__dirname, 'index-clean.html');
let html = fs.readFileSync(src, 'utf8');

const removeById = (tag, id) => {
  const re = new RegExp(`<${tag}\\s+id=["']${id}["'][^>]*>[\\s\\S]*?<\\/${tag}>`, 'gi');
  html = html.replace(re, '');
};

// Rimuove i blocchi legacy già verificati come instabili.
[
  'shop-product-search-restore',
  'shop-hero-center-swap',
  'shop-product-details-safe-compact'
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
                                    <div className="clean-hero-photo">
                                        <img src="/images/alveoterapia-casetta-hero.jpg" alt="Alveoterapia integrata con diffusore" />
                                    </div>
                                    <div className="clean-hero-photo">
                                        <img src="/images/hero-prodotti-corretta.jpg" alt="Diffusore, capsule e Unguento Apis" />
                                    </div>
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

if (!html.includes('/clean-layout.css')) {
  html = html.replace('</head>', '  <link rel="stylesheet" href="/clean-layout.css?v=1">\n</head>');
}
if (!html.includes('/clean-hero.css')) {
  html = html.replace('</head>', '  <link rel="stylesheet" href="/clean-hero.css?v=6">\n</head>');
}
if (!html.includes('/clean-categories.css')) {
  html = html.replace('</head>', '  <link rel="stylesheet" href="/clean-categories.css?v=1">\n</head>');
}
if (!html.includes('/clean-layout.js')) {
  html = html.replace('</body>', '  <script src="/clean-layout.js?v=2" defer></script>\n</body>');
}

fs.writeFileSync(out, html, 'utf8');
console.log('[Miele Clean] index-clean.html preparato: hero unico e vecchia griglia categorie sostituita dalla griglia definitiva.');
