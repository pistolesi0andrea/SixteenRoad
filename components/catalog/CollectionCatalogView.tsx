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
  return `min-h-[52px] border px-4 py-3 text-[13px] leading-none transition-colors duration-200 sm:min-h-[58px] sm:px-5 sm:py-4 sm:text-[15px] ${
    isActive
      ? "border-brand-dark-brown bg-brand-dark-brown text-brand-cream"
      : "border-brand-border bg-white text-brand-dark-brown hover:bg-brand-parchment"
  }`;
}

function fieldButtonClass(isActive: boolean) {
  return `min-h-[48px] border px-3 py-3 text-[12px] uppercase tracking-[0.06em] transition-colors duration-200 sm:min-h-[52px] sm:px-4 sm:text-[15px] sm:tracking-[0.08em] ${
    isActive
      ? "border-brand-dark-brown bg-brand-dark-brown text-brand-cream"
      : "border-brand-border bg-white text-brand-dark-brown hover:bg-brand-parchment"
  }`;
}

const inlineFieldClass =
  "h-[52px] w-full border border-brand-border bg-white px-4 text-[14px] text-brand-dark-brown outline-none placeholder:text-brand-dust sm:h-[58px] sm:text-[15px]";

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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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

  useEffect(() => {
    if (!isDrawerOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDrawerOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isDrawerOpen]);

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
    setIsDrawerOpen(false);
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
              onClick={() => setIsDrawerOpen(true)}
              className="min-h-[56px] w-full border border-brand-border bg-white px-6 text-[14px] uppercase tracking-[0.06em] text-brand-dark-brown transition-colors duration-200 hover:bg-brand-parchment sm:min-h-[64px] sm:min-w-[190px] sm:w-auto sm:px-8 sm:text-[17px] sm:tracking-[0.08em]"
            >
              Filters {activeFilterCount(currentFilters) > 0 ? `(${activeFilterCount(currentFilters)})` : ""}
            </button>
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              applyDraftFilters();
            }}
            className="border border-brand-border bg-brand-parchment p-4 sm:p-5"
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[1.2fr_1fr_0.7fr_0.7fr_auto_auto]">
              <label className="block">
                <span className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-brand-dust">
                  Categoria
                </span>
                <select
                  value={draftFilters.category}
                  onChange={(event) =>
                    setDraftFilters((current) => ({
                      ...current,
                      category: event.target.value,
                    }))
                  }
                  className={inlineFieldClass}
                >
                  <option value="">Tutte le categorie</option>
                  {facets.categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-brand-dust">
                  Colore
                </span>
                <select
                  value={draftFilters.color}
                  onChange={(event) =>
                    setDraftFilters((current) => ({
                      ...current,
                      color: event.target.value,
                    }))
                  }
                  className={inlineFieldClass}
                >
                  <option value="">Tutti i colori</option>
                  {facets.colors.map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-brand-dust">
                  Prezzo min
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
                  className={inlineFieldClass}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-brand-dust">
                  Prezzo max
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
                  className={inlineFieldClass}
                />
              </label>

              <button type="submit" className="btn-dark min-h-[52px] px-6 text-[13px] sm:min-h-[58px] sm:px-8 xl:self-end">
                {isPending ? "Aggiorno..." : "Filtra"}
              </button>

              <button
                type="button"
                onClick={() => {
                  resetDraftFilters();
                  clearAppliedFilters();
                }}
                className="min-h-[52px] border border-brand-border bg-white px-6 text-[11px] uppercase tracking-[0.18em] text-brand-dark-brown sm:min-h-[58px] sm:text-[12px] sm:tracking-[0.22em] xl:self-end"
              >
                Reset
              </button>
            </div>
          </form>

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

      <div
        className={`fixed inset-0 z-[460] transition-opacity duration-300 ${
          isDrawerOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <button
          type="button"
          aria-label="Chiudi filtri"
          onClick={() => setIsDrawerOpen(false)}
          className="absolute inset-0 bg-[rgba(24,13,7,0.34)]"
        />

        <aside
          className={`absolute right-0 top-0 h-full w-full max-w-[680px] overflow-y-auto bg-brand-cream shadow-[-12px_0_40px_rgba(20,12,7,0.18)] transition-transform duration-300 ${
            isDrawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-brand-border px-5 py-6 sm:px-7 sm:py-8 md:px-9">
            <h2 className="font-josefin text-[36px] leading-none text-brand-dark-brown sm:text-[44px] md:text-[52px]">Filters</h2>
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              className="text-[12px] uppercase tracking-[0.08em] text-brand-dark-brown sm:text-[15px]"
            >
              Close
            </button>
          </div>

          <div className="space-y-8 px-5 py-6 sm:space-y-10 sm:px-7 sm:py-8 md:px-9 md:py-10">
            <section>
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
              <div className="mb-4 inline-block border-b border-brand-border pb-2 text-[18px] text-brand-dark-brown">
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
              <div className="mb-4 inline-block border-b border-brand-border pb-2 text-[18px] text-brand-dark-brown">
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
                <div className="mb-4 inline-block border-b border-brand-border pb-2 text-[18px] text-brand-dark-brown">
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
                <div className="mb-4 inline-block border-b border-brand-border pb-2 text-[18px] text-brand-dark-brown">
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
                <div className="mb-4 inline-block border-b border-brand-border pb-2 text-[18px] text-brand-dark-brown">
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
                <div className="mb-4 inline-block border-b border-brand-border pb-2 text-[18px] text-brand-dark-brown">
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
                <div className="mb-4 inline-block border-b border-brand-border pb-2 text-[18px] text-brand-dark-brown">
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
              <div className="mb-4 inline-block border-b border-brand-border pb-2 text-[18px] text-brand-dark-brown">
                Price
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
                    className="h-[52px] w-full border border-brand-border bg-white px-4 text-[14px] text-brand-dark-brown outline-none sm:h-[58px] sm:text-[16px]"
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
                    className="h-[52px] w-full border border-brand-border bg-white px-4 text-[14px] text-brand-dark-brown outline-none sm:h-[58px] sm:text-[16px]"
                  />
                </label>
              </div>
            </section>
          </div>

          <div className="sticky bottom-0 border-t border-brand-border bg-brand-pale px-5 py-4 sm:px-7 sm:py-5 md:px-9">
            <div className="flex flex-col gap-3 md:flex-row">
              <button
                type="button"
                onClick={resetDraftFilters}
                className="flex-1 border border-brand-border bg-white px-6 py-4 text-[11px] uppercase tracking-[0.18em] text-brand-dark-brown sm:text-[12px] sm:tracking-[0.22em]"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={applyDraftFilters}
                className="flex-1 bg-brand-dark-brown px-6 py-4 text-[11px] uppercase tracking-[0.18em] text-brand-cream sm:text-[12px] sm:tracking-[0.22em]"
              >
                {isPending ? "Updating..." : "Apply filters"}
              </button>
            </div>
          </div>
        </aside>
      </div>

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
