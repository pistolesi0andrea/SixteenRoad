import { ShopifyProduct } from "@/types/shopify";

export type CatalogSort = "latest" | "price-asc" | "price-desc" | "title-asc";

const APPAREL_SIZE_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL", "UNICA"];

const CATEGORY_FILTERS: Array<{ label: string; aliases: string[] }> = [
  { label: "Pantalone", aliases: ["pantalone", "pantaloni"] },
  { label: "Jeans", aliases: ["jeans", "jean", "denim", "cinque tasche", "5 tasche"] },
  { label: "T-Shirt", aliases: ["t-shirt", "tshirt", "tee", "t-shirt uomo", "t-shirt donna"] },
  { label: "Camicia", aliases: ["camicia", "camicie"] },
  { label: "Maglioni", aliases: ["maglione", "maglioni"] },
  { label: "Capispalla", aliases: ["capospalla", "capispalla", "giacca", "giacche"] },
  { label: "Accessori", aliases: ["accessorio", "accessori"] },
  { label: "Sneakers", aliases: ["sneakers", "scarpa", "scarpe"] },
  { label: "Bermuda", aliases: ["bermuda"] },
];

const COLOR_FILTERS: Array<{ label: string; aliases: string[] }> = [
  { label: "Bianco", aliases: ["bianco", "bianca", "panna", "avorio", "crema", "white", "off-white"] },
  { label: "Nero", aliases: ["nero", "nera", "black"] },
  { label: "Blu", aliases: ["blu", "blue", "navy", "azzurro", "indaco"] },
  { label: "Verde", aliases: ["verde", "salvia", "foresta", "oliva", "olive"] },
  { label: "Marrone", aliases: ["marrone", "bacchetta", "beige", "camel", "cuoio", "tabacco", "tortora", "taupe"] },
  { label: "Rosso", aliases: ["rosso", "rossa", "bordeaux", "bordo"] },
  { label: "Grigio", aliases: ["grigio", "grigia", "grey", "gray", "antracite", "sale e pepe"] },
];

const CATEGORY_ORDER: string[] = CATEGORY_FILTERS.map(({ label }) => label);

export interface CatalogFilterState {
  category: string;
  color: string;
  size: string;
  minPrice: string;
  maxPrice: string;
  sort: CatalogSort;
}

function readSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function normalizeValue(value: string) {
  return value.trim().toLowerCase();
}

function findCategoryFilter(value: string) {
  const normalizedValue = normalizeValue(value);

  return CATEGORY_FILTERS.find(
    ({ label, aliases }) =>
      normalizeValue(label) === normalizedValue || aliases.includes(normalizedValue),
  );
}

export function getCatalogCategoryLabel(productType: string) {
  return findCategoryFilter(productType)?.label ?? productType;
}

function findColorFilter(value: string) {
  const normalizedValue = normalizeValue(value);

  return COLOR_FILTERS.find(
    ({ label, aliases }) =>
      normalizeValue(label) === normalizedValue || aliases.includes(normalizedValue),
  );
}

function getProductCollectionValues(product: ShopifyProduct) {
  return (product.collections ?? []).flatMap((collection) => [
    collection.title,
    collection.handle,
  ]);
}

