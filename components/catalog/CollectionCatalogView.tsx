"use client";

import { CatalogProductCard } from "@/components/catalog/CatalogProductCard";
import {
  applyCatalogFilters,
  CatalogFilterState,
  CatalogSort,
  getCatalogFacets,
  getCatalogSizeGroups,
  normalizeCatalogFilters,
  sortCatalogProducts,
} from "@/lib/catalog";
import { ShopifyProduct } from "@/types/shopify";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

const sortOptions: Array<{ value: CatalogSort; label: string }> = [
  { value: "latest", label: "Default" },
  { value: "price-asc", label: "Price, Low - High" },
  { value: "price-desc", label: "Price, High - Low" },
  { value: "title-asc", label: "Name, A - Z" },
];

function emptyFilters(): CatalogFilterState {
  return {
    category: "",
    color: "",
    size: "",
    minPrice: "",
    maxPrice: "",
    sort: "latest",
  };
}

function activeFilterCount(filters: CatalogFilterState) {
  return [
    filters.category,
    filters.color,
    filters.size,
    filters.minPrice,
    filters.maxPrice,
    filters.sort !== "latest" ? filters.sort : "",
  ].filter(Boolean).length;
}

function filterChipClass(isActive: boolean) {
  return `min-h-[44px] border px-3 py-2.5 text-[11px] leading-none transition-colors duration-200 sm:min-h-[52px] sm:px-4 sm:py-3 sm:text-[14px] ${
    isActive
      ? "border-brand-dark-brown bg-brand-dark-brown text-brand-cream"
      : "border-brand-border bg-white text-brand-dark-brown hover:bg-brand-parchment"
  }`;
}

function fieldButtonClass(isActive: boolean) {
  return `min-h-[40px] border px-2.5 py-2 text-[10px] uppercase tracking-[0.04em] transition-colors duration-200 sm:min-h-[48px] sm:px-3 sm:py-3 sm:text-[13px] sm:tracking-[0.06em] ${
    isActive
      ? "border-brand-dark-brown bg-brand-dark-brown text-brand-cream"
      : "border-brand-border bg-white text-brand-dark-brown hover:bg-brand-parchment"
  }`;
}

