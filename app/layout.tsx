import type { Metadata } from "next";
import { Libre_Baskerville, Josefin_Sans, IM_Fell_English } from "next/font/google";
import { CartProvider } from "@/components/cart/CartProvider";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { WhatsAppFloatingButton } from "@/components/WhatsAppFloatingButton";
import { WishlistDrawer } from "@/components/wishlist/WishlistDrawer";
import { WishlistProvider } from "@/components/wishlist/WishlistProvider";
import "./globals.css";

const libre = Libre_Baskerville({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-libre",
});

const josefin = Josefin_Sans({
  weight: ["200", "300", "400"],
  subsets: ["latin"],
  variable: "--font-josefin",
});

const imFell = IM_Fell_English({
  weight: ["400"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-im-fell",
});

export const metadata: Metadata = {
  title: "Sixteen Road — Civitanova Marche",
  description: "Curated vintage fashion for the modern era. Editorial aesthetic, premium quality.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className={`${libre.variable} ${josefin.variable} ${imFell.variable} font-josefin antialiased text-brand-dark-brown bg-brand-cream selection:bg-brand-tortora selection:text-white flex flex-col min-h-screen`}>
        <WishlistProvider>
          <CartProvider>
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
            <WhatsAppFloatingButton />
          </CartProvider>
          <WishlistDrawer />
        </WishlistProvider>
      </body>
    </html>
  );
}
