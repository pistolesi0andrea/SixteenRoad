"use client";

import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { getProductImages, getProductPricing } from "@/lib/product-helpers";
import { StorePickupPanel } from "@/components/product/StorePickupPanel";
import { WishlistToggleButton } from "@/components/wishlist/WishlistToggleButton";
import { ShopifyProduct, ShopifyProductVariant } from "@/types/shopify";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

function formatPrice(amount: string, currencyCode: string) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 2,
  }).format(Number(amount));
}

function getVariantSize(variant: ShopifyProductVariant) {
  return (
    variant.selectedOptions.find(({ name }) => {
      const normalizedName = name.trim().toLowerCase();
      return normalizedName === "size" || normalizedName === "taglia";
    })?.value ?? variant.title
  );
}

function getProductColor(product: ShopifyProduct) {
  return (
    product.options.find(({ name }) => {
      const normalizedName = name.trim().toLowerCase();
      return normalizedName === "color" || normalizedName === "colore";
    })?.values[0] ?? null
  );
}

export function ProductDetailView({ product }: { product: ShopifyProduct }) {
  const variants = product.variants.edges.map((edge) => edge.node).filter((variant) => variant.id);
  const images = getProductImages(product);
  const defaultVariant = useMemo(
    () => variants.find((variant) => variant.availableForSale) ?? variants[0] ?? null,
    [variants],
  );
  const [selectedVariantId, setSelectedVariantId] = useState(defaultVariant?.id ?? "");
  const [selectedImageUrl, setSelectedImageUrl] = useState(images[0]?.url ?? "");

  const selectedVariant = useMemo(
    () => variants.find((variant) => variant.id === selectedVariantId) ?? defaultVariant,
    [defaultVariant, selectedVariantId, variants],
  );
  const selectedImage = useMemo(
    () => images.find((image) => image.url === selectedImageUrl) ?? images[0] ?? null,
    [images, selectedImageUrl],
  );

  const color = getProductColor(product);
  const { price, compareAtPrice, discountPercentage, hasDiscount } = getProductPricing(
    product,
    selectedVariant,
  );
  const selectedSize = selectedVariant ? getVariantSize(selectedVariant) : null;
  const isSelectedVariantAvailable = selectedVariant?.availableForSale ?? product.availableForSale;
  const selectedVariantQuantity = selectedVariant?.quantityAvailable ?? null;

  return (
    <div className="border-b border-brand-border bg-brand-cream">
      <div className="grid grid-cols-1 xl:grid-cols-[1.18fr_0.82fr]">
        <section className="border-b border-brand-border bg-brand-parchment xl:border-b-0 xl:border-r">
          <div className="grid grid-cols-1 gap-3 p-3 sm:gap-4 sm:p-4 md:grid-cols-[124px_minmax(0,1fr)] md:p-6 xl:sticky xl:top-[84px] xl:min-h-[calc(100vh-84px)]">
            <div className="order-2 flex gap-3 overflow-x-auto md:order-1 md:flex-col">
              {images.map((image, index) => (
                <button
                  key={image.url}
                  type="button"
                  onClick={() => setSelectedImageUrl(image.url)}
                  className={`relative h-24 min-w-20 overflow-hidden border sm:h-28 sm:min-w-24 ${
                    selectedImage?.url === image.url ? "border-brand-dark-brown" : "border-brand-border"
                  } bg-brand-cream`}
                  aria-label={`Mostra immagine ${index + 1} di ${product.title}`}
                >
                  <Image
                    src={image.url}
                    alt={image.altText || `${product.title} ${index + 1}`}
                    fill
                    className="object-contain p-2"
                    sizes="120px"
                  />
                </button>
              ))}
            </div>

            <div className="order-1 relative min-h-[400px] overflow-hidden bg-brand-cream md:order-2 sm:min-h-[520px] xl:min-h-[calc(100vh-132px)]">
              {selectedImage ? (
                <Image
                  src={selectedImage.url}
                  alt={selectedImage.altText || product.title}
                  fill
                  priority
                  className="object-contain object-center p-4 sm:p-6"
                  sizes="(min-width: 1280px) 60vw, 100vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-[14px] uppercase tracking-[0.18em] text-brand-dust">
                  No image
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="bg-brand-cream px-5 py-8 sm:px-6 sm:py-10 md:px-10 md:py-12 xl:px-12 xl:py-14">
          <div className="flex flex-wrap items-center gap-2 text-[9px] uppercase tracking-[0.22em] text-brand-dust sm:gap-3 sm:text-[10px]">
            <Link href="/" className="transition-colors hover:text-brand-dark-brown">
              Home
            </Link>
            <span>/</span>
            <Link href="/collections/abbigliamento" className="transition-colors hover:text-brand-dark-brown">
              Abbigliamento
            </Link>
          </div>

          <div className="mt-6 text-[12px] uppercase tracking-[0.24em] text-brand-dust sm:mt-7 sm:text-[14px]">
            {product.vendor}
          </div>
          <h1 className="mt-3 font-libre text-[32px] leading-[0.98] text-brand-dark-brown sm:text-[40px] md:text-[56px]">
            {product.title}
          </h1>

          <div className="mt-5 flex flex-wrap items-end gap-4">
            <div className="text-[24px] leading-none text-brand-dark-brown sm:text-[28px]">
              {formatPrice(price.amount, price.currencyCode)}
            </div>
            {hasDiscount && compareAtPrice ? (
              <>
                <div className="text-[18px] leading-none text-brand-dust line-through sm:text-[20px]">
                  {formatPrice(compareAtPrice.amount, compareAtPrice.currencyCode)}
                </div>
                {discountPercentage ? (
                  <div className="border border-brand-border bg-brand-parchment px-3 py-2 text-[13px] uppercase tracking-[0.18em] text-brand-tobacco">
                    -{discountPercentage}%
                  </div>
                ) : null}
              </>
            ) : null}
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 border-y border-[rgba(61,36,16,0.14)] py-5 sm:grid-cols-2">
            <div>
              <div className="text-[12px] uppercase tracking-[0.24em] text-brand-dust">Categoria</div>
              <div className="mt-2 text-[18px] text-brand-dark-brown">{product.productType}</div>
            </div>
            <div>
              <div className="text-[12px] uppercase tracking-[0.24em] text-brand-dust">Colore</div>
              <div className="mt-2 text-[18px] text-brand-dark-brown">{color || "Archivio"}</div>
            </div>
          </div>

          <div className="mt-8">
            <div className="text-[13px] uppercase tracking-[0.24em] text-brand-dust">Taglia</div>
            <div className="mt-4 flex flex-wrap gap-3">
              {variants.map((variant) => {
                const size = getVariantSize(variant);
                const isActive = selectedVariant?.id === variant.id;

                return (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => setSelectedVariantId(variant.id)}
                    className={`min-w-[64px] border px-4 py-3 text-[15px] uppercase tracking-[0.08em] transition-colors sm:min-w-[72px] sm:px-5 sm:py-4 sm:text-[17px] ${
                      isActive
                        ? variant.availableForSale
                          ? "border-brand-dark-brown bg-brand-dark-brown text-brand-cream"
                          : "border-brand-burnt bg-brand-burnt text-brand-cream"
                        : variant.availableForSale
                          ? "border-brand-border bg-white text-brand-dark-brown hover:bg-brand-parchment"
                          : "border-[rgba(61,36,16,0.16)] bg-white text-brand-dust line-through opacity-70 hover:bg-brand-parchment"
                    }`}
                    aria-pressed={isActive}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 text-[13px] uppercase tracking-[0.18em] text-brand-dust sm:text-[14px]">
              {isSelectedVariantAvailable
                ? selectedSize
                  ? selectedVariantQuantity
                    ? `Taglia ${selectedSize} disponibile online - ${selectedVariantQuantity} rimasti`
                    : `Taglia ${selectedSize} disponibile online`
                  : "Variante disponibile online"
                : selectedSize
                  ? `Taglia ${selectedSize} esaurita online`
                  : "Variante esaurita online"}
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <AddToCartButton
                product={product}
                variant={selectedVariant}
                image={selectedImage}
                disabled={!isSelectedVariantAvailable}
                className={`w-full ${
                  isSelectedVariantAvailable
                    ? "btn-dark"
                    : "cursor-not-allowed bg-brand-dark-brown px-10 py-[14px] text-[13px] uppercase tracking-[0.24em] text-brand-cream opacity-45"
                }`}
              >
                {isSelectedVariantAvailable ? "Aggiungi al Carrello" : "Esaurito Online"}
              </AddToCartButton>

              <WishlistToggleButton
                product={product}
                showLabel
                activeLabel="Salvato in wishlist"
                inactiveLabel="Aggiungi alla wishlist"
                className="flex min-h-[52px] w-full items-center justify-center gap-3 border px-5 py-4 text-[11px] uppercase tracking-[0.22em] transition-colors"
                activeClassName="border-brand-dark-brown bg-brand-dark-brown text-brand-cream"
                inactiveClassName="border-brand-border bg-white text-brand-dark-brown hover:bg-brand-parchment"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Link
                href="/contatti"
                className="flex w-full items-center justify-center border border-brand-border bg-white px-5 py-4 text-[11px] uppercase tracking-[0.22em] text-brand-dark-brown no-underline transition-colors hover:bg-brand-parchment"
              >
                Richiedi Informazioni
              </Link>
              <a
                href={`https://wa.me/393485310887?text=${encodeURIComponent(
                  `Ciao, vorrei informazioni su ${product.title}${selectedSize ? ` in taglia ${selectedSize}` : ""}.`,
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex w-full items-center justify-center border border-brand-border bg-white px-5 py-4 text-[11px] uppercase tracking-[0.22em] text-brand-dark-brown no-underline transition-colors hover:bg-brand-parchment"
              >
                Scrivici su WhatsApp
              </a>
            </div>
          </div>

          <div className="mt-10 max-w-[720px] text-[17px] leading-[1.8] text-brand-dust sm:text-[18px] sm:leading-[1.85]">
            {product.description}
          </div>

          <div className="mt-10">
            <StorePickupPanel key={selectedVariant?.id ?? "store-pickup"} product={product} variant={selectedVariant} />
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4">
            <details open className="border border-[rgba(61,36,16,0.14)] bg-white px-5 py-4">
              <summary className="cursor-pointer list-none text-[13px] uppercase tracking-[0.22em] text-brand-dark-brown">
                Composizione
              </summary>
              <p className="mt-4 text-[17px] leading-[1.9] text-brand-dust">
                {product.details?.composition || "Composizione disponibile in arrivo."}
              </p>
            </details>

            <details className="border border-[rgba(61,36,16,0.14)] bg-white px-5 py-4">
              <summary className="cursor-pointer list-none text-[13px] uppercase tracking-[0.22em] text-brand-dark-brown">
                Vestibilita
              </summary>
              <p className="mt-4 text-[17px] leading-[1.9] text-brand-dust">
                {product.details?.fitNotes || "Vestibilita regolare."}
              </p>
            </details>

            <details className="border border-[rgba(61,36,16,0.14)] bg-white px-5 py-4">
              <summary className="cursor-pointer list-none text-[13px] uppercase tracking-[0.22em] text-brand-dark-brown">
                Condizione del capo
              </summary>
              <p className="mt-4 text-[17px] leading-[1.9] text-brand-dust">
                {product.details?.condition || "Condizione del capo disponibile in arrivo."}
              </p>
            </details>

            <details className="border border-[rgba(61,36,16,0.14)] bg-white px-5 py-4">
              <summary className="cursor-pointer list-none text-[13px] uppercase tracking-[0.22em] text-brand-dark-brown">
                Guida alle taglie
              </summary>
              <div className="mt-4 space-y-2 text-[17px] leading-[1.8] text-brand-dust">
                {(product.details?.sizeGuide ?? ["Guida alle taglie disponibile a breve."]).map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </details>

            <details className="border border-[rgba(61,36,16,0.14)] bg-white px-5 py-4">
              <summary className="cursor-pointer list-none text-[13px] uppercase tracking-[0.22em] text-brand-dark-brown">
                Misure del capo
              </summary>
              <div className="mt-4 space-y-2 text-[17px] leading-[1.8] text-brand-dust">
                {(product.details?.measurements ?? ["Misure del capo disponibili a breve."]).map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </details>

            <details className="border border-[rgba(61,36,16,0.14)] bg-white px-5 py-4">
              <summary className="cursor-pointer list-none text-[13px] uppercase tracking-[0.22em] text-brand-dark-brown">
                Spedizioni e resi
              </summary>
              <div className="mt-4 space-y-3 text-[17px] leading-[1.8] text-brand-dust">
                <p>Spedizione in Italia a 5 EUR. Ordini entro le 13:00 spediti in giornata.</p>
                <p>Reso o cambio entro 30 giorni secondo la policy dello store.</p>
              </div>
            </details>
          </div>
        </section>
      </div>
    </div>
  );
}
