const fs = require('fs');
const path = require('path');

// Introduzione alle linee prodotto subito dopo la sezione Alveoterapia.
// Non modifica le linee, i prodotti, i prezzi o la navigazione già esistenti.
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
    '#prodotti-linee-intro-home .pli-foot{margin:13px 0 0;color:#d6d3d1;font-size:14px;font-weight:700;}',
    '@media (max-width:760px){#prodotti-linee-intro-home{padding:0 12px;margin-bottom:18px;}#prodotti-linee-intro-home .pli-card{grid-template-columns:1fr;}#prodotti-linee-intro-home .pli-photo,#prodotti-linee-intro-home .pli-photo img{min-height:0;aspect-ratio:16/11;}#prodotti-linee-intro-home .pli-copy{padding:18px 17px 20px;}#prodotti-linee-intro-home .pli-lead{font-size:15px;}#prodotti-linee-intro-home .pli-coupon strong{font-size:16px;}}'
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
    '    <p class="pli-foot">Sotto trovi tutte le linee disponibili.</p>',
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

  function schedule(){
    clearTimeout(timer);
    timer=setTimeout(function(){ensureStyle();ensureIntro();},50);
  }

  function start(){
    ensureStyle();
    ensureIntro();
    new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});
    document.addEventListener('click',function(){setTimeout(schedule,80);},true);
    window.addEventListener('popstate',schedule);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
</script>`;

  html = html.replace('</body>', `${runtime}\n</body>`);
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Introduzione linee prodotto e Coupon delle Api pronta.');
} catch (error) {
  console.error('[Miele Artigianale] Errore introduzione linee prodotto:', error);
  process.exitCode = 1;
}
