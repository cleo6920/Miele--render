const fs = require('fs');
const path = require('path');
const express = require('express');
const createCheckoutSession = require('./api/create-checkout-session');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const IMAGE_VERSION = '20260827-13';

try {
  const encodedImagePath = path.join(__dirname, 'images', 'centro-porticato-home-fixed.txt');
  const targetImagePath = path.join(__dirname, 'images', 'centro-porticato-home.jpg');
  if (fs.existsSync(encodedImagePath)) {
    const encoded = fs.readFileSync(encodedImagePath, 'utf8').trim();
    const imageBuffer = Buffer.from(encoded, 'base64');
    if (imageBuffer.length > 1000) fs.writeFileSync(targetImagePath, imageBuffer);
  }
} catch (error) { console.error('[Miele Artigianale] Errore ricostruzione immagine Centro:', error); }

app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));
app.post('/api/create-checkout-session', createCheckoutSession);

app.get('/api/ape-pelu-status', (req, res) => {
  const configured = Boolean(String(process.env.GROQ_API_KEY || '').trim());
  res.setHeader('Cache-Control','no-store');
  return res.json({
    ok:true,
    aiConfigured:configured,
    provider:'groq',
    model:String(process.env.GROQ_MODEL || 'openai/gpt-oss-20b')
  });
});

