import { ShopifyAnalyticsView } from "@/components/analytics/ShopifyAnalyticsTracker";
import { CollectionCatalogView } from "@/components/catalog/CollectionCatalogView";
import { AnalyticsEventName, AnalyticsPageType } from "@shopify/hydrogen-react";
import { getCollection, getProducts } from "@/lib/shopify";
import { notFound } from "next/navigation";

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;

  const collection =
    handle === "abbigliamento"
      ? {
          id: "collection_abbigliamento_all",
          handle,
          title: "Abbigliamento",
          description: "",
          descriptionHtml: "",
          products: await getProducts({ all: true }),
        }
      : await getCollection(handle);

  if (!collection) {
    notFound();
  }

  return (
    <>
      <ShopifyAnalyticsView
        eventName={AnalyticsEventName.COLLECTION_VIEW}
        pageType={AnalyticsPageType.collection}
        resourceId={collection.id}
        collectionId={collection.id}
        collectionHandle={collection.handle}
      />
      <CollectionCatalogView
        handle={collection.handle}
        title={collection.title}
        products={collection.products}
      />
    </>
  );
}
