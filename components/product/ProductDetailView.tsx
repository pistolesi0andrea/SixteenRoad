"use client";

import { AddToCartButton } from "@/components/cart/AddToCartButton";
import {
  getOptimizedShopifyImageUrl,
  getProductImages,
  getProductPricing,
  isShopifyCdnImage,
} from "@/lib/product-helpers";
import { StorePickupPanel } from "@/components/product/StorePickupPanel";
import { WishlistToggleButton } from "@/components/wishlist/WishlistToggleButton";
import { ShopifyProduct, ShopifyProductVariant } from "@/types/shopify";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

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

export function ProductDetailView({ product }: { product: ShopifyProduct }) {
  const variants = useMemo(
    () => product.variants.edges.map((edge) => edge.node).filter((variant) => variant.id),
    [product],
  );
  const images = useMemo(() => getProductImages(product), [product]);
  const defaultVariant = useMemo(
    () => variants.find((variant) => variant.availableForSale) ?? variants[0] ?? null,
    [variants],
  );
  const defaultImageUrl = images[0]?.url ?? "";
  const [selectedVariantId, setSelectedVariantId] = useState(defaultVariant?.id ?? "");
  const [selectedImageUrl, setSelectedImageUrl] = useState(defaultImageUrl);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const lastImageTapRef = useRef(0);

  const selectedVariant = useMemo(
    () => variants.find((variant) => variant.id === selectedVariantId) ?? defaultVariant,
    [defaultVariant, selectedVariantId, variants],
  );
  const selectedImage = useMemo(
    () => images.find((image) => image.url === selectedImageUrl) ?? images[0] ?? null,
    [images, selectedImageUrl],
  );

  const { price, compareAtPrice, discountPercentage, hasDiscount } = getProductPricing(
    product,
    selectedVariant,
  );
  const selectedSize = selectedVariant ? getVariantSize(selectedVariant) : null;
  const isSelectedVariantAvailable = selectedVariant?.availableForSale ?? product.availableForSale;
  const selectedVariantQuantity = selectedVariant?.quantityAvailable ?? null;

  useEffect(() => {
    if (!isImageModalOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsImageModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isImageModalOpen]);

  const openImageModal = () => {
    if (!selectedImage) {
      return;
    }

    setZoomLevel(1);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setZoomLevel(1);
  };

  const zoomInImage = () => {
    setZoomLevel((currentZoom) => Math.min(currentZoom + 0.4, 3.2));
  };

  const zoomOutImage = () => {
    setZoomLevel((currentZoom) => Math.max(currentZoom - 0.4, 1));
  };

  const handleProductImageTouchEnd = () => {
    const now = Date.now();
    if (now - lastImageTapRef.current < 260) {
      openImageModal();
    }
    lastImageTapRef.current = now;
  };

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
                    src={getOptimizedShopifyImageUrl(image, 220)}
                    alt={image.altText || `${product.title} ${index + 1}`}
                    fill
                    className="object-contain p-2"
                    unoptimized={isShopifyCdnImage(image)}
                    sizes="120px"
                  />
                </button>
              ))}
            </div>

            <button
              type="button"
              onDoubleClick={openImageModal}
              onTouchEnd={handleProductImageTouchEnd}
              className="order-1 relative min-h-[400px] w-full overflow-hidden bg-brand-cream text-left md:order-2 sm:min-h-[520px] xl:min-h-[calc(100vh-132px)]"
              aria-label="Apri immagine prodotto in popup"
            >
              {selectedImage ? (
                <>
                  <Image
                    src={getOptimizedShopifyImageUrl(selectedImage, 1400)}
                    alt={selectedImage.altText || product.title}
                    fill
                    priority
                    className="object-contain object-center p-4 sm:p-6"
                    unoptimized={isShopifyCdnImage(selectedImage)}
                    sizes="(min-width: 1280px) 60vw, 100vw"
                  />
                  <div className="pointer-events-none absolute bottom-4 right-4 border border-[rgba(61,36,16,0.18)] bg-white/88 px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-brand-dark-brown backdrop-blur-sm">
                    Doppio click per zoom
                  </div>
                </>
              ) : (
                <div className="flex h-full items-center justify-center text-[14px] uppercase tracking-[0.18em] text-brand-dust">
                  No image
                </div>
              )}
            </button>
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

          <div className="mt-8 border-y border-[rgba(61,36,16,0.14)] py-5">
            <div className="border border-[rgba(61,36,16,0.14)] bg-white px-5 py-5">
              <div className="text-[12px] uppercase tracking-[0.24em] text-brand-dust">Descrizione</div>
              <div className="mt-3 text-[16px] leading-[1.85] text-brand-dust sm:text-[17px]">
                {product.description}
              </div>
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

          <div className="mt-10">
            <StorePickupPanel key={selectedVariant?.id ?? "store-pickup"} product={product} variant={selectedVariant} />
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4">
            <details open className="border border-[rgba(61,36,16,0.14)] bg-white px-5 py-4">
              <summary className="cursor-pointer list-none text-[13px] uppercase tracking-[0.22em] text-brand-dark-brown">
                Spedizione
              </summary>
              <div className="mt-4 space-y-3 text-[17px] leading-[1.8] text-brand-dust">
                <p>Spedizione in Italia a 5 EUR.</p>
                <p>Gli ordini confermati entro le 13:00 vengono spediti in giornata.</p>
              </div>
            </details>

            <details className="border border-[rgba(61,36,16,0.14)] bg-white px-5 py-4">
              <summary className="cursor-pointer list-none text-[13px] uppercase tracking-[0.22em] text-brand-dark-brown">
                Resi
              </summary>
              <div className="mt-4 space-y-3 text-[17px] leading-[1.8] text-brand-dust">
                <p>Puoi richiedere reso o cambio entro 30 giorni dall&apos;acquisto.</p>
                <p>Per condizioni complete e istruzioni, consulta la policy dello store.</p>
              </div>
            </details>
          </div>
        </section>
      </div>

      {isImageModalOpen && selectedImage ? (
        <div
          className="fixed inset-0 z-[120] bg-[rgba(22,12,6,0.92)] px-4 py-6 sm:px-6 sm:py-8"
          role="dialog"
          aria-modal="true"
          aria-label={`Zoom immagine di ${product.title}`}
          onClick={closeImageModal}
        >
          <button
            type="button"
            onClick={closeImageModal}
            className="fixed right-4 top-4 z-[150] inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/20 bg-white px-4 text-[11px] uppercase tracking-[0.22em] text-brand-dark-brown shadow-[0_14px_36px_rgba(0,0,0,0.3)] transition-transform transition-colors hover:scale-[1.02] hover:bg-brand-parchment sm:right-6 sm:top-6"
            style={{
              top: "calc(env(safe-area-inset-top, 0px) + 16px)",
              right: "calc(env(safe-area-inset-right, 0px) + 16px)",
            }}
            aria-label="Chiudi popup immagine"
          >
            <span className="text-[16px] leading-none">X</span>
            <span>Chiudi</span>
          </button>

          <div className="mx-auto flex h-full max-w-[1600px] flex-col" onClick={(event) => event.stopPropagation()}>
            <div className="sticky top-0 z-[130] mb-4 flex items-start justify-between gap-4 bg-[rgba(22,12,6,0.92)] py-2">
              <div className="text-[11px] uppercase tracking-[0.24em] text-brand-cream/80">
                {product.title}
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={zoomOutImage}
                    className="flex h-11 w-11 items-center justify-center border border-white/20 bg-white/10 text-[20px] text-brand-cream transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={zoomLevel <= 1}
                    aria-label="Riduci zoom"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={zoomInImage}
                    className="flex h-11 w-11 items-center justify-center border border-white/20 bg-white/10 text-[20px] text-brand-cream transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={zoomLevel >= 3.2}
                    aria-label="Aumenta zoom"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomLevel(1)}
                    className="border border-white/20 bg-white/10 px-4 py-3 text-[10px] uppercase tracking-[0.22em] text-brand-cream transition-colors hover:bg-white/20"
                  >
                    Reset
                  </button>
                </div>
                <button
                  type="button"
                  onClick={closeImageModal}
                  className="inline-flex h-11 items-center justify-center gap-2 border border-white/25 bg-[rgba(26,14,7,0.92)] px-4 text-[10px] uppercase tracking-[0.22em] text-white shadow-[0_10px_30px_rgba(0,0,0,0.28)] transition-colors hover:bg-[rgba(255,255,255,0.18)]"
                  aria-label="Chiudi popup immagine"
                >
                  <span className="text-[14px] leading-none">X</span>
                  <span>Chiudi</span>
                </button>
              </div>
            </div>

              <div className="relative flex-1 overflow-auto border border-white/10 bg-[rgba(255,255,255,0.04)]">
                <button
                  type="button"
                  onClick={closeImageModal}
                  className="absolute right-4 top-4 z-[140] flex h-14 w-14 items-center justify-center rounded-full border border-white/25 bg-[rgba(255,255,255,0.92)] text-[28px] leading-none text-brand-dark-brown shadow-[0_12px_28px_rgba(0,0,0,0.26)] transition-transform transition-colors hover:scale-[1.03] hover:bg-brand-parchment"
                  aria-label="Chiudi popup immagine"
                >
                  X
                </button>
                <div className="flex min-h-full min-w-full items-center justify-center p-6 sm:p-8">
                  <div
                    className="relative h-[70vh] w-full max-w-[1100px] origin-center transition-transform duration-200 ease-out"
                    style={{ transform: `scale(${zoomLevel})` }}
                  onDoubleClick={() => {
                    if (zoomLevel > 1) {
                      setZoomLevel(1);
                      return;
                    }

                    zoomInImage();
                  }}
                >
                  <Image
                    src={getOptimizedShopifyImageUrl(selectedImage, 2200)}
                    alt={selectedImage.altText || product.title}
                    fill
                    className="object-contain object-center"
                    unoptimized={isShopifyCdnImage(selectedImage)}
                    sizes="100vw"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
