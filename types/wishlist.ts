import { ShopifyImage, ShopifyMoney } from "@/types/shopify";

export interface WishlistItem {
  id: string;
  handle: string;
  title: string;
  vendor: string;
  productType: string;
  color: string | null;
  availableForSale: boolean;
  featuredImage: ShopifyImage | null;
  price: ShopifyMoney;
}
