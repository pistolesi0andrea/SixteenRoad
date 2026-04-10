"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="bg-brand-cream">
      <div className="flex min-h-[60vh] items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl border border-brand-border bg-white px-7 py-8 sm:px-10 sm:py-10">
          <div className="text-[11px] uppercase tracking-[0.24em] text-brand-burnt">Errore pagina</div>
          <h1 className="mt-4 font-libre text-[34px] leading-[0.98] text-brand-dark-brown sm:text-[46px]">
            Qualcosa non si e caricato come doveva.
          </h1>
          <p className="mt-5 text-[15px] leading-[1.9] text-brand-dust sm:text-[16px]">
            Abbiamo evitato la schermata bianca completa e ti lasciamo due strade veloci per
            riprendere la navigazione.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={reset} className="btn-dark text-center">
              Riprova
            </button>
            <Link href="/" className="btn-outline text-center no-underline">
              Torna alla home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