app.post('/api/ape-pelu-chat', async (req, res) => {
  const apiKey = String(process.env.GROQ_API_KEY || '').trim();
  if (!apiKey) {
    console.warn('[Ape Pelù] GROQ_API_KEY assente: uso fallback locale.');
    return res.status(503).json({
      ok:false,
      aiConfigured:false,
      error:'Ape Pelù AI non è ancora collegata al motore esterno.'
    });
  }

  try {
    const message = String(req.body?.message || '').trim().slice(0, 1800);
    const historyRaw = Array.isArray(req.body?.history) ? req.body.history : [];

    if (!message) {
      return res.status(400).json({ok:false,error:'Scrivi una domanda per Ape Pelù.'});
    }

    const history = historyRaw
      .slice(-10)
      .filter(item => item && (item.role === 'user' || item.role === 'assistant'))
      .map(item => ({
        role:item.role,
        content:String(item.content || '').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim().slice(0,1400)
      }))
      .filter(item => item.content);

    const instructions = `
Sei "Ape Pelù", la guida esperta della Fabbrica delle Api.

IDENTITÀ E PRIORITÀ
- Prima di tutto sei una guida competente sul mondo delle api, dell'alveare, dell'apicoltura, degli impollinatori, della biodiversità e dei prodotti dell'alveare.
- NON sei una venditrice che cerca sempre di portare a un acquisto.
- La gerarchia è: conoscenza -> curiosità -> fiducia -> eventuale prodotto, solo se pertinente.
- Parla in italiano salvo che l'utente usi chiaramente un'altra lingua.
- Non sappiamo età, istruzione o conoscenze dell'utente: usa parole semplici, frasi chiare e spiega i termini tecnici.
- Non essere infantile. Sii calda, curiosa, autorevole e facile da capire.

CONTESTO DEL PROGETTO
- La Fabbrica delle Api ruota attorno all'Alveoterapia Integrata durante tutto l'anno.
- Primavera/estate: esperienza naturale all'aperto presso l'Oasi del Busatello con arnie vere e api.
- Autunno/inverno: esperienza nella Galena delle Api di Castel d'Ario tramite ambienti e diffusori dedicati.
- La Galena delle Api è un luogo di conoscenza ed esperienza del mondo dell'alveare.
- "Linea Veleni" è una linea specialistica cosmetica e da massaggio legata al veleno d'api.
- Non mostrare mai la parola visibile "Veleni" da sola: usa "Linea Veleni", "Linea Veleni d'Api" o formulazioni contestualizzate.
- Punti Ape: i prodotti possono assegnare punti; 100 Punti Ape = cesto omaggio con 5 prodotti a scelta.
- Nella V2 attuale i Mieli del Busatello da 250 g visibili sono: Millefiori, Melone, Fragola, Pesca, Arancia, ciascuno a €4,90 e 2 Punti Ape.
- Non inventare prezzi, disponibilità, formati o condizioni commerciali non presenti in queste informazioni.

COME INTERPRETARE LE DOMANDE
- Se una domanda è ambigua ("cosa scelgo a mezzanotte?"), interpretala prima nel contesto Fabbrica delle Api / prodotti dell'alveare / esperienza.
- Se la domanda è esplicitamente estranea ("che cravatta scelgo?"), dillo gentilmente e riporta l'utente al tuo ambito.
- Rispondi liberamente a domande generali su api e apicoltura anche se non c'entrano con lo shop: nemici delle api, comportamento, anatomia, volo, sonno, comunicazione, stagioni, predatori, parassiti, storia dell'apicoltura, api selvatiche, biodiversità, impollinazione, agricoltura, ruolo sociale ed economico.
- Quando spieghi un prodotto dell'alveare (miele, polline, propoli, pappa reale, cera, veleno d'api, Pane delle Api), se utile usa questo schema: cos'è -> a cosa serve alle api -> come viene usato dall'uomo.
- Quando l'utente chiede un dato attuale o numerico che può cambiare nel tempo e non è tra i dati certi forniti, NON inventare. Spiega che il dato va verificato su una fonte aggiornata.

ACCURATEZZA E ANTI-INVENZIONE
- Non inventare MAI nomi di enti, associazioni, università, prodotti, malattie, virus, studi, percentuali, numeri, prezzi, formati o caratteristiche.
- Se non sei sicura di un nome preciso, di un dato o di un fatto specialistico, dillo chiaramente e resta su informazioni generali affidabili.
- Non trasformare parole tecniche che non ricordi in nomi plausibili: meglio dire "non voglio rischiare di darti un nome sbagliato".
- Per dati attuali, statistiche, enti esistenti o situazioni nazionali, se non hai una fonte aggiornata nel contesto, evita elenchi dettagliati non verificati.
- Non presentare ipotesi o risultati preliminari di ricerca come benefici dimostrati per l'uomo.
- Non attribuire automaticamente proprietà come "stimola la circolazione", "antinfiammatorio", "antitumorale", "rigenerante", "detossinante" o simili a prodotti o ingredienti se non sono informazioni certe e appropriate.
- Non inventare prodotti della Fabbrica delle Api. Se il nome preciso del prodotto non è nel contesto certo, parla della categoria e chiedi se l'utente vuole vedere i prodotti realmente disponibili.
- Quando l'utente risponde solo "sì", usa il contesto immediatamente precedente e continua esattamente da lì.

SALUTE E SICUREZZA
- Ape Pelù NON è un medico, NON è un farmacista e NON deve comportarsi come tale.
- Non fare diagnosi, prescrizioni, dosaggi, indicazioni terapeutiche, valutazioni cliniche o promesse di cura.
- Non usare linguaggio medico o farmaceutico come tono abituale. Evita parole e formule come: terapia, trattamento, analgesico, antinfiammatorio, efficacia clinica, stimola la circolazione, prescrizione, dosaggio, patologia, sintomo, guarigione, cura.
- Questi termini possono comparire solo se servono per spiegare chiaramente che NON è il campo di Ape Pelù o per distinguere un uso cosmetico da uno medico.
- Non presentare alveoterapia, veleno d'api, SOS DOL o altri prodotti come cure o trattamenti medici.
- Per cosmetica e Linea Veleni usa parole semplici e non mediche: uso cosmetico, massaggio, pelle, gesto quotidiano, texture, profumo, sensazione, comfort.
- Se l'utente chiede una cura o un consiglio medico, rispondi con una frase breve e naturale che chiarisca il limite e poi torna su informazioni educative, naturalistiche o cosmetiche non mediche.
- Segnala con prudenza rischi evidenti come allergie a punture o prodotti dell'alveare quando pertinenti, senza trasformare la risposta in un consulto sanitario.
- Per domande cosmetiche come rughe o pelle, evita piani salutistici generici non richiesti. Rispondi nel perimetro cosmetico e, se parli dei nostri prodotti, usa solo quelli realmente noti.
- Non dare consigli personalizzati su idratazione, sonno, dieta o altri comportamenti sanitari se non sono necessari alla domanda.
- Se l'utente chiede "cosa mi consigli" su un problema di salute, non indicare prodotti come soluzione. Puoi invece spiegare quali prodotti esistono, come si presentano e a quale uso cosmetico/non medico sono destinati.

STILE DI RISPOSTA
- Rispondi prima alla domanda: niente premesse evasive.
- Per domande semplici: 2-5 brevi paragrafi.
- Usa elenchi solo quando rendono davvero più chiaro.
- Fai esempi e paragoni facili da visualizzare quando aiutano.
- Non ripetere continuamente il nome del progetto o fare pubblicità.
- Non dire "questa prima versione", "quando collegheremo l'AI" o dettagli tecnici del chatbot.
- Se non sai qualcosa, dillo chiaramente invece di inventare.

CONVERSAZIONE
- Quasi sempre termina con UNA domanda breve e pertinente che inviti l'utente ad approfondire l'argomento.
- La domanda finale deve nascere dal tema appena discusso, non essere una frase generica ripetitiva.
- Non forzare un prodotto nella domanda finale se l'argomento è educativo.

ESEMPI DI COMPORTAMENTO
Utente: "Le api hanno dei nemici?"
Risposta attesa: spiega in modo semplice predatori, parassiti e minacce; distingui per esempio calabroni/vespe, varroa, predatori naturali e pressioni ambientali. Poi chiedi quale categoria vuole approfondire.

Utente: "A cosa serve il polline?"
Risposta attesa: cos'è, funzione nutritiva per la colonia/covata, uso alimentare umano con prudenza sulle allergie. Poi una curiosità pertinente.

Utente: "Che importanza hanno le api nel mondo sociale?"
Risposta attesa: impollinazione, cibo, agricoltura, lavoro, economia, cultura, educazione e biodiversità. Nessuna vendita forzata.
`.trim();

    const input = [
      ...history,
      {role:'user',content:message}
    ];

    const messages = [
      {role:'system', content:instructions},
      ...input
    ];

    const aiResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method:'POST',
      headers:{
        'Authorization':'Bearer ' + apiKey,
        'Content-Type':'application/json'
      },
      body:JSON.stringify({
        model:String(process.env.GROQ_MODEL || 'openai/gpt-oss-20b'),
        messages,
        max_tokens:650,
        temperature:0.2
      })
    });

    const data = await aiResponse.json().catch(() => null);

    if (!aiResponse.ok) {
      console.error('[Ape Pelù] Groq error:', aiResponse.status, data?.error?.message || 'unknown');
      return res.status(502).json({ok:false,aiConfigured:true,error:'Ape Pelù non riesce a rispondere con il motore AI in questo momento.'});
    }

    const reply = String(data?.choices?.[0]?.message?.content || '').trim();

    if (!reply) {
      return res.status(502).json({ok:false,aiConfigured:true,error:'Risposta AI vuota.'});
    }

    console.log('[Ape Pelù] Groq OK:', String(process.env.GROQ_MODEL || 'openai/gpt-oss-20b'));
    return res.json({ok:true,reply});
  } catch (error) {
    console.error('[Ape Pelù] Errore chat AI:', error);
    return res.status(500).json({ok:false,aiConfigured:true,error:'Errore temporaneo di Ape Pelù.'});
  }
});

