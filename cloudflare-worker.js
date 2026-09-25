import { parsePhoneNumberFromString } from 'libphonenumber-js';
import SHOP_HTML from './cloudflare-shop-html.js';

const VERCEL_V2_ORIGIN = 'https://miele-backend-omega.vercel.app';

const ORDER_SHIP_WEIGHT_G = {
  millefiori:430,melone:430,fragola:430,pesca:430,arancia:430,
  'propolterapy-professional':1500,'capsule-pb':120,'capsule-propolit':120,
  castagno:430,'acacia-zenzero-apinfiore':370,'miele-eucalipto-apinfiore':430,balsammiel:370,
  acacia:110,'favo-integrale-bio':300,'polline-italiano':220,'pappa-reale-italiana-bio':80,'orsetti-gommosi':125,
  'bee-energy-bio':360,'propol-active-bio':90,'propoli-30-spray-integratore':85,'propoli-30-alcolica-integratore':85,'propoli-analcolica-integratore':85,
  'cosmesi-crema-mani':145,'cosmesi-burrocacao-propoli-aloe':25,'cosmesi-burrocacao-miele-pappa-reale':25,
  'cosmesi-shampoo-multivitaminico':320,'cosmesi-saponetta-frutti-bosco':125,'cosmesi-saponetta-lavanda':125,'cosmesi-saponetta-aloe-vera':125,
  'cosmesi-candela-alveare-cera-api':180,'cosmesi-travel-kit-benessere':330,
  'unguento-apis':80,'sos-dol-50ml':150,'apis1-crema-viso-veleno-api':160,'apis2-siero-viso-veleno-api':130,
  'apis4-crema-corpo-veleno-api-manuka':340,'apis5-gommage-veleno-api-manuka':340,'bagnodoccia-veleno-oro':320,
  'tesori-limoncello':500,'tesori-liquore-caffe':500,'tesori-castagne-rum':500,
  'alveo-digitale-10-colazioni':0,'alveo-digitale-api-oggi-01':0
};
const POSTE_ZONE_BY_COUNTRY={AT:'1',BE:'1',BA:'1',HR:'1',DK:'1',EE:'1',FI:'1',FR:'1',DE:'1',GR:'1',IE:'1',XK:'1',LV:'1',LI:'1',LT:'1',LU:'1',MT:'1',NL:'1',PL:'1',PT:'1',CZ:'1',RO:'1',SK:'1',SI:'1',ES:'1',SE:'1',CH:'1',HU:'1',BG:'2',CY:'2',RS:'2',TR:'2',AL:'3',IS:'3',NO:'3',UA:'3',AZ:'4',MK:'4',MD:'4',ME:'4',BY:'7',GB:'8',AM:'4TRIS',GE:'4QUATER',RU:'4QUATER'};
const POSTE_INTL_2026={'1':[24.75,29.60,32.80,43.00,47.85,58.10],'2':[26.35,32.80,37.65,53.25,63.45,79.55],'3':[28.50,34.95,43.00,55.40,69.35,84.95],'4':[30.65,36.55,46.25,61.30,76.90,91.95],'7':[28.50,34.95,43.00,56.45,71.50,88.70],'8':[24.75,27.40,32.80,46.80,51.05,63.45],'4TRIS':[31.20,38.15,50.00,67.75,86.00,106.45],'4QUATER':[31.20,38.15,48.40,72.05,91.95,114.00]};
const POSTE_INTL_LIMITS_KG=[1,3,5,10,15,20];
const POSTE_ITALY_2026=[[1,5.65],[2,5.90],[3,6.70],[5,7.30],[10,10.40],[15,11.70],[20,12.30],[25,14.80],[30,14.80],[40,28.30],[50,32.30],[70,39.70]];

