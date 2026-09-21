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

const APE_V2_OFFICIAL_PRODUCTS = [{"id":"propolterapy-professional","section":"alveoterapia-prodotti","name":"PropolTerapy Professional","size":"Diffusore + 5 capsule BIO","price":180,"desc":"Diffusore professionale per l’esperienza di alveoterapia negli ambienti, con accessori dedicati e confezione iniziale di 5 capsule BIO."},{"id":"capsule-pb","section":"alveoterapia-prodotti","name":"Capsule Propoli P+B (5 pz)","size":"Scatola da 5 capsule","price":19.9,"desc":"Capsule monouso P+B dedicate ai diffusori compatibili, con propoli italiana e Boswellia Serrata."},{"id":"capsule-propolit","section":"alveoterapia-prodotti","name":"Capsule PROPOLIT (5 pz)","size":"Scatola da 5 capsule","price":19.9,"desc":"Capsule monouso di propoli per diffusori PROPOLAIR/PROPOLIT compatibili."},{"id":"castagno","section":"alveare","name":"Miele di Castagno","size":"250 g","price":6.9,"desc":"Miele dal profumo deciso e dal gusto intenso, poco dolce e con una caratteristica nota leggermente amarognola."},{"id":"acacia-zenzero-apinfiore","section":"alveare","name":"Miele di Acacia e Zenzero","size":"200 g","price":7.9,"desc":"Specialità alimentare a base di miele italiano di acacia e zenzero, dal profilo dolce e delicatamente speziato."},{"id":"miele-eucalipto-apinfiore","section":"alveare","name":"Miele Eucalipto","size":"250 g","price":6.9,"desc":"Miele italiano di eucalipto dal profumo intenso e dal gusto aromatico, con caratteristiche note fresche e balsamiche."},{"id":"balsammiel","section":"alveare","name":"Balsamico Italiano","size":"200 g","price":11.9,"desc":"Specialità alimentare dal gusto fresco e intensamente balsamico, preparata con miele di eucalipto e ingredienti aromatici."},{"id":"acacia","section":"alveare","name":"Miele Italiano di Acacia","size":"40 g","price":2.9,"desc":"Miele italiano di acacia dal colore chiaro e dal gusto dolce e delicato, nel pratico formato da 40 g."},{"id":"favo-integrale-bio","section":"alveare","name":"Miele Italiano di Acacia in Favo","size":"200 g","price":11.9,"desc":"Miele di acacia presentato direttamente nel favo, per una degustazione molto vicina al prodotto così come viene conservato dalle api."},{"id":"polline-italiano","section":"alveare","name":"Polline Italiano","size":"125 g","price":10.9,"desc":"Polline italiano raccolto dalle api e selezionato come prodotto dell’alveare."},{"id":"pappa-reale-italiana-bio","section":"alveare","name":"Pappa Reale","size":"10 g","price":6.9,"desc":"Pappa reale in formato da 10 g, uno dei prodotti più particolari dell’alveare."},{"id":"orsetti-gommosi","section":"alveare","name":"Orsetti Gommosi BIO con Propoli e Miele","size":"80 g","price":3.9,"desc":"Orsetti gommosi biologici con propoli e miele, in confezione da 80 g."},{"id":"bee-energy-bio","section":"propoli","name":"Bee Energy BIO","size":"12 flaconcini da 10 ml","price":14.9,"desc":"Integratore alimentare biologico con ingredienti dell’alveare, proposto in pratici flaconcini."},{"id":"propol-active-bio","section":"propoli","name":"Propol Active BIO","size":"30 compresse masticabili","price":10.9,"desc":"Integratore in compresse masticabili a base di propoli italiana biologica."},{"id":"propoli-30-spray-integratore","section":"propoli","name":"Soluzione Propoli 30% Spray","size":"20 ml","price":7.9,"desc":"Soluzione di propoli al 30% con pratico erogatore spray reclinabile."},{"id":"propoli-30-alcolica-integratore","section":"propoli","name":"Soluzione Propoli 30% con Contagocce - Alcolica","size":"20 ml","price":5.9,"desc":"Soluzione alcolica di propoli al 30% con contagocce, formato da 20 ml."},{"id":"propoli-analcolica-integratore","section":"propoli","name":"Soluzione Propoli con Contagocce Analcolica","size":"20 ml","price":5.9,"desc":"Soluzione analcolica di propoli con contagocce, formato da 20 ml."},{"id":"cosmesi-crema-mani","section":"cosmesi","name":"Crema Mani","size":"100 ml","price":9.9,"desc":"Crema mani formulata con ingredienti dell’alveare, pensata per un gesto cosmetico quotidiano."},{"id":"cosmesi-burrocacao-propoli-aloe","section":"cosmesi","name":"Burrocacao Propoli e Aloe Vera","size":"5 ml","price":4.9,"desc":"Stick labbra con propoli e aloe vera, pensato per mantenere le labbra morbide e protette."},{"id":"cosmesi-burrocacao-miele-pappa-reale","section":"cosmesi","name":"Burrocacao Miele e Pappa Reale","size":"5 ml","price":4.9,"desc":"Stick labbra con miele e pappa reale, per un gesto cosmetico quotidiano."},{"id":"cosmesi-shampoo-multivitaminico","section":"cosmesi","name":"Shampoo Multivitaminico","size":"250 ml","price":9.9,"desc":"Shampoo multivitaminico per la detersione quotidiana dei capelli."},{"id":"cosmesi-saponetta-frutti-bosco","section":"cosmesi","name":"Saponetta Miele e Frutti di Bosco","size":"100 g","price":3.9,"desc":"Sapone vegetale con miele e frutti di bosco, per la detersione quotidiana."},{"id":"cosmesi-saponetta-lavanda","section":"cosmesi","name":"Saponetta Miele e Lavanda","size":"100 g","price":3.9,"desc":"Sapone vegetale con miele e lavanda, per la detersione quotidiana."},{"id":"cosmesi-saponetta-aloe-vera","section":"cosmesi","name":"Saponetta Miele e Aloe Vera","size":"100 g","price":3.9,"desc":"Sapone vegetale con miele e aloe vera, per la detersione quotidiana."},{"id":"cosmesi-candela-alveare-cera-api","section":"cosmesi","name":"Candela Alveare Grande in Cera d’Api","size":"1 candela","price":5.9,"desc":"Candela artigianale in cera d’api, modellata nella caratteristica forma dell’alveare."},{"id":"cosmesi-travel-kit-benessere","section":"cosmesi","name":"Kit da Viaggio Benessere dell’Alveare","size":"4 x 50 ml + pochette","price":17.9,"desc":"Quattro formati da viaggio raccolti in una pochette riutilizzabile, pensati per corpo e capelli."},{"id":"unguento-apis","section":"linea-veleni","name":"SOS DOL – Unguento al Veleno d’Api","size":"15 ml","price":29.9,"desc":"Unguento cosmetico da massaggio formulato con veleno d’api e ingredienti cosmetici selezionati."},{"id":"apis1-crema-viso-veleno-api","section":"linea-veleni","name":"Crema Viso al Veleno d’Api – APIS1","size":"50 ml","price":39.9,"desc":"Crema viso cosmetica formulata con veleno d’api, pensata per viso, collo e décolleté."},{"id":"apis2-siero-viso-veleno-api","section":"linea-veleni","name":"Siero Viso al Veleno d’Api – APIS2","size":"30 ml","price":34.9,"desc":"Siero viso cosmetico formulato con veleno d’api e altri ingredienti dell’alveare."},{"id":"apis4-crema-corpo-veleno-api-manuka","section":"linea-veleni","name":"Crema Corpo Veleno d’Api e Miele di Manuka – APIS4","size":"250 ml","price":31.9,"desc":"Crema corpo cosmetica formulata con veleno d’api e miele di Manuka."},{"id":"apis5-gommage-veleno-api-manuka","section":"linea-veleni","name":"Gommage Viso e Corpo Veleno d’Api e Miele di Manuka – APIS5","size":"250 ml","price":34.9,"desc":"Gommage cosmetico per viso e corpo formulato con veleno d’api e miele di Manuka."},{"id":"bagnodoccia-veleno-oro","section":"linea-veleni","name":"Bagnodoccia Veleno d’Oro – APIS7","size":"250 ml","price":14.9,"desc":"Bagnodoccia cosmetico formulato con veleno d’api e miele di Manuka."},{"id":"tesori-limoncello","section":"tesori-francesco","name":"Limoncello “I Tesori di Francesco”","size":"250 ml","price":5.9,"desc":"Limoncello della linea I Tesori di Francesco, dal profilo fresco e agrumato."},{"id":"tesori-liquore-caffe","section":"tesori-francesco","name":"Liquore di Caffè “I Tesori di Francesco”","size":"250 ml","price":5.9,"desc":"Liquore al caffè della linea I Tesori di Francesco, dal gusto intenso e avvolgente."},{"id":"tesori-castagne-rum","section":"tesori-francesco","name":"Castagne al Rum “I Tesori di Francesco”","size":"250 ml","price":5.9,"desc":"Castagne al rum della linea I Tesori di Francesco, una piccola specialità da degustazione."}];
const APE_V2_PRODUCT_ALIASES = {"propolterapy-professional":["propolterapy professional","propolterapy","diffusore professional"],"capsule-pb":["capsule p+b","capsule propoli p+b","p+b"],"capsule-propolit":["capsule propolit","propolit"],"acacia-zenzero-apinfiore":["acacia e zenzero","acacia zenzero"],"miele-eucalipto-apinfiore":["miele di eucalipto"],"balsammiel":["balsammiel","balsam miel"],"acacia":["acacia 40 g","acacia 40g"],"favo-integrale-bio":["acacia in favo","miele in favo","favo integrale"],"orsetti-gommosi":["orsetti gommosi"],"bee-energy-bio":["bee energy"],"propol-active-bio":["propol active"],"propoli-30-spray-integratore":["propoli 30% spray","propoli spray"],"propoli-30-alcolica-integratore":["propoli 30% alcolica","propoli alcolica"],"propoli-analcolica-integratore":["propoli analcolica"],"cosmesi-burrocacao-propoli-aloe":["burrocacao propoli aloe"],"cosmesi-burrocacao-miele-pappa-reale":["burrocacao miele pappa reale"],"cosmesi-shampoo-multivitaminico":["shampoo multivitaminico"],"cosmesi-saponetta-frutti-bosco":["saponetta frutti di bosco"],"cosmesi-saponetta-lavanda":["saponetta lavanda"],"cosmesi-saponetta-aloe-vera":["saponetta aloe vera"],"cosmesi-candela-alveare-cera-api":["candela alveare","candela in cera d api"],"cosmesi-travel-kit-benessere":["kit da viaggio","travel kit apinfiore","travel kit"],"unguento-apis":["sos dol"],"apis1-crema-viso-veleno-api":["apis1"],"apis2-siero-viso-veleno-api":["apis2"],"apis4-crema-corpo-veleno-api-manuka":["apis4"],"apis5-gommage-veleno-api-manuka":["apis5"],"bagnodoccia-veleno-oro":["apis7"],"tesori-limoncello":["tesori limoncello"],"tesori-liquore-caffe":["tesori liquore caffe","liquore al caffe"],"tesori-castagne-rum":["tesori castagne rum","castagne al rum"]};
function apeProductNormalize(value){
  return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’‘]/g,"'").replace(/\s+/g,' ').trim();
}
function findApeV2ProductContext(value){
  const hay=apeProductNormalize(value);
  let best=null;
  for(const product of APE_V2_OFFICIAL_PRODUCTS){
    const candidates=[product.name,...(APE_V2_PRODUCT_ALIASES[product.id]||[])];
    for(const candidateRaw of candidates){
      const candidate=apeProductNormalize(candidateRaw);
      if(candidate.length<4 || !hay.includes(candidate)) continue;
      if(!best || candidate.length>best.length) best={product,length:candidate.length};
    }
  }
  return best?.product||null;
}