function getProductSearchText(product: ShopifyProduct) {
  return [
    product.productType,
    product.title,
    product.handle,
    ...(product.tags ?? []),
    ...getProductCollectionValues(product),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function inferCategoryFromCollections(product: ShopifyProduct) {
  const collectionValues = getProductCollectionValues(product).map((value) => normalizeValue(value));

  return CATEGORY_FILTERS.find(({ label, aliases }) => {
    const normalizedLabel = normalizeValue(label);

    return collectionValues.some((value) => {
      if (value === normalizedLabel || value.includes(normalizedLabel)) {
        return true;
      }

      return aliases.some((alias) => value === alias || value.includes(alias));
    });
  })?.label;
}

function inferCategoryFromProduct(product: ShopifyProduct) {
  const searchText = getProductSearchText(product);

  const inferredFilters: Array<{ label: string; keywords: string[] }> = [
    {
      label: "Jeans",
      keywords: [" jeans", "jeans ", "jeans", " jean ", "jean", "denim", "501", "cinque tasche", "5 tasche"],
    },
    { label: "T-Shirt", keywords: ["t-shirt", "tshirt", " tee ", "-tee", " tee"] },
    { label: "Camicia", keywords: ["camicia", "camicie", "shirt"] },
    { label: "Maglioni", keywords: ["maglione", "maglia", "cardigan", "pullover"] },
    { label: "Capispalla", keywords: ["giacca", "giacche", "giubbetto", "giubbetti", "jacket", "blazer", "coat"] },
    { label: "Accessori", keywords: ["cinta", "papillon", "portafoglio", "pochette", "accessorio", "wallet", "belt"] },
    { label: "Sneakers", keywords: ["sneakers", "scarpa", "scarpe", "mocassino", "loafer", "boot", "stivale"] },
    { label: "Bermuda", keywords: ["bermuda", "short"] },
    { label: "Pantalone", keywords: ["pantalone", "pantaloni", "trouser"] },
  ];

  return inferredFilters.find(({ keywords }) => keywords.some((keyword) => searchText.includes(keyword)))
    ?.label;
}

export function getProductCategoryLabel(product: ShopifyProduct) {
  return (
    getCatalogCategoryLabel(product.productType) ||
    inferCategoryFromCollections(product) ||
    inferCategoryFromProduct(product) ||
    ""
  );
}

function matchesCatalogCategory(product: ShopifyProduct, categoryFilter: string) {
  const normalizedProductType = normalizeValue(getProductCategoryLabel(product));
  const normalizedCategoryFilter = normalizeValue(categoryFilter);
  const matchedCategory = findCategoryFilter(categoryFilter);

  if (!matchedCategory) {
    return normalizedProductType === normalizedCategoryFilter;
  }

  return (
    normalizeValue(matchedCategory.label) === normalizedProductType ||
    matchedCategory.aliases.includes(normalizedProductType)
  );
}

function priceOf(product: ShopifyProduct) {
  return Number(product.priceRange.minVariantPrice.amount);
}

export function getProductColors(product: ShopifyProduct) {
  const option = product.options.find(({ name }) => {
    const normalizedName = normalizeValue(name);
    return normalizedName === "color" || normalizedName === "colore";
  });

  const explicitColors =
    option?.values
      .map((value) => findColorFilter(value)?.label ?? value)
      .filter(Boolean) ?? [];
  const inferredColors = COLOR_FILTERS.filter(({ aliases }) =>
    aliases.some((alias) => getProductSearchText(product).includes(alias)),
  ).map(({ label }) => label);

  return [...new Set([...explicitColors, ...inferredColors])];
}

export function getProductSizes(product: ShopifyProduct) {
  const option = product.options.find(({ name }) => {
    const normalizedName = normalizeValue(name);
    return (
      normalizedName === "size" ||
      normalizedName === "taglia" ||
      normalizedName === "misura" ||
      normalizedName === "unica"
    );
  });

  return (
    option?.values.map((value) => {
      const normalizedValue = normalizeValue(value);

      if (["t/u", "tu", "v/unica", "unica", "one size", "taglia unica"].includes(normalizedValue)) {
        return "Unica";
      }

      return value.toUpperCase();
    }) ?? []
  );
}

function compareSizes(left: string, right: string) {
  const normalizedLeft = left.trim().toUpperCase();
  const normalizedRight = right.trim().toUpperCase();
  const apparelLeft = APPAREL_SIZE_ORDER.indexOf(normalizedLeft);
  const apparelRight = APPAREL_SIZE_ORDER.indexOf(normalizedRight);

  if (apparelLeft !== -1 || apparelRight !== -1) {
    if (apparelLeft === -1) {
      return 1;
    }

    if (apparelRight === -1) {
      return -1;
    }

    return apparelLeft - apparelRight;
  }

  const numericLeft = Number.parseInt(normalizedLeft, 10);
  const numericRight = Number.parseInt(normalizedRight, 10);
  const hasNumericLeft = Number.isFinite(numericLeft);
  const hasNumericRight = Number.isFinite(numericRight);

  if (hasNumericLeft && hasNumericRight) {
    return numericLeft - numericRight;
  }

  if (hasNumericLeft) {
    return -1;
  }

  if (hasNumericRight) {
    return 1;
  }

  return left.localeCompare(right, "it");
}

function uniqueSortedSizes(values: string[]) {
  return [...new Set(values.filter(Boolean))].sort(compareSizes);
}

export function normalizeCatalogFilters(
  searchParams: Record<string, string | string[] | undefined>,
): CatalogFilterState {
  const sort = readSingleParam(searchParams.sort) as CatalogSort;

  return {
    category: readSingleParam(searchParams.category),
    color: readSingleParam(searchParams.color),
    size: readSingleParam(searchParams.size),
    minPrice: readSingleParam(searchParams.minPrice),
    maxPrice: readSingleParam(searchParams.maxPrice),
    sort: sort || "latest",
  };
}

export function getCatalogFacets(products: ShopifyProduct[]) {
  const dynamicCategories = [
    ...new Set(products.map((product) => getProductCategoryLabel(product)).filter(Boolean)),
  ].filter((category) => !CATEGORY_ORDER.includes(category));
  const categories = [...CATEGORY_ORDER, ...dynamicCategories.sort((left, right) => left.localeCompare(right, "it"))];
  const colors = [...new Set(products.flatMap((product) => getProductColors(product)).filter(Boolean))].sort();
  const sizes = uniqueSortedSizes(products.flatMap((product) => getProductSizes(product)));
  const prices = products.map((product) => priceOf(product)).filter((price) => !Number.isNaN(price));

  return {
    categories,
    colors,
    sizes,
    minPrice: prices.length ? Math.floor(Math.min(...prices)) : 0,
    maxPrice: prices.length ? Math.ceil(Math.max(...prices)) : 0,
  };
}

export function getCatalogSizeGroups(products: ShopifyProduct[]) {
  const uniqueSizes = uniqueSortedSizes(products.flatMap((product) => getProductSizes(product)));

  const apparel = uniqueSizes.filter((size) => {
    const normalizedSize = size.trim().toUpperCase();
    return ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"].includes(normalizedSize);
  });

  const bottoms = uniqueSortedSizes(
    products
      .filter((product) => ["Pantalone", "Jeans", "Bermuda"].includes(getProductCategoryLabel(product)))
      .flatMap((product) => getProductSizes(product))
      .filter((size) => {
        const numericSize = Number.parseInt(size, 10);
        return Number.isFinite(numericSize) && numericSize <= 38;
      }),
  );

  const tailoring = uniqueSortedSizes(
    products
      .filter((product) => ["Capispalla", "Pantalone"].includes(getProductCategoryLabel(product)))
      .flatMap((product) => getProductSizes(product))
      .filter((size) => {
        const numericSize = Number.parseInt(size, 10);
        return Number.isFinite(numericSize) && numericSize >= 38;
      }),
  );

  const footwear = uniqueSortedSizes(
    products
      .filter((product) => getProductCategoryLabel(product) === "Sneakers")
      .flatMap((product) => getProductSizes(product)),
  );

  const accessories = uniqueSortedSizes(
    uniqueSizes.filter((size) => {
      const normalizedSize = normalizeValue(size);
      return normalizedSize === "unica" || normalizedSize === "one size";
    }),
  );

  return {
    apparel,
    bottoms,
    tailoring,
    footwear,
    accessories,
  };
}

export function applyCatalogFilters(products: ShopifyProduct[], filters: CatalogFilterState) {
  const minPrice = filters.minPrice ? Number(filters.minPrice) : Number.NaN;
  const maxPrice = filters.maxPrice ? Number(filters.maxPrice) : Number.NaN;
  const normalizedCategory = normalizeValue(filters.category);
  const normalizedColor = normalizeValue(filters.color);
  const normalizedSize = normalizeValue(filters.size);

  return products.filter((product) => {
    const productPrice = priceOf(product);
    const productColors = getProductColors(product).map((color) => normalizeValue(color));
    const productSizes = getProductSizes(product).map((size) => normalizeValue(size));

    if (normalizedCategory && !matchesCatalogCategory(product, normalizedCategory)) {
      return false;
    }

    if (normalizedColor && !productColors.includes(normalizedColor)) {
      return false;
    }

    if (normalizedSize && !productSizes.includes(normalizedSize)) {
      return false;
    }

    if (!Number.isNaN(minPrice) && productPrice < minPrice) {
      return false;
    }

    if (!Number.isNaN(maxPrice) && productPrice > maxPrice) {
      return false;
    }

    return true;
  });
}

export function sortCatalogProducts(products: ShopifyProduct[], sort: CatalogSort) {
  const sortedProducts = [...products];

  switch (sort) {
    case "price-asc":
      return sortedProducts.sort((left, right) => priceOf(left) - priceOf(right));
    case "price-desc":
      return sortedProducts.sort((left, right) => priceOf(right) - priceOf(left));
    case "title-asc":
      return sortedProducts.sort((left, right) => left.title.localeCompare(right.title, "it"));
    case "latest":
    default:
      return sortedProducts.sort((left, right) => {
        return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
      });
  }
}
