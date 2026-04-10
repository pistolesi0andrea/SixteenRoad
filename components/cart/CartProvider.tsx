"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { CartDrawer } from "@/components/cart/CartDrawer";
import {
  ShopifyAttribute,
  ShopifyCart,
  ShopifyCheckoutDeliveryMode,
  ShopifyImage,
  ShopifyProduct,
  ShopifyProductVariant,
} from "@/types/shopify";
import { CartLineItem } from "@/types/cart";
import {
  safeLocalStorageGet,
  safeLocalStorageRemove,
  safeLocalStorageSet,
} from "@/lib/browser-storage";

const CART_STORAGE_KEY = "sixteenroad-cart";
const SHOPIFY_CART_ID_STORAGE_KEY = "sixteenroad-shopify-cart-id";

type CartMode = "local" | "shopify";

interface CartCheckoutPayload {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  notes: string;
  deliveryMode: ShopifyCheckoutDeliveryMode;
}

interface CartContextValue {
  isOpen: boolean;
  items: CartLineItem[];
  itemCount: number;
  subtotal: number;
  discountCodes: ShopifyCart["discountCodes"];
  discountAmount: number;
  isReady: boolean;
  isSyncing: boolean;
  isShopifyReady: boolean;
  isUsingShopify: boolean;
  checkoutUrl: string | null;
  errorMessage: string | null;
  openCart: () => void;
  closeCart: () => void;
  clearError: () => void;
  addItem: (
    product: ShopifyProduct,
    options?: {
      variant?: ShopifyProductVariant | null;
      image?: ShopifyImage | null;
      attributes?: ShopifyAttribute[];
    },
  ) => Promise<void>;
  incrementItem: (itemId: string) => Promise<void>;
  decrementItem: (itemId: string) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  applyDiscountCode: (discountCode: string) => Promise<void>;
  removeDiscountCode: () => Promise<void>;
  beginCheckout: (
    payload: CartCheckoutPayload,
  ) => Promise<{ mode: "shopify"; checkoutUrl: string } | { mode: "preview" }>;
}

const CartContext = createContext<CartContextValue | null>(null);

function getOptionValue(product: ShopifyProduct, optionNames: string[]) {
  const normalizedOptionNames = optionNames.map((name) => name.trim().toLowerCase());
  const option = product.options.find(({ name }) =>
    normalizedOptionNames.includes(name.trim().toLowerCase()),
  );

  return option?.values[0] ?? null;
}

function getVariantOptionValue(
  variant: ShopifyProductVariant | null | undefined,
  optionNames: string[],
) {
  const normalizedOptionNames = optionNames.map((name) => name.trim().toLowerCase());
  const option = variant?.selectedOptions.find(({ name }) =>
    normalizedOptionNames.includes(name.trim().toLowerCase()),
  );

  return option?.value ?? null;
}

function mapProductToCartLine(
  product: ShopifyProduct,
  options?: {
    variant?: ShopifyProductVariant | null;
    image?: ShopifyImage | null;
    attributes?: ShopifyAttribute[];
  },
): CartLineItem {
  const variant =
    options?.variant ??
    product.variants.edges.find(({ node }) => node.availableForSale)?.node ??
    product.variants.edges[0]?.node;
  const attributes =
    options?.attributes?.filter((attribute) => attribute.key && attribute.value.trim()) ?? [];
  const localLineId =
    attributes.length > 0
      ? `${variant?.id ?? product.id}::${JSON.stringify(attributes)}`
      : variant?.id ?? product.id;

  return {
    id: localLineId,
    merchandiseId: variant?.id ?? product.id,
    productId: product.id,
    handle: product.handle,
    title: product.title,
    vendor: product.vendor,
    productType: product.productType,
    color:
      getVariantOptionValue(variant, ["color", "colore"]) ??
      getOptionValue(product, ["color", "colore"]),
    size:
      getVariantOptionValue(variant, ["size", "taglia"]) ??
      getOptionValue(product, ["size", "taglia"]),
    featuredImage: options?.image ?? product.featuredImage,
    price: variant?.price ?? product.priceRange.minVariantPrice,
    quantity: 1,
    pickupLocations: variant?.storeAvailability ?? [],
    attributes,
  };
}

