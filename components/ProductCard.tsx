import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { getPrimaryProductImage } from "@/lib/product-helpers";
import { WishlistToggleButton } from "@/components/wishlist/WishlistToggleButton";
import Image from "next/image";
import Link from "next/link";
import { ShopifyProduct } from "@/types/shopify";

function formatPrice(amount: string, currencyCode: string) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 2,
  }).format(Number(amount));
}

export function ProductCard({
  product,
  badge,
}: {
  product: ShopifyProduct;
  badge?: "NEW" | "LAST" | "ARCHIVE";
}) {
  const price = product.priceRange.minVariantPrice;
  const primaryImage = getPrimaryProductImage(product);
  const eyebrow = product.productType || "Archive";
  const isSoldOut = !product.availableForSale;

  return (
    <div className="border border-brand-border cursor-pointer relative transition-colors duration-200 bg-brand-cream hover:bg-brand-parchment group">
      <Link href={`/products/${product.handle}`} className="block">
        <div className="w-full aspect-[3/4] overflow-hidden relative bg-brand-parchment">
          {badge && (
            <div
              className={`absolute top-0 left-0 z-10 text-[8px] tracking-[0.2em] uppercase px-3 py-[5px] font-josefin text-brand-cream ${
                badge === "NEW"
                  ? "bg-brand-dark-brown"
                  : badge === "LAST"
                    ? "bg-brand-tobacco"
                    : "bg-brand-burnt"
              }`}
            >
              {badge}
            </div>
          )}
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.altText || product.title}
              fill
              className={`object-cover object-center block transition-transform duration-[650ms] ease-in-out group-hover:scale-[1.02] ${
                isSoldOut ? "opacity-[0.82]" : ""
              }`}
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full w-full bg-brand-parchment text-brand-dust">
              No Image
            </div>
          )}

          {isSoldOut ? (
            <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 border border-brand-dark-brown bg-[rgba(245,240,232,0.94)] px-5 py-3 text-[14px] uppercase tracking-[0.24em] text-brand-dark-brown sm:px-6 sm:text-[17px]">
              Sold out
            </div>
          ) : null}
        </div>
      </Link>
      <WishlistToggleButton
        product={product}
        ariaLabel={`Salva ${product.title} nella wishlist`}
        className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center border border-brand-border bg-[rgba(242,236,224,0.94)] text-brand-dark-brown transition-colors duration-200 sm:right-4 sm:top-4 sm:h-9 sm:w-9"
        activeClassName="bg-brand-dark-brown text-brand-cream"
        inactiveClassName="hover:bg-brand-dark-brown hover:text-brand-cream"
      />
      <div className="border-t border-brand-border p-4 pb-4 sm:px-5 sm:pb-5">
        <Link href={`/products/${product.handle}`} className="block no-underline">
          <h3 className="font-libre text-[17px] font-normal leading-[1.25] text-brand-dark-brown sm:text-[19px]">
            {product.title}
          </h3>
          <div className="text-[10px] tracking-[0.22em] uppercase text-brand-dust mt-[6px]">
            {eyebrow}
          </div>
        </Link>
        <div className="flex justify-between items-center mt-[14px]">
          <div className="text-[15px] text-brand-tobacco sm:text-[16px]">
            {formatPrice(price.amount, price.currencyCode)}
          </div>
          <AddToCartButton
            product={product}
            ariaLabel={`Aggiungi ${product.title} al carrello`}
            disabled={isSoldOut}
            className={`w-8 h-8 border-none text-[20px] flex items-center justify-center transition-colors duration-[180ms] ${
              isSoldOut
                ? "cursor-not-allowed bg-brand-dark-brown/55 text-brand-cream"
                : "cursor-pointer bg-brand-dark-brown text-brand-cream hover:bg-brand-burnt"
            }`}
          >
            +
          </AddToCartButton>
        </div>
      </div>
    </div>
  );
}
