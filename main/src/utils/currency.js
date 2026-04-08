export const formatINR = (value, { withSymbol = true } = {}) => {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return withSymbol ? "₹0" : "0";

  return new Intl.NumberFormat("en-IN", {
    style: withSymbol ? "currency" : "decimal",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
};