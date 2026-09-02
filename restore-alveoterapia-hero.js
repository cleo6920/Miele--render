const fs = require('fs');
const path = require('path');

// Esegue prima tutta la catena catalogo/hero esistente. Quando torna, il server è già avviato
// ma index.html può ancora essere rifinito: express lo servirà dal file aggiornato.
require('./apinfiore-products-prestart.js');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const oldBlock = `<div className="mt-4 flex flex-nowrap items-start gap-3 sm:gap-4 ml-0 sm:ml-0 lg:ml-0">
                                    <div className="w-36 h-28 sm:w-40 sm:h-28 lg:w-44 lg:h-32 rounded-[999px] overflow-hidden border-4 border-amber-400 shadow-2xl bg-stone-900 flex-shrink-0">
                                        <img src="/images/alveoterapia-casetta-hero.jpg" alt="Alveoterapia integrata con diffusore" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="w-36 h-28 sm:w-40 sm:h-28 lg:w-44 lg:h-32 rounded-[999px] overflow-hidden border-4 border-amber-300 shadow-2xl bg-stone-900 flex-shrink-0">
                                        <img src="/images/hero-prodotti-corretta.jpg" alt="Diffusore, capsule e Unguento Apis" className="w-full h-full object-cover" />
                                    </div>
                                </div>`;

  const newBlock = `<div className="mt-4 flex flex-nowrap items-start gap-3 sm:gap-4 ml-0 sm:ml-0 lg:ml-0">
                                    <button
                                        type="button"
                                        aria-label="Scopri PropolTerapy Professional"
                                        onClick={() => {
                                            const target = Array.from(document.querySelectorAll('h1,h2,h3,h4,strong,div,span')).find(el => (el.textContent || '').trim() === 'PropolTerapy Professional');
                                            if (target) {
                                                const clickable = target.closest('button,[role="button"],.product-card,.card');
                                                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                if (clickable && clickable !== target && typeof clickable.click === 'function') setTimeout(() => clickable.click(), 450);
                                            }
                                        }}
                                        className="group flex-shrink-0 text-left cursor-pointer focus:outline-none"
                                    >
                                        <div className="relative w-36 h-28 sm:w-40 sm:h-28 lg:w-44 lg:h-32 rounded-[999px] overflow-hidden border-4 border-amber-300 shadow-2xl bg-stone-900">
                                            <img src="/images/hero-prodotti-corretta.jpg" alt="Diffusore, capsule e Unguento Apis" className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" />
                                            <span className="absolute left-1/2 bottom-2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/75 px-3 py-1 text-xs sm:text-sm font-extrabold text-amber-300 border border-amber-300">Scopri di più</span>
                                        </div>
                                    </button>
                                    <button
                                        type="button"
                                        aria-label="Scopri Unguento Apis"
                                        onClick={() => {
                                            const target = Array.from(document.querySelectorAll('h1,h2,h3,h4,strong,div,span')).find(el => (el.textContent || '').trim().startsWith('Unguento Apis'));
                                            if (target) {
                                                const clickable = target.closest('button,[role="button"],.product-card,.card');
                                                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                if (clickable && clickable !== target && typeof clickable.click === 'function') setTimeout(() => clickable.click(), 450);
                                            }
                                        }}
                                        className="group flex-shrink-0 text-left cursor-pointer focus:outline-none"
                                    >
                                        <div className="relative w-36 h-28 sm:w-40 sm:h-28 lg:w-44 lg:h-32 rounded-[999px] overflow-hidden border-4 border-amber-400 shadow-2xl bg-stone-900">
                                            <img src="images/unguento-apis.png" alt="Unguento Apis" className="w-full h-full object-contain bg-white transition-transform duration-200 group-hover:scale-105" />
                                            <span className="absolute left-1/2 bottom-2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/75 px-3 py-1 text-xs sm:text-sm font-extrabold text-amber-300 border border-amber-300">Scopri di più</span>
                                        </div>
                                    </button>
                                </div>`;

  if (!html.includes(oldBlock)) {
    throw new Error('Blocco hero Alveoterapia attuale non trovato: nessuna sostituzione eseguita');
  }

  html = html.replace(oldBlock, newBlock);
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Hero Alveoterapia ripristinata: 2 card cliccabili con Scopri di più.');
} catch (error) {
  console.error('[Miele Artigianale] Errore ripristino hero Alveoterapia:', error);
}
