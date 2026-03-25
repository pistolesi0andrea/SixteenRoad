const shippingHighlights = [
  "Alla spedizione viene applicata una tariffa di 5 EUR.",
  "Tutti gli ordini effettuati entro le ore 13:00 vengono spediti lo stesso giorno.",
  "Gli ordini inviati oltre le ore 13:00 vengono spediti il giorno successivo.",
  "I tempi di consegna sono di circa 2/3 giorni lavorativi tramite corriere SDA.",
  "Una volta preso in carico l'ordine, riceverai il tracking number per seguirlo sul portale Poste Italiane.",
];

export default function ShippingPage() {
  return (
    <div className="bg-brand-cream">
      <section className="border-b border-brand-border bg-brand-parchment px-6 py-12 md:px-12 md:py-16">
        <div className="max-w-5xl">
          <div className="text-[20px] uppercase tracking-[0.28em] text-brand-burnt mb-4">
            Spedizioni
          </div>
          <h1 className="font-libre text-[50px] leading-[0.94] text-brand-dark-brown md:text-[82px]">
            Tempi, costi e
            <br />
            <em className="italic text-brand-tobacco">tracciamento.</em>
          </h1>
          <p className="mt-6 max-w-3xl text-[22px] leading-[1.95] tracking-[0.03em] text-brand-dust">
            Una panoramica chiara su costi di spedizione, tempistiche di evasione e consegna,
            oltre alle modalita di tracking dell&apos;ordine.
          </p>
        </div>
      </section>

      <section className="px-6 py-10 md:px-12 md:py-12">
        <div className="max-w-5xl grid grid-cols-1 gap-4">
          {shippingHighlights.map((item) => (
            <div
              key={item}
              className="flex cursor-pointer bg-white border border-brand-border list-none items-center justify-between gap-4 px-5 py-5 font-libre text-[24px] leading-[1.2] text-brand-dark-brown"
            >
              {item}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
