"use client";

import { useState } from "react";
import { ShopifyProduct, ShopifyProductVariant } from "@/types/shopify";

function getVariantSize(variant: ShopifyProductVariant | null) {
  if (!variant) {
    return null;
  }

  return (
    variant.selectedOptions.find(({ name }) => {
      const normalizedName = name.trim().toLowerCase();
      return normalizedName === "size" || normalizedName === "taglia";
    })?.value ?? variant.title
  );
}

export function BackInStockForm({
  product,
  variant,
}: {
  product: ShopifyProduct;
  variant: ShopifyProductVariant | null;
}) {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const selectedSize = getVariantSize(variant);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/commerce-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          kind: "back-in-stock",
          email,
          productId: product.id,
          productHandle: product.handle,
          productTitle: product.title,
          variantId: variant?.id ?? null,
          size: selectedSize,
        }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Richiesta non inviata.");
      }

      setIsSubmitted(true);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Richiesta non inviata per un errore server.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="border border-[rgba(184,67,26,0.18)] bg-[rgba(242,236,224,0.55)] px-5 py-5">
      <div className="text-[10px] uppercase tracking-[0.24em] text-brand-burnt">
        Avvisami
      </div>
      <h3 className="mt-3 font-libre text-[30px] leading-[1] text-brand-dark-brown">
        {selectedSize ? `Taglia ${selectedSize} esaurita online.` : "Articolo esaurito online."}
      </h3>
      <p className="mt-4 max-w-[520px] text-[14px] leading-[1.85] text-brand-dust">
        Lascia la tua email e ti avvisiamo appena {product.title} torna disponibile nella variante selezionata.
      </p>

      {errorMessage ? (
        <div className="mt-5 border border-[rgba(184,67,26,0.2)] bg-white px-4 py-4 text-[13px] leading-[1.8] text-brand-dark-brown">
          {errorMessage}
        </div>
      ) : null}

      {isSubmitted ? (
        <div className="mt-5 border border-brand-border bg-white px-4 py-4 text-[13px] leading-[1.8] text-brand-dark-brown">
          Richiesta registrata. Ti contatteremo su <strong>{email}</strong> non appena rientra la disponibilita.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3 md:flex-row">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            placeholder="La tua email"
            className="h-[54px] flex-1 border border-brand-border bg-white px-4 text-[15px] text-brand-dark-brown outline-none placeholder:text-brand-dust"
          />
          <button type="submit" className="btn-dark h-[54px] px-8" disabled={isSubmitting}>
            {isSubmitting ? "Invio..." : "Avvisami"}
          </button>
        </form>
      )}
    </div>
  );
}
