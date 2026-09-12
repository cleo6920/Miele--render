const fs = require('fs');
const path = require('path');

// Fonte unica e finale per le descrizioni pubbliche delle schede prodotto.
// Aggiorna tutte le occorrenze statiche e applica le descrizioni anche DOPO il merge Firestore.
try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const descriptions = {
    "capsule-pb": "Capsule monouso P+B dedicate ai diffusori per alveoterapia compatibili. La formulazione abbina propoli italiana al 95% e Boswellia Serrata al 5% ed è pensata per essere utilizzata esclusivamente con il dispositivo previsto. Ogni capsula si inserisce nel diffusore secondo le istruzioni dell’apparecchio e va sostituita dopo l’utilizzo previsto dal produttore. Conservare in luogo asciutto e lontano da fonti di calore.",
    "capsule-propolit": "Capsule monouso di propoli per diffusori PROPOLAIR/PROPOLIT compatibili. Sono pensate per un utilizzo semplice nel diffusore dedicato, senza dover preparare miscele o dosare manualmente il prodotto. La confezione contiene 5 capsule e consente di avere ricambi pronti all’uso. Utilizzare sempre secondo le istruzioni del proprio diffusore.",

    "millefiori": "Il Millefiori dell’Oasi del Busatello nasce dalla varietà di fioriture spontanee presenti nell’oasi. Ha un profilo aromatico armonico, con dolcezza equilibrata e profumi che possono variare naturalmente da raccolto a raccolto. È ottimo da gustare al cucchiaio, sul pane, nello yogurt o per dolcificare bevande e preparazioni. La naturale cristallizzazione è una caratteristica tipica del miele e non ne altera la qualità.",
    "melone": "Specialità al miele dal gusto dolce e fruttato, caratterizzata da note di melone piacevoli e immediate. È pensata per chi cerca un sapore originale da gustare al cucchiaio, sul pane, nello yogurt o in abbinamento a dessert e preparazioni fresche. Servita a temperatura ambiente sprigiona al meglio il suo profilo aromatico.",
    "fragola": "Specialità al miele dal gusto morbido e fruttato, con una nota di fragola ben riconoscibile. Si presta bene alla prima colazione, allo yogurt, ai formaggi freschi e alla preparazione di dolci semplici. Il sapore dolce e profumato la rende adatta anche come piccola degustazione al cucchiaio.",
    "pesca": "Specialità al miele dal profilo delicato e fruttato, con una nota di pesca morbida e piacevole. È ideale da provare su pane e fette biscottate, nello yogurt, con ricotta o formaggi freschi e come accompagnamento a dessert. Il gusto rotondo la rende facile da apprezzare anche da chi preferisce sapori non troppo intensi.",
    "arancia": "Specialità al miele dal carattere fresco e agrumato, con note di arancia che accompagnano la naturale dolcezza del miele. È piacevole a colazione, nello yogurt, su pane e biscotti oppure in abbinamento a dolci e formaggi freschi. Ottima anche per dare una nota aromatica a bevande tiepide e preparazioni da dessert.",
    "castagno": "Miele dal colore ambrato scuro, dal profumo deciso e dal gusto intenso, poco dolce e con una caratteristica nota leggermente amarognola. È apprezzato da chi cerca un miele dal sapore forte e persistente. Si abbina molto bene a formaggi stagionati, pane rustico e preparazioni dal gusto marcato. La cristallizzazione, quando presente, è un fenomeno naturale.",
    "acacia-zenzero-apinfiore": "Specialità alimentare a base di miele italiano di acacia e zenzero. Il miele di acacia offre una base dolce e delicata, mentre lo zenzero aggiunge una nota speziata e vivace. È piacevole da gustare al cucchiaio, sul pane, nello yogurt o come ingrediente per bevande e ricette dal profilo aromatico originale. Formato pratico da 200 g.",
    "miele-eucalipto-apinfiore": "Miele italiano di eucalipto dal profumo intenso e dal gusto aromatico, con caratteristiche note fresche e balsamiche. Ha una personalità più marcata rispetto ai mieli delicati ed è adatto a chi ama sapori decisi. Si può gustare al cucchiaio, sul pane, con formaggi oppure per dolcificare bevande calde senza portarle a temperature troppo elevate.",
    "balsammiel": "Specialità alimentare a base di miele italiano di eucalipto, pino mugo e menta. L’unione degli ingredienti crea un gusto intenso, fresco e aromatico, con una piacevole sensazione balsamica al palato. Si può gustare al cucchiaio oppure sciogliere in una bevanda tiepida. Conservare in luogo fresco e asciutto, al riparo da luce e fonti di calore.",
    "acacia": "Miele italiano di acacia dal colore molto chiaro, dal profumo delicato e dal gusto dolce e fine. Rimane generalmente liquido a lungo e per questo è particolarmente pratico da versare e dosare. È ideale a colazione, nello yogurt, sulle fette biscottate e per dolcificare bevande senza coprirne il sapore. Il formato da 40 g è comodo anche per assaggio o regalo.",
    "favo-integrale-bio": "Miele di acacia presentato direttamente nel favo, per un’esperienza di degustazione molto vicina al prodotto così come viene conservato dalle api. Il favo può essere tagliato in piccoli pezzi e masticato lentamente insieme al miele. È particolarmente adatto a degustazioni, taglieri e abbinamenti con formaggi. Conservare in luogo fresco e asciutto, lontano da fonti di calore.",
    "polline-italiano": "Polline italiano raccolto dalle api e selezionato come prodotto dell’alveare. Ha un gusto caratteristico e può essere consumato tal quale oppure aggiunto a yogurt, miele, frutta o altre preparazioni fredde. Per apprezzarne meglio aroma e consistenza è consigliabile iniziare con piccole quantità. Conservare secondo le indicazioni riportate sulla confezione.",
    "pappa-reale-italiana-bio": "Pappa reale fresca in formato da 10 g, prodotto dell’alveare dalla consistenza cremosa e dal gusto intenso e caratteristico. Si utilizza in piccole quantità, preferibilmente seguendo le indicazioni riportate sull’etichetta del prodotto. Per mantenerne al meglio le caratteristiche va conservata secondo le indicazioni del produttore, generalmente in frigorifero.",
    "orsetti-gommosi": "Morbide caramelle gommose dalla forma di orsetto, pensate come piccolo momento goloso. La consistenza morbida e il gusto dolce le rendono pratiche da condividere o portare con sé. Confezione da 80 g, adatta anche come idea regalo insieme ad altri prodotti della Fabbrica delle Api.",

    "bee-energy-bio": "Integratore alimentare biologico in pratici flaconcini monodose con miele italiano, pappa reale, polline, propoli, mirtillo, limone e rosmarino. Il formato da 10 ml è comodo da portare con sé e permette un utilizzo semplice senza dover dosare il prodotto. La confezione contiene 12 flaconcini. Utilizzare secondo le indicazioni riportate sull’etichetta e non superare la dose giornaliera consigliata.",
    "propol-active-bio": "Integratore in compresse masticabili a base di propoli italiana biologica al 20%. Ogni compressa da 500 mg contiene 100 mg di propoli e il formato masticabile rende l’assunzione pratica anche fuori casa. La confezione contiene 30 compresse. Utilizzare secondo le indicazioni riportate sull’etichetta e nell’ambito di una dieta varia ed equilibrata.",
    "propoli-30-spray-integratore": "Preparazione a base di propoli al 30% in soluzione alcolica con pratico erogatore spray reclinabile. Il beccuccio consente un’applicazione diretta e mirata, mentre il formato compatto è comodo da portare con sé. Agitare e utilizzare secondo le indicazioni riportate sulla confezione. Per la presenza di alcol, rispettare le avvertenze del produttore e tenere fuori dalla portata dei bambini.",
    "propoli-30-alcolica-integratore": "Estratto di propoli al 30% in soluzione alcolica con contagocce, formulato con propoli, alcol e acqua. Il contagocce consente di dosare il prodotto con precisione goccia a goccia. Secondo le indicazioni ufficiali Apinfiore, il prodotto per adulti può essere assunto in piccole quantità su miele, zucchero, pane o direttamente, seguendo il dosaggio riportato in etichetta. Non è adatto a bambini o a persone che non possono assumere alcol; in gravidanza o allattamento attenersi alle indicazioni del medico.",
    "propoli-analcolica-integratore": "Preparazione liquida a base di propoli senza alcol, proposta come alternativa pratica alle formulazioni alcoliche. Il contagocce permette un dosaggio preciso e rende semplice l’utilizzo secondo le indicazioni riportate sulla confezione. Il formato compatto è comodo da portare con sé. Conservare correttamente e rispettare sempre dose e avvertenze indicate dal produttore.",

    "cosmesi-crema-mani": "Crema mani formulata con propoli, cera d’api, echinacea e ingredienti emollienti. È pensata per mani secche o fragili e lascia la pelle più morbida e protetta senza una sensazione eccessivamente pesante. Si applica in piccola quantità massaggiando fino ad assorbimento, anche più volte durante la giornata secondo necessità. Formato da 100 ml.",
    "cosmesi-burrocacao-propoli-aloe": "Burrocacao cremoso con propoli e aloe vera, pensato per proteggere le labbra dagli effetti di vento, freddo e secchezza. La texture scorrevole aiuta a mantenere le labbra morbide e confortevoli. Si può applicare durante la giornata ogni volta che se ne sente la necessità. Stick pratico da 5 ml.",
    "cosmesi-burrocacao-miele-pappa-reale": "Burrocacao con miele e pappa reale, dalla consistenza cremosa e facile da applicare. È pensato per mantenere le labbra morbide, elastiche e protette dalla secchezza quotidiana. Si può utilizzare più volte al giorno secondo necessità. Stick compatto da 5 ml, comodo da tenere sempre con sé.",
    "cosmesi-shampoo-multivitaminico": "Shampoo multivitaminico formulato con proteine del frumento, rosmarino e pappa reale. È pensato per capelli fragili, stressati o spenti e deterge lasciando la fibra capillare più morbida e curata. Applicare sui capelli bagnati, massaggiare delicatamente cute e lunghezze e risciacquare con cura. Formato da 250 ml.",
    "cosmesi-saponetta-frutti-bosco": "Sapone vegetale con miele e frutti di bosco, adatto alla detersione quotidiana di mani e corpo. Produce una schiuma piacevole e lascia sulla pelle una profumazione fruttata. Utilizzare sulla pelle bagnata, massaggiare e risciacquare accuratamente. Lasciare asciugare la saponetta tra un utilizzo e l’altro.",
    "cosmesi-saponetta-lavanda": "Sapone vegetale con miele e lavanda, pensato per la detersione quotidiana di mani e corpo. Deterge delicatamente e lascia una profumazione caratteristica, fresca e floreale. Utilizzare sulla pelle bagnata e risciacquare con cura. Conservare la saponetta in un portasapone che permetta di asciugarla bene.",
    "cosmesi-saponetta-aloe-vera": "Sapone vegetale con miele e aloe vera, indicato per una detersione semplice e delicata di mani e corpo. La schiuma morbida lascia la pelle pulita e piacevole al tatto. Utilizzare sulla pelle bagnata, massaggiare e risciacquare accuratamente. Lasciare asciugare bene tra un utilizzo e l’altro.",
    "cosmesi-candela-alveare-cera-api": "Candela Alveare Grande realizzata artigianalmente in cera d’api, modellata nella caratteristica forma dell’alveare. La cera d’api ha un colore e un profumo naturali che possono presentare leggere variazioni da un esemplare all’altro. Secondo i dati Apinfiore misura circa 5 x 4 cm alla base, 6 cm in altezza e pesa circa 58 g. È adatta come piccolo elemento decorativo o idea regalo; durante l’accensione va sempre tenuta sotto sorveglianza e lontano da materiali infiammabili.",

    "tesori-limoncello": "Limoncello della linea I Tesori di Francesco, dal profilo fresco e intensamente agrumato. Nasce da un’infusione di scorze di limone selezionate per ottenere un gusto pieno, equilibrato e persistente. È piacevole servito ben fresco a fine pasto oppure come piccolo liquore da degustazione. La bottiglia da 250 ml è adatta anche come idea regalo.",
    "tesori-liquore-caffe": "Liquore al caffè della linea I Tesori di Francesco, dal gusto intenso e avvolgente. L’aroma del caffè si unisce alla dolcezza del liquore creando un profilo pieno e persistente. Si può servire fresco o a temperatura ambiente, da solo oppure in abbinamento a dessert. Formato da 250 ml.",
    "tesori-castagne-rum": "Castagne al rum della linea I Tesori di Francesco, una specialità dal gusto ricco in cui la dolcezza naturale delle castagne incontra le note aromatiche del rum. Sono pensate come prodotto da degustazione e si prestano bene a essere servite a fine pasto o insieme a dessert. Il formato compatto le rende adatte anche come idea regalo gastronomica."
  };

  function findObjectBoundsFrom(source, id, fromIndex) {
    const markers = [
      `id: \"${id}\"`, `id:\"${id}\"`, `id: '${id}'`, `id:'${id}'`,
      `\"id\": \"${id}\"`, `\"id\":\"${id}\"`
    ];
    let p = -1;
    for (const marker of markers) {
      const q = source.indexOf(marker, fromIndex);
      if (q !== -1 && (p === -1 || q < p)) p = q;
    }
    if (p < 0) return null;
    const start = source.lastIndexOf('{', p);
    if (start < 0) return null;
    let depth = 0, quote = null, escaped = false;
    for (let i = start; i < source.length; i++) {
      const ch = source[i];
      if (quote) {
        if (escaped) escaped = false;
        else if (ch === '\\') escaped = true;
        else if (ch === quote) quote = null;
        continue;
      }
      if (ch === '\"' || ch === "'" || ch === '`') { quote = ch; continue; }
      if (ch === '{') depth++;
      else if (ch === '}' && --depth === 0) return { start, end: i + 1 };
    }
    return null;
  }

  function updateAllStaticOccurrences(source, id, description) {
    let cursor = 0;
    let count = 0;
    while (cursor < source.length) {
      const bounds = findObjectBoundsFrom(source, id, cursor);
      if (!bounds) break;
      const block = source.slice(bounds.start, bounds.end);
      const next = block.replace(/([\"']?description[\"']?\s*:\s*)(\"(?:\\.|[^\"\\])*\"|'(?:\\.|[^'\\])*')/, `$1${JSON.stringify(description)}`);
      if (next !== block) {
        source = source.slice(0, bounds.start) + next + source.slice(bounds.end);
        cursor = bounds.start + next.length;
        count++;
      } else {
        cursor = bounds.end;
      }
    }
    return { source, count };
  }

  let updated = 0;
  for (const [id, description] of Object.entries(descriptions)) {
    const result = updateAllStaticOccurrences(html, id, description);
    html = result.source;
    updated += result.count;
  }

  // Elimina esplicitamente la vecchia frase del Castagno ovunque fosse rimasta come testo legacy.
  html = html.replaceAll(
    'Dal sapore intenso e leggermente amaro, ricco di proprietà benefiche.',
    descriptions.castagno
  );

  // La descrizione finale deve prevalere anche sui dati caricati da Firestore.
  const filteredNeedle = '                        const filtered = brochureReadyProducts.filter(p => allowedCategoriesForShop.includes(p.category));';
  if (!html.includes('const brochureDescriptionOverrides =')) {
    if (!html.includes(filteredNeedle)) {
      throw new Error('Punto finale dopo merge Firestore non trovato per le descrizioni');
    }
    const runtimeBlock = `                        const brochureDescriptionOverrides = ${JSON.stringify(descriptions)};\n                        const descriptionReadyProducts = brochureReadyProducts.map(p => brochureDescriptionOverrides[p.id] ? { ...p, description: brochureDescriptionOverrides[p.id] } : p);\n                        const filtered = descriptionReadyProducts.filter(p => allowedCategoriesForShop.includes(p.category));`;
    html = html.replace(filteredNeedle, runtimeBlock);
  }

  if (!html.includes('brochureDescriptionOverrides')) {
    throw new Error('Override runtime descrizioni non installato');
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log(`[Miele Artigianale] Descrizioni definitive applicate: ${updated} occorrenze statiche + override post-Firestore.`);
} catch (error) {
  console.error('[Miele Artigianale] Errore arricchimento descrizioni:', error);
  process.exitCode = 1;
}
