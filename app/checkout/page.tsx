import type { Metadata } from "next";
import { CheckoutPreview } from "@/components/cart/CheckoutPreview";

export const metadata: Metadata = {
  title: "Checkout Preview | Sixteen Road",
  description: "Preview del checkout Shopify per Sixteen Road.",
};

export default function CheckoutPage() {
  return <CheckoutPreview />;
}
