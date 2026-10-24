/* La Fabbrica delle Api · lente fotografica condivisa · 2026-10-24
   Solo immagini: non altera contenuti, prezzi, scorte o carrello. */
(function () {
  'use strict';
  if (window.__fabbricaProductMagnifierLoaded) return;
  window.__fabbricaProductMagnifierLoaded = true;

  const MEDIA_SELECTOR = '.product-gallery .gift-product-media, .detail-photo, .grid .gift-pic, .catalog-card-media, .product-new-media, .product-detail-media';
  const EXPAND_SELECTOR = '.product-gallery .gift-product-media img, .detail-photo img.detail-main, .product-detail-media img';
  const ZOOM_FACTOR = 2.75;
  let activeMedia = null;
  let activeLens = null;
  let openDialog = null;
  let previousFocus = null;
  let previousOverflow = '';

  const style = document.createElement('style');
  style.id = 'fabbrica-product-magnifier-css';
  style.textContent =
    '.product-gallery .gift-product-media,.detail-photo,.grid .gift-pic,.catalog-card-media,.product-new-media,.product-detail-media{position:relative!important;}' +
    '.fabbrica-loupe{position:absolute;z-index:12;width:160px;height:160px;box-sizing:border-box;display:none;border-radius:50%;border:3px solid #f7e8c1;background-color:#fff;background-repeat:no-repeat;box-shadow:0 4px 18px rgba(41,21,13,.4),0 0 0 1px rgba(92,45,19,.3);pointer-events:none!important;user-select:none;}' +
    '.product-gallery .gift-product-media:has(img),.detail-photo:has(img.detail-main),.product-detail-media:has(img){cursor:zoom-in;}' +
    '.fabbrica-photo-overlay{position:fixed;inset:0;z-index:2147483600;background:rgba(24,16,18,.91);display:flex;align-items:center;justify-content:center;padding:60px 16px 24px;box-sizing:border-box;}' +
    '.fabbrica-photo-overlay img{display:block;max-width:min(1100px,95vw);max-height:calc(100dvh - 110px);height:auto;width:auto;object-fit:contain;background:#fff;border-radius:8px;box-shadow:0 12px 50px rgba(0,0,0,.32);}' +
    '.fabbrica-photo-close{position:fixed;top:16px;right:16px;z-index:1;border:1px solid #d5b98b;border-radius:100px;padding:10px 16px;background:#fff7e8;color:#63283b;font:700 15px system-ui,sans-serif;cursor:pointer;}' +
    '@media (max-width:640px){.fabbrica-photo-overlay{padding:58px 8px 18px}.fabbrica-photo-close{top:10px;right:10px}}' +
    '@media (hover:none){.fabbrica-loupe{display:none!important}}';
  document.head.appendChild(style);

  function hideLens() {
    if (activeLens) activeLens.style.display = 'none';
    activeLens = null;
    activeMedia = null;
  }

  function clamp(value, low, high) {
    return Math.min(Math.max(value, low), high);
  }

  function getImage(media) {
    const img = media && media.querySelector('img');
    return img && img.complete && img.naturalWidth > 0 ? img : null;
  }

  function moveLens(event) {
    if (event.pointerType !== 'mouse' || openDialog) {
      hideLens();
      return;
    }
    const target = event.target instanceof Element ? event.target : null;
    const media = target && target.closest(MEDIA_SELECTOR);
    const img = getImage(media);
    if (!img) {
      hideLens();
      return;
    }
    if (activeMedia !== media) {
      hideLens();
      activeMedia = media;
      activeLens = document.createElement('span');
      activeLens.className = 'fabbrica-loupe';
      activeLens.setAttribute('aria-hidden', 'true');
      media.appendChild(activeLens);
    }

    const outer = media.getBoundingClientRect();
    const imageRect = img.getBoundingClientRect();
    if (!outer.width || !outer.height || !imageRect.width || !imageRect.height) {
      hideLens();
      return;
    }
    const fit = Math.min(imageRect.width / img.naturalWidth, imageRect.height / img.naturalHeight);
    const shownWidth = img.naturalWidth * fit;
    const shownHeight = img.naturalHeight * fit;
    const left = imageRect.left - outer.left + (imageRect.width - shownWidth) / 2;
    const top = imageRect.top - outer.top + (imageRect.height - shownHeight) / 2;
    const localX = event.clientX - outer.left;
    const localY = event.clientY - outer.top;
    const u = clamp((localX - left) / shownWidth, 0, 1);
    const v = clamp((localY - top) / shownHeight, 0, 1);

    const diameter = Math.min(166, Math.max(106, Math.min(outer.width, outer.height) * .78));
    const lx = clamp(localX - diameter / 2, 0, Math.max(0, outer.width - diameter));
    const ly = clamp(localY - diameter / 2, 0, Math.max(0, outer.height - diameter));
    activeLens.style.width = diameter + 'px';
    activeLens.style.height = diameter + 'px';
    activeLens.style.left = lx + 'px';
    activeLens.style.top = ly + 'px';
    activeLens.style.backgroundImage = 'url(' + JSON.stringify(img.currentSrc || img.src) + ')';
    activeLens.style.backgroundSize = Math.round(shownWidth * ZOOM_FACTOR) + 'px ' + Math.round(shownHeight * ZOOM_FACTOR) + 'px';
    activeLens.style.backgroundPosition =
      Math.round(diameter / 2 - u * shownWidth * ZOOM_FACTOR) + 'px ' +
      Math.round(diameter / 2 - v * shownHeight * ZOOM_FACTOR) + 'px';
    activeLens.style.display = 'block';
  }

  function closeZoom() {
    if (!openDialog) return;
    openDialog.remove();
    openDialog = null;
    document.body.style.overflow = previousOverflow;
    if (previousFocus && previousFocus.isConnected && typeof previousFocus.focus === 'function') {
      previousFocus.focus({preventScroll:true});
    }
    previousFocus = null;
  }

  function openZoom(img) {
    if (!img || !img.src) return;
    closeZoom();
    hideLens();
    previousFocus = document.activeElement;
    previousOverflow = document.body.style.overflow;
    const backdrop = document.createElement('div');
    backdrop.className = 'fabbrica-photo-overlay';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-label', 'Fotografia ingrandita');
    const large = document.createElement('img');
    large.alt = img.alt || 'Foto del prodotto';
    large.src = img.currentSrc || img.src;
    const close = document.createElement('button');
    close.className = 'fabbrica-photo-close';
    close.type = 'button';
    close.textContent = '✕ Chiudi';
    close.setAttribute('aria-label', 'Chiudi fotografia ingrandita');
    close.addEventListener('click', closeZoom);
    backdrop.addEventListener('click', function (e) {
      if (e.target === backdrop) closeZoom();
    });
    backdrop.appendChild(close);
    backdrop.appendChild(large);
    document.body.appendChild(backdrop);
    openDialog = backdrop;
    document.body.style.overflow = 'hidden';
    close.focus({preventScroll:true});
  }

  document.addEventListener('pointermove', moveLens, {passive:true});
  window.addEventListener('scroll', hideLens, {passive:true});
  window.addEventListener('blur', hideLens);
  document.addEventListener('click', function (event) {
    const target = event.target instanceof Element ? event.target : null;
    const img = target && target.closest(EXPAND_SELECTOR);
    if (!img) return;
    event.preventDefault();
    event.stopPropagation();
    openZoom(img);
  }, true);
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeZoom();
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const img = document.activeElement;
    if (img instanceof Element && img.matches(EXPAND_SELECTOR)) {
      event.preventDefault();
      openZoom(img);
    }
  });
  document.querySelectorAll(EXPAND_SELECTOR).forEach(function (img) {
    img.tabIndex = 0;
    img.setAttribute('aria-label', 'Ingrandisci: ' + (img.alt || 'foto prodotto'));
  });
})();
