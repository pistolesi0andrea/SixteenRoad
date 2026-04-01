import { mockProducts } from "@/lib/mockCatalog";
import { isGiftCardProduct } from "@/lib/product-helpers";
import {
  ShopifyAttribute,
  ShopifyCart,
  ShopifyCartDiscountAllocation,
  ShopifyCartDiscountCode,
  ShopifyCartInputLine,
  ShopifyCheckoutDeliveryMode,
  ShopifyCheckoutInput,
  ShopifyCollection,
  ShopifyImage,
  ShopifyMoney,
  ShopifyProduct,
  ShopifyProductCollectionRef,
  ShopifyProductDetails,
  ShopifyProductOption,
  ShopifyProductVariant,
  ShopifySelectedOption,
  ShopifyStoreAvailability,
  ShopifyStorefrontAvailability,
} from "@/types/shopify";

const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION ?? "2025-10";
const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const SHOPIFY_STOREFRONT_ID = process.env.SHOPIFY_STOREFRONT_ID ?? null;
const SHOPIFY_GIFT_CARD_PRODUCT_HANDLE = process.env.SHOPIFY_GIFT_CARD_PRODUCT_HANDLE;
const SHOPIFY_INCLUDE_INVENTORY_QUANTITY =
  process.env.SHOPIFY_INCLUDE_INVENTORY_QUANTITY === "true";
const SHOPIFY_STOREFRONT_REVALIDATE_SECONDS = Number.isFinite(
  Number(process.env.SHOPIFY_STOREFRONT_REVALIDATE_SECONDS),
)
  ? Math.max(0, Number(process.env.SHOPIFY_STOREFRONT_REVALIDATE_SECONDS))
  : 10;
const SHOPIFY_CONNECTION_PAGE_SIZE = 250;
const SHOPIFY_MAX_CONNECTION_PAGES = 20;

function isShopifyCheckoutPath(pathname: string): boolean {
  return pathname.startsWith("/cart/") || pathname.startsWith("/checkouts/");
}

function normalizeCheckoutUrl(checkoutUrl: string | null | undefined): string {
  if (!checkoutUrl) {
    return "";
  }

  if (!SHOPIFY_STORE_DOMAIN) {
    return checkoutUrl;
  }

  try {
    const parsed = new URL(checkoutUrl);

    if (!isShopifyCheckoutPath(parsed.pathname)) {
      return checkoutUrl;
    }

    if (parsed.hostname === SHOPIFY_STORE_DOMAIN) {
      return parsed.toString();
    }

    // After pointing the storefront domain to Vercel, Shopify can still return
    // checkout URLs on the old primary domain. Force the checkout host back to
    // the Shopify store domain so payments stay on Shopify and do not hit Next.js.
    parsed.protocol = "https:";
    parsed.hostname = SHOPIFY_STORE_DOMAIN;
    parsed.port = "";

    return parsed.toString();
  } catch {
    return checkoutUrl;
  }
}

function getStorefrontAuthHeaders(): Record<string, string> {
  if (!SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
    return {};
  }

  // Headless private tokens use a different auth header than public Storefront tokens.
  if (SHOPIFY_STOREFRONT_ACCESS_TOKEN.startsWith("shpat_")) {
    return {
      "Shopify-Storefront-Private-Token": SHOPIFY_STOREFRONT_ACCESS_TOKEN,
    };
  }

  return {
    "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_ACCESS_TOKEN,
  };
}

const PRODUCT_CARD_FRAGMENT = `
  id
  handle
  title
  createdAt
  description
  descriptionHtml
  availableForSale
  vendor
  productType
  tags
  collections(first: 20) {
    edges {
      node {
        handle
        title
      }
    }
  }
  priceRange {
    minVariantPrice {
      amount
      currencyCode
    }
    maxVariantPrice {
      amount
      currencyCode
    }
  }
  featuredImage {
    url
    altText
  }
  images(first: 8) {
    edges {
      node {
        url
        altText
      }
    }
  }
  variants(first: 25) {
    edges {
      node {
        id
        title
        availableForSale
        currentlyNotInStock
        ${SHOPIFY_INCLUDE_INVENTORY_QUANTITY ? "quantityAvailable" : ""}
        price {
          amount
          currencyCode
        }
        compareAtPrice {
          amount
          currencyCode
        }
        selectedOptions {
          name
          value
        }
        storeAvailability(first: 10) {
          edges {
            node {
              available
              pickUpTime
              ${SHOPIFY_INCLUDE_INVENTORY_QUANTITY ? "quantityAvailable" : ""}
              location {
                id
                name
              }
            }
          }
        }
      }
    }
  }
  options {
    name
    values
  }
  composition: metafield(namespace: "custom", key: "composition") {
    type
    value
  }
  fitNotes: metafield(namespace: "custom", key: "fit_notes") {
    type
    value
  }
  sizeGuide: metafield(namespace: "custom", key: "size_guide") {
    type
    value
  }
  conditionMetafield: metafield(namespace: "custom", key: "condition") {
    type
    value
  }
  measurements: metafield(namespace: "custom", key: "measurements") {
    type
    value
  }
`;

