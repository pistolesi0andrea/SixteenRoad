const WHATSAPP_NUMBER = "393485310887";
const WHATSAPP_MESSAGE =
  "Ciao, ti contatto dal sito Sixteen Road per avere informazioni sui prodotti.";

export function WhatsAppFloatingButton() {
  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contatta Sixteen Road su WhatsApp"
      className="fixed bottom-6 right-6 z-[470] flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_14px_30px_rgba(0,0,0,0.2)] transition-transform duration-200 hover:scale-105"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 32 32"
        className="h-8 w-8 fill-current"
      >
        <path d="M19.11 17.54c-.25-.12-1.48-.73-1.71-.81-.23-.08-.4-.12-.57.12-.17.25-.65.81-.8.98-.15.17-.3.19-.56.06-.25-.12-1.05-.39-2-1.24-.74-.66-1.24-1.47-1.38-1.72-.14-.25-.01-.39.11-.51.11-.11.25-.3.37-.44.12-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.57-1.37-.78-1.88-.21-.49-.42-.42-.57-.43h-.49c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.02 2.6.12.17 1.76 2.69 4.26 3.77.59.26 1.05.41 1.41.53.59.19 1.12.16 1.54.1.47-.07 1.48-.6 1.69-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.28Z" />
        <path d="M16.02 3.2c-7.05 0-12.79 5.71-12.79 12.73 0 2.24.59 4.43 1.7 6.36L3 29l6.92-1.81a12.84 12.84 0 0 0 6.1 1.55h.01c7.05 0 12.79-5.71 12.79-12.73 0-3.4-1.33-6.59-3.75-8.99A12.8 12.8 0 0 0 16.02 3.2Zm0 23.38h-.01a10.7 10.7 0 0 1-5.45-1.49l-.39-.23-4.1 1.07 1.09-4-.25-.41a10.56 10.56 0 0 1-1.62-5.58c0-5.88 4.82-10.66 10.74-10.66 2.87 0 5.56 1.11 7.58 3.12a10.57 10.57 0 0 1 3.15 7.54c0 5.88-4.82 10.65-10.74 10.65Z" />
      </svg>
    </a>
  );
}
