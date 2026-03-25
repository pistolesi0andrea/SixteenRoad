"use client";

import type { ReactNode } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { ShopifyImage, ShopifyProduct, ShopifyProductVariant } from "@/types/shopify";

export function AddToCartButton({
  product,
  className,
  children,
  ariaLabel,
  variant,
  image,
  disabled = false,
}: {
  product: ShopifyProduct;
  className: string;
  children: ReactNode;
  ariaLabel?: string;
  variant?: ShopifyProductVariant | null;
  image?: ShopifyImage | null;
  disabled?: boolean;
}) {
  const { addItem } = useCart();

  return (
    <button
      type="button"
      onClick={() => {
        if (disabled) {
          return;
        }

        addItem(product, { variant, image });
      }}
      className={className}
      aria-label={ariaLabel}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
