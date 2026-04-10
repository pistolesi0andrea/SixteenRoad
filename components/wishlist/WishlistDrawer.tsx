"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useWishlist } from "@/components/wishlist/WishlistProvider";
import { getOptimizedShopifyImageUrl, isShopifyCdnImage } from "@/lib/product-helpers";

function formatPrice(amount: string, currencyCode: string) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 2,
  }).format(Number(amount));
}

export function WishlistDrawer() {
  const { isOpen, items, itemCount, closeWishlist, removeItem } = useWishlist();

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = "";
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeWishlist();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [closeWishlist, isOpen]);

  return (
    <>
      <button
        type="button"
        aria-hidden={!isOpen}
        tabIndex={isOpen ? 0 : -1}
        onClick={closeWishlist}
        className={`fixed inset-0 z-[540] bg-[rgba(61,36,16,0.42)] transition-opacity duration-300 ${
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed right-0 top-0 z-[550] h-screen w-full max-w-[440px] border-l border-brand-border bg-brand-cream shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!isOpen}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-brand-border bg-brand-parchment px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mb-2 text-[10px] uppercase tracking-[0.24em] text-brand-burnt">
                  Wishlist
                </div>
                <h2 className="font-libre text-[34px] leading-[1] text-brand-dark-brown">
                  I capi salvati
                </h2>
                <p className="mt-3 text-[16px] leading-[1.8] text-brand-dust">
                  {itemCount > 0
                    ? `${itemCount} articoli salvati per rivederli con calma.`
                    : "Salva qui i capi che vuoi tenere d'occhio prima dell'acquisto."}
                </p>
              </div>
              <button
                type="button"
                onClick={closeWishlist}
                className="h-10 w-10 shrink-0 border border-brand-border bg-brand-cream text-[16px] uppercase text-brand-dark-brown transition-colors hover:bg-brand-tortora"
                aria-label="Chiudi wishlist"
              >
                x
              </button>
            </div>
          </div>

          {items.length > 0 ? (
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[96px_minmax(0,1fr)] gap-4 border border-brand-border bg-white p-3"
                  >
                    <Link
                      href={`/products/${item.handle}`}
                      prefetch={false}
                      onClick={closeWishlist}
                      className="relative aspect-[3/4] overflow-hidden bg-brand-parchment"
                    >
                      {item.featuredImage ? (
                        <Image
                          src={getOptimizedShopifyImageUrl(item.featuredImage, 240)}
                          alt={item.featuredImage.altText || item.title}
                          fill
                          className="object-cover"
                          unoptimized={isShopifyCdnImage(item.featuredImage)}
                          sizes="96px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[11px] text-brand-dust">
                          No image
                        </div>
                      )}
                    </Link>

                    <div className="min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-brand-dust">
                            {item.vendor}
                          </div>
                          <Link
                            href={`/products/${item.handle}`}
                            prefetch={false}
                            onClick={closeWishlist}
                            className="font-libre text-[19px] leading-[1.1] text-brand-dark-brown no-underline"
                          >
                            {item.title}
                          </Link>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-[10px] uppercase tracking-[0.18em] text-brand-tobacco"
                        >
                          Rimuovi
                        </button>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[10px] uppercase tracking-[0.2em] text-brand-dust">
                        <span>{item.productType || "Archive"}</span>
                        {item.color ? <span>{item.color}</span> : null}
                        {!item.availableForSale ? <span className="text-brand-burnt">Esaurito online</span> : null}
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-4">
                        <div className="text-[15px] text-brand-tobacco">
                          {formatPrice(item.price.amount, item.price.currencyCode)}
                        </div>
                        <Link
                          href={`/products/${item.handle}`}
                          prefetch={false}
                          onClick={closeWishlist}
                          className="border border-brand-border bg-brand-cream px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-brand-dark-brown no-underline transition-colors hover:bg-brand-parchment"
                        >
                          Apri scheda
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col justify-between px-6 py-8">
              <div>
                <div className="inline-block border border-brand-border bg-white px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-brand-burnt">
                  Vuota
                </div>
                <h3 className="mt-6 font-libre text-[38px] leading-[0.98] text-brand-dark-brown">
                  Nessun capo salvato.
                </h3>
                <p className="mt-5 max-w-[300px] text-[16px] leading-[2] text-brand-dust">
                  Usa il cuore su listing e prodotto per costruire una selezione personale da rivedere dopo.
                </p>
              </div>

              <div className="space-y-3">
                <Link
                  href="/collections/abbigliamento"
                  onClick={closeWishlist}
                  className="flex w-full items-center justify-center bg-brand-dark-brown px-5 py-4 text-[11px] uppercase tracking-[0.22em] text-brand-cream no-underline"
                >
                  Vai al catalogo
                </Link>
                <Link
                  href="/collections/nuovi-arrivi"
                  onClick={closeWishlist}
                  className="flex w-full items-center justify-center border border-brand-border bg-white px-5 py-4 text-[11px] uppercase tracking-[0.22em] text-brand-dark-brown no-underline"
                >
                  Scopri i nuovi arrivi
                </Link>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
