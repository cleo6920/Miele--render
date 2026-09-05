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
require('./hero2-inject.js');
