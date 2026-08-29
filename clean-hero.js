(() => {
  const run = () => {
    if (document.getElementById('clean-shop-hero')) return;

    const originalHero = Array.from(document.querySelectorAll('header')).find(el =>
      (el.getAttribute('class') || '').includes('bg-gradient-to-br')
    );
    if (!originalHero || !originalHero.parentElement) return;

    const hero = document.createElement('section');
    hero.id = 'clean-shop-hero';
    hero.innerHTML = `
      <div class="clean-hero-grid">
        <div class="clean-hero-left">
          <h1 class="clean-hero-left-title">
            <svg class="clean-hero-flag" aria-label="Bandiera italiana" role="img" viewBox="0 0 30 20"><rect x="0" y="0" width="10" height="20" fill="green"/><rect x="10" y="0" width="10" height="20" fill="white"/><rect x="20" y="0" width="10" height="20" fill="red"/></svg>
            <span>L' Italiano Miele</span>
          </h1>
          <div class="clean-hero-left-subtitle">Alveoterapia integrata</div>
          <div class="clean-hero-photo-row">
            <div class="clean-hero-photo"><img src="/images/alveoterapia-casetta-hero.jpg" alt="Alveoterapia integrata con diffusore"></div>
            <div class="clean-hero-photo"><img src="/images/hero-prodotti-corretta.jpg" alt="Diffusore, capsule e Unguento Apis"></div>
          </div>
        </div>

        <div class="clean-hero-center">
          <div class="clean-hero-center-title">Mieli e prodotti dell'alveare</div>
          <div class="clean-hero-hives-oval"><img src="/images/alveari-busatello.jpg" alt="Alveari dell'Oasi del Busatello"></div>
        </div>

        <div class="clean-hero-right">
          <div class="clean-hero-brand">
            <div class="clean-hero-brand-title">La Fabbrica delle Api</div>
            <div class="clean-hero-brand-flag"><svg aria-label="Bandiera italiana" role="img" width="34" height="23" viewBox="0 0 30 20"><rect x="0" y="0" width="10" height="20" fill="green"/><rect x="10" y="0" width="10" height="20" fill="white"/><rect x="20" y="0" width="10" height="20" fill="red"/></svg></div>
          </div>
          <div id="clean-shop-search-slot"></div>
        </div>
      </div>`;

    originalHero.parentElement.insertBefore(hero, originalHero);

    const searchInput = Array.from(document.querySelectorAll('input')).find(el =>
      ((el.getAttribute('placeholder') || '').toLowerCase().includes('cerca miele'))
    );
    if (searchInput && searchInput.parentElement) {
      document.getElementById('clean-shop-search-slot').appendChild(searchInput.parentElement);
    }

    originalHero.style.display = 'none';
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, { once: true });
  } else {
    run();
  }
})();