const CART_FRAGMENT = `
  id
  checkoutUrl
  totalQuantity
  cost {
    subtotalAmount {
      amount
      currencyCode
    }
    totalAmount {
      amount
      currencyCode
    }
  }
  discountCodes {
    code
    applicable
  }
  discountAllocations {
    __typename
    discountedAmount {
      amount
      currencyCode
    }
    targetType
    ... on CartCodeDiscountAllocation {
      code
    }
    ... on CartAutomaticDiscountAllocation {
      title
    }
    ... on CartCustomDiscountAllocation {
      title
    }
  }
  lines(first: 100) {
    edges {
      node {
        id
        quantity
        attributes {
          key
          value
        }
        merchandise {
          ... on ProductVariant {
            id
            title
            availableForSale
            price {
              amount
              currencyCode
            }
            selectedOptions {
              name
              value
            }
            product {
              id
              handle
              title
              vendor
              productType
              featuredImage {
                url
                altText
              }
              images(first: 1) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
            }
            storeAvailability(first: 10) {
              edges {
                node {
                  available
                  pickUpTime
                  ${SHOPIFY_INCLUDE_INVENTORY_QUANTITY ? "quantityAvailable" : ""}
                  location {
                    id
                    name
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

const COLLECTION_CONTENT: Record<
  string,
  { title: string; description: string; descriptionHtml: string; productHandles?: string[] }
> = {
  abbigliamento: {
    title: "Abbigliamento",
    description:
      "Tutti gli articoli dello store, con filtri per categoria, colore, prezzo e ordinamento.",
    descriptionHtml:
      "<p>Tutti gli articoli dello store, con filtri per categoria, colore, prezzo e ordinamento.</p>",
  },
  "nuovi-arrivi": {
    title: "Nuovi Arrivi",
    description:
      "Gli ultimi pezzi entrati in collezione, scelti per taglio, materia e carattere.",
    descriptionHtml:
      "<p>Gli ultimi pezzi entrati in collezione, scelti per taglio, materia e carattere.</p>",
  },
  saldi: {
    title: "Saldi",
    description: "Una selezione limitata di capi speciali a condizioni vantaggiose.",
    descriptionHtml:
      "<p>Una selezione limitata di capi speciali a condizioni vantaggiose.</p>",
  },
};

interface ShopifyGraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

interface ShopifyUserError {
  field?: string[] | null;
  message: string;
}

interface ShopifyMutationResult {
  cart: unknown | null;
  userErrors?: ShopifyUserError[];
}

interface ShopifyFetchOptions {
  cache?: RequestCache;
  revalidate?: number | false;
}

interface ShopifyPageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

interface ShopifyProductsPage {
  products: {
    nodes: ShopifyProduct[];
    pageInfo: ShopifyPageInfo;
  };
}

interface ShopifyCollectionPage {
  collection: {
    id: string;
    handle: string;
    title: string;
    description: string;
    descriptionHtml: string;
    products: {
      nodes: ShopifyProduct[];
      pageInfo: ShopifyPageInfo;
    };
  } | null;
}

export interface ShopifyAnalyticsConfig {
  shopId: string;
  acceptedLanguage: string;
  currency: string;
  storefrontId: string | null;
}

interface ShopifyAnalyticsQuery {
  shop: {
    id: string;
  };
  localization: {
    language: {
      isoCode: string;
    };
    country: {
      currency: {
        isoCode: string;
      };
    };
  };
}

function hasShopifyConfig() {
  return Boolean(SHOPIFY_STORE_DOMAIN && SHOPIFY_STOREFRONT_ACCESS_TOKEN);
}

export function getStorefrontAvailability(): ShopifyStorefrontAvailability {
  return {
    enabled: hasShopifyConfig(),
    apiVersion: SHOPIFY_API_VERSION,
    storeDomain: SHOPIFY_STORE_DOMAIN ?? null,
  };
}

export async function getShopAnalyticsConfig(): Promise<ShopifyAnalyticsConfig | null> {
  const data = await shopifyFetch<ShopifyAnalyticsQuery>(
    `
      query GetShopAnalyticsConfig {
        shop {
          id
        }
        localization {
          language {
            isoCode
          }
          country {
            currency {
              isoCode
            }
          }
        }
      }
    `,
    undefined,
    { revalidate: 300 },
  );

  if (!data?.shop?.id) {
    return null;
  }

  return {
    shopId: data.shop.id,
    acceptedLanguage: data.localization?.language?.isoCode ?? "IT",
    currency: data.localization?.country?.currency?.isoCode ?? "EUR",
    storefrontId: SHOPIFY_STOREFRONT_ID,
  };
}

function shopifyEndpoint() {
  return `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
}

