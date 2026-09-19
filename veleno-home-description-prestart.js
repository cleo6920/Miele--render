const fs = require('fs');
const path = require('path');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const oldText = "Una selezione esclusiva dedicata al veleno d’api, con trattamenti per viso, corpo e massaggio scelti per rappresentare una delle linee più distintive della Fabbrica delle Api.";
  const newText = "Una selezione esclusiva dedicata al veleno d’api, con cosmetici per viso, corpo e massaggio scelti per rappresentare una delle linee più distintive della Fabbrica delle Api. La gamma riunisce 6 referenze: crema e siero viso, prodotti per il corpo, gommage, bagnodoccia e unguento da massaggio. In alcune formulazioni il veleno d’api è abbinato ad altri ingredienti dell’alveare, come miele, polline e cera d’api. Scopri ogni prodotto e consulta la scheda completa con caratteristiche, formato e prezzo.";

  const occurrences = html.split(oldText).length - 1;
  if (occurrences !== 1) {
    throw new Error(`Descrizione Linea Veleno attesa una volta, trovata ${occurrences}`);
  }

  html = html.replace(oldText, newText);

  if (!html.includes(newText)) {
    throw new Error('Nuova descrizione Linea Veleno non applicata');
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Presentazione Linea Veleno ampliata in modo pulito per bilanciare la card, solo su Render.');
} catch (error) {
  console.error('[Miele Artigianale] Errore descrizione presentazione Linea Veleno:', error);
  process.exitCode = 1;
}