function normalizePlace(value){
  return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
}
function estimateParcelWeight(items){
  let productGrams=0;
  for(const item of items||[]){
    const unit=Number(ORDER_SHIP_WEIGHT_G[item.id]??250);
    productGrams+=unit*Math.max(1,Math.min(50,Number(item.qty||1)));
  }
  const packing=Math.min(1200,Math.max(180,Math.round(120+productGrams*0.10)));
  const totalGrams=productGrams+packing;
  return {kg:Math.ceil(totalGrams/10)/100};
}
function calcPosteShipping(country,items){
  const weight=estimateParcelWeight(items);
  if(country==='IT'){
    const band=POSTE_ITALY_2026.find(([maxKg])=>weight.kg<=maxKg);
    if(!band)return {ok:true,pending:true,weightKg:weight.kg,reasonCode:'overweight',carrier:'Poste Italiane'};
    return {ok:true,pending:false,cost:band[1],weightKg:weight.kg,bandKg:band[0],carrier:'Poste Italiane',service:'Poste Delivery Web'};
  }
  const zone=POSTE_ZONE_BY_COUNTRY[country];
  if(!zone)return {ok:true,pending:true,weightKg:weight.kg,reasonCode:'no-zone',carrier:'Poste Italiane'};
  const prices=POSTE_INTL_2026[zone];
  const idx=POSTE_INTL_LIMITS_KG.findIndex(max=>weight.kg<=max);
  if(!prices||idx<0)return {ok:true,pending:true,weightKg:weight.kg,zone,reasonCode:'overweight',carrier:'Poste Italiane'};
  return {ok:true,pending:false,cost:prices[idx],weightKg:weight.kg,bandKg:POSTE_INTL_LIMITS_KG[idx],zone,carrier:'Poste Italiane',service:'Poste Delivery International Standard'};
}
function haversineKm(lat1,lon1,lat2,lon2){
  const R=6371,toRad=v=>v*Math.PI/180;
  const dLat=toRad(lat2-lat1),dLon=toRad(lon2-lon1);
  const a=Math.sin(dLat/2)**2+Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}
async function validateAddressNative(url){
  const address=String(url.searchParams.get('address')||'').normalize('NFKC').replace(/\s+/g,' ').trim();
  const city=String(url.searchParams.get('city')||'').normalize('NFKC').replace(/\s+/g,' ').trim();
  const cap=String(url.searchParams.get('cap')||'').normalize('NFKC').toUpperCase().replace(/[–—]/g,'-').replace(/\s+/g,' ').trim();
  const province=String(url.searchParams.get('province')||'').normalize('NFKC').replace(/\s+/g,' ').trim().toUpperCase();
  const country=String(url.searchParams.get('country')||'IT').trim().toUpperCase();

  if(!address||!city||!cap)return {status:400,body:{ok:false,eligible:false,validFullAddress:false,error:'Via, numero civico, Comune/Città e codice postale sono obbligatori.'}};
  if(!/\p{L}/u.test(address)||!/\d/.test(address))return {status:422,body:{ok:false,eligible:false,validFullAddress:false,error:'Inserisci sia il nome della via sia il numero civico.'}};
  if(country==='IT'){
    if(!/^\d{5}$/.test(cap))return {status:422,body:{ok:false,eligible:false,validFullAddress:false,error:'Il CAP deve essere composto da 5 cifre.'}};
    if(!/^[A-Z]{2}$/.test(province))return {status:422,body:{ok:false,eligible:false,validFullAddress:false,error:'La Provincia deve essere indicata con due lettere, ad esempio VR.'}};
  }

  const countryCode=country==='IT'?'it':country.toLowerCase();
  const q=[address,cap,city,province,country==='IT'?'Italia':country].filter(Boolean).join(', ');
  let results=[];
  try{
    const qs=new URLSearchParams({format:'json',addressdetails:'1',limit:'10',countrycodes:countryCode,q});
    const resp=await fetch('https://nominatim.openstreetmap.org/search?'+qs.toString(),{headers:{Accept:'application/json','User-Agent':'LaFabbricaDelleApi/1.0 Cloudflare address-validator'}});
    if(resp.ok)results=await resp.json();
  }catch(_){}

  const cityNorm=normalizePlace(city),streetNorm=normalizePlace(address.replace(/\b\d+[A-Za-z\/]*/g,'').replace(/^(via|viale|piazza|corso|strada|vicolo|localita|località|frazione)\s+/i,''));
  const capNorm=cap.replace(/[\s-]+/g,'');
  let verified=(Array.isArray(results)?results:[]).find(item=>{
    const a=item.address||{},display=normalizePlace(item.display_name||'');
    const cities=[a.city,a.town,a.village,a.municipality,a.hamlet,a.suburb,a.county].filter(Boolean).map(normalizePlace);
    const cOk=cities.some(v=>v===cityNorm||v.includes(cityNorm)||cityNorm.includes(v))||display.includes(cityNorm);
    const p=String(a.postcode||'').replace(/[\s-]+/g,'');
    const pOk=!p||p===capNorm;
    const road=normalizePlace(a.road||a.pedestrian||a.residential||a.place||'');
    const sOk=!streetNorm||road.includes(streetNorm)||streetNorm.includes(road)||display.includes(streetNorm);
    return cOk&&pOk&&sOk;
  });

  if(!verified){
    try{
      const purl='https://photon.komoot.io/api/?limit=10&q='+encodeURIComponent(q);
      const resp=await fetch(purl,{headers:{Accept:'application/json','User-Agent':'LaFabbricaDelleApi/1.0 Cloudflare address-validator'}});
      if(resp.ok){
        const data=await resp.json();
        const feature=(data.features||[]).find(f=>{
          const p=f.properties||{};
          const cands=[p.city,p.locality,p.district,p.county].filter(Boolean).map(normalizePlace);
          const cOk=cands.some(v=>v===cityNorm||v.includes(cityNorm)||cityNorm.includes(v));
          const pc=String(p.postcode||'').replace(/[\s-]+/g,'');
          const pOk=!pc||pc===capNorm;
          const road=normalizePlace(p.street||p.name||'');
          const sOk=!streetNorm||road.includes(streetNorm)||streetNorm.includes(road);
          return cOk&&pOk&&sOk;
        });
        if(feature){
          verified={lat:String(feature.geometry.coordinates[1]),lon:String(feature.geometry.coordinates[0]),display_name:q};
        }
      }
    }catch(_){}
  }

  // If both public geocoders are temporarily unavailable, do not falsely label
  // a structurally valid address as wrong. It remains valid for checkout, but
  // local free-delivery eligibility is conservatively disabled.
  if(!verified){
    return {status:200,body:{ok:true,eligible:false,validAddressPair:true,validFullAddress:true,geocoded:false,country,verifiedAddress:q,verificationWarning:true}};
  }

  const lat=Number(verified.lat),lon=Number(verified.lon);
  let distanceKm=null,eligible=false;
  if(country==='IT'&&Number.isFinite(lat)&&Number.isFinite(lon)){
    distanceKm=Math.round(haversineKm(45.187,10.974,lat,lon)*10)/10;
    eligible=distanceKm<=50;
  }
  return {status:200,body:{ok:true,eligible,validAddressPair:true,validFullAddress:true,geocoded:true,country,distanceKm,verifiedAddress:verified.display_name||q}};
}


