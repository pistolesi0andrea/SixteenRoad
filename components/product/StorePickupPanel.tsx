"use client";

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
  const selectedSize = getVariantSize(variant);
  const storeAvailability = getPreferredStoreAvailability(variant);
  const storeLabel = storeAvailability?.location.name || "Via Zara 16, Civitanova Marche";

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
          {storeLabel}. Seleziona il ritiro in store al checkout per {product.title}
          {selectedSize ? ` in taglia ${selectedSize}` : ""}, paga online e vieni poi a ritirarlo
          in boutique.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 border-y border-[rgba(61,36,16,0.12)] py-5 lg:grid-cols-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-brand-dust sm:text-[12px]">Servizio</div>
          <div className="mt-2 text-[16px] text-brand-dark-brown sm:text-[18px]">
            Paga online e ritira
          </div>
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
        Il ritiro in store e gratuito. Se lo stock e disponibile in boutique, troverai l&apos;opzione
        dedicata nel checkout Shopify e potrai finalizzare l&apos;ordine senza costi di spedizione.
      </p>

      <div className="mt-5 border border-brand-border bg-white px-4 py-4 text-[14px] leading-[1.8] text-brand-dark-brown sm:text-[15px]">
        <strong>Nota:</strong> non serve compilare una richiesta separata. Paghi online, selezioni
        <strong> Ritira in store </strong>
        nel checkout e passi in boutique quando l&apos;ordine e pronto.
      </div>
    </section>
  );
}