let comuniItaliaCache = null;
let comuniItaliaCacheAt = 0;

async function getComuniItaliaDataset() {
  const maxAge = 24 * 60 * 60 * 1000;
  if (comuniItaliaCache && (Date.now() - comuniItaliaCacheAt) < maxAge) return comuniItaliaCache;

  const url = 'https://cdn.jsdelivr.net/gh/RP92/comuni-italiani@main/data/comuni.json';
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'LaFabbricaDelleApi/1.0 address-validator'
    }
  });
  if (!response.ok) throw new Error('Dataset comuni non disponibile: ' + response.status);
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error('Dataset comuni non valido');

  comuniItaliaCache = data;
  comuniItaliaCacheAt = Date.now();
  return data;
}

function normalizePlace(value) {
  return String(value || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

app.get('/api/local-delivery-check', async (req, res) => {
  try {
    const address = String(req.query.address || '').trim();
    const city = String(req.query.city || '').trim();
    const cap = String(req.query.cap || '').trim();
    const province = String(req.query.province || '').trim().toUpperCase();

    if (!address || !city || !cap || !province) {
      return res.status(400).json({
        ok:false,
        eligible:false,
        validAddressPair:false,
        validFullAddress:false,
        error:'Via, numero civico, Comune, CAP e Provincia sono obbligatori.'
      });
    }

    if (!/[A-Za-zÀ-ÿ]/.test(address) || !/\d/.test(address)) {
      return res.status(422).json({
        ok:false,
        eligible:false,
        validAddressPair:false,
        validFullAddress:false,
        error:'Inserisci sia il nome della via sia il numero civico, ad esempio “Via Roma 12”.'
      });
    }

    if (!/^\d{5}$/.test(cap)) {
      return res.status(422).json({
        ok:false,
        eligible:false,
        validAddressPair:false,
        validFullAddress:false,
        error:'Il CAP deve essere composto da 5 cifre.'
      });
    }

    const dataset = await getComuniItaliaDataset();
    const cityNorm = normalizePlace(city);

    const nameMatches = dataset.filter(item => {
      const names = [item.nome, item.nomeAltraLingua].filter(Boolean).map(normalizePlace);
      return names.some(name => name === cityNorm);
    });

    if (!nameMatches.length) {
      return res.status(422).json({
        ok:false,
        eligible:false,
        validAddressPair:false,
        validFullAddress:false,
        error:'Il Comune “'+city+'” non risulta nell’elenco dei comuni italiani.'
      });
    }

    const municipality = nameMatches.find(item => {
      const caps = Array.isArray(item.cap) ? item.cap.map(String) : [];
      const sigla = String(item.sigla || item.provincia?.sigla || '').toUpperCase();
      return caps.includes(cap) && sigla === province;
    });

    if (!municipality) {
      const caps = [...new Set(nameMatches.flatMap(item => Array.isArray(item.cap) ? item.cap : []))];
      const sigle = [...new Set(nameMatches.map(item => item.sigla || item.provincia?.sigla).filter(Boolean))];
      let msg = 'CAP, Comune e Provincia non corrispondono.';
      if (caps.length) msg += ' Per '+city+' risultano: CAP '+caps.join(', ')+'.';
      if (sigle.length) msg += ' Provincia '+sigle.join(', ')+'.';
      return res.status(422).json({
        ok:false,
        eligible:false,
        validAddressPair:false,
        validFullAddress:false,
        error:msg
      });
    }

    const rawAddress = address.trim();
    const hasStreetPrefix = /^(via|viale|piazza|corso|strada|vicolo|localita|località|frazione)\b/i.test(rawAddress);
    const addressVariants = hasStreetPrefix
      ? [rawAddress]
      : [rawAddress, 'Via ' + rawAddress];

    let geoResults = [];
    for (const variant of addressVariants) {
      const freeQuery = [variant, municipality.nome, cap, province, 'Italia'].join(', ');
      const qs = new URLSearchParams({
        format:'json',
        addressdetails:'1',
        limit:'8',
        countrycodes:'it',
        q:freeQuery
      });

      const geoResponse = await fetch('https://nominatim.openstreetmap.org/search?'+qs.toString(), {
        headers:{
          'Accept':'application/json',
          'User-Agent':'LaFabbricaDelleApi/1.0 shipping-address-validator'
        }
      });

      if (geoResponse.ok) {
        const part = await geoResponse.json();
        if (Array.isArray(part)) geoResults.push(...part);
      }
      if (geoResults.length) break;
    }

    const wantedCity = normalizePlace(municipality.nome);
    const wantedNumber = (rawAddress.match(/\b(\d+[A-Za-z\/]*)\b/) || [,''])[1];
    const streetOnly = rawAddress
      .replace(/^(via|viale|piazza|corso|strada|vicolo|localita|località|frazione)\s+/i,'')
      .replace(/\b\d+[A-Za-z\/]*\b/g,'')
      .trim();
    const streetWords = normalizePlace(streetOnly);

    const matchesAddress = (item, requireNumberMatch) => {
      const a = item.address || {};
      const resultCap = String(a.postcode || '');
      const resultProvince = String(a.ISO3166_2_lvl6 || a.province || a.county || '');
      const resultCities = [a.city, a.town, a.village, a.municipality, a.hamlet, a.suburb, item.display_name]
        .filter(Boolean)
        .map(normalizePlace);
      const roadName = normalizePlace(a.road || a.pedestrian || a.residential || a.path || a.place || '');
      const house = String(a.house_number || '').trim();

      const cityOk = resultCities.some(name =>
        name === wantedCity ||
        name.includes(wantedCity) ||
        wantedCity.includes(name) ||
        normalizePlace(item.display_name || '').includes(wantedCity)
      );
      const capOk = !resultCap || resultCap === cap;
      const provinceOk = !resultProvince || resultProvince.toUpperCase().includes(province);
      const fullDisplay = normalizePlace(item.display_name || '');
      const roadOk = !streetWords ||
        roadName.includes(streetWords) ||
        fullDisplay.includes(streetWords);

      const numberOk = !requireNumberMatch ||
        !house ||
        normalizePlace(house) === normalizePlace(wantedNumber) ||
        fullDisplay.includes(normalizePlace(wantedNumber));

      return cityOk && capOk && provinceOk && roadOk && numberOk;
    };

    let verified = geoResults.find(item => matchesAddress(item, true));

    // Fallback: molti civici italiani non sono censiti. In quel caso verifichiamo
    // la via nel Comune/CAP corretti e accettiamo il civico scritto dall'utente.
    if (!verified && streetOnly) {
      const streetQueries = [
        [streetOnly, municipality.nome, cap, province, 'Italia'].join(', '),
        ['Via '+streetOnly, municipality.nome, cap, province, 'Italia'].join(', ')
      ];

      for (const query of streetQueries) {
        const qs = new URLSearchParams({
          format:'json',
          addressdetails:'1',
          limit:'10',
          countrycodes:'it',
          q:query
        });

        const geoResponse = await fetch('https://nominatim.openstreetmap.org/search?'+qs.toString(), {
          headers:{
            'Accept':'application/json',
            'User-Agent':'LaFabbricaDelleApi/1.0 street-validator'
          }
        });

        if (geoResponse.ok) {
          const part = await geoResponse.json();
          if (Array.isArray(part)) {
            verified = part.find(item => matchesAddress(item, false));
            if (verified) break;
          }
        }
      }
    }

    // Secondo verificatore indipendente: Photon/Komoot.
    // Serve quando Nominatim non censisce bene una strada o un civico.
    if (!verified) {
      try {
        const photonQuery = [rawAddress, municipality.nome, cap, province, 'Italia'].join(', ');
        const photonUrl = 'https://photon.komoot.io/api/?limit=10&q=' + encodeURIComponent(photonQuery);
        const photonResponse = await fetch(photonUrl, {
          headers:{
            'Accept':'application/json',
            'User-Agent':'LaFabbricaDelleApi/1.0 address-validator'
          }
        });

        if (photonResponse.ok) {
          const photonData = await photonResponse.json();
          const features = Array.isArray(photonData?.features) ? photonData.features : [];

          const photonMatch = features.find(feature => {
            const p = feature.properties || {};
            const coords = feature.geometry?.coordinates || [];
            const photonStreet = normalizePlace(p.street || p.name || '');
            const photonHouse = normalizePlace(p.housenumber || '');
            const photonCityValues = [p.city, p.locality, p.district, p.county]
              .filter(Boolean)
              .map(normalizePlace);
            const photonPostcode = String(p.postcode || '');
            const photonState = normalizePlace(p.state || '');
            const wantedNumberNorm = normalizePlace(wantedNumber);

            const cityOk = photonCityValues.some(name =>
              name === wantedCity ||
              name.includes(wantedCity) ||
              wantedCity.includes(name)
            );
            const capOk = !photonPostcode || photonPostcode === cap;
            const provinceOk = true; // Comune+CAP+sigla sono già stati validati sul dataset dei comuni italiani.
            const streetOk = !streetWords ||
              photonStreet.includes(streetWords) ||
              streetWords.includes(photonStreet);
            const numberOk = !wantedNumberNorm ||
              !photonHouse ||
              photonHouse === wantedNumberNorm;

            return cityOk && capOk && provinceOk && streetOk && numberOk &&
              Array.isArray(coords) && coords.length >= 2;
          });

          if (photonMatch) {
            const coords = photonMatch.geometry.coordinates;
            verified = {
              lat:String(coords[1]),
              lon:String(coords[0]),
              display_name:[
                photonMatch.properties?.street || photonMatch.properties?.name || streetOnly,
                photonMatch.properties?.housenumber || wantedNumber,
                municipality.nome,
                cap,
                province
              ].filter(Boolean).join(', ')
            };
          }
        }
      } catch (error) {
        console.warn('[Shop V2] Fallback Photon non disponibile:', error.message);
      }
    }

    if (!verified) {
      return res.status(422).json({
        ok:false,
        eligible:false,
        validAddressPair:true,
        validFullAddress:false,
        error:'Non riesco a verificare questa via nel Comune indicato. Controlla il nome della strada, il Comune e il CAP.'
      });
    }

    const lat = Number(verified.lat);
    const lon = Number(verified.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return res.status(422).json({
        ok:false,
        eligible:false,
        validAddressPair:true,
        validFullAddress:false,
        error:'Indirizzo trovato, ma coordinate non disponibili. Controlla i dati inseriti.'
      });
    }

    const centerLat = 45.187, centerLon = 10.974;
    const toRad = v => v * Math.PI / 180;
    const dLat = toRad(lat - centerLat), dLon = toRad(lon - centerLon);
    const a = Math.sin(dLat/2) ** 2 + Math.cos(toRad(centerLat)) * Math.cos(toRad(lat)) * Math.sin(dLon/2) ** 2;
    const km = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return res.json({
      ok:true,
      eligible:km <= 50,
      validAddressPair:true,
      validFullAddress:true,
      distanceKm:Math.round(km * 10) / 10,
      municipality:municipality.nome,
      cap,
      province,
      verifiedAddress:verified.display_name || [address, municipality.nome, cap, province].join(', ')
    });

  } catch (error) {
    console.error('[Shop V2] Errore verifica indirizzo completo:', error);
    return res.status(503).json({
      ok:false,
      eligible:false,
      validAddressPair:null,
      validFullAddress:false,
      error:'Non riesco a verificare l’indirizzo in questo momento. Riprova tra poco.'
    });
  }
});
app.use('/images', express.static(path.join(__dirname, 'images'), { etag:true,lastModified:true,maxAge:0,setHeaders:(res)=>{res.setHeader('Cache-Control','no-cache, no-store, must-revalidate');res.setHeader('Pragma','no-cache');res.setHeader('Expires','0');} }));

const cacheBustScript = `<script>(()=>{const version=${JSON.stringify('20260827-13')};const addVersion=(img)=>{if(!img||!img.getAttribute)return;const raw=img.getAttribute('src');if(!raw||!/^(?:\\/?images\\/)/i.test(raw))return;try{const url=new URL(raw,window.location.href);if(url.searchParams.get('v')!==version){url.searchParams.set('v',version);img.src=url.pathname+url.search+url.hash;}}catch(_){}};const scan=(root)=>{if(!root)return;if(root.tagName==='IMG')addVersion(root);if(root.querySelectorAll)root.querySelectorAll('img[src]').forEach(addVersion);};const start=()=>{scan(document);const observer=new MutationObserver(ms=>{for(const m of ms){m.addedNodes.forEach(scan);if(m.type==='attributes'&&m.target.tagName==='IMG')addVersion(m.target);}});observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['src']});};document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();})();</script>`;

const shopBridgeScript = `<style>
html,body{max-width:100%;overflow-x:hidden!important}
#center-home-bar{width:100%;box-sizing:border-box;display:flex;align-items:center;justify-content:flex-start;padding:9px 18px;background:#07372b;border-bottom:1px solid rgba(212,175,55,.55);position:relative;z-index:40}
#center-home-link{display:inline-flex;align-items:center;gap:8px;padding:9px 15px;border-radius:999px;border:1px solid rgba(212,175,55,.9);background:rgba(255,255,255,.04);color:#fff;text-decoration:none;font:700 14px/1.1 system-ui,sans-serif}
.shop-brand-wrap{min-width:0!important;width:min(760px,calc(100vw - 360px))!important;max-width:min(760px,calc(100vw - 360px))!important;margin-left:auto!important;margin-right:24px!important;overflow:hidden!important;position:relative!important;padding:22px 28px 26px!important;border-radius:28px!important;background:linear-gradient(135deg,rgba(7,55,43,.72),rgba(5,18,14,.25))!important;border:1px solid rgba(212,175,55,.45)!important}
.shop-brand-title{display:block!important;width:100%!important;margin:0 auto!important;white-space:normal!important;font-family:Georgia,'Times New Roman',serif!important;font-size:clamp(2.35rem,4.6vw,4.9rem)!important;line-height:.94!important;text-align:center!important;text-transform:uppercase!important;background:linear-gradient(180deg,#fff0a8 0%,#f3c651 42%,#c88716 100%)!important;-webkit-background-clip:text!important;background-clip:text!important;-webkit-text-fill-color:transparent!important}
.shop-subtitle-spin{display:flex!important;width:fit-content!important;margin:0 auto!important;align-items:center!important;justify-content:center!important;gap:14px!important;padding-top:10px!important;font-weight:700!important;color:#fff6d8!important;transform-style:preserve-3d;perspective:1000px;animation:rotate3DLinear 20s infinite linear}
.shop-subtitle-spin svg{width:60px;height:40px}
.honey-selection-card{grid-column:span 2!important;width:100%!important;max-width:540px!important;aspect-ratio:8/5!important}
.honey-selection-card h3{font-size:clamp(17px,2.4vw,24px)!important;color:#f6c85f!important}
.selected-honey-divider{grid-column:1/-1!important;width:100%;margin:30px 0 8px;padding:20px 22px;border-radius:18px;border:1px solid rgba(212,175,55,.45);background:linear-gradient(135deg,rgba(7,55,43,.78),rgba(22,31,27,.68));box-shadow:0 10px 26px rgba(0,0,0,.22)}
.selected-honey-divider h2{margin:0;font:700 clamp(1.55rem,3vw,2.35rem)/1.05 Georgia,'Times New Roman',serif;color:#f4c85b}
.selected-honey-divider p{margin:7px 0 0;color:#e7e5e4;font:500 15px/1.45 system-ui,sans-serif}
.pending-honey-card{min-height:260px!important;padding:24px!important;border-radius:22px!important;border:1px solid rgba(212,175,55,.42)!important;background:linear-gradient(145deg,#30291f,#1f1b17)!important;display:flex!important;flex-direction:column!important;justify-content:center!important;align-items:center!important;text-align:center!important;box-shadow:0 12px 28px rgba(0,0,0,.28)!important}
.pending-honey-card .pending-honey-icon{font-size:58px;line-height:1;margin-bottom:14px}
.pending-honey-card h3{margin:0 0 9px!important;color:#f5c75d!important;font:800 22px/1.15 Georgia,'Times New Roman',serif!important}
.pending-honey-card p{margin:0!important;color:#e7e5e4!important;font:500 14px/1.45 system-ui,sans-serif!important}
.pending-honey-card .pending-label{margin-top:15px!important;display:inline-block!important;padding:7px 11px!important;border-radius:999px!important;border:1px solid rgba(212,175,55,.42)!important;color:#ffe49a!important;font-size:12px!important;font-weight:800!important;text-transform:uppercase!important;letter-spacing:.04em!important}
@media(max-width:900px){.shop-brand-wrap{width:calc(100vw - 32px)!important;max-width:calc(100vw - 32px)!important;margin:12px auto!important}}
@media(max-width:760px){.honey-selection-card{grid-column:span 1!important;max-width:100%!important;aspect-ratio:4/3!important}.shop-brand-title{font-size:clamp(1.9rem,10vw,3.25rem)!important}}
</style><script>(()=>{
const approvedHoneyTokens=['millefiori','fragola','melone','pesca','arancia','acacia','castagno','rucas','eucalipto','eucamiel','euca miel','propol miel','propolmiel','balsam miel','balsammiel'];
const selectedHoneyNames=['Miele di Acacia','Miele di Castagno','Millefiori di Rucas','Alta Montagna','Miele di Eucalipto','Eucamiel','Euca Miel','Propol Miel','Propolmiel','Balsam Miel','Balsammiel'];
const missingHoney=[
  {id:'pending-rucas',name:'Millefiori di Rucas – Alta Montagna'},
  {id:'pending-eucalipto',name:'Miele di Eucalipto'},
  {id:'pending-propol-miel',name:'Propol Miel'}
];
const normalize=(value)=>String(value||'').normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toLowerCase();
const findProductCard=(node)=>{let current=node;for(let i=0;current&&i<7;i+=1,current=current.parentElement){if(current.querySelector&&current.querySelector('img')&&current.parentElement&&current.parentElement.children.length>1)return current;}return null;};
const findHoneyGrid=()=>{const nodes=Array.from(document.querySelectorAll('h2,h3,h4,p,span,div'));const known=nodes.find(el=>{const t=normalize((el.textContent||'').trim());return t.length<100&&(t.includes('miele millefiori')||t.includes("miele con essenze all'arancia"));});if(!known)return null;const card=findProductCard(known);return card&&card.parentElement?card.parentElement:null;};
const filterVisibleHoneys=()=>{const title=Array.from(document.querySelectorAll('h1,h2,h3')).find(el=>/Mieli del Busatello/i.test(el.textContent||''));if(!title)return;const grid=findHoneyGrid();if(!grid)return;Array.from(grid.children).forEach(child=>{if(!child||child.id==='selected-honey-divider'||(child.classList&&child.classList.contains('pending-honey-card')))return;const text=normalize(child.textContent||'');if(!text)return;const looksLikeProduct=!!(child.querySelector&&child.querySelector('img'));if(!looksLikeProduct)return;const approved=approvedHoneyTokens.some(token=>text.includes(normalize(token)));child.style.display=approved?'':'none';});};
const addSelectedHoneyDivider=()=>{if(document.getElementById('selected-honey-divider'))return;const busatelloTitle=Array.from(document.querySelectorAll('h1,h2,h3')).find(el=>/Mieli del Busatello/i.test(el.textContent||''));if(!busatelloTitle)return;const nodes=Array.from(document.querySelectorAll('h2,h3,h4,p,span,div'));const nameNode=nodes.find(el=>{const text=(el.textContent||'').trim();return text.length<120&&selectedHoneyNames.some(name=>normalize(text).includes(normalize(name)));});if(!nameNode)return;const card=findProductCard(nameNode);if(!card||!card.parentElement)return;const divider=document.createElement('div');divider.id='selected-honey-divider';divider.className='selected-honey-divider';divider.innerHTML='<h2>Selezionati per voi</h2><p>Una selezione speciale di mieli scelti dalla Fabbrica delle Api.</p>';card.parentElement.insertBefore(divider,card);};
const addMissingHoneyCards=()=>{const title=Array.from(document.querySelectorAll('h1,h2,h3')).find(el=>/Mieli del Busatello/i.test(el.textContent||''));if(!title)return;const grid=findHoneyGrid();if(!grid)return;missingHoney.forEach(item=>{if(document.getElementById(item.id))return;const existingText=normalize(grid.textContent||'');if(existingText.includes(normalize(item.name)))return;const card=document.createElement('div');card.id=item.id;card.className='pending-honey-card';card.innerHTML='<div class="pending-honey-icon">🍯</div><h3>'+item.name+'</h3><p>Scheda prodotto in aggiornamento. Foto e prezzo verranno inseriti appena definitivi.</p><span class="pending-label">Prossimamente disponibile</span>';grid.appendChild(card);});};
const forceBalsamImage=()=>{const nodes=Array.from(document.querySelectorAll('h1,h2,h3,h4,p,span,div'));const nameNode=nodes.find(el=>{const text=normalize((el.textContent||'').trim());return text.length<140&&(text.includes('balsammiel miele balsamico')||text.includes('balsam miel'));});if(!nameNode)return;const card=findProductCard(nameNode);if(!card)return;const img=card.querySelector('img');if(img&&!(img.getAttribute('src')||'').includes('/images/balsam-miel.jpg'))img.src='/images/balsam-miel.jpg';};
const enhanceShop=()=>{if(!document.getElementById('center-home-bar')){const bar=document.createElement('div');bar.id='center-home-bar';const link=document.createElement('a');link.id='center-home-link';link.href='/';link.textContent='← Home Centro';bar.appendChild(link);document.body.insertBefore(bar,document.body.firstElementChild);}const headings=Array.from(document.querySelectorAll('h1,h2,h3'));const title=headings.find(el=>(el.textContent||'').includes('La Fabbrica delle Api'));if(title){title.classList.add('shop-brand-title');if(title.parentElement)title.parentElement.classList.add('shop-brand-wrap');}const honeyHeading=headings.find(el=>(el.textContent||'').includes('La selezione di mieli della Fabbrica delle Api'));if(honeyHeading&&honeyHeading.parentElement)honeyHeading.parentElement.classList.add('honey-selection-card');filterVisibleHoneys();addSelectedHoneyDivider();addMissingHoneyCards();forceBalsamImage();};
const start=()=>{enhanceShop();new MutationObserver(enhanceShop).observe(document.body,{childList:true,subtree:true});};document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();})();</script>`;

const sendShop = (_req,res)=>{try{const indexPath=path.join(__dirname,'index.html');let html=fs.readFileSync(indexPath,'utf8');html=html.replaceAll("L'Italiano",'La Fabbrica delle Api');html=html.replaceAll('I Mieli Artigianali',"Mieli e prodotti dell'alveare");html=html.replaceAll("category: 'prelibati'","category: 'busatello'");html=html.replaceAll('alt="I mieli del Busatello"','alt="La selezione di mieli della Fabbrica delle Api"');html=html.replaceAll('>I mieli del Busatello</h3>','>La selezione di mieli della Fabbrica delle Api</h3>');html=html.replaceAll('https://placehold.co/400x400/A52A2A/FFFFFF?text=Balsammiel','/images/balsam-miel.jpg');html=html.replace(/<a className="card" href="#" onClick=\{\(e\) => \{ e\.preventDefault\(\); onSelectCategory\('prelibati'\); \}\}>[\s\S]*?<h3 className="rose">I mieli prelibati<\/h3>\s*<\/a>/,'');html=html.replace(/^\s*\{\s*id:\s*["'][^"']*12["'][^\n]*jars:\s*12[^\n]*\},?\s*$/gm,'');
const honeyAvailabilityHelper=`
            const applyHoneyAvailability = (list) => {
                const busatelloOrder = ['millefiori','fragola','melone','pesca','arancia'];
                const selectedOrder = ['acacia','castagno','rucas','eucalipto','eucamiel','euca miel','propol miel','propolmiel','balsam miel','balsammiel'];
                const allowedHoneyTokens = [...busatelloOrder, ...selectedOrder];
                const normalize = (value) => String(value || '').normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').toLowerCase();
                const mapped = list.map((product, originalIndex) => {
                    let normalizedProduct = product.category === 'prelibati' ? { ...product, category: 'busatello' } : product;
                    if (normalizedProduct.id === 'balsammiel') normalizedProduct = { ...normalizedProduct, image: '/images/balsam-miel.jpg' };
                    if (normalizedProduct.category !== 'busatello') return normalizedProduct;
                    const name = normalize(normalizedProduct.name);
                    const busIndex = busatelloOrder.findIndex(token => name.includes(token));
                    const selectedIndex = selectedOrder.findIndex(token => name.includes(token));
                    const isAllowed = allowedHoneyTokens.some(token => name.includes(token));
                    let forcedOrder = 900 + originalIndex;
                    if (busIndex >= 0) forcedOrder = 1 + busIndex;
                    else if (selectedIndex >= 0) forcedOrder = 101 + selectedIndex;
                    const availableProduct = isAllowed ? normalizedProduct : { ...normalizedProduct, inStock: true, stock: 0 };
                    return { ...availableProduct, order: forcedOrder };
                });
                return mapped;
            };
`;
html=html.replace('// === STOCK MODE TOGGLE ===',`${honeyAvailabilityHelper}\n            // === STOCK MODE TOGGLE ===`);html=html.replaceAll('staticInitialProducts.filter(p => allowedCategoriesForShop.includes(p.category))','applyHoneyAvailability(staticInitialProducts).filter(p => allowedCategoriesForShop.includes(p.category))');html=html.replace('const filtered = mergedProducts.filter(p => allowedCategoriesForShop.includes(p.category));','const filtered = applyHoneyAvailability(mergedProducts).filter(p => allowedCategoriesForShop.includes(p.category));');html=html.replace('className="text-6xl sm:text-7xl lg:text-8xl font-black text-amber-900 flex flex-col items-end gap-2 text-3d-effect"','className="text-6xl sm:text-7xl lg:text-8xl font-black text-amber-900 flex flex-col items-end gap-2"');const injected=`${cacheBustScript}\n${shopBridgeScript}`;html=html.includes('</head>')?html.replace('</head>',`${injected}\n</head>`):`${injected}\n${html}`;res.setHeader('Cache-Control','no-cache, no-store, must-revalidate');res.setHeader('Pragma','no-cache');res.setHeader('Expires','0');return res.type('html').send(html);}catch(error){console.error('[Miele Artigianale] Errore caricamento shop:',error);return res.status(500).send('Errore caricamento pagina.');}};
const sendPage=(filename)=>(_req,res)=>{res.setHeader('Cache-Control','no-cache, no-store, must-revalidate');return res.sendFile(path.join(__dirname,filename));};
app.get('/',sendPage('home.html'));app.get('/home',sendPage('home.html'));app.get('/centro',sendPage('centro.html'));app.get('/alveoterapia',sendPage('alveoterapia.html'));app.get('/bacheca',sendPage('bacheca.html'));app.get('/chi-siamo',sendPage('chi-siamo.html'));app.get('/contatti',sendPage('contatti.html'));app.get('/shop',sendPage('shop-v2.html'));app.get('/shop-v2',sendPage('shop-v2.html'));app.get('/shop.html',sendPage('shop-v2.html'));app.get('/index.html',sendPage('shop-v2.html'));app.get('/shop-legacy',(_req,res)=>res.redirect(302,'/shop'));app.use(express.static(__dirname));app.listen(PORT,'0.0.0.0',()=>console.log(`[Miele Artigianale] Server avviato sulla porta ${PORT}.`));