function normalizeStoredCartItem(item: Partial<CartLineItem>): CartLineItem {
  return {
    id: item.id ?? "",
    merchandiseId: item.merchandiseId ?? item.id ?? "",
    productId: item.productId ?? "",
    handle: item.handle ?? "",
    title: item.title ?? "",
    vendor: item.vendor ?? "",
    productType: item.productType ?? "",
    color: item.color ?? null,
    size: item.size ?? null,
    featuredImage: item.featuredImage ?? null,
    price: item.price ?? { amount: "0.00", currencyCode: "EUR" },
    quantity: item.quantity ?? 1,
    pickupLocations: item.pickupLocations ?? [],
    attributes: item.attributes ?? [],
  };
}

function mergeCartInputs(items: CartLineItem[]) {
  const groupedLines = new Map<string, { merchandiseId: string; quantity: number; attributes?: ShopifyAttribute[] }>();

  for (const item of items) {
    if (!item.merchandiseId) {
      continue;
    }

    const attributes = item.attributes.filter((attribute) => attribute.key && attribute.value.trim());
    const key = `${item.merchandiseId}::${JSON.stringify(attributes)}`;
    const existingLine = groupedLines.get(key);

    if (existingLine) {
      existingLine.quantity += item.quantity;
      continue;
    }

    groupedLines.set(key, {
      merchandiseId: item.merchandiseId,
      quantity: item.quantity,
      ...(attributes.length > 0 ? { attributes } : {}),
    });
  }

  return Array.from(groupedLines.values());
}

function applyLocalAdd(currentItems: CartLineItem[], nextItem: CartLineItem) {
  const existingItem = currentItems.find((item) => item.id === nextItem.id);

  if (!existingItem) {
    return [...currentItems, nextItem];
  }

  return currentItems.map((item) =>
    item.id === nextItem.id ? { ...item, quantity: item.quantity + 1 } : item,
  );
}

async function requestJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  const payload = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new Error(payload.error ?? "Richiesta commerce non riuscita.");
  }

  return payload;
}