function normalizeMoney(money?: Partial<ShopifyMoney> | null): ShopifyMoney {
  return {
    amount: money?.amount ?? "0.00",
    currencyCode: money?.currencyCode ?? "EUR",
  };
}

function normalizeMoneyOrNull(money?: Partial<ShopifyMoney> | null): ShopifyMoney | null {
  if (!money?.amount || Number.isNaN(Number(money.amount))) {
    return null;
  }

  return normalizeMoney(money);
}

function normalizeImage(image?: Partial<ShopifyImage> | null): ShopifyImage | null {
  if (!image?.url) {
    return null;
  }

  return {
    url: image.url,
    altText: image.altText ?? null,
  };
}

function normalizeSelectedOption(
  option: Partial<ShopifySelectedOption> | null | undefined,
): ShopifySelectedOption {
  return {
    name: option?.name ?? "",
    value: option?.value ?? "",
  };
}

function normalizeOption(option: Partial<ShopifyProductOption> | null | undefined): ShopifyProductOption {
  return {
    name: option?.name ?? "",
    values: option?.values ?? [],
  };
}

function normalizeCollectionRef(
  collection: Partial<ShopifyProductCollectionRef> | null | undefined,
): ShopifyProductCollectionRef | null {
  if (!collection?.handle) {
    return null;
  }

  return {
    handle: collection.handle,
    title: collection.title ?? "",
  };
}

function normalizeAttribute(
  attribute: Partial<ShopifyAttribute> | null | undefined,
): ShopifyAttribute | null {
  if (!attribute?.key) {
    return null;
  }

  return {
    key: attribute.key,
    value: attribute.value ?? "",
  };
}

function normalizeAttributeList(source: unknown): ShopifyAttribute[] {
  if (!Array.isArray(source)) {
    return [];
  }

  return source
    .map((attribute) => normalizeAttribute(attribute as Partial<ShopifyAttribute>))
    .filter((attribute): attribute is ShopifyAttribute => Boolean(attribute));
}

function normalizeCartDiscountCode(
  discountCode: Partial<ShopifyCartDiscountCode> | null | undefined,
): ShopifyCartDiscountCode | null {
  if (!discountCode?.code) {
    return null;
  }

  return {
    code: discountCode.code,
    applicable: discountCode.applicable ?? false,
  };
}

function normalizeCartDiscountCodeList(source: unknown): ShopifyCartDiscountCode[] {
  if (!Array.isArray(source)) {
    return [];
  }

  return source
    .map((discountCode) =>
      normalizeCartDiscountCode(discountCode as Partial<ShopifyCartDiscountCode>),
    )
    .filter((discountCode): discountCode is ShopifyCartDiscountCode => Boolean(discountCode));
}

function normalizeCartDiscountAllocation(
  discountAllocation:
    | (Partial<ShopifyCartDiscountAllocation> & { __typename?: string | null })
    | null
    | undefined,
): ShopifyCartDiscountAllocation | null {
  if (!discountAllocation?.discountedAmount) {
    return null;
  }

  return {
    type: discountAllocation.__typename ?? discountAllocation.type ?? "CartDiscountAllocation",
    code: discountAllocation.code,
    title: discountAllocation.title,
    targetType: discountAllocation.targetType,
    discountedAmount: normalizeMoney(discountAllocation.discountedAmount),
  };
}

function normalizeCartDiscountAllocationList(source: unknown): ShopifyCartDiscountAllocation[] {
  if (!Array.isArray(source)) {
    return [];
  }

  return source
    .map((discountAllocation) =>
      normalizeCartDiscountAllocation(
        discountAllocation as Partial<ShopifyCartDiscountAllocation> & {
          __typename?: string | null;
        },
      ),
    )
    .filter(
      (discountAllocation): discountAllocation is ShopifyCartDiscountAllocation =>
        Boolean(discountAllocation),
    );
}

function normalizeStoreAvailability(
  availability: {
    available?: boolean;
    pickUpTime?: string | null;
    quantityAvailable?: number | null;
    location?: {
      id?: string;
      name?: string;
    } | null;
  } | null | undefined,
): ShopifyStoreAvailability | null {
  if (!availability?.location?.id) {
    return null;
  }

  return {
    available: availability.available ?? false,
    pickUpTime: availability.pickUpTime ?? null,
    quantityAvailable: availability.quantityAvailable ?? null,
    location: {
      id: availability.location.id,
      name: availability.location.name ?? "",
    },
  };
}

function normalizeStoreAvailabilityList(source: unknown): ShopifyStoreAvailability[] {
  if (Array.isArray(source)) {
    return source
      .map((availability) =>
        normalizeStoreAvailability(availability as Parameters<typeof normalizeStoreAvailability>[0]),
      )
      .filter((availability): availability is ShopifyStoreAvailability => Boolean(availability));
  }

  const edges = (source as { edges?: Array<{ node?: unknown }> } | null | undefined)?.edges ?? [];

  return edges
    .map((edge) =>
      normalizeStoreAvailability(edge?.node as Parameters<typeof normalizeStoreAvailability>[0]),
    )
    .filter((availability): availability is ShopifyStoreAvailability => Boolean(availability));
}

