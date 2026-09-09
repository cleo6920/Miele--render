const fs = require('fs');
const path = require('path');

try {
  const partsDir = path.join(__dirname, '.cosmesi-hero');
  const parts = [
    'fix01a.b64',
    'fix01b.b64',
    'fix02a.b64',
    'fix02b.b64',
    'chunk03.b64',
    'chunk04.b64',
    'chunk05.b64',
    'fix06a.b64',
    'fix06b.b64',
    'chunk07.b64'
  ];

  const base64 = parts
    .map(name => fs.readFileSync(path.join(partsDir, name), 'utf8').trim())
    .join('');

  const image = Buffer.from(base64, 'base64');

  if (base64.length !== 92684 || image.length !== 69511 || image[0] !== 0xFF || image[1] !== 0xD8) {
    throw new Error(`Immagine Cosmesi/Cera non valida: base64=${base64.length}, bytes=${image.length}`);
  }

  const target = path.join(__dirname, 'images', 'linea-cosmesi-cera-home.jpg');
  fs.writeFileSync(target, image);
  console.log(`[Miele Artigianale] Immagine nitida Cosmesi/Cera applicata (${image.length} byte).`);
} catch (error) {
  console.error('[Miele Artigianale] Errore immagine Cosmesi/Cera:', error);
  process.exitCode = 1;
}
