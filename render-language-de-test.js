(function(){
  'use strict';

  const STORAGE_KEY='fda-render-language';
  const LANG_IT='it';
  const LANG_DE='de';
  let currentLang=LANG_IT;
  let busy=false;
  let syncTimer=null;
  const originalText=new WeakMap();
  const translatedNodes=new Set();
  let italianPreviewHtml=null;

  const DE_TEXT={
    '← Home Centro':'← Startseite Zentrum',
    'Le linee della Fabbrica delle Api':'Die Produktlinien der Fabbrica delle Api',
    'Tutte le linee':'Alle Produktlinien',
    'Mieli del Busatello':'Honig aus dem Busatello',
    'Linea Alimenti':'Lebensmittel-Linie',
    'Linea Integratori':'Nahrungsergänzung',
    'Linea Cosmesi e Tesori in Cera d’Api':'Kosmetik und Schätze aus Bienenwachs',
    'I Tesori di Francesco':'Francescos Spezialitäten',
    'I Tris dell’Alveare':'Bienenstock-Dreier-Sets',
    'Linea Cosmetica al Veleno d’Api':'Kosmetiklinie mit Bienengift',
    'Linea Benessere Veleno d’Api':'Bienengift-Wellnesslinie',
    'NOVITÀ ASSOLUTA!':'ABSOLUTE NEUHEIT!',
    'Carrello':'Warenkorb',
    'Scegli il formato:':'Format wählen:',
    '➕ Aggiungi al carrello':'➕ In den Warenkorb',
    'Non Disponibile':'Nicht verfügbar',
    'Esaurito / Stock Insuff.':'Ausverkauft / Bestand nicht ausreichend',
    'Contatti:':'Kontakt:',
    'ALVEO DIGITALE':'ALVEO DIGITAL',
    'Ricette, video e idee regalo da usare subito':'Rezepte, Videos und digitale Geschenkideen - sofort nutzbar',
    'Ricette, video e idee regalo digitali da scegliere, acquistare e ricevere subito dopo il pagamento.':'Digitale Rezepte, Videos und Geschenkideen auswählen, kaufen und direkt nach dem Bezahlvorgang erhalten.',
    'Scopri Alveo Digitale':'Alveo Digital entdecken',
    'Ricette, video e regali digitali':'Digitale Rezepte, Videos und Geschenke',
    'Scegli quello che ti piace. Guarda un esempio. Quando l’acquisto sarà attivo, dopo il pagamento potrai aprire subito il contenuto. Nessun pacco da aspettare.':'Wähle, was dir gefällt, sieh dir ein Beispiel an und öffne den digitalen Inhalt direkt nach dem Kauf. Kein Paket, auf das du warten musst.',
    '← Torna alle linee':'← Zurück zu den Produktlinien',
    'Ricetta digitale':'Digitales Rezept',
    '10 Colazioni dell’Alveare':'10 Frühstücke aus dem Bienenstock',
    'Dieci idee semplici con i nostri mieli, da aprire e leggere subito.':'Zehn einfache Ideen mit unseren Honigen - direkt öffnen und lesen.',
    '👁 Sfoglia anteprima':'👁 Vorschau ansehen',
    'Acquista PDF':'PDF kaufen (Test)',
    'Video narrato':'Erzähltes Video',
    'Un Momento nell’Alveare':'Ein Moment im Bienenstock',
    'Un breve racconto visivo e narrato. Durata di prova: circa 30 secondi.':'Eine kurze visuelle und erzählte Geschichte. Testdauer: etwa 30 Sekunden.',
    'Guarda esempio':'Beispiel ansehen',
    'Regalo digitale':'Digitales Geschenk',
    'Regala l’Alveare':'Verschenke den Bienenstock',
    'Una dedica e un piccolo contenuto digitale da inviare a chi vuoi.':'Eine persönliche Widmung und ein kleiner digitaler Inhalt zum Versenden.',
    'Esempio':'Beispiel',
    'Questa è solo una prova grafica su Render: l’acquisto non è ancora attivo.':'Dies ist nur ein grafischer Test auf Render.',
    'Come funziona':'So funktioniert es',
    '1. Scegli':'1. Auswählen',
    '2. Acquista':'2. Kaufen',
    '3. Apri subito':'3. Sofort öffnen',
    'Prodotto digitale · nessuna spedizione':'Digitales Produkt · kein Versand',
    'Consegna prevista entro 5–6 giorni • Spedizione gratuita per ordini da €200 in su':'Voraussichtliche Lieferung in 5–6 Tagen • Kostenloser Versand ab 200 €'
  };

  const PREVIEW_DE=
    '<div class="alveo-preview-page alveo-de-sheet alveo-active-page" data-de-page="1"><div class="de-cover"><div class="de-kicker">ALVEO DIGITAL · DEUTSCHE DEMO</div><div class="de-title">10 FRÜHSTÜCKE<br>AUS DEM BIENENSTOCK</div><div class="de-gold">ZEHN MORGEN. ZEHN KLEINE GENUSSMOMENTE.</div><p>Ein kleines Magazin zum Kochen, Blättern und jeden Morgen neu Entdecken.</p><div class="de-grid"><b>10 VOLLSTÄNDIGE REZEPTE</b><b>20 SCHNELLE IDEEN</b><b>WOCHENPLANER UND EINKAUFSLISTE</b><b>QUIZ UND HONIGVERKOSTUNG</b></div><small>RENDER-TEST · 5 SEITEN</small></div><span>Cover</span></div>'+
    '<div class="alveo-preview-page alveo-de-sheet" data-de-page="2"><div class="de-paper"><div class="de-kicker gold">DER WEG DURCH DEN RATGEBER</div><h2>Was dich erwartet</h2><p>Rezepte, praktische Hilfen, Honigwissen und schnelle Ideen.</p><div class="de-index"><div><b>01 · DIE 10 FRÜHSTÜCKE</b><p>01 Joghurt, Obst und Blütenhonig</p><p>02 Brot, Ricotta und Akazienhonig</p><p>03 Apfel-Kastanien-Porridge</p><p>04 Bananen-Pancakes mit Orangenhonig</p><p>05 Knuspriges Honig-Granola</p></div><div><b>02 · ORGANISIERE DEINE MORGEN</b><p>Wochenplaner</p><p>Einkaufsliste</p><b>03 · ENTDECKE DEINEN HONIG</b><p>Quiz · Verkostung · Geschmackspass</p><b>04 · 20 SCHNELLE IDEEN</b></div></div></div><span>Inhalt</span></div>'+
    '<div class="alveo-preview-page alveo-de-sheet" data-de-page="3"><div class="de-section"><div class="de-big">01</div><div class="de-line"></div><h2>Die 10 Frühstücke</h2><p>Zehn vollständige Rezepte. Jedes Frühstück wird auf der nächsten Seite mit Varianten und praktischen Tipps fortgesetzt.</p></div><span>Die 10 Frühstücke</span></div>'+
    '<div class="alveo-preview-page alveo-de-sheet" data-de-page="4"><div class="de-paper recipe"><div class="de-kicker gold">FRÜHSTÜCK 01 · REZEPT</div><h2>Joghurt, Obst und Blütenhonig</h2><p>Frisch, farbenfroh und in wenigen Minuten fertig.</p><div class="de-stats"><b>ZEIT<br><em>5 Minuten</em></b><b>SCHWIERIGKEIT<br><em>Sehr einfach</em></b><b>FÜR<br><em>1 Person</em></b></div><div class="de-index"><div><b>DU BRAUCHST</b><p>150 g Naturjoghurt</p><p>100 g Obst der Saison</p><p>2 EL Haferflocken</p><p>1 TL Blütenhonig</p></div><div><b>SO GEHT’S</b><p><strong>01</strong> Joghurt in eine Schüssel geben.</p><p><strong>02</strong> Obst und Haferflocken dazugeben.</p><p><strong>03</strong> Kurz vor dem Servieren mit Honig verfeinern.</p></div></div><div class="de-honey"><b>EMPFOHLENER HONIG · Blütenhonig</b><br>Mild und ausgewogen: verbindet Joghurt, Getreide und Obst.</div></div><span>Erstes vollständiges Rezept</span></div>'+
    '<div class="alveo-preview-page alveo-de-sheet" data-de-page="5"><div class="de-paper recipe"><div class="de-kicker gold">FRÜHSTÜCK 01 · VARIANTEN UND IDEEN</div><h2>Mach es noch mehr zu deinem</h2><h3>DREI VARIANTEN</h3><p><strong>01 Pfirsich</strong><br>Pfirsichwürfel und ein wenig Blütenhonig.</p><p><strong>02 Beeren</strong><br>Heidelbeeren, Himbeeren oder Erdbeeren.</p><p><strong>03 Apfel und Zimt</strong><br>Dünne Apfelscheiben, Zimt und geröstete Haferflocken.</p><h3>VORBEREITEN</h3><p><strong>Am Vorabend vorbereiten:</strong> Obst abends waschen und schneiden. Getreide und Honig getrennt aufbewahren.</p><div class="de-note"><b>MEINE VARIANTE</b><br><br>________________________________<br><br>________________________________</div></div><span>Varianten und Ideen</span></div>';

  function addStyle(){
    if(document.getElementById('fda-render-language-style')) return;
    const style=document.createElement('style');
    style.id='fda-render-language-style';
    style.textContent=
      '#fda-language-test{display:flex;align-items:center;gap:8px;margin-left:auto;padding:5px 7px;border:1px solid rgba(245,190,65,.65);border-radius:999px;background:#111;color:#fff;font:800 12px/1 system-ui,sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.25)}'+
      '#fda-language-test select{border:0;border-radius:999px;background:#f2b83f;color:#171717;padding:7px 9px;font-weight:900;outline:none}'+
      '#fda-language-test.fallback{position:fixed;right:10px;top:10px;z-index:1000001;margin:0}'+
      '.alveo-lang-points{display:inline-flex;margin-top:8px;border:1px solid rgba(250,204,21,.5);background:rgba(113,63,18,.35);color:#fde68a;border-radius:999px;padding:6px 10px;font-size:12px;font-weight:950}'+
      '.alveo-de-sheet{font-family:Arial,Helvetica,sans-serif!important}'+
      '.alveo-de-sheet>div{box-sizing:border-box;width:100%;aspect-ratio:210/297;border-radius:8px;overflow:hidden;text-align:left}'+
      '.de-cover{background:#0d493a;color:#fff;padding:8%;display:flex;flex-direction:column;justify-content:center}.de-cover .de-title{font-family:Georgia,serif;font-size:clamp(30px,6vw,62px);font-weight:900;line-height:1.02;margin:8% 0 4%}.de-cover .de-gold,.gold{color:#e0a018;font-weight:900}.de-cover p{font-size:clamp(14px,2vw,22px);line-height:1.45}.de-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:10%;padding-top:5%;border-top:1px solid rgba(255,255,255,.35);font-size:clamp(12px,1.8vw,19px)}.de-cover small{margin-top:auto}'+
      '.de-paper{background:#f8f1e2;color:#19251f;padding:7%;height:100%}.de-paper h2{font-family:Georgia,serif;color:#0d493a;font-size:clamp(28px,5vw,52px);margin:2% 0 4%}.de-paper h3{color:#0d493a;border-top:2px solid #d99a12;padding-top:3%;margin-top:5%}.de-kicker{font-weight:950;letter-spacing:.06em}.de-index{display:grid;grid-template-columns:1fr 1fr;gap:5%;margin-top:7%;font-size:clamp(12px,1.8vw,18px)}.de-index p{margin:10px 0}.de-section{height:100%;padding:9%;background:linear-gradient(135deg,#74410e,#2f1b08);color:white;display:flex;flex-direction:column;justify-content:center}.de-big{font:400 clamp(90px,20vw,190px)/.9 Georgia,serif;color:#e8b33a}.de-line{width:35%;border-top:4px solid #e8b33a;margin:4% 0}.de-section h2{font:900 clamp(36px,7vw,74px)/1.05 Georgia,serif;margin:0 0 4%}.de-section p{font-size:clamp(15px,2.3vw,24px);line-height:1.5;max-width:90%}.de-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:3%;border-bottom:2px solid #d99a12;padding:4% 0}.de-stats b{color:#d99a12}.de-stats em{font-style:normal;color:#19251f}.de-honey{margin:7% -7% -7%;padding:4% 7%;background:#0d493a;color:#fff}.de-note{margin-top:7%;padding:4%;border:1px solid #ead08d;border-radius:12px;background:#fff0bd}'+
      '@media(max-width:760px){#fda-language-test{font-size:11px}.de-index{grid-template-columns:1fr}.alveo-de-sheet>div{min-height:72vh;aspect-ratio:auto}.de-grid{grid-template-columns:1fr}.de-cover .de-title{font-size:34px}}';
    document.head.appendChild(style);
  }

  function ensureSelector(){
    addStyle();
    let box=document.getElementById('fda-language-test');
    if(!box){
      box=document.createElement('div');
      box.id='fda-language-test';
      box.innerHTML='<span>🌐 Lingua / Sprache</span><select id="fda-language-select" aria-label="Lingua del sito"><option value="it">🇮🇹 Italiano</option><option value="de">🇩🇪 Deutsch</option></select>';
      const bar=document.getElementById('center-home-bar');
      if(bar) bar.appendChild(box);
      else { box.classList.add('fallback'); document.body.appendChild(box); }
      box.querySelector('select').addEventListener('change',function(){applyLanguage(this.value);});
    }else{
      const bar=document.getElementById('center-home-bar');
      if(bar && box.parentElement!==bar){box.classList.remove('fallback');bar.appendChild(box);}
    }
    const sel=document.getElementById('fda-language-select');
    if(sel) sel.value=currentLang;
  }

  function translateTree(root){
    if(!root) return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    let node;
    while((node=walker.nextNode())){
      const raw=node.nodeValue;
      const trimmed=String(raw||'').trim();
      if(!trimmed || !DE_TEXT[trimmed]) continue;
      if(!originalText.has(node)) originalText.set(node,raw);
      const lead=(raw.match(/^\s*/)||[''])[0];
      const trail=(raw.match(/\s*$/)||[''])[0];
      node.nodeValue=lead+DE_TEXT[trimmed]+trail;
      translatedNodes.add(node);
    }
  }

  function restoreItalian(){
    translatedNodes.forEach(function(node){
      if(node && originalText.has(node)) node.nodeValue=originalText.get(node);
    });
    translatedNodes.clear();
  }

  function firstAlveoArticle(){
    const panel=document.getElementById('alveo-digitale-inline-panel');
    if(!panel) return null;
    return Array.from(panel.querySelectorAll('article')).find(function(a){
      return /10 Colazioni|10 Frühstücke/i.test(a.textContent||'');
    })||null;
  }

  function syncProductFacts(){
    const article=firstAlveoArticle();
    if(!article) return;
    const title=article.querySelector('h3');
    if(title) title.textContent=currentLang===LANG_DE?'10 Frühstücke aus dem Bienenstock':'10 Colazioni dell’Alveare';
    const desc=article.querySelector('p');
    if(desc) desc.textContent=currentLang===LANG_DE
      ?'Deutsche Sprachdemo: fünf Beispielseiten. Die endgültige deutsche Ausgabe wird erst nach Freigabe des Tests erstellt.'
      :'37 pagine con 10 ricette complete, 20 idee lampo, planner, lista della spesa, quiz e degustazione dei mieli.';
    const price=Array.from(article.querySelectorAll('div')).find(function(el){return /^€\s*[234][,.]90$/.test(String(el.textContent||'').trim());});
    if(price) price.textContent='€4,90';
    let badge=article.querySelector('.alveo-lang-points');
    if(!badge){
      badge=document.createElement('div');
      badge.className='alveo-lang-points';
      const button=article.querySelector('[data-alveo-preview-open], [data-alveo-buy="colazioni"]');
      if(button && button.parentElement) button.parentElement.insertBefore(badge,button);
      else article.appendChild(badge);
    }
    badge.textContent=currentLang===LANG_DE?'🐝 2 Bienenpunkte':'🐝 2 Punti Ape';
    const buy=article.querySelector('[data-alveo-buy="colazioni"]');
    if(buy) buy.textContent=currentLang===LANG_DE?'PDF kaufen (Test)':'Acquista PDF';
    const preview=article.querySelector('[data-alveo-preview-open]');
    if(preview && preview.tagName==='BUTTON' && preview.textContent.trim()) preview.textContent=currentLang===LANG_DE?'👁 Vorschau ansehen':'👁 Sfoglia anteprima';
  }

  function syncPurchaseModal(){
    const overlay=document.getElementById('alveo-sim-overlay');
    if(!overlay) return;
    const eyebrow=overlay.querySelector('#alveo-sim-head .eyebrow');
    const title=document.getElementById('alveo-sim-title');
    const product=document.querySelector('#alveo-sim-product strong');
    const price=document.querySelector('#alveo-sim-product span');
    const notice=document.getElementById('alveo-sim-notice');
    const label=overlay.querySelector('label[for="alveo-sim-email"]');
    const pay=document.getElementById('alveo-sim-card');
    const processing=document.getElementById('alveo-sim-processing');
    const close=document.getElementById('alveo-sim-close');
    const successTitle=document.querySelector('#alveo-sim-success h4');
    const successText=document.querySelector('#alveo-sim-success p');
    const download=document.getElementById('alveo-sim-download');
    const closeSuccess=document.getElementById('alveo-sim-close-success');

    if(download && !download.dataset.itHref) download.dataset.itHref=download.getAttribute('href')||'';

    if(price) price.textContent='€4,90';
    if(currentLang===LANG_DE){
      if(eyebrow) eyebrow.textContent='ALVEO DIGITAL · RENDER-TEST';
      if(title) title.textContent='Kauf simulieren';
      if(product) product.textContent='10 Frühstücke aus dem Bienenstock - deutsche Demo (5 Seiten)';
      if(notice) notice.textContent='🧪 Technischer Test auf Render. Es wird kein echter Betrag belastet. Nach der Simulation wird die deutsche PDF-Demo angeboten.';
      if(label) label.textContent='E-Mail für den Test';
      if(pay && !pay.disabled) pay.textContent='💳 Karte · Zahlung simulieren';
      if(processing) processing.textContent='Simulierter Kauf läuft...';
      if(close) close.textContent='Abbrechen und zurück zu den Produkten';
      if(successTitle) successTitle.textContent='Simulierter Kauf abgeschlossen';
      if(successText) successText.textContent='Es wurde keine echte Zahlung ausgeführt. Die deutsche Testversion steht bereit.';
      if(download){
        download.href='/downloads/10-fruehstuecke-bienenstock-demo-de.pdf';
        download.setAttribute('download','10-Fruehstuecke-aus-dem-Bienenstock-DEMO.pdf');
        download.textContent='⬇ Deutsche PDF-Demo herunterladen';
      }
      if(closeSuccess) closeSuccess.textContent='Schließen';
    }else{
      if(eyebrow) eyebrow.textContent='ALVEO DIGITALE · PROVA RENDER';
      if(title) title.textContent="Simula l'acquisto";
      if(product) product.textContent="10 Colazioni dell'Alveare - Edizione Premium · 37 pagine";
      if(notice) notice.textContent='🧪 Questa è una simulazione solo su Render. Nessun importo verrà addebitato e non devi inserire dati reali della carta.';
      if(label) label.textContent='Email per la prova';
      if(pay && !pay.disabled) pay.textContent='💳 Carta · Simula pagamento';
      if(processing) processing.textContent='Acquisto simulato in corso...';
      if(close) close.textContent='Annulla e torna ai prodotti';
      if(successTitle) successTitle.textContent='Acquisto simulato completato';
      if(successText) successText.textContent='Nessun pagamento reale è stato eseguito. Il prodotto digitale è pronto.';
      if(download){
        if(download.dataset.itHref) download.href=download.dataset.itHref;
        download.removeAttribute('download');
        download.textContent='⬇ Scarica il prodotto';
      }
      if(closeSuccess) closeSuccess.textContent='Chiudi';
    }
  }

  function syncPreview(){
    const pages=document.getElementById('alveo-preview-pages');
    if(!pages) return;
    if(italianPreviewHtml===null) italianPreviewHtml=pages.innerHTML;
    const head=document.querySelector('#alveo-preview-head strong');
    const intro=document.getElementById('alveo-preview-intro');
    const note=document.getElementById('alveo-preview-note');
    const prev=document.getElementById('alveo-preview-prev');
    const next=document.getElementById('alveo-preview-next');
    const counter=document.getElementById('alveo-preview-counter');

    if(currentLang===LANG_DE){
      if(pages.getAttribute('data-lang-preview')!=='de'){
        pages.innerHTML=PREVIEW_DE;
        pages.setAttribute('data-lang-preview','de');
      }
      if(head) head.textContent='10 Frühstücke aus dem Bienenstock · Vorschau';
      if(intro) intro.textContent='Fünf deutsche Demoseiten zeigen den Sprachwechsel vor dem Kauf.';
      if(note) note.textContent='Render-Sprachtest · die endgültige deutsche 37-Seiten-Ausgabe wird erst nach Freigabe erstellt.';
      if(prev) prev.textContent='← Zurück';
      if(next) next.textContent='Weiter →';
      if(counter) counter.textContent='1 / 5';
      const all=pages.querySelectorAll('.alveo-preview-page');
      all.forEach(function(el,i){el.classList.toggle('alveo-active-page',i===0);});
    }else{
      if(pages.getAttribute('data-lang-preview')==='de' && italianPreviewHtml!==null){
        pages.innerHTML=italianPreviewHtml;
        pages.removeAttribute('data-lang-preview');
      }
      if(head) head.textContent='10 Colazioni dell’Alveare · Anteprima';
      if(intro) intro.textContent='Sfoglia tre pagine di esempio prima di acquistare. La raccolta completa contiene 37 pagine.';
      if(note) note.textContent='Anteprima parziale · il contenuto completo si scarica dopo l’acquisto.';
      if(prev) prev.textContent='← Indietro';
      if(next) next.textContent='Avanti →';
      if(counter) counter.textContent='1 / 3';
      const all=pages.querySelectorAll('.alveo-preview-page');
      all.forEach(function(el,i){el.classList.toggle('alveo-active-page',i===0);});
    }
  }

  function syncAll(){
    if(busy) return;
    busy=true;
    try{
      ensureSelector();
      if(currentLang===LANG_DE) translateTree(document.body);
      syncProductFacts();
      syncPurchaseModal();
      syncPreview();
      document.documentElement.lang=currentLang===LANG_DE?'de':'it';
      const sel=document.getElementById('fda-language-select');
      if(sel) sel.value=currentLang;
    }finally{busy=false;}
  }

  function applyLanguage(lang){
    currentLang=lang===LANG_DE?LANG_DE:LANG_IT;
    try{localStorage.setItem(STORAGE_KEY,currentLang);}catch(_){}
    if(currentLang===LANG_IT) restoreItalian();
    syncAll();
  }

  function scheduleSync(){
    clearTimeout(syncTimer);
    syncTimer=setTimeout(syncAll,35);
  }

  function start(){
    let saved='';
    try{saved=localStorage.getItem(STORAGE_KEY)||'';}catch(_){}
    if(saved!==LANG_IT && saved!==LANG_DE){
      saved=(navigator.language||'').toLowerCase().startsWith('de')?LANG_DE:LANG_IT;
    }
    currentLang=saved;
    ensureSelector();
    syncAll();
    new MutationObserver(function(mutations){
      if(busy) return;
      if(currentLang===LANG_DE){
        mutations.forEach(function(m){m.addedNodes&&m.addedNodes.forEach(function(n){if(n.nodeType===1||n.nodeType===3)translateTree(n.nodeType===1?n:n.parentNode);});});
      }
      scheduleSync();
    }).observe(document.body,{childList:true,subtree:true});
    document.addEventListener('click',function(e){
      if(e.target&&e.target.closest&&e.target.closest('[data-open-alveo-digitale],[data-alveo-preview-open],[data-alveo-buy="colazioni"]')) setTimeout(syncAll,60);
    },true);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();