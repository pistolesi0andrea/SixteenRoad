"use client";

import Image from "next/image";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";

const NEWSLETTER_POPUP_DISMISSED_KEY = "sixteenroad-newsletter-popup-dismissed";

export function NewsletterPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleClose() {
    setIsOpen(false);
    window.localStorage.setItem(NEWSLETTER_POPUP_DISMISSED_KEY, "true");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    if (!email) {
      setErrorMessage("Inserisci un'email valida.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          source: "popup",
        }),
        cache: "no-store",
      });

      const payload = (await response.json()) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Iscrizione newsletter non riuscita.");
      }

      setIsSubscribed(true);
      window.localStorage.setItem(NEWSLETTER_POPUP_DISMISSED_KEY, "true");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Iscrizione newsletter non riuscita.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    if (window.localStorage.getItem(NEWSLETTER_POPUP_DISMISSED_KEY) === "true") {
      return;
    }

    const timer = window.setTimeout(() => {
      setIsOpen(true);
    }, 10000);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = "";
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-[rgba(33,20,12,0.42)] px-3 sm:px-4">
      <div className="relative w-full max-w-[980px] overflow-hidden border border-brand-border bg-brand-cream shadow-[0_24px_70px_rgba(20,12,7,0.28)]">
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center border border-brand-border bg-white text-[16px] text-brand-dark-brown transition-colors hover:bg-brand-parchment sm:right-4 sm:top-4 sm:h-10 sm:w-10 sm:text-[18px]"
          aria-label="Chiudi popup newsletter"
        >
          X
        </button>

        <div className="grid grid-cols-1 md:grid-cols-[0.95fr_1.05fr]">
          <div className="relative min-h-[220px] sm:min-h-[260px] md:min-h-[520px]">
            <Image
              src="/negozio.jpg"
              alt="Sixteen Road newsletter"
              fill
              className="object-cover brightness-[0.86]"
              sizes="(min-width: 768px) 45vw, 100vw"
            />
          </div>

          <div className="border-l-0 border-brand-border bg-brand-parchment px-5 py-6 sm:px-6 sm:py-8 md:border-l md:px-10 md:py-12">
            {!isSubscribed ? (
              <div className="max-w-[430px]">
                <div className="flex items-center gap-4">
                  <div className="relative h-11 w-11 overflow-hidden rounded-full border border-brand-border bg-brand-cream sm:h-12 sm:w-12">
                    <Image src="/logo.jpg" alt="Sixteen Road" fill className="object-cover" sizes="(min-width: 640px) 48px, 44px" />
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.24em] text-brand-burnt">
                    Newsletter
                  </div>
                </div>

                <h2 className="mt-6 font-libre text-[32px] leading-[0.98] text-brand-dark-brown sm:mt-8 sm:text-[42px] md:text-[56px]">
                  Iscriviti alla newsletter.
                </h2>

                <p className="mt-5 text-[13px] leading-[1.85] tracking-[0.03em] text-brand-dust sm:mt-6 sm:text-[14px] sm:leading-[1.95]">
                  Ti aggiorneremo su nuovi arrivi, selezioni stagionali e restock direttamente via
                  email.
                </p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                  <label className="block">
                    <span className="block text-[10px] uppercase tracking-[0.22em] text-brand-dust mb-2">
                      Email
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="nome@email.com"
                      className="w-full border border-brand-border bg-white px-4 py-4 text-[15px] text-brand-dark-brown outline-none"
                    />
                  </label>

                  <div className="flex flex-wrap gap-3">
                    <button type="submit" className="btn-dark px-8" disabled={isSubmitting}>
                      {isSubmitting ? "Invio..." : "Iscrivimi"}
                    </button>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="border border-brand-border bg-white px-8 py-[14px] text-[10px] uppercase tracking-[0.24em] text-brand-dark-brown"
                    >
                      Chiudi
                    </button>
                  </div>

                  {errorMessage ? (
                    <p className="text-[13px] leading-[1.7] text-brand-burnt">{errorMessage}</p>
                  ) : null}
                </form>
              </div>
            ) : (
              <div className="max-w-[430px]">
                <div className="flex items-center gap-4">
                  <div className="relative h-11 w-11 overflow-hidden rounded-full border border-brand-border bg-brand-cream sm:h-12 sm:w-12">
                    <Image src="/logo.jpg" alt="Sixteen Road" fill className="object-cover" sizes="(min-width: 640px) 48px, 44px" />
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.24em] text-brand-burnt">
                    Iscrizione completata
                  </div>
                </div>

                <h2 className="mt-6 font-libre text-[32px] leading-[0.98] text-brand-dark-brown sm:mt-8 sm:text-[42px] md:text-[56px]">
                  Iscrizione completata.
                </h2>

                <p className="mt-5 text-[13px] leading-[1.85] tracking-[0.03em] text-brand-dust sm:mt-6 sm:text-[14px] sm:leading-[1.95]">
                  Le prossime comunicazioni editoriali del brand arriveranno sulla mail che hai
                  inserito.
                </p>

                <button
                  type="button"
                  onClick={handleClose}
                  className="mt-8 btn-dark px-8"
                >
                  Continua
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
