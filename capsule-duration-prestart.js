const fs = require('fs');
const path = require('path');

// Aggiorna SOLO le descrizioni pubbliche delle due capsule per diffusore.
try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const replacements = [
    {
      oldText: "Capsule monouso P+B dedicate ai diffusori per alveoterapia compatibili. La formulazione abbina propoli italiana al 95% e Boswellia Serrata al 5% ed è pensata per essere utilizzata esclusivamente con il dispositivo previsto. Ogni capsula si inserisce nel diffusore secondo le istruzioni dell’apparecchio e va sostituita dopo l’utilizzo previsto dal produttore. Conservare in luogo asciutto e lontano da fonti di calore.",
      newText: "Capsule monouso P+B dedicate ai diffusori per alveoterapia compatibili. La formulazione abbina propoli italiana al 95% e Boswellia Serrata al 5% ed è pensata per essere utilizzata esclusivamente con il dispositivo previsto. Ogni capsula si inserisce nel diffusore secondo le istruzioni dell’apparecchio. 1 capsula: circa 122 ore di utilizzo, pari a circa 480 sedute da 15 minuti. Confezione da 5 capsule: circa 610 ore complessive, pari a circa 2.400 sedute da 15 minuti. Valori indicativi. Conservare in luogo asciutto e lontano da fonti di calore."
    },
    {
      oldText: "Capsule monouso di propoli per diffusori PROPOLAIR/PROPOLIT compatibili. Sono pensate per un utilizzo semplice nel diffusore dedicato, senza dover preparare miscele o dosare manualmente il prodotto. La confezione contiene 5 capsule e consente di avere ricambi pronti all’uso. Utilizzare sempre secondo le istruzioni del proprio diffusore.",
      newText: "Capsule monouso di propoli per diffusori PROPOLAIR/PROPOLIT compatibili. Sono pensate per un utilizzo semplice nel diffusore dedicato, senza dover preparare miscele o dosare manualmente il prodotto. 1 capsula: circa 122 ore di utilizzo, pari a circa 480 sedute da 15 minuti. Confezione da 5 capsule: circa 610 ore complessive, pari a circa 2.400 sedute da 15 minuti. Valori indicativi. Utilizzare sempre secondo le istruzioni del proprio diffusore."
    }
  ];

  let total = 0;
  for (const item of replacements) {
    const count = html.split(item.oldText).length - 1;
    if (count > 0) {
      html = html.replaceAll(item.oldText, item.newText);
      total += count;
    }
  }

  if (total === 0) {
    throw new Error('Descrizioni capsule non trovate: nessuna modifica applicata');
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log(`[Miele Artigianale] Durata capsule integrata nelle schede prodotto (${total} occorrenze aggiornate).`);
} catch (error) {
  console.error('[Miele Artigianale] Errore aggiornamento durata capsule:', error);
  process.exitCode = 1;
}
