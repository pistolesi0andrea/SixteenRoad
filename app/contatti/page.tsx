import Link from "next/link";

const businessHours = [
  { day: "Lunedi", hours: "Chiuso" },
  { day: "Martedi", hours: "9:30 - 13:00 / 16:00   - 20:00" },
  { day: "Mercoledi", hours: "9:30 - 13:00 / 16:00 - 20:00" },
  { day: "Giovedi", hours: "9:30 - 13:00 / 16:00 - 20:00" },
  { day: "Venerdi", hours: "9:30 - 13:00 / 16:00 - 20:00" },
  { day: "Sabato", hours: "9:30 - 13:00 / 16:00 - 20:00" },
  { day: "Domenica", hours: "Chiuso la mattina / 16:30 - 20:00" },
];

export default function ContactPage() {
  return (
    <div className="bg-brand-cream">
      <section className="border-b border-brand-border bg-brand-parchment px-6 py-12 md:px-12 md:py-6">
        <div className="max-w-5xl">
          <div className="text-[10px] uppercase tracking-[0.28em] text-brand-burnt mb-4">
            Contatti
          </div>
          <h1 className="font-libre text-[52px] leading-[0.94] text-brand-dark-brown md:text-[84px]">
            Vieni a trovarci
            <br />
            <em className="italic text-brand-tobacco">in negozio.</em>
          </h1>
          <p className="mt-6 max-w-2xl text-[18px] leading-[1.9] tracking-[0.03em] text-brand-dust">
            Sixteen Road si trova a Civitanova Marche. Qui sotto trovi indirizzo, orari,
            telefono, email e una mappa integrata con il punto del negozio.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] border-b border-brand-border">
        <div className="border-b xl:border-b-0 xl:border-r border-brand-border bg-brand-cream px-6 py-10 md:px-12 md:py-12">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="border border-brand-border bg-white p-5">
              <div className="text-[18px] uppercase tracking-[0.22em] text-brand-burnt mb-3">
                Indirizzo
              </div>
              <div className="font-libre text-[28px] leading-[1.05] text-brand-dark-brown">
                Via Zara 16
              </div>
              <p className="mt-3 text-[20px] leading-[1.85] text-brand-dust">
                62012 Civitanova Marche (MC)
              </p>
            </div>

            <div className="border border-brand-border bg-white p-5">
              <div className="text-[20px] uppercase tracking-[0.22em] text-brand-burnt mb-3">
                Telefono
              </div>
              <a
                href="tel:3485310887"
                className="font-libre text-[28px] leading-[1.05] text-brand-dark-brown no-underline"
              >
                348 531 0887
              </a>
              <p className="mt-3 text-[20px] leading-[1.85] text-brand-dust">
                Chiamaci durante gli orari di apertura.
              </p>
            </div>

            <div className="border border-brand-border bg-white p-5">
              <div className="text-[20px] uppercase tracking-[0.22em] text-brand-burnt mb-3">
                Email
              </div>
              <a
                href="mailto:info@sixteenroad.com"
                className="font-libre text-[28px] leading-[1.05] text-brand-dark-brown no-underline break-all"
              >
                info@sixteenroad.com
              </a>
              <p className="mt-3 text-[20px] leading-[1.85] text-brand-dust">
                Per assistenza, ordini e informazioni sui capi.
              </p>
            </div>

            <div className="border border-brand-border bg-white p-5">
              <div className="text-[10px] uppercase tracking-[0.22em] text-brand-burnt mb-3">
                Raggiungici
              </div>
              <div className="font-libre text-[28px] leading-[1.05] text-brand-dark-brown">
                Mappa del negozio
              </div>
              <p className="mt-3 text-[15px] leading-[1.85] text-brand-dust">
                Trovi il punto gia posizionato su Via Zara 16, Civitanova Marche.
              </p>
            </div>
          </div>

          <div className="mt-8 border border-brand-border bg-white p-6">
            <div className="text-[10px] uppercase tracking-[0.24em] text-brand-burnt mb-4">
              Orari di apertura
            </div>
            <div className="space-y-3">
              {businessHours.map((row) => (
                <div
                  key={row.day}
                  className="flex items-center justify-between gap-4 border-b border-[rgba(61,36,16,0.08)] text-[14px] pb-3 last:border-b-0 last:pb-0"
                >
                  <div className="text-[14px] uppercase tracking-[0.12em] text-brand-dark-brown">
                    {row.day}
                  </div>
                  <div className="text-[15px] text-brand-dust text-right">{row.hours}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="tel:3485310887"
              className="btn-dark no-underline text-center text-[14px]"
            >
              Chiama ora
            </a>
            <a
              href="mailto:info@sixteenroad.com"
              className="border border-brand-border bg-white px-[30px] text-[14px] py-[14px] font-josefin text-[10px] font-light tracking-[0.24em] uppercase text-brand-dark-brown no-underline text-center transition-all duration-200 hover:border-brand-tobacco hover:text-brand-tobacco"
            >
              Scrivi una mail
            </a>
           
          </div>
        </div>

        <div className="bg-brand-cream p-0 min-h-[520px]">
          <iframe
            title="Mappa Sixteen Road"
            src="https://www.google.com/maps?hl=it&q=Sixteen+Road,+Via+Zara+16,+62012+Civitanova+Marche,+MC&z=18&ie=UTF8&iwloc=B&output=embed"
            className="h-full min-h-[520px] w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
    </div>
  );
}