function parseStructuredContent(value?: string | null): string[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;

    if (Array.isArray(parsed)) {
      return parsed
        .map((entry) => String(entry).trim())
        .filter(Boolean);
    }
  } catch {
    return value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  }

  return [];
}

function parseTextValue(value?: string | null): string | undefined {
  return value?.trim() ? value.trim() : undefined;
}

function preferStructuredContent(
  primaryValue?: string | null,
  fallbackValue?: string[],
): string[] | undefined {
  const parsedPrimaryValue = parseStructuredContent(primaryValue);

  if (parsedPrimaryValue.length > 0) {
    return parsedPrimaryValue;
  }

  if (fallbackValue?.length) {
    return fallbackValue;
  }

  return undefined;
}

function normalizeVariant(
  variant: Partial<ShopifyProductVariant> | null | undefined,
): ShopifyProductVariant {
  return {
    id: variant?.id ?? "",
    title: variant?.title ?? "",
    availableForSale: variant?.availableForSale ?? false,
    currentlyNotInStock: variant?.currentlyNotInStock ?? false,
    quantityAvailable: variant?.quantityAvailable ?? null,
    price: normalizeMoney(variant?.price),
    compareAtPrice: normalizeMoneyOrNull(variant?.compareAtPrice),
    selectedOptions:
      variant?.selectedOptions?.map((option) => normalizeSelectedOption(option)) ?? [],
    storeAvailability: normalizeStoreAvailabilityList(variant?.storeAvailability),
  };
}

function normalizeProductDetails(product: Record<string, unknown>): ShopifyProductDetails | undefined {
  const fallbackDetails = product.details as ShopifyProductDetails | undefined;
  const details: ShopifyProductDetails = {
    composition:
      parseTextValue((product.composition as { value?: string } | null | undefined)?.value) ??
      fallbackDetails?.composition,
    fitNotes:
      parseTextValue((product.fitNotes as { value?: string } | null | undefined)?.value) ??
      fallbackDetails?.fitNotes,
    sizeGuide: preferStructuredContent(
      (product.sizeGuide as { value?: string } | null | undefined)?.value,
      fallbackDetails?.sizeGuide,
    ),
    condition:
      parseTextValue((product.conditionMetafield as { value?: string } | null | undefined)?.value) ??
      fallbackDetails?.condition,
    measurements: preferStructuredContent(
      (product.measurements as { value?: string } | null | undefined)?.value,
      fallbackDetails?.measurements,
    ),
  };

  if (
    !details.composition &&
    !details.fitNotes &&
    !details.condition &&
    (!details.sizeGuide || details.sizeGuide.length === 0) &&
    (!details.measurements || details.measurements.length === 0)
  ) {
    return undefined;
  }

  return details;
}

function normalizeProduct(product: Partial<ShopifyProduct> | null | undefined): ShopifyProduct {
  const normalizedProduct = (product ?? {}) as Record<string, unknown>;
  const normalizedImages =
    product?.images?.edges
      ?.map((edge) => normalizeImage(edge.node))
      .filter((image): image is ShopifyImage => Boolean(image))
      .map((image) => ({ node: image })) ?? [];
  const normalizedFeaturedImage = normalizeImage(product?.featuredImage) ?? normalizedImages[0]?.node ?? null;
  const rawCollections = Array.isArray(product?.collections)
    ? product.collections
    : (
        normalizedProduct.collections as
          | { edges?: Array<{ node?: Partial<ShopifyProductCollectionRef> | null }> }
          | null
          | undefined
      )?.edges?.map((edge) => edge?.node ?? null) ?? [];
  const normalizedCollections = rawCollections
    .map((collection) => normalizeCollectionRef(collection))
    .filter((collection): collection is ShopifyProductCollectionRef => Boolean(collection));

  return {
    id: product?.id ?? "",
    handle: product?.handle ?? "",
    title: product?.title ?? "",
    createdAt: product?.createdAt ?? "",
    description: product?.description ?? "",
    descriptionHtml: product?.descriptionHtml ?? "",
    availableForSale: product?.availableForSale ?? false,
    vendor: product?.vendor ?? "",
    productType: product?.productType ?? "",
    tags: product?.tags ?? [],
    priceRange: {
      minVariantPrice: normalizeMoney(product?.priceRange?.minVariantPrice),
      maxVariantPrice: normalizeMoney(product?.priceRange?.maxVariantPrice),
    },
    featuredImage: normalizedFeaturedImage,
    images: {
      edges: normalizedImages,
    },
    variants: {
      edges:
        product?.variants?.edges
          ?.map((edge) => normalizeVariant(edge.node))
          .filter((variant) => variant.id)
          .map((variant) => ({ node: variant })) ?? [],
    },
    options: product?.options?.map((option) => normalizeOption(option)) ?? [],
    collections: normalizedCollections,
    details: normalizeProductDetails(normalizedProduct),
  };
}

