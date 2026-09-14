const crypto = require('crypto');

const orders = new Map();
const coupons = new Map();
const balances = new Map();
const pendingCoupons = new Map();
const rewardClaims = new Map();

const VENOM_IDS = new Set([
  'unguento-apis',
  'apis1-crema-viso-veleno-api',
  'apis2-siero-viso-veleno-api',
  'apis4-crema-corpo-veleno-api-manuka',
  'apis5-gommage-veleno-api-manuka',
  'bagnodoccia-veleno-oro'
]);

const CUSTOM_TRIS_POINTS = {
  'favo-integrale': 4,
  'polline': 4,
  'orsetti': 1,
  'pappa-reale': 2,
  'bee-energy': 4,
  'propol-active': 4,
  'propoli-spray': 3,
  'propoli-alcolica': 2,
  'propoli-analcolica': 2,
  'crema-mani': 3,
  'burrocacao-propoli-aloe': 2,
  'burrocacao-miele-pappa': 2,
  'shampoo': 3,
  'saponetta-frutti-bosco': 1,
  'saponetta-lavanda': 1,
  'saponetta-aloe': 1,
  'candela-alveare': 2,
  'limoncello': 2,
  'liquore-caffe': 2,
  'castagne-rum': 2
};

const GIFT_PRODUCT_IDS = new Set(Object.keys(CUSTOM_TRIS_POINTS));

// Punti esatti dei 30 Tris predefiniti: somma Api dei tre prodotti + 3 Api bonus.
// Devono coincidere con la formula mostrata nelle card e nelle schede prodotto.
const PREDEFINED_TRIS_POINTS = {
  'tris-alveare-millefiori': 11,
  'tris-alveare-melone': 12,
  'tris-alveare-fragola': 12,
  'tris-alveare-pesca': 11,
  'tris-alveare-arancia': 12,
  'tris-alveare-castagno': 12,
  'tris-alveare-acacia-zenzero': 12,
  'tris-alveare-eucalipto': 10,
  'tris-alveare-balsammiel': 12,
  'tris-alveare-acacia-40g': 11,
  'tris-alveare-favo-integrale': 12,
  'tris-alveare-polline': 12,
  'tris-alveare-orsetti': 11,
  'tris-alveare-pappa-reale': 11,
  'tris-alveare-bee-energy': 11,
  'tris-alveare-propol-active': 13,
  'tris-alveare-propoli-spray': 13,
  'tris-alveare-propoli-alcolica': 12,
  'tris-alveare-propoli-analcolica': 12,
  'tris-alveare-crema-mani': 12,
  'tris-alveare-burrocacao-propoli-aloe': 13,
  'tris-alveare-burrocacao-miele-pappa': 13,
  'tris-alveare-shampoo': 12,
  'tris-alveare-saponetta-frutti-bosco': 12,
  'tris-alveare-saponetta-lavanda': 10,
  'tris-alveare-saponetta-aloe': 12,
  'tris-alveare-candela-alveare': 12,
  'tris-alveare-limoncello': 12,
  'tris-alveare-liquore-caffe': 12,
  'tris-alveare-castagne-rum': 12
};

const PREDEFINED_TRIS_NAME_POINTS = {
  'millefiori': 11,
  'melone': 12,
  'fragola': 12,
  'pesca': 11,
  'arancia': 12,
  'castagno': 12,
  'acacia e zenzero': 12,
  'eucalipto': 10,
  'balsamico italiano': 12,
  'acacia 40 g': 11,
  'acacia in favo': 12,
  'polline': 12,
  'orsetti': 11,
  'pappa reale': 11,
  'bee energy': 11,
  'propol active': 13,
  'propoli spray': 13,
  'propoli alcolica contagocce': 12,
  'propoli analcolica': 12,
  'crema mani': 12,
  'burrocacao propoli + aloe': 13,
  'burrocacao miele + pappa reale': 13,
  'shampoo': 12,
  'saponetta frutti di bosco': 12,
  'saponetta lavanda': 10,
  'saponetta aloe': 12,
  'candela alveare': 12,
  'limoncello': 12,
  'liquore al caffe': 12,
  'castagne al rum': 12
};

