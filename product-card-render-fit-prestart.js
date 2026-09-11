const fs = require('fs');
const path = require('path');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const oldClass = 'className="w-48 h-48 object-cover rounded-xl mb-4 shadow-md"';
  const newClass = `className={[
                          'cosmesi-crema-mani',
                          'cosmesi-burrocacao-propoli-aloe',
                          'cosmesi-burrocacao-miele-pappa-reale',
                          'tesori-limoncello',
                          'tesori-liquore-caffe'
                        ].includes(product.id)
                          ? "w-48 h-48 object-contain rounded-xl mb-4 shadow-md bg-white p-2"
                          : "w-48 h-48 object-cover rounded-xl mb-4 shadow-md"}`;

  const occurrences = html.split(oldClass).length - 1;
  if (occurrences !== 1) {
    throw new Error(`ProductCard image class attesa una volta, trovata ${occurrences}`);
  }

  html = html.replace(oldClass, newClass);

  if (!html.includes("'cosmesi-crema-mani'") || !html.includes('object-contain rounded-xl mb-4 shadow-md bg-white p-2')) {
    throw new Error('Fix renderer ProductCard non inserito correttamente');
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] ProductCard: fit immagine per 5 referenze applicato direttamente nel renderer.');
} catch (error) {
  console.error('[Miele Artigianale] Errore fix renderer ProductCard:', error);
  process.exitCode = 1;
}