function getSelectedOptionValue(
  selectedOptions: ShopifySelectedOption[],
  optionNames: string[],
): string | null {
  const normalizedOptionNames = optionNames.map((optionName) => optionName.trim().toLowerCase());

  return (
    selectedOptions.find((option) =>
      normalizedOptionNames.includes(option.name.trim().toLowerCase()),
    )?.value ?? null
  );
}

function normalizeCartLine(
  line:
    | ShopifyCart["lines"][number]
    | {
        id?: string;
        quantity?: number;
        merchandise?: {
          id?: string;
          title?: string;
          price?: ShopifyMoney;
          selectedOptions?: ShopifySelectedOption[];
          storeAvailability?: unknown;
          product?: {
            id?: string;
            handle?: string;
            title?: string;
            vendor?: string;
            productType?: string;
            featuredImage?: ShopifyImage | null;
            images?: {
              edges?: Array<{
                node?: ShopifyImage | null;
              }>;
            } | null;
          } | null;
        } | null;
        attributes?: ShopifyAttribute[];
      },
): ShopifyCart["lines"][number] {
  if ("merchandiseId" in line) {
    return {
      id: line.id,
      quantity: line.quantity,
      merchandiseId: line.merchandiseId,
      productId: line.productId,
      handle: line.handle,
      title: line.title,
      vendor: line.vendor,
      productType: line.productType,
      color: line.color,
      size: line.size,
      featuredImage: normalizeImage(line.featuredImage),
      price: normalizeMoney(line.price),
      pickupLocations: normalizeStoreAvailabilityList(line.pickupLocations),
      attributes: normalizeAttributeList(line.attributes),
    };
  }

  const merchandise = line.merchandise;
  const product = merchandise?.product;
  const fallbackFeaturedImage =
    normalizeImage(product?.featuredImage) ??
    normalizeImage(product?.images?.edges?.[0]?.node ?? null);

  return {
    id: line.id ?? merchandise?.id ?? product?.id ?? "",
    quantity: line.quantity ?? 0,
    merchandiseId: merchandise?.id ?? "",
    productId: product?.id ?? "",
    handle: product?.handle ?? "",
    title: product?.title ?? merchandise?.title ?? "",
    vendor: product?.vendor ?? "",
    productType: product?.productType ?? "",
    color: getSelectedOptionValue(merchandise?.selectedOptions ?? [], ["color", "colore"]),
    size: getSelectedOptionValue(merchandise?.selectedOptions ?? [], ["size", "taglia"]),
    featuredImage: fallbackFeaturedImage,
    price: normalizeMoney(merchandise?.price),
    pickupLocations: normalizeStoreAvailabilityList(merchandise?.storeAvailability),
    attributes: normalizeAttributeList(line.attributes),
  };
}

function normalizeCart(
  cart:
    | ShopifyCart
    | {
        id?: string;
        checkoutUrl?: string;
        totalQuantity?: number;
        cost?: {
          subtotalAmount?: ShopifyMoney;
          totalAmount?: ShopifyMoney;
        } | null;
        discountCodes?: ShopifyCartDiscountCode[] | null;
        discountAllocations?: ShopifyCartDiscountAllocation[] | null;
        lines?:
          | ShopifyCart["lines"]
          | {
              edges?: Array<{
                node?: {
                  id?: string;
                  quantity?: number;
                  merchandise?: {
                    id?: string;
                    title?: string;
                    price?: ShopifyMoney;
                    selectedOptions?: ShopifySelectedOption[];
                    storeAvailability?: unknown;
                    product?: {
                      id?: string;
                      handle?: string;
                      title?: string;
                      vendor?: string;
                      productType?: string;
                      featuredImage?: ShopifyImage | null;
                    } | null;
                  } | null;
                  attributes?: ShopifyAttribute[];
                };
              }>;
            }
          | null;
      },
): ShopifyCart {
  const normalizedLines = Array.isArray(cart.lines)
    ? cart.lines.map((line) => normalizeCartLine(line))
    : cart.lines?.edges?.map((edge) => normalizeCartLine(edge.node ?? {})) ?? [];

  return {
    id: cart.id ?? "",
    checkoutUrl: normalizeCheckoutUrl(cart.checkoutUrl),
    totalQuantity: cart.totalQuantity ?? 0,
    cost: {
      subtotalAmount: normalizeMoney(cart.cost?.subtotalAmount),
      totalAmount: normalizeMoney(cart.cost?.totalAmount),
    },
    discountCodes: normalizeCartDiscountCodeList(cart.discountCodes),
    discountAllocations: normalizeCartDiscountAllocationList(cart.discountAllocations),
    lines: normalizedLines.filter((line) => line.id),
  };
}

