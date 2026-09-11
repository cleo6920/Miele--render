const fs = require('fs');
const path = require('path');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const velenoIds = [
    'unguento-apis',
    'apis1-crema-viso-veleno-api',
    'apis2-siero-viso-veleno-api',
    'apis4-crema-corpo-veleno-api-manuka',
    'apis5-gommage-veleno-api-manuka',
    'bagnodoccia-veleno-oro'
  ];

  // 1) La categoria Veleno d'Api deve essere realmente pubblica.
  // Le patch precedenti aggiungevano altre categorie prima del controllo finale,
  // quindi la vecchia sostituzione basata su una stringa esatta poteva non scattare.
  html = html.replace(/const allowedCategoriesForShop = \[([^\]]*)\];/g, (full, inside) => {
    if (/['\"]veleno-api['\"]/.test(inside)) return full;
    const cleaned = inside.trim().replace(/,\s*$/, '');
    return `const allowedCategoriesForShop = [${cleaned}${cleaned ? ', ' : ''}'veleno-api'];`;
  });

  // 2) Mantiene i sei prodotti anche nel filtro autoritativo del catalogo pubblico.
  html = html.replace(/const currentPublicCatalogIds = new Set\((\[[^;]*?\])\);/g, (full, arrayText) => {
    const missing = velenoIds.filter(id => !arrayText.includes(id));
    if (!missing.length) return full;
    const trimmed = arrayText.trim().replace(/\]$/, '');
    const prefix = trimmed.endsWith('[') ? '' : ',';
    return `const currentPublicCatalogIds = new Set(${trimmed}${prefix}${missing.map(id => JSON.stringify(id)).join(',')}]);`;
  });

  // 3) Il renderer della linea deve mostrare tutte e sole le sei referenze approvate.
  const sixIdsLiteral = "['unguento-apis','apis1-crema-viso-veleno-api','apis2-siero-viso-veleno-api','apis4-crema-corpo-veleno-api-manuka','apis5-gommage-veleno-api-manuka','bagnodoccia-veleno-oro']";
  html = html.replaceAll(
    "['unguento-apis','bagnodoccia-veleno-oro'].includes(p.id)",
    `${sixIdsLiteral}.includes(p.id)`
  );

  // 4) Ripristino autoritativo della foto nell'ovale Busatello.
  // Il file locale esiste ed e' servito da /images; questa patch interviene solo
  // sul contenuto dell'ovale gia' presente, senza cambiarne geometria o posizione.
  const runtimeId = 'shop-busatello-oval-image-restore-v2';
  if (!html.includes(`id="${runtimeId}"`)) {
    const runtimeScript = `<script id="${runtimeId}">
(() => {
  let scheduled = false;
  const imageSrc = '/images/alveari-busatello.jpg?v=20260911-2';

  function apply() {
    const oval = document.getElementById('busatello-hives-oval');
    if (!oval) return;

    oval.style.setProperty('position', 'relative', 'important');
    oval.style.setProperty('overflow', 'hidden', 'important');
    oval.style.setProperty('background', '#111', 'important');

    let img = oval.querySelector('img[data-busatello-oval-photo="1"]') || oval.querySelector('img');
    if (!img) {
      img = document.createElement('img');
      oval.insertBefore(img, oval.firstChild || null);
    }

    img.dataset.busatelloOvalPhoto = '1';
    if ((img.getAttribute('src') || '') !== imageSrc) img.setAttribute('src', imageSrc);
    img.setAttribute('alt', "Alveari dell'Oasi del Busatello");
    img.style.setProperty('position', 'absolute', 'important');
    img.style.setProperty('inset', '0', 'important');
    img.style.setProperty('width', '100%', 'important');
    img.style.setProperty('height', '100%', 'important');
    img.style.setProperty('display', 'block', 'important');
    img.style.setProperty('visibility', 'visible', 'important');
    img.style.setProperty('opacity', '1', 'important');
    img.style.setProperty('object-fit', 'cover', 'important');
    img.style.setProperty('object-position', 'center', 'important');
    img.style.setProperty('z-index', '0', 'important');

    Array.from(oval.children).forEach(child => {
      if (child === img) return;
      if (child.style) {
        child.style.setProperty('position', 'relative', 'important');
        child.style.setProperty('z-index', '1', 'important');
      }
    });
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      apply();
    });
  }

  const start = () => {
    apply();
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
    [100, 350, 900].forEach(ms => setTimeout(apply, ms));
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
</script>`;
    html = html.replace('</body>', `${runtimeScript}\n</body>`);
  }

  const allowedMatches = html.match(/const allowedCategoriesForShop = \[([^\]]*)\];/g) || [];
  if (!allowedMatches.length || allowedMatches.some(line => !line.includes("'veleno-api'"))) {
    throw new Error('Categoria veleno-api non presente in tutti gli elenchi pubblici');
  }
  for (const id of velenoIds) {
    if (!html.includes(id)) throw new Error(`Prodotto Veleno mancante dal sorgente finale: ${id}`);
  }
  if (!html.includes(runtimeId)) throw new Error('Ripristino foto ovale Busatello non inserito');

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Fix regressioni: foto ovale Busatello ripristinata e 6 card Veleno d\'Api abilitate.');
} catch (error) {
  console.error('[Miele Artigianale] Errore fix regressioni shop:', error);
  process.exitCode = 1;
}
