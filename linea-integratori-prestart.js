const fs = require('fs');
const path = require('path');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const integratorIds = ['bee-energy-bio','propol-active-bio','propoli-30-spray-integratore','propoli-30-alcolica-integratore','propoli-analcolica-integratore'];
  const products = [
    { id:'bee-energy-bio', name:'Bee Energy Bio - 12 flaconcini da 10 ml', description:'Integratore alimentare BIO con miele, pappa reale, polline, propoli, mirtillo, limone e rosmarino. Formato: 12 flaconcini da 10 ml.', image:'/images/bee-energy.png', packs:[{id:'bee1',label:'1 confezione - 12 flaconcini da 10 ml',jars:1,price:17.90}], order:1, category:'integratori', inStock:true, stock:100 },
    { id:'propol-active-bio', name:'Propol Active Bio - 30 compresse', description:'Integratore alimentare BIO a base di propoli italiana biologica al 20%. Formato: 30 compresse masticabili.', image:'/images/propol-active.png', packs:[{id:'pa1',label:'1 confezione - 30 compresse',jars:1,price:14.90}], order:2, category:'integratori', inStock:true, stock:100 },
    { id:'propoli-30-spray-integratore', name:'Propoli 30% Spray - 20 ml', description:'Estratto di propoli 30% in soluzione alcolica con pratico erogatore spray. Formato: 20 ml.', image:'/images/spray.png', packs:[{id:'ps30',label:'1 flacone spray - 20 ml',jars:1,price:7.70}], order:3, category:'integratori', inStock:true, stock:100 },
    { id:'propoli-30-alcolica-integratore', name:'Propoli 30% alcolica - 20 ml', description:'Estratto di propoli 30% in soluzione alcolica con contagocce. Formato: 20 ml.', image:'https://gcdn.picsart.com/editing-temp/321c26f4-a7f5-46b9-9be1-2280480fae28.jpeg', packs:[{id:'pal30',label:'1 flacone con contagocce - 20 ml',jars:1,price:5.90}], order:4, category:'integratori', inStock:true, stock:100 },
    { id:'propoli-analcolica-integratore', name:'Propoli analcolica - 20 ml', description:'Estratto di propoli in soluzione analcolica con contagocce. Formato: 20 ml.', image:'https://gcdn.picsart.com/editing-temp/d6ff7610-e304-4b5a-8aa9-135c41e5eeba.jpeg', packs:[{id:'pan1',label:'1 flacone con contagocce - 20 ml',jars:1,price:5.90}], order:5, category:'integratori', inStock:true, stock:100 }
  ];

  // Aggiunge i cinque prodotti della brochure al catalogo statico, senza duplicarli.
  if (!html.includes("id:'bee-energy-bio'") && !html.includes('id: "bee-energy-bio"')) {
    const marker = 'const staticInitialProducts = [';
    const pos = html.indexOf(marker);
    if (pos === -1) throw new Error('Catalogo staticInitialProducts non trovato');
    const insertAt = pos + marker.length;
    const source = '\n' + products.map(p => JSON.stringify(p, null, 2).replace(/"([^"\\n]+)":/g, '$1:')).join(',\n') + ',\n';
    html = html.slice(0, insertAt) + source + html.slice(insertAt);
  }

  // Abilita la categoria Integratori qualunque sia lo stato precedente della lista pubblica.
  html = html.replace(/const allowedCategoriesForShop = \[([^\]]*)\];/g, (full, inside) => {
    if (/['"]integratori['"]/.test(inside)) return full;
    return `const allowedCategoriesForShop = [${inside}, 'integratori'];`;
  });

  // Il filtro autoritativo della Linea Alimenti deve lasciare passare anche i 5 Integratori.
  html = html.replace(/const currentPublicCatalogIds = new Set\((\[[^;]*?\])\);/g, (full, arrayText) => {
    if (arrayText.includes('bee-energy-bio')) return full;
    const trimmed = arrayText.trim().replace(/\]$/, '');
    return `const currentPublicCatalogIds = new Set(${trimmed},${integratorIds.map(id => JSON.stringify(id)).join(',')}]);`;
  });

  // Titolo della pagina prodotti.
  const titleNeedle = "'alimenti': 'Linea Alimenti'";
  if (html.includes(titleNeedle) && !html.includes("'integratori': 'Linea Integratori'")) {
    html = html.replaceAll(titleNeedle, `${titleNeedle}, 'integratori': 'Linea Integratori'`);
  }

  // Sostituisce il vecchio box 'Linea in allestimento' con Integratori e crea sotto un nuovo placeholder.
  if (!html.includes('id="linea-integratori-home"')) {
    const placeholderPattern = /<article className="overflow-hidden rounded-xl border border-emerald-300\/25 bg-\[#121212\] shadow-lg">\s*<div className="grid h-full min-h-\[235px\][\s\S]*?<h2 className="text-xl sm:text-2xl font-black leading-tight text-stone-200">Linea in allestimento<\/h2>[\s\S]*?<\/article>/;
    if (!placeholderPattern.test(html)) throw new Error('Box Linea in allestimento non trovato');

    const integratoriHome = `<article id="linea-integratori-home" className="overflow-hidden rounded-xl border border-emerald-300/35 bg-[#121212] shadow-lg">
                            <div className="px-3 pt-2 pb-2">
                              <div className="text-[11px] font-black tracking-[0.12em] text-emerald-400 uppercase">Linea Integratori</div>
                              <h2 className="mt-0.5 text-lg sm:text-xl font-black leading-tight text-white">Energia naturale dalle api</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-[210px_minmax(0,1fr)] gap-2.5 px-3 pb-3 items-stretch">
                              <div className="overflow-hidden rounded-lg border border-amber-200/40 bg-[#f4ecdf] shadow-inner">
                                <img src="https://gcdn.picsart.com/editing-temp/e721a4c8-1129-4ae9-b0d6-9b9fac485388.jpeg" alt="Presentazione della Linea Integratori" className="block w-full h-[170px] sm:h-full min-h-[170px] object-cover object-center" />
                              </div>
                              <div className="min-w-0 flex flex-col justify-center">
                                <p className="text-sm leading-snug font-semibold text-stone-100">Integratori alimentari a base di miele, pappa reale, polline e propoli, pensati per accompagnare il benessere quotidiano e offrire una selezione naturale dal mondo delle api.</p>
                                <button type="button" onClick={() => { setSelectedProductId(null); setSelectedCategory('integratori'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="mt-3 inline-flex w-fit items-center justify-center rounded-lg bg-amber-500 hover:bg-amber-400 px-4 py-2 text-xs sm:text-sm font-black text-stone-950 shadow-sm transition-colors" aria-label="Scopri la gamma della Linea Integratori">Scopri la gamma</button>
                              </div>
                            </div>
                          </article>`;

    html = html.replace(placeholderPattern, integratoriHome);

    const sectionEnd = '</section>\n                    )}';
    const sectionId = 'id="linee-alimenti-e-prossima-home"';
    const sectionStart = html.indexOf(sectionId);
    const endPos = sectionStart === -1 ? -1 : html.indexOf(sectionEnd, sectionStart);
    if (endPos === -1) throw new Error('Fine sezione Alimenti/Integratori non trovata');
    const insertPos = endPos + sectionEnd.length;
    const nextPlaceholder = `\n\n                    {!selectedCategory && !selectedProductId && (\n                      <section id="prossima-linea-home" className="max-w-7xl mx-auto w-full px-4 mb-4" aria-label="Prossima linea in allestimento">\n                        <article className="mx-auto w-full max-w-[1080px] overflow-hidden rounded-xl border border-stone-500/35 bg-[#121212] shadow-lg">\n                          <div className="grid min-h-[190px] grid-cols-1 sm:grid-cols-[210px_minmax(0,1fr)] gap-3 p-3 items-stretch">\n                            <div className="min-h-[160px] rounded-lg border border-dashed border-stone-500/60 bg-gradient-to-br from-stone-800 via-stone-900 to-stone-950"></div>\n                            <div className="flex min-w-0 flex-col items-center justify-center sm:items-start text-center sm:text-left">\n                              <div className="text-[10px] font-black tracking-[0.12em] text-amber-500 uppercase">Nuova linea</div>\n                              <h2 className="mt-1 text-xl sm:text-2xl font-black leading-tight text-stone-200">Linea in allestimento</h2>\n                              <p className="mt-1 text-sm font-semibold text-stone-400">Stiamo preparando una nuova linea di prodotti della Fabbrica delle Api.</p>\n                            </div>\n                          </div>\n                        </article>\n                      </section>\n                    )}`;
    html = html.slice(0, insertPos) + nextPlaceholder + html.slice(insertPos);
  }

  // Verifica minima prima di salvare.
  for (const id of integratorIds) {
    if (!html.includes(id)) throw new Error(`Integratore mancante: ${id}`);
  }
  if (!html.includes("setSelectedCategory('integratori')")) throw new Error('Pulsante Linea Integratori non collegato');
  if (!html.includes('id="prossima-linea-home"')) throw new Error('Nuovo box Linea in allestimento mancante');

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Linea Integratori: 5 prodotti brochure, box home e nuovo placeholder inseriti.');
} catch (error) {
  console.error('[Miele Artigianale] Errore Linea Integratori:', error);
  process.exitCode = 1;
}
