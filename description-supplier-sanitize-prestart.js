const fs = require('fs');
const path = require('path');

// Rifinitura finale delle descrizioni pubbliche prodotto:
// - elimina riferimenti ai fornitori Apifiore/Apinfiore/KONTAK
// - rende non ambigue le misure della candela
try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const exactReplacements = [
    {
      oldText: "Secondo le indicazioni ufficiali Apinfiore, il prodotto per adulti può essere assunto in piccole quantità su miele, zucchero, pane o direttamente, seguendo il dosaggio riportato in etichetta.",
      newText: "Per gli adulti, il prodotto può essere assunto in piccole quantità su miele, zucchero, pane o direttamente, seguendo il dosaggio riportato in etichetta."
    },
    {
      oldText: "Secondo i dati Apinfiore misura circa 5 x 4 cm alla base, 6 cm in altezza e pesa circa 58 g.",
      newText: "Dimensioni indicative della singola candela: base circa 5 cm × 4 cm; altezza circa 6 cm; peso circa 58 g."
    }
  ];

  for (const item of exactReplacements) {
    html = html.replaceAll(item.oldText, item.newText);
  }

  // Rimuove eventuali citazioni residue dei fornitori solo come testo visibile nelle descrizioni.
  html = html
    .replace(/\bApinfiore\b/gi, '')
    .replace(/\bApifiore\b/gi, '')
    .replace(/\bKONTAK\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,.;:])/g, '$1');

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Descrizioni ripulite da riferimenti fornitori; misure candela chiarite.');
} catch (error) {
  console.error('[Miele Artigianale] Errore pulizia descrizioni fornitori:', error);
  process.exitCode = 1;
}