async function shopifyFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
  options: ShopifyFetchOptions = {},
): Promise<T | null> {
  if (!hasShopifyConfig()) {
    return null;
  }

  const requestInit: RequestInit & { next?: { revalidate: number } } = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getStorefrontAuthHeaders(),
    },
    body: JSON.stringify({ query, variables }),
  };

  if (options.cache) {
    requestInit.cache = options.cache;
  } else if (options.revalidate !== false) {
    requestInit.next = {
      revalidate: options.revalidate ?? SHOPIFY_STOREFRONT_REVALIDATE_SECONDS,
    };
  }

  const response = await fetch(shopifyEndpoint(), requestInit);

  if (!response.ok) {
    throw new Error(`Shopify Storefront API error: ${response.status}`);
  }

  const payload = (await response.json()) as ShopifyGraphQLResponse<T>;

  if (payload.errors?.length) {
    const messages = payload.errors.map((error) => error.message).join(", ");
    throw new Error(`Shopify GraphQL error: ${messages}`);
  }

  return payload.data ?? null;
}

function assertMutationSucceeded(result: ShopifyMutationResult | undefined) {
  if (!result) {
    throw new Error("Shopify mutation failed without a response payload.");
  }

  if (result.userErrors?.length) {
    const message = result.userErrors.map((error) => error.message).join(", ");
    throw new Error(message);
  }
}

function getMockCollection(handle: string): ShopifyCollection | null {
  const collectionContent = COLLECTION_CONTENT[handle];

  if (!collectionContent) {
    return null;
  }

  const products = collectionContent.productHandles?.length
    ? mockProducts.filter((product) => collectionContent.productHandles?.includes(product.handle))
    : mockProducts.filter((product) => product.tags.includes(handle));

  return {
    id: `collection_${handle}`,
    handle,
    title: collectionContent.title,
    description: collectionContent.description,
    descriptionHtml: collectionContent.descriptionHtml,
    products,
  };
}

function normalizePhoneForShopify(phone?: string) {
  if (!phone) {
    return undefined;
  }

  const compactPhone = phone.replace(/\s+/g, "");

  if (compactPhone.startsWith("+")) {
    return compactPhone;
  }

  if (compactPhone.startsWith("39")) {
    return `+${compactPhone}`;
  }

  return `+39${compactPhone.replace(/^0+/, "")}`;
}

function normalizeDeliveryMethod(
  deliveryMode: ShopifyCheckoutDeliveryMode,
): Array<"SHIPPING" | "PICK_UP"> {
  return deliveryMode === "pickup" ? ["PICK_UP"] : ["SHIPPING"];
}

export async function getProducts({
  first = 24,
  all = false,
}: { first?: number; all?: boolean } = {}): Promise<ShopifyProduct[]> {
  if (!all) {
    const data = await shopifyFetch<{
      products: {
        nodes: ShopifyProduct[];
      };
    }>(
      `
        query GetProducts($first: Int!) {
          products(first: $first, sortKey: CREATED_AT, reverse: true) {
            nodes {
              ${PRODUCT_CARD_FRAGMENT}
            }
          }
        }
      `,
      { first },
    );

    if (!data) {
      return mockProducts.slice(0, first);
    }

    return data.products.nodes.map((product) => normalizeProduct(product));
  }

  const products: ShopifyProduct[] = [];
  let cursor: string | null = null;

  for (let pageIndex = 0; pageIndex < SHOPIFY_MAX_CONNECTION_PAGES; pageIndex += 1) {
    const data: ShopifyProductsPage | null = await shopifyFetch<ShopifyProductsPage>(
      `
        query GetAllProducts($first: Int!, $after: String) {
          products(first: $first, after: $after, sortKey: CREATED_AT, reverse: true) {
            nodes {
              ${PRODUCT_CARD_FRAGMENT}
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      `,
      {
        first: SHOPIFY_CONNECTION_PAGE_SIZE,
        after: cursor,
      },
    );

    if (!data) {
      return mockProducts;
    }

    products.push(...data.products.nodes.map((product) => normalizeProduct(product)));

    if (!data.products.pageInfo.hasNextPage || !data.products.pageInfo.endCursor) {
      break;
    }

    cursor = data.products.pageInfo.endCursor;
  }

  return products;
}

export async function getProduct(handle: string): Promise<ShopifyProduct | null> {
  const data = await shopifyFetch<{
    product: ShopifyProduct | null;
  }>(
    `
      query GetProduct($handle: String!) {
        product(handle: $handle) {
          ${PRODUCT_CARD_FRAGMENT}
        }
      }
    `,
    { handle },
  );

  if (!data) {
    return mockProducts.find((product) => product.handle === handle) ?? null;
  }

  return data.product ? normalizeProduct(data.product) : null;
}

export async function getGiftCardProduct(): Promise<ShopifyProduct | null> {
  if (SHOPIFY_GIFT_CARD_PRODUCT_HANDLE) {
    return getProduct(SHOPIFY_GIFT_CARD_PRODUCT_HANDLE);
  }

  const products = await getProducts({ all: true });
  return products.find((product) => isGiftCardProduct(product)) ?? null;
}

