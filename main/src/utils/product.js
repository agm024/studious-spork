/**
 * Shared product utility functions used across ProductCard, ProductListing, and Cart.
 */

function roundMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

/** Returns admin-configured discount percentage from product payload. */
export function getDiscount(product) {
  const pct = Number(product?.discount_percent ?? product?.discountPercent ?? 0);
  if (!Number.isFinite(pct)) return 0;
  return Math.max(0, Math.min(90, Math.round(pct)));
}

/** Returns the original/base price from payload. */
export function getBasePrice(product) {
  const price = Number(product?.price);
  return Number.isFinite(price) && price > 0 ? price : 0;
}

/** Returns discounted selling price after applying admin discount_percent. */
export function getSalePrice(product) {
  const base = getBasePrice(product);
  const pct = getDiscount(product);
  if (base <= 0 || pct <= 0) return base;
  return roundMoney(base * (1 - pct / 100));
}

/** Computes MRP from sale price and discount percentage. */
export function getMRP(price, discountPct) {
  const salePrice = Number(price) || 0;
  const pct = Number(discountPct) || 0;
  if (salePrice <= 0 || pct <= 0) return salePrice;
  const base = salePrice / (1 - pct / 100);
  return roundMoney(base);
}

/** Returns a deterministic fake review count based on product id. */
export function getReviewCount(id) {
  const base = (Number(id) * 37 + 113) % 950;
  return base + 50;
}
