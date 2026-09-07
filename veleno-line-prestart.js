const fs = require('fs');
const path = require('path');

// Linea Benessere – Veleno d’Api.
// Fonte autoritativa: report vetrina aggiornato fornito dall'utente.
// Mantiene esattamente 6 referenze; APIS3 è intenzionalmente escluso.
try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const exclusiveBadge = 'ESCLUSIVA';
  const category = 'veleno-api';

  const products = [
    {
      id: 'unguento-apis',
      name: 'SOS DOL – Unguento al Veleno d’Api – 15 ml',
      description: "Unguento da massaggio formulato con veleno d’api, cera d’api e oli essenziali.<br/><br/>È pensato per il massaggio delle zone soggette a tensione e affaticamento, lasciando una piacevole sensazione di sollievo e benessere.<br/><br/><strong>È importante sapere che il veleno d’api viene utilizzato qui all’interno di una formulazione cosmetica specifica per il massaggio.</strong>",
      image: '/images/veleno-sos-dol.jpg',
      packs: [{ id: 'unguento-apis-1', label: '1 confezione – 15 ml', jars: 1, price: 29.90 }],
      inStock: true,
      stock: 3,
      order: 4001,
      category,
      exclusiveBadge,
      reportData: {
        supplier: 'APINFIORE',
        requestedQuantity: 3,
        netCost: 4.41,
        vatPercent: 22,
        costVatIncluded: 5.38,
        salePrice: 29.90,
        costStatus: 'Costo netto scontato; costo IVA compresa circa €5,38'
      }
    },
    {
      id: 'apis1-crema-viso-veleno-api',
      name: 'Crema Viso al Veleno d’Api – 50 ml – APIS1',
      description: "Crema viso anti-age formulata con veleno d’api, pensata per viso, collo e décolleté.<br/><br/>Aiuta a mantenere la pelle idratata, tonica ed elastica, contribuendo a un aspetto più compatto e curato.<br/><br/><strong>È importante sapere che il veleno d’api è inserito in una formulazione cosmetica specifica per la cura della pelle.</strong>",
      image: 'https://www.apinfiore.com/wp-content/uploads/2023/03/Crema-Viso-al-Veleno-dApi_web-41.jpg.webp',
      packs: [{ id: 'apis1-1', label: '1 confezione – 50 ml', jars: 1, price: 39.90 }],
      inStock: true,
      stock: 1,
      order: 4002,
      category,
      exclusiveBadge,
      reportData: {
        supplier: 'APINFIORE',
        requestedQuantity: 1,
        netCost: 13.15,
        vatPercent: 22,
        costVatIncluded: 16.04,
        salePrice: 39.90,
        costStatus: 'Costo catalogo; richiesto eventuale sconto rivenditore del 10%'
      }
    },
    {
      id: 'apis2-siero-viso-veleno-api',
      name: 'Siero Viso al Veleno d’Api – 30 ml – APIS2',
      description: "Siero viso anti-age ad effetto lifting, formulato con veleno d’api.<br/><br/>Tra gli ingredienti caratterizzanti contiene soprattutto prodotti dell’alveare: veleno d’api, polline e miele, associati ad acido ialuronico, olio di borragine, olio di germe di grano, collagene idrolizzato e vitamina E.<br/><br/>Aiuta a idratare, levigare e tonificare la pelle, contribuendo a un aspetto più disteso e compatto.<br/><br/><strong>È importante sapere che riunisce in un unico trattamento tre elementi dell’alveare: veleno d’api, polline e miele.</strong>",
      image: '/images/veleno-apis2.jpg',
      packs: [{ id: 'apis2-1', label: '1 confezione – 30 ml', jars: 1, price: 34.90 }],
      inStock: true,
      stock: 1,
      order: 4003,
      category,
      exclusiveBadge,
      reportData: {
        supplier: 'APINFIORE',
        requestedQuantity: 1,
        netCost: 10.15,
        vatPercent: 22,
        costVatIncluded: 12.38,
        salePrice: 34.90,
        costStatus: 'Costo catalogo; richiesto eventuale sconto rivenditore del 10%'
      }
    },
    {
      id: 'apis4-crema-corpo-veleno-api-manuka',
      name: 'Crema Corpo Veleno d’Api e Miele di Manuka – 250 ml – APIS4',
      description: "Crema corpo formulata con veleno d’api e miele di Manuka, pensata per idratare e prendersi cura della pelle.<br/><br/>Aiuta a mantenere la pelle tonica, elastica e compatta, lasciandola più morbida e nutrita.<br/><br/><strong>È importante sapere che unisce due ingredienti caratteristici dell’alveare in una formulazione cosmetica specifica per il corpo.</strong><br/><br/><span style='display:block;padding:12px;border-radius:10px;background:#fffbeb;border:2px solid #f59e0b;color:#78350f;font-weight:800;'><strong>Sapevate che...</strong> La Manuka (Leptospermum scoparium) è un arbusto originario della Nuova Zelanda e dell’Australia sud-orientale. Dai suoi fiori le api producono il famoso miele di Manuka, caratterizzato dalla presenza di particolari composti naturali, tra cui il metilgliossale (MGO). È uno dei mieli più studiati al mondo per le sue proprietà biologiche, in particolare per l’attività antimicrobica e antiossidante.</span>",
      image: '/images/veleno-apis4.jpg',
      packs: [{ id: 'apis4-1', label: '1 confezione – 250 ml', jars: 1, price: 31.90 }],
      inStock: true,
      stock: 1,
      order: 4004,
      category,
      exclusiveBadge,
      reportData: {
        supplier: 'APINFIORE',
        requestedQuantity: 1,
        netCost: 9.00,
        vatPercent: 22,
        costVatIncluded: 10.98,
        salePrice: 31.90,
        costStatus: 'Costo catalogo; richiesto eventuale sconto rivenditore del 10%'
      }
    },
    {
      id: 'apis5-gommage-veleno-api-manuka',
      name: 'Gommage Viso e Corpo Veleno d’Api e Miele di Manuka – 250 ml – APIS5',
      description: "Trattamento esfoliante delicato per viso e corpo formulato con veleno d’api e miele di Manuka.<br/><br/>Aiuta a rimuovere le cellule superficiali della pelle, favorendone il rinnovamento e lasciandola più liscia, morbida e luminosa.<br/><br/><strong>È importante sapere che il gommage prepara la pelle ai successivi trattamenti cosmetici, migliorandone la sensazione di pulizia e levigatezza.</strong><br/><br/><span style='display:block;padding:12px;border-radius:10px;background:#fffbeb;border:2px solid #f59e0b;color:#78350f;font-weight:800;'><strong>SAPEVATE CHE... IL MIELE DI MANUKA DERIVA DAI FIORI DELLA PIANTA DI MANUKA, ORIGINARIA SOPRATTUTTO DELLA NUOVA ZELANDA, ED È CONOSCIUTO PER LA PRESENZA NATURALE DI COMPOSTI CARATTERISTICI COME IL METILGLIOSSALe (MGO).</strong></span>",
      image: '/images/veleno-apis5.jpg',
      packs: [{ id: 'apis5-1', label: '1 confezione – 250 ml', jars: 1, price: 34.90 }],
      inStock: true,
      stock: 1,
      order: 4005,
      category,
      exclusiveBadge,
      reportData: {
        supplier: 'APINFIORE',
        requestedQuantity: 1,
        netCost: 11.00,
        vatPercent: 22,
        costVatIncluded: 13.42,
        salePrice: 34.90,
        costStatus: 'Costo catalogo; richiesto eventuale sconto rivenditore del 10%'
      }
    },
    {
      id: 'bagnodoccia-veleno-oro',
      name: 'Bagnodoccia Veleno d’Oro – 250 ml – APIS7',
      description: "Bagnodoccia formulato con veleno d’api e miele di Manuka, pensato per detergere delicatamente la pelle durante la doccia.<br/><br/>La formulazione unisce l’azione detergente alla presenza di ingredienti caratteristici dell’alveare, lasciando la pelle pulita, morbida e piacevolmente curata.<br/><br/><strong>È importante sapere che associa il veleno d’api al miele di Manuka all’interno di un prodotto cosmetico per l’uso quotidiano.</strong><br/><br/><span style='display:block;padding:12px;border-radius:10px;background:#fffbeb;border:2px solid #f59e0b;color:#78350f;font-weight:800;'><strong>SAPEVATE CHE... IL MIELE DI MANUKA È CONSIDERATO UNO DEI MIELI PIÙ PARTICOLARI AL MONDO? VIENE PRODOTTO SOLO DOVE CRESCE LA PIANTA DI MANUKA E LA SUA QUALITÀ VIENE SPESSO IDENTIFICATA ANCHE ATTRAVERSO IL LIVELLO DI MGO, UNO DEI COMPOSTI NATURALMENTE PRESENTI CHE CONTRIBUISCE A RENDERLO CARATTERISTICO E UNICO.</strong></span>",
      image: '/images/veleno-apis7.jpg',
      packs: [{ id: 'bvo1', label: '1 confezione – 250 ml', jars: 1, price: 14.90 }],
      inStock: true,
      stock: 3,
      order: 4006,
      category,
      exclusiveBadge,
      reportData: {
        supplier: 'APINFIORE',
        requestedQuantity: 3,
        netCost: 6.30,
        vatPercent: 22,
        costVatIncluded: 7.69,
        salePrice: 14.90,
        costStatus: 'Costo netto scontato; costo IVA compresa circa €7,69'
      }
    }
  ];

  const productIds = products.map(p => p.id);

  function findObjectBounds(source, id) {
    const markers = [`id: \"${id}\"`, `id: '${id}'`, `\"id\": \"${id}\"`];
    let p = -1;
    for (const marker of markers) {
      const q = source.indexOf(marker);
      if (q !== -1 && (p === -1 || q < p)) p = q;
    }
    if (p < 0) return null;
    let start = source.lastIndexOf('{', p);
    if (start < 0) return null;
    let depth = 0;
    let quote = null;
    let escaped = false;
    for (let i = start; i < source.length; i++) {
      const ch = source[i];
      if (quote) {
        if (escaped) escaped = false;
        else if (ch === '\\') escaped = true;
        else if (ch === quote) quote = null;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
      if (ch === '{') depth++;
      else if (ch === '}' && --depth === 0) return { start, end: i + 1 };
    }
    return null;
  }

  function removeAllProductObjects(source, id) {
    let guard = 0;
    while (guard++ < 20) {
      const bounds = findObjectBounds(source, id);
      if (!bounds) break;
      let start = bounds.start;
      let end = bounds.end;
      while (end < source.length && /\s/.test(source[end])) end++;
      if (source[end] === ',') end++;
      else {
        let before = start - 1;
        while (before >= 0 && /\s/.test(source[before])) before--;
        if (source[before] === ',') start = before;
      }
      source = source.slice(0, start) + source.slice(end);
    }
    return source;
  }

  // Elimina eventuali versioni vecchie dei sei prodotti e inserisce il blocco aggiornato
  // in ogni definizione statica del catalogo presente nel file.
  for (const id of productIds) html = removeAllProductObjects(html, id);

  const staticAnchor = 'const staticInitialProducts = [';
  const serializedProducts = products.map(p => JSON.stringify(p, null, 2)).join(',\n');
  if (html.includes(staticAnchor)) {
    html = html.replaceAll(staticAnchor, `${staticAnchor}\n${serializedProducts},`);
  } else {
    throw new Error('Catalogo staticInitialProducts non trovato');
  }

  // Dopo il merge con Firestore, nome/descrizione/prezzo/formato/categoria della linea
  // restano quelli del report; stock e disponibilità reali già presenti vengono preservati.
  const mergeTail = '                        updatedProducts.forEach(fp => {';
  const authoritativeData = JSON.stringify(products);
  const authoritativeMerge = `                        const authoritativeVelenoProducts = ${authoritativeData};\n                        authoritativeVelenoProducts.forEach((authoritativeProduct) => {\n                            const idx = mergedProducts.findIndex(p => p.id === authoritativeProduct.id);\n                            if (idx === -1) {\n                                mergedProducts.push(authoritativeProduct);\n                                return;\n                            }\n                            const current = mergedProducts[idx];\n                            mergedProducts[idx] = {\n                                ...current,\n                                ...authoritativeProduct,\n                                stock: Number.isFinite(current.stock) ? current.stock : authoritativeProduct.stock,\n                                inStock: typeof current.inStock === 'boolean' ? current.inStock : authoritativeProduct.inStock\n                            };\n                        });\n`;
  if (html.includes(mergeTail) && !html.includes('const authoritativeVelenoProducts =')) {
    html = html.replaceAll(mergeTail, authoritativeMerge + mergeTail);
  }

  // Il renderer della Linea Veleno d'Api deve mostrare tutte e sole le 6 referenze del report.
  const allVelenoIds = "['unguento-apis','apis1-crema-viso-veleno-api','apis2-siero-viso-veleno-api','apis4-crema-corpo-veleno-api-manuka','apis5-gommage-veleno-api-manuka','bagnodoccia-veleno-oro']";
  html = html.replaceAll("['unguento-apis','bagnodoccia-veleno-oro'].includes(p.id)", `${allVelenoIds}.includes(p.id)`);

  // Testo introduttivo aggiornato alla linea completa.
  html = html.replaceAll(
    'Una linea distintiva dedicata al veleno d’api. Qui trovi i prodotti della linea già presenti nel catalogo, con accesso diretto alle rispettive schede prodotto.',
    'La LINEA BENESSERE – VELENO D’API comprende 6 prodotti esclusivi. Apri ogni scheda per consultare descrizione completa e prezzo della selezione aggiornata.'
  );

  // Badge ESCLUSIVA ad alto impatto su ogni card della categoria, senza toccare le altre card.
  const imageNeedle = `                    <img\n                        src={product.image}`;
  const badgeBlock = `                    {product.category === 'veleno-api' && (\n                        <span className=\"absolute top-3 left-3 z-20 rounded-full bg-amber-500 px-3 py-1 text-xs font-black tracking-[0.12em] text-stone-950 shadow-xl ring-2 ring-white/70 uppercase\">ESCLUSIVA</span>\n                    )}\n                    <img\n                        src={product.image}`;
  if (html.includes(imageNeedle) && !html.includes("product.category === 'veleno-api' && (")) {
    html = html.replaceAll(imageNeedle, badgeBlock);
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Linea Benessere Veleno d’Api completa: 6 prodotti autoritativi, prezzi/report completi e badge ESCLUSIVA.');
} catch (error) {
  console.error('[Miele Artigianale] Errore Linea Benessere Veleno d’Api:', error);
  throw error;
}