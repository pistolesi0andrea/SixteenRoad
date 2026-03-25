import { CollectionCatalogView } from "@/components/catalog/CollectionCatalogView";
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
    <CollectionCatalogView
      handle={collection.handle}
      title={collection.title}
      products={collection.products}
    />
  );
}
