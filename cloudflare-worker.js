const RENDER_V2_ORIGIN = 'https://miele-shop-experience-v2.onrender.com';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/__cloudflare-test') {
      return Response.json({
        ok: true,
        mode: 'cloudflare-v2-safe',
        staticAssets: true,
        source: 'shop-experience-v2',
        apiMode: 'temporary-render-v2-proxy'
      }, {
        headers: { 'Cache-Control': 'no-store' }
      });
    }

    // FASE 1 SICURA:
    // HTML, CSS, JS, immagini e PDF vengono serviti da Cloudflare.
    // Le API restano temporaneamente isolate dietro il vecchio backend V2
    // finché ciascuna API non viene migrata e collaudata su Workers.
    if (url.pathname.startsWith('/api/')) {
      const target = new URL(url.pathname + url.search, RENDER_V2_ORIGIN);
      const proxyRequest = new Request(target, request);
      return fetch(proxyRequest);
    }

    return env.ASSETS.fetch(request);
  }
};
