const returnHighlights = [
  "Il consumatore ha diritto di restituire il prodotto entro 30 giorni dalla data dell'ordine.",
  "Ai fini della scadenza del termine, la merce si intende restituita quando viene consegnata allo spedizioniere.",
  "Gli articoli devono essere integri, con etichette, imballi originali e sigillo di autenticita.",
  "I capi non devono essere stati indossati, lavati, alterati o presentare segni di utilizzo.",
  "Le spese di reso sono gratuite.",
  "Il cliente puo scegliere tra cambio con prodotto di pari valore oppure buono acquisto.",
  "Non sono previsti rimborsi in denaro.",
  "Articoli in saldo e articoli di intimo non possono essere restituiti o cambiati.",
];

export default function ReturnsPage() {
  return (
    <div className="bg-brand-cream">
      <section className="border-b border-brand-border bg-brand-parchment px-6 py-12 md:px-12 md:py-16">
        <div className="max-w-5xl">
          <div className="text-[20px] uppercase tracking-[0.28em] text-brand-burnt mb-4">
            Resi e cambi
          </div>
          <h1 className="font-libre text-[50px] leading-[0.94] text-brand-dark-brown md:text-[82px]">
            30 giorni
            <br />
            <em className="italic text-brand-tobacco">per il reso.</em>
          </h1>
          <p className="mt-3 max-w-3xl text-[22px] leading-[1.95] tracking-[0.03em] text-brand-dust">
            Politica completa per resi e cambi, con condizioni di accettazione, eccezioni e
            procedura operativa.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] border-b border-brand-border">
        <div className="border-b xl:border-b-0 xl:border-r border-brand-border px-6 py-10 md:px-12 md:py-12">
          <div className="max-w-3xl space-y-4">
            {returnHighlights.map((item) => (
              <div
                key={item}
                className="flex cursor-pointer bg-white border border-brand-border list-none items-center justify-between gap-4 px-5 py-5 font-libre text-[24px] leading-[1.2] text-brand-dark-brown"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-brand-cream px-6 py-10 md:px-12 md:py-12">
          <div className="max-w-3xl">
            <div className="text-[20px] uppercase tracking-[0.24em] text-brand-burnt mb-4">
              Come effettuare un reso
            </div>
            <p className="text-[20px] leading-[1.95] text-brand-dust">
              La richiesta di reso puo essere effettuata via email a{" "}
              <a
                href="mailto:maicolciferri89@gmail.com"
                className="text-brand-dark-brown no-underline border-b border-brand-dark-brown"
              >
                maicolciferri89@gmail.com
              </a>{" "}
              oppure tramite la sezione Contatti del sito, specificando il numero d&apos;ordine e
              gli articoli che desideri restituire o cambiare.
            </p>
            <p className="mt-6 text-[20px] leading-[1.95] text-brand-dust">
              Successivamente il customer service inviera l&apos;etichetta pre-compilata da
              applicare al pacco e un link per prenotare il ritiro a domicilio con un semplice
              click.
            </p>
            <p className="mt-6 text-[20px] leading-[1.95] text-brand-dust">
              Una volta ricevuta la merce, entro 4 giorni lavorativi verra confermato il cambio
              oppure l&apos;emissione del buono acquisto.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
