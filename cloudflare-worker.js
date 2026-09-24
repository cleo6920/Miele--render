const VERCEL_V2_ORIGIN = 'https://miele-backend-omega.vercel.app';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/__cloudflare-test') {
      return Response.json({
        ok: true,
        mode: 'cloudflare-v2-safe',
        staticAssets: true,
        frontendSource: 'latest-v2-synced',
        apiMode: 'temporary-vercel-v2-proxy'
      }, {
        headers: { 'Cache-Control': 'no-store' }
      });
    }

    if (url.pathname.startsWith('/api/')) {
      const target = new URL(url.pathname + url.search, VERCEL_V2_ORIGIN);
      return fetch(new Request(target, request));
    }

    // During migration, always take multilingual digital previews and the free
    // magazine PDFs from the authoritative latest V2 repository instead of the
    // older Render asset set.
    const latestAsset =
      url.pathname.startsWith('/images/api-oggi-01-preview-') ||
      url.pathname.startsWith('/images/alveo-preview-') ||
      /^\/downloads\/il-mondo-delle-api-oggi-01-(it|en|de|fr|es)\.pdf$/i.test(url.pathname);

    if (latestAsset) {
      const raw = 'https://raw.githubusercontent.com/cleo6920/miele-backend/main' + url.pathname;
      const response = await fetch(raw, {
        headers: { 'User-Agent': 'La-Fabbrica-delle-Api-Cloudflare-Test' }
      });
      if (response.ok) {
        const headers = new Headers(response.headers);
        headers.set('Cache-Control', 'public, max-age=300');
        headers.delete('content-security-policy');
        return new Response(response.body, { status: response.status, headers });
      }
    }

    const assetResponse = await env.ASSETS.fetch(request);
    if (assetResponse.status !== 404) return assetResponse;

    if (url.pathname.startsWith('/images/') || url.pathname.startsWith('/downloads/')) {
      const target = new URL(url.pathname + url.search, VERCEL_V2_ORIGIN);
      return fetch(new Request(target, request));
    }

    return assetResponse;
  }
};
