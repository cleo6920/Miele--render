const fs = require('fs');
const path = require('path');

// Mantiene tutta la catena stabile già approvata e applica soltanto la sostituzione SOS DOL.
require('./tris-authoritative-prestart.js');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const officialSosDolImage = 'https://www.apinfiore.com/wp-content/uploads/2023/03/SOS-Doll_web-5.jpg.webp';

  // Immagine: stessa referenza per scheda prodotto e hero, senza duplicare blocchi.
  const imageMatches = (html.match(/(?:\/)?images\/unguento-apis\.png/g) || []).length;
  if (imageMatches < 1) throw new Error('Immagine legacy Unguento Apis non trovata');
  html = html.replace(/(?:\/)?images\/unguento-apis\.png/g, officialSosDolImage);

  // Nome scheda prodotto: usa il nome concordato, mantenendo id, prezzi e logica esistenti.
  html = html.replaceAll('Unguento Apis – 15 ml', 'SOS DOL – Unguento Apis – 15 ml');

  // Hero: aggiorna etichetta e accessibilità senza cambiare il collegamento alla scheda esistente.
  html = html.replaceAll('aria-label="Scopri Unguento Apis"', 'aria-label="Scopri SOS DOL – Unguento Apis"');
  html = html.replaceAll('alt="Unguento Apis"', 'alt="SOS DOL – Unguento Apis 15 ml"');
  html = html.replaceAll('>Unguento Apis</div>', '>SOS DOL – Unguento Apis</div>');

  if (html.includes('images/unguento-apis.png') || html.includes('/images/unguento-apis.png')) {
    throw new Error('È rimasto un riferimento alla vecchia foto Unguento Apis');
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log(`[Miele Artigianale] SOS DOL 15 ml applicato: ${imageMatches} riferimento/i immagine sostituito/i, nessun vecchio file immagine residuo.`);
} catch (error) {
  console.error('[Miele Artigianale] Errore sostituzione SOS DOL 15 ml:', error);
}
