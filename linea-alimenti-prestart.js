const fs = require('fs');
const path = require('path');

// Linea Alimenti: categoria virtuale che riunisce esclusivamente le referenze
// alimentari già presenti nello shop, senza modificare dati, prezzi o categorie originali.
try {
  const indexPath = path.join(__dirname, 'index.html');
  const imagePath = path.join(__dirname, 'images', 'linea-alimenti-home.jpg');
  let html = fs.readFileSync(indexPath, 'utf8');

  if (!fs.existsSync(imagePath)) {
    throw new Error('Immagine rappresentativa Linea Alimenti non trovata');
  }

  const rendererNeedle = "{products.filter(p => selectedCategory === 'veleno-api' ?";
  const foodPredicate = "(['busatello','prelibati','tesori','leccornie'].includes(p.category) && ['millefiori','melone','fragola','pesca','arancia','castagno','acacia','eucalipto','balsam','polline','orsetti gommosi','pappa reale'].some(token => String(p.name || '').toLowerCase().includes(token)))";

  if (html.includes(rendererNeedle) && !html.includes("selectedCategory === 'alimenti' ?")) {
    html = html.replaceAll(
      rendererNeedle,
      `{products.filter(p => selectedCategory === 'alimenti' ? ${foodPredicate} : selectedCategory === 'veleno-api' ?`
    );
  }

  const titleMapNeedle = "'veleno-api': 'Linea Benessere Veleno d’Api'";
  if (html.includes(titleMapNeedle) && !html.includes("'alimenti': 'Linea Alimenti'")) {
    html = html.replaceAll(titleMapNeedle, `${titleMapNeedle}, 'alimenti': 'Linea Alimenti'`);
  }

  if (!html.includes("selectedCategory === 'alimenti' ?")) {
    throw new Error('Renderer Linea Alimenti non agganciato');
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Linea Alimenti attiva: gamma alimentare virtuale collegata senza modificare le referenze.');
} catch (error) {
  console.error('[Miele Artigianale] Errore Linea Alimenti:', error);
  throw error;
}