const SHOP_ROUTES = new Set(['/shop','/shop/','/shop/index.html','/shop-v2','/shop-v2/','/shop-v2.html','/shop.html']);

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

    if (url.pathname === '/api/phone-normalize') {
      let prefix = String(url.searchParams.get('prefix') || '').trim().replace(/[\s().-]/g, '');
      let national = String(url.searchParams.get('phone') || '').trim().replace(/[\s().-]/g, '');
      if (prefix.startsWith('00')) prefix = '+' + prefix.slice(2);
      if (!prefix.startsWith('+')) prefix = '+' + prefix.replace(/\D/g, '');
      national = national.replace(/^\+/, '').replace(/\D/g, '');

      if (!/^\+\d{1,4}$/.test(prefix) || !/^\d{4,14}$/.test(national)) {
        return Response.json({ ok:false, error:'Prefisso o numero non valido.' }, { status:422, headers:{'Cache-Control':'no-store'} });
      }

      const phone = parsePhoneNumberFromString(prefix + national);
      if (!phone || !phone.isValid()) {
        return Response.json({ ok:false, error:'La combinazione prefisso + numero non risulta valida.' }, { status:422, headers:{'Cache-Control':'no-store'} });
      }

      const callingCode = '+' + phone.countryCallingCode;
      if (callingCode !== prefix) {
        return Response.json({ ok:false, error:'Il numero non è compatibile con il prefisso indicato.' }, { status:422, headers:{'Cache-Control':'no-store'} });
      }

      return Response.json({
        ok:true,
        e164:phone.number,
        international:phone.formatInternational(),
        callingCode,
        national:phone.nationalNumber,
        phoneCountry:phone.country || ''
      }, { headers:{'Cache-Control':'no-store'} });
    }

    if (url.pathname === '/api/local-delivery-check') {
      const result = await validateAddressNative(url);
      return Response.json(result.body,{status:result.status,headers:{'Cache-Control':'no-store'}});
    }

    if (url.pathname === '/api/shipping-estimate' && request.method === 'POST') {
      let body=null;
      try{ body=await request.json(); }catch(_){}
      const country=String(body?.country||'').trim().toUpperCase();
      const items=Array.isArray(body?.items)?body.items:[];
      if(!country||!items.length||items.length>40){
        return Response.json({ok:false,error:'Dati spedizione non validi.'},{status:400,headers:{'Cache-Control':'no-store'}});
      }
      return Response.json(calcPosteShipping(country,items),{headers:{'Cache-Control':'no-store'}});
    }

    if (url.pathname.startsWith('/api/')) {
      const target = new URL(url.pathname + url.search, VERCEL_V2_ORIGIN);
      return fetch(new Request(target, request));
    }

    // Serve /shop from HTML bundled inside this Worker deployment.
    // Apply the final navigation repair here, at the last possible layer, so no
    // stale/static source or older section markup can override these links.
    if (SHOP_ROUTES.has(url.pathname)) {
      let shopHtml = SHOP_HTML;

      const navRepairs = [
        ['href="#alveare">Alveare</a>','href="#prodotto-castagno">Alveare</a>'],
        ['href="#propoli">Propoli</a>','href="#prodotto-bee-energy-bio">Propoli</a>'],
        ['href="#cosmesi">Cosmesi</a>','href="#prodotto-cosmesi-crema-mani">Cosmesi</a>'],
        ['href="#linea-veleni">Linea Veleni</a>','href="#prodotto-unguento-apis">Linea Veleni</a>'],
        ['href="#tesori-francesco">Tesori</a>','href="#prodotto-tesori-limoncello">Tesori</a>']
      ];
      for (const [from,to] of navRepairs) shopHtml = shopHtml.replaceAll(from,to);

      const oldSections = [
        ["Una selezione di propoli e integratori da scoprire con semplicità.</p>","Una selezione di propoli e integratori da scoprire con semplicità.</p><div class=\"cf-shop-line-cta\"><a href=\"#prodotto-bee-energy-bio\">Vai alla linea completa →</a></div>"],
        ["Creme, saponi, burrocacao e creazioni in cera d’api.</p>","Creme, saponi, burrocacao e creazioni in cera d’api.</p><div class=\"cf-shop-line-cta\"><a href=\"#prodotto-cosmesi-crema-mani\">Vai alla linea completa →</a></div>"],
        ["Mieli selezionati, favo, polline, pappa reale e piccole specialità.</p>","Mieli selezionati, favo, polline, pappa reale e piccole specialità.</p><div class=\"cf-shop-line-cta\"><a href=\"#prodotto-castagno\">Vai alla linea completa →</a></div>"],
        ["Sette prodotti cosmetici dedicati a massaggio, viso e corpo.</p>","Sette prodotti cosmetici dedicati a massaggio, viso e corpo.</p><div class=\"cf-shop-line-cta\"><a href=\"#prodotto-unguento-apis\">Vai alla linea completa →</a></div>"],
        ["Limoncello, liquore al caffè e castagne al rum.</p>","Limoncello, liquore al caffè e castagne al rum.</p><div class=\"cf-shop-line-cta\"><a href=\"#prodotto-tesori-limoncello\">Vai alla linea completa →</a></div>"]
      ];
      // Product cards are already rendered directly below each category, so no extra CTA is injected.

      shopHtml = shopHtml
        .replaceAll(/<div class="(?:cf-shop-line-cta|catalog-line-cta(?: catalog-line-cta-top)?)"><a[^>]*>Vai alla linea completa →<\/a><\/div>/g,'')
        .replace('<body', '<body data-cf-shop-build="20260925-images-nav-1"');
      return new Response(shopHtml, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=UTF-8',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Shop-Source': 'worker-bundled-canonical',
          'X-Shop-Build': '20260925-images-nav-1'
        }
      });
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
    if (assetResponse.ok) return assetResponse;

    if (url.pathname.startsWith('/images/')) {
      // First fallback: images already present in the Cloudflare migration branch.
      const rawPrimary = 'https://raw.githubusercontent.com/cleo6920/Miele--render/cloudflare-test' + url.pathname;
      let response = await fetch(rawPrimary, { headers:{'User-Agent':'La-Fabbrica-delle-Api-Cloudflare-Test'} });
      if (response.ok) {
        const headers = new Headers(response.headers);
        headers.set('Cache-Control','public, max-age=300');
        return new Response(response.body,{status:200,headers});
      }

      // Second fallback: newer V2 image assets that still live in miele-backend.
      const rawSecondary = 'https://raw.githubusercontent.com/cleo6920/miele-backend/main' + url.pathname;
      response = await fetch(rawSecondary, { headers:{'User-Agent':'La-Fabbrica-delle-Api-Cloudflare-Test'} });
      if (response.ok) {
        const headers = new Headers(response.headers);
        headers.set('Cache-Control','public, max-age=300');
        return new Response(response.body,{status:200,headers});
      }
    }

    if (url.pathname.startsWith('/downloads/')) {
      const target = new URL(url.pathname + url.search, VERCEL_V2_ORIGIN);
      return fetch(new Request(target, request));
    }

    return assetResponse;
  }
};
