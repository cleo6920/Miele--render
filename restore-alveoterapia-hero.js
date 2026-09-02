const fs = require('fs');
const path = require('path');

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

  const opener = (categoryNeedle, productNeedle) => `(() => {
                                            const clickCategory = () => {
                                                const cards = Array.from(document.querySelectorAll('[data-category],button,.card,[role="button"]'));
                                                const cat = cards.find(el => ((el.textContent || '').toLowerCase()).includes('${categoryNeedle.toLowerCase()}'));
                                                if (cat && typeof cat.click === 'function') cat.click();
                                            };
                                            const openProduct = () => {
                                                const nodes = Array.from(document.querySelectorAll('h1,h2,h3,h4,strong,span,div,p'));
                                                const target = nodes.find(el => ((el.textContent || '').trim().toLowerCase()).startsWith('${productNeedle.toLowerCase()}'));
                                                if (!target) return false;
                                                let holder = target;
                                                for (let i = 0; i < 6 && holder; i++, holder = holder.parentElement) {
                                                    const buttons = Array.from(holder.querySelectorAll ? holder.querySelectorAll('button,[role="button"]') : []);
                                                    const action = buttons.find(b => /scopri|dettagli|visualizza|vedi|scegli/i.test(b.textContent || '')) || buttons[0];
                                                    if (action && typeof action.click === 'function') { action.click(); return true; }
                                                }
                                                const clickable = target.closest('button,[role="button"],.product-card,.card');
                                                if (clickable && typeof clickable.click === 'function') { clickable.click(); return true; }
                                                return false;
                                            };
                                            clickCategory();
                                            let tries = 0;
                                            const timer = setInterval(() => {
                                                tries++;
                                                if (openProduct() || tries >= 20) clearInterval(timer);
                                            }, 150);
                                        })()`;

  const newBlock = `<div id="alveoterapia-hero-actions" className="mt-4 flex flex-nowrap items-start gap-3 sm:gap-4 ml-0 sm:ml-0 lg:ml-0">
                                    <button type="button" aria-label="Scopri PropolTerapy Professional" onClick={() => ${opener('alveoterapia','PropolTerapy Professional')}} className="group flex-shrink-0 text-left cursor-pointer focus:outline-none">
                                        <div className="relative w-36 h-28 sm:w-40 sm:h-28 lg:w-44 lg:h-32 rounded-[999px] overflow-hidden border-4 border-amber-300 shadow-2xl bg-stone-900">
                                            <img src="/images/hero-prodotti-corretta.jpg" alt="Diffusore PropolTerapy Professional" className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" />
                                            <span className="absolute left-1/2 bottom-2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/75 px-3 py-1 text-xs sm:text-sm font-extrabold text-amber-300 border border-amber-300">Scopri di più</span>
                                        </div>
                                    </button>
                                    <button type="button" aria-label="Scopri Unguento Apis" onClick={() => ${opener('cosmesi','Unguento Apis')}} className="group flex-shrink-0 text-left cursor-pointer focus:outline-none">
                                        <div className="relative w-36 h-28 sm:w-40 sm:h-28 lg:w-44 lg:h-32 rounded-[999px] overflow-hidden border-4 border-amber-400 shadow-2xl bg-stone-900">
                                            <img src="images/unguento-apis.png" alt="Unguento Apis" className="w-full h-full object-contain bg-white transition-transform duration-200 group-hover:scale-105" />
                                            <span className="absolute left-1/2 bottom-2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/75 px-3 py-1 text-xs sm:text-sm font-extrabold text-amber-300 border border-amber-300">Scopri di più</span>
                                        </div>
                                    </button>
                                </div>`;

  const customStart = html.indexOf('<div id="alveoterapia-hero-actions"');
  if (customStart >= 0) {
    const customEnd = html.indexOf('</div>', customStart);
    if (customEnd >= 0) html = html.slice(0, customStart) + newBlock + html.slice(customEnd + 6);
  } else if (html.includes(oldBlock)) {
    html = html.replace(oldBlock, newBlock);
  } else {
    throw new Error('Blocco hero Alveoterapia non trovato');
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Hero Alveoterapia unica e cliccabile verso le schede prodotto.');
} catch (error) {
  console.error('[Miele Artigianale] Errore ripristino hero Alveoterapia:', error);
}
