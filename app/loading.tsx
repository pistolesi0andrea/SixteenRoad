export default function Loading() {
  return (
    <div className="bg-brand-cream">
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-brand-border border-t-brand-dark-brown" />
        <div className="mt-6 text-[11px] uppercase tracking-[0.24em] text-brand-burnt">
          Sixteen Road
        </div>
        <p className="mt-3 max-w-md text-[15px] leading-[1.8] text-brand-dust sm:text-[16px]">
          Stiamo caricando la selezione. Su mobile la pagina resta visibile in modo piu stabile,
          senza schermate bianche improvvise.
        </p>
      </div>
    </div>
  );
}
