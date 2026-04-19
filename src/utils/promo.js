const PROMO_MAP = {
  REACT10: {
    code: 'REACT10',
    label: 'React Community 10% Off',
    type: 'percent',
    value: 10,
  },
  SAVE25: {
    code: 'SAVE25',
    label: '$25 Off Orders $200+',
    type: 'fixed',
    value: 25,
    minSubtotal: 200,
  },
  FREESHIP: {
    code: 'FREESHIP',
    label: 'Free Shipping',
    type: 'shipping',
    value: 100,
  },
};

export const normalizePromoCode = (code = '') => code.trim().toUpperCase();

export const getPromoDefinition = (code = '') => {
  const normalized = normalizePromoCode(code);
  return PROMO_MAP[normalized] || null;
};

export const evaluatePromo = ({ code = '', subtotal = 0, shippingCost = 0 }) => {
  const normalizedCode = normalizePromoCode(code);

  if (!normalizedCode) {
    return {
      isValid: false,
      code: '',
      message: '',
      itemDiscount: 0,
      shippingDiscount: 0,
      totalDiscount: 0,
      label: '',
    };
  }

  const promo = getPromoDefinition(normalizedCode);

  if (!promo) {
    return {
      isValid: false,
      code: normalizedCode,
      message: 'Promo code is not recognized.',
      itemDiscount: 0,
      shippingDiscount: 0,
      totalDiscount: 0,
      label: '',
    };
  }

  if (promo.minSubtotal && subtotal < promo.minSubtotal) {
    return {
      isValid: false,
      code: normalizedCode,
      message: `This code requires a minimum subtotal of $${promo.minSubtotal}.`,
      itemDiscount: 0,
      shippingDiscount: 0,
      totalDiscount: 0,
      label: promo.label,
    };
  }

  let itemDiscount = 0;
  let shippingDiscount = 0;

  if (promo.type === 'percent') {
    itemDiscount = subtotal * (promo.value / 100);
  }

  if (promo.type === 'fixed') {
    itemDiscount = promo.value;
  }

  if (promo.type === 'shipping') {
    shippingDiscount = shippingCost;
  }

  itemDiscount = Math.min(itemDiscount, subtotal);
  shippingDiscount = Math.min(shippingDiscount, shippingCost);

  return {
    isValid: true,
    code: normalizedCode,
    message: `${promo.label} applied`,
    itemDiscount,
    shippingDiscount,
    totalDiscount: itemDiscount + shippingDiscount,
    label: promo.label,
  };
};

export const PROMO_CODES = Object.values(PROMO_MAP);
