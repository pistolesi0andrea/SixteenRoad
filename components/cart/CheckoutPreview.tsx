"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import {
  getOptimizedShopifyImageUrl,
  isGiftCardCartLine,
  isShopifyCdnImage,
} from "@/lib/product-helpers";
import { CartLineItem } from "@/types/cart";
import { ShopifyCheckoutDeliveryMode, ShopifyStoreAvailability } from "@/types/shopify";

function formatPrice(amount: number, currencyCode = "EUR") {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 2,
  }).format(amount);
}

function getCommonPickupLocations(items: CartLineItem[]): ShopifyStoreAvailability[] {
  const physicalItems = items.filter((item) => !isGiftCardCartLine(item));

  if (physicalItems.length === 0) {
    return [];
  }

  return physicalItems.reduce<ShopifyStoreAvailability[]>((locations, item, index) => {
    const availableLocations = item.pickupLocations.filter((location) => location.available);

    if (index === 0) {
      return availableLocations;
    }

    return locations.filter((location) =>
      availableLocations.some((candidate) => candidate.location.id === location.location.id),
    );
  }, []);
}

export function CheckoutPreview() {
  const {
    items,
    itemCount,
    subtotal,
    discountCodes,
    discountAmount,
    beginCheckout,
    applyDiscountCode,
    removeDiscountCode,
    removeItem,
    clearError,
    errorMessage,
    isShopifyReady,
    isSyncing,
    isUsingShopify,
  } = useCart();
  const [deliveryMode, setDeliveryMode] = useState<ShopifyCheckoutDeliveryMode>("shipping");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [discountCodeDraft, setDiscountCodeDraft] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    notes: "",
  });

  const currencyCode = items[0]?.price.currencyCode ?? "EUR";
  const isDigitalGiftCardOrder = items.length > 0 && items.every((item) => isGiftCardCartLine(item));
  const pickupLocations = getCommonPickupLocations(items);
  const canUsePickup = !isDigitalGiftCardOrder && pickupLocations.length > 0;
  const effectiveDeliveryMode: ShopifyCheckoutDeliveryMode = canUsePickup ? deliveryMode : "shipping";
  const shippingPrice = isDigitalGiftCardOrder || effectiveDeliveryMode === "pickup" ? 0 : 5;
  const discountedSubtotal = Math.max(subtotal - discountAmount, 0);
  const total = discountedSubtotal + shippingPrice;
  const appliedDiscountCode = discountCodes.find((discountCode) => discountCode.applicable) ?? null;
  const invalidDiscountCode = discountCodes.find((discountCode) => !discountCode.applicable) ?? null;
  const discountCodeInput = discountCodeDraft ?? appliedDiscountCode?.code ?? "";
  const summaryLabel = isDigitalGiftCardOrder
    ? "Consegna digitale"
    : effectiveDeliveryMode === "pickup"
      ? "Ritiro in store"
      : "Spedizione Italia";

  function updateField(field: keyof typeof formData, value: string) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleCheckoutRedirect() {
    clearError();

    try {
      const checkout = await beginCheckout({
        ...formData,
        deliveryMode: isDigitalGiftCardOrder ? "shipping" : effectiveDeliveryMode,
      });

      if (checkout.mode === "shopify") {
        window.location.assign(checkout.checkoutUrl);
        return;
      }

      setIsSubmitted(true);
    } catch {
      setIsSubmitted(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="border-b border-brand-border bg-brand-parchment">
        <div className="editorial-container px-6 py-16 lg:px-10">
          <div className="max-w-[760px] border border-brand-border bg-brand-cream px-7 py-8 lg:px-10 lg:py-10">
            <div className="text-[11px] uppercase tracking-[0.24em] text-brand-burnt">
              {isShopifyReady ? "Checkout live" : "Checkout preview"}
            </div>
            <h1 className="mt-4 font-libre text-[42px] leading-[0.96] text-brand-dark-brown lg:text-[58px]">
              Prima aggiungi un articolo al carrello.
            </h1>
            <p className="mt-5 max-w-[560px] text-[18px] leading-[1.9] text-brand-dust">
              {isShopifyReady
                ? "Shopify e pronto, ma al momento il carrello e vuoto."
                : "Questa pagina resta un pre-checkout: finche Shopify non e configurato, qui puoi validare il flusso senza toccare il checkout live."}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/collections/abbigliamento"
                className="btn-dark no-underline text-center"
              >
                Vai ad abbigliamento
              </Link>
              <Link
                href="/collections/nuovi-arrivi"
                className="btn-outline no-underline text-center"
              >
                Scopri i nuovi arrivi
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-brand-border bg-brand-parchment">
      <section className="border-b border-brand-border bg-brand-cream">
        <div className="editorial-container px-5 py-7 sm:px-6 sm:py-8 lg:px-10 lg:py-12">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="mt-2 font-libre text-[34px] leading-[0.95] text-brand-dark-brown sm:text-[44px] lg:text-[66px]">
                Checkout <em className="italic text-brand-tobacco">Sixteen Road</em>
              </h1>
            </div>

            <div className="grid grid-cols-3 border border-brand-border bg-brand-parchment">
              {[
                ["01", "Carrello"],
                ["02", "Consegna"],
                ["03", "Checkout"],
              ].map(([step, label]) => (
                <div
                  key={step}
                  className="min-w-[94px] border-r border-brand-border px-3 py-3 last:border-r-0 sm:min-w-[118px] sm:px-4 sm:py-4"
                >
                  <div className="text-[10px] uppercase tracking-[0.24em] text-brand-burnt">
                    {step}
                  </div>
                  <div className="mt-2 text-[15px] text-brand-dark-brown sm:text-[17px]">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="editorial-container grid grid-cols-1 gap-6 px-5 py-6 sm:px-6 sm:py-8 lg:grid-cols-[minmax(0,1.15fr)_380px] lg:gap-8 lg:px-10 lg:py-10">
        <div className="order-2 space-y-6 lg:order-1">
          <section className="border border-brand-border bg-brand-cream px-5 py-5 sm:px-6 sm:py-6">
            <div className="text-[13px] font-semibold uppercase tracking-[0.24em] text-brand-burnt">
              Contatto cliente
            </div>
            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
              <input
                type="email"
                required
                value={formData.email}
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="Email"
                className="h-[58px] border border-brand-border bg-white px-4 text-[18px] text-brand-dark-brown outline-none placeholder:text-brand-dust"
              />
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                placeholder="Telefono"
                className="h-[58px] border border-brand-border bg-white px-4 text-[18px] text-brand-dark-brown outline-none placeholder:text-brand-dust"
              />
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(event) => updateField("firstName", event.target.value)}
                placeholder="Nome"
                className="h-[58px] border border-brand-border bg-white px-4 text-[18px] text-brand-dark-brown outline-none placeholder:text-brand-dust"
              />
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(event) => updateField("lastName", event.target.value)}
                placeholder="Cognome"
                className="h-[58px] border border-brand-border bg-white px-4 text-[18px] text-brand-dark-brown outline-none placeholder:text-brand-dust"
              />
            </div>
          </section>

          <section className="border border-brand-border bg-brand-cream px-5 py-5 sm:px-6 sm:py-6">
            <div>
              <div className="text-[13px] font-semibold uppercase tracking-[0.24em] text-brand-burnt">
                {isDigitalGiftCardOrder ? "Consegna gift card" : "Consegna"}
              </div>
              <p className="mt-3 max-w-[620px] text-[19px] leading-[1.9] text-brand-dust">
                {isDigitalGiftCardOrder
                  ? "Il buono regalo viene consegnato digitalmente dopo il pagamento. Non vengono applicati costi di spedizione."
                  : "Scegli se ricevere l'ordine a casa oppure pagare online e ritirarlo in store senza costi di spedizione."}
              </p>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3">
              {isDigitalGiftCardOrder ? (
                <div className="border border-brand-border bg-white px-5 py-5 text-brand-dark-brown">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                          <div className="text-[17px] uppercase tracking-[0.14em]">
                            Gift card digitale
                          </div>
                          <p className="mt-3 text-[18px] leading-[1.8] text-brand-dust">
                            Il codice verra generato e inviato digitalmente dopo il pagamento.
                          </p>
                    </div>
                    <div className="text-[18px]">{formatPrice(0, currencyCode)}</div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setDeliveryMode("shipping")}
                      className={`border px-5 py-5 text-left transition-colors ${
                        effectiveDeliveryMode === "shipping"
                          ? "border-brand-dark-brown bg-brand-dark-brown text-brand-cream"
                          : "border-brand-border bg-white text-brand-dark-brown hover:bg-brand-parchment"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-[17px] uppercase tracking-[0.14em]">
                            Spedizione Italia
                          </div>
                          <p
                            className={`mt-3 text-[18px] leading-[1.8] ${
                              effectiveDeliveryMode === "shipping"
                                ? "text-brand-cream"
                                : "text-brand-dust"
                            }`}
                          >
                            Ricevi l'ordine all'indirizzo indicato.
                          </p>
                        </div>
                        <div className="text-[18px]">{formatPrice(5, currencyCode)}</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => canUsePickup && setDeliveryMode("pickup")}
                      disabled={!canUsePickup}
                      className={`border px-5 py-5 text-left transition-colors ${
                        effectiveDeliveryMode === "pickup"
                          ? "border-brand-dark-brown bg-brand-dark-brown text-brand-cream"
                          : canUsePickup
                            ? "border-brand-border bg-white text-brand-dark-brown hover:bg-brand-parchment"
                            : "cursor-not-allowed border-brand-border bg-white text-brand-dust opacity-60"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-[17px] uppercase tracking-[0.14em]">
                            Ritira in store
                          </div>
                          <p
                            className={`mt-3 text-[18px] leading-[1.8] ${
                              effectiveDeliveryMode === "pickup" ? "text-brand-cream" : "text-brand-dust"
                            }`}
                          >
                            {canUsePickup
                              ? "Paghi online e ritiri in boutique senza costi di spedizione."
                              : "Ritiro non disponibile per tutti gli articoli del carrello."}
                          </p>
                        </div>
                        <div className="text-[18px]">{formatPrice(0, currencyCode)}</div>
                      </div>
                    </button>
                  </div>

                  {effectiveDeliveryMode === "pickup" && canUsePickup ? (
                    <div className="border border-brand-border bg-white px-5 py-5 text-brand-dark-brown">
                      <div className="text-[17px] uppercase tracking-[0.14em]">Boutique disponibili</div>
                      <div className="mt-3 space-y-2 text-[18px] leading-[1.8] text-brand-dust">
                        {pickupLocations.map((location) => (
                          <p key={location.location.id}>
                            {location.location.name}
                            {location.pickUpTime ? ` - ${location.pickUpTime}` : ""}
                          </p>
                        ))}
                      </div>
                      <p className="mt-4 text-[18px] leading-[1.8] text-brand-dust">
                        Nel checkout Shopify vedrai l&apos;opzione di ritiro e potrai finalizzare il
                        pagamento online prima di passare in negozio.
                      </p>
                    </div>
                  ) : null}

                  {effectiveDeliveryMode === "shipping" ? (
                    <>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <input
                          type="text"
                          required
                          value={formData.address}
                          onChange={(event) => updateField("address", event.target.value)}
                          placeholder="Indirizzo"
                          className="md:col-span-2 h-[58px] border border-brand-border bg-white px-4 text-[18px] text-brand-dark-brown outline-none placeholder:text-brand-dust"
                        />
                        <input
                          type="text"
                          required
                          value={formData.postalCode}
                          onChange={(event) => updateField("postalCode", event.target.value)}
                          placeholder="CAP"
                          className="h-[58px] border border-brand-border bg-white px-4 text-[18px] text-brand-dark-brown outline-none placeholder:text-brand-dust"
                        />
                      </div>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(event) => updateField("city", event.target.value)}
                        placeholder="Citta"
                        className="h-[58px] border border-brand-border bg-white px-4 text-[18px] text-brand-dark-brown outline-none placeholder:text-brand-dust"
                      />
                    </>
                  ) : null}
                </>
              )}
            </div>
          </section>

          {errorMessage ? (
            <div className="border border-[rgba(184,67,26,0.22)] bg-white px-5 py-5 text-[17px] leading-[1.9] text-brand-dark-brown sm:px-6 sm:py-6">
              {errorMessage}
            </div>
          ) : null}

          {isSubmitted ? (
            <div className="border border-brand-border bg-white px-5 py-5 text-[17px] leading-[1.9] text-brand-dark-brown sm:px-6 sm:py-6">
              Reindirizzamento al checkout Shopify pronto.
            </div>
          ) : null}
        </div>

        <aside className="order-1 h-fit border border-brand-border bg-brand-cream lg:order-2 lg:sticky lg:top-[124px]">
          <div className="border-b border-brand-border bg-brand-parchment px-5 py-5">
            <div className="text-[13px] font-semibold uppercase tracking-[0.24em] text-brand-burnt">
              Riepilogo ordine
            </div>
          </div>

          <div className="space-y-4 px-5 py-5">
            {items.map((item) => {
              const productHref = item.handle ? `/products/${item.handle}` : null;

              return (
                <div
                  key={item.id}
                  className="grid grid-cols-[72px_minmax(0,1fr)] gap-3 border border-brand-border bg-white p-3 sm:grid-cols-[88px_minmax(0,1fr)] sm:gap-4"
                >
                  {productHref ? (
                    <Link href={productHref} className="relative aspect-[3/4] overflow-hidden bg-brand-parchment">
                      {item.featuredImage ? (
                        <Image
                          src={getOptimizedShopifyImageUrl(item.featuredImage, 240)}
                          alt={item.featuredImage.altText || item.title}
                          fill
                          className="object-cover transition-transform duration-300 hover:scale-[1.02]"
                          unoptimized={isShopifyCdnImage(item.featuredImage)}
                          sizes="(min-width: 640px) 88px, 72px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[11px] text-brand-dust">
                          No image
                        </div>
                      )}
                    </Link>
                  ) : (
                    <div className="relative aspect-[3/4] overflow-hidden bg-brand-parchment">
                      {item.featuredImage ? (
                        <Image
                          src={getOptimizedShopifyImageUrl(item.featuredImage, 240)}
                          alt={item.featuredImage.altText || item.title}
                          fill
                          className="object-cover"
                          unoptimized={isShopifyCdnImage(item.featuredImage)}
                          sizes="(min-width: 640px) 88px, 72px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[11px] text-brand-dust">
                          No image
                        </div>
                      )}
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[12px] uppercase tracking-[0.2em] text-brand-dust">
                          {item.vendor || item.productType}
                        </div>
                        {productHref ? (
                          <Link
                            href={productHref}
                            className="mt-2 block font-libre text-[20px] leading-[1.08] text-brand-dark-brown no-underline transition-colors hover:text-brand-tobacco sm:text-[22px]"
                          >
                            {item.title}
                          </Link>
                        ) : (
                          <div className="mt-2 font-libre text-[20px] leading-[1.08] text-brand-dark-brown sm:text-[22px]">
                            {item.title}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="shrink-0 text-[12px] uppercase tracking-[0.18em] text-brand-tobacco"
                      >
                        Rimuovi
                      </button>
                    </div>
                  <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[13px] uppercase tracking-[0.18em] text-brand-dust">
                    {item.size ? <span>Taglia {item.size}</span> : null}
                    {item.color ? <span>{item.color}</span> : null}
                    <span>Qty {item.quantity}</span>
                  </div>
                  <div className="mt-4 text-[18px] text-brand-tobacco">
                    {formatPrice(Number(item.price.amount) * item.quantity, item.price.currencyCode)}
                  </div>
                </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-brand-border bg-white px-5 py-5">
            <div className="border-b border-brand-border pb-5">
              <div className="text-[12px] uppercase tracking-[0.22em] text-brand-burnt">
                Codice sconto
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={discountCodeInput}
                  onChange={(event) => {
                    if (errorMessage) {
                      clearError();
                    }
                    setDiscountCodeDraft(event.target.value);
                  }}
                  placeholder="Inserisci il codice"
                  className="h-[46px] flex-1 border border-brand-border bg-white px-4 text-[16px] uppercase tracking-[0.08em] text-brand-dark-brown outline-none placeholder:tracking-[0.04em] placeholder:text-brand-dust"
                />
                <button
                  type="button"
                  onClick={() => applyDiscountCode(discountCodeInput)}
                  disabled={isSyncing || !discountCodeInput.trim()}
                  className="min-w-[108px] border border-brand-dark-brown bg-brand-dark-brown px-4 text-[12px] uppercase tracking-[0.22em] text-brand-cream transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Applica
                </button>
              </div>

              {appliedDiscountCode ? (
                <div className="mt-3 flex items-start justify-between gap-4 border border-brand-border bg-brand-cream px-4 py-3">
                  <div>
                    <div className="text-[13px] uppercase tracking-[0.2em] text-brand-burnt">
                      {appliedDiscountCode.code}
                    </div>
                    <p className="mt-2 text-[15px] leading-[1.7] text-brand-dust">
                      Codice applicato al checkout.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      await removeDiscountCode();
                      setDiscountCodeDraft(null);
                    }}
                    className="text-[12px] uppercase tracking-[0.18em] text-brand-tobacco"
                  >
                    Rimuovi
                  </button>
                </div>
              ) : null}

              <p className="mt-3 text-[16px] leading-[1.8] text-brand-dust">
                <strong className="font-semibold text-brand-dark-brown">Gift card:</strong>{" "}
                i codici regalo sono applicabili nello step successivo del checkout Shopify.
              </p>
            </div>

            <div className="mt-5 space-y-3 text-[18px] text-brand-dark-brown">
              <div className="flex items-center justify-between font-semibold text-brand-dark-brown">
                <span>Subtotal</span>
                <span className="font-semibold">{formatPrice(subtotal, currencyCode)}</span>
              </div>
              {discountAmount > 0 ? (
                <div className="flex items-center justify-between font-semibold text-brand-dark-brown">
                  <span>
                    Sconto
                    {appliedDiscountCode ? ` (${appliedDiscountCode.code})` : ""}
                  </span>
                  <span className="font-semibold">-{formatPrice(discountAmount, currencyCode)}</span>
                </div>
              ) : null}
              <div className="flex items-center justify-between font-semibold text-brand-dark-brown">
                <span>{summaryLabel}</span>
                <span className="font-semibold">{formatPrice(shippingPrice, currencyCode)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-brand-border pt-3 text-[20px] font-semibold text-brand-dark-brown">
                <span>Totale stimato</span>
                <span>{formatPrice(total, currencyCode)}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCheckoutRedirect}
              className="mt-5 flex min-h-[58px] w-full items-center justify-center bg-brand-dark-brown px-5 py-4 text-[15px] uppercase tracking-[0.22em] text-brand-cream transition-colors hover:bg-brand-tobacco"
              disabled={isSyncing}
            >
              {isSyncing
                ? "Reindirizzamento..."
                : isUsingShopify
                  ? "Paga adesso"
                  : "Vai al checkout Shopify"}
            </button>
            {invalidDiscountCode ? (
              <p className="mt-4 text-[15px] leading-[1.7] text-brand-tobacco">
                Il codice {invalidDiscountCode.code} non e applicabile a questo carrello.
              </p>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}
