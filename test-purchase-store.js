const crypto = require('crypto');

const orders = new Map();
const coupons = new Map();
const balances = new Map();

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

function pointsForItem(item) {
  const productId = clean(item.productId, 220);
  const productName = clean(item.productName || item.name, 220);
  const price = Number(item.pricePerPack ?? item.amount ?? 0);
  const quantity = Math.max(1, Number(item.quantity || 1));

  let perUnit = baseBeePoints(price);
  let bonusPerUnit = 0;
  let calculation = 'fascia-prezzo';

  if (isVenomItem(productId, productName)) {
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
  const mergedItems = safeItems.map((item, index) => ({
    ...item,
    ...(cartMeta[index] || {}),
    name: item.name,
    amount: item.amount,
    quantity: item.quantity
  }));

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

  const coupon = {
    code: couponCode,
    orderId,
    customerKey: key,
    points: beePoints,
    status: 'ATTIVO',
    createdAt,
    usedAt: null,
    balanceAfter: currentBalance
  };

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
  return {
    ...order,
    coupon: coupon ? {
      code: coupon.code,
      points: coupon.points,
      status: coupon.status,
      createdAt: coupon.createdAt,
      usedAt: coupon.usedAt
    } : null,
    balance,
    rewardTarget: 100,
    rewardUnlocked: balance >= 100,
    remainingToReward: Math.max(0, 100 - balance)
  };
}

function redeemTestCoupon(rawCode) {
  if (!isTestPurchaseMode()) throw new Error('Modalità acquisto simulato non attiva.');
  const code = clean(rawCode, 80).toUpperCase();
  const coupon = coupons.get(code);
  if (!coupon) {
    return { ok: false, status: 404, error: 'Coupon TEST non trovato.' };
  }
  if (coupon.status !== 'ATTIVO') {
    const balance = Number(balances.get(coupon.customerKey) || 0);
    return {
      ok: false,
      status: 409,
      error: 'Coupon TEST già utilizzato.',
      couponStatus: coupon.status,
      balance,
      rewardUnlocked: balance >= 100,
      remainingToReward: Math.max(0, 100 - balance)
    };
  }

  const before = Number(balances.get(coupon.customerKey) || 0);
  const after = before + Number(coupon.points || 0);
  balances.set(coupon.customerKey, after);
  coupon.status = 'UTILIZZATO';
  coupon.usedAt = new Date().toISOString();
  coupon.balanceAfter = after;

  return {
    ok: true,
    status: 200,
    couponStatus: coupon.status,
    pointsAdded: coupon.points,
    balanceBefore: before,
    balance: after,
    rewardTarget: 100,
    rewardUnlocked: after >= 100,
    remainingToReward: Math.max(0, 100 - after)
  };
}

module.exports = {
  isTestPurchaseMode,
  createTestPurchase,
  getTestPurchase,
  redeemTestCoupon
};