function getApeContextAction(message, reply, lang='it') {
  const text=(String(message||'')+' '+String(reply||'')).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const labels={
    it:{millefiori:'Vai al Miele Millefiori',melone:'Vai al Miele al Melone',fragola:'Vai al Miele alla Fragola',pesca:'Vai al Miele alla Pesca',arancia:"Vai al Miele all'Arancia",mieli:'Scopri i Mieli del Busatello',punti:'Vai ai Punti Ape',oasi:"Scopri l'Oasi del Busatello",galena:'Scopri la Galena delle Api',alveo:'Scopri Alveo Digitale',bacheca:'Vai alla Bacheca',veleni:'Scopri la Linea Veleni',alveoterapia:"Scopri l'Alveoterapia Integrata"},
    en:{millefiori:'Go to Millefiori Honey',melone:'Go to Melon Honey',fragola:'Go to Strawberry Honey',pesca:'Go to Peach Honey',arancia:'Go to Orange Honey',mieli:'Discover Busatello Honeys',punti:'Go to Bee Points',oasi:'Discover Busatello Oasis',galena:'Discover Galena delle Api',alveo:'Discover Alveo Digitale',bacheca:'Go to News',veleni:'Discover the Bee Venom Line',alveoterapia:'Discover Integrated Alveotherapy'},
    de:{millefiori:'Zum Millefiori-Honig',melone:'Zum Melonenhonig',fragola:'Zum Erdbeerhonig',pesca:'Zum Pfirsichhonig',arancia:'Zum Orangenhonig',mieli:'Busatello-Honige entdecken',punti:'Zu den Bienenpunkten',oasi:'Oase Busatello entdecken',galena:'Galena delle Api entdecken',alveo:'Alveo Digitale entdecken',bacheca:'Zu den Neuigkeiten',veleni:'Bienengift-Linie entdecken',alveoterapia:'Integrierte Alveotherapie entdecken'},
    fr:{millefiori:'Voir le Miel Millefiori',melone:'Voir le Miel au Melon',fragola:'Voir le Miel à la Fraise',pesca:'Voir le Miel à la Pêche',arancia:"Voir le Miel à l'Orange",mieli:'Découvrir les Miels du Busatello',punti:'Voir les Points Abeille',oasi:"Découvrir l'Oasis du Busatello",galena:'Découvrir Galena delle Api',alveo:'Découvrir Alveo Digitale',bacheca:'Voir les Actualités',veleni:"Découvrir la Ligne Venin d'Abeille",alveoterapia:"Découvrir l'Alvéothérapie Intégrée"},
    es:{millefiori:'Ir a la Miel Millefiori',melone:'Ir a la Miel al Melón',fragola:'Ir a la Miel a la Fresa',pesca:'Ir a la Miel al Melocotón',arancia:'Ir a la Miel a la Naranja',mieli:'Descubrir las Mieles del Busatello',punti:'Ir a los Puntos Abeja',oasi:'Descubrir el Oasis del Busatello',galena:'Descubrir Galena delle Api',alveo:'Descubrir Alveo Digitale',bacheca:'Ir a Novedades',veleni:'Descubrir la Línea Veneno de Abeja',alveoterapia:'Descubrir la Alveoterapia Integrada'}
  };
  const L=labels[lang]||labels.it;
  const has=(...xs)=>xs.some(x=>text.includes(x));
  const product=findApeV2ProductContext(text);
  if(product){
    const prefix={it:'Vai a',en:'Go to',de:'Zum Produkt',fr:'Voir',es:'Ir a'}[lang]||'Vai a';
    return {href:'/shop#prodotto-'+product.id,label:prefix+' '+product.name};
  }

  if(has('millefiori')) return {href:'/shop#miele-millefiori',label:L.millefiori};
  if(has('miele al melone','miele melone','miel al melon','melon honey','melonenhonig')) return {href:'/shop#miele-melone',label:L.melone};
  if(has('miele alla fragola','miele fragola','miel a la fresa','strawberry honey','erdbeerhonig')) return {href:'/shop#miele-fragola',label:L.fragola};
  if(has('miele alla pesca','miele pesca','miel al melocoton','peach honey','pfirsichhonig')) return {href:'/shop#miele-pesca',label:L.pesca};
  if(has("miele all'arancia",'miele arancia','miel a la naranja','orange honey','orangenhonig')) return {href:'/shop#miele-arancia',label:L.arancia};
  if(has('punti ape','bee points','bienenpunkte','points abeille','puntos abeja')) return {href:'/shop#punti-ape',label:L.punti};
  if(has('oasi del busatello','oasis del busatello','busatello oasis','oase busatello','oasis du busatello')) return {href:'/alveoterapia',label:L.oasi};
  if(has('galena delle api')) return {href:'/centro',label:L.galena};
  if(has('alveo digitale')) return {href:'/alveo-digitale',label:L.alveo};
  if(has('bacheca','news','novedades','actualites','aktuelles')) return {href:'/bacheca',label:L.bacheca};
  if(has('linea veleni','bee venom line','bienengift-linie',"ligne venin d'abeille",'linea veneno de abeja')) return {href:'/shop#linea-veleni',label:L.veleni};
  if(has('alveoterapia integrata','integrated alveotherapy','integrierte alveotherapie','alveotherapie integree','alveoterapia integrada')) return {href:'/alveoterapia',label:L.alveoterapia};
  if(has('miele','mieli','honey','honeys','honig','miel','miels')) return {href:'/shop#mieli',label:L.mieli};
  return null;
}

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
    const requestedLanguage = ['it','en','de','fr','es'].includes(String(req.body?.language || '').toLowerCase())
      ? String(req.body.language).toLowerCase()
      : 'it';
    const languageName = {it:'Italiano',en:'English',de:'Deutsch',fr:'Français',es:'Español'}[requestedLanguage];

    if (!message) {
      return res.status(400).json({ok:false,error:'Scrivi una domanda per Ape Pelù.'});
    }

    const q = message.toLowerCase();
    const asksDose = /(quante volte|quanto ne devo|quanto devo|dose|dosaggio|per quanto tempo|applicazioni al giorno|how often|how much|dosage|for how long|times? a day|wie oft|wie viel|dosierung|wie lange|combien de fois|quelle quantité|dosage|pendant combien de temps|cu[aá]ntas veces|cu[aá]nto debo|dosis|durante cu[aá]nto tiempo)/i.test(message);
    const asksDrugChange = /((smett|sospend|interromp).*(farmac|antinfiamm)|posso smettere.*(farmac|antinfiamm)|stop|quit|discontinue|suspend|absetzen|aufh[oö]ren|arr[eê]ter|suspendre|dejar|suspender).*(medic|drug|medicine|farmac|antinfiamm|entz[uü]nd|m[eé]dicament|medicamento)/i.test(message);
    const asksMedicalOutcome = /(cura|curare|artrosi|dolore|riduce il dolore|circolazione|antinfiammatorio|analgesico|patologia|sintomo|cure|treat|arthritis|pain|inflammation|anti-inflammatory|analgesic|disease|symptom|heil|arthrose|schmerz|entz[uü]nd|krankheit|symptom|gu[eé]rir|soigner|arthrose|douleur|inflammation|maladie|sympt[oô]me|curar|artrosis|dolor|inflamaci[oó]n|enfermedad|s[ií]ntoma)/i.test(message);
    const productContext = /(veleno|linea veleni|bee venom|bienengift|venin d['’]abeille|veneno de abeja|sos dol|apis\s*[12457]|prodotto|product|produkt|produit|producto|crema|cream|cr[eè]me|unguento|ointment|salbe|pommade|pomada|gommage|bagnodoccia)/i.test(message);

    if (productContext && (asksDose || asksDrugChange || asksMedicalOutcome)) {
      console.log('[Ape Pelù] Guardia non-medica attivata.');
      return res.json({
        ok:true,
        guarded:true,
        reply:({
          it:'Posso spiegarti la **Linea Veleni** solo dal punto di vista cosmetico e da massaggio. Non posso indicarti quantità, frequenza, durata d’uso per un problema fisico, né dirti di modificare o sospendere farmaci. Inoltre non presento il veleno d’api come cura per artrosi, dolore o altri problemi di salute.\n\nSe vuoi, posso invece spiegarti **quali prodotti della Linea Veleni sono realmente disponibili** e a quale uso cosmetico o da massaggio sono destinati, senza entrare in ambito medico.',
          en:'I can explain the **Bee Venom Line** only from a cosmetic and massage-use perspective. I cannot tell you amounts, frequency or duration of use for a physical problem, nor advise you to change or stop medicines. I also do not present bee venom as a cure for arthritis, pain or other health problems.\n\nIf you want, I can instead explain **which Bee Venom Line products are actually available** and what cosmetic or massage use they are intended for, without entering the medical field.',
          de:'Ich kann dir die **Bienengift-Linie** nur aus kosmetischer Sicht und für Massageanwendungen erklären. Ich kann keine Mengen, Häufigkeit oder Anwendungsdauer für körperliche Beschwerden angeben und auch nicht empfehlen, Medikamente zu ändern oder abzusetzen. Bienengift stelle ich außerdem nicht als Heilmittel gegen Arthrose, Schmerzen oder andere Gesundheitsprobleme dar.\n\nWenn du möchtest, kann ich dir stattdessen erklären, **welche Produkte der Bienengift-Linie tatsächlich verfügbar sind** und für welchen kosmetischen oder Massagegebrauch sie gedacht sind.',
          fr:'Je peux vous expliquer la **Ligne Venin d’Abeille** uniquement du point de vue cosmétique et de l’usage en massage. Je ne peux pas indiquer de quantité, de fréquence ou de durée d’utilisation pour un problème physique, ni conseiller de modifier ou d’arrêter des médicaments. Je ne présente pas non plus le venin d’abeille comme un remède contre l’arthrose, la douleur ou d’autres problèmes de santé.\n\nSi vous le souhaitez, je peux plutôt vous expliquer **quels produits de la Ligne Venin d’Abeille sont réellement disponibles** et à quel usage cosmétique ou de massage ils sont destinés.',
          es:'Puedo explicarte la **Línea Veneno de Abeja** únicamente desde el punto de vista cosmético y de uso en masaje. No puedo indicarte cantidades, frecuencia o duración de uso para un problema físico, ni decirte que cambies o suspendas medicamentos. Tampoco presento el veneno de abeja como una cura para la artrosis, el dolor u otros problemas de salud.\n\nSi quieres, puedo explicarte **qué productos de la Línea Veneno de Abeja están realmente disponibles** y para qué uso cosmético o de masaje están destinados, sin entrar en el ámbito médico.'
        })[requestedLanguage],
        action:getApeContextAction(message,'Linea Veleni',requestedLanguage)
      });
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
- Lingua del sito attiva: ${languageName}. Rispondi SEMPRE in questa lingua, salvo che l'utente chieda esplicitamente di usare un'altra lingua.
- Non cambiare lingua solo perché l'utente inserisce una singola parola straniera o un nome proprio.
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
- Nella V2 attuale i Mieli del Busatello da 250 g visibili sono: Miele Millefiori, Miele al Melone, Miele alla Fragola, Miele alla Pesca, Miele all'Arancia, ciascuno a €4,90 e 2 Punti Ape.
- Usa SEMPRE questi nomi ufficiali esatti in italiano: "Miele Millefiori", "Miele al Melone", "Miele alla Fragola", "Miele alla Pesca", "Miele all'Arancia". Non trasformarli in "Miele di Melone", "Miele di Fragola", "Miele di Pesca" o "Miele di Arancia".
- Non inventare prezzi, disponibilità, formati o condizioni commerciali non presenti in queste informazioni.
- CATALOGO V2 ATTUALE VINCOLANTE: oltre ai 5 Mieli del Busatello sopra indicati, le sole referenze presenti sono:\n${APE_V2_OFFICIAL_PRODUCTS.map(p=>'- '+p.name+' | '+p.size+' | €'+Number(p.price).toFixed(2).replace('.',',')+' | '+p.desc).join('\n')}
- Quando parli di una di queste referenze, usa almeno una volta il nome ufficiale esatto riportato nel catalogo: serve anche a collegare correttamente il pulsante diretto al prodotto.
- Quando l'utente chiede informazioni su una referenza dello shop, attieniti a nome, formato, prezzo e descrizione riportati in questo catalogo. Non dedurre benefici ulteriori dal nome del prodotto o dagli ingredienti.
- Non proporre come prodotto dello shop nessuna vecchia referenza legacy che non compare in questo elenco o nei 5 Mieli del Busatello.

COME INTERPRETARE LE DOMANDE
- Se una domanda è ambigua ("cosa scelgo a mezzanotte?"), interpretala prima nel contesto Fabbrica delle Api / prodotti dell'alveare / esperienza.
- Se la domanda è esplicitamente estranea ("che cravatta scelgo?"), dillo gentilmente e riporta l'utente al tuo ambito.
- Rispondi liberamente a domande generali su api e apicoltura anche se non c'entrano con lo shop: nemici delle api, comportamento, anatomia, volo, sonno, comunicazione, stagioni, predatori, parassiti, storia dell'apicoltura, api selvatiche, biodiversità, impollinazione, agricoltura, ruolo sociale ed economico.
- Quando spieghi un prodotto dell'alveare (miele, polline, propoli, pappa reale, cera, veleno d'api, Pane delle Api), se utile usa questo schema: cos'è -> a cosa serve alle api -> come viene usato dall'uomo.
- Quando l'utente chiede un dato attuale o numerico che può cambiare nel tempo e non è tra i dati certi forniti, NON inventare. Spiega che il dato va verificato su una fonte aggiornata.

BASE SCIENTIFICA VINCOLANTE SU ORIENTAMENTO E DANZA
- Le api da miele usano principalmente il sole, la luce polarizzata del cielo e punti di riferimento visivi per orientarsi.
- Non presentare vibrazioni o odori come principali strumenti di navigazione durante il volo.
- La danza di orientamento viene eseguita sul favo.
- La danza a otto contiene una corsa centrale vibrata (waggle run).
- Su un favo verticale, l'angolo della corsa vibrata rispetto alla verticale codifica la direzione della risorsa rispetto alla direzione del sole.
- La distanza della risorsa è collegata soprattutto alla durata della corsa vibrata: più dura, più lontana è la risorsa.
- Le api che ricevono l'informazione nella colonia percepiscono movimenti, vibrazioni, contatti e anche odori associati alla fonte.
- Gli odori possono aiutare a riconoscere il tipo di risorsa, ma non dire che una feromone "segna la strada" o mantiene una rotta fino al fiore.
- Evita formule antropomorfiche come "mappa della colonia" se non strettamente necessarie.
- Se hai un dubbio su un dettaglio di biologia delle api, preferisci una formulazione più prudente anziché completare con un dettaglio plausibile ma non certo.

ACCURATEZZA E ANTI-INVENZIONE
- Non inventare MAI nomi di enti, associazioni, università, prodotti, malattie, virus, studi, percentuali, numeri, prezzi, formati o caratteristiche.
- Se non sei sicura di un nome preciso, di un dato o di un fatto specialistico, dillo chiaramente e resta su informazioni generali affidabili.
- Non trasformare parole tecniche che non ricordi in nomi plausibili: meglio dire "non voglio rischiare di darti un nome sbagliato".
- Per dati attuali, statistiche, enti esistenti o situazioni nazionali, se non hai una fonte aggiornata nel contesto, evita elenchi dettagliati non verificati.
- Non presentare ipotesi o risultati preliminari di ricerca come benefici dimostrati per l'uomo.
- Non attribuire automaticamente proprietà come "stimola la circolazione", "antinfiammatorio", "antitumorale", "rigenerante", "detossinante" o simili a prodotti o ingredienti se non sono informazioni certe e appropriate.
- Non inventare prodotti della Fabbrica delle Api. Se il nome preciso del prodotto non è nel contesto certo, parla della categoria e chiedi se l'utente vuole vedere i prodotti realmente disponibili.
- Quando l'utente risponde solo "sì", usa il contesto immediatamente precedente e continua esattamente da lì.
- Per biologia, comportamento e apicoltura, privilegia formulazioni scientificamente corrette ma semplici. Non trasformare semplificazioni divulgative in fatti certi.
- Sulla danza delle api: descrivila come una danza a otto con una corsa centrale vibrata (waggle run), non come una "W".
- Non dire che le api "guardano" la danza come farebbe una persona: dentro l'alveare percepiscono movimenti, vibrazioni, contatti e odori.
- Per l'orientamento, presenta sole, luce polarizzata e punti di riferimento visivi come riferimenti principali; non mettere il vento sullo stesso piano se non è necessario.
- Evita frasi antropomorfiche forti come "la colonia costruisce una mappa interna" se non sono necessarie.

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
- La domanda finale deve nascere DIRETTAMENTE dal tema appena discusso, non cambiare argomento.
- Se hai parlato di orientamento, continua con orientamento, danza, distanza di volo o ritorno all'alveare; non saltare a predatori, prodotti o altri temi.
- Non usare una frase generica ripetitiva.
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
    const action=getApeContextAction(message,reply,requestedLanguage);
    return res.json({ok:true,reply,action});
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
app.get('/',sendPage('home.html'));app.get('/home',sendPage('home.html'));app.get('/centro',sendPage('centro.html'));app.get('/alveoterapia',sendPage('alveoterapia.html'));app.get('/bacheca',sendPage('bacheca.html'));app.get('/chi-siamo',sendPage('chi-siamo.html'));app.get('/contatti',sendPage('contatti.html'));app.get('/shop',sendPage('shop-v2.html'));app.get('/shop-v2',sendPage('shop-v2.html'));app.get('/shop.html',sendPage('shop-v2.html'));app.get('/index.html',sendPage('shop-v2.html'));app.get('/shop-legacy',(_req,res)=>res.status(410).type('text').send('Archivio shop legacy interno: accesso pubblico disattivato.'));app.use(express.static(__dirname));app.listen(PORT,'0.0.0.0',()=>console.log(`[Miele Artigianale] Server avviato sulla porta ${PORT}.`));