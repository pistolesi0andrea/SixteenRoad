import type { Metadata } from "next";
import { ProductDetailView } from "@/components/product/ProductDetailView";
import { getProduct } from "@/lib/shopify";
import { notFound } from "next/navigation";

const SITE_NAME = "Sixteen Road";
const FALLBACK_PRODUCT_DESCRIPTION =
  "Capo selezionato da Sixteen Road, con dettagli curati e ricerca vintage contemporanea.";

function buildProductDescription(description: string) {
  const normalizedDescription = description.replace(/\s+/g, " ").trim();

  if (!normalizedDescription) {
    return FALLBACK_PRODUCT_DESCRIPTION;
  }

  return normalizedDescription.slice(0, 180);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProduct(handle);

  if (!product) {
    return {
      title: "Prodotto non trovato",
    };
  }

  const image = product.featuredImage?.url ?? product.images.edges[0]?.node.url;
  const description = buildProductDescription(product.description);

  return {
    title: product.title,
    description,
    alternates: {
      canonical: `/products/${product.handle}`,
    },
    openGraph: {
      type: "website",
      url: `/products/${product.handle}`,
      siteName: SITE_NAME,
      title: `${product.title} | ${SITE_NAME}`,
      description,
      locale: "it_IT",
      images: image
        ? [
            {
              url: image,
              alt: product.featuredImage?.altText ?? product.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.title} | ${SITE_NAME}`,
      description,
      images: image ? [image] : undefined,
    },
  };
}

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

  return <ProductDetailView key={product.id} product={product} />;
}
