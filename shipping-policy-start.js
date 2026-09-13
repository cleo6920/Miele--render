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

// Nuova linea autonoma: I Tris dell’Alveare, con 30 offerte già definite.
require('./linea-tris-alveare-prestart.js');

// Ripristina la foto pulita della presentazione prodotti prima di costruire la pagina.
require('./intro-photo-rebuild.js');

// Pagina introduttiva alle linee prodotto: usa la foto del Centro e presenta
// il programma Coupon delle Api prima delle linee già esistenti.
require('./prodotti-linee-intro-prestart.js');

// Aggiunge lo slogan direttamente nel box visibile I Tris dell’Alveare,
// lasciando invariati foto, titolo, descrizione e pulsante già approvati.
require('./tris-home-slogan-prestart.js');

// Ultimo intervento: sistema SOLO la parte alta della home dopo tutte le altre patch.
// Non modifica le viste delle linee né le schede prodotto.
require('./home-layout-final.js');

// Integra SOLO nelle due schede capsule la durata indicativa per capsula e confezione da 5.
require('./capsule-duration-prestart.js');

// Rifinitura finale delle descrizioni: nessun riferimento ai fornitori e misure candela chiare.
require('./description-supplier-sanitize-prestart.js');

// Mantiene il servizio web attivo dopo i prestart.
require('./server.js');
