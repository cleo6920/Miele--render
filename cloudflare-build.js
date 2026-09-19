const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

const root = __dirname;
const dist = path.join(root, 'dist');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

function copyStaticRootFiles() {
  const allowedExt = new Set(['.html', '.css', '.svg', '.ico', '.txt', '.webmanifest']);
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const ext = path.extname(entry.name).toLowerCase();
    if (!allowedExt.has(ext)) continue;
    fs.copyFileSync(path.join(root, entry.name), path.join(dist, entry.name));
  }

  // Solo JavaScript destinato al browser. Non copiamo i numerosi script interni
  // di prestart/server nel pacchetto pubblico Cloudflare.
  const browserScripts = ['saldo-api.js', 'cesto-admin.js'];
  for (const file of browserScripts) {
    const source = path.join(root, file);
    if (!fs.existsSync(source)) throw new Error(`[Cloudflare test] Script browser richiesto mancante: ${file}`);
    fs.copyFileSync(source, path.join(dist, file));
  }
  console.log(`[Cloudflare test] Script browser pubblicati: ${browserScripts.join(', ')}.`);
}

function normalizeImagePaths(html) {
  return html
    .replace(/(["'`])(?:\.\/|\/)?images\//g, '$1/images/')
    .replace(/url\((["']?)(?:\.\/|\/)?images\//g, 'url($1/images/');
}

function addProductPricesToShopCards(html) {
  const marker = '<h3 className="text-2xl font-bold text-amber-700">{product.name}</h3>';
  const replacement = `${marker}
                    {product.packs && product.packs.length > 0 && (
                        <p className="mt-2 text-2xl font-extrabold text-white">
                            {product.packs.length === 1
                                ? \`€\${product.packs[0].price.toFixed(2).replace('.', ',')}\`
                                : \`Da €\${Math.min(...product.packs.map(pack => pack.price)).toFixed(2).replace('.', ',')}\`}
                        </p>
                    )}`;

  const occurrences = html.split(marker).length - 1;
  if (occurrences < 1) {
    throw new Error('[Cloudflare test] ProductCard non trovato: impossibile aggiungere i prezzi alla carrellata prodotti.');
  }

  const updated = html.split(marker).join(replacement);
  console.log(`[Cloudflare test] Prezzi visibili aggiunti alle ProductCard (${occurrences} occorrenze).`);
  return updated;
}

function verifyLocalImageReferences(html, label) {
  const refs = new Set();
  const quoted = /["'`](\/images\/[^"'`?#\s)]+)/g;
  let match;
  while ((match = quoted.exec(html)) !== null) {
    const ref = match[1];
    if (ref.includes('${') || ref.includes('{') || ref.includes('}')) continue;
    refs.add(ref);
  }

  const missing = [];
  for (const ref of refs) {
    const filePath = path.join(dist, ref.replace(/^\/+/, ''));
    if (!fs.existsSync(filePath)) missing.push(ref);
  }

  if (missing.length) {
    console.warn(`[Cloudflare test] ${label}: riferimenti locali non presenti nel repository: ${missing.slice(0, 30).join(', ')}`);
  }
  console.log(`[Cloudflare test] ${label}: ${refs.size} riferimenti immagini locali controllati, ${missing.length} non presenti.`);
}

function requireCurrentVisibleShopAssets(html) {
  const required = [
    '/images/professional.png',
    '/images/capsule-pb.png',
    '/images/capsule-propolit.png'
  ];
  const missingFiles = required.filter(ref => !fs.existsSync(path.join(dist, ref.replace(/^\/+/, ''))));
  const missingRefs = required.filter(ref => !html.includes(ref));
  if (missingFiles.length || missingRefs.length) {
    throw new Error(`[Cloudflare test] Asset visibili Linea Alveoterapia non validi. File mancanti: ${missingFiles.join(', ') || 'nessuno'}; riferimenti mancanti nell'HTML: ${missingRefs.join(', ') || 'nessuno'}`);
  }
  console.log('[Cloudflare test] Linea Alveoterapia: Professional, Capsule P+B e PROPOLIT presenti e referenziati correttamente.');
}

function requireSaldoApiBrowserRuntime() {
  const htmlPath = path.join(dist, 'saldo-api.html');
  const jsPath = path.join(dist, 'saldo-api.js');
  if (!fs.existsSync(htmlPath)) throw new Error('[Cloudflare test] saldo-api.html mancante dal pacchetto statico.');
  if (!fs.existsSync(jsPath)) throw new Error('[Cloudflare test] saldo-api.js mancante dal pacchetto statico.');
  const html = fs.readFileSync(htmlPath, 'utf8');
  const js = fs.readFileSync(jsPath, 'utf8');
  if (!html.includes('src="/saldo-api.js"')) throw new Error('[Cloudflare test] saldo-api.html non richiama /saldo-api.js.');
  if (!js.includes("fetch('/api/bee-wallet'")) throw new Error('[Cloudflare test] saldo-api.js non richiama /api/bee-wallet.');
  console.log('[Cloudflare test] Saldo Api: pagina, JavaScript browser e chiamata /api/bee-wallet presenti.');
}

async function buildShopExactlyLikeRender() {
  const port = 39100 + Math.floor(Math.random() * 500);
  const origin = `http://127.0.0.1:${port}`;
  const server = spawn(process.execPath, ['server.js'], {
    cwd: root,
    env: { ...process.env, PORT: String(port) },
    stdio: 'inherit'
  });

  try {
    let response = null;
    let lastError = null;
    for (let attempt = 0; attempt < 50; attempt += 1) {
      if (server.exitCode !== null) throw new Error(`server.js terminato prima del rendering shop (exit ${server.exitCode}).`);
      try {
        response = await fetch(`${origin}/shop`, { redirect: 'manual' });
        if (response.ok) break;
        lastError = new Error(`HTTP ${response.status}`);
      } catch (error) {
        lastError = error;
      }
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    if (!response || !response.ok) throw lastError || new Error('Impossibile ottenere /shop dal server Render locale.');

    const rawShopHtml = await response.text();
    if (!rawShopHtml.includes('Home Centro')) throw new Error('La pagina /shop generata non contiene il bridge Home Centro atteso da Render.');

    // Workers Static Assets canonicalizza /shop come /shop/. Rendiamo assoluti
    // i percorsi images/... così il browser usa /images/... come su Render /shop.
    let shopHtml = normalizeImagePaths(rawShopHtml);
    shopHtml = addProductPricesToShopCards(shopHtml);
    verifyLocalImageReferences(shopHtml, '/shop');
    requireCurrentVisibleShopAssets(shopHtml);

    const shopDir = path.join(dist, 'shop');
    fs.mkdirSync(shopDir, { recursive: true });
    fs.writeFileSync(path.join(shopDir, 'index.html'), shopHtml, 'utf8');
    fs.writeFileSync(path.join(dist, 'shop.html'), shopHtml, 'utf8');
    console.log('[Cloudflare test] /shop generato tramite lo stesso server.js usato da Render, con prezzi visibili nelle card solo per Cloudflare.');
  } finally {
    if (server.exitCode === null) server.kill('SIGTERM');
  }
}

async function main() {
  fs.rmSync(dist, { recursive: true, force: true });
  fs.mkdirSync(dist, { recursive: true });

  const prestart = spawnSync(process.execPath, ['shipping-policy-start.js'], {
    cwd: root,
    env: { ...process.env, CLOUDFLARE_BUILD: '1' },
    stdio: 'inherit'
  });
  if (prestart.status !== 0) {
    console.error('[Cloudflare test] Build interrotto: prestart non completati.');
    process.exit(prestart.status || 1);
  }

  copyStaticRootFiles();
  requireSaldoApiBrowserRuntime();
  copyDir(path.join(root, 'images'), path.join(dist, 'images'));
  copyDir(path.join(root, 'downloads'), path.join(dist, 'downloads'));
  console.log('[Cloudflare test] Download digitali copiati nel pacchetto statico.');

  const routeMap = {
    home: 'home.html',
    centro: 'centro.html',
    alveoterapia: 'alveoterapia.html',
    bacheca: 'bacheca.html',
    'chi-siamo': 'chi-siamo.html',
    contatti: 'contatti.html'
  };
  for (const [route, file] of Object.entries(routeMap)) {
    const source = path.join(dist, file);
    if (!fs.existsSync(source)) continue;
    const routeDir = path.join(dist, route);
    fs.mkdirSync(routeDir, { recursive: true });
    const html = normalizeImagePaths(fs.readFileSync(source, 'utf8'));
    verifyLocalImageReferences(html, `/${route}`);
    fs.writeFileSync(path.join(routeDir, 'index.html'), html, 'utf8');
  }

  await buildShopExactlyLikeRender();

  if (fs.existsSync(path.join(dist, 'home.html'))) {
    const homeHtml = normalizeImagePaths(fs.readFileSync(path.join(dist, 'home.html'), 'utf8'));
    verifyLocalImageReferences(homeHtml, '/');
    fs.writeFileSync(path.join(dist, 'index.html'), homeHtml, 'utf8');
  }

  console.log('[Cloudflare test] Static assets pronti in dist/.');
}

main().catch(error => {
  console.error('[Cloudflare test] Build fallito:', error);
  process.exit(1);
});