function getCartDiscountAmount(cart: ShopifyCart) {
  return cart.discountAllocations.reduce(
    (total, discountAllocation) => total + Number(discountAllocation.discountedAmount.amount),
    0,
  );
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<CartLineItem[]>([]);
  const [mode, setMode] = useState<CartMode>("local");
  const [isReady, setIsReady] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isShopifyReady, setIsShopifyReady] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [cartId, setCartId] = useState<string | null>(null);
  const [discountCodes, setDiscountCodes] = useState<ShopifyCart["discountCodes"]>([]);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const itemsRef = useRef<CartLineItem[]>([]);
  const modeRef = useRef<CartMode>("local");
  const cartIdRef = useRef<string | null>(null);
  const isShopifyReadyRef = useRef(false);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    cartIdRef.current = cartId;
  }, [cartId]);

  useEffect(() => {
    isShopifyReadyRef.current = isShopifyReady;
  }, [isShopifyReady]);

  useEffect(() => {
    let isActive = true;
    const storedLocalCart = safeLocalStorageGet(CART_STORAGE_KEY);
    const storedShopifyCartId = safeLocalStorageGet(SHOPIFY_CART_ID_STORAGE_KEY);

    if (storedLocalCart) {
      try {
        const parsedCart = JSON.parse(storedLocalCart) as Partial<CartLineItem>[];

        if (isActive) {
          setItems(parsedCart.map((item) => normalizeStoredCartItem(item)));
        }
      } catch {
        safeLocalStorageRemove(CART_STORAGE_KEY);
      }
    }

    async function hydrateCart() {
      try {
        const availability = await requestJson<{
          enabled: boolean;
        }>("/api/shopify/cart");

        if (!isActive) {
          return;
        }

        setIsShopifyReady(availability.enabled);

        if (!availability.enabled || !storedShopifyCartId) {
          setIsReady(true);
          return;
        }

        const hydratedCart = await requestJson<{
          cart: ShopifyCart | null;
        }>(`/api/shopify/cart?id=${encodeURIComponent(storedShopifyCartId)}`);

        if (!isActive) {
          return;
        }

        if (hydratedCart.cart) {
          setMode("shopify");
          setCartId(hydratedCart.cart.id);
          setCheckoutUrl(hydratedCart.cart.checkoutUrl);
          setDiscountCodes(hydratedCart.cart.discountCodes);
          setDiscountAmount(getCartDiscountAmount(hydratedCart.cart));
          setItems(hydratedCart.cart.lines.map((line) => normalizeStoredCartItem(line)));
          safeLocalStorageRemove(CART_STORAGE_KEY);
        } else {
          safeLocalStorageRemove(SHOPIFY_CART_ID_STORAGE_KEY);
        }
      } catch {
        if (storedShopifyCartId) {
          safeLocalStorageRemove(SHOPIFY_CART_ID_STORAGE_KEY);
        }
      } finally {
        if (isActive) {
          setIsReady(true);
        }
      }
    }

    hydrateCart();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (mode === "shopify") {
      safeLocalStorageRemove(CART_STORAGE_KEY);
      if (cartId) {
        safeLocalStorageSet(SHOPIFY_CART_ID_STORAGE_KEY, cartId);
      }
      return;
    }

    safeLocalStorageSet(CART_STORAGE_KEY, JSON.stringify(items));
    safeLocalStorageRemove(SHOPIFY_CART_ID_STORAGE_KEY);
  }, [cartId, isReady, items, mode]);

  const itemCount = items.reduce((count, item) => count + item.quantity, 0);
  const subtotal = items.reduce(
    (total, item) => total + Number(item.price.amount) * item.quantity,
    0,
  );

  function clearError() {
    setErrorMessage(null);
  }

  function openCart() {
    setIsOpen(true);
  }

  function closeCart() {
    setIsOpen(false);
  }

  function applyShopifyCart(cart: ShopifyCart) {
    setMode("shopify");
    setCartId(cart.id);
    setCheckoutUrl(cart.checkoutUrl);
    setDiscountCodes(cart.discountCodes);
    setDiscountAmount(getCartDiscountAmount(cart));
    setItems(cart.lines.map((line) => normalizeStoredCartItem(line)));
  }

  function resetLocalDiscountState() {
    setDiscountCodes([]);
    setDiscountAmount(0);
  }

  async function addItem(
    product: ShopifyProduct,
    options?: {
      variant?: ShopifyProductVariant | null;
      image?: ShopifyImage | null;
      attributes?: ShopifyAttribute[];
    },
  ) {
    const nextItem = mapProductToCartLine(product, options);
    openCart();
    clearError();

    if (!isShopifyReadyRef.current) {
      resetLocalDiscountState();
      setItems((currentItems) => applyLocalAdd(currentItems, nextItem));
      return;
    }

    setIsSyncing(true);

    try {
      if (modeRef.current === "shopify" && cartIdRef.current) {
        const payload = await requestJson<{ cart: ShopifyCart | null }>(
          "/api/shopify/cart/lines",
          {
            method: "POST",
            body: JSON.stringify({
              cartId: cartIdRef.current,
              lines: [
                {
                  merchandiseId: nextItem.merchandiseId,
                  quantity: 1,
                  ...(nextItem.attributes.length > 0 ? { attributes: nextItem.attributes } : {}),
                },
              ],
            }),
          },
        );

        if (payload.cart) {
          applyShopifyCart(payload.cart);
        }

        return;
      }

      const payload = await requestJson<{ cart: ShopifyCart | null }>("/api/shopify/cart", {
        method: "POST",
        body: JSON.stringify({
          lines: mergeCartInputs([...itemsRef.current, nextItem]),
        }),
      });

      if (payload.cart) {
        applyShopifyCart(payload.cart);
        return;
      }

      throw new Error("Shopify non ha restituito un carrello valido.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Sincronizzazione del carrello Shopify non riuscita.",
      );

      if (modeRef.current === "local") {
        setItems((currentItems) => applyLocalAdd(currentItems, nextItem));
      }
    } finally {
      setIsSyncing(false);
    }
  }

  async function incrementItem(itemId: string) {
    clearError();

    if (modeRef.current !== "shopify" || !cartIdRef.current) {
      resetLocalDiscountState();
      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item,
        ),
      );
      return;
    }

    const item = itemsRef.current.find((entry) => entry.id === itemId);

    if (!item) {
      return;
    }

    setIsSyncing(true);

    try {
      const payload = await requestJson<{ cart: ShopifyCart | null }>(
        "/api/shopify/cart/lines",
        {
          method: "PATCH",
          body: JSON.stringify({
            cartId: cartIdRef.current,
            lines: [{ id: item.id, quantity: item.quantity + 1 }],
          }),
        },
      );

      if (payload.cart) {
        applyShopifyCart(payload.cart);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Quantita non aggiornata su Shopify.",
      );
    } finally {
      setIsSyncing(false);
    }
  }

  async function decrementItem(itemId: string) {
    clearError();

    if (modeRef.current !== "shopify" || !cartIdRef.current) {
      resetLocalDiscountState();
      setItems((currentItems) =>
        currentItems.flatMap((item) => {
          if (item.id !== itemId) {
            return [item];
          }

          if (item.quantity <= 1) {
            return [];
          }

          return [{ ...item, quantity: item.quantity - 1 }];
        }),
      );
      return;
    }

    const item = itemsRef.current.find((entry) => entry.id === itemId);

    if (!item) {
      return;
    }

    setIsSyncing(true);

    try {
      const endpoint = "/api/shopify/cart/lines";
      const payload =
        item.quantity <= 1
          ? await requestJson<{ cart: ShopifyCart | null }>(endpoint, {
              method: "DELETE",
              body: JSON.stringify({
                cartId: cartIdRef.current,
                lineIds: [item.id],
              }),
            })
          : await requestJson<{ cart: ShopifyCart | null }>(endpoint, {
              method: "PATCH",
              body: JSON.stringify({
                cartId: cartIdRef.current,
                lines: [{ id: item.id, quantity: item.quantity - 1 }],
              }),
            });

      if (payload.cart) {
        applyShopifyCart(payload.cart);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Quantita non aggiornata su Shopify.",
      );
    } finally {
      setIsSyncing(false);
    }
  }

  async function removeItem(itemId: string) {
    clearError();

    if (modeRef.current !== "shopify" || !cartIdRef.current) {
      resetLocalDiscountState();
      setItems((currentItems) => currentItems.filter((item) => item.id !== itemId));
      return;
    }

    setIsSyncing(true);

    try {
      const payload = await requestJson<{ cart: ShopifyCart | null }>(
        "/api/shopify/cart/lines",
        {
          method: "DELETE",
          body: JSON.stringify({
            cartId: cartIdRef.current,
            lineIds: [itemId],
          }),
        },
      );

      if (payload.cart) {
        applyShopifyCart(payload.cart);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Rimozione articolo non riuscita su Shopify.",
      );
    } finally {
      setIsSyncing(false);
    }
  }

  async function applyDiscountCode(discountCode: string) {
    const nextDiscountCode = discountCode.trim();
    clearError();

    if (!nextDiscountCode) {
      setErrorMessage("Inserisci un codice sconto valido.");
      return;
    }

    if (!isShopifyReadyRef.current) {
      setErrorMessage("Il codice sconto è disponibile solo con il carrello Shopify attivo.");
      return;
    }

    if (itemsRef.current.length === 0) {
      setErrorMessage("Aggiungi almeno un articolo al carrello prima di applicare lo sconto.");
      return;
    }

    setIsSyncing(true);

    try {
      let nextCartId = cartIdRef.current;

      if (modeRef.current !== "shopify" || !nextCartId) {
        const createdCartPayload = await requestJson<{ cart: ShopifyCart | null }>(
          "/api/shopify/cart",
          {
            method: "POST",
            body: JSON.stringify({
              lines: mergeCartInputs(itemsRef.current),
            }),
          },
        );

        if (!createdCartPayload.cart) {
          throw new Error("Shopify non ha restituito un carrello valido.");
        }

        applyShopifyCart(createdCartPayload.cart);
        nextCartId = createdCartPayload.cart.id;
      }

      const payload = await requestJson<{ cart: ShopifyCart | null }>(
        "/api/shopify/cart/discounts",
        {
          method: "POST",
          body: JSON.stringify({
            cartId: nextCartId,
            discountCode: nextDiscountCode,
          }),
        },
      );

      if (!payload.cart) {
        throw new Error("Shopify non ha restituito un carrello valido.");
      }

      applyShopifyCart(payload.cart);

      const appliedDiscountCode = payload.cart.discountCodes.find(
        (cartDiscountCode) =>
          cartDiscountCode.code.trim().toLowerCase() === nextDiscountCode.toLowerCase(),
      );

      if (!appliedDiscountCode?.applicable) {
        setErrorMessage("Il codice sconto non è applicabile al carrello corrente.");
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Applicazione del codice sconto non riuscita.",
      );
    } finally {
      setIsSyncing(false);
    }
  }

  async function removeDiscountCode() {
    clearError();

    if (modeRef.current !== "shopify" || !cartIdRef.current) {
      resetLocalDiscountState();
      return;
    }

    setIsSyncing(true);

    try {
      const payload = await requestJson<{ cart: ShopifyCart | null }>(
        "/api/shopify/cart/discounts",
        {
          method: "DELETE",
          body: JSON.stringify({
            cartId: cartIdRef.current,
          }),
        },
      );

      if (payload.cart) {
        applyShopifyCart(payload.cart);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Rimozione del codice sconto non riuscita.",
      );
    } finally {
      setIsSyncing(false);
    }
  }

  async function beginCheckout(payload: CartCheckoutPayload) {
    clearError();

    if (!isShopifyReadyRef.current || modeRef.current !== "shopify" || !cartIdRef.current) {
      return { mode: "preview" } as const;
    }

    setIsSyncing(true);

    try {
      const response = await requestJson<{
        cart: ShopifyCart | null;
        checkoutUrl: string | null;
      }>("/api/shopify/cart/checkout", {
        method: "POST",
        body: JSON.stringify({
          cartId: cartIdRef.current,
          input: {
            email: payload.email,
            firstName: payload.firstName,
            lastName: payload.lastName,
            phone: payload.phone,
            address1: payload.address,
            city: payload.city,
            postalCode: payload.postalCode,
            note: payload.notes,
            deliveryMode: payload.deliveryMode,
          },
        }),
      });

      if (response.cart) {
        applyShopifyCart(response.cart);
      }

      if (response.checkoutUrl) {
        return { mode: "shopify", checkoutUrl: response.checkoutUrl } as const;
      }

      throw new Error("Shopify non ha restituito un checkoutUrl valido.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Preparazione checkout Shopify non riuscita.",
      );
      throw error;
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <CartContext.Provider
      value={{
        isOpen,
        items,
        itemCount,
        subtotal,
        discountCodes,
        discountAmount,
        isReady,
        isSyncing,
        isShopifyReady,
        isUsingShopify: mode === "shopify",
        checkoutUrl,
        errorMessage,
        openCart,
        closeCart,
        clearError,
        addItem,
        incrementItem,
        decrementItem,
        removeItem,
        applyDiscountCode,
        removeDiscountCode,
        beginCheckout,
      }}
    >
      {children}
      <CartDrawer />
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}
