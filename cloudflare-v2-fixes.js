(function(){
'use strict';
const SUPPORTED=['it','en','de','fr','es'];
function lang(){
  try{
    const v=String(localStorage.getItem('fda-site-language')||'it').toLowerCase();
    return SUPPORTED.includes(v)?v:'it';
  }catch(_){return'it';}
}
const T={
  it:{
    bannerTitle:'Il tuo Saldo Punti Ape ti accompagna in tutta la Bottega.',
    bannerText:'Ogni prodotto con il simbolo 🐝 aggiunge punti al tuo saldo. A 100 Punti Ape puoi comporre un cesto omaggio con 5 prodotti a scelta.',
    bannerCta:'Controlla il mio Saldo Punti Ape →',
    dlOk:'Download avviato · +1 Punto Ape accreditato.',
    dlPending:'Download avviato · +1 Punto Ape registrato per la sincronizzazione.',
    code:'Il tuo Codice Punti Ape è:',
    keep:'Conservalo: ti servirà per controllare il saldo senza email o telefono.',
    memo:'Scarica promemoria PDF',
    balance:'Controlla il saldo',
    contact:'Potrai ritrovare il saldo con l’email o il telefono che hai indicato.',
    again:'Scarica di nuovo'
  },
  en:{
    bannerTitle:'Your Bee Points Balance follows you throughout the Shop.',
    bannerText:'Every product marked 🐝 adds points to your balance. At 100 Bee Points you can build a free gift basket with 5 products of your choice.',
    bannerCta:'Check my Bee Points Balance →',
    dlOk:'Download started · +1 Bee Point credited.',
    dlPending:'Download started · +1 Bee Point recorded for synchronization.',
    code:'Your Bee Points Code is:',
    keep:'Keep it: you will need it to check your balance without an email or phone number.',
    memo:'Download PDF reminder',
    balance:'Check balance',
    contact:'You can retrieve your balance with the email or phone number you provided.',
    again:'Download again'
  },
  de:{
    bannerTitle:'Dein Bienenpunkte-Saldo begleitet dich durch den gesamten Shop.',
    bannerText:'Jedes mit 🐝 gekennzeichnete Produkt erhöht deinen Punktestand. Mit 100 Bienenpunkten kannst du einen kostenlosen Geschenkkorb mit 5 Produkten deiner Wahl zusammenstellen.',
    bannerCta:'Meinen Bienenpunkte-Saldo prüfen →',
    dlOk:'Download gestartet · +1 Bienenpunkt gutgeschrieben.',
    dlPending:'Download gestartet · +1 Bienenpunkt zur Synchronisierung vorgemerkt.',
    code:'Dein Bienenpunkte-Code lautet:',
    keep:'Bewahre ihn auf: Du brauchst ihn, um deinen Saldo ohne E-Mail oder Telefonnummer zu prüfen.',
    memo:'PDF-Erinnerung herunterladen',
    balance:'Saldo prüfen',
    contact:'Du kannst deinen Saldo mit der angegebenen E-Mail-Adresse oder Telefonnummer wiederfinden.',
    again:'Erneut herunterladen'
  },
  fr:{
    bannerTitle:'Votre solde de Points Abeille vous accompagne dans toute la Boutique.',
    bannerText:'Chaque produit marqué 🐝 ajoute des points à votre solde. À 100 Points Abeille, vous pouvez composer un panier cadeau gratuit avec 5 produits au choix.',
    bannerCta:'Consulter mon solde de Points Abeille →',
    dlOk:'Téléchargement lancé · +1 Point Abeille crédité.',
    dlPending:'Téléchargement lancé · +1 Point Abeille enregistré pour synchronisation.',
    code:'Votre Code Points Abeille est :',
    keep:'Conservez-le : il vous servira à consulter votre solde sans e-mail ni téléphone.',
    memo:'Télécharger le mémo PDF',
    balance:'Consulter le solde',
    contact:'Vous pourrez retrouver votre solde avec l’e-mail ou le téléphone indiqué.',
    again:'Télécharger à nouveau'
  },
  es:{
    bannerTitle:'Tu Saldo de Puntos Abeja te acompaña por toda la Tienda.',
    bannerText:'Cada producto marcado con 🐝 suma puntos a tu saldo. Al llegar a 100 Puntos Abeja puedes componer una cesta regalo gratuita con 5 productos a elegir.',
    bannerCta:'Consultar mi Saldo de Puntos Abeja →',
    dlOk:'Descarga iniciada · +1 Punto Abeja acreditado.',
    dlPending:'Descarga iniciada · +1 Punto Abeja registrado para sincronización.',
    code:'Tu Código de Puntos Abeja es:',
    keep:'Consérvalo: lo necesitarás para consultar el saldo sin correo electrónico ni teléfono.',
    memo:'Descargar recordatorio PDF',
    balance:'Consultar el saldo',
    contact:'Podrás recuperar tu saldo con el correo electrónico o el teléfono que hayas indicado.',
    again:'Descargar de nuevo'
  }
};
function tx(){return T[lang()]||T.it;}

function addBanner(){
  if(document.getElementById('cf-punti-ape-banner'))return;
  const anchor=document.getElementById('mieli');
  if(!anchor)return;
  const s=document.createElement('section');
  s.id='cf-punti-ape-banner';
  s.innerHTML='<div class="cf-punti-wrap"><div class="cf-punti-bee">🐝</div><div class="cf-punti-copy"><strong></strong><p></p></div><a href="/punti-ape"></a></div>';
  const style=document.createElement('style');
  style.textContent='#cf-punti-ape-banner{padding:18px 0 30px;background:#fffaf1}#cf-punti-ape-banner .cf-punti-wrap{width:min(1200px,calc(100% - 36px));margin:auto;background:linear-gradient(135deg,#ffe58d,#efbd36);border:1px solid #d9a51f;border-radius:26px;padding:22px 24px;display:grid;grid-template-columns:auto 1fr auto;gap:18px;align-items:center;box-shadow:0 12px 30px rgba(105,72,0,.12)}.cf-punti-bee{font-size:38px}.cf-punti-copy strong{display:block;font:900 25px/1.08 Georgia,serif;color:#2e260d}.cf-punti-copy p{margin:7px 0 0;color:#594718;font-weight:700;line-height:1.45}.cf-punti-wrap a{background:#12382b;color:#fff!important;text-decoration:none!important;border-radius:999px;padding:12px 16px;font-weight:950;white-space:nowrap}@media(max-width:760px){#cf-punti-ape-banner .cf-punti-wrap{grid-template-columns:auto 1fr}.cf-punti-wrap a{grid-column:1/-1;text-align:center}.cf-punti-copy strong{font-size:21px}}';
  document.head.appendChild(style);
  anchor.parentNode.insertBefore(s,anchor);
  updateBanner();
}
function updateBanner(){
  const b=document.getElementById('cf-punti-ape-banner');if(!b)return;
  const t=tx();b.querySelector('strong').textContent=t.bannerTitle;b.querySelector('p').textContent=t.bannerText;b.querySelector('a').textContent=t.bannerCta;
}

function forceLanguageInputs(){
  const l=lang();
  for(const id of ['freeLanguage','apiDirectLanguage']){
    const el=document.getElementById(id);
    if(el && !el.value) el.value=l;
  }
}
function forcePreviewImages(){
  const l=lang();
  const groups=[
    ['#apiOggiPreviewPages img','/images/api-oggi-01-preview-', ['copertina','premessa','api-da-vicino','territorio','galena'],'.webp?v=cf-lang-2'],
    ['#api-direct-preview-pages img','/images/api-oggi-01-preview-', ['copertina','premessa','api-da-vicino','territorio','galena'],'.webp?v=cf-lang-2'],
    ['#alveoShopPreviewPages img','/images/alveo-preview-', ['copertina','indice','introduzione','colazione1-ricetta','colazione1-varianti'],'.webp?v=cf-lang-2'],
    ['#alveo-preview-pages img','/images/alveo-preview-', ['copertina','indice','introduzione','colazione1-ricetta','colazione1-varianti'],'.webp?v=cf-lang-2']
  ];
  groups.forEach(([sel,prefix,names,suffix])=>{
    document.querySelectorAll(sel).forEach((img,i)=>{if(names[i])img.src=prefix+l+'-'+names[i]+suffix;});
  });
}

function localizeWalletResult(root){
  const box=(root&&root.matches&&root.matches('.free-wallet-result,.api-wallet-result'))?root:(root&&root.querySelector?root.querySelector('.free-wallet-result,.api-wallet-result'):null);
  if(!box)return;
  const t=tx();
  const codeMatch=(box.textContent||'').match(/APE-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{2}/i);
  const code=codeMatch?codeMatch[0]:'';
  const pending=/sincronizzazione|synchron/i.test(box.textContent||'');
  const links=Array.from(box.querySelectorAll('a'));
  const memoHref=links[0]?.getAttribute('href')||'';
  const balanceHref=links.find(a=>(a.getAttribute('href')||'').includes('/punti-ape'))?.getAttribute('href')||'/punti-ape';
  if(code){
    box.innerHTML='<strong>'+(pending?t.dlPending:t.dlOk)+'</strong><br><br>🔐 '+t.code+'<br><strong style="font-size:20px">'+code+'</strong><br>'+t.keep+'<br>'+
      (memoHref?'<a href="'+memoHref+'">'+t.memo+'</a>':'')+'<a class="alt" href="'+balanceHref+'">'+t.balance+'</a>';
  }else{
    box.innerHTML='<strong>'+(pending?t.dlPending:t.dlOk)+'</strong><br>'+t.contact+'<br><a href="'+balanceHref+'">'+t.balance+'</a>';
  }
  const again=document.getElementById('freeEditionDownload')||document.getElementById('api-direct-download-start');
  if(again)again.textContent=t.again;
}

function scan(root){
  forceLanguageInputs();
  forcePreviewImages();
  if(root) localizeWalletResult(root);
  document.querySelectorAll('.free-wallet-result,.api-wallet-result').forEach(localizeWalletResult);
}

function localizeDigitalUi(){
  const l=lang();
  if(l==='it')return;
  const D={
    en:{
      open:'OPEN EDITIONS', free:'FREE', downloadTitle:'Download for free',
      freeBook:'The world of bees today · Number 01', premiumBook:'10 Breakfasts from the Hive',
      freeDesc:'A new free Alveo Digitale release: 30 pages about bees, the local area, the Busatello Oasis and Galena delle Api. Browse 5 real preview pages and download the complete PDF for free in the language selected on the site.',
      freeTag:'The world of bees today · Number 01 · Open Edition',
      freePoints:'🐝 +1 Bee Point on download', pages30:'30 pages', look5:'👁 View 5 pages', downloadFree:'Download for free →',
      previewTitle:'The world of bees today · Number 01 · Preview', previewIntro:'Five real pages from the free Open Edition.',
      previewLabels:['Cover','Foreword','A closer look at bees','Bees and the local area','Galena delle Api'],
      previewNote:'Open Edition · Complete 30-page PDF · free download.',
      close:'Close ✕', back:'← Back', next:'Next →',
      isFree:'is free. No payment is required.', remains:'The download remains free.', future:'To find your Bee Point again in the future, you have two simple options.',
      chooseLang:'Choose the PDF language', autoLang:'If you do not choose one, we will automatically use the current site language.',
      langNote:'This choice only affects the PDF and does not change the site language.',
      easy:'📧📱 Easier', easyText:'Leave your <b>email or phone number</b>: you can check your balance using that contact.',
      noContact:'🔐 Without contact details', noContactText:'Leave email and phone blank: after the download you will receive a <b>personal Bee Points Code</b> and a PDF reminder.',
      name:'Full name', optional:'optional', email:'Email', phone:'Phone',
      pointReal:'🐝 +1 Bee Point only when you actually start the download.',
      start:'Download for free and get 1 Bee Point →', noCost:'No cost. No required data.',
      premiumTag:'Recipes & ideas · Premium Edition',
      premiumDesc:'An illustrated digital magazine to browse and reuse: 10 complete recipes, 20 quick ideas, a planner, shopping list, quiz and a small honey-tasting experience. Available in Italian, English, German, French and Spanish; after payment, the version matching the language selected on the site is offered.',
      premiumPreview:'👁 Browse preview', buy:'Open the product page and buy →',
      premiumPreviewTitle:'10 Breakfasts from the Hive · Preview',
      premiumPreviewIntro:'Browse five real pages: cover, contents, introduction and the complete Breakfast 1.',
      premiumLabels:['Cover','Contents','Introduction','Breakfast 1 · Recipe','Breakfast 1 · Variations and ideas'],
      premiumNote:'Partial preview · 5 real pages. The complete 37-page PDF is available after purchase.'
    },
    de:{
      open:'OFFENE AUSGABEN', free:'GRATIS', downloadTitle:'Kostenlos herunterladen',
      freeBook:'Die Welt der Bienen heute · Ausgabe 01', premiumBook:'10 Frühstücke aus dem Bienenstock',
      freeDesc:'Eine neue kostenlose Ausgabe von Alveo Digitale: 30 Seiten über Bienen, das Gebiet, die Oase Busatello und Galena delle Api. Sie können 5 echte Vorschauseiten ansehen und das vollständige PDF kostenlos in der auf der Website gewählten Sprache herunterladen.',
      freeTag:'Die Welt der Bienen heute · Ausgabe 01 · Offene Ausgabe',
      freePoints:'🐝 +1 Bienenpunkt beim Download', pages30:'30 Seiten', look5:'👁 5 Seiten ansehen', downloadFree:'Kostenlos herunterladen →',
      previewTitle:'Die Welt der Bienen heute · Ausgabe 01 · Vorschau', previewIntro:'Fünf echte Seiten der kostenlosen Offenen Ausgabe.',
      previewLabels:['Titelseite','Vorwort','Bienen aus der Nähe','Bienen und das Gebiet','Galena delle Api'],
      previewNote:'Offene Ausgabe · Vollständiges PDF mit 30 Seiten · kostenloser Download.',
      close:'Schließen ✕', back:'← Zurück', next:'Weiter →',
      isFree:'ist kostenlos. Es ist keine Zahlung erforderlich.', remains:'Der Download bleibt kostenlos.', future:'Um Ihren Bienenpunkt später wiederzufinden, haben Sie zwei einfache Möglichkeiten.',
      chooseLang:'Sprache des PDFs wählen', autoLang:'Wenn Sie nichts auswählen, verwenden wir automatisch die aktuelle Sprache der Website.',
      langNote:'Diese Auswahl betrifft nur das PDF und ändert die Sprache der Website nicht.',
      easy:'📧📱 Am einfachsten', easyText:'Hinterlassen Sie <b>E-Mail oder Telefonnummer</b>: Damit können Sie Ihren Punktestand prüfen.',
      noContact:'🔐 Ohne Kontaktdaten', noContactText:'Lassen Sie E-Mail und Telefonnummer leer: Nach dem Download erhalten Sie einen <b>persönlichen Bienenpunkte-Code</b> und eine PDF-Erinnerung.',
      name:'Vor- und Nachname', optional:'optional', email:'E-Mail', phone:'Telefon',
      pointReal:'🐝 +1 Bienenpunkt nur, wenn Sie den Download wirklich starten.',
      start:'Kostenlos herunterladen und 1 Bienenpunkt erhalten →', noCost:'Kostenlos. Keine Pflichtangaben.',
      premiumTag:'Rezepte & Ideen · Premium-Ausgabe',
      premiumDesc:'Ein illustriertes digitales Magazin zum Nachschlagen und Wiederverwenden: 10 vollständige Rezepte, 20 schnelle Ideen, Planer, Einkaufsliste, Quiz und eine kleine Honigverkostung. Verfügbar auf Italienisch, Englisch, Deutsch, Französisch und Spanisch; nach der Zahlung wird die Version in der auf der Website gewählten Sprache angeboten.',
      premiumPreview:'👁 Vorschau ansehen', buy:'Produktseite öffnen und kaufen →',
      premiumPreviewTitle:'10 Frühstücke aus dem Bienenstock · Vorschau',
      premiumPreviewIntro:'Sehen Sie fünf echte Seiten: Titelseite, Inhalt, Einführung und das vollständige Frühstück 1.',
      premiumLabels:['Titelseite','Inhalt','Einführung','Frühstück 1 · Rezept','Frühstück 1 · Varianten und Ideen'],
      premiumNote:'Teilvorschau · 5 echte Seiten. Das vollständige 37-seitige PDF ist nach dem Kauf verfügbar.'
    },
    fr:{
      open:'ÉDITIONS OUVERTES', free:'GRATUIT', downloadTitle:'Télécharger gratuitement',
      freeBook:'Le monde des abeilles aujourd’hui · Numéro 01', premiumBook:'10 Petits-déjeuners de la Ruche',
      freeDesc:'Une nouvelle édition gratuite d’Alveo Digitale : 30 pages consacrées aux abeilles, au territoire, à l’Oasis du Busatello et à Galena delle Api. Consultez 5 vraies pages d’aperçu et téléchargez gratuitement le PDF complet dans la langue choisie sur le site.',
      freeTag:'Le monde des abeilles aujourd’hui · Numéro 01 · Édition Ouverte',
      freePoints:'🐝 +1 Point Abeille au téléchargement', pages30:'30 pages', look5:'👁 Voir 5 pages', downloadFree:'Télécharger gratuitement →',
      previewTitle:'Le monde des abeilles aujourd’hui · Numéro 01 · Aperçu', previewIntro:'Cinq vraies pages de l’Édition Ouverte gratuite.',
      previewLabels:['Couverture','Préface','Les abeilles de près','Abeilles et territoire','Galena delle Api'],
      previewNote:'Édition Ouverte · PDF complet de 30 pages · téléchargement gratuit.',
      close:'Fermer ✕', back:'← Retour', next:'Suivant →',
      isFree:'est gratuit. Aucun paiement n’est nécessaire.', remains:'Le téléchargement reste gratuit.', future:'Pour retrouver votre Point Abeille plus tard, deux options simples sont possibles.',
      chooseLang:'Choisissez la langue du PDF', autoLang:'Si vous ne choisissez rien, nous utiliserons automatiquement la langue actuelle du site.',
      langNote:'Ce choix concerne uniquement le PDF et ne change pas la langue du site.',
      easy:'📧📱 Le plus simple', easyText:'Laissez votre <b>e-mail ou numéro de téléphone</b> : vous pourrez consulter votre solde avec ce contact.',
      noContact:'🔐 Sans coordonnées', noContactText:'Laissez e-mail et téléphone vides : après le téléchargement, vous recevrez un <b>Code Points Abeille personnel</b> et un mémo PDF.',
      name:'Nom et prénom', optional:'facultatif', email:'E-mail', phone:'Téléphone',
      pointReal:'🐝 +1 Point Abeille uniquement lorsque vous lancez réellement le téléchargement.',
      start:'Télécharger gratuitement et obtenir 1 Point Abeille →', noCost:'Gratuit. Aucune donnée obligatoire.',
      premiumTag:'Recettes & idées · Édition Premium',
      premiumDesc:'Un magazine numérique illustré à consulter et réutiliser : 10 recettes complètes, 20 idées express, un planning, une liste de courses, un quiz et une petite dégustation de miels. Disponible en italien, anglais, allemand, français et espagnol ; après le paiement, la version correspondant à la langue choisie sur le site est proposée.',
      premiumPreview:'👁 Feuilleter l’aperçu', buy:'Ouvrir la fiche et acheter →',
      premiumPreviewTitle:'10 Petits-déjeuners de la Ruche · Aperçu',
      premiumPreviewIntro:'Feuilletez cinq vraies pages : couverture, sommaire, introduction et le Petit-déjeuner 1 complet.',
      premiumLabels:['Couverture','Sommaire','Introduction','Petit-déjeuner 1 · Recette','Petit-déjeuner 1 · Variantes et idées'],
      premiumNote:'Aperçu partiel · 5 vraies pages. Le PDF complet de 37 pages est disponible après l’achat.'
    },
    es:{
      open:'EDICIONES ABIERTAS', free:'GRATIS', downloadTitle:'Descargar gratis',
      freeBook:'El mundo de las abejas hoy · Número 01', premiumBook:'10 Desayunos de la Colmena',
      freeDesc:'Una nueva edición gratuita de Alveo Digitale: 30 páginas dedicadas a las abejas, al territorio, al Oasis del Busatello y a Galena delle Api. Puedes consultar 5 páginas reales de vista previa y descargar gratis el PDF completo en el idioma elegido en el sitio.',
      freeTag:'El mundo de las abejas hoy · Número 01 · Edición Abierta',
      freePoints:'🐝 +1 Punto Abeja al descargar', pages30:'30 páginas', look5:'👁 Ver 5 páginas', downloadFree:'Descargar gratis →',
      previewTitle:'El mundo de las abejas hoy · Número 01 · Vista previa', previewIntro:'Cinco páginas reales de la Edición Abierta gratuita.',
      previewLabels:['Portada','Introducción','Las abejas de cerca','Abejas y territorio','Galena delle Api'],
      previewNote:'Edición Abierta · PDF completo de 30 páginas · descarga gratuita.',
      close:'Cerrar ✕', back:'← Atrás', next:'Siguiente →',
      isFree:'es gratuito. No hace falta ningún pago.', remains:'La descarga sigue siendo gratuita.', future:'Para recuperar tu Punto Abeja en el futuro, tienes dos opciones sencillas.',
      chooseLang:'Elige el idioma del PDF', autoLang:'Si no eliges nada, utilizaremos automáticamente el idioma actual del sitio.',
      langNote:'Esta elección afecta solo al PDF y no cambia el idioma del sitio.',
      easy:'📧📱 Más sencillo', easyText:'Deja tu <b>correo electrónico o teléfono</b>: podrás consultar el saldo usando ese contacto.',
      noContact:'🔐 Sin datos de contacto', noContactText:'Deja correo y teléfono vacíos: después de la descarga recibirás un <b>Código Puntos Abeja personal</b> y un recordatorio PDF.',
      name:'Nombre y apellidos', optional:'opcional', email:'Correo electrónico', phone:'Teléfono',
      pointReal:'🐝 +1 Punto Abeja solo cuando inicies realmente la descarga.',
      start:'Descargar gratis y obtener 1 Punto Abeja →', noCost:'Sin coste. Ningún dato obligatorio.',
      premiumTag:'Recetas e ideas · Edición Premium',
      premiumDesc:'Una revista digital ilustrada para consultar y reutilizar: 10 recetas completas, 20 ideas rápidas, planificador, lista de la compra, quiz y una pequeña degustación de mieles. Está disponible en italiano, inglés, alemán, francés y español; después del pago se ofrece la versión correspondiente al idioma elegido en el sitio.',
      premiumPreview:'👁 Ver vista previa', buy:'Abrir la ficha y comprar →',
      premiumPreviewTitle:'10 Desayunos de la Colmena · Vista previa',
      premiumPreviewIntro:'Explora cinco páginas reales: portada, índice, introducción y el Desayuno 1 completo.',
      premiumLabels:['Portada','Índice','Introducción','Desayuno 1 · Receta','Desayuno 1 · Variantes e ideas'],
      premiumNote:'Vista previa parcial · 5 páginas reales. El PDF completo de 37 páginas está disponible después de la compra.'
    }
  }[l];
  if(!D)return;

  const setText=(sel,val)=>{const el=document.querySelector(sel);if(el&&val!=null)el.textContent=val;};
  const setHtml=(sel,val)=>{const el=document.querySelector(sel);if(el&&val!=null)el.innerHTML=val;};

  // Alveo Digitale cards.
  const cards=document.querySelectorAll('#contenuti article.product');
  if(cards[0]){
    setText('#contenuti article.product:nth-of-type(1) .tag',D.freeTag);
    setText('#contenuti article.product:nth-of-type(1) h3',D.freeBook);
    setText('#contenuti article.product:nth-of-type(1) p',D.freeDesc);
    const meta=cards[0].querySelectorAll('.meta span');
    if(meta[0])meta[0].textContent=D.free;if(meta[1])meta[1].textContent=D.freePoints;if(meta[2])meta[2].textContent=D.pages30;
    const btns=cards[0].querySelectorAll('.actions button,.actions a');if(btns[0])btns[0].textContent=D.look5;if(btns[1])btns[1].textContent=D.downloadFree;
  }
  if(cards[1]){
    setText('#contenuti article.product:nth-of-type(2) .tag',D.premiumTag);
    setText('#contenuti article.product:nth-of-type(2) h3',D.premiumBook);
    setText('#contenuti article.product:nth-of-type(2) p',D.premiumDesc);
    const btns=cards[1].querySelectorAll('.actions button,.actions a');if(btns[0])btns[0].textContent=D.premiumPreview;if(btns[1])btns[1].textContent=D.buy;
  }

  // Free preview.
  setText('#api-direct-preview-head strong',D.previewTitle);
  setText('#api-direct-preview-close',D.close);
  const prevIntro=document.querySelector('#api-direct-preview-head + div');if(prevIntro)prevIntro.textContent=D.previewIntro;
  document.querySelectorAll('#api-direct-preview-pages .api-direct-preview-page span').forEach((el,i)=>{if(D.previewLabels[i])el.textContent=D.previewLabels[i];});
  setText('#api-direct-preview-prev',D.back);setText('#api-direct-preview-next',D.next);setText('#api-direct-preview-note',D.previewNote);

  // Free download modal.
  const modal=document.querySelector('#api-direct-download-modal');
  if(modal){
    setText('#api-direct-download-modal .eyebrow','ALVEO DIGITALE · '+D.open);
    setText('#api-direct-download-modal h2',D.downloadTitle);
    setHtml('#api-direct-download-modal > p','<strong>'+D.freeBook+'</strong> '+D.isFree);
    setHtml('#api-direct-download-modal .api-direct-download-info','<strong>'+D.remains+'</strong> '+D.future);
    setText('#api-direct-download-modal .api-direct-language-box h3',D.chooseLang);
    setText('#api-direct-download-modal .api-direct-language-box > p',D.autoLang);
    setText('#apiDirectLanguageNote',D.langNote);
    const opts=modal.querySelectorAll('.api-wallet-option');
    if(opts[0])opts[0].innerHTML='<strong>'+D.easy+'</strong>'+D.easyText;
    if(opts[1])opts[1].innerHTML='<strong>'+D.noContact+'</strong>'+D.noContactText;
    const labels=modal.querySelectorAll('.api-direct-download-form label');
    const names=[D.name,D.email,D.phone];
    labels.forEach((label,i)=>{const input=label.querySelector('input');const span=label.querySelector('span');if(label.firstChild)label.firstChild.nodeValue=names[i]+' ';if(span)span.textContent=D.optional;if(input)label.appendChild(input);});
    const pointBox=[...modal.querySelectorAll('div')].find(el=>(el.textContent||'').includes('+1 Punto Ape solo quando'));if(pointBox)pointBox.textContent=D.pointReal;
    setText('#api-direct-download-start',D.start);
    const small=modal.querySelector(':scope > small');if(small)small.textContent=D.noCost;
  }

  // Premium preview.
  setText('#alveo-preview-head strong',D.premiumPreviewTitle);setText('#alveo-preview-close',D.close);setText('#alveo-preview-intro',D.premiumPreviewIntro);
  document.querySelectorAll('#alveo-preview-pages .alveo-preview-page span').forEach((el,i)=>{if(D.premiumLabels[i])el.textContent=D.premiumLabels[i];});
  setText('#alveo-preview-prev',D.back);setText('#alveo-preview-next',D.next);setText('#alveo-preview-note',D.premiumNote);

  // Same preview widgets when opened from the shop.
  setText('#apiOggiPreviewHead strong',D.previewTitle);setText('#apiOggiPreviewClose',D.close);setText('#apiOggiPreviewIntro',D.previewIntro);
  document.querySelectorAll('#apiOggiPreviewPages .api-oggi-preview-page span').forEach((el,i)=>{if(D.previewLabels[i])el.textContent=D.previewLabels[i];});
  setText('#apiOggiPreviewPrev',D.back);setText('#apiOggiPreviewNext',D.next);setText('#apiOggiPreviewNote',D.previewNote);
  setText('#alveoShopPreviewHead strong',D.premiumPreviewTitle);setText('#alveoShopPreviewClose',D.close);setText('#alveoShopPreviewIntro',D.premiumPreviewIntro);
  document.querySelectorAll('#alveoShopPreviewPages .alveo-shop-preview-page span').forEach((el,i)=>{if(D.premiumLabels[i])el.textContent=D.premiumLabels[i];});
  setText('#alveoShopPreviewPrev',D.back);setText('#alveoShopPreviewNext',D.next);setText('#alveoShopPreviewNote',D.premiumNote);
}

function init(){
  addBanner();updateBanner();scan(document.body);localizeDigitalUi();
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-api-oggi-preview],#productDetailApiOggiPreview,#openApiOggiDirectPreview,#openAlveoPreview,[data-alveo-shop-preview],#productDetailAlveoPreview,#openFreeEditionModal,#openApiOggiDirectDownload')){
      setTimeout(()=>{forceLanguageInputs();forcePreviewImages();localizeDigitalUi();},0);
      setTimeout(()=>{forceLanguageInputs();forcePreviewImages();localizeDigitalUi();},180);
    }
  },true);
  const obs=new MutationObserver(ms=>{
    for(const m of ms)for(const n of m.addedNodes||[])if(n.nodeType===1)scan(n);
  });
  obs.observe(document.body,{subtree:true,childList:true});
  setInterval(()=>{updateBanner();forceLanguageInputs();forcePreviewImages();localizeDigitalUi();document.querySelectorAll('.free-wallet-result,.api-wallet-result').forEach(localizeWalletResult);},500);
}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init,{once:true}):init();
})();