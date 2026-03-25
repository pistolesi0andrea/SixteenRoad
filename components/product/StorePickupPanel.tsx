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

function getPreferredStoreAvailability(variant: ShopifyProductVariant | null) {
  return (
    variant?.storeAvailability?.find((availability) => availability.available) ??
    variant?.storeAvailability?.[0] ??
    null
  );
}

export function StorePickupPanel({
  product,
  variant,
}: {
  product: ShopifyProduct;
  variant: ShopifyProductVariant | null;
}) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    preferredSlot: "",
    notes: "",
  });
  const selectedSize = getVariantSize(variant);
  const storeAvailability = getPreferredStoreAvailability(variant);
  const storeLabel = storeAvailability?.location.name || "Via Zara 16, Civitanova Marche";

  function updateField(field: keyof typeof formData, value: string) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  }

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
          kind: "store-pickup",
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          preferredSlot: formData.preferredSlot,
          notes: formData.notes,
          productId: product.id,
          productHandle: product.handle,
          productTitle: product.title,
          variantId: variant?.id ?? null,
          size: selectedSize,
          locationId: storeAvailability?.location.id ?? null,
          locationName: storeLabel,
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
    <section className="border border-brand-border bg-brand-parchment px-4 py-4 sm:px-5 sm:py-5">
      <div>
        <div className="text-[10px] uppercase tracking-[0.24em] text-brand-burnt sm:text-[12px]">
          Servizi boutique
        </div>
        <h3 className="mt-3 font-libre text-[28px] leading-[1] text-brand-dark-brown sm:text-[32px]">
          Ritira in store
        </h3>
        <p className="mt-4 max-w-[640px] text-[15px] leading-[1.85] text-brand-dust sm:text-[16px]">
          {storeLabel}. Inviaci la richiesta per {product.title}
          {selectedSize ? ` in taglia ${selectedSize}` : ""} e ti confermiamo quando il capo e
          pronto in negozio.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 border-y border-[rgba(61,36,16,0.12)] py-5 lg:grid-cols-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-brand-dust sm:text-[12px]">Servizio</div>
          <div className="mt-2 text-[16px] text-brand-dark-brown sm:text-[18px]">Ritira in store</div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-brand-dust sm:text-[12px]">
            Contatto store
          </div>
          <div className="mt-2 text-[16px] text-brand-dark-brown sm:text-[18px]">348 531 0887</div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-brand-dust sm:text-[12px]">
            Disponibilita
          </div>
          <div className="mt-2 text-[16px] text-brand-dark-brown sm:text-[18px]">
            {storeAvailability?.available
              ? storeAvailability.quantityAvailable
                ? `${storeAvailability.quantityAvailable} disponibili per il pickup`
                : storeAvailability.pickUpTime
                  ? `Disponibile per pickup - ${storeAvailability.pickUpTime}`
                  : "Disponibile per pickup in store"
              : variant?.availableForSale
                ? "Pronto per verifica in store"
                : "Verifica disponibilita dedicata"}
          </div>
        </div>
      </div>

      <p className="mt-5 max-w-[620px] text-[15px] leading-[1.85] text-brand-dust sm:text-[16px]">
        Richiedi il ritiro gratuito in store. Ti confermiamo quando il capo e pronto in negozio a
        Civitanova Marche.
      </p>

      {errorMessage ? (
        <div className="mt-5 border border-[rgba(184,67,26,0.2)] bg-white px-4 py-4 text-[14px] leading-[1.8] text-brand-dark-brown sm:text-[15px]">
          {errorMessage}
        </div>
      ) : null}

      {isSubmitted ? (
        <div className="mt-5 border border-brand-border bg-white px-4 py-4 text-[14px] leading-[1.8] text-brand-dark-brown sm:text-[15px]">
          Richiesta di ritiro inviata. Ti ricontattiamo su <strong>{formData.email}</strong> per
          conferma.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
          <input
            type="text"
            value={formData.name}
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="Nome e cognome"
            required
            className="h-[54px] border border-brand-border bg-white px-4 text-[15px] text-brand-dark-brown outline-none placeholder:text-brand-dust sm:h-[58px] sm:text-[17px]"
          />
          <input
            type="email"
            value={formData.email}
            onChange={(event) => updateField("email", event.target.value)}
            placeholder="Email"
            required
            className="h-[54px] border border-brand-border bg-white px-4 text-[15px] text-brand-dark-brown outline-none placeholder:text-brand-dust sm:h-[58px] sm:text-[17px]"
          />
          <input
            type="tel"
            value={formData.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            placeholder="Telefono"
            required
            className="h-[54px] border border-brand-border bg-white px-4 text-[15px] text-brand-dark-brown outline-none placeholder:text-brand-dust sm:h-[58px] sm:text-[17px]"
          />
          <input
            type="text"
            value={formData.preferredSlot}
            onChange={(event) => updateField("preferredSlot", event.target.value)}
            placeholder="Giorno o fascia oraria preferita"
            className="h-[54px] border border-brand-border bg-white px-4 text-[15px] text-brand-dark-brown outline-none placeholder:text-brand-dust sm:h-[58px] sm:text-[17px]"
          />
          <textarea
            value={formData.notes}
            onChange={(event) => updateField("notes", event.target.value)}
            placeholder="Note sul ritiro"
            rows={4}
            className="md:col-span-2 border border-brand-border bg-white px-4 py-4 text-[15px] text-brand-dark-brown outline-none placeholder:text-brand-dust sm:text-[17px]"
          />
          <button
            type="submit"
            className="btn-dark h-[54px] w-full px-8 text-[13px] md:col-span-2 md:w-fit sm:h-[58px] sm:text-[15px]"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Invio..." : "Richiedi ritiro"}
          </button>
        </form>
      )}
    </section>
  );
}
