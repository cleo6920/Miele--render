const path = require('path');
const express = require('express');
const createCheckoutSession = require('./api/create-checkout-session');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Original image files recovered from the user's shared Google Drive folder.
// The existing index.html keeps using /images/<filename>; this fallback only
// handles files that are not physically present in the Render repository.
const driveImageIds = Object.freeze({
  'a12.png': '1vsoq5tYwhB2q-v9aZXIDBnkL3tZvqtzN',
  'agrumi.png': '1wtR1cZLS_if7onHazsV_Y4k6o2f33iC3',
  'alveoterapia.png': '1I9me9yh6IYqIHRTvkQgV_6_AKdLyuJy9',
  'arancia.png': '16xvnQYmiMxDXu9IzLTb2X64S0DtYjvfi',
  'bagno-doccia-propoli.png': '1dQRGOGf7_8BF8OPXb9N2Ia9AkV1O9qi6',
  'balsamo-maschera-polline.png': '1CFC_yn3iQ4-wtU0t25WOkPZcyvTeU6FD',
  'bee-energy.png': '1stTELBqYNY-OvpTgedjcr3Zz4XeFyKlw',
  'breathe.png': '1ws7h7Sz6N2uuUzxi4VxcMMoTPs4N9Ysu',
  'burro-cacao-spf15-crop.png': '1duSI3sfHk0Crhy3l-G2LX9Sn_Kj0Z0g7',
  'capsule-pb.png': '1i9D3cpLa6JRPsnXDoX4AY65SKv7_jEAG',
  'capsule-propolit.png': '18Ht30HENnF5yg01AuW62MOFB13LEBQr4',
  'capsule_essential.png': '159HuOy_W2rkXyosOrmJ9OieM9XwgKVkW',
  'castagno.png': '1sXGgjKAJZp9OHxdLm4_AGC3kioAwxN-x',
  'cisto.png': '1K3KwebspTewX5CTRpwveTSP2-HQ1_5Gp',
  'cosmesi.png': '1oHWH63qE8Szl3kVdYUFpBbVeLi1kk3KV',
  'cover-1200x630.jpg': '1HVUxeLYeed2YMG01NZ3yJfpGz3bHF78R',
  'crema-mani-aloe-propoli-50ml.png': '1UbNjFkX6xFcQy5LYbhBNyGBq8iS-7u2_',
  'crema-viso-aloe-miele-50ml.png': '18OFN77ddazT3JjBWmp2ik3vdSURaYMJi',
  'estratto.png': '1xab7EHwHzUUsR79Y7joW6a73PlFu3uMS',
  'favo.png': '1xd4tzWuKjp1qKzASV9JKCWuFcU66Q6ia',
  'francesco.png': '1opHbkAq9pRzRTajzdpS4oyVQTqiRBxtq',
  'incartate.png': '1-Oe5gwm7tp9WjRoOIgsTOijFr4Yh65yM',
  'latte-detergente-polline-propoli-200ml.png': '1lm7CEN1Uh2O5oGvrWFaJTEiSPhfNlw1i',
  'leccornie.png': '1KOvnUgIJEv2GjJqTnf8Px1vhIe_qPhm-',
  'legno123.png': '10QtZ_MYbkqnVK4ElRHhm5ctuNHCr7sTW',
  'limone.png': '1jEQtW6JTzlEYDiGtkPni4FAFNs1dk_ak',
  'orsetti-gele.png': '1fdlnGttchJkyQIceGnO9EgOQ4UPGb5ck',
  'orsetti-gommosi.png': '1KyO16HYFJUCcQsj-OpmsvAdte_EyvIhX',
  'pane.png': '1S0n69jGYv1G_7oAlEdS1FCfKstzFir3y',
  'pappa.png': '1AhmLeZ4AMGab--vsdHPdWtjxac8vq_L2',
  'polline.png': '1uGgRfMBk9vDfg7Eg2AxffDGonpy3MJPa',
  'professional.png': '1JpRYjVYVyOAJn_XZ842P49Jy1Ij_QB2L',
  'propol-active.png': '1gWEUwbEnGW6J3ZCx_IQyRyhTe845RWLL',
  'propol-gum.png': '1oSXynFoTgkOp73Av-ciN1w8noxkeSuCt',
  'propolcaps.png': '1Mqf_IcVmBv1KXmVp0QBeJQ8LOhT9Me4R',
  'propolina.png': '1GKgtkl6m1OpWtVkIVtW9oyOBMTcuHrT9',
  'sapone-liquido-aloe.png': '1j9L6nHCldXvdizvyFwpzl4l_uz7y19rX',
  'saponette-artigianali.png': '17dRGxa00AVAoxjK6KbIyGRETCxMl1Uhv',
  'sciroppo-adulti.png': '1GGBwFz0mc-ru4qhZUJr2WOQ2ggbLdwMR',
  'sciroppo-bimbi.png': '1e5vnqKTl-dmdlJcJB9dTXFKMwFBJDwfF',
  'shampoo-pappa.png': '1OI1eDKcJ9TJGaHGjg95q-7N7HHIvxB_C',
  'shampoo-propoli.png': '1ei9x6uKNbHokvTO3xXc9VVgozeLMbcNw',
  'spray.png': '11K9pGgrSDDSCn6mD-M-6m2oyvLB3se8E',
  'terapia.png': '1OWd8EyLobgZv_lNl68Z5CWF5r6oFO_kX',
  'tesori.png': '1H9IwQPR_DpLcLLP7mtJGDTHOhlrb-zxU',
  'unguento-apis.png': '1i-_1DQB_yOIq3RW1NbZgKhtKYixkbI4X',
  'vegetelle.png': '1aJ9FxL1X4wRNxt-jNfaVTR71mvcS2GCi'
});

app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));
app.post('/api/create-checkout-session', createCheckoutSession);

app.get('/images/:filename', (req, res, next) => {
  const id = driveImageIds[req.params.filename];
  if (!id) return next();

  res.setHeader('Cache-Control', 'public, max-age=3600');
  return res.redirect(302, `https://drive.google.com/uc?export=view&id=${encodeURIComponent(id)}`);
});

app.use(express.static(__dirname));
app.get('/', (_req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Miele Artigianale] Server avviato sulla porta ${PORT}.`);
});
