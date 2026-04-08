export function getPrimaryImage(product, selectedColorIndex = 0) {
  if (product?.variants?.length) {
    return product.variants[selectedColorIndex]?.images?.[0] || product.variants[0]?.images?.[0];
  }
  return product.image;
}