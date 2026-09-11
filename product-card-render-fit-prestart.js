const fs = require('fs');
const path = require('path');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  // 1) Card prodotto: alcune foto verticali devono essere contenute e non ritagliate.
  const oldCardClass = 'className="w-48 h-48 object-cover rounded-xl mb-4 shadow-md"';
  const newCardClass = `className={[
                          'cosmesi-crema-mani',
                          'cosmesi-burrocacao-propoli-aloe',
                          'cosmesi-burrocacao-miele-pappa-reale',
                          'tesori-limoncello',
                          'tesori-liquore-caffe'
                        ].includes(product.id)
                          ? "w-48 h-48 object-contain rounded-xl mb-4 shadow-md bg-white p-2"
                          : "w-48 h-48 object-cover rounded-xl mb-4 shadow-md"}`;

  const cardOccurrences = html.split(oldCardClass).length - 1;
  if (cardOccurrences !== 1) {
    throw new Error(`ProductCard image class attesa una volta, trovata ${cardOccurrences}`);
  }
  html = html.replace(oldCardClass, newCardClass);

  // 2) Scheda acquisto: tutte le foto devono restare proporzionate e non diventare enormi.
  const oldDetailClass = 'className="w-full h-auto max-w-lg object-cover rounded-xl shadow-lg"';
  const newDetailClass = 'className="w-full max-w-xs h-auto max-h-[380px] object-contain rounded-xl shadow-lg bg-white p-2"';

  const detailOccurrences = html.split(oldDetailClass).length - 1;
  if (detailOccurrences !== 1) {
    throw new Error(`ProductDetail image class attesa una volta, trovata ${detailOccurrences}`);
  }
  html = html.replace(oldDetailClass, newDetailClass);

  if (!html.includes("'cosmesi-crema-mani'") || !html.includes('object-contain rounded-xl mb-4 shadow-md bg-white p-2')) {
    throw new Error('Fix renderer ProductCard non inserito correttamente');
  }
  if (!html.includes('max-w-xs h-auto max-h-[380px] object-contain rounded-xl shadow-lg bg-white p-2')) {
    throw new Error('Fix dimensione ProductDetail non inserito correttamente');
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Renderer immagini: card corrette e scheda prodotto limitata a max 320x380 px.');
} catch (error) {
  console.error('[Miele Artigianale] Errore fix renderer immagini:', error);
  process.exitCode = 1;
}
