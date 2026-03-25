import { HeroSlideshow } from "@/components/HeroSlideshow";
import { ProductCard } from "@/components/ProductCard";
import { getProducts } from "@/lib/shopify";
import Image from "next/image";
import Link from "next/link";

export default async function Home() {
  const products = await getProducts();

  return (
    <div>
      <section className="grid min-h-[calc(100vh-74px)] grid-cols-1 border-b border-brand-border lg:min-h-[calc(100vh-116px)] lg:grid-cols-2">
        <div className="relative min-h-[54svh] overflow-hidden sm:min-h-[62svh] lg:min-h-0">
          <HeroSlideshow />
        </div>
        <div className="flex flex-col justify-between bg-brand-parchment px-6 pb-10 pt-10 sm:px-8 sm:pb-12 sm:pt-12 lg:border-l lg:border-brand-border lg:px-14 lg:pb-[52px] lg:pt-[68px]">
          <div>
            <div className="mb-4 text-[11px] uppercase tracking-[0.24em] text-brand-burnt sm:text-[12px] lg:mb-[18px] lg:text-[15px] lg:tracking-[0.3em]">
              Est. 2014
            </div>
            <h1 className="font-libre text-[40px] font-normal leading-[0.92] text-brand-dark-brown sm:text-[52px] md:text-[64px] lg:text-[72px]">
              Sixteen <br />
              <em className="italic text-brand-tobacco">Road.</em>
            </h1>
            <div className="my-6 h-[1px] w-9 bg-brand-tobacco lg:my-[30px]" />
            <p className="max-w-[320px] text-[16px] leading-[1.45] tracking-[0.03em] text-brand-dust sm:text-[17px] lg:max-w-[310px] lg:text-[18px] lg:leading-[1.2] lg:tracking-[0.05em]">
              Selezione curata di capi autentici, provenienti da tutto il mondo.
              
            </p>
            <div className="mt-8 flex sm:mt-10 lg:mt-11">
              <Link
                href="/collections/abbigliamento"
                className="btn-dark w-full max-w-[280px] text-center text-[13px] no-underline sm:w-auto sm:text-[14px] lg:text-[15px]"
              >
                Esplora Collezione
              </Link>
            </div>
          </div>
          <div className="mt-9 font-im-fell text-[20px] italic tracking-[0.03em] text-brand-sand sm:text-[22px] lg:mt-11 lg:text-[25px] lg:tracking-[0.04em]">
            Ogni pezzo è unico.
          </div>
        </div>
      </section>

      <div className="flex flex-nowrap overflow-hidden whitespace-nowrap border-b border-brand-border bg-brand-dark-brown py-[10px] sm:py-3">
        <div className="flex animate-tick shrink-0 min-w-full items-center">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="flex shrink-0 items-center text-[9px] font-semibold uppercase tracking-[0.2em] text-brand-sand sm:text-[10px] sm:tracking-[0.26em]"
            >
              
              <em className="text-brand-burnt not-italic">*</em>
              <span className="mx-5 sm:mx-8">IL SITO VIENE AGGIORNATO OGNI SETTIMANA</span>
              <em className="text-brand-burnt not-italic">*</em>
              <span className="mx-5 sm:mx-8">ABBIGLIAMENTO DI QUALITA&apos; SELEZIONATO</span>
              <em className="text-brand-burnt not-italic">*</em>
            </div>
          ))}
        </div>
        <div className="flex animate-tick shrink-0 min-w-full items-center">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="flex shrink-0 items-center text-[9px] font-semibold uppercase tracking-[0.2em] text-brand-sand sm:text-[10px] sm:tracking-[0.26em]"
            >
              <em className="text-brand-burnt not-italic">*</em>
              <span className="mx-5 sm:mx-8">IL SITO VIENE AGGIORNATO OGNI SETTIMANA</span>
              <em className="text-brand-burnt not-italic">*</em>
              <span className="mx-5 sm:mx-8">ABBIGLIAMENTO DI QUALITA&apos; SELEZIONATO</span>
              <em className="text-brand-burnt not-italic">*</em>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-baseline justify-between border-b border-brand-border px-5 pb-5 pt-7 sm:px-8 md:px-10 md:pb-6 md:pt-9 lg:px-12 lg:pt-10">
        <h2 className="flex items-baseline gap-3 font-libre text-[23px] font-normal sm:text-[26px] lg:text-[28px]">
          Latest Additions
          <span className="font-im-fell italic text-[14px] text-brand-burnt">01</span>
        </h2>
        <Link
          href="/collections/nuovi-arrivi"
          className="cursor-pointer border-b border-brand-tobacco pb-[1px] text-[9px] font-light uppercase tracking-[0.18em] text-brand-tobacco no-underline sm:tracking-[0.22em]"
        >
          View all
        </Link>
      </div>

      <section className="grid grid-cols-1 gap-4 px-5 py-6 sm:px-8 md:grid-cols-2 md:px-10 lg:grid-cols-3 lg:px-12 lg:py-7">
        {products.slice(0, 3).map((product, i) => (
          <ProductCard
            key={product.id}
            product={product}
            badge={i === 0 ? "NEW" : i === 1 ? "LAST" : undefined}
          />
        ))}
      </section>

      <section className="grid grid-cols-1 border-y border-brand-border lg:min-h-[560px] lg:grid-cols-2">
        <div className="relative min-h-[360px] overflow-hidden bg-brand-dark-brown sm:min-h-[420px] lg:min-h-[560px]">
          <Image
            src="/hero-4.webp"
            alt="Vintage military inspired editorial"
            fill
            className="object-cover block saturate-[0.45] contrast-[1.02] brightness-[0.82]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(61,36,16,0.12),rgba(61,36,16,0.54))]" />
          <div className="absolute bottom-4 left-4 rounded-full border border-[rgba(242,236,224,0.28)] bg-[rgba(61,36,16,0.28)] px-3 py-[10px] text-[9px] uppercase tracking-[0.18em] text-brand-cream backdrop-blur-sm sm:bottom-6 sm:left-6 sm:px-4 sm:py-3 sm:text-[11px] sm:tracking-[0.24em]">
            Seleziona curata di capi
          </div>
        </div>
        <div className="flex flex-col justify-center bg-brand-parchment px-6 py-10 sm:px-8 sm:py-12 lg:border-l lg:border-brand-border lg:px-[52px] lg:py-[68px]">
          <div className="mb-4 text-[10px] uppercase tracking-[0.24em] text-brand-burnt lg:mb-[18px] lg:tracking-[0.32em]">
            Sixteen Road
          </div>
          <h2 className="font-libre text-[38px] font-normal leading-[0.98] sm:text-[44px] lg:text-[52px] lg:leading-[1.02]">
            Dandy <br />
            <em className="italic text-brand-tobacco">Retro.</em>
          </h2>
          <blockquote className="mt-5 max-w-[520px] border-l-2 border-brand-tobacco pl-4 text-[15px] leading-[1.8] tracking-[0.02em] text-brand-dust sm:pl-5 sm:text-[16px] sm:leading-[1.95] lg:mt-[26px] lg:tracking-[0.03em]">
            Stiamo parlando di vestiti, stiamo parlando di una delle cose piu vicine
            all&apos;immagine di noi stessi, di come ci presentiamo al prossimo e di
            conseguenza dovremo essere il piu affine possibile alla nostra personalita, i
            vestiti dovrebbero essere sinceri, non dovrebbero mentire.
          </blockquote>
          <Link
            href="/collections/abbigliamento"
            className="mt-7 w-full max-w-[280px] cursor-pointer border border-brand-tobacco bg-transparent px-[30px] py-3 text-center font-josefin text-[11px] font-light uppercase tracking-[0.18em] text-brand-tobacco no-underline transition-all duration-200 hover:bg-brand-tobacco hover:text-brand-cream sm:w-auto sm:self-start sm:tracking-[0.22em] lg:mt-8"
          >
            Scopri la Capsule
          </Link>
        </div>
      </section>
    </div>
  );
}
