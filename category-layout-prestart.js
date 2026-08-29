const fs = require('fs');
const path = require('path');

// Esegue prima tutte le regolazioni hero già approvate e avvia il server.
require('./hero-prestart.js');

// Poi rifinisce soltanto la griglia categorie generata dal prestart.
try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const compactGridCss = `<style id="shop-category-grid-compact-final">
@media (min-width: 901px){
  .category-grid{
    grid-template-columns:repeat(4,minmax(0,128px))!important;
    gap:6px!important;
    justify-content:start!important;
    align-items:start!important;
    grid-auto-flow:row dense!important;
  }
  .category-grid > .card{
    grid-column:auto!important;
    grid-row:auto!important;
    width:128px!important;
    min-width:128px!important;
    max-width:128px!important;
    height:160px!important;
    min-height:160px!important;
    max-height:160px!important;
    aspect-ratio:auto!important;
    margin:0!important;
    border-radius:12px!important;
  }
  .category-grid > .card:first-child{
    grid-column:span 2!important;
    width:262px!important;
    min-width:262px!important;
    max-width:262px!important;
  }
  .category-grid > .card:last-child{
    grid-column:span 2!important;
    width:262px!important;
    min-width:262px!important;
    max-width:262px!important;
  }
  .category-grid > .card h3{
    font-size:12px!important;
    left:7px!important;
    right:7px!important;
    bottom:7px!important;
    line-height:1.06!important;
  }
}
</style>`;

  const searchRestoreScript = `<script id="shop-search-hero-gap-restore">
(function(){
  function restoreSearch(){
    if(window.innerWidth < 760) return;
    const productSearch = Array.from(document.querySelectorAll('input')).find(el => ((el.getAttribute('placeholder') || '').toLowerCase().includes('cerca miele')));
    const hivesOval = document.getElementById('busatello-hives-oval');
    if(!productSearch || !productSearch.parentElement || !hivesOval) return;
    const searchWrap = productSearch.parentElement;
    requestAnimationFrame(() => {
      const ovalRect = hivesOval.getBoundingClientRect();
      const targetWidth = Math.min(460, Math.max(380, ovalRect.left - 390));
      searchWrap.style.setProperty('position','relative','important');
      searchWrap.style.setProperty('z-index','20','important');
      searchWrap.style.setProperty('width', targetWidth + 'px','important');
      searchWrap.style.setProperty('max-width', targetWidth + 'px','important');
      searchWrap.style.setProperty('margin-left','0','important');
      searchWrap.style.setProperty('margin-right','0','important');
      searchWrap.style.setProperty('margin-top','0','important');
      searchWrap.style.setProperty('transform','none','important');
      requestAnimationFrame(() => {
        const searchRect = searchWrap.getBoundingClientRect();
        const currentOval = hivesOval.getBoundingClientRect();
        const desiredLeft = Math.max(360, currentOval.left - 18 - searchRect.width);
        const desiredTop = currentOval.top + ((currentOval.height - searchRect.height) / 2) + 34;
        const dx = desiredLeft - searchRect.left;
        const dy = desiredTop - searchRect.top;
        searchWrap.style.setProperty('transform','translate(' + Math.round(dx) + 'px,' + Math.round(dy) + 'px)','important');
      });
    });
  }
  window.addEventListener('load', function(){ setTimeout(restoreSearch, 80); });
  window.addEventListener('resize', function(){ clearTimeout(window.__shopSearchRestoreTimer); window.__shopSearchRestoreTimer = setTimeout(restoreSearch, 120); });
})();
</script>`;

  html = html.replace(/<style id="shop-category-grid-compact-final">[\s\S]*?<\/style>/, compactGridCss);
  if (!html.includes('shop-category-grid-compact-final')) {
    html = html.replace('</head>', `${compactGridCss}\n</head>`);
  }
  if (!html.includes('shop-search-hero-gap-restore')) {
    html = html.replace('</body>', `${searchRestoreScript}\n</body>`);
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Card categorie ulteriormente ridotte; card Mieli e Bacheca restano su due colonne.');
} catch (error) {
  console.error('[Miele Artigianale] Errore regolazione griglia categorie:', error);
}