export function CollectionCatalogView({
  handle,
  title,
  products,
}: {
  handle: string;
  title: string;
  products: ShopifyProduct[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const currentFilters = useMemo(
    () =>
      normalizeCatalogFilters({
        category: searchParams.get("category") ?? "",
        color: searchParams.get("color") ?? "",
        size: searchParams.get("size") ?? "",
        minPrice: searchParams.get("minPrice") ?? "",
        maxPrice: searchParams.get("maxPrice") ?? "",
        sort: searchParams.get("sort") ?? "",
      }),
    [searchParams],
  );

  const [draftFilters, setDraftFilters] = useState<CatalogFilterState>(currentFilters);

  const facets = useMemo(() => getCatalogFacets(products), [products]);
  const sizeGroups = useMemo(() => getCatalogSizeGroups(products), [products]);
  const filteredProducts = useMemo(
    () => sortCatalogProducts(applyCatalogFilters(products, currentFilters), currentFilters.sort),
    [currentFilters, products],
  );

  useEffect(() => {
    setDraftFilters(currentFilters);
  }, [currentFilters]);

  function pushFilters(nextFilters: CatalogFilterState) {
    const params = new URLSearchParams(searchParams.toString());
    const entries: Array<[keyof CatalogFilterState, string]> = [
      ["category", nextFilters.category],
      ["color", nextFilters.color],
      ["size", nextFilters.size],
      ["minPrice", nextFilters.minPrice],
      ["maxPrice", nextFilters.maxPrice],
      ["sort", nextFilters.sort],
    ];

    entries.forEach(([key, value]) => {
      const shouldSkip = key === "sort" ? value === "latest" : !value;

      if (shouldSkip) {
        params.delete(key);
        return;
      }

      params.set(key, value);
    });

    const query = params.toString();

    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  }

  function applyDraftFilters() {
    pushFilters(draftFilters);
    setIsFiltersOpen(false);
  }

  function resetDraftFilters() {
    setDraftFilters(emptyFilters());
  }

  function clearAppliedFilters() {
    pushFilters(emptyFilters());
  }

  function toggleDraftField(field: "category" | "color" | "size", value: string) {
    setDraftFilters((current) => ({
      ...current,
      [field]: current[field] === value ? "" : value,
    }));
  }

  const selectedFilterLabels = [
    currentFilters.category,
    currentFilters.color,
    currentFilters.size ? `Taglia ${currentFilters.size}` : "",
    currentFilters.minPrice ? `Da EUR ${currentFilters.minPrice}` : "",
    currentFilters.maxPrice ? `A EUR ${currentFilters.maxPrice}` : "",
  ].filter(Boolean);

  return (
    <div className="bg-brand-cream">
      <section className="border-b border-brand-border bg-brand-cream px-5 py-8 sm:px-8 sm:py-10 md:px-10 md:py-14 xl:px-14 xl:py-16">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div className="max-w-4xl">
              <div className="text-[10px] uppercase tracking-[0.22em] text-brand-dust sm:text-[11px] sm:tracking-[0.26em]">
                Shop / {handle}
              </div>
              <h1 className="mt-3 font-libre text-[40px] leading-[0.92] text-brand-dark-brown sm:mt-4 sm:text-[54px] lg:text-[72px] xl:text-[84px]">
                {title}
              </h1>
              <div className="mt-4 text-[11px] uppercase tracking-[0.18em] text-brand-dust sm:mt-5 sm:text-[12px] sm:tracking-[0.22em]">
                {filteredProducts.length} articoli disponibili
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsFiltersOpen((current) => !current)}
              className="min-h-[56px] w-full border border-brand-border bg-white px-6 text-[14px] uppercase tracking-[0.06em] text-brand-dark-brown transition-colors duration-200 hover:bg-brand-parchment sm:min-h-[64px] sm:min-w-[190px] sm:w-auto sm:px-8 sm:text-[17px] sm:tracking-[0.08em]"
            >
              Filtri {activeFilterCount(currentFilters) > 0 ? `(${activeFilterCount(currentFilters)})` : ""}
            </button>
          </div>

          {isFiltersOpen ? (
            <div className="overflow-hidden border border-brand-border bg-brand-parchment">
              <div className="border-b border-brand-border px-4 py-4 sm:px-5 sm:py-5">
                <div className="text-[11px] uppercase tracking-[0.24em] text-brand-burnt">
                  Filtri catalogo
                </div>
              </div>

              <div className="space-y-6 px-4 py-5 sm:space-y-8 sm:px-5 sm:py-6 md:px-6 md:py-7">
                <section>
                  <div className="mb-3 inline-block border-b border-brand-border pb-2 text-[15px] text-brand-dark-brown sm:text-[17px]">
                    Ordina
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          setDraftFilters((current) => ({
                            ...current,
                            sort: option.value,
                          }))
                        }
                        className={filterChipClass(draftFilters.sort === option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <div className="mb-3 inline-block border-b border-brand-border pb-2 text-[15px] text-brand-dark-brown sm:text-[17px]">
                    Categoria
                  </div>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {facets.categories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => toggleDraftField("category", category)}
                        className={fieldButtonClass(draftFilters.category === category)}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <div className="mb-3 inline-block border-b border-brand-border pb-2 text-[15px] text-brand-dark-brown sm:text-[17px]">
                    Colore
                  </div>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {facets.colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => toggleDraftField("color", color)}
                        className={fieldButtonClass(draftFilters.color === color)}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </section>

                {sizeGroups.apparel.length > 0 ? (
                  <section>
                    <div className="mb-3 inline-block border-b border-brand-border pb-2 text-[15px] text-brand-dark-brown sm:text-[17px]">
                      Apparel
                    </div>
                    <div className="grid grid-cols-4 gap-3 md:grid-cols-5">
                      {sizeGroups.apparel.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => toggleDraftField("size", size)}
                          className={fieldButtonClass(draftFilters.size === size)}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </section>
                ) : null}

                {sizeGroups.bottoms.length > 0 ? (
                  <section>
                    <div className="mb-3 inline-block border-b border-brand-border pb-2 text-[15px] text-brand-dark-brown sm:text-[17px]">
                      Bottoms
                    </div>
                    <div className="grid grid-cols-4 gap-3 md:grid-cols-5">
                      {sizeGroups.bottoms.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => toggleDraftField("size", size)}
                          className={fieldButtonClass(draftFilters.size === size)}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </section>
                ) : null}

                {sizeGroups.tailoring.length > 0 ? (
                  <section>
                    <div className="mb-3 inline-block border-b border-brand-border pb-2 text-[15px] text-brand-dark-brown sm:text-[17px]">
                      Suiting
                    </div>
                    <div className="grid grid-cols-4 gap-3 md:grid-cols-5">
                      {sizeGroups.tailoring.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => toggleDraftField("size", size)}
                          className={fieldButtonClass(draftFilters.size === size)}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </section>
                ) : null}

                {sizeGroups.footwear.length > 0 ? (
                  <section>
                    <div className="mb-3 inline-block border-b border-brand-border pb-2 text-[15px] text-brand-dark-brown sm:text-[17px]">
                      Footwear
                    </div>
                    <div className="grid grid-cols-4 gap-3 md:grid-cols-5">
                      {sizeGroups.footwear.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => toggleDraftField("size", size)}
                          className={fieldButtonClass(draftFilters.size === size)}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </section>
                ) : null}

                {sizeGroups.accessories.length > 0 ? (
                  <section>
                    <div className="mb-3 inline-block border-b border-brand-border pb-2 text-[15px] text-brand-dark-brown sm:text-[17px]">
                      Accessori
                    </div>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                      {sizeGroups.accessories.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => toggleDraftField("size", size)}
                          className={fieldButtonClass(draftFilters.size === size)}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </section>
                ) : null}

                <section>
                  <div className="mb-3 inline-block border-b border-brand-border pb-2 text-[15px] text-brand-dark-brown sm:text-[17px]">
                    Prezzo
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-brand-dust">
                        Da
                      </span>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={facets.minPrice}
                        max={facets.maxPrice}
                        value={draftFilters.minPrice}
                        onChange={(event) =>
                          setDraftFilters((current) => ({
                            ...current,
                            minPrice: event.target.value,
                          }))
                        }
                        placeholder={`${facets.minPrice}`}
                        className="h-[44px] w-full border border-brand-border bg-white px-3 text-[12px] text-brand-dark-brown outline-none sm:h-[52px] sm:px-4 sm:text-[15px]"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-brand-dust">
                        A
                      </span>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={facets.minPrice}
                        max={facets.maxPrice}
                        value={draftFilters.maxPrice}
                        onChange={(event) =>
                          setDraftFilters((current) => ({
                            ...current,
                            maxPrice: event.target.value,
                          }))
                        }
                        placeholder={`${facets.maxPrice}`}
                        className="h-[44px] w-full border border-brand-border bg-white px-3 text-[12px] text-brand-dark-brown outline-none sm:h-[52px] sm:px-4 sm:text-[15px]"
                      />
                    </label>
                  </div>
                </section>
              </div>

              <div className="border-t border-brand-border bg-brand-pale px-4 py-4 sm:px-5 sm:py-5 md:px-6">
                <div className="flex flex-col gap-3 md:flex-row">
                  <button
                    type="button"
                    onClick={() => {
                      resetDraftFilters();
                      clearAppliedFilters();
                    }}
                    className="flex-1 border border-brand-border bg-white px-6 py-4 text-[11px] uppercase tracking-[0.18em] text-brand-dark-brown sm:text-[12px] sm:tracking-[0.22em]"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={applyDraftFilters}
                    className="flex-1 bg-brand-dark-brown px-6 py-4 text-[11px] uppercase tracking-[0.18em] text-brand-cream sm:text-[12px] sm:tracking-[0.22em]"
                  >
                    {isPending ? "Updating..." : "Applica filtri"}
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {selectedFilterLabels.length > 0 ? (
            <div className="flex flex-wrap items-center gap-3">
              {selectedFilterLabels.map((label) => (
                <span
                  key={label}
                  className="border border-[rgba(61,36,16,0.18)] bg-white px-4 py-3 text-[12px] uppercase tracking-[0.18em] text-brand-dark-brown"
                >
                  {label}
                </span>
              ))}
              <button
                type="button"
                onClick={clearAppliedFilters}
                className="text-[12px] uppercase tracking-[0.2em] text-brand-tobacco underline underline-offset-4"
              >
                Reset filters
              </button>
            </div>
          ) : null}
        </div>
      </section>

      {filteredProducts.length > 0 ? (
        <section className="grid grid-cols-2 gap-x-3 gap-y-6 px-4 py-6 sm:grid-cols-2 sm:gap-x-5 sm:gap-y-8 sm:px-8 md:gap-x-6 md:gap-y-10 md:px-10 xl:grid-cols-3 xl:gap-x-8 xl:gap-y-12 xl:px-14 2xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <CatalogProductCard key={product.id} product={product} collectionHandle={handle} />
          ))}
        </section>
      ) : (
        <section className="px-5 py-12 sm:px-8 md:px-10 md:py-16 xl:px-14">
          <div className="max-w-xl border border-[rgba(61,36,16,0.14)] bg-white p-8">
            <div className="text-[12px] uppercase tracking-[0.24em] text-brand-dust">
              Nessun risultato
            </div>
            <h2 className="mt-4 font-libre text-[30px] leading-[1] text-brand-dark-brown sm:text-[40px]">
              Nessun articolo corrisponde ai filtri selezionati.
            </h2>
            <p className="mt-5 text-[16px] leading-[1.8] text-brand-dust">
              Rimuovi un filtro oppure torna al catalogo completo per vedere tutta la selezione.
            </p>
            <button type="button" onClick={clearAppliedFilters} className="btn-dark mt-8 px-8">
              Vedi tutto
            </button>
          </div>
        </section>
      )}

      {handle !== "abbigliamento" ? (
        <div className="border-t border-brand-border px-5 py-6 text-[11px] uppercase tracking-[0.18em] text-brand-dust sm:px-8 md:px-10 md:py-8 md:text-[12px] md:tracking-[0.22em] xl:px-14">
          <Link href="/collections/abbigliamento" className="text-brand-tobacco underline underline-offset-4">
            Torna ad Abbigliamento
          </Link>
        </div>
      ) : null}
    </div>
  );
}