export async function getCollection(handle: string): Promise<ShopifyCollection | null> {
  if (!hasShopifyConfig()) {
    return getMockCollection(handle);
  }

  let collection:
    | {
        id: string;
        handle: string;
        title: string;
        description: string;
        descriptionHtml: string;
        products: ShopifyProduct[];
      }
    | null = null;
  let cursor: string | null = null;

  for (let pageIndex = 0; pageIndex < SHOPIFY_MAX_CONNECTION_PAGES; pageIndex += 1) {
    const data: ShopifyCollectionPage | null = await shopifyFetch<ShopifyCollectionPage>(
      `
        query GetCollection($handle: String!, $first: Int!, $after: String) {
          collection(handle: $handle) {
            id
            handle
            title
            description
            descriptionHtml
            products(first: $first, after: $after, sortKey: COLLECTION_DEFAULT) {
              nodes {
                ${PRODUCT_CARD_FRAGMENT}
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        }
      `,
      {
        handle,
        first: SHOPIFY_CONNECTION_PAGE_SIZE,
        after: cursor,
      },
    );

    if (!data?.collection) {
      return pageIndex === 0 ? null : collection;
    }

    if (!collection) {
      collection = {
        id: data.collection.id,
        handle: data.collection.handle,
        title: data.collection.title,
        description: data.collection.description,
        descriptionHtml: data.collection.descriptionHtml,
        products: [],
      };
    }

    collection.products.push(
      ...data.collection.products.nodes.map((product) => normalizeProduct(product)),
    );

    if (
      !data.collection.products.pageInfo.hasNextPage ||
      !data.collection.products.pageInfo.endCursor
    ) {
      break;
    }

    cursor = data.collection.products.pageInfo.endCursor;
  }

  return collection;
}

export async function getCollectionProducts(handle: string): Promise<ShopifyProduct[]> {
  const collection = await getCollection(handle);
  return collection?.products ?? [];
}

export async function getCart(cartId: string): Promise<ShopifyCart | null> {
  if (!cartId) {
    return null;
  }

  const data = await shopifyFetch<{
    cart: ShopifyCart | null;
  }>(
    `
      query GetCart($cartId: ID!) {
        cart(id: $cartId) {
          ${CART_FRAGMENT}
        }
      }
    `,
    { cartId },
    { cache: "no-store", revalidate: false },
  );

  if (!data?.cart) {
    return null;
  }

  return normalizeCart(data.cart);
}

