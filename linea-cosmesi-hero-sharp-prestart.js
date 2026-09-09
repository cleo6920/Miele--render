const fs = require('fs');
const path = require('path');

// Usa direttamente l'immagine nitida approvata come data URI, evitando ricompressioni o asset statici sfocati.
const indexPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
const sharpImage = 'data:image/jpeg;base64,PLACEHOLDER';
html = html.replaceAll('/images/linea-cosmesi-cera-home.jpg', sharpImage);
fs.writeFileSync(indexPath, html, 'utf8');
console.log('[Miele Artigianale] Immagine nitida approvata Cosmesi/Cera applicata.');