function isTestPurchaseMode() {
  return String(process.env.TEST_PURCHASE_MODE || '').trim().toLowerCase() === 'true';
}

function clean(value, max = 200) {
  return String(value || '').trim().slice(0, max);
}

function baseBeePoints(rawPrice) {
  const price = Number(rawPrice || 0);
  if (!Number.isFinite(price) || price <= 0) return 0;
  if (price <= 3.90) return 1;
  if (price <= 6.90) return 2;
  if (price <= 9.90) return 3;
  if (price <= 14.90) return 4;
  if (price <= 20.00) return 5;
  if (price <= 29.90) return 6;
  if (price <= 39.90) return 7;
  if (price <= 59.90) return 8;
  if (price <= 99.90) return 10;
  return 15;
}

function makeId(prefix) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

function makeCoupon() {
  const raw = crypto.randomBytes(5).toString('hex').toUpperCase();
  return `TEST-${raw.slice(0, 5)}-${raw.slice(5)}`;
}

function customerKey(customer) {
  const email = clean(customer && customer.email, 254).toLowerCase();
  if (email) return `email:${email}`;
  const phone = clean(customer && customer.phone, 50).replace(/\s+/g, '');
  if (phone) return `phone:${phone}`;
  return 'anonymous:test';
}

function isVenomItem(productId, productName) {
  if (VENOM_IDS.has(productId)) return true;
  const name = clean(productName, 180).toLowerCase();
  return /veleno d['’]api|sos dol|apis1|apis2|apis4|apis5|bagnodoccia.*oro/.test(name);
}

function isSosDolItem(productId, productName) {
  if (productId === 'unguento-apis') return true;
  return /\bsos\s*dol\b/i.test(clean(productName, 180));
}

function customTrisPoints(productId) {
  if (!String(productId || '').startsWith('tris-alveare-personalizzato-')) return null;
  let sum = 0;
  let count = 0;
  for (const [optionId, points] of Object.entries(CUSTOM_TRIS_POINTS)) {
    if (String(productId).includes(optionId)) {
      sum += points;
      count += 1;
    }
  }
  return count === 3 ? sum + 3 : null;
}

function normalizeTrisLabel(value) {
  return clean(value, 220)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’‘`´]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function predefinedTrisPoints(productId, productName) {
  const exact = PREDEFINED_TRIS_POINTS[String(productId || '')];
  if (exact) return exact;
  const normalizedName = normalizeTrisLabel(productName);
  const match = normalizedName.match(/tris dell'alveare\s*[–—-]\s*(.*?)(?:\s*\(|$)/i);
  if (!match) return null;
  return PREDEFINED_TRIS_NAME_POINTS[match[1].trim()] || null;
}

function pointsForItem(item) {
  const productId = clean(item.productId, 220);
  const productName = clean(item.productName || item.name, 220);
  const price = Number(item.pricePerPack ?? item.amount ?? 0);
  const quantity = Math.max(1, Number(item.quantity || 1));
  let perUnit = baseBeePoints(price);
  let bonusPerUnit = 0;
  let calculation = 'fascia-prezzo';

  if (isSosDolItem(productId, productName)) {
    perUnit = 10;
    bonusPerUnit = 2;
    calculation = 'SOS DOL = 10 Api totali, inclusi +2 bonus veleno';
  } else if (isVenomItem(productId, productName)) {
    perUnit += 2;
    bonusPerUnit = 2;
    calculation = 'fascia-prezzo +2 bonus veleno';
  } else if (String(productId).startsWith('tris-alveare-personalizzato-')) {
    const exact = customTrisPoints(productId);
    if (exact) {
      perUnit = exact;
      bonusPerUnit = 3;
      calculation = 'somma 3 prodotti +3 bonus tris';
    } else {
      perUnit += 3;
      bonusPerUnit = 3;
      calculation = 'fallback tris test';
    }
  } else if (predefinedTrisPoints(productId, productName)) {
    perUnit = predefinedTrisPoints(productId, productName);
    bonusPerUnit = 3;
    calculation = 'somma 3 prodotti +3 bonus tris';
  } else if (String(productId).startsWith('tris-alveare-') || /\btris\b/i.test(productName)) {
    perUnit += 3;
    bonusPerUnit = 3;
    calculation = 'fallback tris test';
  }

  return {
    productId,
    productName,
    price,
    quantity,
    pointsPerUnit: perUnit,
    bonusPerUnit,
    totalPoints: perUnit * quantity,
    calculation
  };
}

function createTestPurchase({ items, testCart, shippingEuro, customer, notes }) {
  if (!isTestPurchaseMode()) throw new Error('Modalità acquisto simulato non attiva.');
  const safeItems = Array.isArray(items) ? items : [];
  const cartMeta = Array.isArray(testCart) ? testCart : [];
  const mergedItems = safeItems.map((item, index) => ({ ...item, ...(cartMeta[index] || {}), name: item.name, amount: item.amount, quantity: item.quantity }));
  const pointLines = mergedItems.map(pointsForItem);
  const beePoints = pointLines.reduce((sum, line) => sum + line.totalPoints, 0);
  const goodsTotal = safeItems.reduce((sum, item) => sum + (Number(item.amount) * Number(item.quantity)), 0);
  const shipping = Math.max(0, Number(shippingEuro || 0));
  const total = Number((goodsTotal + shipping).toFixed(2));
  const orderId = makeId('TESTORD');
  const couponCode = makeCoupon();
  const key = customerKey(customer || {});
  const currentBalance = Number(balances.get(key) || 0);
  const createdAt = new Date().toISOString();

  const coupon = { code: couponCode, orderId, customerKey: key, points: beePoints, status: 'ATTIVO', createdAt, usedAt: null, balanceAfter: currentBalance };
  const order = {
    orderId,
    mode: 'TEST',
    createdAt,
    customerKey: key,
    customerLabel: clean((customer && (customer.email || customer.phone || customer.name)) || 'Cliente test', 120),
    items: pointLines,
    goodsTotal: Number(goodsTotal.toFixed(2)),
    shipping,
    total,
    beePoints,
    couponCode,
    notes: clean(notes, 500)
  };

  orders.set(orderId, order);
  coupons.set(couponCode, coupon);
  return getTestPurchase(orderId);
}

function getTestPurchase(orderId) {
  const order = orders.get(clean(orderId, 220));
  if (!order) return null;
  const coupon = coupons.get(order.couponCode);
  const balance = Number(balances.get(order.customerKey) || 0);
  const pending = pendingCoupons.get(order.customerKey);
  const addedToBalance = !!(coupon && pending && pending.has(coupon.code));
  return {
    ...order,
    coupon: coupon ? { code: coupon.code, points: coupon.points, status: coupon.status, createdAt: coupon.createdAt, usedAt: coupon.usedAt, addedToBalance } : null,
    balance,
    rewardTarget: 100,
    rewardUnlocked: balance >= 100,
    remainingToReward: Math.max(0, 100 - balance)
  };
}

function validateGiftProducts(rawProducts) {
  const products = Array.isArray(rawProducts) ? rawProducts.map(id => clean(id, 120)).filter(Boolean) : [];
  const unique = [...new Set(products)];
  if (products.length !== 5 || unique.length !== 5) {
    return { ok: false, error: 'Devi selezionare esattamente 5 prodotti diversi per il Cesto.' };
  }
  const invalid = unique.filter(id => !GIFT_PRODUCT_IDS.has(id));
  if (invalid.length) return { ok: false, error: 'Uno o più prodotti scelti per il Cesto non sono validi.' };
  return { ok: true, products: unique };
}

function claimTestReward(coupon, rawGiftProducts) {
  const gift = validateGiftProducts(rawGiftProducts);
  if (!gift.ok) {
    const balance = Number(balances.get(coupon.customerKey) || 0);
    return { ok: false, status: 400, error: gift.error, couponStatus: coupon.status, balance, rewardUnlocked: balance >= 100, remainingToReward: Math.max(0, 100 - balance) };
  }

  const key = coupon.customerKey;
  const before = Number(balances.get(key) || 0);
  if (before < 100) {
    return { ok: false, status: 409, error: `Servono ancora ${100 - before} Api prima di poter ottenere il Cesto.`, couponStatus: coupon.status, balance: before, rewardUnlocked: false, remainingToReward: 100 - before };
  }

  const pending = pendingCoupons.get(key) || new Set();
  const usedAt = new Date().toISOString();
  let invalidated = 0;
  for (const pendingCode of pending) {
    const pendingCoupon = coupons.get(pendingCode);
    if (!pendingCoupon || pendingCoupon.status !== 'ATTIVO') continue;
    pendingCoupon.status = 'UTILIZZATO';
    pendingCoupon.usedAt = usedAt;
    invalidated += 1;
  }

  pending.clear();
  pendingCoupons.set(key, pending);
  const after = Math.max(0, before - 100);
  balances.set(key, after);

  const claimId = makeId('TESTGIFT');
  rewardClaims.set(claimId, {
    claimId,
    customerKey: key,
    anchorCouponCode: coupon.code,
    giftProducts: gift.products,
    createdAt: usedAt,
    pointsSpent: 100,
    balanceBefore: before,
    balanceAfter: after,
    couponsInvalidated: invalidated
  });

  return {
    ok: true,
    status: 200,
    rewardClaimed: true,
    claimId,
    giftProducts: gift.products,
    couponsInvalidated: invalidated,
    pointsSpent: 100,
    couponStatus: coupon.status,
    balanceBefore: before,
    balance: after,
    rewardTarget: 100,
    rewardUnlocked: after >= 100,
    remainingToReward: Math.max(0, 100 - after)
  };
}

function redeemTestCoupon(rawCode, giftProducts) {
  if (!isTestPurchaseMode()) throw new Error('Modalità acquisto simulato non attiva.');
  const raw = clean(rawCode, 100).toUpperCase();
  const claimRequested = raw.startsWith('CLAIM:');
  const code = claimRequested ? clean(raw.slice(6), 80).toUpperCase() : clean(raw, 80).toUpperCase();
  const coupon = coupons.get(code);
  if (!coupon) return { ok: false, status: 404, error: 'Coupon TEST non trovato.' };
  if (claimRequested) return claimTestReward(coupon, giftProducts);

  const balance = Number(balances.get(coupon.customerKey) || 0);
  if (coupon.status !== 'ATTIVO') {
    return { ok: false, status: 409, error: 'Coupon TEST già utilizzato per ottenere un Cesto.', couponStatus: coupon.status, balance, rewardUnlocked: balance >= 100, remainingToReward: Math.max(0, 100 - balance) };
  }

  let pending = pendingCoupons.get(coupon.customerKey);
  if (!pending) {
    pending = new Set();
    pendingCoupons.set(coupon.customerKey, pending);
  }

  if (pending.has(code)) {
    return { ok: false, status: 409, error: 'Coupon TEST già inserito nel saldo. Resta valido fino alla richiesta del Cesto.', couponStatus: coupon.status, addedToBalance: true, balance, rewardUnlocked: balance >= 100, remainingToReward: Math.max(0, 100 - balance) };
  }

  const after = balance + Number(coupon.points || 0);
  pending.add(code);
  balances.set(coupon.customerKey, after);
  coupon.balanceAfter = after;

  return { ok: true, status: 200, couponStatus: coupon.status, addedToBalance: true, pointsAdded: coupon.points, balanceBefore: balance, balance: after, rewardTarget: 100, rewardUnlocked: after >= 100, remainingToReward: Math.max(0, 100 - after) };
}

module.exports = {
  isTestPurchaseMode,
  createTestPurchase,
  getTestPurchase,
  redeemTestCoupon
};