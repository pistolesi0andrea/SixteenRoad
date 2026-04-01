"use client";

import type { ReactNode } from "react";
import { Suspense, createContext, useContext, useEffect, useMemo, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  AnalyticsEventName,
  AnalyticsPageType,
  ShopifySalesChannel,
  getClientBrowserParameters,
  sendShopifyAnalytics,
  useShopifyCookies,
} from "@shopify/hydrogen-react";
import type { ShopifyAnalyticsConfig } from "@/lib/shopify";
import type { ShopifyProduct, ShopifyProductVariant } from "@/types/shopify";

interface AnalyticsProductInput {
  productGid: string;
  variantGid?: string;
  name: string;
  variantName?: string;
  brand: string;
  category?: string;
  price: string;
  quantity?: number;
}

interface TrackShopifyAnalyticsInput {
  eventName: string;
  pageType?: string;
  resourceId?: string;
  collectionHandle?: string;
  collectionId?: string;
  searchString?: string;
  cartId?: string;
  canonicalUrl?: string;
  products?: AnalyticsProductInput[];
  totalValue?: number;
}

interface ShopifyAnalyticsContextValue {
  isReady: boolean;
  trackEvent: (input: TrackShopifyAnalyticsInput) => void;
}

const ShopifyAnalyticsContext = createContext<ShopifyAnalyticsContextValue | null>(null);

function getCookieDomain(hostname: string) {
  if (!hostname || hostname === "localhost" || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return "";
  }

  return hostname.replace(/^www\./, "");
}

function getPageType(pathname: string) {
  if (pathname === "/") {
    return AnalyticsPageType.home;
  }

  if (pathname.startsWith("/products/")) {
    return AnalyticsPageType.product;
  }

  if (pathname.startsWith("/collections/")) {
    return AnalyticsPageType.collection;
  }

  if (pathname.startsWith("/checkout")) {
    return AnalyticsPageType.cart;
  }

  return AnalyticsPageType.page;
}

function normalizeVariantTitle(variant?: ShopifyProductVariant | null) {
  if (!variant?.title || variant.title.toLowerCase() === "default title") {
    return undefined;
  }

  return variant.title;
}

export function createAnalyticsProduct(
  product: ShopifyProduct,
  variant?: ShopifyProductVariant | null,
  quantity = 1,
): AnalyticsProductInput {
  const effectiveVariant =
    variant ??
    product.variants.edges.find(({ node }) => node.availableForSale)?.node ??
    product.variants.edges[0]?.node ??
    null;

  return {
    productGid: product.id,
    variantGid: effectiveVariant?.id,
    name: product.title,
    variantName: normalizeVariantTitle(effectiveVariant),
    brand: product.vendor,
    category: product.productType || undefined,
    price: effectiveVariant?.price.amount ?? product.priceRange.minVariantPrice.amount,
    quantity,
  };
}

export function ShopifyAnalyticsTracker({
  config,
  children,
}: {
  config: ShopifyAnalyticsConfig | null;
  children: ReactNode;
}) {
  const cookieDomain = useMemo(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return getCookieDomain(window.location.hostname);
  }, []);

  const cookiesReady = useShopifyCookies({
    hasUserConsent: true,
    domain: cookieDomain,
  });

  const contextValue = useMemo<ShopifyAnalyticsContextValue>(
    () => ({
      isReady: Boolean(config && cookiesReady),
      trackEvent: (input: TrackShopifyAnalyticsInput) => {
        if (!config || !cookiesReady || typeof window === "undefined") {
          return;
        }

        const browser = getClientBrowserParameters();

        void sendShopifyAnalytics(
          {
            eventName: input.eventName,
            payload: {
              ...browser,
              acceptedLanguage: config.acceptedLanguage as never,
              analyticsAllowed: true,
              canonicalUrl: input.canonicalUrl ?? browser.url ?? window.location.href,
              currency: config.currency as never,
              hasUserConsent: true,
              marketingAllowed: true,
              pageType: input.pageType ?? getPageType(browser.path),
              resourceId: input.resourceId,
              collectionHandle: input.collectionHandle,
              collectionId: input.collectionId,
              searchString: input.searchString,
              cartId: input.cartId,
              products: input.products,
              totalValue: input.totalValue,
              saleOfDataAllowed: true,
              shopId: config.shopId,
              shopifySalesChannel: ShopifySalesChannel.headless,
              ...(config.storefrontId
                ? {
                    hydrogenSubchannelId: config.storefrontId,
                    storefrontId: config.storefrontId,
                  }
                : {}),
            },
          } as never,
          window.location.hostname,
        ).catch(() => {
          // Ignore analytics transport failures so storefront UX is never blocked.
        });
      },
    }),
    [config, cookiesReady],
  );

  return (
    <ShopifyAnalyticsContext.Provider value={contextValue}>
      {children}
      <Suspense fallback={null}>
        <ShopifyAnalyticsPageTracker />
      </Suspense>
    </ShopifyAnalyticsContext.Provider>
  );
}

function ShopifyAnalyticsPageTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedPathRef = useRef<string>("");
  const { isReady, trackEvent } = useShopifyAnalytics();

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const query = searchParams.toString();
    const routeKey = `${pathname}${query ? `?${query}` : ""}`;

    if (routeKey === lastTrackedPathRef.current) {
      return;
    }

    lastTrackedPathRef.current = routeKey;

    trackEvent({
      eventName: AnalyticsEventName.PAGE_VIEW,
      pageType: getPageType(pathname),
    });
  }, [isReady, pathname, searchParams, trackEvent]);

  return null;
}

export function ShopifyAnalyticsView(props: TrackShopifyAnalyticsInput) {
  const { isReady, trackEvent } = useShopifyAnalytics();
  const lastSignatureRef = useRef<string>("");
  const signature = JSON.stringify(props);

  useEffect(() => {
    if (!isReady || signature === lastSignatureRef.current) {
      return;
    }

    lastSignatureRef.current = signature;
    trackEvent(props);
  }, [isReady, props, signature, trackEvent]);

  return null;
}

export function useShopifyAnalytics() {
  const context = useContext(ShopifyAnalyticsContext);

  if (!context) {
    throw new Error("useShopifyAnalytics must be used within ShopifyAnalyticsTracker");
  }

  return context;
}
