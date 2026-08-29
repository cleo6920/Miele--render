(() => {
  const onReady = (fn) => document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', fn, { once: true })
    : fn();

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

  onReady(() => {
    markSingleProduct();
    window.setTimeout(markSingleProduct, 180);
    window.setTimeout(markSingleProduct, 650);
  });
})();
