import { ShopifyAnalyticsView, createAnalyticsProduct } from "@/components/analytics/ShopifyAnalyticsTracker";
import { ProductDetailView } from "@/components/product/ProductDetailView";
import { AnalyticsEventName, AnalyticsPageType } from "@shopify/hydrogen-react";
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

  return (
    <>
      <ShopifyAnalyticsView
        eventName={AnalyticsEventName.PRODUCT_VIEW}
        pageType={AnalyticsPageType.product}
        resourceId={product.id}
        products={[createAnalyticsProduct(product)]}
        totalValue={Number(product.priceRange.minVariantPrice.amount)}
      />
      <ProductDetailView product={product} />
    </>
  );
}
