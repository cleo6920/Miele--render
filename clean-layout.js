(() => {
  const onReady = (fn) => document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', fn, { once: true })
    : fn();

  function anchorSearch(){
    if (window.innerWidth < 901) return;
    const brand = document.querySelector('.shop-brand-wrap');
    if (!brand) return;
    const heroParent = brand.parentElement;
    if (!heroParent) return;

    heroParent.classList.add('clean-hero-root');

    const input = Array.from(document.querySelectorAll('input')).find(el =>
      ((el.getAttribute('placeholder') || '').toLowerCase().includes('cerca miele'))
    );
    if (!input || !input.parentElement) return;
    const wrap = input.parentElement;

    if (wrap.parentElement !== heroParent) heroParent.appendChild(wrap);
    wrap.classList.add('clean-search-anchor');
  }

  function markSingleProduct(){
    if (window.innerWidth < 901) return;
    const back = Array.from(document.querySelectorAll('button,a')).find(el =>
      /torna indietro/i.test((el.textContent || '').trim())
    );
    if (!back) return;
    let root = back.parentElement;
    for (let i = 0; i < 8 && root; i += 1) {
      const r = root.getBoundingClientRect();
      if (r.width > 500 && r.height > 250) break;
      root = root.parentElement;
    }
    if (root) root.classList.add('clean-single-product-root');
  }

  function apply(){
    anchorSearch();
    markSingleProduct();
  }

  onReady(() => {
    // Solo inizializzazione controllata: nessun riallineamento dopo click/focus/digitazione.
    apply();
    window.setTimeout(apply, 180);
    window.setTimeout(apply, 650);
  });
})();
