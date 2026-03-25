import { NextResponse } from "next/server";
import {
  NewsletterSignupSource,
  persistNewsletterSignup,
} from "@/lib/newsletter-subscriptions";

function getStringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeSource(value: string): NewsletterSignupSource {
  return value === "footer" ? "footer" : "popup";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const email = getStringValue(body.email);
    const source = normalizeSource(getStringValue(body.source));

    if (!email) {
      return NextResponse.json({ error: "L'email e obbligatoria." }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Inserisci un'email valida." }, { status: 400 });
    }

    const record = await persistNewsletterSignup({ email, source });

    return NextResponse.json({
      ok: true,
      record,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Iscrizione newsletter non registrata per un errore server.",
      },
      { status: 500 },
    );
  }
}