export async function createCart(lines: ShopifyCartInputLine[] = []): Promise<ShopifyCart | null> {
  const data = await shopifyFetch<{
    cartCreate: ShopifyMutationResult;
  }>(
    `
      mutation CreateCart($input: CartInput!) {
        cartCreate(input: $input) {
          cart {
            ${CART_FRAGMENT}
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    { input: lines.length > 0 ? { lines } : {} },
    { cache: "no-store", revalidate: false },
  );

  if (!data) {
    return null;
  }

  assertMutationSucceeded(data.cartCreate);
  return data.cartCreate.cart ? normalizeCart(data.cartCreate.cart as ShopifyCart) : null;
}

export async function addCartLines(
  cartId: string,
  lines: ShopifyCartInputLine[],
): Promise<ShopifyCart | null> {
  const data = await shopifyFetch<{
    cartLinesAdd: ShopifyMutationResult;
  }>(
    `
      mutation AddCartLines($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) {
          cart {
            ${CART_FRAGMENT}
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    { cartId, lines },
    { cache: "no-store", revalidate: false },
  );

  if (!data) {
    return null;
  }

  assertMutationSucceeded(data.cartLinesAdd);
  return data.cartLinesAdd.cart ? normalizeCart(data.cartLinesAdd.cart as ShopifyCart) : null;
}

export async function updateCartLines(
  cartId: string,
  lines: Array<{ id: string; quantity: number }>,
): Promise<ShopifyCart | null> {
  const data = await shopifyFetch<{
    cartLinesUpdate: ShopifyMutationResult;
  }>(
    `
      mutation UpdateCartLines($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
        cartLinesUpdate(cartId: $cartId, lines: $lines) {
          cart {
            ${CART_FRAGMENT}
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    { cartId, lines },
    { cache: "no-store", revalidate: false },
  );

  if (!data) {
    return null;
  }

  assertMutationSucceeded(data.cartLinesUpdate);
  return data.cartLinesUpdate.cart ? normalizeCart(data.cartLinesUpdate.cart as ShopifyCart) : null;
}

export async function removeCartLines(
  cartId: string,
  lineIds: string[],
): Promise<ShopifyCart | null> {
  const data = await shopifyFetch<{
    cartLinesRemove: ShopifyMutationResult;
  }>(
    `
      mutation RemoveCartLines($cartId: ID!, $lineIds: [ID!]!) {
        cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
          cart {
            ${CART_FRAGMENT}
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    { cartId, lineIds },
    { cache: "no-store", revalidate: false },
  );

  if (!data) {
    return null;
  }

  assertMutationSucceeded(data.cartLinesRemove);
  return data.cartLinesRemove.cart ? normalizeCart(data.cartLinesRemove.cart as ShopifyCart) : null;
}

export async function updateCartDiscountCodes(
  cartId: string,
  discountCodes: string[],
): Promise<ShopifyCart | null> {
  const data = await shopifyFetch<{
    cartDiscountCodesUpdate: ShopifyMutationResult;
  }>(
    `
      mutation UpdateCartDiscountCodes($cartId: ID!, $discountCodes: [String!]) {
        cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
          cart {
            ${CART_FRAGMENT}
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    { cartId, discountCodes },
    { cache: "no-store", revalidate: false },
  );

  if (!data) {
    return null;
  }

  assertMutationSucceeded(data.cartDiscountCodesUpdate);
  return data.cartDiscountCodesUpdate.cart
    ? normalizeCart(data.cartDiscountCodesUpdate.cart as ShopifyCart)
    : null;
}

async function updateCartBuyerIdentity(
  cartId: string,
  buyerIdentity: Record<string, unknown>,
): Promise<ShopifyCart | null> {
  const data = await shopifyFetch<{
    cartBuyerIdentityUpdate: ShopifyMutationResult;
  }>(
    `
      mutation UpdateCartBuyerIdentity($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
        cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
          cart {
            ${CART_FRAGMENT}
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    { cartId, buyerIdentity },
    { cache: "no-store", revalidate: false },
  );

  if (!data) {
    return null;
  }

  assertMutationSucceeded(data.cartBuyerIdentityUpdate);
  return data.cartBuyerIdentityUpdate.cart
    ? normalizeCart(data.cartBuyerIdentityUpdate.cart as ShopifyCart)
    : null;
}

async function replaceCartDeliveryAddresses(
  cartId: string,
  addresses: Array<Record<string, unknown>>,
): Promise<ShopifyCart | null> {
  const data = await shopifyFetch<{
    cartDeliveryAddressesReplace: ShopifyMutationResult;
  }>(
    `
      mutation ReplaceCartDeliveryAddresses(
        $cartId: ID!
        $addresses: [CartSelectableAddressInput!]!
      ) {
        cartDeliveryAddressesReplace(cartId: $cartId, addresses: $addresses) {
          cart {
            ${CART_FRAGMENT}
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    { cartId, addresses },
    { cache: "no-store", revalidate: false },
  );

  if (!data) {
    return null;
  }

  assertMutationSucceeded(data.cartDeliveryAddressesReplace);
  return data.cartDeliveryAddressesReplace.cart
    ? normalizeCart(data.cartDeliveryAddressesReplace.cart as ShopifyCart)
    : null;
}

async function updateCartNote(cartId: string, note?: string): Promise<ShopifyCart | null> {
  const data = await shopifyFetch<{
    cartNoteUpdate: ShopifyMutationResult;
  }>(
    `
      mutation UpdateCartNote($cartId: ID!, $note: String) {
        cartNoteUpdate(cartId: $cartId, note: $note) {
          cart {
            ${CART_FRAGMENT}
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    { cartId, note },
    { cache: "no-store", revalidate: false },
  );

  if (!data) {
    return null;
  }

  assertMutationSucceeded(data.cartNoteUpdate);
  return data.cartNoteUpdate.cart ? normalizeCart(data.cartNoteUpdate.cart as ShopifyCart) : null;
}

export async function prepareCartForCheckout(
  cartId: string,
  input: ShopifyCheckoutInput,
): Promise<ShopifyCart | null> {
  if (!cartId) {
    return null;
  }

  const buyerIdentity = {
    email: input.email,
    phone: normalizePhoneForShopify(input.phone),
    countryCode: "IT",
    preferences: {
      delivery: {
        deliveryMethod: normalizeDeliveryMethod(input.deliveryMode),
      },
    },
  };

  let cart = await updateCartBuyerIdentity(cartId, buyerIdentity);

  if (
    input.deliveryMode === "shipping" &&
    input.address1 &&
    input.city &&
    input.postalCode
  ) {
    cart = await replaceCartDeliveryAddresses(cartId, [
      {
        selected: true,
        oneTimeUse: false,
        address: {
          deliveryAddress: {
            address1: input.address1,
            city: input.city,
            zip: input.postalCode,
            countryCode: "IT",
            firstName: input.firstName,
            lastName: input.lastName,
            phone: normalizePhoneForShopify(input.phone),
          },
        },
      },
    ]);
  }

  if (input.note?.trim()) {
    cart = await updateCartNote(cartId, input.note.trim());
  }

  if (cart) {
    return cart;
  }

  return getCart(cartId);
}
