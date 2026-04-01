"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import { useWishlist } from "@/components/wishlist/WishlistProvider";
import { useEffect, useState } from "react";

const navigationLinks = [
  { href: "/collections/nuovi-arrivi", label: "Nuovi Arrivi" },
  { href: "/collections/abbigliamento", label: "Abbigliamento" },
  { href: "/collections/abbigliamento?category=Sneakers", label: "Sneakers" },
  { href: "/collections/saldi", label: "Saldi" },
  { href: "/contatti", label: "Contatti" },
  { href: "/buoni-regalo", label: "Buoni Regalo" },
];

const catalogCategoryLinks = [
  { href: "/collections/abbigliamento", label: "Tutto" },
  { href: "/collections/abbigliamento?category=Pantalone", label: "Pantalone" },
  { href: "/collections/abbigliamento?category=Jeans", label: "Jeans" },
  { href: "/collections/abbigliamento?category=T-Shirt", label: "T-Shirt" },
  { href: "/collections/abbigliamento?category=Camicia", label: "Camicia" },
  { href: "/collections/abbigliamento?category=Maglioni", label: "Maglioni" },
  { href: "/collections/abbigliamento?category=Capispalla", label: "Capispalla" },
  { href: "/collections/abbigliamento?category=Accessori", label: "Accessori" },
  { href: "/collections/abbigliamento?category=Bermuda", label: "Bermuda" },
];

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="m6 6 12 12" />
      <path d="M18 6 6 18" />
    </svg>
  );
}

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="m12 20.3-.8-.72C6.2 15.1 3 12.2 3 8.6A4.6 4.6 0 0 1 7.7 4a5 5 0 0 1 4.3 2.35A5 5 0 0 1 16.3 4 4.6 4.6 0 0 1 21 8.6c0 3.6-3.2 6.5-8.2 10.98l-.8.72Z" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6.5 8.5h11l-1 11h-9l-1-11Z" />
      <path d="M9 8.5V7a3 3 0 0 1 6 0v1.5" />
    </svg>
  );
}

