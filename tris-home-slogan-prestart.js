const fs = require('fs');
const path = require('path');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const oldBlock = '<p className="text-sm leading-snug font-semibold text-stone-100">Una selezione di 30 tris composti da tre prodotti della Fabbrica delle Api, già abbinati e pronti da acquistare.</p>';
  const newBlock = `${oldBlock}\n                                <p data-tris-home-slogan="true" className="mt-2 text-sm sm:text-base leading-snug font-extrabold text-amber-300">Vivi un’esperienza a 360° e ottimizza la spedizione con i nostri tris.</p>`;

  const before = html;
  html = html.replace(oldBlock, newBlock);

  if (html === before) throw new Error('Descrizione del box I Tris dell’Alveare non trovata');
  if (!html.includes('data-tris-home-slogan="true"')) throw new Error('Slogan del box tris non inserito');

  const trisImages = {
    'tris-alveare-melone': '/images/tris-alveare-melone.webp',
    'tris-alveare-fragola': '/images/tris-alveare-fragola.webp',
    'tris-alveare-pesca': '/images/tris-alveare-pesca.webp',
    'tris-alveare-arancia': '/images/tris-alveare-arancia.webp',
    'tris-alveare-castagno': '/images/tris-alveare-castagno.webp',
    'tris-alveare-acacia-zenzero': '/images/tris-alveare-acacia-zenzero.webp',
    'tris-alveare-eucalipto': '/images/tris-alveare-eucalipto.webp',
    'tris-alveare-balsammiel': '/images/tris-alveare-balsamico-italiano.webp',
    'tris-alveare-acacia-40g': '/images/tris-alveare-acacia-40g.webp'
  };

  for (const [productId, imagePath] of Object.entries(trisImages)) {
    const idMarker = `id: "${productId}"`;
    const idPos = html.indexOf(idMarker);
    if (idPos === -1) throw new Error(`Tris non trovato per immagine dedicata: ${productId}`);

    const imageKeyPos = html.indexOf('image:', idPos);
    const packsPos = html.indexOf('packs:', idPos);
    if (imageKeyPos === -1 || packsPos === -1 || imageKeyPos > packsPos) {
      throw new Error(`Campo immagine non trovato nel tris: ${productId}`);
    }

    const quoteStart = html.indexOf('"', imageKeyPos);
    const quoteEnd = quoteStart === -1 ? -1 : html.indexOf('"', quoteStart + 1);
    if (quoteStart === -1 || quoteEnd === -1 || quoteEnd > packsPos) {
      throw new Error(`Valore immagine non valido nel tris: ${productId}`);
    }

    const currentImage = html.slice(quoteStart + 1, quoteEnd);
    if (currentImage !== '/images/hero-prodotti-corretta.jpg') {
      throw new Error(`Immagine inattesa nel tris ${productId}: ${currentImage}`);
    }

    html = html.slice(0, quoteStart + 1) + imagePath + html.slice(quoteEnd);
  }

  for (const imagePath of Object.values(trisImages)) {
    if (!html.includes(`image: "${imagePath}"`)) throw new Error(`Mapping immagine non applicato: ${imagePath}`);
  }

  const selectedCategoryState = '            const [selectedCategory, setSelectedCategory] = useState(null);';
  const customTrisState = `${selectedCategoryState}
            const [customTrisSelection, setCustomTrisSelection] = useState([]);
            const customTrisOptions = [
              { id: 'favo-integrale', name: 'Acacia in Favo', price: 11.90 },
              { id: 'polline', name: 'Polline', price: 10.90 },
              { id: 'orsetti', name: 'Orsetti', price: 3.90 },
              { id: 'pappa-reale', name: 'Pappa Reale', price: 6.90 },
              { id: 'bee-energy', name: 'Bee Energy', price: 14.90 },
              { id: 'propol-active', name: 'Propol Active', price: 10.90 },
              { id: 'propoli-spray', name: 'Propoli spray', price: 7.90 },
              { id: 'propoli-alcolica', name: 'Propoli alcolica contagocce', price: 5.90 },
              { id: 'propoli-analcolica', name: 'Propoli analcolica', price: 5.90 },
              { id: 'crema-mani', name: 'Crema Mani', price: 9.90 },
              { id: 'burrocacao-propoli-aloe', name: 'Burrocacao Propoli + Aloe', price: 4.90 },
              { id: 'burrocacao-miele-pappa', name: 'Burrocacao Miele + Pappa Reale', price: 4.90 },
              { id: 'shampoo', name: 'Shampoo', price: 9.90 },
              { id: 'saponetta-frutti-bosco', name: 'Saponetta Frutti di Bosco', price: 3.90 },
              { id: 'saponetta-lavanda', name: 'Saponetta Lavanda', price: 3.90 },
              { id: 'saponetta-aloe', name: 'Saponetta Aloe', price: 3.90 },
              { id: 'candela-alveare', name: 'Candela Alveare', price: 5.90 },
              { id: 'limoncello', name: 'Limoncello', price: 5.90 },
              { id: 'liquore-caffe', name: 'Liquore al Caffè', price: 5.90 },
              { id: 'castagne-rum', name: 'Castagne al Rum', price: 5.90 }
            ];`;

  if (!html.includes('const [customTrisSelection, setCustomTrisSelection]')) {
    if (!html.includes(selectedCategoryState)) throw new Error('Stato selectedCategory non trovato');
    html = html.replace(selectedCategoryState, customTrisState);
  }

  const productListMarker = 'products.filter(p => p.category === selectedCategory)';
  const productListCount = html.split(productListMarker).length - 1;
  if (productListCount !== 1) {
    throw new Error(`Lista prodotti standard non univoca: ${productListCount}`);
  }

  const productListPos = html.indexOf(productListMarker);
  const expressionStart = html.lastIndexOf('{', productListPos);
  const expressionEndMarker = '))}';
  const expressionEndStart = html.indexOf(expressionEndMarker, productListPos);
  if (expressionStart === -1 || expressionEndStart === -1) {
    throw new Error('Espressione lista prodotti standard non delimitata');
  }
  const expressionEnd = expressionEndStart + expressionEndMarker.length;

  const customTrisGrid = `{selectedCategory === 'tris-alveare' ? (
                                            <>
                                                {products
                                                    .filter(p => p.category === 'tris-alveare' && p.order >= 8001 && p.order <= 8010)
                                                    .sort((a,b) => a.order - b.order)
                                                    .map(product => (
                                                        <ProductCard key={product.id} product={product} onProductClick={handleProductSelect} />
                                                    ))}

                                                <section className="sm:col-span-2 xl:col-span-3 mt-4 rounded-2xl border border-amber-400/40 bg-stone-900 p-4 sm:p-6 shadow-xl">
                                                    <div className="text-center">
                                                        <h3 className="text-2xl sm:text-3xl font-black text-amber-400">Scegli il tuo tris personalizzato</h3>
                                                        <p className="mt-2 text-stone-200 font-semibold">Seleziona 3 prodotti tra quelli disponibili qui sotto.</p>
                                                        <p className="mt-1 text-sm font-bold text-amber-200">Selezionati: {customTrisSelection.length}/3</p>
                                                    </div>

                                                    <div className="mt-5 flex flex-wrap justify-center gap-2">
                                                        {customTrisOptions.map(option => {
                                                            const selected = customTrisSelection.includes(option.id);
                                                            const locked = customTrisSelection.length >= 3 && !selected;
                                                            return (
                                                                <button
                                                                    key={option.id}
                                                                    type="button"
                                                                    disabled={locked}
                                                                    onClick={() => {
                                                                        setCustomTrisSelection(current =>
                                                                            current.includes(option.id)
                                                                                ? current.filter(id => id !== option.id)
                                                                                : current.length < 3
                                                                                    ? [...current, option.id]
                                                                                    : current
                                                                        );
                                                                    }}
                                                                    className={\`rounded-xl border px-3 py-2 text-sm font-extrabold transition-all \${selected
                                                                        ? 'border-amber-300 bg-amber-400 text-stone-950 shadow-md'
                                                                        : locked
                                                                            ? 'border-stone-700 bg-stone-800 text-stone-500 opacity-60'
                                                                            : 'border-amber-300/40 bg-stone-800 text-stone-100 hover:bg-stone-700'}\`}
                                                                >
                                                                    {selected ? '✓ ' : ''}{option.name} · €{option.price.toFixed(2).replace('.', ',')}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>

                                                    {customTrisSelection.length === 3 && (() => {
                                                        const chosen = customTrisOptions.filter(option => customTrisSelection.includes(option.id));
                                                        const total = chosen.reduce((sum, option) => sum + option.price, 0);
                                                        return (
                                                            <div className="mt-6 rounded-xl border border-amber-300/30 bg-black/25 p-4 text-center">
                                                                <div className="text-stone-100 font-bold">
                                                                    {chosen.map(option => option.name).join(' + ')}
                                                                </div>
                                                                <div className="mt-2 text-xl font-black text-amber-300">
                                                                    Totale tris: €{total.toFixed(2).replace('.', ',')}
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const customId = \`tris-alveare-personalizzato-\${chosen.map(option => option.id).join('-')}\`;
                                                                        const customProduct = {
                                                                            id: customId,
                                                                            name: 'Il tuo Tris personalizzato',
                                                                            description: \`Hai scelto: \${chosen.map(option => option.name).join(' + ')}. Tris composto da 3 prodotti selezionati da te.\`,
                                                                            image: '/images/hero-prodotti-corretta.jpg',
                                                                            packs: [{
                                                                                id: \`\${customId}-pack\`,
                                                                                label: '1 Tris personalizzato - 3 prodotti',
                                                                                jars: 3,
                                                                                price: Number(total.toFixed(2))
                                                                            }],
                                                                            order: 8999,
                                                                            category: 'tris-alveare',
                                                                            inStock: true,
                                                                            stock: 100
                                                                        };
                                                                        setProducts(current => [
                                                                            ...current.filter(product => product.id !== customId),
                                                                            customProduct
                                                                        ]);
                                                                        handleProductSelect(customId);
                                                                    }}
                                                                    className="mt-4 inline-flex items-center justify-center rounded-xl bg-amber-500 hover:bg-amber-400 px-6 py-3 text-base font-black text-stone-950 shadow-lg"
                                                                >
                                                                    Prosegui
                                                                </button>
                                                            </div>
                                                        );
                                                    })()}
                                                </section>
                                            </>
                                        ) : (
                                            products.filter(p => p.category === selectedCategory).sort((a,b) => a.order - b.order).map(product => (
                                                <ProductCard key={product.id} product={product} onProductClick={handleProductSelect} />
                                            ))
                                        )}`;

  html = html.slice(0, expressionStart) + customTrisGrid + html.slice(expressionEnd);

  if (!html.includes('Scegli il tuo tris personalizzato')) throw new Error('Selettore tris personalizzato non inserito');
  if (!html.includes('customTrisSelection.length === 3')) throw new Error('Regola di selezione 3 prodotti mancante');

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Tris: 10 card approvate + selettore personalizzato sui 20 prodotti rimanenti.');
} catch (error) {
  console.error('[Miele Artigianale] Errore aggiornamento Tris dell’Alveare:', error);
  process.exitCode = 1;
}
