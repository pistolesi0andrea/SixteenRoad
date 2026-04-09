import {
  ShopifyCartLine,
  ShopifyImage,
  ShopifyMoney,
  ShopifyProduct,
  ShopifyProductVariant,
} from "@/types/shopify";

function isValidCompareAtPrice(
  price: ShopifyMoney,
  compareAtPrice?: ShopifyMoney | null,
): compareAtPrice is ShopifyMoney {
  return Boolean(compareAtPrice && Number(compareAtPrice.amount) > Number(price.amount));
}

export function getProductImages(product: ShopifyProduct): ShopifyImage[] {
  const gallery = product.images.edges.map((edge) => edge.node).filter((image) => image?.url);

  if (gallery.length > 0) {
    return gallery;
  }

  return product.featuredImage?.url ? [product.featuredImage] : [];
}

export function getPrimaryProductImage(product: ShopifyProduct): ShopifyImage | null {
  return getProductImages(product)[0] ?? null;
}

export function isShopifyCdnImage(image: ShopifyImage | string | null | undefined) {
  const source = typeof image === "string" ? image : image?.url;

  if (!source) {
    return false;
  }

  try {
    const hostname = new URL(source).hostname;
    return hostname === "cdn.shopify.com" || hostname.endsWith(".myshopify.com");
  } catch {
    return false;
  }
}

export function getFirstAvailableVariant(product: ShopifyProduct): ShopifyProductVariant | null {
  const variants = product.variants.edges.map((edge) => edge.node).filter((variant) => variant.id);
  return variants.find((variant) => variant.availableForSale) ?? variants[0] ?? null;
}

export function getProductPricing(
  product: ShopifyProduct,
  selectedVariant?: ShopifyProductVariant | null,
): {
  price: ShopifyMoney;
  compareAtPrice: ShopifyMoney | null;
  discountPercentage: number | null;
  hasDiscount: boolean;
} {
  const variants = product.variants.edges.map((edge) => edge.node).filter((variant) => variant.id);
  const variant = selectedVariant ?? getFirstAvailableVariant(product);
  const price = variant?.price ?? product.priceRange.minVariantPrice;

  const compareAtPrice =
    variants
      .map((item) => item.compareAtPrice ?? null)
      .find((candidate) => isValidCompareAtPrice(price, candidate)) ??
    (isValidCompareAtPrice(price, variant?.compareAtPrice) ? variant.compareAtPrice : null);

  const discountPercentage = compareAtPrice
    ? Math.round(((Number(compareAtPrice.amount) - Number(price.amount)) / Number(compareAtPrice.amount)) * 100)
    : null;

  return {
    price,
    compareAtPrice,
    discountPercentage,
    hasDiscount: Boolean(compareAtPrice && discountPercentage && discountPercentage > 0),
  };
}

export function isGiftCardEntity({
  handle,
  title,
  productType,
  tags = [],
}: {
  handle?: string | null;
  title?: string | null;
  productType?: string | null;
  tags?: string[];
}) {
  const haystack = [handle ?? "", title ?? "", productType ?? "", ...tags]
    .join(" ")
    .toLowerCase();

  return (
    haystack.includes("gift card") ||
    haystack.includes("giftcard") ||
    haystack.includes("buono regalo") ||
    haystack.includes("buoni regalo") ||
    haystack.includes("gift-card")
  );
}

export function isGiftCardProduct(product: ShopifyProduct) {
  return isGiftCardEntity(product);
}

export function isGiftCardCartLine(line: ShopifyCartLine) {
  return isGiftCardEntity(line);
}
