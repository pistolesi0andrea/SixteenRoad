import { ProductDetailView } from "@/components/product/ProductDetailView";
import { getProduct } from "@/lib/shopify";
import { notFound } from "next/navigation";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const product = await getProduct(handle);

  if (!product) {
    return notFound();
  }

  return <ProductDetailView product={product} />;
}
