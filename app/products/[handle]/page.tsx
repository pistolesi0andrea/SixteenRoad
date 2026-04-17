import type { Metadata } from "next";
import { ProductDetailView } from "@/components/product/ProductDetailView";
import { getOptimizedShopifyImageUrl } from "@/lib/product-helpers";
import { getProduct } from "@/lib/shopify";
import { notFound } from "next/navigation";

const SITE_NAME = "Sixteen Road";
const SITE_URL = "https://www.sixteenroad.com";
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

  const rawImage = product.featuredImage?.url ?? product.images.edges[0]?.node.url ?? null;
  const image = rawImage ? getOptimizedShopifyImageUrl(rawImage, 1200) : null;
  const description = buildProductDescription(product.description);
  const productUrl = `${SITE_URL}/products/${product.handle}`;

  return {
    title: product.title,
    description,
    alternates: {
      canonical: `/products/${product.handle}`,
    },
    openGraph: {
      type: "website",
      url: productUrl,
      siteName: SITE_NAME,
      title: `${product.title} | ${SITE_NAME}`,
      description,
      locale: "it_IT",
      images: image
        ? [
            {
              url: image,
              width: 1200,
              height: 1200,
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
