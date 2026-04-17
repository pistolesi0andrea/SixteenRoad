import type { Metadata } from "next";
import { Libre_Baskerville, Josefin_Sans, IM_Fell_English } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { CartProvider } from "@/components/cart/CartProvider";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { WhatsAppFloatingButton } from "@/components/WhatsAppFloatingButton";
import { WishlistDrawer } from "@/components/wishlist/WishlistDrawer";
import { WishlistProvider } from "@/components/wishlist/WishlistProvider";
import "./globals.css";

const SITE_URL = "https://www.sixteenroad.com";
const DEFAULT_SHARE_IMAGE = "/negozio.jpg";

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
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Sixteen Road - Civitanova Marche",
    template: "%s | Sixteen Road",
  },
  description: "Curated vintage fashion for the modern era. Editorial aesthetic, premium quality.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Sixteen Road",
    title: "Sixteen Road - Civitanova Marche",
    description: "Curated vintage fashion for the modern era. Editorial aesthetic, premium quality.",
    locale: "it_IT",
    images: [
      {
        url: DEFAULT_SHARE_IMAGE,
        width: 1200,
        height: 630,
        alt: "Sixteen Road",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sixteen Road - Civitanova Marche",
    description: "Curated vintage fashion for the modern era. Editorial aesthetic, premium quality.",
    images: [DEFAULT_SHARE_IMAGE],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body
        className={`${libre.variable} ${josefin.variable} ${imFell.variable} font-josefin antialiased text-brand-dark-brown bg-brand-cream selection:bg-brand-tortora selection:text-white flex flex-col min-h-screen`}
      >
        <WishlistProvider>
          <CartProvider>
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
            <WhatsAppFloatingButton />
            <Analytics />
          </CartProvider>
          <WishlistDrawer />
        </WishlistProvider>
      </body>
    </html>
  );
}
