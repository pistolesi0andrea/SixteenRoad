import Link from "next/link";

const storeHighlights = [
  {
    icon: "01.",
    title: "Spedizione Veloce",
    desc: "Ordini entro le 13:00 spediti in giornata.",
    href: "/spedizioni",
  },
  {
    icon: "02.",
    title: "Reso Facile",
    desc: "30 giorni per richiedere reso o cambio.",
    href: "/resi",
  },
  {
    icon: "03.",
    title: "Pagamenti Sicuri",
    desc: "Carte, PayPal, Scalapay.",
    href: "/faq",
  },
  {
    icon: "04.",
    title: "Assistenza",
    desc: "info@sixteenroad.com",
    href: "/contatti",
  },
];

const socialLinks = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/sixteen_road?igshid=MzRlODBiNWFlZA%3D%3D",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8">
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
        <circle cx="12" cy="12" r="4.2" />
        <circle cx="17.4" cy="6.6" r="0.9" className="fill-current stroke-none" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/SixteenRoad?_rdr",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-current">
        <path d="M13.5 21v-7.44h2.5l.38-2.9H13.5V8.81c0-.84.23-1.42 1.43-1.42H16.5V4.8c-.27-.04-1.18-.11-2.24-.11-2.22 0-3.74 1.35-3.74 3.84v2.13H8v2.9h2.52V21h2.98Z" />
      </svg>
    ),
  },
  {
    label: "Email",
    href: "mailto:info@sixteenroad.com",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8">
        <rect x="3.5" y="5.5" width="17" height="13" rx="1.5" />
        <path d="m4.5 7 7.5 6 7.5-6" />
      </svg>
    ),
  },
];

export function Footer() {
  return (
    <>
      <div className="bg-brand-dark-brown grid grid-cols-1 md:grid-cols-4 border-t border-brand-border">
        {storeHighlights.map((col, i) => (
          <Link
            key={i}
            href={col.href}
            className="flex flex-col gap-3 border-b border-[#c0a87a33] p-6 last:border-b-0 no-underline transition-colors hover:bg-[#2f1c0d] sm:p-8 md:border-b-0 md:border-r md:p-10 md:last:border-r-0"
          >
            <div className="font-im-fell italic text-[14px] mb-1 text-brand-burnt">{col.icon}</div>
            <div className="font-libre text-[22px] text-brand-cream font-normal">{col.title}</div>
            <div className="text-[16px] tracking-[0.05em] text-brand-cream leading-[1.75]">
              {col.desc}
            </div>
          </Link>
        ))}
      </div>

      <footer className="bg-brand-parchment border-t border-brand-border grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="border-b border-brand-border p-6 sm:p-8 md:min-h-[320px] md:border-b-0 md:border-r md:p-11">
          <div className="font-libre text-[38px] tracking-tight italic mb-5 sm:text-[42px]">Sixteen Road</div>
          <p className="text-[16px] leading-[1.9] text-brand-dust max-w-[320px] sm:text-[17px]">
            Curated vintage fashion for the modern era. Editorial aesthetic, premium quality.
          </p>
          <div className="mt-7 flex items-center gap-3">
            {socialLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target={item.href.startsWith("mailto:") ? undefined : "_blank"}
                rel={item.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                aria-label={item.label}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-border bg-white text-brand-dark-brown transition-colors duration-200 hover:bg-brand-dark-brown hover:text-brand-cream"
              >
                {item.icon}
              </a>
            ))}
          </div>
        </div>

        <div className="border-b border-brand-border p-6 sm:p-8 md:min-h-[320px] md:border-b-0 md:border-r md:p-11">
          <h4 className="mb-5 text-[15px] font-semibold uppercase tracking-[0.24em] text-brand-tobacco">
            Support
          </h4>
          <ul className="space-y-4 flex flex-col">
            <li>
              <Link
                href="/spedizioni"
                className="text-[17px] text-brand-dust no-underline tracking-[0.04em] transition-colors hover:text-brand-dark-brown sm:text-[18px]"
              >
                Shipping & Returns
              </Link>
            </li>
            <li>
              <Link
                href="/faq"
                className="text-[17px] text-brand-dust no-underline tracking-[0.04em] transition-colors hover:text-brand-dark-brown sm:text-[18px]"
              >
                Size Guide
              </Link>
            </li>
            <li>
              <Link
                href="/contatti"
                className="text-[17px] text-brand-dust no-underline tracking-[0.04em] transition-colors hover:text-brand-dark-brown sm:text-[18px]"
              >
                Contact Us
              </Link>
            </li>
          </ul>
        </div>

        <div className="p-6 sm:p-8 md:min-h-[320px] md:p-11">
          <h4 className="mb-5 text-[15px] font-semibold uppercase tracking-[0.24em] text-brand-tobacco">
            Legal
          </h4>
          <ul className="space-y-4 flex flex-col">
            <li>
              <Link
                href="/resi"
                className="text-[17px] text-brand-dust no-underline tracking-[0.04em] transition-colors hover:text-brand-dark-brown sm:text-[18px]"
              >
                Terms of Service
              </Link>
            </li>
            <li>
              <Link
                href="/faq"
                className="text-[17px] text-brand-dust no-underline tracking-[0.04em] transition-colors hover:text-brand-dark-brown sm:text-[18px]"
              >
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>
      </footer>

      <div className="bg-brand-dark-brown flex flex-col gap-3 border-t border-brand-border px-6 py-[18px] sm:px-8 md:flex-row md:items-center md:justify-between md:px-10">
        <div className="text-[11px] tracking-[0.16em] uppercase text-[#7a6856]">
          &copy; {new Date().getFullYear()} SixteenRoad. All rights reserved.
        </div>
        <div className="flex gap-6">
          <a
            href="https://www.instagram.com/sixteen_road?igshid=MzRlODBiNWFlZA%3D%3D"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] tracking-[0.16em] uppercase text-[#7a6856] no-underline hover:text-brand-sand"
          >
            Instagram
          </a>
          <a
            href="https://www.facebook.com/SixteenRoad?_rdr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] tracking-[0.16em] uppercase text-[#7a6856] no-underline hover:text-brand-sand"
          >
            Facebook
          </a>
        </div>
      </div>
    </>
  );
}
