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
function init(){
  addBanner();updateBanner();scan(document.body);
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-api-oggi-preview],#productDetailApiOggiPreview,#openApiOggiDirectPreview,#openAlveoPreview,[data-alveo-shop-preview],#productDetailAlveoPreview,#openFreeEditionModal,#openApiOggiDirectDownload')){
      setTimeout(()=>{forceLanguageInputs();forcePreviewImages();},0);
      setTimeout(()=>{forceLanguageInputs();forcePreviewImages();},180);
    }
  },true);
  const obs=new MutationObserver(ms=>{
    for(const m of ms)for(const n of m.addedNodes||[])if(n.nodeType===1)scan(n);
  });
  obs.observe(document.body,{subtree:true,childList:true});
  setInterval(()=>{updateBanner();forceLanguageInputs();forcePreviewImages();document.querySelectorAll('.free-wallet-result,.api-wallet-result').forEach(localizeWalletResult);},500);
}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init,{once:true}):init();
})();