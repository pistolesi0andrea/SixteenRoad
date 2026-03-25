"use client";

import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { getProductImages, getProductPricing, getPrimaryProductImage } from "@/lib/product-helpers";
import { WishlistToggleButton } from "@/components/wishlist/WishlistToggleButton";
import { ShopifyProduct } from "@/types/shopify";
import Image from "next/image";
import Link from "next/link";

function formatPrice(amount: string, currencyCode: string) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 2,
  }).format(Number(amount));
}

export function CatalogProductCard({
  product,
  collectionHandle,
}: {
  product: ShopifyProduct;
  collectionHandle?: string;
}) {
  const { price, compareAtPrice, discountPercentage, hasDiscount } = getProductPricing(product);
  const images = getProductImages(product);
  const primaryImage = getPrimaryProductImage(product);
  const secondaryImage = images[1] ?? null;
  const showSalePricing = collectionHandle === "saldi" && hasDiscount;

  return (
    <article className="group overflow-hidden border border-[rgba(61,36,16,0.12)] bg-brand-tortora">
      <div className="relative overflow-hidden bg-brand-tortora p-3 sm:p-4">
        <Link href={`/products/${product.handle}`} className="block">
          <div className="relative aspect-[4/5] overflow-hidden bg-[rgba(255,255,255,0.34)]">
            {primaryImage ? (
              <>
                <Image
                  src={primaryImage.url}
                  alt={primaryImage.altText || product.title}
                  fill
                  className={`object-cover object-center transition-all duration-500 ease-out ${
                    secondaryImage ? "group-hover:scale-[1.01] group-hover:opacity-0" : "group-hover:scale-[1.02]"
                  }`}
                  sizes="(min-width: 1536px) 24vw, (min-width: 1280px) 31vw, (min-width: 768px) 48vw, 100vw"
                />
                {secondaryImage ? (
                  <Image
                    src={secondaryImage.url}
                    alt={secondaryImage.altText || `${product.title} second view`}
                    fill
                    className="object-cover object-center opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
                    sizes="(min-width: 1536px) 24vw, (min-width: 1280px) 31vw, (min-width: 768px) 48vw, 100vw"
                  />
                ) : null}
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-[13px] uppercase tracking-[0.2em] text-brand-dark-brown">
                No image
              </div>
            )}
          </div>
        </Link>

        <WishlistToggleButton
          product={product}
          ariaLabel={`Salva ${product.title} nella wishlist`}
          className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center border border-brand-border bg-[rgba(242,236,224,0.94)] text-brand-dark-brown transition-colors duration-200 sm:left-4 sm:top-4 sm:h-10 sm:w-10"
          activeClassName="bg-brand-dark-brown text-white"
          inactiveClassName="hover:bg-brand-dark-brown hover:text-brand-cream"
        />
        <AddToCartButton
          product={product}
          ariaLabel={`Aggiungi ${product.title} al carrello`}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center border border-brand-border bg-[rgba(242,236,224,0.94)] text-[20px] text-brand-dark-brown transition-colors duration-200 hover:bg-brand-dark-brown hover:text-brand-cream sm:right-4 sm:top-4 sm:h-10 sm:w-10 sm:text-[22px]"
        >
          +
        </AddToCartButton>
      </div>

      <div className="bg-brand-dark-brown px-3 py-3 text-brand-cream sm:px-4 sm:py-4">
        <Link href={`/products/${product.handle}`} className="block no-underline">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h3 className="min-h-[40px] text-[16px] leading-[1.12] font-josefin uppercase tracking-[0.04em] text-white sm:min-h-[44px] sm:text-[20px] sm:leading-[1.08]">
                {product.title}
              </h3>
            </div>
            <div className="shrink-0 text-right">
              {showSalePricing && compareAtPrice ? (
                <>
                  <div className="text-[20px] leading-none text-white sm:text-[24px]">
                    {formatPrice(price.amount, price.currencyCode)}
                  </div>
                  <div className="mt-2 flex flex-col items-end gap-2">
                    <div className="text-[15px] leading-none text-[rgba(242,236,224,0.72)] line-through sm:text-[17px]">
                      {formatPrice(compareAtPrice.amount, compareAtPrice.currencyCode)}
                    </div>
                    <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
                      {discountPercentage ? (
                        <span className="border border-[rgba(242,236,224,0.28)] bg-[rgba(242,236,224,0.08)] px-2 py-1 text-[12px] uppercase tracking-[0.16em] text-white sm:text-[13px]">
                          -{discountPercentage}%
                        </span>
                      ) : null}
                    </div>
                    <div className="text-[12px] uppercase tracking-[0.14em] text-[rgba(242,236,224,0.72)] sm:text-[13px]">
                      Risparmi{" "}
                      {formatPrice(
                        String(Number(compareAtPrice.amount) - Number(price.amount)),
                        price.currencyCode,
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-[19px] leading-none text-white sm:text-[22px]">
                  {formatPrice(price.amount, price.currencyCode)}
                </div>
              )}
            </div>
          </div>
        </Link>
        <div className="mt-2 text-[10px] uppercase tracking-[0.22em] text-[rgba(242,236,224,0.7)]">
          {product.vendor}
        </div>
      </div>
    </article>
  );
}
