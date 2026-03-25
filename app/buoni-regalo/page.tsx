import { getGiftCardProduct } from "@/lib/shopify";
import { GiftCardBuilder } from "@/components/GiftCardBuilder";

export default async function GiftCardPage() {
  const product = await getGiftCardProduct();

  return <GiftCardBuilder product={product} />;
}
