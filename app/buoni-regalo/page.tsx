import { getGiftCardProduct } from "@/lib/shopify";
import { GiftCardBuilder } from "@/components/GiftCardBuilder";

export const revalidate = 10;

export default async function GiftCardPage() {
  const product = await getGiftCardProduct();

  return <GiftCardBuilder product={product} />;
}
