"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { getProductColors } from "@/lib/catalog";
import {
  safeLocalStorageGet,
  safeLocalStorageRemove,
  safeLocalStorageSet,
} from "@/lib/browser-storage";
import { ShopifyProduct } from "@/types/shopify";
import { WishlistItem } from "@/types/wishlist";

const WISHLIST_STORAGE_KEY = "sixteenroad-wishlist";

interface WishlistContextValue {
  isOpen: boolean;
  items: WishlistItem[];
  itemCount: number;
  openWishlist: () => void;
  closeWishlist: () => void;
  isWishlisted: (productId: string) => boolean;
  toggleItem: (product: ShopifyProduct) => void;
  removeItem: (productId: string) => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

function mapProductToWishlistItem(product: ShopifyProduct): WishlistItem {
  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    vendor: product.vendor,
    productType: product.productType,
    color: getProductColors(product)[0] ?? null,
    availableForSale: product.availableForSale,
    featuredImage: product.featuredImage ?? product.images.edges[0]?.node ?? null,
    price: product.priceRange.minVariantPrice,
  };
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<WishlistItem[]>([]);
  const hasLoadedFromStorage = useRef(false);

  useEffect(() => {
    const storedWishlist = safeLocalStorageGet(WISHLIST_STORAGE_KEY);

    if (!storedWishlist) {
      hasLoadedFromStorage.current = true;
      return;
    }

    try {
      const parsedWishlist = JSON.parse(storedWishlist) as WishlistItem[];
      queueMicrotask(() => {
        hasLoadedFromStorage.current = true;
        setItems(parsedWishlist);
      });
    } catch {
      safeLocalStorageRemove(WISHLIST_STORAGE_KEY);
      hasLoadedFromStorage.current = true;
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedFromStorage.current) {
      return;
    }

    safeLocalStorageSet(WISHLIST_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  function openWishlist() {
    setIsOpen(true);
  }

  function closeWishlist() {
    setIsOpen(false);
  }

  function isWishlisted(productId: string) {
    return items.some((item) => item.id === productId);
  }

  function toggleItem(product: ShopifyProduct) {
    setItems((currentItems) => {
      const exists = currentItems.some((item) => item.id === product.id);

      if (exists) {
        return currentItems.filter((item) => item.id !== product.id);
      }

      return [mapProductToWishlistItem(product), ...currentItems];
    });
  }

  function removeItem(productId: string) {
    setItems((currentItems) => currentItems.filter((item) => item.id !== productId));
  }

  return (
    <WishlistContext.Provider
      value={{
        isOpen,
        items,
        itemCount: items.length,
        openWishlist,
        closeWishlist,
        isWishlisted,
        toggleItem,
        removeItem,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }

  return context;
}
