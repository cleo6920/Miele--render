const fs = require('fs');
const path = require('path');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const bannerText = 'Consegna prevista entro 5–6 giorni • Spedizione gratuita per ordini da €200 in su';

  // Barra superiore: sostituisce sia la frase storica sia eventuali versioni precedenti.
  html = html.replaceAll("Spedizione 0€ entro 50 km dall' Oasi del Busatello (Vr-Mn) o ≥ €120", bannerText);
  html = html.replaceAll("Spedizione 0€ entro 50 km dall' Oasi del Busatello (Vr-Mn) o >= €120", bannerText);
  html = html.replaceAll('SPEDIZIONE GRATUITA PER ORDINI SUPERIORI A €120!', bannerText);
  html = html.replaceAll('€120+', '€200+');

  // Soglia reale di spedizione gratuita nel calcolo del carrello.
  html = html.replaceAll('goodsTotal >= 120', 'goodsTotal >= 200');

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Politica spedizioni PASS: consegna 5–6 giorni, gratuita da €200.');
} catch (error) {
  console.error('[Miele Artigianale] Errore politica spedizioni:', error);
  process.exitCode = 1;
}
