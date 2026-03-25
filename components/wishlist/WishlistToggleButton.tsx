"use client";

import { useWishlist } from "@/components/wishlist/WishlistProvider";
import { ShopifyProduct } from "@/types/shopify";

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <path
        d="M12 20.2 4.55 12.8a4.9 4.9 0 0 1 0-6.9 4.8 4.8 0 0 1 6.8 0L12 6.56l.65-.66a4.8 4.8 0 0 1 6.8 0 4.9 4.9 0 0 1 0 6.9Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function WishlistToggleButton({
  product,
  className,
  activeClassName = "",
  inactiveClassName = "",
  showLabel = false,
  activeLabel = "Salvato",
  inactiveLabel = "Wishlist",
  ariaLabel,
}: {
  product: ShopifyProduct;
  className: string;
  activeClassName?: string;
  inactiveClassName?: string;
  showLabel?: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
  ariaLabel?: string;
}) {
  const { isWishlisted, toggleItem } = useWishlist();
  const active = isWishlisted(product.id);

  return (
    <button
      type="button"
      onClick={() => toggleItem(product)}
      aria-pressed={active}
      aria-label={ariaLabel ?? `${active ? "Rimuovi" : "Aggiungi"} ${product.title} dalla wishlist`}
      className={`${className} ${active ? activeClassName : inactiveClassName}`.trim()}
    >
      <HeartIcon filled={active} />
      {showLabel ? <span>{active ? activeLabel : inactiveLabel}</span> : null}
    </button>
  );
}
