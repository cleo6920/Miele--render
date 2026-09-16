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
}

function normalizeImagePaths(html) {
  return html
    .replace(/(["'`])(?:\.\/|\/)?images\//g, '$1/images/')
    .replace(/url\((["']?)(?:\.\/|\/)?images\//g, 'url($1/images/');
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
    throw new Error(`[Cloudflare test] ${label}: immagini locali mancanti: ${missing.slice(0, 30).join(', ')}`);
  }
  console.log(`[Cloudflare test] ${label}: ${refs.size} riferimenti immagini locali verificati.`);
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
      if (server.exitCode !== null) {
        throw new Error(`server.js terminato prima del rendering shop (exit ${server.exitCode}).`);
      }
      try {
        response = await fetch(`${origin}/shop`, { redirect: 'manual' });
        if (response.ok) break;
        lastError = new Error(`HTTP ${response.status}`);
      } catch (error) {
        lastError = error;
      }
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    if (!response || !response.ok) {
      throw lastError || new Error('Impossibile ottenere /shop dal server Render locale.');
    }

    const rawShopHtml = await response.text();
    if (!rawShopHtml.includes('Home Centro')) {
      throw new Error('La pagina /shop generata non contiene il bridge Home Centro atteso da Render.');
    }

    // Cloudflare pubblica la route come /shop/. I percorsi relativi images/... che
    // funzionano su Render /shop diventerebbero /shop/images/... e si romperebbero.
    // Li rendiamo assoluti senza cambiare i file o il layout di Render.
    const shopHtml = normalizeImagePaths(rawShopHtml);
    verifyLocalImageReferences(shopHtml, '/shop');

    const shopDir = path.join(dist, 'shop');
    fs.mkdirSync(shopDir, { recursive: true });
    fs.writeFileSync(path.join(shopDir, 'index.html'), shopHtml, 'utf8');
    fs.writeFileSync(path.join(dist, 'shop.html'), shopHtml, 'utf8');
    console.log('[Cloudflare test] /shop generato tramite lo stesso server.js usato da Render.');
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
  copyDir(path.join(root, 'images'), path.join(dist, 'images'));

  // Le pagine statiche corrispondono alle route Express di Render. Normalizziamo
  // soltanto i percorsi immagini nella copia Cloudflare, così funzionano anche
  // quando Workers Static Assets canonicalizza le route con la barra finale.
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

  // /shop su Render non è il semplice index.html: server.js applica trasformazioni
  // runtime (Hero, Home Centro, selezione mieli, ecc.). Generiamo l'HTML passando
  // dallo stesso endpoint Express, così Cloudflare pubblica lo stesso risultato.
  await buildShopExactlyLikeRender();

  // La root pubblica deve comportarsi come Render: homepage del Centro.
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
