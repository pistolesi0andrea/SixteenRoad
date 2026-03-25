"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { ShopifyAttribute, ShopifyProduct, ShopifyProductVariant } from "@/types/shopify";

function formatCurrency(amount: number | string, currencyCode = "EUR") {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

function getGiftCardVariants(product: ShopifyProduct | null) {
  if (!product) {
    return [];
  }

  return product.variants.edges
    .map((edge) => edge.node)
    .filter((variant) => variant.id)
    .sort((left, right) => Number(left.price.amount) - Number(right.price.amount));
}

function getVariantLabel(variant: ShopifyProductVariant) {
  const amountOption = variant.selectedOptions.find(({ name }) => {
    const normalizedName = name.trim().toLowerCase();
    return (
      normalizedName === "amount" ||
      normalizedName === "importo" ||
      normalizedName === "denominazione"
    );
  });

  if (amountOption?.value) {
    return amountOption.value;
  }

  if (variant.title && variant.title !== "Default Title") {
    return variant.title;
  }

  return formatCurrency(variant.price.amount, variant.price.currencyCode);
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function buildShopifyGiftCardMessage(senderName: string, giftMessage: string) {
  if (senderName && giftMessage) {
    return `Da parte di ${senderName}\n\n${giftMessage}`;
  }

  if (senderName) {
    return `Da parte di ${senderName}`;
  }

  return giftMessage;
}

export function GiftCardBuilder({ product }: { product: ShopifyProduct | null }) {
  const { addItem, openCart } = useCart();
  const variants = useMemo(() => getGiftCardVariants(product), [product]);
  const defaultVariant = variants.find((variant) => variant.availableForSale) ?? variants[0] ?? null;
  const defaultVariantIndex = defaultVariant
    ? Math.max(
        variants.findIndex((variant) => variant.id === defaultVariant.id),
        0,
      )
    : 0;

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(defaultVariantIndex);
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [senderName, setSenderName] = useState("");
  const [giftMessage, setGiftMessage] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const selectedVariant = variants[selectedVariantIndex] ?? defaultVariant ?? null;
  const currencyCode =
    selectedVariant?.price.currencyCode ?? product?.priceRange.minVariantPrice.currencyCode ?? "EUR";
  const selectedAmount = selectedVariant
    ? formatCurrency(selectedVariant.price.amount, currencyCode)
    : formatCurrency(0, currencyCode);
  const sliderProgress =
    variants.length > 1 ? (selectedVariantIndex / (variants.length - 1)) * 100 : 100;
  const introMessage =
    "Stai facendo acquisti per qualcuno ma non sai cosa regalargli? Regala il dono della scelta con un buono regalo di Sixteenroad! I buoni regalo vengono consegnati via email e contengono le istruzioni per riscattarli al momento del check-out. I nostri buoni regalo non presentano costi aggiuntivi!";
  const trimmedRecipientName = recipientName.trim();
  const trimmedRecipientEmail = recipientEmail.trim();
  const trimmedSenderName = senderName.trim();
  const trimmedGiftMessage = giftMessage.trim();
  const nativeShopifyMessage = buildShopifyGiftCardMessage(trimmedSenderName, trimmedGiftMessage);

  const lineAttributes: ShopifyAttribute[] = [
    { key: "gift_card_recipient_name", value: trimmedRecipientName },
    { key: "gift_card_recipient_email", value: trimmedRecipientEmail },
    { key: "gift_card_sender_name", value: trimmedSenderName },
    { key: "gift_card_message", value: trimmedGiftMessage },
    ...(trimmedRecipientEmail
      ? [
          { key: "__shopify_send_gift_card_to_recipient", value: "true" },
          { key: "Recipient email", value: trimmedRecipientEmail },
          ...(trimmedRecipientName
            ? [{ key: "Recipient name", value: trimmedRecipientName }]
            : []),
          ...(nativeShopifyMessage ? [{ key: "Message", value: nativeShopifyMessage }] : []),
        ]
      : []),
  ].filter((attribute) => attribute.value);

  async function handleAddToCart() {
    if (!product || !selectedVariant || !selectedVariant.availableForSale || isAdding) {
      return;
    }

    if (trimmedRecipientEmail && !isValidEmail(trimmedRecipientEmail)) {
      setFormError("Inserisci un'email valida per la consegna della gift card.");
      return;
    }

    try {
      setIsAdding(true);
      setFormError(null);
      await addItem(product, {
        variant: selectedVariant,
        image: product.featuredImage,
        attributes: lineAttributes,
      });
      openCart();
    } finally {
      setIsAdding(false);
    }
  }

  if (!product || !selectedVariant) {
    return (
      <div className="border-y border-brand-border bg-brand-cream">
        <div className="editorial-container px-6 py-14 lg:px-10 lg:py-16">
          <div className="mx-auto max-w-[880px] border border-brand-border bg-brand-parchment px-7 py-8 lg:px-10 lg:py-10">
            <div className="text-[11px] uppercase tracking-[0.24em] text-brand-burnt">
              Buoni regalo Shopify
            </div>
            <h1 className="mt-4 font-libre text-[42px] leading-[0.96] text-brand-dark-brown lg:text-[58px]">
              Nessun prodotto gift card trovato.
            </h1>
            <p className="mt-5 max-w-[620px] text-[16px] leading-[1.9] text-brand-dust">
              Per attivare questa pagina crea un prodotto gift card su Shopify e, se vuoi essere
              preciso, imposta anche `SHOPIFY_GIFT_CARD_PRODUCT_HANDLE` nel file `.env.local`.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden border-y border-brand-border bg-brand-cream">
      <div className="absolute left-[-90px] top-[-90px] h-72 w-72 rounded-full bg-[rgba(192,168,122,0.18)] blur-3xl" />
      <div className="absolute right-[-120px] top-[180px] h-80 w-80 rounded-full bg-[rgba(184,67,26,0.12)] blur-3xl" />

      <div className="grid grid-cols-1 xl:grid-cols-[1.02fr_0.98fr]">
        <section className="relative border-b border-brand-border bg-[linear-gradient(180deg,#ece3d2_0%,#f7f2e8_100%)] px-5 py-8 sm:px-6 sm:py-10 md:px-12 md:py-16 xl:border-b-0 xl:border-r">
          <div className="relative z-10 mx-auto max-w-3xl">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative h-12 w-12 overflow-hidden rounded-full border border-brand-border bg-brand-parchment shadow-sm sm:h-14 sm:w-14">
                <Image src="/logo.jpg" alt="Sixteen Road" fill className="object-cover" sizes="(min-width: 640px) 56px, 48px" />
              </div>
              <h1 className="font-libre text-[40px] leading-[0.92] text-brand-dark-brown sm:text-[54px] md:text-[86px]">
                Buono <em className="italic text-brand-tobacco">Regalo.</em>
              </h1>
            </div>

            <div className="mt-8 max-w-[680px]">
              <p className="text-[20px] leading-[1.75] text-brand-dust">
                {introMessage}
              </p>
            </div>

            <div className="mt-10 rounded-[28px] border border-[rgba(61,36,16,0.14)] bg-[rgba(255,255,255,0.72)] p-5 shadow-[0_18px_44px_rgba(61,36,16,0.08)] backdrop-blur-sm md:p-7">
              <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="text-[15px] uppercase tracking-[0.22em] text-brand-dust">
                    Importo selezionato
                  </div>
                  <div className="mt-3 font-libre text-[34px] leading-none text-brand-dark-brown sm:text-[42px]">
                    {selectedAmount}
                  </div>
                </div>

                <div className="text-[14px] leading-[1.8] text-brand-dust sm:text-[15px]">
                  La gift card viene generata da Shopify dopo il pagamento.
                </div>
              </div>

              <div className="mt-8">
                <div className="text-[13px] uppercase tracking-[0.22em] text-brand-dust">
                  Importo della gift card
                </div>

                <div className="mt-5 rounded-[22px] border border-[rgba(61,36,16,0.14)] bg-brand-cream px-4 py-5">
                  <input
                    type="range"
                    min={0}
                    max={Math.max(variants.length - 1, 0)}
                    step={1}
                    value={selectedVariantIndex}
                    onChange={(event) => setSelectedVariantIndex(Number(event.target.value))}
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-transparent"
                    style={{
                      background: `linear-gradient(to right, #3d2410 0%, #3d2410 ${sliderProgress}%, rgba(61,36,16,0.14) ${sliderProgress}%, rgba(61,36,16,0.14) 100%)`,
                    }}
                    disabled={variants.length <= 1}
                  />
                  <div className="mt-3 flex items-center justify-between text-[12px] uppercase tracking-[0.18em] text-brand-dust">
                    <span>{variants[0] ? getVariantLabel(variants[0]) : selectedAmount}</span>
                    <span>
                      {variants[variants.length - 1]
                        ? getVariantLabel(variants[variants.length - 1])
                        : selectedAmount}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  {variants.map((variant, index) => {
                    const isActive = selectedVariant.id === variant.id;

                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => setSelectedVariantIndex(index)}
                        className={`rounded-full border px-5 py-3 text-[14px] uppercase tracking-[0.18em] transition-all ${
                          isActive
                            ? "border-brand-dark-brown bg-brand-dark-brown text-brand-cream shadow-sm"
                            : variant.availableForSale
                              ? "border-[rgba(61,36,16,0.14)] bg-white text-brand-dark-brown"
                              : "border-[rgba(61,36,16,0.14)] bg-white text-brand-dust line-through opacity-60"
                        }`}
                        disabled={!variant.availableForSale}
                      >
                        {getVariantLabel(variant)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-3">
                <input
                  type="text"
                  value={recipientName}
                  onChange={(event) => setRecipientName(event.target.value.slice(0, 255))}
                  placeholder="Nome destinatario"
                  className="h-[56px] border border-[rgba(61,36,16,0.14)] bg-white px-4 text-[16px] text-brand-dark-brown outline-none placeholder:text-brand-dust"
                />
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(event) => setRecipientEmail(event.target.value)}
                  placeholder="Email destinatario"
                  className="h-[56px] border border-[rgba(61,36,16,0.14)] bg-white px-4 text-[16px] text-brand-dark-brown outline-none placeholder:text-brand-dust"
                />
                <input
                  type="text"
                  value={senderName}
                  onChange={(event) => setSenderName(event.target.value)}
                  placeholder="Chi fa la carta regalo"
                  className="h-[56px] border border-[rgba(61,36,16,0.14)] bg-white px-4 text-[16px] text-brand-dark-brown outline-none placeholder:text-brand-dust"
                />
              </div>

              <div className="mt-3">
                <textarea
                  value={giftMessage}
                  onChange={(event) => setGiftMessage(event.target.value.slice(0, 200))}
                  placeholder="Messaggio per la consegna della gift card"
                  className="min-h-[138px] w-full resize-none border border-[rgba(61,36,16,0.14)] bg-white px-4 py-4 text-[16px] leading-[1.7] text-brand-dark-brown outline-none placeholder:text-brand-dust"
                />
                <div className="mt-2 text-right text-[12px] uppercase tracking-[0.18em] text-brand-dust">
                  {giftMessage.length}/200
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isAdding || !selectedVariant.availableForSale}
                  className={`btn-dark px-8 text-[14px] ${
                    isAdding || !selectedVariant.availableForSale ? "opacity-60" : ""
                  }`}
                >
                  {isAdding
                    ? "Aggiunta in corso..."
                    : selectedVariant.availableForSale
                      ? "Aggiungi Gift Card al Carrello"
                      : "Gift Card non disponibile"}
                </button>
              </div>

              {formError ? (
                <div className="mt-4 border border-[rgba(184,67,26,0.18)] bg-[rgba(184,67,26,0.06)] px-4 py-3 text-[15px] leading-[1.7] text-brand-dark-brown">
                  {formError}
                </div>
              ) : null}

              <div className="mt-5 text-[17px] leading-[1.8] text-brand-dust sm:text-[18px] md:text-[20px]">
                Il pagamento viene gestito dal checkout Shopify. Se inserisci l&apos;email del
                destinatario, Shopify inviera la gift card direttamente a quella persona dopo
                l&apos;acquisto; senza email, il buono verra consegnato all&apos;acquirente.
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[linear-gradient(135deg,#28160d_0%,#522414_52%,#6d1a1a_100%)] px-5 py-8 sm:px-6 sm:py-10 md:px-12 md:py-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(242,236,224,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(192,168,122,0.18),transparent_28%)]" />

          <div className="relative z-10 mx-auto max-w-xl">
            <div className="text-[13px] uppercase tracking-[0.26em] text-[rgba(242,236,224,0.72)]">
              Live preview
            </div>

            <div className="mt-5 rounded-[34px] border border-[rgba(242,236,224,0.18)] bg-[rgba(242,236,224,0.08)] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.22)] backdrop-blur-md md:p-6">
              <div className="relative overflow-hidden rounded-[28px] border border-[rgba(242,236,224,0.16)] bg-[linear-gradient(145deg,rgba(242,236,224,0.08),rgba(255,255,255,0.02))] p-6 text-brand-cream">
                <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[rgba(242,236,224,0.12)] blur-2xl" />
                <div className="absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-[rgba(192,168,122,0.18)] blur-2xl" />

                <div className="relative flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative h-12 w-12 overflow-hidden rounded-full border border-[rgba(242,236,224,0.34)] bg-[rgba(242,236,224,0.08)] sm:h-14 sm:w-14">
                      <Image src="/logo.jpg" alt="Sixteen Road" fill className="object-cover" sizes="(min-width: 640px) 56px, 48px" />
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-[0.28em] text-[rgba(242,236,224,0.68)]">
                        Sixteen Road
                      </div>
                      <div className="mt-2 font-libre text-[22px] leading-none sm:text-[24px]">Gift Card</div>
                    </div>
                  </div>
                </div>

                <div className="relative mt-10 font-libre text-[46px] leading-none sm:text-[58px] md:text-[78px]">
                  {selectedAmount}
                </div>

                <div className="relative mt-8 grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div className="rounded-[18px] border border-[rgba(242,236,224,0.14)] bg-[rgba(242,236,224,0.08)] px-4 py-4">
                    <div className="text-[9px] uppercase tracking-[0.24em] text-[rgba(242,236,224,0.62)]">
                      Destinatario
                    </div>
                    <div className="mt-2 text-[16px]">
                      {trimmedRecipientName || "Inserisci il nome destinatario"}
                    </div>
                  </div>
                  <div className="rounded-[18px] border border-[rgba(242,236,224,0.14)] bg-[rgba(242,236,224,0.08)] px-4 py-4">
                    <div className="text-[9px] uppercase tracking-[0.24em] text-[rgba(242,236,224,0.62)]">
                      Email destinatario
                    </div>
                    <div className="mt-2 text-[16px] break-all">
                      {trimmedRecipientEmail || "Se la inserisci, Shopify invia il buono diretto"}
                    </div>
                  </div>
                  <div className="rounded-[18px] border border-[rgba(242,236,224,0.14)] bg-[rgba(242,236,224,0.08)] px-4 py-4">
                    <div className="text-[9px] uppercase tracking-[0.24em] text-[rgba(242,236,224,0.62)]">
                      Da parte di
                    </div>
                    <div className="mt-2 text-[16px]">
                      {trimmedSenderName || "Inserisci chi fa la carta regalo"}
                    </div>
                  </div>
                </div>

                <div className="relative mt-3 rounded-[18px] border border-[rgba(242,236,224,0.14)] bg-[rgba(242,236,224,0.08)] px-4 py-4">
                  <div className="text-[9px] uppercase tracking-[0.24em] text-[rgba(242,236,224,0.62)]">
                    Messaggio
                  </div>
                  <div className="mt-2 text-[16px] leading-[1.7] text-[rgba(242,236,224,0.92)]">
                    {trimmedGiftMessage ||
                      "Aggiungi una dedica da consegnare insieme alla gift card."}
                  </div>
                </div>

                <div className="relative mt-6 max-w-[420px] font-im-fell text-[24px] italic leading-[1.18] text-[rgba(242,236,224,0.96)] sm:text-[30px]">
                  {product.title}
                </div>

                <div className="relative mt-8 text-[11px] uppercase tracking-[0.22em] text-[rgba(242,236,224,0.76)]">
                  Shopify gestisce pagamento, invio al destinatario e generazione del buono regalo reale.
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
