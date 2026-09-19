const fs = require('fs');
const path = require('path');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const oldImageClass = 'className="block w-full h-[190px] sm:h-[210px] md:h-[220px] lg:h-[225px] object-cover object-center"';
  const newImageClass = 'className="block w-full h-[210px] sm:h-[230px] md:h-full md:min-h-[330px] lg:min-h-[345px] object-cover object-center"';

  if (html.split(oldImageClass).length - 1 !== 1) {
    throw new Error('Classe immagine Linea Veleno non trovata una sola volta');
  }
  html = html.replace(oldImageClass, newImageClass);

  const oldContentClass = 'className="flex flex-col justify-center p-3 sm:p-3 lg:p-4 bg-gradient-to-br from-[#17120a] via-[#111111] to-[#0d0d0d]"';
  const newContentClass = 'className="flex flex-col justify-start p-3 sm:p-3 lg:p-4 bg-gradient-to-br from-[#17120a] via-[#111111] to-[#0d0d0d]"';
  if (html.split(oldContentClass).length - 1 !== 1) {
    throw new Error('Contenitore testo Linea Veleno non trovato una sola volta');
  }
  html = html.replace(oldContentClass, newContentClass);

  const buttonNeedle = `                              <button
                                type="button"
                                onClick={() => { setSelectedProductId(null); setSelectedCategory('veleno-api'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}`;

  const fillBlock = `                              <div className="mt-3 rounded-xl border border-amber-400/25 bg-amber-950/20 px-3 py-2.5">
                                <div className="text-[10px] sm:text-[11px] font-black tracking-[0.12em] text-amber-300 uppercase">La linea in breve</div>
                                <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-[11px] sm:text-xs font-bold text-stone-100">
                                  <div><span className="text-amber-300">Viso</span> · crema e siero</div>
                                  <div><span className="text-amber-300">Corpo</span> · crema, gommage e bagnodoccia</div>
                                  <div><span className="text-amber-300">Massaggio</span> · SOS DOL</div>
                                </div>
                              </div>
${buttonNeedle}`;

  if (html.includes('La linea in breve')) {
    console.log('[Miele Artigianale] Bilanciamento visuale Linea Veleno già applicato.');
  } else {
    if (html.split(buttonNeedle).length - 1 !== 1) {
      throw new Error('Pulsante Linea Veleno non trovato una sola volta');
    }
    html = html.replace(buttonNeedle, fillBlock);
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Linea Veleno bilanciata: foto a tutta altezza e riquadro informativo compatto aggiunto, solo su Render.');
} catch (error) {
  console.error('[Miele Artigianale] Errore bilanciamento Linea Veleno:', error);
  process.exitCode = 1;
}
