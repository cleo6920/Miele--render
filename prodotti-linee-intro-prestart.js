const fs = require('fs');
const path = require('path');

// Introduzione alle linee prodotto subito dopo la sezione Alveoterapia.
// La scheda introduttiva funziona come pagina di ingresso; le linee vengono
// mostrate solo dopo il click e possono essere richiuse tornando alla presentazione.
try {
  const indexPath = path.join(__dirname, 'index.html');
  const imagePath = path.join(__dirname, 'images', 'intro-prodotti-coupon-api.jpg');
  if (!fs.existsSync(imagePath)) throw new Error('Foto introduzione prodotti non trovata');

  let html = fs.readFileSync(indexPath, 'utf8');
  const runtimeId = 'prodotti-linee-intro-runtime';

  const oldRuntime = new RegExp(`<script id="${runtimeId}">[\\s\\S]*?<\\/script>\\s*`, 'g');
  html = html.replace(oldRuntime, '');

  const css = [
    '#prodotti-linee-intro-home{max-width:80rem;margin:0 auto 24px;padding:0 16px;box-sizing:border-box;width:100%;}',
    '#prodotti-linee-intro-home .pli-card{overflow:hidden;border-radius:18px;border:1px solid rgba(245,158,11,.30);background:#111;box-shadow:0 12px 28px rgba(0,0,0,.22);display:grid;grid-template-columns:minmax(300px,46%) minmax(0,1fr);}',
    '#prodotti-linee-intro-home .pli-photo{min-height:310px;background:#e7e5e4;}',
    '#prodotti-linee-intro-home .pli-photo img{display:block;width:100%;height:100%;min-height:310px;object-fit:cover;object-position:center;}',
    '#prodotti-linee-intro-home .pli-copy{padding:24px 26px;display:flex;flex-direction:column;justify-content:center;}',
    '#prodotti-linee-intro-home .pli-kicker{font-size:12px;line-height:1.2;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:#fbbf24;}',
    '#prodotti-linee-intro-home h2{margin:7px 0 10px;font-family:Georgia,"Times New Roman",serif;font-size:clamp(25px,3vw,36px);line-height:1.05;font-weight:900;color:#fff;}',
    '#prodotti-linee-intro-home .pli-lead{margin:0;color:#f5f5f4;font-size:16px;line-height:1.45;font-weight:650;}',
    '#prodotti-linee-intro-home .pli-coupon{margin-top:18px;padding:16px 18px;border-radius:14px;border:1px solid rgba(251,191,36,.45);background:linear-gradient(135deg,rgba(120,53,15,.55),rgba(28,25,23,.92));}',
    '#prodotti-linee-intro-home .pli-coupon-title{display:block;font-size:13px;font-weight:900;letter-spacing:.10em;color:#fbbf24;text-transform:uppercase;}',
    '#prodotti-linee-intro-home .pli-coupon p{margin:7px 0 5px;color:#fff;font-size:15px;font-weight:700;line-height:1.35;}',
    '#prodotti-linee-intro-home .pli-coupon strong{display:block;color:#fde68a;font-size:17px;line-height:1.3;font-weight:900;}',
    '#prodotti-linee-intro-home .pli-actions{margin-top:16px;}',
    '#prodotti-linee-intro-home .pli-lines-button{display:flex;width:100%;min-height:52px;align-items:center;justify-content:center;border:0;border-radius:13px;background:#f59e0b;color:#111827;font-size:15px;font-weight:950;letter-spacing:.04em;text-transform:uppercase;cursor:pointer;box-shadow:0 8px 20px rgba(245,158,11,.20);transition:transform .15s ease,background .15s ease,box-shadow .15s ease;}',
    '#prodotti-linee-intro-home .pli-lines-button:hover{background:#fbbf24;box-shadow:0 10px 24px rgba(245,158,11,.28);}',
    '#prodotti-linee-intro-home .pli-lines-button:active{transform:scale(.985);}',
    '#prodotti-linee-intro-home .pli-lines-view{display:none;border-radius:18px;border:1px solid rgba(245,158,11,.30);background:#111;padding:18px 20px;box-shadow:0 12px 28px rgba(0,0,0,.22);}',
    '#prodotti-linee-intro-home .pli-lines-view-top{display:flex;gap:14px;align-items:center;justify-content:space-between;flex-wrap:wrap;}',
    '#prodotti-linee-intro-home .pli-lines-view h2{margin:0;font-family:Georgia,"Times New Roman",serif;font-size:clamp(24px,3vw,34px);font-weight:900;color:#fff;}',
    '#prodotti-linee-intro-home .pli-lines-view p{margin:5px 0 0;color:#d6d3d1;font-size:14px;font-weight:700;}',
    '#prodotti-linee-intro-home .pli-back-button{border:1px solid rgba(251,191,36,.55);border-radius:11px;background:#1c1917;color:#fbbf24;padding:11px 15px;font-size:13px;font-weight:900;cursor:pointer;white-space:nowrap;}',
    '#prodotti-linee-intro-home .pli-back-button:hover{background:#292524;}',
    'body:not(.pli-lines-open) [data-pli-product-line="1"]{display:none!important;}',
    'body.pli-lines-open #prodotti-linee-intro-home .pli-card{display:none!important;}',
    'body.pli-lines-open #prodotti-linee-intro-home .pli-lines-view{display:block!important;}',
    '@media (max-width:760px){#prodotti-linee-intro-home{padding:0 12px;margin-bottom:18px;}#prodotti-linee-intro-home .pli-card{grid-template-columns:1fr;}#prodotti-linee-intro-home .pli-photo,#prodotti-linee-intro-home .pli-photo img{min-height:0;aspect-ratio:16/11;}#prodotti-linee-intro-home .pli-copy{padding:18px 17px 20px;}#prodotti-linee-intro-home .pli-lead{font-size:15px;}#prodotti-linee-intro-home .pli-coupon strong{font-size:16px;}#prodotti-linee-intro-home .pli-lines-button{min-height:50px;font-size:14px;}#prodotti-linee-intro-home .pli-lines-view{padding:15px;}#prodotti-linee-intro-home .pli-back-button{width:100%;}}'
  ].join('\n');

  const introHtml = [
    '<div class="pli-card">',
    '  <div class="pli-photo"><img src="/images/intro-prodotti-coupon-api.jpg" alt="Centro di Alveoterapia con diffusori e prodotti della Fabbrica delle Api"></div>',
    '  <div class="pli-copy">',
    '    <div class="pli-kicker">Le linee della Fabbrica delle Api</div>',
    '    <h2>Scopri i prodotti della Fabbrica delle Api</h2>',
    '    <p class="pli-lead">L’esperienza dell’alveare continua attraverso le nostre linee di prodotti, pensate per accompagnarti anche dopo la visita al Centro.</p>',
    '    <div class="pli-coupon">',
    '      <span class="pli-coupon-title">🐝 Coupon delle Api</span>',
    '      <p>Accumula i Coupon delle Api con i tuoi acquisti.</p>',
    '      <strong>Raggiungi 100 api e richiedi il tuo Cesto dell’Alveare in omaggio.</strong>',
    '    </div>',
    '    <div class="pli-actions"><button type="button" class="pli-lines-button" data-open-product-lines aria-expanded="false">Scopri tutte le linee</button></div>',
    '  </div>',
    '</div>',
    '<div class="pli-lines-view" aria-label="Tutte le linee della Fabbrica delle Api">',
    '  <div class="pli-lines-view-top">',
    '    <div><div class="pli-kicker">La Fabbrica delle Api</div><h2>Tutte le linee</h2><p>Scegli una linea e scopri i prodotti disponibili.</p></div>',
    '    <button type="button" class="pli-back-button" data-close-product-lines>← Torna alla presentazione</button>',
    '  </div>',
    '</div>'
  ].join('');

  const runtime = `<script id="${runtimeId}">
(function(){
  var sectionId='prodotti-linee-intro-home';
  var styleId='prodotti-linee-intro-style';
  var timer=null;
  var css=${JSON.stringify(css)};
  var introHtml=${JSON.stringify(introHtml)};
  var lineLabels=[
    'LINEA ALIMENTI',
    'LINEA COSMETICA AL VELENO D’API',
    'LINEA COSMETICA AL VELENO D API',
    'LINEA BENESSERE VELENO D’API',
    'LINEA BENESSERE VELENO D API',
    'LINEA INTEGRATORI',
    'LINEA COSMESI E TESORI IN CERA D’API',
    'LINEA COSMESI E TESORI IN CERA D API',
    'LINEA I TESORI DI FRANCESCO',
    'I TRIS DELL’ALVEARE',
    'I TRIS DELL ALVEARE'
  ];

  function normalizeText(value){
    return String(value||'').toUpperCase().replace(/[’‘`´]/g,"'").replace(/\\s+/g,' ').trim();
  }

  var normalizedLabels=lineLabels.map(normalizeText);

  function ensureStyle(){
    if(document.getElementById(styleId)) return;
    var style=document.createElement('style');
    style.id=styleId;
    style.textContent=css;
    document.head.appendChild(style);
  }

  function ensureIntro(){
    var hero=document.getElementById('alveoterapia-integrata-hero2');
    var section=document.getElementById(sectionId);
    if(!hero){
      if(section) section.remove();
      return;
    }
    if(!section){
      section=document.createElement('section');
      section.id=sectionId;
      section.setAttribute('aria-label','Introduzione alle linee prodotto e Coupon delle Api');
      section.innerHTML=introHtml;
    }
    if(hero.nextElementSibling!==section){
      hero.insertAdjacentElement('afterend',section);
    }
  }

  function isProductLineArticle(article){
    if(!article) return false;
    var id=article.id||'';
    if(/^linea-(alimenti|integratori|cosmesi-cera|tesori-francesco|tris-alveare|benessere-veleno-api|veleno-api)-home$/i.test(id)) return true;
    var text=normalizeText(article.textContent||'');
    for(var i=0;i<normalizedLabels.length;i++){
      if(text.indexOf(normalizedLabels[i])!==-1) return true;
    }
    return false;
  }

  function markProductLines(){
    var articles=document.querySelectorAll('article');
    for(var i=0;i<articles.length;i++){
      if(isProductLineArticle(articles[i])) articles[i].setAttribute('data-pli-product-line','1');
    }
  }

  function firstLineTarget(){
    markProductLines();
    return document.querySelector('[data-pli-product-line="1"]');
  }

  function openLines(){
    markProductLines();
    document.body.classList.add('pli-lines-open');
    var button=document.querySelector('[data-open-product-lines]');
    if(button) button.setAttribute('aria-expanded','true');
    var section=document.getElementById(sectionId);
    setTimeout(function(){
      if(section) section.scrollIntoView({behavior:'smooth',block:'start'});
      else {
        var target=firstLineTarget();
        if(target) target.scrollIntoView({behavior:'smooth',block:'start'});
      }
    },60);
  }

  function closeLines(){
    document.body.classList.remove('pli-lines-open');
    var button=document.querySelector('[data-open-product-lines]');
    if(button) button.setAttribute('aria-expanded','false');
    var section=document.getElementById(sectionId);
    setTimeout(function(){if(section) section.scrollIntoView({behavior:'smooth',block:'start'});},40);
  }

  function refresh(){
    ensureStyle();
    ensureIntro();
    markProductLines();
  }

  function schedule(){
    clearTimeout(timer);
    timer=setTimeout(refresh,50);
  }

  function start(){
    refresh();
    new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});
    document.addEventListener('click',function(event){
      var openButton=event.target && event.target.closest ? event.target.closest('[data-open-product-lines]') : null;
      if(openButton){
        event.preventDefault();
        openLines();
        return;
      }
      var closeButton=event.target && event.target.closest ? event.target.closest('[data-close-product-lines]') : null;
      if(closeButton){
        event.preventDefault();
        closeLines();
        return;
      }
      setTimeout(schedule,80);
    },true);
    window.addEventListener('popstate',function(){closeLines();schedule();});
  }

  ensureStyle();
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
</script>`;

  html = html.replace('</body>', `${runtime}\n</body>`);
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Vista linee completa pronta: Alimenti inclusa, apertura e ritorno alla presentazione attivi.');
} catch (error) {
  console.error('[Miele Artigianale] Errore introduzione linee prodotto:', error);
  process.exitCode = 1;
}
