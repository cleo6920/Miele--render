const fs = require('fs');
const path = require('path');

try {
  const serverPath = path.join(__dirname, 'server.js');
  let source = fs.readFileSync(serverPath, 'utf8');
  const oldLine = "const IMAGE_VERSION = '20260827-13';";
  const newLine = "const IMAGE_VERSION = '20260917-1';";

  if (!source.includes(oldLine) && !source.includes(newLine)) {
    throw new Error('IMAGE_VERSION atteso non trovato in server.js');
  }

  if (source.includes(oldLine)) {
    source = source.replace(oldLine, newLine);
    fs.writeFileSync(serverPath, source, 'utf8');
  }

  console.log('[Miele Artigianale] Refresh cache immagini Render attivo: 20260917-1.');
} catch (error) {
  console.error('[Miele Artigianale] Errore refresh cache immagini:', error);
  process.exitCode = 1;
}
