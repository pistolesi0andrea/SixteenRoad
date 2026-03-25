export interface ShopifyMoney {
  amount: string;
  currencyCode: string;
}

export interface ShopifyImage {
  url: string;
  altText: string | null;
}

export interface ShopifySelectedOption {
  name: string;
  value: string;
}

export interface ShopifyAttribute {
  key: string;
  value: string;
}

export interface ShopifyStoreLocation {
  id: string;
  name: string;
}

export interface ShopifyStoreAvailability {
  available: boolean;
  pickUpTime: string | null;
  quantityAvailable: number | null;
  location: ShopifyStoreLocation;
}

export interface ShopifyCartDiscountCode {
  code: string;
  applicable: boolean;
}

export interface ShopifyCartDiscountAllocation {
  type: string;
  code?: string;
  title?: string;
  targetType?: string;
  discountedAmount: ShopifyMoney;
}

export interface ShopifyProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  currentlyNotInStock?: boolean;
  quantityAvailable?: number | null;
  price: ShopifyMoney;
  compareAtPrice?: ShopifyMoney | null;
  selectedOptions: ShopifySelectedOption[];
  storeAvailability?: ShopifyStoreAvailability[];
}

export interface ShopifyProductOption {
  name: string;
  values: string[];
}

export interface ShopifyProductDetails {
  composition?: string;
  fitNotes?: string;
  sizeGuide?: string[];
  condition?: string;
  measurements?: string[];
}

export interface ShopifyProductCollectionRef {
  handle: string;
  title: string;
}

export interface ShopifyProduct {
  id: string;
  handle: string;
  title: string;
  createdAt: string;
  description: string;
  descriptionHtml: string;
  availableForSale: boolean;
  vendor: string;
  productType: string;
  tags: string[];
  priceRange: {
    maxVariantPrice: ShopifyMoney;
    minVariantPrice: ShopifyMoney;
  };
  featuredImage: ShopifyImage | null;
  images: {
    edges: Array<{
      node: ShopifyImage;
    }>;
  };
  variants: {
    edges: Array<{
      node: ShopifyProductVariant;
    }>;
  };
  options: ShopifyProductOption[];
  collections?: ShopifyProductCollectionRef[];
  details?: ShopifyProductDetails;
}

export interface ShopifyCollection {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  products: ShopifyProduct[];
}

export interface ShopifyCartLine {
  id: string;
  quantity: number;
  merchandiseId: string;
  productId: string;
  handle: string;
  title: string;
  vendor: string;
  productType: string;
  color: string | null;
  size: string | null;
  featuredImage: ShopifyImage | null;
  price: ShopifyMoney;
  pickupLocations: ShopifyStoreAvailability[];
  attributes: ShopifyAttribute[];
}

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: ShopifyMoney;
    totalAmount: ShopifyMoney;
  };
  discountCodes: ShopifyCartDiscountCode[];
  discountAllocations: ShopifyCartDiscountAllocation[];
  lines: ShopifyCartLine[];
}

export interface ShopifyCartInputLine {
  merchandiseId: string;
  quantity: number;
  attributes?: ShopifyAttribute[];
}

export type ShopifyCheckoutDeliveryMode = "shipping" | "pickup";

export interface ShopifyCheckoutInput {
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  address1?: string;
  city?: string;
  postalCode?: string;
  note?: string;
  deliveryMode: ShopifyCheckoutDeliveryMode;
}

export interface ShopifyStorefrontAvailability {
  enabled: boolean;
  apiVersion: string;
  storeDomain: string | null;
}
