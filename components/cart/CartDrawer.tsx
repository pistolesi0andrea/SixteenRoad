"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { isGiftCardCartLine } from "@/lib/product-helpers";

function formatPrice(amount: number, currencyCode = "EUR") {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 2,
  }).format(amount);
}

const GIFT_CARD_ATTRIBUTE_LABELS: Record<string, string> = {
  gift_card_recipient_name: "Destinatario",
  gift_card_recipient_email: "Email destinatario",
  gift_card_sender_name: "Da parte di",
  gift_card_message: "Messaggio",
};

const HIDDEN_GIFT_CARD_ATTRIBUTE_KEYS = new Set([
  "__shopify_send_gift_card_to_recipient",
  "Recipient email",
  "Recipient name",
  "Message",
  "Send on",
]);

export function CartDrawer() {
  const {
    isOpen,
    items,
    itemCount,
    subtotal,
    discountAmount,
    errorMessage,
    isSyncing,
    isUsingShopify,
    closeCart,
    incrementItem,
    decrementItem,
    removeItem,
  } = useCart();
  const isDigitalGiftCardOrder = items.length > 0 && items.every((item) => isGiftCardCartLine(item));
  const shippingPrice = isDigitalGiftCardOrder ? 0 : 5;
  const discountedSubtotal = Math.max(subtotal - discountAmount, 0);
  const estimatedTotal = discountedSubtotal + shippingPrice;
  const hasApplicableDiscount = discountAmount > 0;

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = "";
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeCart();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [closeCart, isOpen]);

  return (
    <>
      <button
        type="button"
        aria-hidden={!isOpen}
        tabIndex={isOpen ? 0 : -1}
        onClick={closeCart}
        className={`fixed inset-0 z-[520] bg-[rgba(61,36,16,0.42)] transition-opacity duration-300 ${
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed right-0 top-0 z-[530] h-screen w-full max-w-[420px] border-l border-brand-border bg-brand-cream shadow-2xl transition-transform duration-300 sm:max-w-[440px] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!isOpen}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-brand-border bg-brand-parchment px-5 py-4 sm:px-6 sm:py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mb-2 text-[10px] tracking-[0.24em] uppercase text-brand-burnt">
                  Carrello
                </div>
                <h2 className="font-libre text-[28px] leading-[1] text-brand-dark-brown sm:text-[34px]">
                  I tuoi articoli
                </h2>
                <p className="mt-3 text-[14px] leading-[1.8] text-brand-dust sm:text-[16px]">
                  {itemCount > 0
                    ? `${itemCount} articoli selezionati, pronti per il checkout.`
                    : "Seleziona i capi che vuoi salvare nel carrello."}
                </p>
              </div>
              <button
                type="button"
                onClick={closeCart}
                className="h-9 w-9 shrink-0 border border-brand-border bg-brand-cream text-[15px] uppercase text-brand-dark-brown transition-colors hover:bg-brand-tortora sm:h-10 sm:w-10 sm:text-[16px]"
                aria-label="Chiudi carrello"
              >
                x
              </button>
            </div>
          </div>

          {items.length > 0 ? (
            <>
              <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">
                {errorMessage ? (
                  <div className="border border-[rgba(184,67,26,0.22)] bg-white px-4 py-4 text-[13px] leading-[1.8] text-brand-dark-brown">
                    {errorMessage}
                  </div>
                ) : null}

                {items.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[78px_minmax(0,1fr)] gap-3 border border-brand-border bg-white p-3 sm:grid-cols-[96px_minmax(0,1fr)] sm:gap-4"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden bg-brand-parchment">
                      {item.featuredImage ? (
                        <Image
                          src={item.featuredImage.url}
                          alt={item.featuredImage.altText || item.title}
                          fill
                          className="object-cover"
                          sizes="(min-width: 640px) 96px, 78px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[11px] text-brand-dust">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-brand-dust">
                            {item.vendor}
                          </div>
                          <h3 className="font-libre text-[17px] leading-[1.1] text-brand-dark-brown sm:text-[19px]">
                            {item.title}
                          </h3>
                          <div className="mt-2 text-[9px] tracking-[0.22em] uppercase text-brand-dust">
                            {item.productType || "Archive"}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-[10px] tracking-[0.18em] uppercase text-brand-tobacco"
                        >
                          Rimuovi
                        </button>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[11px] uppercase tracking-[0.18em] text-brand-dust">
                        {item.color ? <span>Colore {item.color}</span> : null}
                        {item.size ? <span>Taglia {item.size}</span> : null}
                      </div>

                      {item.attributes.filter((attribute) => !HIDDEN_GIFT_CARD_ATTRIBUTE_KEYS.has(attribute.key)).length > 0 ? (
                        <div className="mt-4 space-y-2 border-t border-brand-border pt-4 text-[12px] leading-[1.7] text-brand-dust">
                          {item.attributes
                            .filter((attribute) => !HIDDEN_GIFT_CARD_ATTRIBUTE_KEYS.has(attribute.key))
                            .map((attribute) => (
                            <div key={`${item.id}-${attribute.key}`}>
                              <span className="uppercase tracking-[0.18em] text-brand-burnt">
                                {GIFT_CARD_ATTRIBUTE_LABELS[attribute.key] ?? attribute.key}
                              </span>
                              <div className="mt-1 text-brand-dark-brown">{attribute.value}</div>
                            </div>
                          ))}
                        </div>
                      ) : null}

                      <div className="mt-4 flex items-center justify-between gap-4">
                        <div className="flex items-center border border-brand-border">
                          <button
                            type="button"
                            onClick={() => decrementItem(item.id)}
                            className="h-9 w-9 text-[18px] text-brand-dark-brown transition-colors hover:bg-brand-parchment"
                            aria-label={`Riduci quantita di ${item.title}`}
                          >
                            -
                          </button>
                          <div className="flex h-9 min-w-10 items-center justify-center border-x border-brand-border px-3 text-[12px]">
                            {item.quantity}
                          </div>
                          <button
                            type="button"
                            onClick={() => incrementItem(item.id)}
                            className="h-9 w-9 text-[18px] text-brand-dark-brown transition-colors hover:bg-brand-parchment"
                            aria-label={`Aumenta quantita di ${item.title}`}
                          >
                            +
                          </button>
                        </div>

                        <div className="text-[14px] text-brand-tobacco sm:text-[15px]">
                          {formatPrice(Number(item.price.amount) * item.quantity, item.price.currencyCode)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-brand-border bg-brand-parchment px-5 py-4 sm:px-6 sm:py-5">
                

                <div className="mt-5 flex items-center justify-between text-[14px] tracking-[0.2em] uppercase text-brand-dust">
                  <span>Subtotal</span>
                  <span className="text-brand-dark-brown">
                    {formatPrice(subtotal, items[0]?.price.currencyCode ?? "EUR")}
                  </span>
                </div>
                {hasApplicableDiscount ? (
                  <div className="mt-3 flex items-center justify-between text-[14px] tracking-[0.2em] uppercase text-brand-dust">
                    <span>Sconto</span>
                    <span className="text-brand-dark-brown">
                      -{formatPrice(discountAmount, items[0]?.price.currencyCode ?? "EUR")}
                    </span>
                  </div>
                ) : null}
                <div className="mt-3 flex items-center justify-between text-[14px] tracking-[0.2em] uppercase text-brand-dust">
                  <span>{isDigitalGiftCardOrder ? "Digitale" : "Spedizione"}</span>
                  <span className="text-brand-dark-brown">
                    {formatPrice(shippingPrice, items[0]?.price.currencyCode ?? "EUR")}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-brand-border pt-3 text-[14px] tracking-[0.2em] uppercase text-brand-dust">
                  <span>Totale stimato</span>
                  <span className="text-brand-dark-brown">
                    {formatPrice(estimatedTotal, items[0]?.price.currencyCode ?? "EUR")}
                  </span>
                </div>
                <p className="mt-4 text-[16px] leading-[1.8] text-brand-dust">
                  {isDigitalGiftCardOrder
                    ? "La gift card verra consegnata digitalmente, senza costi di spedizione."
                    : "Alla spedizione verra sempre applicata la tariffa di 5,00 EUR."}
                </p>

                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="mt-5 flex w-full items-center justify-center bg-brand-dark-brown px-5 py-4 text-[11px] uppercase tracking-[0.22em] text-brand-cream no-underline transition-colors hover:bg-brand-tobacco"
                >
                  {isSyncing
                    ? "Sincronizzazione..."
                    : isUsingShopify
                      ? "Vai al checkout Shopify"
                      : "Checkout Shopify"}
                </Link>
                <Link
                  href="/collections/abbigliamento"
                  onClick={closeCart}
                  className="mt-3 flex w-full items-center justify-center border border-brand-border bg-white px-5 py-4 text-[11px] uppercase tracking-[0.22em] text-brand-dark-brown no-underline transition-colors hover:bg-brand-cream"
                >
                  Continua lo shopping
                </Link>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col justify-between px-5 py-6 sm:px-6 sm:py-8">
              <div>
                <div className="inline-block border border-brand-border bg-white px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-brand-burnt">
                  Vuoto
                </div>
                <h3 className="mt-6 font-libre text-[32px] leading-[0.98] text-brand-dark-brown sm:text-[38px]">
                  Il carrello è ancora vuoto.
                </h3>
                <p className="mt-5 max-w-[280px] text-[15px] leading-[2] text-brand-dust sm:text-[16px]">
                  Apri una collezione, aggiungi un capo e il drawer ti mostrera subito riepilogo,
                  quantita e subtotal.
                </p>
              </div>

              <div className="space-y-3">
                <Link
                  href="/collections/abbigliamento"
                  onClick={closeCart}
                  className="flex w-full items-center justify-center bg-brand-dark-brown px-5 py-4 text-[11px] uppercase tracking-[0.22em] text-brand-cream no-underline"
                >
                  Vai al catalogo
                </Link>
                <Link
                  href="/collections/nuovi-arrivi"
                  onClick={closeCart}
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
