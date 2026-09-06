const fs = require('fs');
const path = require('path');

// Ricostruisce le due fotografie reali usate nella Hero 2 prima di avviare il server.
try {
  const imageDir = path.join(__dirname, 'images');
  const imageSets = [
    {
      output: 'hero2-marco-oasi.jpg',
      parts: ['hero2-oasi.p01.b64', 'hero2-oasi.p02.b64', 'hero2-oasi.p03.b64', 'hero2-oasi.p04.b64', 'hero2-oasi.p05.b64', 'hero2-oasi.p06.b64']
    },
    {
      output: 'hero2-marco-diffusore.jpg',
      parts: ['hero2-diffusore.p01.b64', 'hero2-diffusore.p02.b64', 'hero2-diffusore.p03.b64', 'hero2-diffusore.p04.b64', 'hero2-diffusore.p05.b64', 'hero2-diffusore.p06.b64', 'hero2-diffusore.p07.b64']
    }
  ];

  for (const set of imageSets) {
    const encoded = set.parts
      .map((part) => fs.readFileSync(path.join(imageDir, part), 'utf8').trim())
      .join('');
    const image = Buffer.from(encoded, 'base64');
    if (image.length < 1000 || image[0] !== 0xff || image[1] !== 0xd8) {
      throw new Error(`Immagine Hero 2 non valida: ${set.output}`);
    }
    fs.writeFileSync(path.join(imageDir, set.output), image);
  }
  console.log('[Miele Artigianale] Fotografie Hero 2 ricostruite correttamente.');
} catch (error) {
  console.error('[Miele Artigianale] Errore ricostruzione fotografie Hero 2:', error);
}

// Mantiene intatta la catena shop approvata; Hero 2 viene applicata per ultima.
require('./sos-dol-prestart.js');

// Mantiene come fallback locale la foto SOS DOL già usata nello stato stabile.
try {
  const indexPath = path.join(__dirname, 'index.html');
  const localHeroImage = '/images/sos-dol-hero-premium.jpg';
  const localHeroPath = path.join(__dirname, 'images', 'sos-dol-hero-premium.jpg');
  let html = fs.readFileSync(indexPath, 'utf8');

  if (!fs.existsSync(localHeroPath)) {
    throw new Error('Asset locale SOS DOL Apifiore non trovato');
  }

  const marker = 'aria-label="Scopri SOS DOL – Unguento Apis – 15 ml"';
  const markerIndex = html.indexOf(marker);
  if (markerIndex === -1) throw new Error('Pulsante SOS DOL Hero 1 non individuato');

  const buttonStart = html.lastIndexOf('<button', markerIndex);
  const buttonEnd = html.indexOf('</button>', markerIndex);
  if (buttonStart === -1 || buttonEnd === -1) throw new Error('Blocco SOS DOL Hero 1 non valido');

  const endExclusive = buttonEnd + '</button>'.length;
  let button = html.slice(buttonStart, endExclusive);
  const imgPattern = /<img\s+src="[^"]+"[^>]*\/>/;
  if (!imgPattern.test(button)) throw new Error('Tag immagine SOS DOL Hero 1 non trovato');

  const img = `<img src="${localHeroImage}" alt="SOS DOL – Unguento Apis 15 ml" className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" />`;
  button = button.replace(imgPattern, img);
  html = html.slice(0, buttonStart) + button + html.slice(endExclusive);

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Hero 1 SOS DOL: fallback locale stabile mantenuto.');
} catch (error) {
  console.error('[Miele Artigianale] Errore ripristino foto SOS DOL Hero 1:', error);
}

require('./hero2-inject.js');

// Solo lato browser sostituisce l'immagine del secondo pulsante Hero 1 con la foto
// ufficiale del prodotto SOS DOL. Non modifica nessun'altra immagine o asset locale.
try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');
  const runtimeId = 'sos-dol-hero-product-only';

  if (!html.includes(`id="${runtimeId}"`)) {
    const runtimeScript = `<script id="${runtimeId}">(()=>{const productImage='https://www.apinfiore.com/wp-content/uploads/2023/03/SOS-Doll_web-5.jpg.webp';const apply=()=>{const button=document.querySelector('button[aria-label="Scopri SOS DOL – Unguento Apis – 15 ml"]');if(!button)return;const img=button.querySelector('img');if(!img||img.dataset.sosDolProductOnly==='1')return;img.dataset.sosDolProductOnly='1';img.referrerPolicy='no-referrer';img.src=productImage;img.style.objectFit='contain';img.style.objectPosition='center';img.style.backgroundColor='#e6d8ef';img.style.padding='2px';img.style.transform='scale(1.12)';};const start=()=>{apply();new MutationObserver(apply).observe(document.body,{childList:true,subtree:true});};document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();})();</script>`;
    html = html.replace('</body>', `${runtimeScript}</body>`);
    fs.writeFileSync(indexPath, html, 'utf8');
    console.log('[Miele Artigianale] Hero 1 SOS DOL: override browser isolato applicato.');
  }
} catch (error) {
  console.error('[Miele Artigianale] Errore override browser SOS DOL Hero 1:', error);
}
