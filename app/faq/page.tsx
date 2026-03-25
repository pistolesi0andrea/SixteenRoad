const faqItems = [
  {
    question: "1. Qual e la politica di reso del negozio?",
    answer:
      "Accettiamo resi entro 30 giorni dall'acquisto, a patto che gli articoli siano in condizioni nuove, con tutte le etichette e confezioni originali intatte. Per i resi online, consulta la nostra politica di reso per le istruzioni dettagliate.",
  },
  {
    question: "2. Come posso conoscere la mia taglia giusta?",
    answer:
      "Abbiamo una guida alle taglie disponibile sul sito. Puoi anche visitare il negozio, dove i nostri addetti saranno lieti di aiutarti a trovare la taglia perfetta.",
  },
  {
    question: "3. Posso cambiare o annullare un ordine online?",
    answer:
      "Gli ordini online possono essere modificati o annullati entro 24 ore dall'acquisto. Contatta il nostro servizio clienti il prima possibile per assistenza.",
  },
  {
    question: "4. Offrite spedizioni internazionali?",
    answer:
      "Si, spediamo in molte destinazioni internazionali. Consulta le opzioni di spedizione sul sito oppure contatta il servizio clienti per maggiori dettagli.",
  },
  {
    question: "5. Cosa succede se l'articolo che voglio e esaurito?",
    answer:
      "Se un articolo e esaurito, puoi lasciare la tua email sul sito per ricevere una notifica quando tornera disponibile. Alcuni articoli potrebbero essere stagionali e non essere piu riassortiti.",
  },
  {
    question: "6. Avete promozioni o sconti speciali?",
    answer:
      "Si, offriamo regolarmente promozioni e sconti speciali. Iscriviti alla newsletter e segui i nostri canali social per restare aggiornato.",
  },
  {
    question: "7. Posso ritirare gli articoli online in negozio?",
    answer:
      "Si, offriamo il servizio di ritiro in negozio per gli ordini online. Seleziona l'opzione dedicata durante il checkout e vieni a ritirare il tuo ordine quando riceverai la notifica di disponibilita.",
  },
  {
    question: "8. Posso utilizzare piu codici sconto per lo stesso ordine?",
    answer:
      "No, e possibile utilizzare un solo codice sconto per ordine, salvo indicazioni diverse specificate nella promozione.",
  },
  {
    question: "9. Offrite carta regalo?",
    answer:
      "Si, abbiamo gift card disponibili per l'acquisto in negozio e online. Le carte regalo possono essere utilizzate per acquisti futuri sia in store sia sul sito.",
  },
  {
    question: "10. Come posso contattare il servizio clienti?",
    answer:
      "Puoi contattarci tramite telefono, email o dalla pagina Contatti del sito. Trovi tutti i recapiti nella sezione dedicata.",
  },
];

export default function FaqPage() {
  return (
    <div className="bg-brand-cream">
      <section className="border-b border-brand-border bg-brand-parchment px-6 py-12 md:px-12 md:py-16">
        <div className="max-w-5xl">
          <div className="text-[20px] uppercase tracking-[0.28em] text-brand-burnt mb-4">FAQ</div>
          <h1 className="font-libre text-[50px] leading-[0.94] text-brand-dark-brown md:text-[82px]">
            Domande frequenti.
          </h1>
          <p className="mt-6 max-w-3xl text-[22px] leading-[1.95] tracking-[0.03em] text-brand-dust">
            Tutte le informazioni piu richieste su ordini, taglie, sconti, gift card,
            disponibilita e assistenza.
          </p>
        </div>
      </section>

      <section className="px-6 py-10 md:px-12 md:py-12">
        <div className="max-w-5xl space-y-4">
          {faqItems.map((item) => (
            <details
              key={item.question}
              className="group border border-brand-border bg-white open:bg-brand-parchment"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 font-libre text-[24px] leading-[1.2] text-brand-dark-brown">
                <span>{item.question}</span>
                <span className="text-[18px] text-brand-tobacco transition-transform duration-200 group-open:rotate-45">
                  +
                </span>
              </summary>
              <div className="border-t border-brand-border px-5 py-5 text-[16px] leading-[1.95] text-brand-dust">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
