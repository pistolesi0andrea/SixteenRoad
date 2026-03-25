import {
  ShopifyAttribute,
  ShopifyImage,
  ShopifyMoney,
  ShopifyStoreAvailability,
} from "@/types/shopify";

export interface CartLineItem {
  id: string;
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
  quantity: number;
  pickupLocations: ShopifyStoreAvailability[];
  attributes: ShopifyAttribute[];
}
