const fs = require('fs');
const path = require('path');

// Esegue prima tutta la catena esistente, poi applica in modo autoritativo
// la politica di consegna/spedizione approvata.
require('./final-start.js');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const bannerText = 'Consegna prevista entro 5–6 giorni • Spedizione gratuita per ordini da €200 in su';

  // Testi visibili della barra spedizioni.
  html = html.replaceAll("Spedizione 0€ entro 50 km dall' Oasi del Busatello (Vr-Mn) o ≥ €120", bannerText);
  html = html.replaceAll('SPEDIZIONE GRATUITA PER ORDINI SUPERIORI A €120!', bannerText);
  html = html.replaceAll('€120+', '€200+');

  // Soglia reale di spedizione gratuita nel calcolo del carrello.
  html = html.replaceAll('goodsTotal >= 120', 'goodsTotal >= 200');

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Politica spedizioni aggiornata: consegna 5–6 giorni, gratis da €200.');
} catch (error) {
  console.error('[Miele Artigianale] Errore aggiornamento politica spedizioni:', error);
  process.exitCode = 1;
}