export function Header() {
  const { itemCount, openCart } = useCart();
  const { itemCount: wishlistCount, openWishlist } = useWishlist();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCatalogMenuOpen, setIsCatalogMenuOpen] = useState(false);

  function closeMobileMenu() {
    setIsMobileMenuOpen(false);
    setIsCatalogMenuOpen(false);
  }

  useEffect(() => {
    if (!isMobileMenuOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <nav className="sticky top-0 z-[300] border-b border-brand-border bg-brand-cream">
        <div className="flex h-[74px] items-center justify-between px-4 sm:px-6 lg:hidden">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-border bg-white text-brand-dark-brown"
            aria-label="Apri menu"
          >
            <MenuIcon />
          </button>

          <Link
            href="/"
            className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-brand-border bg-brand-parchment sm:h-16 sm:w-16"
          >
            <Image
              src="/logo.jpg"
              alt="Sixteen Road"
              fill
              className="object-cover transition-opacity duration-300"
              priority
            />
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openWishlist}
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-brand-border bg-white text-brand-dark-brown"
              aria-label="Apri wishlist"
            >
              <HeartIcon />
              <span className="absolute -right-1 -top-1 flex min-w-[18px] items-center justify-center rounded-full border border-brand-border bg-brand-parchment px-1 text-[9px] text-brand-dark-brown">
                {wishlistCount}
              </span>
            </button>
            <button
              type="button"
              onClick={openCart}
              className="relative flex h-11 w-11 items-center justify-center rounded-full bg-brand-dark-brown text-brand-cream"
              aria-label="Apri carrello"
            >
              <BagIcon />
              <span className="absolute -right-1 -top-1 flex min-w-[18px] items-center justify-center rounded-full bg-brand-burnt px-1 text-[9px] text-brand-cream">
                {itemCount}
              </span>
            </button>
          </div>
        </div>

        <div className="hidden h-[92px] grid-cols-[1fr_auto_1fr] items-center px-10 lg:grid">
          <div className="flex gap-7">
            {navigationLinks.slice(0, 4).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="border-b border-transparent pb-[2px] text-[13px] font-medium uppercase tracking-[0.18em] text-brand-dust transition-all duration-200 hover:border-brand-tobacco hover:text-brand-dark-brown"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/buoni-regalo"
              className="border-b border-transparent pb-[2px] text-[12px] font-medium uppercase tracking-[0.18em] text-brand-dust transition-all duration-200 hover:border-brand-tobacco hover:text-brand-dark-brown"
            >
              Buoni Regalo
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6">
            <Link
              href="/"
              className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-brand-border bg-brand-parchment group"
            >
              <Image
                src="/logo.jpg"
                alt="Sixteen Road"
                fill
                className="object-cover transition-opacity duration-300"
                priority
              />
            </Link>
          </div>

          <div className="flex items-center justify-end gap-10">
            <button
              type="button"
              onClick={openWishlist}
              className="flex items-center gap-2 border border-brand-border bg-white px-6 py-[10px] font-josefin text-[11px] font-light uppercase tracking-[0.2em] text-brand-dark-brown transition-colors duration-200 hover:bg-brand-parchment"
            >
              Wishlist
              <span className="flex h-[20px] min-w-[20px] items-center justify-center rounded-full border border-brand-border bg-brand-parchment px-[5px] text-[10px] text-brand-dark-brown">
                {wishlistCount}
              </span>
            </button>
            <button
              type="button"
              onClick={openCart}
              className="flex items-center gap-2 bg-brand-dark-brown px-6 py-[10px] font-josefin text-[11px] font-light uppercase tracking-[0.2em] text-brand-cream transition-colors duration-200 hover:bg-brand-tobacco"
            >
              Carrello
              <span className="flex h-[20px] min-w-[20px] items-center justify-center rounded-full bg-brand-burnt px-[5px] text-[10px] text-brand-cream">
                {itemCount}
              </span>
            </button>
          </div>
        </div>
      </nav>

      <div
        className={`fixed inset-0 z-[420] transition-opacity duration-300 lg:hidden ${
          isMobileMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <button
          type="button"
          className="absolute inset-0 bg-[rgba(24,13,7,0.42)]"
          aria-label="Chiudi menu"
          onClick={closeMobileMenu}
        />
        <aside
          className={`absolute left-0 top-0 flex h-full w-[86%] max-w-[340px] flex-col border-r border-brand-border bg-brand-cream px-5 py-5 shadow-[18px_0_54px_rgba(20,12,7,0.16)] transition-transform duration-300 ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between">
            <Link
              href="/"
              onClick={closeMobileMenu}
              className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-brand-border bg-brand-parchment"
            >
              <Image
                src="/logo.jpg"
                alt="Sixteen Road"
                fill
                className="object-cover"
                sizes="56px"
              />
            </Link>
            <button
              type="button"
              onClick={closeMobileMenu}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-border bg-white text-brand-dark-brown"
              aria-label="Chiudi menu"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="mt-8 text-[10px] uppercase tracking-[0.26em] text-brand-dust">
            Navigazione
          </div>

          <div className="mt-4 flex flex-col border-t border-brand-border">
            {navigationLinks.map((link) => {
              if (link.label !== "Abbigliamento") {
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMobileMenu}
                    className="border-b border-brand-border py-4 font-libre text-[21px] leading-[1.05] text-brand-dark-brown no-underline sm:text-[23px]"
                  >
                    {link.label}
                  </Link>
                );
              }

              return (
                <div key={link.href} className="border-b border-brand-border">
                  <button
                    type="button"
                    onClick={() => setIsCatalogMenuOpen((current) => !current)}
                    className="flex w-full items-center justify-between py-4 text-left font-libre text-[21px] leading-[1.05] text-brand-dark-brown sm:text-[23px]"
                  >
                    <span>{link.label}</span>
                    <ChevronIcon isOpen={isCatalogMenuOpen} />
                  </button>

                  {isCatalogMenuOpen ? (
                    <div className="grid grid-cols-1 gap-2 border-t border-[rgba(61,36,16,0.1)] pb-4 pl-1 pt-3">
                      {catalogCategoryLinks.map((categoryLink) => (
                        <Link
                          key={categoryLink.href}
                          href={categoryLink.href}
                          onClick={closeMobileMenu}
                          className="text-[12px] uppercase tracking-[0.16em] text-brand-dust no-underline transition-colors hover:text-brand-dark-brown"
                        >
                          {categoryLink.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="mt-auto grid grid-cols-2 gap-3 pt-6">
            <button
              type="button"
              onClick={() => {
                closeMobileMenu();
                openWishlist();
              }}
              className="flex min-h-[56px] items-center justify-center gap-2 border border-brand-border bg-white px-4 text-[11px] uppercase tracking-[0.18em] text-brand-dark-brown"
            >
              Wishlist
              <span className="rounded-full border border-brand-border bg-brand-parchment px-2 py-[3px] text-[10px]">
                {wishlistCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                closeMobileMenu();
                openCart();
              }}
              className="flex min-h-[56px] items-center justify-center gap-2 bg-brand-dark-brown px-4 text-[11px] uppercase tracking-[0.18em] text-brand-cream"
            >
              Carrello
              <span className="rounded-full bg-brand-burnt px-2 py-[3px] text-[10px]">
                {itemCount}
              </span>
            </button>
          </div>
        </aside>
      </div>
    </>
  );
}
