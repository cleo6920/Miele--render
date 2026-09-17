const fs = require('fs');
const path = require('path');

// Esegue prima tutta la catena esistente, poi applica in modo autoritativo
// la politica di consegna/spedizione approvata.
require('./final-start.js');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const bannerText = 'Consegna prevista entro 5–6 giorni • Spedizione gratuita per ordini da €200 in su';

  // Testi visibili della barra spedizioni: elimina anche il vecchio blocco storico.
  html = html.replaceAll("Spedizione 0€ entro 50 km dall' Oasi del Busatello (Vr-Mn) o ≥ €120", bannerText);
  html = html.replaceAll("Spedizione 0€ entro 50 km dall' Oasi del Busatello (Vr-Mn) o >= €120", bannerText);
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

require('./linea-tris-alveare-prestart.js');
require('./intro-photo-rebuild.js');
require('./prodotti-linee-intro-prestart.js');
require('./tris-home-slogan-prestart.js');
require('./home-layout-final.js');
require('./capsule-duration-prestart.js');
require('./description-supplier-sanitize-prestart.js');
require('./bee-points-prestart.js');
require('./bee-points-card-prestart.js');
require('./bonus-formula-prestart.js');
require('./alimenti-render-final-prestart.js');
require('./tris-linea-image-prestart.js');

// Modalità temporanea per collaudare gli acquisti senza chiamare Stripe.
require('./test-purchase-prestart.js');

// Saldo Api permanente: accesso nel negozio, stampa Coupon, pagina Saldo e API persistente.
require('./bee-wallet-ui-prestart.js');
require('./bee-wallet-success-prestart.js');
require('./bee-wallet-server-prestart.js');

// Mantiene visibili nel sito e nello shop Privacy, Condizioni di vendita, Resi/Recesso e Contatti.
require('./legal-pages-prestart.js');

// Predispone Nexi XPay senza abilitarlo finché XPAY_LIVE_ENABLED non viene attivato.
require('./xpay-server-prestart.js');

// Mantiene il servizio web attivo dopo i prestart.
require('./server.js');
